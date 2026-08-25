import { act, render, screen } from '@testing-library/react'
import { StrictMode, useState } from 'react'
import { useLoaderData, useNavigate, type NavigateFunction } from 'react-router-dom'

// Deliberately NOT mocking react-router-dom here: this file exercises the real
// RouterProvider, whose rendered location comes from a `useState(router.state)`
// seeded once from the first router it ever received. That is the mechanism
// behind #1746, so a mock would test nothing.

let capturedNavigate: NavigateFunction

const Home = () => {
  capturedNavigate = useNavigate()
  return <div>HOME</div>
}

vi.mock('./routes/home', () => ({ useHomeRoute: () => ({ path: '/', element: <Home /> }) }))
vi.mock('./routes/root', () => ({ useRootRoutes: () => ({ path: '/admin', element: <div>ADMIN</div> }) }))
vi.mock('./routes/auth', () => ({
  useAuthRoutes: () => ({ path: '/account' }),
  useCreateOrganizationRoutes: () => ({ path: '/account/create-organization' }),
}))
vi.mock('./routes/dashboard', () => ({
  useDashboardRoutes: () => ({
    path: '/dashboard/:id',
    element: <Loaded />,
    // A route whose initial navigation is still in flight when effects first run —
    // the shape of every real loader route (/admin/process/:id, /processes/:id, ...).
    loader: async () => {
      await new Promise((resolve) => setTimeout(resolve, 10))
      return 'LOADED'
    },
  }),
}))

const Loaded = () => <div>{useLoaderData() as string}</div>
vi.mock('./routes/integrators', () => ({
  useIntegratorsRoutes: () => ({ path: '/integrators' }),
  useIntegratorsAuthRoutes: () => ({ path: '/integrators/signin' }),
}))

let rerenderProvider: (value: number) => void

const Harness = ({ basename }: { basename: string }) => {
  const [, setTick] = useState(0)
  rerenderProvider = setTick
  const { RoutesProvider } = RoutesModule
  return <RoutesProvider basename={basename} />
}

// Imported lazily so the route mocks above are applied first.
let RoutesModule: typeof import('./Router')

describe('RoutesProvider router stability', () => {
  beforeEach(async () => {
    window.history.replaceState(null, '', '/')
    RoutesModule = await import('./Router')
  })

  it('navigates the page, not just the URL, after the provider tree re-renders (#1746)', async () => {
    render(<Harness basename='/' />)
    expect(screen.getByText('HOME')).toBeTruthy()

    // The shape that breaks in #1746: something awaited re-renders the provider
    // tree, and only then does the already-captured `navigate` run.
    const navigate = capturedNavigate
    await act(async () => {
      rerenderProvider(1)
    })
    await act(async () => {
      navigate('/admin')
    })

    expect(window.location.pathname).toBe('/admin')
    // Recreating the router leaves this rendering HOME while the URL says /admin.
    expect(screen.getByText('ADMIN')).toBeTruthy()
  })

  // vike-react wraps every page in StrictMode, which runs effects mount → cleanup → mount
  // on the same fiber. A cleanup that disposes the router kills the in-flight initial
  // navigation (dispose() aborts the pending navigation controller) while useMemo hands
  // the second mount the very same router — so it never initializes and RouterProvider
  // renders nothing at all. Only loader routes are affected: the rest finish initializing
  // before effects run.
  it('still renders a loader route when effects are double-invoked (StrictMode)', async () => {
    window.history.replaceState(null, '', '/dashboard/abc')

    render(
      <StrictMode>
        <Harness basename='/' />
      </StrictMode>
    )

    expect(await screen.findByText('LOADED')).toBeTruthy()
  })
})

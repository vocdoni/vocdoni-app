import { render } from '@testing-library/react'

const dispose = vi.fn()
let created = 0
const createBrowserRouter = vi.fn(() => ({ id: `router-${++created}`, dispose }))

vi.mock('react-router-dom', () => ({
  createBrowserRouter,
  RouterProvider: ({ router }: { router: { id: string } }) => <div data-testid='router-provider'>{router.id}</div>,
}))

vi.mock('./routes/auth', () => ({
  useAuthRoutes: () => ({ path: '/account' }),
  useCreateOrganizationRoutes: () => ({ path: '/account/create-organization' }),
}))

vi.mock('./routes/dashboard', () => ({
  useDashboardRoutes: () => ({ path: '/admin' }),
}))

vi.mock('./routes/home', () => ({
  useHomeRoute: () => ({ path: '/' }),
}))

vi.mock('./routes/root', () => ({
  useRootRoutes: () => ({ path: '/' }),
}))

vi.mock('./routes/integrators', () => ({
  useIntegratorsRoutes: () => ({ path: '/integrators' }),
  useIntegratorsAuthRoutes: () => ({ path: '/integrators/signin' }),
}))

describe('RoutesProvider', () => {
  beforeEach(() => {
    createBrowserRouter.mockClear()
    dispose.mockClear()
    created = 0
  })

  it('passes the provided basename to the browser router', async () => {
    const { RoutesProvider } = await import('./Router')

    render(<RoutesProvider basename='/en' />)

    expect(createBrowserRouter).toHaveBeenCalledWith(expect.any(Array), {
      basename: '/en',
    })
  })

  // Recreating the router per render is what made navigation update the URL but not the
  // page (#1746): RouterProvider keeps the first router's state and only ever listens to
  // the one it is subscribed to.
  it('creates the router once across re-renders', async () => {
    const { RoutesProvider } = await import('./Router')

    const { rerender } = render(<RoutesProvider basename='/en' />)
    rerender(<RoutesProvider basename='/en' />)
    rerender(<RoutesProvider basename='/en' />)

    expect(createBrowserRouter).toHaveBeenCalledTimes(1)
  })

  it('recreates and disposes the router when the basename changes', async () => {
    const { RoutesProvider } = await import('./Router')

    const { rerender } = render(<RoutesProvider basename='/en' />)
    expect(dispose).not.toHaveBeenCalled()

    rerender(<RoutesProvider basename='/es' />)

    expect(createBrowserRouter).toHaveBeenCalledTimes(2)
    expect(createBrowserRouter).toHaveBeenLastCalledWith(expect.any(Array), { basename: '/es' })
    // The superseded router owns popstate/pagehide listeners only dispose() releases.
    expect(dispose).toHaveBeenCalledTimes(1)
  })

  it('disposes the router on unmount', async () => {
    const { RoutesProvider } = await import('./Router')

    const { unmount } = render(<RoutesProvider basename='/en' />)
    unmount()

    expect(dispose).toHaveBeenCalledTimes(1)
  })
})

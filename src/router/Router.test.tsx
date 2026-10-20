import { render } from '@testing-library/react'

const dispose = vi.fn()
let created = 0
const createBrowserRouter = vi.fn(() => ({ id: `router-${++created}`, dispose }))

vi.mock('react-router', () => ({
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

    expect(createBrowserRouter).toHaveBeenCalledWith(expect.any(Array), expect.objectContaining({ basename: '/en' }))
  })

  it('recreates and disposes the router when the basename changes', async () => {
    const { RoutesProvider } = await import('./Router')

    const { rerender } = render(<RoutesProvider basename='/en' />)
    expect(dispose).not.toHaveBeenCalled()

    rerender(<RoutesProvider basename='/es' />)

    expect(createBrowserRouter).toHaveBeenCalledTimes(2)
    expect(createBrowserRouter).toHaveBeenLastCalledWith(
      expect.any(Array),
      expect.objectContaining({ basename: '/es' })
    )
    // The superseded router owns popstate/pagehide listeners only dispose() releases.
    expect(dispose).toHaveBeenCalledTimes(1)
  })
})

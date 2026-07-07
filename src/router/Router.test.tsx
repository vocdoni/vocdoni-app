import { render } from '@testing-library/react'

const createBrowserRouter = vi.fn(() => ({ id: 'router' }))

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
  })

  it('passes the provided basename to the browser router', async () => {
    const { RoutesProvider } = await import('./Router')

    render(<RoutesProvider basename='/en' />)

    expect(createBrowserRouter).toHaveBeenCalledWith(expect.any(Array), {
      basename: '/en',
    })
  })
})

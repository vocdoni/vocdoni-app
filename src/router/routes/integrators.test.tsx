import { Fragment } from 'react'
import { render, renderHook, waitFor } from '@testing-library/react'
import {
  createMemoryRouter,
  matchRoutes,
  RouterProvider,
  type LoaderFunction,
  type LoaderFunctionArgs,
  type RouteObject,
} from 'react-router'
import { Routes } from '.'
import { mockUseClient } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'

const walletAccess = vi.hoisted(() => ({ current: { canView: true, canTopUp: true } }))

vi.mock('~queries/wallet', () => ({
  useWalletAccess: () => walletAccess.current,
}))

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    ensureQueryData: vi.fn(),
  }),
}))

vi.mock('../SuspenseLoader', () => ({
  SuspenseLoader: ({ children }: { children: React.ReactNode }) => children ?? Fragment,
  Loading: () => null,
}))

describe('integrators routes', () => {
  beforeEach(() => {
    setReactProvidersMock({
      useClient: () => mockUseClient({}),
    })
  })

  it('registers the integrators route hook', async () => {
    const { useIntegratorsRoutes } = await import('./integrators')

    const { result } = renderHook(() => useIntegratorsRoutes())

    expect(result.current).toBeDefined()
    expect(result.current.children).toBeDefined()
    expect(Array.isArray(result.current.children)).toBe(true)
  })

  it('has the correct route structure for integrators app', async () => {
    const { useIntegratorsRoutes } = await import('./integrators')

    const { result } = renderHook(() => useIntegratorsRoutes())

    // Check that the route has an element (AccountProtectedRoute)
    expect(result.current.element).toBeDefined()

    // Check children - should have one main child with OrganizationTypeGuard
    const children = result.current.children ?? []
    expect(children.length).toBeGreaterThan(0)

    const guardChild = children[0]
    expect(guardChild).toBeDefined()

    // The guard should have children with LayoutIntegrators
    const layoutChildren = guardChild.children ?? []
    expect(layoutChildren.length).toBeGreaterThan(0)

    const layoutRoute = layoutChildren.find((c: any) => c.element !== undefined && !c.path)
    expect(layoutRoute).toBeDefined()

    // The layout should have the integrators base route as a child
    const pageChildren = layoutRoute?.children ?? []
    const integratorPage = pageChildren.find((c: any) => c.path === Routes.integrators.base)
    expect(integratorPage).toBeDefined()
  })

  it('models the integrators index route correctly', () => {
    const matches = matchRoutes([{ path: Routes.integrators.base }], '/integrators')

    expect(matches).toBeDefined()
    expect(matches?.[0]?.route.path).toBe(Routes.integrators.base)
  })
})

describe('integrators auth routes', () => {
  beforeEach(() => {
    setReactProvidersMock({
      useClient: () => mockUseClient({}),
    })
  })

  it('exposes single-column sign in and sign up routes', async () => {
    const { useIntegratorsAuthRoutes } = await import('./integrators')

    const { result } = renderHook(() => useIntegratorsAuthRoutes())

    // NonLoggedRoute wrapper -> LayoutIntegratorsAuth -> signin/signup pages
    expect(result.current.element).toBeDefined()
    const layoutRoute = (result.current.children ?? [])[0]
    expect(layoutRoute).toBeDefined()

    const pages = layoutRoute?.children ?? []
    const paths = pages.map((c: any) => c.path)
    expect(paths).toContain(Routes.integrators.signIn)
    expect(paths).toContain(Routes.integrators.signUp)
  })

  it('exposes the password recovery and reset routes within the integrators flow', async () => {
    const { useIntegratorsAuthRoutes } = await import('./integrators')

    const { result } = renderHook(() => useIntegratorsAuthRoutes())

    const layoutRoute = (result.current.children ?? [])[0]
    const pages = layoutRoute?.children ?? []
    const paths = pages.map((c: any) => c.path)
    expect(paths).toContain(Routes.integrators.recovery)
    expect(paths).toContain(Routes.integrators.passwordReset)
  })
})

const findRoute = (routes: RouteObject[] | undefined, path: string): RouteObject | undefined => {
  for (const route of routes ?? []) {
    if (route.path === path) return route
    const found = findRoute(route.children, path)
    if (found) return found
  }
}

describe('integrator configuration routes', () => {
  beforeEach(() => {
    walletAccess.current = { canView: true, canTopUp: true }
    setReactProvidersMock({
      useClient: () => mockUseClient({}),
    })
  })

  const configurationChildren = async () => {
    const { useIntegratorsRoutes } = await import('./integrators')
    const { result } = renderHook(() => useIntegratorsRoutes())
    return findRoute([result.current], Routes.integrators.configuration.base)?.children ?? []
  }

  it.each([
    ['admins and managers', true, Routes.integrators.configuration.billing],
    ['other members', false, Routes.integrators.configuration.support],
  ])('opens the configuration index on billing for %s, and support otherwise', async (_, canView, target) => {
    walletAccess.current = { canView, canTopUp: canView }
    const index = (await configurationChildren()).find((route) => route.index)!
    const router = createMemoryRouter(
      [
        {
          path: Routes.integrators.configuration.base,
          children: [
            index,
            { path: Routes.integrators.configuration.billing, element: <p>billing page</p> },
            { path: Routes.integrators.configuration.support, element: <p>support page</p> },
          ],
        },
      ],
      { initialEntries: [Routes.integrators.configuration.base] }
    )

    render(<RouterProvider router={router} />)

    await waitFor(() => expect(router.state.location.pathname).toBe(target))
  })

  it('redirects the retired subscription and wallet tabs to billing', async () => {
    const children = await configurationChildren()

    for (const path of [
      Routes.integrators.configuration.legacySubscription,
      Routes.integrators.configuration.legacyWallet,
    ]) {
      const route = findRoute(children, path)!
      const response = (await (route.loader as LoaderFunction)({
        request: new Request(`https://app.test${path}`),
        params: {},
      } as LoaderFunctionArgs)) as Response

      expect(response.status).toBe(302)
      expect(response.headers.get('Location')).toBe(Routes.integrators.configuration.billing)
    }
  })

  // A top-up started on the old wallet tab still returns to the old path with its session id
  it('keeps the session id when a wallet return URL is redirected', async () => {
    const children = await configurationChildren()
    const route = findRoute(children, Routes.integrators.configuration.legacyWalletReturn)!

    const response = (await (route.loader as LoaderFunction)({
      request: new Request('https://app.test/integrators/configuration/wallet/return/cs_123'),
      params: { sessionId: 'cs_123' },
    } as unknown as LoaderFunctionArgs)) as Response

    expect(response.headers.get('Location')).toBe('/integrators/configuration/billing/return/cs_123')
  })
})

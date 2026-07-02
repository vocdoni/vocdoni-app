import { Fragment } from 'react'
import { renderHook } from '@testing-library/react'
import { matchRoutes } from 'react-router-dom'
import { Routes } from '.'
import { mockUseClient } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    ensureQueryData: vi.fn(),
  }),
}))

vi.mock('../SuspenseLoader', () => ({
  SuspenseLoader: ({ children }: { children: React.ReactNode }) => children ?? Fragment,
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
})

import { render, renderHook, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider, type LoaderFunctionArgs } from 'react-router'
import { Routes } from '.'
import { useRootRoutes } from './root'

const authState = vi.hoisted(() => ({ current: { isAuthenticated: false, isAuthLoading: false } }))

vi.mock('~src/providers/ApiClientProvider', () => ({ useApiClient: () => ({ client: {} }) }))
vi.mock('~src/app-env', () => ({ useAppEnv: () => ({ VOCDONI_ENVIRONMENT: 'dev' }) }))
vi.mock('~components/Auth/useAuth', () => ({ useAuth: () => authState.current }))

const ballotRoute = () => {
  const { result } = renderHook(() => useRootRoutes())
  return result.current.children.find((route) => route.path === Routes.processes.view)!
}

describe('the ballot route', () => {
  // A ballot must never render inside the dashboard document: the loader
  // hands the very same URL to Vike as a full document load.
  it('redirects the document to the same URL', async () => {
    const request = new Request('https://app.test/processes/0x1234?foo=bar')

    const response = (await ballotRoute().loader!({ request } as LoaderFunctionArgs)) as Response

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('https://app.test/processes/0x1234?foo=bar')
    expect(response.headers.get('X-Remix-Reload-Document')).toBe('true')
  })

  // The redirect cannot throw and the SPA never cold-boots here, so anything
  // renderable on the route would be dead weight that implies otherwise.
  it('is loader-only', () => {
    const route = ballotRoute()

    expect(route.element).toBeUndefined()
    expect(route.errorElement).toBeUndefined()
    expect(route.HydrateFallback).toBeUndefined()
    expect(route.handle).toBeUndefined()
  })
})

describe('the retired plans route', () => {
  const plansRoute = () => {
    const { result } = renderHook(() => useRootRoutes())
    return result.current.children.find((route) => route.path === Routes.plans)!
  }

  const renderPlans = () => {
    const router = createMemoryRouter(
      [
        { path: Routes.root, element: <p>home page</p> },
        { path: Routes.dashboard.settings.billing, element: <p>billing page</p> },
        { path: Routes.plans, element: plansRoute().element },
      ],
      { initialEntries: [Routes.plans] }
    )
    render(<RouterProvider router={router} />)
    return router
  }

  it('sends signed-in users to the billing tab', async () => {
    authState.current = { isAuthenticated: true, isAuthLoading: false }

    const router = renderPlans()

    await waitFor(() => expect(router.state.location.pathname).toBe(Routes.dashboard.settings.billing))
  })

  it('sends everyone else to the home page', async () => {
    authState.current = { isAuthenticated: false, isAuthLoading: false }

    const router = renderPlans()

    await waitFor(() => expect(router.state.location.pathname).toBe(Routes.root))
  })
})

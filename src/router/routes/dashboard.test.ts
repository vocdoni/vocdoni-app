import { Fragment, type ReactElement } from 'react'
import type { LoaderFunction, LoaderFunctionArgs, RouteObject } from 'react-router'
import { renderHook } from '@testing-library/react'
import { Routes } from '.'
import { mockUseClient } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { shouldRevalidateDashboardProcess } from './dashboard'

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    ensureQueryData: vi.fn(),
  }),
}))

vi.mock('../SuspenseLoader', () => ({
  SuspenseLoader: ({ children }: { children: React.ReactNode }) => children ?? Fragment,
  Loading: () => null,
}))

const findRoute = (routes: RouteObject[] | undefined, path: string): RouteObject | undefined => {
  for (const route of routes ?? []) {
    if (route.path === path) return route
    const found = findRoute(route.children, path)
    if (found) return found
  }
}

describe('shouldRevalidateDashboardProcess', () => {
  it('does not revalidate when only switching between process tabs for the same id', () => {
    expect(
      shouldRevalidateDashboardProcess({
        currentParams: { id: '0xabc' },
        nextParams: { id: '0xabc' },
      })
    ).toBe(false)
  })

  it('revalidates when navigating to a different process id', () => {
    expect(
      shouldRevalidateDashboardProcess({
        currentParams: { id: '0xabc' },
        nextParams: { id: '0xdef' },
      })
    ).toBe(true)
  })
})

describe('dashboard process routes', () => {
  beforeEach(() => {
    setReactProvidersMock({
      useClient: () =>
        mockUseClient({
          client: { fetchElection: vi.fn() },
        }),
    })
  })

  it('renders the process view on the parent route so tab switches do not remount it', async () => {
    const { useDashboardRoutes } = await import('./dashboard')
    const { result } = renderHook(() => useDashboardRoutes())

    const processRoute = findRoute([result.current], Routes.dashboard.process)

    // The view sits on the parent; the tab routes render nothing of their own, so
    // switching between them keeps the parent element (and its state) mounted.
    expect(processRoute?.element).toBeTruthy()
    expect(processRoute?.shouldRevalidate).toBe(shouldRevalidateDashboardProcess)
    expect(processRoute?.children?.map((child) => (child.index ? 'index' : child.path))).toEqual([
      'index',
      Routes.dashboard.processResults,
    ])
    for (const child of processRoute?.children ?? []) {
      expect((child.element as ReactElement).type).toBe(Fragment)
    }
  })
})

describe('admin settings billing routes', () => {
  beforeEach(() => {
    setReactProvidersMock({
      useClient: () => mockUseClient({ client: {} }),
    })
  })

  const settingsRoutes = async () => {
    const { useDashboardRoutes } = await import('./dashboard')
    const { result } = renderHook(() => useDashboardRoutes())
    return findRoute([result.current], Routes.dashboard.settings.base)?.children ?? []
  }

  const redirectOf = async (path: string, params: Record<string, string> = {}) => {
    const route = findRoute(await settingsRoutes(), path)!
    const request = new Request(`https://app.test${path}`)
    return (await (route.loader as LoaderFunction)({ request, params } as LoaderFunctionArgs)) as Response
  }

  it('renders billing, and its Stripe return, with the wallet panel', async () => {
    const routes = await settingsRoutes()

    expect(findRoute(routes, Routes.dashboard.settings.billing)?.element).toBeTruthy()
    expect(findRoute(routes, Routes.dashboard.settings.billingReturn)?.element).toBeTruthy()
  })

  it('redirects the retired subscription and wallet tabs to billing', async () => {
    for (const path of [Routes.dashboard.settings.legacySubscription, Routes.dashboard.settings.legacyWallet]) {
      const response = await redirectOf(path)

      expect(response.status).toBe(302)
      expect(response.headers.get('Location')).toBe(Routes.dashboard.settings.billing)
    }
  })

  // A top-up started on the old wallet tab still returns to the old path with its session id
  it('keeps the session id when a wallet return URL is redirected', async () => {
    const response = await redirectOf(Routes.dashboard.settings.legacyWalletReturn, { sessionId: 'cs_123' })

    expect(response.headers.get('Location')).toBe('/admin/settings/billing/return/cs_123')
  })
})

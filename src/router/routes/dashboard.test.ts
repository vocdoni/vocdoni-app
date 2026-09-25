import { Fragment, type ReactElement } from 'react'
import type { RouteObject } from 'react-router'
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

    const findRoute = (routes: RouteObject[] | undefined, path: string): RouteObject | undefined => {
      for (const route of routes ?? []) {
        if (route.path === path) return route
        const found = findRoute(route.children, path)
        if (found) return found
      }
    }
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

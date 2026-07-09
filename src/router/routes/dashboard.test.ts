import { Fragment } from 'react'
import { renderHook } from '@testing-library/react'
import { matchRoutes } from 'react-router-dom'
import { Routes } from '.'
import { mockUseClient } from '~src/test-utils'
import { setReactProvidersMock, setAuthMock, getAuthMock } from '~src/test-utils-react-providers-mock'
import { shouldRevalidateDashboardProcess } from './dashboard'

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => getAuthMock(),
}))

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    ensureQueryData: vi.fn(),
  }),
}))

vi.mock('../SuspenseLoader', () => ({
  SuspenseLoader: ({ children }: { children: React.ReactNode }) => children ?? Fragment,
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
    setAuthMock({ currentAddress: '0xabc' })
    setReactProvidersMock({
      useClient: () =>
        mockUseClient({
          client: { fetchElection: vi.fn() },
        }),
    })
  })

  it('models process and process results as explicit nested routes', () => {
    const matches = matchRoutes(
      [
        {
          path: Routes.dashboard.process,
          children: [{ index: true }, { path: Routes.dashboard.processResults }],
        },
      ],
      '/admin/process/0xabc/results'
    )

    expect(matches?.map((match) => match.route.path ?? 'index')).toEqual([
      Routes.dashboard.process,
      Routes.dashboard.processResults,
    ])
  })

  it('renders the process view on the parent route so tab switches do not remount it', async () => {
    const { useDashboardRoutes } = await import('./dashboard')

    const { result } = renderHook(() => useDashboardRoutes())
    // There's OrganizationTypeGuard wrapper before LayoutDashboard
    const guardRoute = result.current.children?.[0]
    expect(guardRoute).toBeDefined()
    // Find the LayoutDashboard route (no path, has organizationCreate as child)
    const layoutRoute = guardRoute?.children?.find(
      (route: any) => !route.path && route.children?.some((c: any) => c.path === Routes.dashboard.organizationCreate)
    )
    expect(layoutRoute).toBeDefined()
    // Find the OrganizationProtectedRoute wrapper (no path, has process as child)
    const orgProtectedRoute = layoutRoute?.children?.find(
      (route: any) => !route.path && route.children?.some((c: any) => c.path === Routes.dashboard.process)
    )
    expect(orgProtectedRoute).toBeDefined()
    const processRoute = orgProtectedRoute?.children?.find((route: any) => route.path === Routes.dashboard.process)
    const indexChild = processRoute?.children?.[0]
    const resultsChild = processRoute?.children?.[1]

    expect(processRoute?.element).toBeTruthy()
    expect(indexChild && 'element' in indexChild ? indexChild.element : undefined).toBeTruthy()
    expect(resultsChild && 'element' in resultsChild ? resultsChild.element : undefined).toBeTruthy()
  })
})

import { Fragment } from 'react'
import { renderHook } from '@testing-library/react'
import { matchRoutes } from 'react-router-dom'
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
    const protectedRoute = result.current.children?.[0]?.children?.find((route) => !route.path)
    const processRoute = protectedRoute?.children?.find((route) => route.path === Routes.dashboard.process)
    const indexChild = processRoute?.children?.[0]
    const resultsChild = processRoute?.children?.[1]

    expect(processRoute?.element).toBeTruthy()
    expect(indexChild && 'element' in indexChild ? indexChild.element : undefined).toBeTruthy()
    expect(resultsChild && 'element' in resultsChild ? resultsChild.element : undefined).toBeTruthy()
  })
})

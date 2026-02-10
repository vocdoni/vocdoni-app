import { render, renderHook } from '@testing-library/react'
import { Suspense } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockParseProcessIds = vi.fn((value?: string) =>
  value
    ? value
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)
    : []
)

const fetchAccountInfo = vi.fn()
const fetchElection = vi.fn()

vi.mock('@vocdoni/react-providers', () => ({
  useClient: () => ({ client: { fetchAccountInfo, fetchElection } }),
}))

vi.mock('~components/Home', () => ({ default: () => <div>Home</div> }))
vi.mock('~components/Home/SharedCensus', () => ({
  default: () => <div>SharedCensus</div>,
  parseProcessIds: mockParseProcessIds,
}))
vi.mock('~elements/processes/view', () => ({ default: () => <div>ProcessView</div> }))
vi.mock('~elements/organization/view', () => ({ default: () => <div>OrganizationView</div> }))
vi.mock('../SuspenseLoader', () => ({
  SuspenseLoader: ({ children }: { children: React.ReactNode }) => <Suspense fallback={null}>{children}</Suspense>,
}))

describe('useHomeRoute', () => {
  const originalProcessIds = import.meta.env.PROCESS_IDS
  const originalDomains = import.meta.env.CUSTOM_ORGANIZATION_DOMAINS
  const originalSingleProcessId = import.meta.env.SINGLE_PROCESS_ID

  beforeEach(() => {
    vi.resetModules()
    import.meta.env.PROCESS_IDS = ''
    import.meta.env.CUSTOM_ORGANIZATION_DOMAINS = {}
    import.meta.env.SINGLE_PROCESS_ID = ''
    mockParseProcessIds.mockClear()
    fetchAccountInfo.mockClear()
    fetchElection.mockClear()
  })

  afterEach(() => {
    import.meta.env.PROCESS_IDS = originalProcessIds
    import.meta.env.CUSTOM_ORGANIZATION_DOMAINS = originalDomains
    import.meta.env.SINGLE_PROCESS_ID = originalSingleProcessId
  })

  it('uses SimpleLayout when PROCESS_IDS has values', async () => {
    import.meta.env.PROCESS_IDS = 'id-1'
    const { default: SimpleLayout } = await import('~elements/SimpleLayout')
    const { useHomeRoute } = await import('./home')

    const { result } = renderHook(() => useHomeRoute())

    expect(result.current.element?.type).toBe(SimpleLayout)
  })

  it('uses Layout when PROCESS_IDS is empty', async () => {
    import.meta.env.PROCESS_IDS = ''
    const { default: Layout } = await import('~elements/Layout')
    const { useHomeRoute } = await import('./home')

    const { result } = renderHook(() => useHomeRoute())

    expect(result.current.element?.type).toBe(Layout)
  })

  it('reads PROCESS_IDS only once even if multiple consumers need it', async () => {
    import.meta.env.PROCESS_IDS = 'id-1'
    const { useHomeRoute } = await import('./home')

    renderHook(() => useHomeRoute())

    expect(mockParseProcessIds).toHaveBeenCalledTimes(1)
  })

  it('renders the process view and loads election when SINGLE_PROCESS_ID is set', async () => {
    import.meta.env.SINGLE_PROCESS_ID = 'process-1'
    import.meta.env.PROCESS_IDS = 'id-1'
    import.meta.env.CUSTOM_ORGANIZATION_DOMAINS = { 'example.com': 'org-1' }
    const { useHomeRoute } = await import('./home')

    const { result } = renderHook(() => useHomeRoute())
    const route = result.current.children?.[0]

    await route?.loader?.()

    expect(fetchElection).toHaveBeenCalledWith('process-1')
    expect(fetchAccountInfo).not.toHaveBeenCalled()

    const { findByText } = render(<Suspense fallback={null}>{route?.element}</Suspense>)
    expect(await findByText('ProcessView')).toBeTruthy()
  })
})

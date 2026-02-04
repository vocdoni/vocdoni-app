import { renderHook } from '@testing-library/react'
import { Navigate } from 'react-router-dom'

const mockParseProcessIds = vi.fn((value?: string) =>
  value
    ? value
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)
    : []
)

vi.mock('@vocdoni/react-providers', () => ({
  useClient: () => ({ client: { fetchAccountInfo: vi.fn() } }),
}))

vi.mock('~components/Home/SharedCensus', () => ({
  default: () => <div>SharedCensus</div>,
  parseProcessIds: mockParseProcessIds,
}))
vi.mock('~elements/organization/view', () => ({ default: () => <div>OrganizationView</div> }))
vi.mock('../SuspenseLoader', () => ({
  SuspenseLoader: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('useHomeRoute', () => {
  const originalProcessIds = import.meta.env.PROCESS_IDS
  const originalDomains = import.meta.env.CUSTOM_ORGANIZATION_DOMAINS

  beforeEach(() => {
    vi.resetModules()
    import.meta.env.PROCESS_IDS = ''
    import.meta.env.CUSTOM_ORGANIZATION_DOMAINS = {}
    mockParseProcessIds.mockClear()
  })

  afterEach(() => {
    import.meta.env.PROCESS_IDS = originalProcessIds
    import.meta.env.CUSTOM_ORGANIZATION_DOMAINS = originalDomains
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

  it('redirects to /admin when no domain and no PROCESS_IDS', async () => {
    import.meta.env.PROCESS_IDS = ''
    const { useHomeRoute } = await import('./home')

    const { result } = renderHook(() => useHomeRoute())
    const indexRoute = result.current.children?.[0]

    expect(indexRoute?.element?.type).toBe(Navigate)
    expect(indexRoute?.element?.props.to).toBe('/admin')
  })

  it('reads PROCESS_IDS only once even if multiple consumers need it', async () => {
    import.meta.env.PROCESS_IDS = 'id-1'
    const { useHomeRoute } = await import('./home')

    renderHook(() => useHomeRoute())

    expect(mockParseProcessIds).toHaveBeenCalledTimes(1)
  })
})

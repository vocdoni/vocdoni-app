import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import Layout from '~elements/Layout'
import SimpleLayout from '~elements/SimpleLayout'
import { AppEnvProvider } from '~src/app-env'
import { buildAppEnv } from '~src/app-env-build'
import { mockUseClient } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { useHomeRoute } from './home'

const { mockParseProcessIds } = vi.hoisted(() => ({
  mockParseProcessIds: vi.fn((value?: string) =>
    value
      ? value
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean)
      : []
  ),
}))

vi.mock('~components/Home/SharedCensus', () => ({
  default: () => <div>SharedCensus</div>,
  parseProcessIds: mockParseProcessIds,
}))
vi.mock('~elements/organization/view', () => ({ default: () => <div>OrganizationView</div> }))
vi.mock('../SuspenseLoader', () => ({
  SuspenseLoader: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const wrapperFor = (processIds: string) => {
  const env = { ...buildAppEnv({}), PROCESS_IDS: processIds, CUSTOM_ORGANIZATION_DOMAINS: {} }
  return ({ children }: { children: ReactNode }) => <AppEnvProvider value={env}>{children}</AppEnvProvider>
}

describe('useHomeRoute', () => {
  beforeEach(() => {
    mockParseProcessIds.mockClear()
    setReactProvidersMock({
      useClient: () => mockUseClient({ client: { fetchAccountInfo: vi.fn() } }),
    })
  })

  it('uses SimpleLayout when PROCESS_IDS has values', () => {
    const { result } = renderHook(() => useHomeRoute(), { wrapper: wrapperFor('id-1') })

    expect(result.current.element?.type).toBe(SimpleLayout)
  })

  it('uses Layout when PROCESS_IDS is empty', () => {
    const { result } = renderHook(() => useHomeRoute(), { wrapper: wrapperFor('') })

    expect(result.current.element?.type).toBe(Layout)
  })

  it('redirects to /admin when no domain and no PROCESS_IDS', () => {
    const { result } = renderHook(() => useHomeRoute(), { wrapper: wrapperFor('') })
    const indexRoute = result.current.children?.[0]

    expect(indexRoute?.element?.type).toBe(Navigate)
    expect(indexRoute?.element?.props.to).toBe('/admin')
  })

  it('reads PROCESS_IDS only once even if multiple consumers need it', () => {
    renderHook(() => useHomeRoute(), { wrapper: wrapperFor('id-1') })

    expect(mockParseProcessIds).toHaveBeenCalledTimes(1)
  })
})

import { VocdoniApiError } from '@vocdoni/api-client'
import { renderHook } from '@testing-library/react'
import { useAuth } from '~components/Auth/useAuth'
import { useAccountHealthTools } from './use-account-health-tools'

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: vi.fn(),
}))

const mockAuth = (overrides = {}) => vi.mocked(useAuth).mockReturnValue({ addressesError: null, ...overrides } as never)

// The SaaS answers a brand new account with 404 {"error":"user has no organizations","code":40012}.
const noOrganizationsError = () =>
  new VocdoniApiError(404, { error: 'user has no organizations', code: 40012 }, 'user has no organizations', 40012)

describe('useAccountHealthTools', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('treats the "user has no organizations" 404 as a definitive answer, not a failed lookup', () => {
    mockAuth({ currentAddress: undefined, addressesError: noOrganizationsError() })

    const { result } = renderHook(() => useAccountHealthTools())

    expect(result.current.exists).toBe(false)
    expect(result.current.isUnknown).toBe(false)
  })

  it('reports a server-side failure as unknown so an org owner never sees onboarding', () => {
    mockAuth({ currentAddress: undefined, addressesError: new VocdoniApiError(502, undefined, 'Bad Gateway') })

    const { result } = renderHook(() => useAccountHealthTools())

    expect(result.current.isUnknown).toBe(true)
  })

  it('reports a network failure as unknown', () => {
    mockAuth({ currentAddress: undefined, addressesError: new Error('Failed to fetch') })

    const { result } = renderHook(() => useAccountHealthTools())

    expect(result.current.isUnknown).toBe(true)
  })

  it('reports an organization once an address is resolved', () => {
    mockAuth({ currentAddress: '0x123', addressesError: null })

    const { result } = renderHook(() => useAccountHealthTools())

    expect(result.current.exists).toBe(true)
    expect(result.current.isUnknown).toBe(false)
  })
})

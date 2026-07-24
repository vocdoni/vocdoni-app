import { QueryClient } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { AuthStorageKeys } from '@vocdoni/rainbowkit-wallets'
import { ReactNode } from 'react'
import { AllProviders } from '~src/test-utils'
import { useAuthProvider } from './useAuthProvider'

const disconnectMock = vi.fn()
const addressesMock = vi.fn()

vi.mock('wagmi', () => ({
  useDisconnect: () => ({ disconnect: disconnectMock }),
}))

vi.mock('~components/Auth/authQueries', () => ({
  useLogin: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRegister: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useVerifyMail: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

// Replaces the real SaaS API client with one whose `auth.addresses()` call is fully
// controlled by the test, so the addresses query never touches the network and its
// timing (pending vs. resolved) can be asserted deterministically. The real
// ApiClientProvider also mounts the SDK ClientProvider, whose context the
// react-providers AuthProvider in AllProviders requires — keep it in the tree,
// pointed at a dummy URL (ClientProvider makes no requests on its own).
vi.mock('~src/providers/ApiClientProvider', async () => {
  const { ClientProvider } =
    await vi.importActual<typeof import('@vocdoni/react-providers')>('@vocdoni/react-providers')
  return {
    ApiClientProvider: ({ children }: { children: ReactNode }) => (
      <ClientProvider apiUrl='http://test.local'>{children}</ClientProvider>
    ),
    AUTH_STORAGE_KEY: 'auth',
    useApiClient: () => ({ client: { auth: { addresses: addressesMock } } }),
  }
})

describe('useAuthProvider logout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    addressesMock.mockReset().mockResolvedValue({ addresses: [] })
  })

  it('clears auth storage keys on logout', () => {
    // Token/expiry are persisted by the react-providers AuthProvider under the
    // `${AUTH_STORAGE_KEY}` keys; the rainbowkit keys (authToken/authExpiry/authRegistered)
    // are cleared by clearAuthStorageKeys().
    localStorage.setItem('auth.token', 'token')
    localStorage.setItem('auth.expiry', 'expiry')
    localStorage.setItem(AuthStorageKeys.Registered, 'true')
    localStorage.setItem('authRenewSession', 'true')

    const { result } = renderHook(() => useAuthProvider(), { wrapper: AllProviders })

    act(() => {
      result.current.logout()
    })

    expect(localStorage.getItem('auth.token')).toBeFalsy()
    expect(localStorage.getItem('auth.expiry')).toBeFalsy()
    expect(localStorage.getItem(AuthStorageKeys.Registered)).toBeFalsy()
    expect(localStorage.getItem('authRenewSession')).toBeFalsy()
    expect(disconnectMock).toHaveBeenCalled()
  })

  it('clears the query cache on logout so the next account does not inherit a stale profile', () => {
    const clearCacheSpy = vi.spyOn(QueryClient.prototype, 'clear')

    const { result } = renderHook(() => useAuthProvider(), { wrapper: AllProviders })

    act(() => {
      result.current.logout()
    })

    expect(clearCacheSpy).toHaveBeenCalled()
  })
})

describe('useAuthProvider currentAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    addressesMock.mockReset().mockResolvedValue({ addresses: [] })
  })

  it('never exposes the stored address before the addresses query validates it', async () => {
    // Simulates user A logging out (signerAddress survives logout by design) and user B
    // logging in on the same browser: the stored address belongs to A, not to the
    // now-authenticated session, and must not be surfaced until checked against B's list.
    localStorage.setItem('auth.token', 'token')
    localStorage.setItem('signerAddress', '0xstale-from-a-previous-user')
    addressesMock.mockResolvedValue({ addresses: ['0xreal'] })

    const { result } = renderHook(() => useAuthProvider(), { wrapper: AllProviders })

    // Interim window: authenticated, but the address list hasn't resolved yet.
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.currentAddress).toBeUndefined()
    expect(result.current.isAuthLoading).toBe(true)

    await waitFor(() => expect(result.current.isAuthLoading).toBe(false))

    // Only the validated address is ever exposed, and the stale storage value is corrected.
    expect(result.current.currentAddress).toBe('0xreal')
    expect(localStorage.getItem('signerAddress')).toBe('0xreal')
  })

  it('resumes the same user previously selected address once validated', async () => {
    localStorage.setItem('auth.token', 'token')
    localStorage.setItem('signerAddress', '0xreal2')
    addressesMock.mockResolvedValue({ addresses: ['0xreal1', '0xreal2'] })

    const { result } = renderHook(() => useAuthProvider(), { wrapper: AllProviders })

    expect(result.current.currentAddress).toBeUndefined()

    await waitFor(() => expect(result.current.currentAddress).toBe('0xreal2'))

    expect(localStorage.getItem('signerAddress')).toBe('0xreal2')
  })

  it('resolves to undefined (not the stale stored address) when the user has no organizations', async () => {
    localStorage.setItem('auth.token', 'token')
    localStorage.setItem('signerAddress', '0xstale-from-a-previous-user')
    addressesMock.mockResolvedValue({ addresses: [] })

    const { result } = renderHook(() => useAuthProvider(), { wrapper: AllProviders })

    await waitFor(() => expect(result.current.isAuthLoading).toBe(false))

    expect(result.current.currentAddress).toBeUndefined()
  })
})

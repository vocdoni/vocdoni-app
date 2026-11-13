import { QueryClient } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { VocdoniApiError } from '@vocdoni/api-client'
import { AuthStorageKeys } from '@vocdoni/rainbowkit-wallets'
import { ReactNode } from 'react'
import { AllProviders, createTestQueryClient } from '~src/test-utils'
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

    const { result } = renderHook(() => useAuthProvider(), { wrapper: AllProviders })

    act(() => {
      result.current.logout()
    })

    expect(localStorage.getItem('auth.token')).toBeFalsy()
    expect(localStorage.getItem('auth.expiry')).toBeFalsy()
    expect(localStorage.getItem(AuthStorageKeys.Registered)).toBeFalsy()
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

  it('exposes the address in the same render the address list resolves, never a loaded session without it', async () => {
    // The private app guard lets the page through as soon as isAuthLoading drops. A render where
    // the list is known but the address is not yet applied shows "no organization" screens.
    localStorage.setItem('auth.token', 'token')
    localStorage.setItem('signerAddress', '0xreal2')
    addressesMock.mockResolvedValue({ addresses: ['0xreal1', '0xreal2'] })
    const renders: Array<{ isAuthLoading: boolean; currentAddress?: string }> = []

    renderHook(
      () => {
        const auth = useAuthProvider()
        renders.push({ isAuthLoading: auth.isAuthLoading, currentAddress: auth.currentAddress })
        return auth
      },
      { wrapper: AllProviders }
    )

    await waitFor(() => expect(renders.at(-1)?.isAuthLoading).toBe(false))

    expect(renders.filter((r) => !r.isAuthLoading).every((r) => r.currentAddress === '0xreal2')).toBe(true)
  })

  it('offers the stored address as unconfirmed only while the address list is pending', async () => {
    localStorage.setItem('auth.token', 'token')
    localStorage.setItem('signerAddress', '0xstale')
    let resolveAddresses: (value: { addresses: string[] }) => void = () => undefined
    addressesMock.mockReturnValue(new Promise((resolve) => (resolveAddresses = resolve)))

    const { result } = renderHook(() => useAuthProvider(), { wrapper: AllProviders })

    expect(result.current.unconfirmedAddress).toBe('0xstale')
    expect(result.current.currentAddress).toBeUndefined()

    await act(async () => resolveAddresses({ addresses: ['0xreal'] }))

    await waitFor(() => expect(result.current.currentAddress).toBe('0xreal'))
    expect(result.current.unconfirmedAddress).toBeUndefined()
  })

  it('offers no unconfirmed address without a session', () => {
    localStorage.setItem('signerAddress', '0xstored')

    const { result } = renderHook(() => useAuthProvider(), { wrapper: AllProviders })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.unconfirmedAddress).toBeUndefined()
  })

  it('drops data fetched for a stored address the account does not own, even if it lands late', async () => {
    localStorage.setItem('auth.token', 'token')
    localStorage.setItem('signerAddress', '0xstale')
    addressesMock.mockResolvedValue({ addresses: ['0xreal'] })
    const queryClient = createTestQueryClient()
    let resolveLate: (value: string) => void = () => undefined
    queryClient.setQueryData(['organization', '0xstale'], { name: 'someone else' })
    queryClient.setQueryData(['organizations', 'meta', '0xstale'], { tutorial: true })
    void queryClient.prefetchQuery({
      queryKey: ['organizations', 'elections', '0xstale', null],
      queryFn: () => new Promise<string>((resolve) => (resolveLate = resolve)),
    })
    queryClient.setQueryData(['organization', '0xreal'], { name: 'mine' })

    const { result } = renderHook(() => useAuthProvider(), {
      wrapper: ({ children }) => <AllProviders queryClient={queryClient}>{children}</AllProviders>,
    })

    await waitFor(() => expect(result.current.currentAddress).toBe('0xreal'))
    await act(async () => resolveLate('late elections'))

    const staleKeys = queryClient
      .getQueryCache()
      .getAll()
      .filter((query) => query.queryKey.includes('0xstale'))
    expect(staleKeys).toHaveLength(0)
    expect(queryClient.getQueryData(['organization', '0xreal'])).toEqual({ name: 'mine' })
  })

  it('drops data fetched for the stored address when the account owns no organization', async () => {
    localStorage.setItem('auth.token', 'token')
    localStorage.setItem('signerAddress', '0xstale')
    addressesMock.mockRejectedValue(new VocdoniApiError(404, {}, 'user has no organizations', 40012))
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['organization', '0xstale'], { name: 'someone else' })

    const { result } = renderHook(() => useAuthProvider(), {
      wrapper: ({ children }) => <AllProviders queryClient={queryClient}>{children}</AllProviders>,
    })

    await waitFor(() => expect(queryClient.getQueryData(['organization', '0xstale'])).toBeUndefined())
    expect(result.current.currentAddress).toBeUndefined()
  })

  it('keeps data fetched for the stored address once the account is confirmed to own it', async () => {
    localStorage.setItem('auth.token', 'token')
    localStorage.setItem('signerAddress', '0xreal')
    addressesMock.mockResolvedValue({ addresses: ['0xreal'] })
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(['organization', '0xreal'], { name: 'mine' })

    const { result } = renderHook(() => useAuthProvider(), {
      wrapper: ({ children }) => <AllProviders queryClient={queryClient}>{children}</AllProviders>,
    })

    await waitFor(() => expect(result.current.currentAddress).toBe('0xreal'))

    expect(queryClient.getQueryData(['organization', '0xreal'])).toEqual({ name: 'mine' })
  })

  it('switches to the address a caller stored before refreshing, even when the list did not change', async () => {
    localStorage.setItem('auth.token', 'token')
    localStorage.setItem('signerAddress', '0xreal1')
    addressesMock.mockResolvedValue({ addresses: ['0xreal1', '0xreal2'] })

    const { result } = renderHook(() => useAuthProvider(), { wrapper: AllProviders })
    await waitFor(() => expect(result.current.currentAddress).toBe('0xreal1'))

    localStorage.setItem('signerAddress', '0xreal2')
    await act(async () => {
      await result.current.refreshAddresses()
    })

    expect(result.current.currentAddress).toBe('0xreal2')
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

describe('useAuthProvider with a stored token the backend rejects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    addressesMock.mockReset()
  })

  it('logs out when the session probe answers 401, instead of staying authenticated', async () => {
    // The token/user no longer exists server-side. Staying "authenticated" with a token every
    // request rejects left the guards flipping between the loading screen and the dashboard
    // forever; the only way out was clearing localStorage by hand.
    localStorage.setItem('auth.token', 'revoked-token')
    localStorage.setItem('auth.expiry', '2099-01-01T00:00:00Z')
    addressesMock.mockRejectedValue(new VocdoniApiError(401, {}, 'authentication required', 40001))

    const { result } = renderHook(() => useAuthProvider(), { wrapper: AllProviders })

    await waitFor(() => expect(result.current.isAuthenticated).toBe(false))

    expect(result.current.isAuthLoading).toBe(false)
    expect(localStorage.getItem('auth.token')).toBeFalsy()
    expect(addressesMock).toHaveBeenCalledTimes(1)
  })

  it('keeps the session when the backend fails for reasons unrelated to the token', async () => {
    localStorage.setItem('auth.token', 'token')
    addressesMock.mockRejectedValue(new VocdoniApiError(500, {}, 'internal server error'))

    const { result } = renderHook(() => useAuthProvider(), { wrapper: AllProviders })

    await waitFor(() => expect(result.current.addressesError).toBeTruthy(), { timeout: 10_000 })

    expect(result.current.isAuthenticated).toBe(true)
    expect(localStorage.getItem('auth.token')).toBe('token')
  })
})

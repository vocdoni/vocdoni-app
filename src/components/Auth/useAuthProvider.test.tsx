import { QueryClient } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { AuthStorageKeys } from '@vocdoni/rainbowkit-wallets'
import { AllProviders } from '~src/test-utils'
import { useAuthProvider } from './useAuthProvider'

const disconnectMock = vi.fn()

vi.mock('wagmi', () => ({
  useDisconnect: () => ({ disconnect: disconnectMock }),
}))

vi.mock('~components/Auth/authQueries', () => ({
  useLogin: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRegister: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useVerifyMail: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

describe('useAuthProvider logout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
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

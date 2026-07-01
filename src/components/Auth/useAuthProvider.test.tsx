import { QueryClient } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { AuthStorageKeys } from '@vocdoni/rainbowkit-wallets'
import { AllProviders, mockUseClient } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { useAuthProvider } from './useAuthProvider'

const clearMock = vi.fn()
const disconnectMock = vi.fn()
const addressesMock = vi.fn().mockResolvedValue(['0x123'])

vi.mock('wagmi', () => ({
  useDisconnect: () => ({ disconnect: disconnectMock }),
}))

vi.mock('@vocdoni/sdk', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/sdk')>()
  return {
    ...actual,
    RemoteSigner: class {
      public address?: string
      public remoteSignerService = {
        addresses: addressesMock,
      }
      constructor(_: unknown) {}
    },
  }
})

vi.mock('~components/Auth/authQueries', () => ({
  useLogin: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRegister: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useVerifyMail: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

describe('useAuthProvider logout', () => {
  const setSignerMock = vi.fn()
  const setClientMock = vi.fn()
  const fetchAccountMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    setReactProvidersMock({
      useClient: () =>
        mockUseClient({
          signer: null,
          setSigner: setSignerMock,
          fetchAccount: fetchAccountMock,
          client: {},
          setClient: setClientMock,
          clear: clearMock,
        }),
    })
  })

  it('clears auth storage keys on logout', () => {
    localStorage.setItem('authToken', 'token')
    localStorage.setItem('authExpiry', 'expiry')
    localStorage.setItem(AuthStorageKeys.Registered, 'true')
    localStorage.setItem('authRenewSession', 'true')

    const { result } = renderHook(() => useAuthProvider(), { wrapper: AllProviders })

    act(() => {
      result.current.logout()
    })

    expect(localStorage.getItem('authToken')).toBeFalsy()
    expect(localStorage.getItem('authExpiry')).toBeFalsy()
    expect(localStorage.getItem(AuthStorageKeys.Registered)).toBeFalsy()
    expect(localStorage.getItem('authRenewSession')).toBeFalsy()
    expect(clearMock).toHaveBeenCalled()
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

  it('updates signer without mutating/re-setting client instance', async () => {
    const { result } = renderHook(() => useAuthProvider(), { wrapper: AllProviders })

    await act(async () => {
      await result.current.updateSigner('token')
    })

    expect(setSignerMock).toHaveBeenCalledTimes(1)
    expect(setClientMock).not.toHaveBeenCalled()
    expect(fetchAccountMock).not.toHaveBeenCalled()
  })
})

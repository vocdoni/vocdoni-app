import { act, renderHook } from '@testing-library/react'
import { AuthStorageKeys } from '@vocdoni/rainbowkit-wallets'
import { AllProviders } from '~src/test-utils'
import { useAuthProvider } from './useAuthProvider'

const clearMock = vi.fn()
const disconnectMock = vi.fn()

vi.mock('@vocdoni/react-providers', () => ({
  useClient: () => ({
    signer: null,
    setSigner: vi.fn(),
    fetchAccount: vi.fn(),
    client: {},
    setClient: vi.fn(),
    clear: clearMock,
  }),
}))

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
    localStorage.setItem('authToken', 'token')
    localStorage.setItem('authExpiry', 'expiry')
    localStorage.setItem(AuthStorageKeys.Registered, 'true')
    localStorage.setItem('authRenewSession', 'true')

    const { result } = renderHook(() => useAuthProvider(), { wrapper: AllProviders })

    act(() => {
      result.current.logout()
    })

    expect(localStorage.getItem('authToken')).toBeNull()
    expect(localStorage.getItem('authExpiry')).toBeNull()
    expect(localStorage.getItem(AuthStorageKeys.Registered)).toBeNull()
    expect(localStorage.getItem('authRenewSession')).toBeNull()
    expect(clearMock).toHaveBeenCalled()
    expect(disconnectMock).toHaveBeenCalled()
  })
})

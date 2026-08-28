import { AuthStorageKeys } from '@vocdoni/rainbowkit-wallets'
import { Routes } from '~src/router/routes'
import { render, waitFor } from '~src/test-utils'
import { setAuthMock, getAuthMock } from '~src/test-utils-react-providers-mock'
import GoogleAuth from './GoogleAuth'

const disconnectMock = vi.fn()
const navigateMock = vi.fn()

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => getAuthMock(),
}))

vi.mock('~components/Auth/useAuthProvider', () => ({
  readOAuthSession: () => {
    const token = localStorage.getItem(AuthStorageKeys.Token)
    const expiry = localStorage.getItem(AuthStorageKeys.Expiry)
    return token ? { token, expiry } : null
  },
}))

vi.mock('wagmi', async () => {
  const actual = await vi.importActual<typeof import('wagmi')>('wagmi')
  return {
    ...actual,
    useAccount: () => ({ isConnected: true, connector: { id: 'google' } }),
    useConnect: () => ({ connect: vi.fn(), isPending: false, isError: false, error: null }),
    useDisconnect: () => ({ disconnect: disconnectMock }),
  }
})

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('GoogleAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('redirects OAuth signups to organization create', async () => {
    const setSessionMock = vi.fn()
    const refreshAddressesMock = vi.fn()
    setAuthMock({ setSession: setSessionMock, refreshAddresses: refreshAddressesMock })

    localStorage.setItem(AuthStorageKeys.Token, 'token-123')
    localStorage.setItem(AuthStorageKeys.Expiry, 'expiry-123')
    localStorage.setItem(AuthStorageKeys.Registered, 'true')

    render(<GoogleAuth />)

    await waitFor(() => {
      expect(setSessionMock).toHaveBeenCalledWith({ token: 'token-123', expiry: 'expiry-123' })
      expect(refreshAddressesMock).toHaveBeenCalled()
      expect(navigateMock).toHaveBeenCalledWith(Routes.auth.organizationCreate)
    })
  })

  it('does not redirect when login is not a signup', async () => {
    const setSessionMock = vi.fn()
    const refreshAddressesMock = vi.fn()
    setAuthMock({ setSession: setSessionMock, refreshAddresses: refreshAddressesMock })

    localStorage.setItem(AuthStorageKeys.Token, 'token-123')
    localStorage.setItem(AuthStorageKeys.Expiry, 'expiry-123')

    render(<GoogleAuth />)

    await waitFor(() => {
      expect(setSessionMock).toHaveBeenCalledWith({ token: 'token-123', expiry: 'expiry-123' })
      expect(refreshAddressesMock).toHaveBeenCalled()
    })

    expect(navigateMock).not.toHaveBeenCalled()
  })
})

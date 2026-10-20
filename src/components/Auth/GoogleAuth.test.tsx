import { AuthStorageKeys } from '@vocdoni/rainbowkit-wallets'
import { Routes } from '~src/router/routes'
import { AnalyticsEvents } from '~utils/analytics'
import { render, waitFor } from '~src/test-utils'
import { setAuthMock, getAuthMock } from '~src/test-utils-react-providers-mock'
import GoogleAuth from './GoogleAuth'

const disconnectMock = vi.fn()
const navigateMock = vi.fn()
const trackEventMock = vi.fn()
const rememberSignupMethodMock = vi.fn()
let accountState: { isConnected: boolean; connector?: { id: string } } = {
  isConnected: true,
  connector: { id: 'google' },
}
let connectState: { isError: boolean; error: Error | null } = { isError: false, error: null }

vi.mock('~components/AnalyticsProvider', () => ({
  useAnalytics: () => ({ trackEvent: trackEventMock }),
}))

vi.mock('~utils/analytics', async () => {
  const actual = await vi.importActual<typeof import('~utils/analytics')>('~utils/analytics')
  return {
    ...actual,
    rememberSignupMethod: (method: string) => rememberSignupMethodMock(method),
  }
})

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
    useAccount: () => accountState,
    useConnect: () => ({ connect: vi.fn(), isPending: false, ...connectState }),
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
    accountState = { isConnected: true, connector: { id: 'google' } }
    connectState = { isError: false, error: null }
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
    expect(trackEventMock).toHaveBeenCalledTimes(1)
    expect(trackEventMock).toHaveBeenCalledWith({ name: AnalyticsEvents.AccountSignup, props: { method: 'google' } })
    expect(rememberSignupMethodMock).toHaveBeenCalledWith('google')
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
    expect(trackEventMock).toHaveBeenCalledTimes(1)
    expect(trackEventMock).toHaveBeenCalledWith({ name: AnalyticsEvents.UserLoggedIn, props: { method: 'google' } })
    expect(rememberSignupMethodMock).not.toHaveBeenCalled()
  })

  it.each([
    ['account_conflict', 'OAuthAccountConflictError: email already registered'],
    ['oauth_error', 'Popup closed by user'],
  ])('tracks a failed Google auth as %s', async (reason, message) => {
    setAuthMock({ setSession: vi.fn(), refreshAddresses: vi.fn() })
    accountState = { isConnected: false }
    connectState = { isError: true, error: new Error(message) }
    vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<GoogleAuth />)

    await waitFor(() => {
      expect(trackEventMock).toHaveBeenCalledWith({
        name: AnalyticsEvents.AuthFailed,
        props: { method: 'google', reason },
      })
    })
    expect(trackEventMock).toHaveBeenCalledTimes(1)
    expect(rememberSignupMethodMock).not.toHaveBeenCalled()
  })
})

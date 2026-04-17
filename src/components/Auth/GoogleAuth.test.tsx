import { AuthStorageKeys } from '@vocdoni/rainbowkit-wallets'
import { Routes } from '~src/router/routes'
import { render, waitFor } from '~src/test-utils'
const setBearerMock = vi.fn()
const updateSignerMock = vi.fn()
const disconnectMock = vi.fn()
const navigateMock = vi.fn()

vi.mock('./useAuth', () => ({
  useAuth: () => ({
    setBearer: setBearerMock,
    updateSigner: updateSignerMock,
  }),
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

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
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
    localStorage.setItem(AuthStorageKeys.Token, 'token-123')
    localStorage.setItem(AuthStorageKeys.Registered, 'true')

    const { default: GoogleAuth } = await import('./GoogleAuth')
    render(<GoogleAuth />)

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith(Routes.auth.organizationCreate)
    })
  })

  it('does not redirect when login is not a signup', async () => {
    localStorage.setItem(AuthStorageKeys.Token, 'token-123')

    const { default: GoogleAuth } = await import('./GoogleAuth')
    render(<GoogleAuth />)

    expect(navigateMock).not.toHaveBeenCalled()
  })
})

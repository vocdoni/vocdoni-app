import { Routes } from '~src/router/routes'
import { render, waitFor } from '~src/test-utils'
import GoogleAuth from './GoogleAuth'

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

vi.mock('wagmi', () => ({
  useAccount: () => ({ isConnected: true, connector: { id: 'google' } }),
  useConnect: () => ({ connect: vi.fn(), isPending: false, isError: false, error: null }),
  useDisconnect: () => ({ disconnect: disconnectMock }),
}))

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
    localStorage.setItem('authToken', 'token-123')
    localStorage.setItem('authRegistered', 'true')

    render(<GoogleAuth />)

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith(Routes.auth.organizationCreate)
    })
  })

  it('does not redirect when login is not a signup', () => {
    localStorage.setItem('authToken', 'token-123')

    render(<GoogleAuth />)

    expect(navigateMock).not.toHaveBeenCalled()
  })
})

import { mockUseClient, mockUseElection, render, screen } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { CensusTypes } from './Census/CensusType'
import LogoutButton from './LogoutButton'

const authState = vi.hoisted(() => ({
  logout: vi.fn(),
  setMemberNumber: vi.fn(),
}))

vi.mock('wagmi', () => ({
  useAccount: () => ({ isConnected: false }),
  useDisconnect: () => ({ disconnect: vi.fn() }),
}))

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@vocdoni/react-components')
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return {
    ...actual,
    ...getReactProvidersMock(),
  }
})

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => authState,
}))

describe('LogoutButton', () => {
  beforeEach(() => {
    authState.logout.mockClear()
    authState.setMemberNumber.mockClear()
    setReactProvidersMock({
      useElection: () =>
        mockUseElection({
          election: {
            census: { type: CensusTypes.Web3 },
            meta: { census: { type: 'spreadsheet' } },
          },
          connected: true,
          clearClient: vi.fn(),
        }),
      useClient: () => mockUseClient({ clear: vi.fn() }),
    })
  })

  it('renders logout button when connected to spreadsheet census', () => {
    render(<LogoutButton />)
    expect(screen.getByText('logout')).toBeInTheDocument()
  })

  it('clears the shared census member number when logging out', () => {
    render(<LogoutButton />)

    screen.getByText('logout').click()

    expect(authState.setMemberNumber).toHaveBeenCalledWith(null)
  })
})

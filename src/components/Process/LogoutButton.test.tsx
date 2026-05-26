import { fireEvent, mockUseClient, mockUseElection, render, screen } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { processCspIdentifierStorageKey } from '~components/Process/authenticatedVoterLabel'
import { CensusTypes } from './Census/CensusType'
import LogoutButton from './LogoutButton'

const logoutMock = vi.fn()

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
  useAuth: () => ({ logout: logoutMock }),
}))

describe('LogoutButton', () => {
  beforeEach(() => {
    logoutMock.mockClear()
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

  it('clears process identifiers on logout', () => {
    localStorage.setItem(processCspIdentifierStorageKey('0xprocess-1'), JSON.stringify({ value: 'user@example.com' }))

    const clearClient = vi.fn()
    setReactProvidersMock({
      useElection: () =>
        mockUseElection({
          election: {
            id: '0xprocess-1',
            census: { type: CensusTypes.CSP },
            meta: { census: { type: 'spreadsheet' } },
          },
          connected: true,
          clearClient,
        }),
      useClient: () => mockUseClient({ clear: vi.fn() }),
    })

    render(<LogoutButton />)

    fireEvent.click(screen.getByText('logout'))

    expect(localStorage.getItem(processCspIdentifierStorageKey('0xprocess-1'))).toBeFalsy()
    expect(clearClient).toHaveBeenCalled()
    expect(logoutMock).not.toHaveBeenCalled()
  })
})

import { render, screen } from '~src/test-utils'
import { CensusTypes } from './Census/CensusType'
import LogoutButton from './LogoutButton'

vi.mock('@vocdoni/react-providers', () => ({
  useElection: () => ({
    election: {
      census: { type: CensusTypes.Web3 },
      meta: { census: { type: 'spreadsheet' } },
    },
    connected: true,
    clearClient: vi.fn(),
  }),
  useClient: () => ({ clear: vi.fn() }),
}))

vi.mock('wagmi', () => ({
  useAccount: () => ({ isConnected: false }),
  useDisconnect: () => ({ disconnect: vi.fn() }),
}))

vi.mock('~components/vocdoni-ui', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('~components/vocdoni-ui')
  return {
    ...actual,
    SpreadsheetAccess: () => <div>SpreadsheetAccess</div>,
  }
})

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ logout: vi.fn() }),
}))

describe('LogoutButton', () => {
  it('renders SpreadsheetAccess when connected to spreadsheet census', () => {
    render(<LogoutButton />)
    expect(screen.getByText('SpreadsheetAccess')).toBeInTheDocument()
  })
})

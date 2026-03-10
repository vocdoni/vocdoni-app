import { mockUseClient, mockUseElection, render, screen } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { CensusTypes } from './Census/CensusType'
import LogoutButton from './LogoutButton'

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
    SpreadsheetAccess: () => <div>SpreadsheetAccess</div>,
  }
})

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ logout: vi.fn() }),
}))

describe('LogoutButton', () => {
  beforeEach(() => {
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

  it('renders SpreadsheetAccess when connected to spreadsheet census', () => {
    render(<LogoutButton />)
    expect(screen.getByText('SpreadsheetAccess')).toBeInTheDocument()
  })
})

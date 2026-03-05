import { ElectionStatus } from '@vocdoni/sdk'
import { mockUseClient, mockUseElection, render, screen } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import ProcessAside, { VoteButton } from './Aside'
import { CensusTypes } from './Census/CensusType'

vi.mock('@rainbow-me/rainbowkit', () => ({
  useConnectModal: () => ({ openConnectModal: vi.fn() }),
}))

vi.mock('wagmi', () => ({
  useAccount: () => ({ isConnected: false }),
}))

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@vocdoni/react-components')
  return {
    ...actual,
    VoteButton: (props: any) => <button {...props}>Vote</button>,
    SpreadsheetAccess: () => <div>Spreadsheet</div>,
    VoteWeight: () => <div>Weight</div>,
    environment: { verifyVote: () => '/verify' },
  }
})

vi.mock('./CSP/CSPAuthModal', () => ({
  CspAuth: () => <div>CSP</div>,
}))

vi.mock('./LogoutButton', () => ({
  default: () => <div>Logout</div>,
}))

describe('ProcessAside', () => {
  beforeEach(() => {
    setReactProvidersMock({
      useElection: () =>
        mockUseElection({
          election: {
            status: ElectionStatus.ONGOING,
            electionType: { anonymous: false, secretUntilTheEnd: false },
            questions: [{ choices: [{ results: 1 }, { results: 2 }] }],
            voteCount: 3,
            census: { type: CensusTypes.Web3, weight: 3, size: 3 },
            voteType: { maxVoteOverwrites: 0 },
            meta: {},
          },
          isInCensus: true,
          voted: null,
          votesLeft: 0,
          loading: { voting: false },
          isAbleToVote: true,
          connected: false,
        }),
      useClient: () => mockUseClient({ env: 'stg' }),
    })
  })

  it('renders status and connect button', () => {
    render(<ProcessAside />)

    expect(screen.getByText('PROCESS.STATUS.ACTIVE')).toBeInTheDocument()
    expect(screen.getByText('menu.connect')).toBeInTheDocument()
  })

  it('renders VoteButton', () => {
    render(<VoteButton setQuestionsTab={vi.fn()} />)
    expect(screen.getByText('Vote')).toBeInTheDocument()
  })
})

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
  useDisconnect: () => ({ disconnect: vi.fn() }),
}))

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@vocdoni/react-components')
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return {
    ...actual,
    ...getReactProvidersMock(),
    VoteButton: (props: any) => <button {...props}>Vote</button>,
    SpreadsheetAccess: () => <div>Spreadsheet</div>,
    VoteWeight: () => <div>Weight</div>,
    environment: { verifyVote: () => '/verify' },
  }
})

vi.mock('./CSP/CSPAuthModal', () => ({
  CspAuth: () => <div>CSP</div>,
}))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ logout: vi.fn() }),
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
          loading: { voting: false, census: false },
          loaded: { census: true },
          isAbleToVote: true,
          connected: false,
        }),
      useClient: () => mockUseClient({ env: 'prod' }),
    })
  })

  it('renders status and connect button', () => {
    render(<ProcessAside />)

    expect(screen.getByText('PROCESS.STATUS.ACTIVE')).toBeInTheDocument()
    expect(screen.getByText('menu.connect')).toBeInTheDocument()
  })

  it('shows login in sidebar and floating CTA when disconnected', () => {
    render(
      <>
        <ProcessAside />
        <VoteButton setQuestionsTab={vi.fn()} />
      </>
    )

    expect(screen.getAllByText('menu.connect')).toHaveLength(2)
    expect(screen.queryByText('logout')).not.toBeInTheDocument()
    expect(screen.queryByText('Vote')).not.toBeInTheDocument()
  })

  it('shows sidebar logout and disabled vote while connected and census is syncing', () => {
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
          isInCensus: false,
          isAbleToVote: false,
          loading: { voting: false, census: true },
          loaded: { census: false },
          connected: true,
        }),
    })

    render(
      <>
        <ProcessAside />
        <VoteButton setQuestionsTab={vi.fn()} />
      </>
    )

    expect(screen.getByText('logout')).toBeInTheDocument()
    expect(screen.queryByText('menu.connect')).not.toBeInTheDocument()
    expect(screen.getByText('Vote')).toBeDisabled()
  })

  it('shows sidebar logout and enabled vote when connected and eligible', () => {
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
          isAbleToVote: true,
          loading: { voting: false, census: false },
          loaded: { census: true },
          connected: true,
        }),
    })

    render(
      <>
        <ProcessAside />
        <VoteButton setQuestionsTab={vi.fn()} />
      </>
    )

    expect(screen.getByText('logout')).toBeInTheDocument()
    expect(screen.getByText('Vote')).toBeEnabled()
    expect(screen.queryByText('menu.connect')).not.toBeInTheDocument()
  })

  it('shows sidebar logout and hides floating vote when connected and ineligible', () => {
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
          isInCensus: false,
          isAbleToVote: false,
          loading: { voting: false, census: false },
          loaded: { census: true },
          connected: true,
        }),
    })

    render(
      <>
        <ProcessAside />
        <VoteButton setQuestionsTab={vi.fn()} />
      </>
    )

    expect(screen.getByText('logout')).toBeInTheDocument()
    expect(screen.queryByText('Vote')).not.toBeInTheDocument()
    expect(screen.queryByText('menu.connect')).not.toBeInTheDocument()
  })
})

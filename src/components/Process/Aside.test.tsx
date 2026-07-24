import { mockUseClient, mockUseElection, render, screen } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import ProcessAside, { VoteButton } from './Aside'

vi.mock('@rainbow-me/rainbowkit', () => ({
  useConnectModal: () => ({ openConnectModal: vi.fn() }),
}))

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@vocdoni/react-components')
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return {
    ...actual,
    ...getReactProvidersMock(),
    VoteButton: (props: any) => <button {...props}>Vote</button>,
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

// Minimal v2 VotingProcessResponse-shaped election: only the fields Aside.tsx
// actually reads (census.weighted, questions[].secretUntilTheEnd).
const baseElection = {
  id: 'p1',
  census: { weighted: false },
  questions: [{ secretUntilTheEnd: false }],
}
const baseResults = { id: 'p1', questions: [{ questionId: 'p1-q1', voteCount: 3 }] }

describe('ProcessAside', () => {
  beforeEach(() => {
    setReactProvidersMock({
      useElection: () =>
        mockUseElection({
          election: baseElection,
          status: 'ONGOING',
          results: baseResults,
          isInCensus: true,
          hasVoted: false,
          voteId: null,
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

  it('shows sidebar logout and hides floating vote while connected and not yet a census member', () => {
    setReactProvidersMock({
      useElection: () =>
        mockUseElection({
          election: baseElection,
          status: 'ONGOING',
          results: baseResults,
          isInCensus: false,
          hasVoted: false,
          voteId: null,
          isAbleToVote: false,
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
    expect(screen.getByText('aside.is_not_in_census')).toBeInTheDocument()
    expect(screen.queryByText('menu.connect')).not.toBeInTheDocument()
    expect(screen.queryByText('Vote')).not.toBeInTheDocument()
  })

  it('shows sidebar logout and enabled vote when connected and eligible', () => {
    setReactProvidersMock({
      useElection: () =>
        mockUseElection({
          election: baseElection,
          status: 'ONGOING',
          results: baseResults,
          isInCensus: true,
          hasVoted: false,
          voteId: null,
          isAbleToVote: true,
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

  it('shows sidebar logout and hides floating vote when connected and ineligible (already voted)', () => {
    setReactProvidersMock({
      useElection: () =>
        mockUseElection({
          election: baseElection,
          status: 'ONGOING',
          results: baseResults,
          isInCensus: true,
          hasVoted: true,
          voteId: 'vote-123',
          isAbleToVote: false,
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

  it('shows the has-voted message and the explorer verify link once the voter has cast a vote', () => {
    setReactProvidersMock({
      useElection: () =>
        mockUseElection({
          election: baseElection,
          status: 'ONGOING',
          results: baseResults,
          isInCensus: true,
          hasVoted: true,
          voteId: 'vote-123',
          isAbleToVote: false,
          connected: true,
        }),
    })

    render(<ProcessAside />)

    expect(screen.getByText('aside.has_already_voted')).toBeInTheDocument()
    expect(screen.getByText('aside.verify_vote_on_explorer')).toBeInTheDocument()
  })
})

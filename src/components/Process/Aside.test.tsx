import { mockUseClient, mockUseElection, render, screen } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import ProcessAside, { VoteButton } from './Aside'

// The packaged CspAuth is stubbed: its flow is tested upstream, here only the props Aside passes are checked.
const cspAuth = vi.hoisted(() => ({ props: undefined as Record<string, any> | undefined }))

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@vocdoni/react-components')
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return {
    ...actual,
    ...getReactProvidersMock(),
    CspAuth: (props: Record<string, any>) => {
      cspAuth.props = props
      return <div>CSP</div>
    },
    VoteButton: (props: any) => <button {...props}>Vote</button>,
    VoteWeight: () => <div>Weight</div>,
    environment: { verifyVote: () => '/verify' },
  }
})

// The certificate flow is tested in CertAuth/: here only which identify flow Aside picks.
vi.mock('./CertAuth/CertAuth', async (importOriginal) => ({
  ...((await importOriginal()) as object),
  CertAuthConnect: () => <div>CERT</div>,
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

  it('renders status and the CSP identify flow', () => {
    render(<ProcessAside />)

    expect(screen.getByText('PROCESS.STATUS.ACTIVE')).toBeInTheDocument()
    expect(screen.getByText('CSP')).toBeInTheDocument()
  })

  it('renders the certificate flow, not the CSP one, for a certificate census', () => {
    setReactProvidersMock({
      useElection: () =>
        mockUseElection({
          election: { ...baseElection, census: { weighted: false, certAuth: true } },
          status: 'ONGOING',
          results: baseResults,
          connected: false,
        }),
    })
    render(<ProcessAside />)

    expect(screen.getByText('CERT')).toBeInTheDocument()
    expect(screen.queryByText('CSP')).not.toBeInTheDocument()
  })

  it('renders the CSP flow, not the certificate one, for a census without certificates', () => {
    render(<ProcessAside />)

    expect(screen.getByText('CSP')).toBeInTheDocument()
    expect(screen.queryByText('CERT')).not.toBeInTheDocument()
  })

  it('makes the voter accept the terms and link them to the terms and privacy policy', () => {
    const appEnv = { TERMS_OF_SERVICE_URL: 'https://terms.example', PRIVACY_POLICY_URL: 'https://privacy.example' }
    render(<ProcessAside />, { appEnv })

    expect(cspAuth.props?.requireTerms).toBe(true)
    // the terms read the URLs where they render (VoterTerms), as they do inside CspAuth's form
    render(<>{cspAuth.props?.terms}</>, { appEnv })
    expect(screen.getByRole('link', { name: 'Terms and Conditions' })).toHaveAttribute('href', 'https://terms.example')
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', 'https://privacy.example')
  })

  it('renders the vote count without a definition list', () => {
    render(<ProcessAside />)

    expect(screen.getByTestId('process-vote-count')).toBeInTheDocument()
    expect(document.querySelector('dl')).toBeNull()
  })

  it('shows the identify flow in sidebar and floating CTA when disconnected', () => {
    render(
      <>
        <ProcessAside />
        <VoteButton setQuestionsTab={vi.fn()} />
      </>
    )

    expect(screen.getAllByText('CSP')).toHaveLength(2)
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
    expect(screen.queryByText('CSP')).not.toBeInTheDocument()
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
    expect(screen.queryByText('CSP')).not.toBeInTheDocument()
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
    expect(screen.queryByText('CSP')).not.toBeInTheDocument()
  })

  it('shows the has-voted message without the explorer link once the voter has cast a vote', () => {
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
    // The explorer verify links moved to the Voted notice (one per question).
    expect(screen.queryByText('aside.verify_vote_on_explorer')).not.toBeInTheDocument()
  })
})

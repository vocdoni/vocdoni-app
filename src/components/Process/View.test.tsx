import userEvent from '@testing-library/user-event'
import { mockUseElection, render, screen, waitFor } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { AnonymityInfoCard, ProcessInfoCard, SuccessVoteModal, VotingVoteModal } from './View'

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@vocdoni/react-components')
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return {
    ...actual,
    ...getReactProvidersMock(),
  }
})

describe('AnonymityInfoCard', () => {
  const TRACKED = /no vote can be traced back to a voter/i

  it('names the mode of an anonymous process, without the mechanism behind it', () => {
    render(<AnonymityInfoCard anonymous />)

    expect(screen.getByText('Anonymous vote')).toBeInTheDocument()
    // The blind-signature detail belongs to the dashboard and the PDF report, not the voter sidebar.
    expect(screen.queryByText(/blind signature/i)).toBeNull()
  })

  it('states the mode exactly once', () => {
    // `e2e/anonymous-voting.e2e.ts` matches this sentence on the public page with Playwright's
    // strict single-match `getByText`. Rendering it twice fails that run with a strict-mode
    // violation, which is expensive to discover — so it is pinned here instead.
    render(<AnonymityInfoCard anonymous />)

    expect(screen.getAllByText(TRACKED)).toHaveLength(1)
  })

  it('names the mode of a private process', () => {
    render(<AnonymityInfoCard anonymous={false} />)

    expect(screen.getByText('Private vote')).toBeInTheDocument()
    expect(screen.queryByText(/blind signature/i)).toBeNull()
    expect(screen.queryByText(TRACKED)).toBeNull()
  })
})

describe('ProcessInfoCard', () => {
  it('renders label and description', () => {
    render(<ProcessInfoCard label='Participants' description='42 voters' />)

    expect(screen.getByText('Participants')).toBeInTheDocument()
    expect(screen.getByText('42 voters')).toBeInTheDocument()
  })
})

describe('VotingVoteModal', () => {
  const questions = (count: number) => Array.from({ length: count }, (_, index) => ({ id: `q${index + 1}` }))

  const setElection = (overrides: Record<string, unknown>, questionCount = 3) =>
    setReactProvidersMock({
      useElection: () => mockUseElection({ election: { id: 'p1', questions: questions(questionCount) }, ...overrides }),
    })

  it('tells the voter the vote is being processed while it lands', () => {
    setElection({ voting: true, voteStatus: { q1: 'confirmed', q2: 'confirming', q3: 'confirming' } })

    render(<VotingVoteModal />)

    expect(screen.getByText('process.voting')).toBeInTheDocument()
  })

  it('keeps the per-question breakdown out of the voter view', () => {
    // Each question is its own on-chain election and confirms separately, but that
    // is an implementation detail the voter should never be shown.
    setElection({ voting: true, voteStatus: { q1: 'confirmed', q2: 'confirming', q3: 'confirming' } })

    render(<VotingVoteModal />)

    expect(screen.queryByText(/questions confirmed/)).not.toBeInTheDocument()
  })

  it('tells the voter nothing was cast when the whole batch is rejected', async () => {
    // The relay accepts or rejects the batch as a unit: every question fails.
    setElection({ voting: false, voteStatus: { q1: 'failed', q2: 'failed', q3: 'failed' } })

    render(<VotingVoteModal />)

    expect(await screen.findByText('Your vote could not be cast')).toBeInTheDocument()
    expect(screen.getByText('No answer was registered. Please try again.')).toBeInTheDocument()
  })

  it('tells the voter to send the rest when only some questions failed on chain', async () => {
    setElection({ voting: false, voteStatus: { q1: 'confirmed', q2: 'failed', q3: 'confirmed' } })

    render(<VotingVoteModal />)

    expect(
      await screen.findByText('Some answers were not registered. Vote again to send the remaining ones.')
    ).toBeInTheDocument()
  })

  it('reports nothing when the vote settles cleanly', () => {
    setElection({ voting: false, voteStatus: { q1: 'confirmed', q2: 'confirmed', q3: 'confirmed' } })

    render(<VotingVoteModal />)

    expect(screen.queryByText('Your vote could not be cast')).not.toBeInTheDocument()
  })

  it('lets the voter dismiss the failure', async () => {
    const user = userEvent.setup()
    setElection({ voting: false, voteStatus: { q1: 'failed' } })

    render(<VotingVoteModal />)
    await user.click(await screen.findByRole('button', { name: 'Close' }))

    await waitFor(() => {
      expect(screen.queryByText('Your vote could not be cast')).not.toBeInTheDocument()
    })
  })
})

describe('SuccessVoteModal', () => {
  const setElection = (election: Record<string, unknown>, overrides: Record<string, unknown> = {}) =>
    setReactProvidersMock({
      useElection: () =>
        mockUseElection({
          election: { id: 'p1', questions: [{ id: 'q1' }], ...election },
          hasVoted: true,
          ...overrides,
        }),
    })

  // The dialog opens from an effect and renders through a portal, so every
  // assertion here waits for it rather than reading the first paint.
  it('warns that an anonymous receipt will not come back', async () => {
    setElection({ census: { anonymous: true } }, { voteId: '0xdeadbeef' })

    render(<SuccessVoteModal />)

    expect(await screen.findByText(/cannot show it to you again/)).toBeInTheDocument()
  })

  it('says nothing about anonymity on a private ballot', async () => {
    setElection({ census: {} }, { voteId: '0xdeadbeef' })

    render(<SuccessVoteModal />)

    expect(await screen.findByTestId('vote-success-modal')).toBeInTheDocument()
    expect(screen.queryByText(/cannot show it to you again/)).not.toBeInTheDocument()
  })

  it('does not offer a bare explorer link, nor a receipt to save, when there is no vote id', async () => {
    // An anonymous voter returning after a reload: the id was never recorded
    // server-side, so a link to the explorer root would answer nothing — and
    // there is no receipt on screen to tell them to save.
    setElection({ census: { anonymous: true } }, { voteId: null })

    render(<SuccessVoteModal />)

    expect(await screen.findByText(/cast successfully/)).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByText(/save this receipt now/)).not.toBeInTheDocument()
  })
})

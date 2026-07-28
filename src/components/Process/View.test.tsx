import userEvent from '@testing-library/user-event'
import { mockUseElection, render, screen, waitFor } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { ProcessInfoCard, VotingVoteModal } from './View'

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@vocdoni/react-components')
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return {
    ...actual,
    ...getReactProvidersMock(),
  }
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

  it('reports how many questions are confirmed while a multi-question vote lands', () => {
    // Each question is its own on-chain election, so they confirm one by one.
    setElection({ voting: true, voteStatus: { q1: 'confirmed', q2: 'confirming', q3: 'confirming' } })

    render(<VotingVoteModal />)

    expect(screen.getByText('1 of 3 questions confirmed')).toBeInTheDocument()
  })

  it('omits the count for a single-question process', () => {
    setElection({ voting: true, voteStatus: { q1: 'confirming' } }, 1)

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

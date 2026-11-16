import type { VotingProcessResponse } from '@vocdoni/api-types'
import { render, screen, TestMemoryRouter } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { VoteSummary } from './VoteSummary'

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return { ...actual, ...getReactProvidersMock() }
})
vi.mock('~queries/process-end-date', () => ({ useProcessEarlyEndDate: () => ({ data: null }) }))
vi.mock('./CensusSearch', () => ({ CensusSearch: () => <div>CensusSearch</div> }))

const question = (id: string, status: string, voteCount = 0) => ({
  id,
  title: { default: `Question ${id}` },
  choices: [
    { title: { default: 'Yes' }, value: 0 },
    { title: { default: 'No' }, value: 1 },
  ],
  ballotProtocol: { maxVoteOverwrites: 0, maxCount: 1, maxValue: 1 },
  type: 'singleChoice',
  secretUntilTheEnd: false,
  status,
  results: { voteCount },
})

const createProcess = (overrides: Record<string, unknown> = {}) =>
  ({
    id: '0xabc',
    orgAddress: '0xorg',
    title: { default: 'Board election' },
    startDate: '2026-01-01T10:00:00Z',
    endDate: '2099-01-02T10:00:00Z',
    published: true,
    census: { size: 312, anonymous: true, authFields: ['name'] },
    questions: [question('q1', 'ONGOING', 184)],
    ...overrides,
  }) as unknown as VotingProcessResponse

const renderSummary = (election: VotingProcessResponse, voteCount?: number) => {
  setReactProvidersMock({
    useElection: () => ({
      election,
      results: voteCount === undefined ? null : { questions: [{ questionId: 'q1', voteCount }] },
    }),
  })
  return render(
    <TestMemoryRouter>
      <VoteSummary />
    </TestMemoryRouter>
  )
}

describe('VoteSummary', () => {
  it('shows the turnout and how many voted', () => {
    renderSummary(createProcess(), 184)

    expect(screen.getByText('59')).toBeInTheDocument()
    expect(screen.getByText('184 of 312 voted')).toBeInTheDocument()
  })

  it('words the count for a question-by-question vote as a floor', () => {
    renderSummary(createProcess({ initialStatus: 'PAUSED' }), 229)

    expect(screen.getByText('At least 229 of 312 voted on a question')).toBeInTheDocument()
  })

  it('shows no figure without a census size', () => {
    renderSummary(createProcess({ census: {} }), 10)

    expect(screen.queryByText('%')).toBeNull()
    expect(screen.queryByText(/voted$/)).toBeNull()
  })

  it('lists the facts of the vote, with the anonymity mechanism as a tooltip', () => {
    renderSummary(createProcess(), 184)

    for (const label of [
      'Census',
      'Questions',
      'Closes',
      'Results',
      'Results type',
      'Voter anonymity',
      'Vote overwrite',
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
    expect(screen.getByText('312 people')).toBeInTheDocument()
    expect(screen.getByText('Anonymous').closest('[data-part="trigger"]')).not.toBeNull()
    expect(screen.getByText('Not enabled')).toBeInTheDocument()
  })

  it('names the read-only voting link field', () => {
    renderSummary(createProcess())

    expect(screen.getByLabelText('Voting Link')).toHaveAttribute('readonly')
  })

  it('shows each question of a question-by-question vote with its state', () => {
    renderSummary(
      createProcess({
        initialStatus: 'PAUSED',
        questions: [question('q1', 'ENDED', 200), question('q2', 'PAUSED')],
      }),
      200
    )

    expect(screen.getByText('Question q1')).toBeInTheDocument()
    expect(screen.getByText('Closed')).toBeInTheDocument()
    expect(screen.getByText('To open')).toBeInTheDocument()
  })

  it('renders the voter lookup when the census has a field to search by', () => {
    renderSummary(createProcess())

    expect(screen.getByText('CensusSearch')).toBeInTheDocument()
  })

  it('leaves the voter lookup out when the census has no such field', () => {
    renderSummary(createProcess({ census: { size: 312 } }))

    expect(screen.queryByText('CensusSearch')).toBeNull()
  })
})

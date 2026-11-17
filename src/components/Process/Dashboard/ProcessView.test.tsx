import type { QuestionStatus, VotingProcessResponse } from '@vocdoni/api-types'
import { render, screen, TestMemoryRouter } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { ProcessView } from './ProcessView'

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return { ...actual, ...getReactProvidersMock() }
})

vi.mock('~components/Actions', () => ({
  ActionsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

let currentElection: VotingProcessResponse
let remembered: string[] = []
// The provider's state, with the real derivation and this browser's pause memory.
vi.mock('~components/Actions/ActionsContext', async () => {
  const { deriveVoteState } = await import('~utils/vote-state')
  return { useActions: () => ({ state: deriveVoteState(currentElection, new Date(), new Set(remembered)) }) }
})

vi.mock('./VoteHeader', () => ({ VoteHeader: () => <div>VoteHeader</div> }))

const createProcess = (status: QuestionStatus, initialStatus?: 'PAUSED', canceled = false) =>
  ({
    id: '0xabc',
    orgAddress: '0xorg',
    title: { default: 'Test election' },
    startDate: '2026-01-01T10:00:00Z',
    endDate: '2099-01-02T10:00:00Z',
    published: true,
    initialStatus,
    census: {},
    questions: [{ id: 'q1', title: { default: 'Question' }, choices: [], status: canceled ? 'CANCELED' : status }],
  }) as unknown as VotingProcessResponse

const results = { questions: [{ voteCount: 184 }] }

const renderAt = (election: VotingProcessResponse, path = '/admin/process/0xabc') => {
  currentElection = election
  setReactProvidersMock({
    useElection: () => ({ id: election.id, election, status: election.questions[0].status, results }),
  })
  return render(
    <TestMemoryRouter initialEntries={[path]}>
      <ProcessView />
    </TestMemoryRouter>
  )
}

describe('ProcessView', () => {
  beforeEach(() => {
    remembered = []
  })

  it('offers Summary and Ballot for an all-at-once vote: the results are read on Summary', () => {
    renderAt(createProcess('ONGOING'))

    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['Summary', 'Ballot'])
  })

  it('adds Manage for a question-by-question vote', () => {
    renderAt(createProcess('PAUSED', 'PAUSED'))

    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['Summary', 'Manage', 'Ballot'])
  })

  it('has no Results tab for a closed vote either', () => {
    renderAt(createProcess('RESULTS'))

    expect(screen.queryByRole('tab', { name: 'Results' })).toBeNull()
  })

  it('selects the tab of the current route', () => {
    renderAt(createProcess('RESULTS'))
    expect(screen.getByRole('tab', { name: 'Summary' })).toHaveAttribute('aria-selected', 'true')
  })

  it('selects Ballot on its route', () => {
    renderAt(createProcess('ONGOING'), '/admin/process/0xabc/ballot')

    expect(screen.getByRole('tab', { name: 'Ballot' })).toHaveAttribute('aria-selected', 'true')
  })

  it('puts the pause banner under the tabs of a paused vote, on Summary', () => {
    const paused = createProcess('PAUSED')
    renderAt(paused)
    expect(screen.getByRole('status')).toHaveTextContent(
      'The vote is paused. Nobody can vote until you resume it. The 184 votes cast are kept and the deadline does not change.'
    )
  })

  it('leaves the banner out of the other tabs', () => {
    renderAt(createProcess('PAUSED'), '/admin/process/0xabc/ballot')

    expect(screen.queryByRole('status')).toBeNull()
  })

  it('shows the banner on Manage for a question-by-question vote paused as a whole', () => {
    remembered = ['q1']
    renderAt(createProcess('PAUSED', 'PAUSED'), '/admin/process/0xabc/manage')

    expect(screen.getByRole('status')).toHaveTextContent(
      'The vote is paused. Nobody can vote, and no question can be opened or closed until you resume it.'
    )
  })
})

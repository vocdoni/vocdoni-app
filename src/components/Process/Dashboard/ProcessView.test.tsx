import type { QuestionStatus, VotingProcessResponse } from '@vocdoni/api-types'
import { act, render, screen, TestMemoryRouter } from '~src/test-utils'
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

const RESULTS = { questions: [{ voteCount: 184 }] }

// The tabs' zag machine starts in a microtask after mount; render inside act so it settles in the test.
const renderAt = (
  election: VotingProcessResponse,
  path = '/admin/process/0xabc',
  results: { questions: { voteCount: number }[] } | null = RESULTS
) => {
  currentElection = election
  setReactProvidersMock({
    useElection: () => ({ id: election.id, election, status: election.questions[0].status, results }),
  })
  return act(async () =>
    render(
      <TestMemoryRouter initialEntries={[path]}>
        <ProcessView />
      </TestMemoryRouter>
    )
  )
}

describe('ProcessView', () => {
  beforeEach(() => {
    remembered = []
  })

  it('offers Manage and Ballot for an all-at-once vote: the results are read on Manage', async () => {
    await renderAt(createProcess('ONGOING'))

    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['Manage', 'Ballot'])
  })

  it('offers the same two tabs for a question-by-question vote, which is run from Manage', async () => {
    await renderAt(createProcess('PAUSED', 'PAUSED'))

    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['Manage', 'Ballot'])
  })

  it('has no Results tab for a closed vote either', async () => {
    await renderAt(createProcess('RESULTS'))

    expect(screen.queryByRole('tab', { name: 'Results' })).toBeNull()
  })

  it('selects the tab of the current route', async () => {
    await renderAt(createProcess('RESULTS'))
    expect(screen.getByRole('tab', { name: 'Manage' })).toHaveAttribute('aria-selected', 'true')
  })

  it('selects Ballot on its route', async () => {
    await renderAt(createProcess('ONGOING'), '/admin/process/0xabc/ballot')

    expect(screen.getByRole('tab', { name: 'Ballot' })).toHaveAttribute('aria-selected', 'true')
  })

  it('puts the pause banner under the tabs of a paused vote, on Manage', async () => {
    const paused = createProcess('PAUSED')
    await renderAt(paused)
    expect(screen.getByRole('status')).toHaveTextContent(
      'The vote is paused. Nobody can vote until it is resumed. The 184 votes cast are kept and the deadline does not change.'
    )
  })

  it('gives no vote count in the banner before the results are read, nor when nobody has voted', async () => {
    const paused = createProcess('PAUSED')
    const { unmount } = await renderAt(paused, undefined, null)
    expect(screen.getByRole('status')).toHaveTextContent(
      'The vote is paused. Nobody can vote until it is resumed. The deadline does not change.'
    )
    expect(screen.getByRole('status')).not.toHaveTextContent(/votes? cast/)
    unmount()

    await renderAt(paused, undefined, { questions: [{ voteCount: 0 }] })
    expect(screen.getByRole('status')).not.toHaveTextContent(/votes? cast/)
  })

  it('shows the pause banner on the Ballot tab too, not only on Manage', async () => {
    await renderAt(createProcess('PAUSED'), '/admin/process/0xabc/ballot')

    expect(screen.getByRole('status')).toHaveTextContent(
      'The vote is paused. Nobody can vote until it is resumed. The 184 votes cast are kept and the deadline does not change.'
    )
  })

  it('shows the banner on Manage for a question-by-question vote paused as a whole', async () => {
    remembered = ['q1']
    await renderAt(createProcess('PAUSED', 'PAUSED'))

    expect(screen.getByRole('status')).toHaveTextContent(
      'The vote is paused. Nobody can vote, and no question can be opened or closed until it is resumed. The votes cast are kept.'
    )
  })
})

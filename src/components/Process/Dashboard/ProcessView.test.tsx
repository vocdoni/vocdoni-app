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

const renderAt = (election: VotingProcessResponse, path = '/admin/process/0xabc') => {
  setReactProvidersMock({
    useElection: () => ({ id: election.id, election, status: election.questions[0].status, results: null }),
  })
  return render(
    <TestMemoryRouter initialEntries={[path]}>
      <ProcessView />
    </TestMemoryRouter>
  )
}

describe('ProcessView', () => {
  it('offers Summary, Ballot and Results for an all-at-once vote', () => {
    renderAt(createProcess('ONGOING'))

    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['Summary', 'Ballot', 'Results'])
  })

  it('adds Manage for a question-by-question vote', () => {
    renderAt(createProcess('PAUSED', 'PAUSED'))

    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['Summary', 'Manage', 'Ballot', 'Results'])
  })

  it('has no Results tab for a canceled vote', () => {
    renderAt(createProcess('ONGOING', undefined, true))

    expect(screen.queryByRole('tab', { name: 'Results' })).toBeNull()
  })

  it('selects the tab of the current route and never jumps to the results on its own', () => {
    renderAt(createProcess('RESULTS'))
    expect(screen.getByRole('tab', { name: 'Summary' })).toHaveAttribute('aria-selected', 'true')
  })

  it('selects Ballot on its route', () => {
    renderAt(createProcess('ONGOING'), '/admin/process/0xabc/ballot')

    expect(screen.getByRole('tab', { name: 'Ballot' })).toHaveAttribute('aria-selected', 'true')
  })
})

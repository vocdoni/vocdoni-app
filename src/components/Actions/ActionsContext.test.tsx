import type { VotingProcessWithMode } from '~src/types/voting-process'
import type { VotingProcessQuestion, VotingProcessResponse } from '@vocdoni/api-types'
import { QueryKeys } from '~queries/keys'
import { fireEvent, renderWithProviders, screen, waitFor } from '~src/test-utils'
import { resetReactProvidersMock, setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { ActionContinue, ActionEnd, ActionPause } from './ActionButtons'
import { ActionsProvider } from './ActionsContext'
import { CancelVoteDialog } from './CancelVoteDialog'

const client = {
  elections: { bulkSetQuestionStatus: vi.fn(), get: vi.fn() },
  jobs: { waitFor: vi.fn() },
}
let canManage = true

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return { ...actual, ...getReactProvidersMock() }
})
vi.mock('~src/providers/ApiClientProvider', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/providers/ApiClientProvider')>()),
  useApiClient: () => ({ client }),
}))
vi.mock('~components/Auth/useAuth', () => ({ useAuth: () => ({ currentAddress: '0xorg' }) }))
vi.mock('~queries/votes', () => ({ useCanManageVotes: () => canManage }))

const question = (id: string, status: VotingProcessQuestion['status'], voteCount?: number) =>
  ({ id, status, results: voteCount === undefined ? undefined : { voteCount } }) as VotingProcessQuestion

const election = (overrides: Partial<VotingProcessWithMode> = {}) =>
  ({
    id: 'p1',
    orgAddress: '0xorg',
    published: true,
    startDate: '2020-01-01T00:00:00Z',
    endDate: '2999-01-01T00:00:00Z',
    title: { default: 'A vote' },
    initialStatus: 'PAUSED',
    questions: [question('q0', 'RESULTS'), question('q1', 'ONGOING'), question('q2', 'PAUSED', 0)],
    ...overrides,
  }) as unknown as VotingProcessResponse

const mockElection = (process: VotingProcessResponse, status: string, results: unknown) =>
  setReactProvidersMock({ useElection: () => ({ election: process, status, results, loading: {}, errors: {} }) })

const show = (process: VotingProcessResponse, status = 'ONGOING', results: unknown = null) => {
  mockElection(process, status, results)
  return renderWithProviders(
    <ActionsProvider>
      <ActionContinue />
      <ActionPause />
      <ActionEnd />
    </ActionsProvider>
  )
}

const showCancel = (process: VotingProcessResponse, results: unknown = null) => {
  mockElection(process, 'ONGOING', results)
  return renderWithProviders(
    <ActionsProvider>
      <CancelVoteDialog open onClose={vi.fn()} />
    </ActionsProvider>
  )
}

const button = (key: string) => screen.queryByRole('button', { name: new RegExp(key) })

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  canManage = true
  client.elections.bulkSetQuestionStatus.mockResolvedValue({ jobId: 'job-1' })
  client.jobs.waitFor.mockResolvedValue({})
  client.elections.get.mockResolvedValue(election())
})
afterEach(() => resetReactProvidersMock())

describe('header actions', () => {
  it('ends only the questions that are not terminal, and refreshes the votes list', async () => {
    const { queryClient } = show(election())
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    fireEvent.click(button('actions.end')!)
    fireEvent.click(await screen.findByRole('button', { name: 'End the vote' }))

    await waitFor(() =>
      expect(client.elections.bulkSetQuestionStatus).toHaveBeenCalledWith('p1', {
        status: 'ended',
        questions: [{ id: 'q1' }, { id: 'q2' }],
      })
    )
    await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: QueryKeys.organization.votesAll }))
  })

  it('names the questions ending closes and the ones never opened, with a primary confirm', async () => {
    show(election())

    fireEvent.click(button('actions.end')!)

    expect(
      await screen.findByText(
        'Question 2 will close with the 0 votes it has now. The results will be final, and the voters will see them.'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('Question 3 has not been opened and will stay without votes.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue the vote' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'End the vote' })).toHaveAttribute('data-tone', 'primary')
  })

  it('lists several open questions together', async () => {
    show(election({ questions: [question('q1', 'ONGOING', 4), question('q2', 'PAUSED', 2)] }))

    fireEvent.click(button('actions.end')!)

    expect(
      await screen.findByText(
        'Questions 1 and 2 will close with the votes they have now. The results will be final, and the voters will see them.'
      )
    ).toBeInTheDocument()
  })

  it('says how many votes an all-at-once vote ends with and who is left without voting', async () => {
    show(
      election({ initialStatus: undefined, census: { size: 10 }, questions: [question('q1', 'ONGOING')] } as never),
      'ONGOING',
      { questions: [{ voteCount: 4 }] }
    )

    fireEvent.click(button('actions.end')!)

    expect(
      await screen.findByText(
        'It will close before the deadline, with the 4 votes cast. The results will be published and the voters will see them. It cannot be reopened.'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('6 people have not voted yet and will no longer be able to.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'End now' })).toHaveAttribute('data-tone', 'primary')
  })

  it('pauses a question-by-question vote as a whole: every open question', async () => {
    show(election())

    fireEvent.click(button('actions.pause')!)

    await waitFor(() =>
      expect(client.elections.bulkSetQuestionStatus).toHaveBeenCalledWith('p1', {
        status: 'paused',
        questions: [{ id: 'q1' }],
      })
    )
  })

  it('pauses and resumes an all-at-once vote through every question that can change', async () => {
    show(election({ initialStatus: undefined, questions: [question('q1', 'ONGOING'), question('q2', 'ONGOING')] }))

    fireEvent.click(button('actions.pause')!)

    await waitFor(() =>
      expect(client.elections.bulkSetQuestionStatus).toHaveBeenCalledWith('p1', {
        status: 'paused',
        questions: [{ id: 'q1' }, { id: 'q2' }],
      })
    )
  })

  it('disables ending when every question is already closed', () => {
    show(election({ initialStatus: undefined, questions: [question('q0', 'ENDED'), question('q1', 'ENDED')] }), 'ENDED')

    expect(button('actions.end')).toBeDisabled()
  })

  it('shows no button to someone who cannot manage votes', () => {
    canManage = false
    show(election({ initialStatus: undefined }))

    expect(button('actions.end')).toBeNull()
    expect(button('actions.pause')).toBeNull()
    expect(button('actions.continue')).toBeNull()
  })
})

describe('cancel dialog', () => {
  it('says how many votes are discarded and which questions are open, with the danger outline', async () => {
    showCancel(
      election({ questions: [question('q0', 'ENDED', 5), question('q1', 'ONGOING', 3), question('q2', 'PAUSED', 0)] })
    )

    expect(
      await screen.findByText(
        'The 8 votes cast in 2 questions will be discarded and no result will take effect. It cannot be undone.'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('Question 2 is open right now.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Cancel “A vote”?' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'No, continue the vote' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel the vote' })).toHaveAttribute('data-tone', 'danger')
  })

  it('says no vote was cast yet, and cancels every question that can change', async () => {
    showCancel(election({ questions: [question('q1', 'PAUSED', 0), question('q2', 'PAUSED', 0)] }))

    expect(await screen.findByText('No vote has been cast yet. It cannot be undone.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel the vote' }))

    await waitFor(() =>
      expect(client.elections.bulkSetQuestionStatus).toHaveBeenCalledWith('p1', {
        status: 'canceled',
        questions: [{ id: 'q1' }, { id: 'q2' }],
      })
    )
  })

  it('says a ready all-at-once vote has not opened', async () => {
    showCancel(
      election({ initialStatus: undefined, startDate: '2999-01-01T00:00:00Z', questions: [question('q1', 'PAUSED')] })
    )

    expect(
      await screen.findByText('It has not opened yet and there are no votes. It cannot be undone.')
    ).toBeInTheDocument()
  })
})

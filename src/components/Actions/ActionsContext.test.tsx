import type { VotingProcessWithMode } from '~src/types/voting-process'
import type { VotingProcessQuestion, VotingProcessResponse } from '@vocdoni/api-types'
import { QueryKeys } from '~queries/keys'
import { fireEvent, renderWithProviders, screen, waitFor } from '~src/test-utils'
import { resetReactProvidersMock, setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { ActionCancel, ActionContinue, ActionEnd, ActionPause } from './ActionButtons'
import { ActionsProvider } from './ActionsContext'

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

const show = (process: VotingProcessResponse, status = 'ONGOING') => {
  setReactProvidersMock({ useElection: () => ({ election: process, status, loading: {}, errors: {} }) })
  return renderWithProviders(
    <ActionsProvider>
      <ActionContinue />
      <ActionPause />
      <ActionEnd />
      <ActionCancel />
    </ActionsProvider>
  )
}

const button = (key: string) => screen.queryByRole('button', { name: new RegExp(key) })

beforeEach(() => {
  vi.clearAllMocks()
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
    fireEvent.click(await screen.findByText('confirm.end_process_button'))

    await waitFor(() =>
      expect(client.elections.bulkSetQuestionStatus).toHaveBeenCalledWith('p1', {
        status: 'ended',
        questions: [{ id: 'q1' }, { id: 'q2' }],
      })
    )
    await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: QueryKeys.organization.votesAll }))
  })

  it('says how many questions close and how many were never opened', async () => {
    show(election())

    fireEvent.click(button('actions.end')!)

    expect(
      await screen.findByText(
        '2 questions will close and their results become final. 1 of them was never opened and stays without votes.'
      )
    ).toBeInTheDocument()
  })

  it('leaves pausing and resuming to Gestió on a question-by-question vote', () => {
    show(election())

    expect(button('actions.pause')).toBeNull()
    expect(button('actions.continue')).toBeNull()
  })

  it('disables ending when every question is already closed', () => {
    show(election({ initialStatus: undefined, questions: [question('q0', 'ENDED'), question('q1', 'ENDED')] }), 'ENDED')

    expect(button('actions.end')).toBeDisabled()
  })

  it('cannot void a vote once a question closed with a result', () => {
    show(election())

    expect(button('actions.cancel')).toBeDisabled()
  })

  it('shows no button to someone who cannot manage votes', () => {
    canManage = false
    show(election({ initialStatus: undefined }))

    expect(button('actions.end')).toBeNull()
    expect(button('actions.cancel')).toBeNull()
    expect(button('actions.pause')).toBeNull()
    expect(button('actions.continue')).toBeNull()
  })
})

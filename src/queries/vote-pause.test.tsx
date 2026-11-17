import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { VocdoniApiError } from '@vocdoni/api-client'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import type { ReactNode } from 'react'
import { QueryKeys } from './keys'
import { useVotePause } from './vote-pause'

const client = {
  elections: { bulkSetQuestionStatus: vi.fn(), get: vi.fn() },
  jobs: { waitFor: vi.fn() },
}
const toast = vi.fn()

vi.mock('~src/providers/ApiClientProvider', () => ({ useApiClient: () => ({ client }) }))
vi.mock('~components/Toast', () => ({ useToast: () => toast }))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key }),
}))

const STORAGE_KEY = 'votes.pause.held.p1'

type Status = 'ONGOING' | 'PAUSED' | 'ENDED'

/** A question-by-question vote (unless `allAtOnce`) whose questions have these statuses and vote counts. */
const vote = (questions: [string, Status, number?][], allAtOnce = false) =>
  ({
    id: 'p1',
    published: true,
    initialStatus: allAtOnce ? undefined : 'PAUSED',
    startDate: '2020-01-01T00:00:00Z',
    endDate: '2999-01-01T00:00:00Z',
    questions: questions.map(([id, status, voteCount = 0]) => ({ id, status, results: { voteCount } })),
  }) as unknown as VotingProcessResponse

const setup = (initial: VotingProcessResponse) => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false }, queries: { retry: false } } })
  queryClient.setQueryData(QueryKeys.election.process('p1'), initial)
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  // Reads the process where the ElectionProvider does, so a re-read reaches the hook as it does on the page.
  const useVote = () =>
    useQuery<VotingProcessResponse>({ queryKey: QueryKeys.election.process('p1'), enabled: false }).data
  const hook = renderHook(() => ({ header: useVotePause(useVote()), other: useVotePause(useVote()) }), { wrapper })
  return { queryClient, ...hook }
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  client.elections.bulkSetQuestionStatus.mockResolvedValue({ jobId: 'job-1' })
  client.jobs.waitFor.mockResolvedValue({ status: 'completed' })
})

describe('useVotePause', () => {
  it('pauses every open question, waits for the job and holds them on every screen', async () => {
    client.elections.get.mockResolvedValue(
      vote([
        ['q1', 'ENDED', 9],
        ['q2', 'PAUSED', 3],
        ['q3', 'PAUSED'],
        ['q4', 'PAUSED'],
      ])
    )
    const { result, queryClient } = setup(
      vote([
        ['q1', 'ENDED', 9],
        ['q2', 'ONGOING', 3],
        ['q3', 'ONGOING'],
        ['q4', 'PAUSED'],
      ])
    )
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    expect(result.current.header.isHeld).toBe(false)

    await act(() => result.current.header.pause())

    expect(client.elections.bulkSetQuestionStatus).toHaveBeenCalledWith('p1', {
      status: 'paused',
      questions: [{ id: 'q2' }, { id: 'q3' }],
    })
    expect(client.jobs.waitFor).toHaveBeenCalledWith('job-1', { timeoutMs: 120_000 })
    await waitFor(() => expect(result.current.other.isHeld).toBe(true))
    expect(result.current.other.heldQuestionIds).toEqual(['q2', 'q3'])
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual(['q2', 'q3'])
    expect(invalidate).toHaveBeenCalledWith({ queryKey: QueryKeys.election.results('p1') })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: QueryKeys.organization.votesAll })
  })

  it('resumes only the questions the pause held, then forgets them', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['q2', 'q3']))
    client.elections.get.mockResolvedValue(
      vote([
        ['q2', 'ONGOING', 3],
        ['q3', 'ONGOING'],
        ['q4', 'PAUSED'],
      ])
    )
    const { result } = setup(
      vote([
        ['q2', 'PAUSED', 3],
        ['q3', 'PAUSED'],
        ['q4', 'PAUSED'],
      ])
    )
    expect(result.current.header.isHeld).toBe(true)

    await act(() => result.current.header.resume())

    expect(client.elections.bulkSetQuestionStatus).toHaveBeenCalledWith('p1', {
      status: 'ready',
      questions: [{ id: 'q2' }, { id: 'q3' }],
    })
    await waitFor(() => expect(localStorage.getItem(STORAGE_KEY)).toBeNull())
    expect(result.current.header.isHeld).toBe(false)
  })

  it('resumes every paused question that has votes when this browser holds nothing', async () => {
    client.elections.get.mockResolvedValue(vote([]))
    const { result } = setup(
      vote([
        ['q1', 'PAUSED', 3],
        ['q2', 'PAUSED'],
      ])
    )
    expect(result.current.header.isHeld).toBe(false)

    await act(() => result.current.header.resume())

    expect(client.elections.bulkSetQuestionStatus).toHaveBeenCalledWith('p1', {
      status: 'ready',
      questions: [{ id: 'q1' }],
    })
  })

  it('forgets the pause once a held question is no longer paused', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['q1', 'q2']))
    const { result } = setup(
      vote([
        ['q1', 'ONGOING', 3],
        ['q2', 'PAUSED', 1],
      ])
    )

    expect(result.current.header.isHeld).toBe(false)
    await waitFor(() => expect(localStorage.getItem(STORAGE_KEY)).toBeNull())
  })

  it('never holds an all-at-once vote', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['q1']))
    const { result } = setup(vote([['q1', 'PAUSED', 3]], true))

    expect(result.current.header.isHeld).toBe(false)
  })

  it('shows the pause as running on every screen', async () => {
    let finish: () => void = () => undefined
    client.jobs.waitFor.mockReturnValue(new Promise<void>((resolve) => (finish = resolve)))
    client.elections.get.mockResolvedValue(vote([['q1', 'PAUSED', 3]]))
    const { result } = setup(vote([['q1', 'ONGOING', 3]]))

    act(() => {
      void result.current.header.pause()
    })

    await waitFor(() => expect(result.current.other.isPending).toBe(true))
    await act(async () => finish())
    await waitFor(() => expect(result.current.other.isPending).toBe(false))
  })

  it('says why a pause failed, re-reads the process and holds nothing', async () => {
    client.elections.bulkSetQuestionStatus.mockRejectedValue(new VocdoniApiError(503, {}, 'busy', 50303))
    client.elections.get.mockResolvedValue(vote([['q1', 'ONGOING', 3]]))
    const { result } = setup(vote([['q1', 'ONGOING', 3]]))

    await act(() => result.current.header.pause())

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'The vote could not be paused',
        description: 'Another change is under way. Try again in a few seconds.',
      })
    )
    await waitFor(() => expect(client.elections.get).toHaveBeenCalledWith('p1'))
    expect(result.current.header.isHeld).toBe(false)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})

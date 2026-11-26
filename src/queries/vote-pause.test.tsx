import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { VocdoniApiError } from '@vocdoni/api-client'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import type { ReactNode } from 'react'
import { QueryKeys } from './keys'
import { useVotePause } from './vote-pause'

const client = {
  elections: { bulkSetQuestionStatus: vi.fn(), setQuestionStatus: vi.fn(), get: vi.fn() },
  jobs: { waitFor: vi.fn() },
}
const toast = vi.fn()

vi.mock('~src/providers/ApiClientProvider', () => ({ useApiClient: () => ({ client }) }))
vi.mock('~components/Toast', () => ({ useToast: () => toast }))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key }),
}))

const STORAGE_KEY = 'votes.pause.held.p1'
const NOW = new Date('2026-06-15T12:00:00Z')
const timeout = () => new Error('Timed out waiting for job job-1 after 120000ms')

type Status = 'ONGOING' | 'PAUSED' | 'ENDED'

/** A question-by-question vote (unless `allAtOnce`) whose questions have these statuses and vote counts. */
const vote = (questions: [string, Status, number?][], allAtOnce = false) =>
  ({
    id: 'p1',
    published: true,
    initialStatus: allAtOnce ? undefined : 'PAUSED',
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2999-01-01T00:00:00Z',
    questions: questions.map(([id, status, voteCount = 0]) => ({ id, status, results: { voteCount } })),
  }) as unknown as VotingProcessResponse

const remembered = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')

/** One browser tab: its own query cache, the process read where the ElectionProvider reads it. */
const tab = (initial: VotingProcessResponse) => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false }, queries: { retry: false } } })
  queryClient.setQueryData(QueryKeys.election.process('p1'), initial)
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const useVote = () =>
    useQuery<VotingProcessResponse>({ queryKey: QueryKeys.election.process('p1'), enabled: false }).data
  const hook = renderHook(() => useVotePause(useVote(), NOW), { wrapper })
  return { queryClient, ...hook }
}

/** What another tab writing the memory looks like to this one. */
const storageEventFromAnotherTab = () =>
  act(() => {
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }))
  })

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  client.elections.bulkSetQuestionStatus.mockResolvedValue({ jobId: 'job-1' })
  client.jobs.waitFor.mockResolvedValue({ status: 'completed' })
})

describe('useVotePause', () => {
  it('pauses every open question and holds them, those with no votes too', async () => {
    client.elections.get.mockResolvedValue(
      vote([
        ['q1', 'ENDED', 9],
        ['q2', 'PAUSED', 3],
        ['q3', 'PAUSED'],
        ['q4', 'PAUSED'],
      ])
    )
    const { result } = tab(
      vote([
        ['q1', 'ENDED', 9],
        ['q2', 'ONGOING', 3],
        ['q3', 'ONGOING'],
        ['q4', 'PAUSED'],
      ])
    )
    expect(result.current.isHeld).toBe(false)

    await act(() => result.current.pause())

    expect(client.elections.bulkSetQuestionStatus).toHaveBeenCalledWith('p1', {
      status: 'paused',
      questions: [{ id: 'q2' }, { id: 'q3' }],
    })
    await waitFor(() => expect(result.current.isHeld).toBe(true))
    expect(result.current.heldQuestionIds).toEqual(['q2', 'q3'])
    expect(remembered()).toEqual(['q2', 'q3'])
  })

  it('resumes only the questions the pause held, then forgets them', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['q2', 'q3']))
    client.elections.get.mockResolvedValue(
      vote([
        ['q2', 'ONGOING', 3],
        ['q3', 'ONGOING'],
        ['q4', 'PAUSED', 2],
      ])
    )
    const { result } = tab(
      vote([
        ['q2', 'PAUSED', 3],
        ['q3', 'PAUSED'],
        ['q4', 'PAUSED', 2],
      ])
    )
    expect(result.current.isHeld).toBe(true)

    await act(() => result.current.resume())

    expect(client.elections.bulkSetQuestionStatus).toHaveBeenCalledWith('p1', {
      status: 'ready',
      questions: [{ id: 'q2' }, { id: 'q3' }],
    })
    await waitFor(() => expect(localStorage.getItem(STORAGE_KEY)).toBeNull())
    expect(result.current.isHeld).toBe(false)
  })

  it.each([
    ['is refused because another change runs', () => new VocdoniApiError(503, {}, 'busy', 50303)],
    ['times out', timeout],
  ])('keeps the pause and its memory when a resume %s', async (_case, error) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['q2']))
    const held = vote([
      ['q1', 'ENDED', 9],
      ['q2', 'PAUSED'],
    ])
    client.jobs.waitFor.mockRejectedValue(error())
    client.elections.get.mockResolvedValue(held)
    const { result } = tab(held)

    await act(() => result.current.resume())

    expect(remembered()).toEqual(['q2'])
    expect(result.current.isHeld).toBe(true)
    expect(result.current.heldQuestionIds).toEqual(['q2'])
  })

  it('remembers a pause that timed out, so it reads paused when it lands', async () => {
    client.jobs.waitFor.mockRejectedValue(timeout())
    client.elections.get.mockResolvedValue(vote([['q1', 'ONGOING']]))
    const { result, queryClient } = tab(vote([['q1', 'ONGOING']]))

    await act(() => result.current.pause())
    expect(result.current.isHeld).toBe(false)
    await act(async () => queryClient.setQueryData(QueryKeys.election.process('p1'), vote([['q1', 'PAUSED']])))

    await waitFor(() => expect(result.current.isHeld).toBe(true))
    expect(result.current.heldQuestionIds).toEqual(['q1'])
  })

  it('adds a second pause to the first instead of replacing it', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['q1']))
    client.elections.get.mockResolvedValue(
      vote([
        ['q1', 'PAUSED'],
        ['q2', 'PAUSED'],
      ])
    )
    const { result } = tab(
      vote([
        ['q1', 'PAUSED'],
        ['q2', 'ONGOING'],
      ])
    )

    await act(() => result.current.pause())

    await waitFor(() => expect(result.current.heldQuestionIds).toEqual(['q1', 'q2']))
    expect(remembered()).toEqual(['q1', 'q2'])
  })

  it('on another device, holds and resumes every paused question that has votes', async () => {
    client.elections.get.mockResolvedValue(
      vote([
        ['q1', 'ONGOING', 3],
        ['q2', 'PAUSED'],
      ])
    )
    const { result } = tab(
      vote([
        ['q1', 'PAUSED', 3],
        ['q2', 'PAUSED'],
      ])
    )
    expect(result.current.isHeld).toBe(true)
    expect(result.current.heldQuestionIds).toEqual(['q1'])

    await act(() => result.current.resume())

    expect(client.elections.bulkSetQuestionStatus).toHaveBeenCalledWith('p1', {
      status: 'ready',
      questions: [{ id: 'q1' }],
    })
  })

  it('never lets a tab with an older read wipe the pause another tab made', async () => {
    // Tab B still reads the questions open, from before tab A paused them.
    const { result } = tab(
      vote([
        ['q1', 'ONGOING'],
        ['q2', 'ONGOING'],
      ])
    )
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['q1', 'q2']))
    await storageEventFromAnotherTab()

    expect(remembered()).toEqual(['q1', 'q2'])
    expect(result.current.isHeld).toBe(false)
  })

  it('picks up the pause another tab made once its own read catches up', async () => {
    const { result, queryClient } = tab(vote([['q1', 'ONGOING']]))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['q1']))
    await storageEventFromAnotherTab()

    await act(async () => queryClient.setQueryData(QueryKeys.election.process('p1'), vote([['q1', 'PAUSED']])))

    await waitFor(() => expect(result.current.isHeld).toBe(true))
  })

  it('forgets a held question once it is over, which no read can undo', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['q1', 'q2']))
    tab(
      vote([
        ['q1', 'ENDED', 3],
        ['q2', 'PAUSED'],
      ])
    )

    await waitFor(() => expect(remembered()).toEqual(['q2']))
  })

  it('never holds an all-at-once vote', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['q1']))
    const { result } = tab(vote([['q1', 'PAUSED', 3]], true))

    expect(result.current.isHeld).toBe(false)
  })

  it('shows the pause as running until its job lands', async () => {
    let finish: (value: unknown) => void = () => undefined
    client.jobs.waitFor.mockReturnValue(new Promise((resolve) => (finish = resolve)))
    client.elections.get.mockResolvedValue(vote([['q1', 'PAUSED', 3]]))
    const { result } = tab(vote([['q1', 'ONGOING', 3]]))

    act(() => {
      void result.current.pause()
    })

    await waitFor(() => expect(result.current.isPending).toBe(true))
    await act(async () => finish({ status: 'completed' }))
    await waitFor(() => expect(result.current.isPending).toBe(false))
  })
})

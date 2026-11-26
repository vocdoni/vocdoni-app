import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { VocdoniApiError } from '@vocdoni/api-client'
import type { ReactNode } from 'react'
import { QueryKeys } from './keys'
import { useQuestionStatusAction } from './question-status'

const client = {
  elections: { setQuestionStatus: vi.fn(), bulkSetQuestionStatus: vi.fn(), get: vi.fn() },
  jobs: { waitFor: vi.fn() },
}
const toast = vi.fn()

vi.mock('~src/providers/ApiClientProvider', () => ({ useApiClient: () => ({ client }) }))
vi.mock('~components/Toast', () => ({ useToast: () => toast }))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key }),
}))

const refreshed = { id: 'p1', questions: [] }

const setup = () => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false }, queries: { retry: false } } })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const hook = renderHook(() => ({ row: useQuestionStatusAction('p1'), other: useQuestionStatusAction('p1') }), {
    wrapper,
  })
  return { queryClient, ...hook }
}

beforeEach(() => {
  vi.clearAllMocks()
  client.elections.get.mockResolvedValue(refreshed)
  client.elections.setQuestionStatus.mockResolvedValue({ jobId: 'job-1' })
  client.elections.bulkSetQuestionStatus.mockResolvedValue({ jobId: 'job-1' })
})

describe('useQuestionStatusAction', () => {
  it('changes one question, waits for its job and writes the re-read process where the page reads it', async () => {
    client.jobs.waitFor.mockResolvedValue({ status: 'completed' })
    const { result, queryClient } = setup()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    await act(() => result.current.row.change({ questionId: 'q1', status: 'ready' }))

    expect(client.elections.setQuestionStatus).toHaveBeenCalledWith('p1', 'q1', 'ready')
    expect(client.jobs.waitFor).toHaveBeenCalledWith('job-1', { timeoutMs: 120_000 })
    await waitFor(() => expect(queryClient.getQueryData(QueryKeys.election.process('p1'))).toEqual(refreshed))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: QueryKeys.election.results('p1') })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: QueryKeys.organization.votesAll })
    expect(toast).not.toHaveBeenCalled()
  })

  it('opens a question while others are open: several questions can be open at once', async () => {
    client.jobs.waitFor.mockResolvedValue({ status: 'completed' })
    const { result, queryClient } = setup()
    queryClient.setQueryData(QueryKeys.election.process('p1'), {
      id: 'p1',
      published: true,
      initialStatus: 'PAUSED',
      startDate: '2026-01-01T00:00:00Z',
      endDate: '2099-01-01T00:00:00Z',
      questions: [
        { id: 'q1', status: 'ONGOING', results: { voteCount: 3 } },
        { id: 'q2', status: 'PAUSED' },
      ],
    })

    await act(() => result.current.row.change({ questionId: 'q2', status: 'ready' }))

    expect(client.elections.setQuestionStatus).toHaveBeenCalledWith('p1', 'q2', 'ready')
  })

  it('opens every waiting question in one batch job, and shows the batch as pending', async () => {
    let finish: () => void = () => undefined
    client.jobs.waitFor.mockReturnValue(new Promise<void>((resolve) => (finish = resolve)))
    const { result } = setup()

    act(() => {
      void result.current.row.openAll(['q2', 'q3'])
    })

    await waitFor(() => expect(result.current.row.openingAll).toBe(true))
    expect(result.current.other.openingAll).toBe(false)
    expect(result.current.other.isBusy).toBe(true)
    expect(client.elections.bulkSetQuestionStatus).toHaveBeenCalledTimes(1)
    expect(client.elections.bulkSetQuestionStatus).toHaveBeenCalledWith('p1', {
      status: 'ready',
      questions: [{ id: 'q2' }, { id: 'q3' }],
    })
    expect(client.elections.setQuestionStatus).not.toHaveBeenCalled()
    expect(result.current.row.pending).toBeUndefined()
    await act(async () => finish())
    await waitFor(() => expect(result.current.row.openingAll).toBe(false))
  })

  it('refuses to open all while the whole vote is paused, without calling the backend', async () => {
    const { result, queryClient } = setup()
    queryClient.setQueryData(QueryKeys.election.process('p1'), {
      id: 'p1',
      published: true,
      initialStatus: 'PAUSED',
      startDate: '2026-01-01T00:00:00Z',
      endDate: '2099-01-01T00:00:00Z',
      questions: [
        { id: 'q1', status: 'PAUSED', results: { voteCount: 3 } },
        { id: 'q2', status: 'PAUSED' },
      ],
    })

    let outcome: unknown
    await act(async () => {
      outcome = await result.current.row.openAll(['q2'])
    })

    expect(outcome).toEqual({ ok: false })
    expect(client.elections.bulkSetQuestionStatus).not.toHaveBeenCalled()
    expect(client.elections.setQuestionStatus).not.toHaveBeenCalled()
  })

  it('marks every instance busy while one change runs, and only the clicked one as pending', async () => {
    let finish: () => void = () => undefined
    client.jobs.waitFor.mockReturnValue(new Promise<void>((resolve) => (finish = resolve)))
    const { result } = setup()

    act(() => {
      void result.current.row.change({ questionId: 'q2', status: 'ended' })
    })

    await waitFor(() => expect(result.current.other.isBusy).toBe(true))
    expect(result.current.row.pending).toEqual({ questionId: 'q2', status: 'ended' })
    expect(result.current.other.pending).toBeUndefined()
    await act(async () => finish())
    await waitFor(() => expect(result.current.other.isBusy).toBe(false))
  })

  it("tells a failure in the question's words, never the backend text, and still re-reads the process", async () => {
    client.jobs.waitFor.mockRejectedValue(
      new VocdoniApiError(400, {}, 'question q1 is ENDED and cannot change to ready', 40004)
    )
    const { result, queryClient } = setup()

    await act(() => result.current.row.change({ questionId: 'q1', status: 'ready' }))

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'The question could not change',
        description: 'The question had already changed state.',
      })
    )
    await waitFor(() => expect(queryClient.getQueryData(QueryKeys.election.process('p1'))).toEqual(refreshed))
    expect(result.current.row.pending).toBeUndefined()
  })
})

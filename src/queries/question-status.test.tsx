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

  it('refuses to open a question while another one is open, without calling the backend (R29)', async () => {
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

    let outcome: unknown
    await act(async () => {
      outcome = await result.current.row.change({ questionId: 'q2', status: 'ready' })
    })

    expect(outcome).toEqual({ ok: false })
    expect(client.elections.setQuestionStatus).not.toHaveBeenCalled()
    // Closing the open question still goes through.
    client.jobs.waitFor.mockResolvedValue({ status: 'completed' })
    await act(() => result.current.row.change({ questionId: 'q1', status: 'ended' }))
    expect(client.elections.setQuestionStatus).toHaveBeenCalledWith('p1', 'q1', 'ended')
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

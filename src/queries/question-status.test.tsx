import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { JobFailedError, VocdoniApiError } from '@vocdoni/api-client'
import type { ReactNode } from 'react'
import { QueryKeys } from './keys'
import { questionStatusErrorKind, useQuestionStatusAction } from './question-status'

const client = {
  elections: { setQuestionStatus: vi.fn(), get: vi.fn() },
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

  const failedJob = new JobFailedError({ jobId: 'job-1', status: 'failed' } as never)

  it.each([
    [
      'another change holds the lock (503)',
      new VocdoniApiError(503, {}, 'busy', 50303),
      'Another change is under way. Try again in a few seconds.',
    ],
    [
      'the question changed meanwhile (400)',
      new VocdoniApiError(400, {}, 'question q1 is ENDED and cannot change to ready'),
      'The question had already changed state.',
    ],
    [
      'the job outlived the wait',
      new Error('Timed out waiting for job job-1 after 120000ms'),
      'This is taking longer than expected. The state will update on its own.',
    ],
    ['the job failed', failedJob, failedJob.message],
  ])('when %s it says so in its own words and still re-reads the process', async (_case, error, description) => {
    client.jobs.waitFor.mockRejectedValue(error)
    const { result, queryClient } = setup()

    await act(() => result.current.row.change({ questionId: 'q1', status: 'ready' }))

    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ description }))
    await waitFor(() => expect(queryClient.getQueryData(QueryKeys.election.process('p1'))).toEqual(refreshed))
    expect(client.elections.get).toHaveBeenCalledWith('p1')
  })

  it('never shows the backend text of a 503 or a 400', () => {
    expect(questionStatusErrorKind(new VocdoniApiError(503, {}, 'raw'))).toBe('busy')
    expect(questionStatusErrorKind(new VocdoniApiError(400, {}, 'raw'))).toBe('stale')
    expect(questionStatusErrorKind(new Error('boom'))).toBe('other')
  })
})

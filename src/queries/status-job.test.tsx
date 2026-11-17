import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { JobFailedError, VocdoniApiError } from '@vocdoni/api-client'
import type { ReactNode } from 'react'
import { QueryKeys } from './keys'
import { statusJobErrorKind, useIsStatusJobRunning, useStatusJob } from './status-job'

const client = {
  elections: { setQuestionStatus: vi.fn(), bulkSetQuestionStatus: vi.fn(), get: vi.fn() },
  jobs: { waitFor: vi.fn() },
}
const toast = vi.fn()

vi.mock('~src/providers/ApiClientProvider', () => ({ useApiClient: () => ({ client }) }))
vi.mock('~components/Toast', () => ({ useToast: () => toast }))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string } & Record<string, unknown>) =>
      (options?.defaultValue ?? key).replace(/{{(\w+)(?:, \w+)?}}/g, (_m, name: string) =>
        String(options?.[name] ?? '')
      ),
  }),
}))

const stale = { id: 'p1', questions: [{ id: 'q1', status: 'ONGOING' }] }
const refreshed = { id: 'p1', questions: [{ id: 'q1', status: 'PAUSED' }] }
const timeout = () => new Error('Timed out waiting for job job-1 after 120000ms')
const RAW = 'raw backend text'

const setup = () => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false }, queries: { retry: false } } })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const hook = renderHook(() => ({ job: useStatusJob('p1'), running: useIsStatusJobRunning('p1') }), { wrapper })
  return { queryClient, ...hook }
}

const pause = {
  questionIds: ['q1'],
  status: 'paused' as const,
  tag: 'pause',
  errorTitle: 'The vote could not be paused',
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  client.elections.get.mockResolvedValue(refreshed)
  client.elections.bulkSetQuestionStatus.mockResolvedValue({ jobId: 'job-1' })
  client.elections.setQuestionStatus.mockResolvedValue({ jobId: 'job-1' })
  client.jobs.waitFor.mockResolvedValue({ status: 'completed' })
})

describe('useStatusJob', () => {
  it('sends one question or a batch, waits for the job and writes the re-read where the page reads it', async () => {
    const { result, queryClient } = setup()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    const outcome = await act(() => result.current.job.run(pause))
    await act(() => result.current.job.run({ questionId: 'q1', status: 'ended', tag: 'question', errorTitle: 'x' }))

    expect(outcome).toEqual({ ok: true })
    expect(client.elections.bulkSetQuestionStatus).toHaveBeenCalledWith('p1', {
      status: 'paused',
      questions: [{ id: 'q1' }],
    })
    expect(client.elections.setQuestionStatus).toHaveBeenCalledWith('p1', 'q1', 'ended')
    expect(client.jobs.waitFor).toHaveBeenCalledWith('job-1', { timeoutMs: 120_000 })
    expect(queryClient.getQueryData(QueryKeys.election.process('p1'))).toEqual(refreshed)
    expect(invalidate).toHaveBeenCalledWith({ queryKey: QueryKeys.election.results('p1') })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: QueryKeys.organization.votesAll })
    expect(toast).not.toHaveBeenCalled()
  })

  it('never lets a poll that left before the change overwrite the re-read', async () => {
    let answerPoll: (value: unknown) => void = () => undefined
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(
      () => ({
        job: useStatusJob('p1'),
        process: useQuery({
          queryKey: QueryKeys.election.process('p1'),
          queryFn: () => new Promise((resolve) => (answerPoll = resolve)),
        }),
      }),
      { wrapper }
    )
    await waitFor(() => expect(result.current.process.isFetching).toBe(true))

    await act(() => result.current.job.run(pause))
    await act(async () => answerPoll(stale))

    expect(queryClient.getQueryData(QueryKeys.election.process('p1'))).toEqual(refreshed)
  })

  it.each([
    [
      'another change holds the lock (503)',
      new VocdoniApiError(503, {}, RAW, 50303),
      'busy',
      'Another change is under way',
    ],
    [
      'a question changed meanwhile (400)',
      new VocdoniApiError(400, {}, RAW),
      'stale',
      'A question had already changed',
    ],
    [
      'the job failed',
      new JobFailedError({ jobId: 'job-1', status: 'failed', errors: [RAW] } as never),
      'other',
      'Something went wrong',
    ],
    ['the network dropped', new TypeError('Failed to fetch'), 'other', 'Something went wrong'],
  ])('when %s it says so in its own words and re-reads the process', async (_case, error, kind, words) => {
    client.elections.bulkSetQuestionStatus.mockRejectedValue(error)
    const { result, queryClient } = setup()

    const outcome = await act(() => result.current.job.run(pause))

    expect(outcome).toEqual({ ok: false, error: kind })
    const shown = toast.mock.calls.at(-1)?.[0]
    expect(shown).toEqual(expect.objectContaining({ title: 'The vote could not be paused', type: 'error' }))
    expect(shown.description).toContain(words)
    expect(JSON.stringify(toast.mock.calls)).not.toContain(RAW)
    expect(JSON.stringify(toast.mock.calls)).not.toContain('Failed to fetch')
    expect(queryClient.getQueryData(QueryKeys.election.process('p1'))).toEqual(refreshed)
  })

  it('tells a slow job as slow, keeps the buttons guarded and finishes it when it lands', async () => {
    let land: (value: unknown) => void = () => undefined
    client.jobs.waitFor.mockRejectedValueOnce(timeout()).mockReturnValueOnce(new Promise((resolve) => (land = resolve)))
    const { result, queryClient } = setup()

    let outcome: unknown
    act(() => {
      void result.current.job.run(pause).then((value) => (outcome = value))
    })

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Still working on it', type: 'info' }))
    )
    expect(result.current.running).toBe(true)
    expect(client.jobs.waitFor).toHaveBeenLastCalledWith('job-1', { timeoutMs: 600_000 })

    await act(async () => land({ status: 'completed' }))

    await waitFor(() => expect(result.current.running).toBe(false))
    expect(outcome).toEqual({ ok: true })
    expect(queryClient.getQueryData(QueryKeys.election.process('p1'))).toEqual(refreshed)
    expect(toast.mock.calls.some(([options]) => options.type === 'error')).toBe(false)
  })

  it('gives up on a job that never lands with an info message, not an error', async () => {
    client.jobs.waitFor.mockRejectedValue(timeout())
    const { result } = setup()

    const outcome = await act(() => result.current.job.run(pause))

    expect(outcome).toEqual({ ok: false, error: 'timeout' })
    expect(toast).toHaveBeenLastCalledWith(
      expect.objectContaining({
        title: 'Still working on it',
        type: 'info',
        description: expect.stringContaining('on its own'),
      })
    )
  })

  it('reports the questions a completed batch could not change, with the numbers', async () => {
    client.jobs.waitFor.mockResolvedValue({
      status: 'completed',
      result: {
        questions: [
          { questionId: 'q1', status: 'completed' },
          { questionId: 'q2', error: 'nope' },
          { questionId: 'q3' },
        ],
      },
    })
    const { result } = setup()

    const outcome = await act(() => result.current.job.run({ ...pause, questionIds: ['q1', 'q2', 'q3'] }))

    expect(outcome).toEqual({ ok: false })
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: expect.stringContaining('1 of 3'), type: 'error' })
    )
  })

  it('maps every error kind, never from the backend text', () => {
    expect(statusJobErrorKind(new VocdoniApiError(503, {}, 'raw'))).toBe('busy')
    expect(statusJobErrorKind(new VocdoniApiError(400, {}, 'raw'))).toBe('stale')
    expect(statusJobErrorKind(timeout())).toBe('timeout')
    expect(statusJobErrorKind(new JobFailedError({ jobId: 'j', status: 'failed' } as never))).toBe('other')
    expect(statusJobErrorKind(new Error('boom'))).toBe('other')
  })
})

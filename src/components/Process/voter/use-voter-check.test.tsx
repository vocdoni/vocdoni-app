import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { VocdoniApiError } from '@vocdoni/api-client'
import type { ReactNode } from 'react'
import { useVoterCheck } from './use-voter-check'

const run = (check: () => Promise<unknown>, statusKey = 'ONGOING:ONGOING') => {
  // The app's own default: an answer under 30 s old is fresh, so only an explicit `staleTime: 0` refetches on focus.
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  const hook = renderHook(
    ({ key }: { key: string }) =>
      useVoterCheck({
        id: 'p1',
        authToken: 'tok',
        connected: true,
        check: check as Parameters<typeof useVoterCheck>[0]['check'],
        statusKey: key,
      }),
    { wrapper, initialProps: { key: statusKey } }
  )
  return { ...hook, client }
}

const member = { belongsToProcess: true, questions: [{ questionId: 'q1', canVote: true, hasVoted: false }] }
const advance = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms))

describe('useVoterCheck', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('keeps retrying a failing check while the page re-renders (gate-2 N1)', async () => {
    const check = vi.fn().mockRejectedValue(new Error('503'))
    const { rerender } = run(check)
    // The provider renders at least every 30 s (its clock); here every 10 s, for ten minutes.
    for (let i = 0; i < 60; i++) {
      await advance(10_000)
      rerender({ key: 'ONGOING:ONGOING' })
    }
    // 5, 10, 20, 40 s, then about every minute: ten checks or more, not the three or four before the timer starves.
    expect(check.mock.calls.length).toBeGreaterThanOrEqual(10)
  })

  it('starts the backoff again from 5 s after a check that answered (gate-2 N1)', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5) // factor 1
    const check = vi
      .fn()
      .mockRejectedValueOnce(new Error('503'))
      .mockRejectedValueOnce(new Error('503'))
      .mockRejectedValueOnce(new Error('503'))
      .mockRejectedValueOnce(new Error('503'))
      .mockResolvedValueOnce(member)
      .mockRejectedValue(new Error('503'))
    const { client, result } = run(check)
    await advance(5_000 + 10_000 + 20_000 + 40_000 + 100)
    expect(check).toHaveBeenCalledTimes(5)
    expect(result.current.membership).toBe('ok')
    // A later check fails: its first retry comes 5 s after, not at the 60 s ceiling of the earlier run.
    await act(() => client.invalidateQueries({ queryKey: ['voter-check'] }))
    expect(check).toHaveBeenCalledTimes(6)
    await advance(5_000)
    expect(check).toHaveBeenCalledTimes(7)
  })

  it('keeps the last answer while a background check fails, so the ballot stays on screen (gate-2 N3)', async () => {
    const check = vi.fn().mockResolvedValueOnce(member).mockRejectedValue(new Error('503'))
    const { client, result } = run(check)
    await advance(0)
    expect(result.current.membership).toBe('ok')
    await act(() => client.invalidateQueries({ queryKey: ['voter-check'] }))
    await advance(0)
    expect(check).toHaveBeenCalledTimes(2)
    expect(result.current.membership).toBe('ok')
  })

  it('stays pending when the first check fails: there is no answer to keep', async () => {
    const check = vi.fn().mockRejectedValue(new Error('503'))
    const { result } = run(check)
    await advance(0)
    expect(check).toHaveBeenCalledTimes(1)
    expect(result.current.membership).toBe('pending')
  })

  it('a 401 on a background check still ends the session, even with an answer kept', async () => {
    const check = vi
      .fn()
      .mockResolvedValueOnce(member)
      .mockRejectedValue(new VocdoniApiError(401, { error: 'expired' }, 'expired', 401))
    const { client, result } = run(check)
    await advance(0)
    await act(() => client.invalidateQueries({ queryKey: ['voter-check'] }))
    await advance(0)
    expect(result.current.membership).toBe('sessionLost')
  })

  it('asks again when a question changes status, and not on a render where nothing changed (second device)', async () => {
    const check = vi
      .fn()
      .mockResolvedValueOnce(member)
      .mockResolvedValue({ ...member, questions: [{ questionId: 'q1', canVote: true, hasVoted: true }] })
    const { rerender, result } = run(check)
    await advance(0)
    expect(result.current.votedIds).toEqual([])
    rerender({ key: 'ONGOING:ONGOING' })
    await advance(30_000)
    expect(check).toHaveBeenCalledTimes(1)
    rerender({ key: 'ONGOING:ENDED' })
    await advance(0)
    expect(check).toHaveBeenCalledTimes(2)
    expect(result.current.votedIds).toEqual(['q1'])
  })

  it('asks again when the tab regains focus, even right after an answer (second device)', async () => {
    const check = vi
      .fn()
      .mockResolvedValueOnce(member)
      .mockResolvedValue({ ...member, questions: [{ questionId: 'q1', canVote: true, hasVoted: true }] })
    const { result } = run(check)
    await advance(0)
    expect(result.current.votedIds).toEqual([])
    await act(async () => {
      focusManager.setFocused(false)
      focusManager.setFocused(true)
    })
    await advance(0)
    expect(check).toHaveBeenCalledTimes(2)
    expect(result.current.votedIds).toEqual(['q1'])
  })

  it('stops at once on an expired session, with no retry (401)', async () => {
    const check = vi.fn().mockRejectedValue(new VocdoniApiError(401, { error: 'expired' }, 'expired', 401))
    const { result } = run(check)
    await advance(0)
    expect(result.current.membership).toBe('sessionLost')
    await advance(120_000)
    expect(check).toHaveBeenCalledTimes(1)
  })

  it('never polls on its own: only focus, reconnect, a status change and a cast check again', async () => {
    const check = vi.fn().mockResolvedValue(member)
    run(check)
    await advance(0)
    await advance(10 * 60_000)
    expect(check).toHaveBeenCalledTimes(1)
  })

  it('ends on the unavailable screen when the check is refused for good, with no retry (a 403)', async () => {
    const check = vi.fn().mockRejectedValue(new VocdoniApiError(403, { error: 'forbidden' }, 'forbidden', 403))
    const { result } = run(check)
    await advance(0)
    expect(result.current.membership).toBe('unavailable')
    await advance(120_000)
    expect(check).toHaveBeenCalledTimes(1)
  })

  it('keeps retrying a timeout or a rate limit, which may clear (a 429)', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5) // factor 1
    const check = vi.fn().mockRejectedValue(new VocdoniApiError(429, { error: 'slow down' }, 'slow down', 429))
    const { result } = run(check)
    await advance(0)
    expect(result.current.membership).toBe('pending')
    await advance(5_000)
    expect(check).toHaveBeenCalledTimes(2)
  })
})

import type { VotingProcessResponse } from '@vocdoni/api-types'
import { afterEach, beforeEach, vi } from 'vitest'
import {
  checkRetryDelay,
  isSettledProcess,
  jitterFactor,
  VOTER_END_POLL_MS,
  VOTER_JITTER,
  VOTER_POLL_MS,
  voterLiveQueryOptions,
} from './live'

const process = (...questions: { status: string; finalResults?: boolean }[]) =>
  ({
    published: true,
    questions: questions.map(({ status, finalResults }) => ({ status, results: { finalResults: !!finalResults } })),
  }) as unknown as VotingProcessResponse
// A question-by-question vote that ended before its questions opened: nobody could vote, so nothing is left to count.
const endedBeforeOpening = (...statuses: string[]) =>
  ({
    initialStatus: 'PAUSED',
    published: true,
    questions: statuses.map((status) => ({
      status,
      endedAt: '2026-12-01T19:00:00.000Z',
      results: { voteCount: 0, finalResults: false },
    })),
  }) as unknown as VotingProcessResponse
const query = (data: unknown) => ({ state: { data } })
const at = (now: number, endWindowUntil?: number) =>
  voterLiveQueryOptions({ endWindowUntil, factor: 1, now: () => now })

describe('jitterFactor', () => {
  it('spreads intervals by up to 20% either way', () => {
    expect(jitterFactor(0)).toBeCloseTo(1 - VOTER_JITTER)
    expect(jitterFactor(0.5)).toBe(1)
    expect(jitterFactor(0.999999)).toBeCloseTo(1 + VOTER_JITTER)
  })
})

describe('checkRetryDelay (gate F5)', () => {
  it('doubles from 5 s to a 60 s ceiling while the membership check fails', () => {
    expect([1, 2, 3, 4, 5, 6, 20].map((failures) => checkRetryDelay(failures))).toEqual([
      5_000, 10_000, 20_000, 40_000, 60_000, 60_000, 60_000,
    ])
  })

  it('spreads each wait by the tab factor so the tabs of a room do not retry in step', () => {
    expect(checkRetryDelay(1, jitterFactor(0))).toBe(4_000)
    expect(checkRetryDelay(5, jitterFactor(0.999999))).toBe(72_000)
  })

  it('gives the same wait for the same failures and factor, so a re-render does not restart it (gate-2 N1)', () => {
    const factor = jitterFactor(0.3)
    expect(checkRetryDelay(4, factor)).toBe(checkRetryDelay(4, factor))
  })
})

describe('isSettledProcess', () => {
  it('is settled when canceled, or ended with final results', () => {
    expect(isSettledProcess(process({ status: 'CANCELED' }, { status: 'CANCELED' }))).toBe(true)
    expect(isSettledProcess(process({ status: 'RESULTS', finalResults: true }))).toBe(true)
  })

  it('is settled once a vote is over with nothing to count: every question canceled or never opened', () => {
    expect(isSettledProcess(endedBeforeOpening('ENDED', 'ENDED'))).toBe(true)
    expect(isSettledProcess(endedBeforeOpening('CANCELED', 'ENDED'))).toBe(true)
  })

  it('keeps polling an open, paused, upcoming or ended-but-not-final vote', () => {
    expect(isSettledProcess(process({ status: 'ONGOING' }, { status: 'ENDED', finalResults: true }))).toBe(false)
    expect(isSettledProcess(process({ status: 'ONGOING' }))).toBe(false)
    expect(isSettledProcess(process({ status: 'PAUSED' }))).toBe(false)
    expect(isSettledProcess(process({ status: 'ENDED', finalResults: false }))).toBe(false)
    expect(isSettledProcess(undefined)).toBe(false)
  })
})

describe('isSettledProcess reads the server, never the device clock', () => {
  const endDate = '2026-12-01T19:00:00.000Z'
  // A device whose clock is past the scheduled end, while the server still has the questions paused or running.
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-12-02T10:00:00.000Z'))
  })
  afterEach(() => vi.useRealTimers())

  // Questions with no votes: the terminal ones end together (the vote's last batch), the others have no end recorded.
  const scheduled = (...statuses: string[]) =>
    ({
      initialStatus: 'PAUSED',
      published: true,
      endDate,
      questions: statuses.map((status) => ({
        status,
        ...(['ENDED', 'CANCELED'].includes(status) ? { endedAt: '2026-12-01T19:00:00.000Z' } : {}),
        results: { voteCount: 0, finalResults: false },
      })),
    }) as unknown as VotingProcessResponse

  it('keeps polling a question-by-question vote the server still has paused or running', () => {
    expect(isSettledProcess(scheduled('PAUSED', 'PAUSED'))).toBe(false)
    expect(isSettledProcess(scheduled('ONGOING', 'PAUSED'))).toBe(false)
    expect(at(0).queryOptions.refetchInterval(query(scheduled('PAUSED')))).toBe(VOTER_POLL_MS)
  })

  it('stops once every question is terminal on the server and nothing is left to count', () => {
    expect(isSettledProcess(scheduled('ENDED', 'ENDED'))).toBe(true)
    expect(at(0).queryOptions.refetchInterval(query(scheduled('ENDED', 'CANCELED')))).toBe(false)
  })
})

describe('voterLiveQueryOptions', () => {
  it('polls the process every 30 s, refetching on focus and reconnect, never in the background', () => {
    const { queryOptions } = at(0)
    expect(queryOptions.refetchInterval(query(process({ status: 'ONGOING' })))).toBe(VOTER_POLL_MS)
    expect(queryOptions).toMatchObject({
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchIntervalInBackground: false,
    })
  })

  it('polls every 5 s inside the end window, then back to 30 s while the status is still not terminal', () => {
    expect(at(1_000, 2_000).queryOptions.refetchInterval(query(process({ status: 'ONGOING' })))).toBe(VOTER_END_POLL_MS)
    expect(at(3_000, 2_000).queryOptions.refetchInterval(query(process({ status: 'ONGOING' })))).toBe(VOTER_POLL_MS)
  })

  it('stops once the vote is settled', () => {
    expect(at(1_000, 2_000).queryOptions.refetchInterval(query(process({ status: 'CANCELED' })))).toBe(false)
  })

  it('stops polling a vote over with nothing to count, and keeps polling a vote still running', () => {
    expect(at(0).queryOptions.refetchInterval(query(endedBeforeOpening('ENDED', 'ENDED')))).toBe(false)
    expect(at(0).queryOptions.refetchInterval(query(endedBeforeOpening('ENDED', 'CANCELED')))).toBe(false)
    expect(at(0).queryOptions.refetchInterval(query(process({ status: 'ONGOING' })))).toBe(VOTER_POLL_MS)
  })

  it('applies the tab factor', () => {
    const { queryOptions } = voterLiveQueryOptions({ factor: 1.1, now: () => 0 })
    expect(queryOptions.refetchInterval(query(process({ status: 'ONGOING' })))).toBe(33_000)
  })

  it('never polls the results read: the figures come with the process read (spec D7)', () => {
    expect(at(0).resultsQueryOptions).toEqual({
      refetchInterval: false,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    })
  })
})

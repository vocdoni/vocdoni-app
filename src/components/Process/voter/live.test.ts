import type { VotingProcessResponse } from '@vocdoni/api-types'
import { afterEach, beforeEach, vi } from 'vitest'
import {
  checkRetryDelay,
  isLiveRoom,
  isSettledProcess,
  jitterFactor,
  VOTER_END_POLL_MS,
  VOTER_JITTER,
  VOTER_POLL_MS,
  VOTER_QBQ_POLL_MS,
  voterLiveQueryOptions,
} from './live'

const process = (...questions: { status: string; finalResults?: boolean; voteCount?: number }[]) =>
  ({
    published: true,
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2099-01-01T00:00:00.000Z',
    questions: questions.map(({ status, finalResults, voteCount }) => ({
      status,
      results: { finalResults: !!finalResults, ...(voteCount === undefined ? {} : { voteCount }) },
      ...(['ENDED', 'RESULTS'].includes(status) ? { endedAt: '2026-06-01T00:00:00.000Z' } : {}),
    })),
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

  it('settles a question-by-question vote whose never-opened questions ended with no vote (gate-3 F5)', () => {
    // A question-by-question vote's never-opened questions end with the vote and may never get a final tally.
    const byQuestion = (...questions: Parameters<typeof process>) =>
      ({ ...process(...questions), initialStatus: 'PAUSED' }) as unknown as VotingProcessResponse
    expect(
      isSettledProcess(byQuestion({ status: 'RESULTS', finalResults: true }, { status: 'ENDED', voteCount: 0 }))
    ).toBe(true)
    expect(isSettledProcess(process({ status: 'RESULTS', finalResults: true }, { status: 'CANCELED' }))).toBe(true)
    expect(isSettledProcess(process({ status: 'ENDED', voteCount: 3 }))).toBe(false)
  })

  it('keeps polling an all-at-once vote whose ended question has no vote until its final tally', () => {
    // A question that ended with no vote may still get its final tally, unlike a question-by-question one's.
    expect(
      isSettledProcess(process({ status: 'RESULTS', finalResults: true }, { status: 'ENDED', voteCount: 0 }))
    ).toBe(false)
    expect(isSettledProcess(process({ status: 'ENDED', voteCount: 0 }))).toBe(false)
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
    expect(at(Date.now()).queryOptions.refetchInterval(query(scheduled('PAUSED')))).toBe(VOTER_POLL_MS)
  })

  it('stops once every question is terminal on the server and nothing is left to count', () => {
    expect(isSettledProcess(scheduled('ENDED', 'ENDED'))).toBe(true)
    expect(at(0).queryOptions.refetchInterval(query(scheduled('ENDED', 'CANCELED')))).toBe(false)
  })
})

describe('voterLiveQueryOptions', () => {
  it('polls the process every 30 s, refetching on focus and reconnect, never in the background', () => {
    const { queryOptions } = at(0)
    const ongoing = query(process({ status: 'ONGOING' }))
    expect(queryOptions.refetchInterval(ongoing)).toBe(VOTER_POLL_MS)
    expect(queryOptions.refetchOnWindowFocus(ongoing)).toBe('always')
    expect(queryOptions.refetchOnReconnect(ongoing)).toBe('always')
    expect(queryOptions.refetchIntervalInBackground).toBe(false)
  })

  it('refetches on focus and reconnect only while the vote is not settled (no poll is left to stop)', () => {
    const { queryOptions } = at(0)
    const settled = query(process({ status: 'CANCELED' }))
    expect(queryOptions.refetchOnWindowFocus(settled)).toBe(false)
    expect(queryOptions.refetchOnReconnect(settled)).toBe(false)
  })

  it('polls every 5 s inside the end window, then back to 30 s while the status is still not terminal', () => {
    expect(at(1_000, 2_000).queryOptions.refetchInterval(query(process({ status: 'ONGOING' })))).toBe(VOTER_END_POLL_MS)
    expect(at(3_000, 2_000).queryOptions.refetchInterval(query(process({ status: 'ONGOING' })))).toBe(VOTER_POLL_MS)
  })

  it('polls a live question-by-question vote every 10 s, so the room follows the organiser', () => {
    const qbq = { ...process({ status: 'ONGOING' }), initialStatus: 'PAUSED' }
    const live = Date.parse('2026-06-01T12:00:00.000Z')
    expect(at(live).queryOptions.refetchInterval(query(qbq))).toBe(VOTER_QBQ_POLL_MS)
    expect(VOTER_QBQ_POLL_MS).toBe(10_000)
    expect(voterLiveQueryOptions({ factor: 1.1, now: () => live }).queryOptions.refetchInterval(query(qbq))).toBe(
      11_000
    )
  })

  describe('the 10 s poll only while a question-by-question vote is live (gate-3 F5)', () => {
    const NOW = Date.parse('2026-06-01T12:00:00.000Z')
    const qbq = (over: Record<string, unknown>, ...questions: Parameters<typeof process>) => ({
      ...process(...questions),
      initialStatus: 'PAUSED',
      ...over,
    })
    const interval = (data: unknown) => at(NOW).queryOptions.refetchInterval(query(data))

    it('before its start date: the all-at-once cadence', () => {
      const upcoming = qbq({ startDate: '2026-06-10T00:00:00.000Z' }, { status: 'PAUSED' }, { status: 'PAUSED' })
      expect(interval(upcoming)).toBe(VOTER_POLL_MS)
    })

    it('started and waiting for its first question, or between questions: 10 s', () => {
      expect(interval(qbq({}, { status: 'PAUSED' }, { status: 'PAUSED' }))).toBe(VOTER_QBQ_POLL_MS)
      expect(interval(qbq({}, { status: 'RESULTS', voteCount: 4 }, { status: 'PAUSED' }))).toBe(VOTER_QBQ_POLL_MS)
    })

    it('paused as a whole: 10 s, so a resume reaches the voters quickly', () => {
      expect(interval(qbq({}, { status: 'RESULTS', voteCount: 4 }, { status: 'PAUSED', voteCount: 2 }))).toBe(
        VOTER_QBQ_POLL_MS
      )
    })

    it('ended (every question over, or past the end) without final results: 30 s, never 10 s', () => {
      expect(interval(qbq({}, { status: 'ENDED', voteCount: 4 }, { status: 'ENDED', voteCount: 2 }))).toBe(
        VOTER_POLL_MS
      )
      const pastEnd = qbq({ endDate: '2026-06-01T11:00:00.000Z' }, { status: 'ONGOING' }, { status: 'PAUSED' })
      expect(interval(pastEnd)).toBe(VOTER_POLL_MS)
      expect(isLiveRoom(pastEnd as unknown as VotingProcessResponse, new Date(NOW))).toBe(false)
    })

    it('every question ended, the never-opened ones with no vote: stops', () => {
      expect(interval(qbq({}, { status: 'RESULTS', finalResults: true }, { status: 'ENDED', voteCount: 0 }))).toBe(
        false
      )
    })
  })

  it('keeps the 5 s end window over the question-by-question poll, and stops when it is settled', () => {
    const qbq = { ...process({ status: 'ONGOING' }), initialStatus: 'PAUSED' }
    expect(at(1_000, 2_000).queryOptions.refetchInterval(query(qbq))).toBe(VOTER_END_POLL_MS)
    const done = { ...process({ status: 'RESULTS', finalResults: true }), initialStatus: 'PAUSED' }
    expect(at(0).queryOptions.refetchInterval(query(done))).toBe(false)
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

import type { VotingProcessResponse } from '@vocdoni/api-types'
import {
  isSettledProcess,
  jitterFactor,
  VOTER_END_POLL_MS,
  VOTER_JITTER,
  VOTER_POLL_MS,
  voterLiveQueryOptions,
} from './live'

const process = (...questions: { status: string; finalResults?: boolean }[]) =>
  ({
    questions: questions.map(({ status, finalResults }) => ({ status, results: { finalResults: !!finalResults } })),
  }) as unknown as VotingProcessResponse
const query = (data: unknown) => ({ state: { data } })
const at = (now: number, endWindowUntil?: number, resultsLive = false) =>
  voterLiveQueryOptions({ endWindowUntil, resultsLive, factor: 1, now: () => now })

describe('jitterFactor', () => {
  it('spreads intervals by up to 20% either way', () => {
    expect(jitterFactor(0)).toBeCloseTo(1 - VOTER_JITTER)
    expect(jitterFactor(0.5)).toBe(1)
    expect(jitterFactor(0.999999)).toBeCloseTo(1 + VOTER_JITTER)
  })
})

describe('isSettledProcess', () => {
  it('is settled when canceled, or ended with final results', () => {
    expect(isSettledProcess(process({ status: 'CANCELED' }, { status: 'CANCELED' }))).toBe(true)
    expect(isSettledProcess(process({ status: 'RESULTS', finalResults: true }))).toBe(true)
  })

  it('keeps polling an open, paused, upcoming or ended-but-not-final vote', () => {
    expect(isSettledProcess(process({ status: 'ONGOING' }))).toBe(false)
    expect(isSettledProcess(process({ status: 'PAUSED' }))).toBe(false)
    expect(isSettledProcess(process({ status: 'ENDED', finalResults: false }))).toBe(false)
    expect(isSettledProcess(undefined)).toBe(false)
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

  it('applies the tab factor', () => {
    const { queryOptions } = voterLiveQueryOptions({ resultsLive: false, factor: 1.1, now: () => 0 })
    expect(queryOptions.refetchInterval(query(process({ status: 'ONGOING' })))).toBe(33_000)
  })

  it('keeps the results read off unless a live results view is open', () => {
    expect(at(0).resultsQueryOptions).toEqual({
      refetchInterval: false,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    })
    expect(at(0, undefined, true).resultsQueryOptions).toMatchObject({ refetchInterval: VOTER_POLL_MS })
  })
})

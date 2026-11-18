import type { VotingProcessResponse } from '@vocdoni/api-types'

// Every timing of the voter page lives here (spec D5, audit F8).
/** The process read's poll while nothing is about to change. */
export const VOTER_POLL_MS = 30_000
/** The poll right after the scheduled end, until the stored status catches up. Provisional (spec D5). */
export const VOTER_END_POLL_MS = 5_000
/** How long the faster poll lasts after the end instant before going back to `VOTER_POLL_MS`. */
export const VOTER_END_WINDOW_MS = 120_000
/** Each tab spreads its intervals by up to this share, so a room of voters does not poll in step. */
export const VOTER_JITTER = 0.2
/**
 * How long `checking` waits for the SDK's per-question state after the membership check answered, before sending the
 * voter back to identification.
 */
export const VOTER_STATE_GRACE_MS = 20_000
/** The membership check's first retry while it fails for another reason than an expired session. */
const VOTER_CHECK_RETRY_MS = 5_000
/** Its ceiling: each failure doubles the wait up to this (gate F5). */
const VOTER_CHECK_RETRY_MAX_MS = 60_000
/**
 * How long "Emet el vot" stays off after review appears (gate F1): on a phone it sits where "Continua" was, so the
 * second tap of a double tap meant for "Continua" must never cast.
 */
export const VOTER_CAST_ARM_MS = 800
/**
 * A device clock further than this from the server's is not used to close the vote (gate F4): the stored status,
 * polled, closes it. The page data's instant is at most a minute old (the HTML cache), so this leaves a margin.
 */
export const VOTER_CLOCK_TOLERANCE_MS = 120_000
/** `setTimeout`'s ceiling: a longer delay fires at once, so the end-instant timer is not armed past it. */
export const MAX_TIMEOUT_MS = 2_147_483_647

/** A per-tab factor in [1 - VOTER_JITTER, 1 + VOTER_JITTER] from a number in [0, 1). */
export const jitterFactor = (random: number): number => 1 + (random * 2 - 1) * VOTER_JITTER

/**
 * The wait before the next membership check after `failures` failed ones in a row (gate F5): doubling from
 * `VOTER_CHECK_RETRY_MS` up to `VOTER_CHECK_RETRY_MAX_MS`, times the tab's own `factor` (`jitterFactor`), so the tabs
 * of a room do not retry in step. The same input gives the same number: the query observer works the interval out
 * again on every render and restarts its timer when the number differs, so a number drawn per call would never let a
 * wait longer than the gap between two renders finish (gate-2 N1).
 */
export const checkRetryDelay = (failures: number, factor = 1): number =>
  Math.round(
    Math.min(VOTER_CHECK_RETRY_MAX_MS, VOTER_CHECK_RETRY_MS * 2 ** Math.min(Math.max(failures - 1, 0), 6)) * factor
  )

/** Nothing will change any more: every question canceled, or every one ended with its final tally. */
export const isSettledProcess = (process: VotingProcessResponse | null | undefined): boolean => {
  const questions = process?.questions ?? []
  if (!questions.length) return false
  if (questions.every((question) => question.status === 'CANCELED')) return true
  return questions.every(
    (question) => (question.status === 'ENDED' || question.status === 'RESULTS') && !!question.results?.finalResults
  )
}

export type VoterLiveState = {
  /** Until when (ms epoch) the end-instant window keeps the fast poll; unset before the end instant. */
  endWindowUntil?: number
  /** The tab's jitter factor (`jitterFactor`). */
  factor: number
  now: () => number
}

type IntervalQuery = { state: { data: unknown } }

/**
 * The `queryOptions` and `resultsQueryOptions` of the voter page's `ElectionProvider` (audit F8: the provider owns
 * the key, the fetcher and the initial data, so the intervals are functions of the query's own data). Focus and
 * reconnect refetch explicitly, because the app's QueryClient turns focus refetching off. The results screen reads
 * its figures from the process read, as the organiser's Resum does (spec D7), so the results read is never polled:
 * the provider fetches it once.
 */
export const voterLiveQueryOptions = ({ endWindowUntil, factor, now }: VoterLiveState) => ({
  queryOptions: {
    refetchInterval: (query: IntervalQuery) => {
      if (isSettledProcess(query.state.data as VotingProcessResponse | undefined)) return false as const
      const fast = endWindowUntil !== undefined && now() < endWindowUntil
      return Math.round((fast ? VOTER_END_POLL_MS : VOTER_POLL_MS) * factor)
    },
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },
  resultsQueryOptions: {
    refetchInterval: false as const,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  },
})

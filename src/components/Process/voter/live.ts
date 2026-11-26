import { isBeforeStart } from '@vocdoni/api-client'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import { isQuestionByQuestion } from '~src/types/voting-process'
import { deriveVoteState, isTerminalQuestion } from '~utils/vote-state'
import { resultsFinal } from './format'

// Every timing of the voter page lives here (spec D5, audit F8).
/** The process read's poll while nothing is about to change. */
export const VOTER_POLL_MS = 30_000
/**
 * The poll of a question-by-question vote while it is live: the organiser opens and closes questions in front of a
 * room, and a voter waiting for the next one should not sit 30 s behind them (live test, 2026-11-24).
 */
export const VOTER_QBQ_POLL_MS = 10_000
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

/**
 * Nothing will change any more: every question is over on the server (a terminal status, or its end recorded) and the
 * results are final. The device clock does not decide it: a device ahead of the server would read the questions still
 * paused as never opened and stop the poll. A vote with nothing to count is final once over (`resultsFinal`).
 */
export const isSettledProcess = (process: VotingProcessResponse | null | undefined): boolean => {
  if (!process?.questions.length) return false
  const over = process.questions.every((question) => isTerminalQuestion(question) || !!question.endedAt)
  return over && resultsFinal(process)
}

/**
 * A question-by-question vote the organiser is running now: started by its date and not ended (`deriveVoteState`
 * `live`, `paused` as a whole, or `ready` once the start passed, waiting for the first question). Only then does the
 * room poll at `VOTER_QBQ_POLL_MS` (gate-3 F5). A paused room polls fast too, so the voters get their ballot back
 * within seconds of the organiser resuming (QA review 2026-11-25).
 */
export const isLiveRoom = (process: VotingProcessResponse | null | undefined, now: Date): boolean => {
  if (!process || !isQuestionByQuestion(process) || isBeforeStart(process.startDate, now)) return false
  const state = deriveVoteState(process, now)
  return state === 'live' || state === 'paused' || state === 'ready'
}

export type VoterLiveState = {
  /** Until when (ms epoch) the end-instant window keeps the fast poll; unset before the end instant. */
  endWindowUntil?: number
  /** The tab's jitter factor (`jitterFactor`). */
  factor: number
  now: () => number
}

type IntervalQuery = { state: { data: unknown } }

// 'always' while the vote can still change: the page sets a 30 s `staleTime` for its prefetched data, and a live vote's
// poll keeps the read younger than that, so a plain `true` would never refetch on focus. The voter coming back sees
// the vote's state at once. A settled vote has no poll left, and no focus or reconnect refetch either.
const refetchOnReturn = (query: IntervalQuery) =>
  isSettledProcess(query.state.data as VotingProcessResponse | undefined) ? false : ('always' as const)

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
      const live = isLiveRoom(query.state.data as VotingProcessResponse | undefined, new Date(now()))
      return Math.round((fast ? VOTER_END_POLL_MS : live ? VOTER_QBQ_POLL_MS : VOTER_POLL_MS) * factor)
    },
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: refetchOnReturn,
    refetchOnReconnect: refetchOnReturn,
  },
  resultsQueryOptions: {
    refetchInterval: false as const,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  },
})

import { isBeforeStart, resolveEndDate } from '@vocdoni/api-client'
import type { QuestionStatus, VotingProcessQuestion, VotingProcessResponse } from '@vocdoni/api-types'
import { intervalToDuration, type Duration } from 'date-fns'
import { isQuestionByQuestion } from '~src/types/voting-process'

/**
 * The one state a vote shows in the dashboard. The list and the vote page derive it with the same function; only a
 * question-by-question pause reads vote counts, which list items lack (see `pausedHoldIds`).
 */
export type VoteState = 'draft' | 'ready' | 'live' | 'paused' | 'closed' | 'canceled'

/** The state of one question of a question-by-question vote; `notOpened` once the vote ended before it opened. */
export type QuestionState = 'toOpen' | 'open' | 'paused' | 'closed' | 'canceled' | 'notOpened'

const TERMINAL: ReadonlySet<QuestionStatus> = new Set<QuestionStatus>(['ENDED', 'RESULTS', 'CANCELED'])

export const isTerminalQuestion = (question: Pick<VotingProcessQuestion, 'status'>): boolean =>
  TERMINAL.has(question.status)

// A stored status can lag behind its end time; either one says the question is over.
const isOverQuestion = (question: VotingProcessQuestion): boolean => isTerminalQuestion(question) || !!question.endedAt

/** Stored statuses go stale after the scheduled end (they are reconciled on a single read only), so the clock wins. */
export const hasEndedBySchedule = (process: VotingProcessResponse, now: Date): boolean => {
  if (!process.published) return false
  const end = resolveEndDate(process)
  return !!end && now.getTime() >= end.getTime()
}

const NO_IDS: ReadonlySet<string> = new Set()

/**
 * The paused questions of a question-by-question vote that a pause holds, i.e. that were open before: the ones this
 * browser remembers pausing when it remembers any (`remembered`), else every paused question that has votes. Only the
 * single read carries vote counts, so on a list item only the memory can tell.
 */
export const pausedHoldIds = (process: VotingProcessResponse, remembered: ReadonlySet<string> = NO_IDS): string[] => {
  if (!isQuestionByQuestion(process)) return []
  const paused = process.questions.filter((question) => question.status === 'PAUSED')
  const fromMemory = paused.filter((question) => remembered.has(question.id))
  const held = fromMemory.length ? fromMemory : paused.filter((question) => (question.results?.voteCount ?? 0) > 0)
  return held.map(({ id }) => id)
}

/**
 * First match wins. Statuses arrive normalised by the client (`READY` reads as `ONGOING`). `remembered` is the pause
 * memory of this browser for this vote (question ids), never the source of the state on its own.
 */
export const deriveVoteState = (
  process: VotingProcessResponse,
  now: Date = new Date(),
  remembered: ReadonlySet<string> = NO_IDS
): VoteState => {
  if (!process.published) return 'draft'
  const { questions } = process
  // A published process with no questions has nothing open nor closed: only its schedule can end it.
  if (!questions.length) return hasEndedBySchedule(process, now) ? 'closed' : 'ready'
  if (questions.every((question) => question.status === 'CANCELED')) return 'canceled'
  // A question-by-question vote whose questions are all over is closed too: nothing is left to end on chain.
  if (questions.every(isOverQuestion) || hasEndedBySchedule(process, now)) return 'closed'
  const anyOngoing = questions.some((question) => question.status === 'ONGOING')
  if (isQuestionByQuestion(process)) {
    if (anyOngoing) return 'live'
    // Started, nothing open and a question that was open now paused: nobody can vote, so the vote is paused.
    if (!isBeforeStart(process.startDate, now) && pausedHoldIds(process, remembered).length) return 'paused'
    // Otherwise it opens its questions one by one: ready until one opens or closes, live between questions.
    return questions.some(isOverQuestion) ? 'live' : 'ready'
  }
  if (isBeforeStart(process.startDate, now)) return 'ready'
  return anyOngoing ? 'live' : 'paused'
}

const ENDED_TOGETHER_MS = 60_000
const endTime = (question: VotingProcessQuestion) => (question.endedAt ? new Date(question.endedAt).getTime() : NaN)

/**
 * Whether a question-by-question vote ended before this question was ever opened. The API keeps no opened-at time,
 * so a question with no votes counts as never opened (the same rule that shows it as "to open") when the vote ended
 * by its schedule while it was still paused, or when it closed in the vote's last batch (ending the vote closes every
 * question left at once).
 */
const endedUnopened = (question: VotingProcessQuestion, process: VotingProcessResponse, now: Date): boolean => {
  if (!isQuestionByQuestion(process) || (question.results?.voteCount ?? 0) > 0) return false
  if (!isOverQuestion(question)) return question.status === 'PAUSED' && hasEndedBySchedule(process, now)
  const own = endTime(question)
  if (!Number.isFinite(own)) return false
  const ends = process.questions.map(endTime).filter(Number.isFinite)
  const last = Math.max(...ends)
  const inLastBatch = (time: number) => last - time < ENDED_TOGETHER_MS
  return inLastBatch(own) && ends.filter(inLastBatch).length > 1
}

/** Per-question state, from the single process read (it carries `results.voteCount`; list items do not). */
export const deriveQuestionState = (
  question: VotingProcessQuestion,
  process: VotingProcessResponse,
  now: Date = new Date()
): QuestionState => {
  if (question.status === 'CANCELED') return 'canceled'
  if (endedUnopened(question, process, now)) return 'notOpened'
  if (isOverQuestion(question) || hasEndedBySchedule(process, now)) return 'closed'
  if (question.status === 'ONGOING') return 'open'
  // A paused question with no votes cannot be told apart from one never opened: both show as "to open".
  if (question.status === 'PAUSED' && (question.results?.voteCount ?? 0) > 0) return 'paused'
  return 'toOpen'
}

/** The open or paused questions of a question-by-question vote: the ones a voter can or could vote now. */
export const activeQuestionIds = (process: VotingProcessResponse, now: Date = new Date()): string[] =>
  isQuestionByQuestion(process)
    ? process.questions
        .filter((question) => ['open', 'paused'].includes(deriveQuestionState(question, process, now)))
        .map(({ id }) => id)
    : []

/** Why a question cannot open (or resume) on its own right now. */
export type OpenQuestionBlock = 'notByQuestion' | 'over' | 'notWaiting' | 'beforeStart' | 'votePaused' | 'otherActive'

/**
 * The one rule for opening a question (R29): only one question is open or paused at a time, and never before the
 * start nor while the whole vote is paused ("Resume the vote" reopens the questions that pause holds). Null: it can.
 */
export const openQuestionBlock = (
  process: VotingProcessResponse,
  question: VotingProcessQuestion,
  now: Date = new Date(),
  remembered: ReadonlySet<string> = NO_IDS
): OpenQuestionBlock | null => {
  if (!isQuestionByQuestion(process)) return 'notByQuestion'
  const vote = deriveVoteState(process, now, remembered)
  if (vote === 'draft' || vote === 'closed' || vote === 'canceled') return 'over'
  const state = deriveQuestionState(question, process, now)
  if (state !== 'toOpen' && state !== 'paused') return 'notWaiting'
  if (isBeforeStart(process.startDate, now)) return 'beforeStart'
  if (vote === 'paused') return 'votePaused'
  return activeQuestionIds(process, now).some((id) => id !== question.id) ? 'otherActive' : null
}

export const canOpenQuestion = (
  process: VotingProcessResponse,
  question: VotingProcessQuestion,
  now: Date = new Date(),
  remembered: ReadonlySet<string> = NO_IDS
): boolean => openQuestionBlock(process, question, now, remembered) === null

/** Whether closing this question closes the vote: every other question is already over (R30). */
export const isLastQuestionLeft = (process: VotingProcessResponse, questionId: string): boolean =>
  process.questions.some(({ id }) => id === questionId) &&
  process.questions.every((question) => question.id === questionId || isOverQuestion(question))

export type QuestionStateCounts = Record<QuestionState, number>

export const countQuestionStates = (states: readonly QuestionState[]): QuestionStateCounts =>
  states.reduce<QuestionStateCounts>((counts, state) => ({ ...counts, [state]: counts[state] + 1 }), {
    toOpen: 0,
    open: 0,
    paused: 0,
    closed: 0,
    canceled: 0,
    notOpened: 0,
  })

/** Integer percent, or undefined when there is nothing to divide by (an absent census size). */
export const percentOf = (part: number, whole: number | undefined): number | undefined => {
  if (!whole || whole <= 0) return undefined
  const exact = (part / whole) * 100
  // Never round a partial share to 0% or 100%: 311 of 312 is 99%, 1 of 400 is 1%.
  if (exact > 0 && exact < 1) return 1
  if (exact > 99 && exact < 100) return 99
  return Math.round(exact)
}

/**
 * Who may vote a question: its own restriction when it has one, else the whole census. The API strips the restriction
 * for whoever cannot manage the vote, so for them it is unknown (undefined), never guessed as the census.
 */
export const questionElectorate = (
  question: VotingProcessQuestion,
  process: VotingProcessResponse,
  canManage: boolean
): number | undefined =>
  canManage ? question.eligibleMemberIds?.length || process.census?.size || undefined : undefined

/** Questions a header action may target: never a terminal one (the backend rejects the whole batch). */
export const nonTerminalQuestionIds = (process: VotingProcessResponse | null | undefined): string[] =>
  (process?.questions ?? []).filter((question) => !isTerminalQuestion(question)).map(({ id }) => id)

export type VoteFilter = 'all' | 'live' | 'ready' | 'drafts' | 'closed'

export const VOTE_FILTERS: readonly VoteFilter[] = ['all', 'live', 'ready', 'drafts', 'closed']

const FILTER_STATES: Record<Exclude<VoteFilter, 'all'>, readonly VoteState[]> = {
  live: ['live', 'paused'],
  ready: ['ready'],
  drafts: ['draft'],
  closed: ['closed', 'canceled'],
}

export const matchesFilter = (state: VoteState, filter: VoteFilter): boolean =>
  filter === 'all' || FILTER_STATES[filter].includes(state)

export type VoteRow = { process: VotingProcessResponse; state: VoteState }

export const countByFilter = (rows: readonly VoteRow[]): Record<VoteFilter, number> =>
  Object.fromEntries(
    VOTE_FILTERS.map((filter) => [filter, rows.filter((row) => matchesFilter(row.state, filter)).length])
  ) as Record<VoteFilter, number>

const RANK: Record<VoteState, number> = { live: 0, paused: 1, ready: 2, draft: 3, closed: 4, canceled: 4 }
const time = (value: string | Date | undefined | null) => (value ? new Date(value).getTime() || 0 : 0)

/**
 * Live, then paused, both by end (soonest first); ready by start (soonest first), drafts newest first, closed and
 * canceled by end, latest first.
 */
export const compareVoteRows = (a: VoteRow, b: VoteRow): number => {
  const byRank = RANK[a.state] - RANK[b.state]
  if (byRank) return byRank
  switch (a.state) {
    case 'live':
    case 'paused':
      return time(resolveEndDate(a.process)) - time(resolveEndDate(b.process))
    case 'ready':
      return time(a.process.startDate) - time(b.process.startDate)
    case 'draft':
      // Mongo ObjectIDs start with their creation time, so a string compare orders them by age.
      return b.process.id.localeCompare(a.process.id)
    case 'closed':
    case 'canceled':
      return time(resolveEndDate(b.process)) - time(resolveEndDate(a.process))
    default:
      return 0
  }
}

/** Builds and sorts the list rows; `rememberedOf` gives this browser's pause memory of each vote. */
export const toVoteRows = (
  processes: readonly VotingProcessResponse[],
  now: Date,
  rememberedOf: (processId: string) => ReadonlySet<string> = () => NO_IDS
): VoteRow[] =>
  processes
    .map((process) => ({ process, state: deriveVoteState(process, now, rememberedOf(process.id)) }))
    .sort(compareVoteRows)

/**
 * Whether a closed question's tally can be called the result: the chain marked it final, or the question reached a
 * terminal status on the server (no vote can land any more). A close told only by the browser clock is not settled.
 */
export const isSettledQuestion = (
  question: Pick<VotingProcessQuestion, 'status' | 'results'>,
  results?: { finalResults?: boolean } | null
): boolean =>
  results?.finalResults === true ||
  question.results?.finalResults === true ||
  question.status === 'ENDED' ||
  question.status === 'RESULTS'

/** Case and accent insensitive. The list API has no search parameter, so the list filters the rows it loaded. */
export const normalizeSearch = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()

export const matchesSearch = (process: VotingProcessResponse, normalizedQuery: string): boolean =>
  !normalizedQuery ||
  Object.values(process.title ?? {}).some((title) => normalizeSearch(title ?? '').includes(normalizedQuery))

export type DraftWarning = 'missingEndDate' | 'endDatePassed' | null

export const draftWarning = (process: VotingProcessResponse, now: Date): DraftWarning => {
  if (!process.endDate) return 'missingEndDate'
  return time(process.endDate) < now.getTime() ? 'endDatePassed' : null
}

/** The two largest units left until `end` ("2 days and 4 hours"), or null once it has passed. */
export const timeLeft = (end: Date | undefined, now: Date): Duration | null => {
  if (!end || end.getTime() <= now.getTime()) return null
  const duration = intervalToDuration({ start: now, end })
  const units = (['years', 'months', 'days', 'hours', 'minutes'] as const).filter((unit) => duration[unit])
  if (!units.length) return { minutes: 1 }
  return Object.fromEntries(units.slice(0, 2).map((unit) => [unit, duration[unit]])) as Duration
}

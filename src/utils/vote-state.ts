import { isBeforeStart, resolveEndDate } from '@vocdoni/api-client'
import type { QuestionStatus, VotingProcessQuestion, VotingProcessResponse } from '@vocdoni/api-types'
import { intervalToDuration, type Duration } from 'date-fns'
import { isQuestionByQuestion } from '~src/types/voting-process'

/** The one state a vote shows in the dashboard. Never depends on vote counts, so the list and the vote page agree. */
export type VoteState = 'draft' | 'ready' | 'live' | 'paused' | 'closed' | 'canceled'

/** The state of one question of a question-by-question vote. */
export type QuestionState = 'toOpen' | 'open' | 'paused' | 'closed' | 'canceled'

const TERMINAL: ReadonlySet<QuestionStatus> = new Set<QuestionStatus>(['ENDED', 'RESULTS', 'CANCELED'])

export const isTerminalQuestion = (question: Pick<VotingProcessQuestion, 'status'>): boolean =>
  TERMINAL.has(question.status)

/** Stored statuses go stale after the scheduled end (they are reconciled on a single read only), so the clock wins. */
export const hasEndedBySchedule = (process: VotingProcessResponse, now: Date): boolean => {
  if (!process.published) return false
  const end = resolveEndDate(process)
  return !!end && now.getTime() >= end.getTime()
}

/** First match wins (spec B, audit F3). Statuses arrive normalised by the client (`READY` reads as `ONGOING`). */
export const deriveVoteState = (process: VotingProcessResponse, now: Date = new Date()): VoteState => {
  if (!process.published) return 'draft'
  const { questions } = process
  if (questions.length > 0 && questions.every((question) => question.status === 'CANCELED')) return 'canceled'
  if (questions.every(isTerminalQuestion) || hasEndedBySchedule(process, now)) return 'closed'
  const anyOngoing = questions.some((question) => question.status === 'ONGOING')
  // A question-by-question vote opens its questions one by one: it is ready until one opens or closes, and never
  // paused as a whole (a live one with nothing open reads "no question open").
  if (isQuestionByQuestion(process)) return !anyOngoing && !questions.some(isTerminalQuestion) ? 'ready' : 'live'
  if (isBeforeStart(process.startDate, now)) return 'ready'
  return anyOngoing ? 'live' : 'paused'
}

/** Per-question state, from the single process read (it carries `results.voteCount`; list items do not). */
export const deriveQuestionState = (
  question: VotingProcessQuestion,
  process: VotingProcessResponse,
  now: Date = new Date()
): QuestionState => {
  if (question.status === 'CANCELED') return 'canceled'
  if (question.status === 'ENDED' || question.status === 'RESULTS' || question.endedAt) return 'closed'
  if (hasEndedBySchedule(process, now)) return 'closed'
  if (question.status === 'ONGOING') return 'open'
  // A paused question with no votes cannot be told apart from one never opened: both show as "to open".
  if (question.status === 'PAUSED' && (question.results?.voteCount ?? 0) > 0) return 'paused'
  return 'toOpen'
}

export type QuestionStateCounts = Record<QuestionState, number>

export const countQuestionStates = (states: readonly QuestionState[]): QuestionStateCounts =>
  states.reduce<QuestionStateCounts>((counts, state) => ({ ...counts, [state]: counts[state] + 1 }), {
    toOpen: 0,
    open: 0,
    paused: 0,
    closed: 0,
    canceled: 0,
  })

/** The hint over the question list. `numbers` are 1-based question numbers. */
export type QuestionStep = { action: 'close' | 'open' | 'resume'; numbers: number[] }

export const nextQuestionStep = (states: readonly QuestionState[]): QuestionStep | null => {
  const numbersOf = (wanted: QuestionState) => states.flatMap((state, index) => (state === wanted ? [index + 1] : []))
  const open = numbersOf('open')
  if (open.length) return { action: 'close', numbers: open }
  const toOpen = numbersOf('toOpen')
  if (toOpen.length) return { action: 'open', numbers: [toOpen[0]] }
  const paused = numbersOf('paused')
  if (paused.length) return { action: 'resume', numbers: [paused[0]] }
  return null
}

/** Integer percent, or undefined when there is nothing to divide by (an absent census size). */
export const percentOf = (part: number, whole: number | undefined): number | undefined =>
  whole && whole > 0 ? Math.round((part / whole) * 100) : undefined

/** Who may vote a question: its own restriction when it has one, else the whole census. */
export const questionElectorate = (question: VotingProcessQuestion, process: VotingProcessResponse) =>
  question.eligibleMemberIds?.length || process.census?.size || undefined

/** Questions a header action may target: never a terminal one (the backend rejects the whole batch, audit F1). */
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

/** Live first, then paused, ready by start (soonest first), drafts newest first, closed and canceled by end, latest first. */
export const compareVoteRows = (a: VoteRow, b: VoteRow): number => {
  const byRank = RANK[a.state] - RANK[b.state]
  if (byRank) return byRank
  switch (a.state) {
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

/** Builds, sorts and memo-friendly freezes the list rows. */
export const toVoteRows = (processes: readonly VotingProcessResponse[], now: Date): VoteRow[] =>
  processes.map((process) => ({ process, state: deriveVoteState(process, now) })).sort(compareVoteRows)

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

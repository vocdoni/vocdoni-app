import type { VotingProcessQuestion, VotingProcessResponse } from '@vocdoni/api-types'
import { deriveQuestionState, hasEndedBySchedule, isTerminalQuestion } from '~utils/vote-state'

/**
 * What a question row of the Gestió tab shows. On top of the question states: `held` (open when the whole vote was
 * paused) and `notOpened` (the vote ended before anyone opened it).
 */
export type RowState = 'toOpen' | 'open' | 'paused' | 'held' | 'closed' | 'canceled' | 'notOpened'

/** Open, paused or held: the row with the accent edge, the turnout bar and the buttons. */
export const isActiveRow = (state: RowState): state is 'open' | 'paused' | 'held' =>
  state === 'open' || state === 'paused' || state === 'held'

// A paused question with no votes and no end time was never opened (the same rule that shows it as "to open").
const neverOpened = (question: VotingProcessQuestion) =>
  question.status === 'PAUSED' && !question.endedAt && !question.results?.voteCount

export const deriveRowState = (
  question: VotingProcessQuestion,
  process: VotingProcessResponse,
  now: Date,
  held: ReadonlySet<string>
): RowState => {
  const state = deriveQuestionState(question, process, now)
  if (state === 'closed' && !isTerminalQuestion(question) && hasEndedBySchedule(process, now) && neverOpened(question))
    return 'notOpened'
  if (state === 'closed' || state === 'canceled') return state
  return held.has(question.id) ? 'held' : state
}

export type RowCounts = Record<RowState, number>

export const countRows = (states: readonly RowState[]): RowCounts =>
  states.reduce<RowCounts>((counts, state) => ({ ...counts, [state]: counts[state] + 1 }), {
    toOpen: 0,
    open: 0,
    paused: 0,
    held: 0,
    closed: 0,
    canceled: 0,
    notOpened: 0,
  })

/** The board's "Next step": `numbers` are 1-based question numbers. */
export type ManageStep =
  | { action: 'close' | 'open' | 'resume'; numbers: number[] }
  | { action: 'resumeVote' }
  | { action: 'endVote' }

/** For a vote that is under way (started, not ended, not canceled). */
export const nextManageStep = (states: readonly RowState[], isHeld: boolean): ManageStep | null => {
  if (!states.length) return null
  if (isHeld) return { action: 'resumeVote' }
  const numbersOf = (wanted: RowState) => states.flatMap((state, index) => (state === wanted ? [index + 1] : []))
  const open = numbersOf('open')
  if (open.length) return { action: 'close', numbers: open }
  const toOpen = numbersOf('toOpen')
  if (toOpen.length) return { action: 'open', numbers: [toOpen[0]] }
  const paused = numbersOf('paused')
  if (paused.length) return { action: 'resume', numbers: [paused[0]] }
  return { action: 'endVote' }
}

/** Whether a row's Open or Resume is the next step, which makes it the primary button. */
export const isStepFor = (step: ManageStep | null, action: 'open' | 'resume', number: number) =>
  !!step && step.action === action && step.numbers[0] === number

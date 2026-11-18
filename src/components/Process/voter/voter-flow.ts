import type { QuestionStatus } from '@vocdoni/api-types'
import { BallotType, questionSelectionRange, tryInferQuestionBallotType } from '@vocdoni/ballot'

/** Which results the voter would see: secret until the end, live, or the final tally. */
export type ResultsState = 'hidden' | 'provisional' | 'final'

/**
 * The one thing the voter page shows (spec D4). SP4 adds `room`, `openQuestion` and `castWaiting`; SP5 replaces the
 * interim `results` screen with its own.
 */
export type VoterScreen =
  | { kind: 'identify'; notice?: 'sessionExpired' }
  | { kind: 'code' }
  | { kind: 'checking' }
  | { kind: 'unavailable' }
  | { kind: 'unsupported' }
  | { kind: 'welcome' }
  | { kind: 'question'; index: number; paused: boolean }
  | { kind: 'review'; paused: boolean }
  | { kind: 'sending' }
  | { kind: 'receipt' }
  | { kind: 'alreadyVoted' }
  | { kind: 'upcoming' }
  | { kind: 'closed' }
  | { kind: 'paused' }
  | { kind: 'canceled' }
  | { kind: 'notEligible' }
  | { kind: 'results'; state: ResultsState }

export type VoterScreenKind = VoterScreen['kind']

/** The flow's own membership check (`useQuery(['voter-check', id, authToken])`). */
export type Membership = 'idle' | 'pending' | 'ok' | 'notInProcess' | 'sessionLost'

/** What the SDK and the flow's own reads report. Facts win over the voter's navigation. */
export type VoterFacts = {
  /** The process read is there. */
  loaded: boolean
  /** `useElection().status`: computed from the questions, UPCOMING before the start. */
  status: QuestionStatus | null
  questionByQuestion: boolean
  /** The scheduled end has passed by the clock, or the end-instant timer fired. */
  endedBySchedule: boolean
  /** Some question hides its tallies until the end. */
  secretUntilTheEnd: boolean
  connected: boolean
  /** A one-time code was sent and waits to be typed (CspAuthProvider step 1; the SDK does not expose it). */
  challengePending: boolean
  membership: Membership
  /** The SDK has published the voter's per-question state. */
  voterStateReady: boolean
  /** Every question is on chain (the SDK, or the flow's own check for a vote cast from another device). */
  hasVoted: boolean
  isAbleToVote: boolean
  /** A cast or the SDK's automatic re-send is in flight. */
  voting: boolean
  /** Every question is on chain, or signed and not castable from this tab (`signed` / `unconfirmed`). */
  everyQuestionSettled: boolean
  questionCount: number
  /** Per question, in order: answered by the flow's rule (`isAnswered`), locked questions counted as done. */
  answered: readonly boolean[]
}

/** Where the voter navigated. Only this is mirrored to `history.state`; answers never leave memory. */
export type VoterStep = { name: 'welcome' } | { name: 'question'; index: number } | { name: 'review' }

/** A question's answer as the SDK form holds it: one value, or a list (multiple, approval, ranked ordering). */
export type Answer = string | string[]

export type VoterLocalState = {
  step: VoterStep
  /** "Canvia" on review: "Continua" goes back to review instead of the next question. */
  returnToReview: boolean
  /** Keyed by the question's index as a string, as the SDK form names its fields. */
  answers: Record<string, Answer>
  /** Free-text memos of open-value choices, keyed by question index (the SDK's `memo.<index>` fields). */
  memos: Record<string, string>
  /** A cast of this session was confirmed. */
  castDone: boolean
  /**
   * The answers of the last cast, as sent (gate F2): review shows these for a question already on chain, never an
   * answer typed after it (or for another device's vote). Memory only, like `answers`.
   */
  sent: Record<string, Answer>
  /** The SDK's sentence for the last failed cast; kept by the flow because a poll resets the form's errors. */
  castError: string | null
  /** The last failed cast could not learn whether its votes landed (the SDK's `errors.vote_unconfirmed`). */
  castUnconfirmed: boolean
  /** "Comprova el teu vot": identify on an ended vote to reach the receipt. */
  checkReceipt: boolean
  /** "Mostra els resultats" and the other links to results. */
  viewResults: boolean
  notice: 'sessionExpired' | null
}

export type VoterAction =
  | { type: 'go'; step: VoterStep; returnToReview?: boolean }
  | { type: 'restore'; step: VoterStep }
  | { type: 'answer'; key: string; value: Answer }
  | { type: 'memo'; key: string; value: string }
  | { type: 'castStarted' }
  | { type: 'castSucceeded' }
  | { type: 'castFailed'; message: string; unconfirmed?: boolean }
  | { type: 'checkReceipt' }
  | { type: 'viewResults'; on: boolean }
  | { type: 'signedOut'; notice?: 'sessionExpired' }

export const WELCOME: VoterStep = { name: 'welcome' }

/** The SDK's notice ("Ja has votat") the flow gives a question whose vote is already on chain (gate F2). */
export const ON_CHAIN_NOTICE = 'vote.disabled.voted'

/**
 * What review and the rail show for a question: for one on chain, the answer this session sent for it (nothing when
 * it was cast elsewhere); otherwise the answer being prepared.
 */
export const shownAnswer = (
  local: Pick<VoterLocalState, 'answers' | 'sent'>,
  key: string,
  notice: string | undefined
): Answer | undefined => (notice === ON_CHAIN_NOTICE ? local.sent[key] : local.answers[key])

export const initialVoterState: VoterLocalState = {
  step: WELCOME,
  returnToReview: false,
  answers: {},
  memos: {},
  sent: {},
  castDone: false,
  castError: null,
  castUnconfirmed: false,
  checkReceipt: false,
  viewResults: false,
  notice: null,
}

export const voterReducer = (state: VoterLocalState, action: VoterAction): VoterLocalState => {
  switch (action.type) {
    case 'go':
      return { ...state, step: action.step, returnToReview: action.returnToReview ?? false, viewResults: false }
    case 'restore':
      return { ...state, step: action.step, returnToReview: false }
    case 'answer':
      return {
        ...state,
        answers: { ...state.answers, [action.key]: action.value },
        castError: null,
        castUnconfirmed: false,
      }
    case 'memo':
      return { ...state, memos: { ...state.memos, [action.key]: action.value } }
    case 'castStarted':
      return { ...state, castError: null, castUnconfirmed: false, sent: { ...state.answers } }
    case 'castSucceeded':
      return { ...state, castDone: true, castError: null, castUnconfirmed: false }
    case 'castFailed':
      return { ...state, castError: action.message, castUnconfirmed: action.unconfirmed ?? false }
    case 'checkReceipt':
      return { ...state, checkReceipt: true, viewResults: false }
    case 'viewResults':
      return { ...state, viewResults: action.on }
    case 'signedOut':
      return { ...initialVoterState, notice: action.notice ?? null }
  }
}

const ENDED: ReadonlySet<QuestionStatus> = new Set<QuestionStatus>(['ENDED', 'RESULTS'])

/** The vote is over: its stored status, or the clock (stored statuses lag the scheduled end). */
const isVoteOver = (facts: Pick<VoterFacts, 'status' | 'endedBySchedule'>): boolean =>
  (facts.status !== null && ENDED.has(facts.status)) || facts.endedBySchedule

const resultsStateOf = (facts: Pick<VoterFacts, 'status' | 'endedBySchedule' | 'secretUntilTheEnd'>) =>
  isVoteOver(facts) ? 'final' : facts.secretUntilTheEnd ? 'hidden' : 'provisional'

/** The index of the first question not answered, or -1 when every one is. */
export const firstUnanswered = (answered: readonly boolean[]): number => answered.findIndex((done) => !done)

/**
 * The screen, first match wins (spec D4 precedence as amended by audit F5 and the owner's rulings). One addition,
 * listed for the owner: a connected member who can vote no question of an ongoing vote lands on `notEligible`.
 */
export const deriveVoterScreen = (facts: VoterFacts, local: VoterLocalState): VoterScreen => {
  if (!facts.loaded) return { kind: 'checking' }
  if (facts.voting) return { kind: 'sending' }
  if (local.castDone) return { kind: 'receipt' }
  if (facts.status === 'CANCELED') return { kind: 'canceled' }
  if (facts.status === 'UPCOMING') return { kind: 'upcoming' }

  const results: VoterScreen = { kind: 'results', state: resultsStateOf(facts) }
  const over = isVoteOver(facts)
  if (over && !local.checkReceipt) return local.viewResults ? results : { kind: 'closed' }
  // A question-by-question vote cannot be voted here; once it is over the closed screen and its results apply (F8).
  if (facts.questionByQuestion) return { kind: 'unsupported' }
  if (facts.status === null || facts.status === 'PROCESS_UNKNOWN') return { kind: 'unavailable' }

  if (!facts.connected) {
    if (facts.challengePending) return { kind: 'code' }
    if (local.viewResults) return results
    return local.notice ? { kind: 'identify', notice: local.notice } : { kind: 'identify' }
  }
  if (facts.membership === 'idle' || facts.membership === 'pending') return { kind: 'checking' }
  if (facts.membership === 'sessionLost') return { kind: 'identify', notice: 'sessionExpired' }
  if (facts.membership === 'notInProcess') return { kind: 'notEligible' }
  if (!facts.voterStateReady) return { kind: 'checking' }
  if (facts.hasVoted || (!facts.isAbleToVote && facts.everyQuestionSettled)) {
    return local.viewResults ? results : { kind: 'alreadyVoted' }
  }
  // Reached only with "Comprova el teu vot" on an ended vote: this voter did not vote.
  if (over) return local.viewResults ? results : { kind: 'closed' }
  if (!facts.isAbleToVote && facts.status === 'ONGOING') return { kind: 'notEligible' }
  if (local.viewResults) return results

  const paused = facts.status === 'PAUSED'
  if (paused && local.step.name === 'welcome') return { kind: 'paused' }
  if (facts.questionCount === 0) return { kind: 'unavailable' }

  const first = firstUnanswered(facts.answered)
  switch (local.step.name) {
    case 'welcome':
      return { kind: 'welcome' }
    case 'question': {
      const asked = Math.min(Math.max(local.step.index, 0), facts.questionCount - 1)
      return { kind: 'question', index: first === -1 ? asked : Math.min(asked, first), paused }
    }
    case 'review':
      return first === -1 ? { kind: 'review', paused } : { kind: 'question', index: first, paused }
  }
}

/** What the ballot helpers read of a question: the SDK's `Question` and the API's question both fit. */
type QuestionShape = Parameters<typeof questionSelectionRange>[0]

/**
 * Whether a question's answer is complete (audit F4): the gate for "Continua", for reaching review by any route and
 * for "Emet el vot". The SDK validates only the mounted field, so the flow decides. A locked question (its vote is
 * being re-sent, or signed and not castable from here) counts as done.
 */
export const isAnswered = (question: QuestionShape, answer: Answer | undefined, locked = false): boolean => {
  if (locked) return true
  const type = tryInferQuestionBallotType(question)
  // Budget and quadratic questions have no field here (the SDK would draw them as a single choice, an answer the
  // tally would misread): never answered, so never cast (gate F10).
  if (type === undefined || type === BallotType.Budget || type === BallotType.Quadratic) return false
  switch (type) {
    case BallotType.MultiChoice: {
      if (!Array.isArray(answer)) return false
      const { min, max } = questionSelectionRange(question)
      const count = answer.filter((value) => value !== '').length
      return count >= min && count <= max
    }
    case BallotType.Approval: {
      // At least one, and no more than the question's cap: the encoder refuses more (gate F10).
      if (!Array.isArray(answer)) return false
      const count = answer.filter((value) => value !== '').length
      return count >= 1 && count <= questionSelectionRange(question).max
    }
    case BallotType.Ranked:
      return Array.isArray(answer) && answer.length === question.choices.length && answer.every((value) => value !== '')
    default:
      return typeof answer === 'string' && answer !== ''
  }
}

/**
 * A selection the SDK's encoder accepts for a question that is already on chain (gate F2). `vote()` encodes every
 * question its own rule does not lock and only then skips the confirmed ones (`castVotes` signs state `open` only), so
 * this value is never signed or sent: it only keeps the encoder from refusing an empty answer in a session resumed
 * after a partial cast. Remove once the SDK skips the encoder for them.
 */
export const encodableAnswer = (question: QuestionShape): Answer => {
  const values = question.choices.map((choice) => String(choice.value))
  const type = tryInferQuestionBallotType(question)
  if (type === BallotType.Ranked) return values
  if (type === BallotType.MultiChoice || type === BallotType.Approval) {
    return values.slice(0, Math.max(1, questionSelectionRange(question).min))
  }
  return values[0] ?? ''
}

/** A multiple-choice question whose range lets the voter choose nothing: the SDK accepts a blank vote. */
export const allowsBlankVote = (question: QuestionShape): boolean =>
  tryInferQuestionBallotType(question) === BallotType.MultiChoice && questionSelectionRange(question).min === 0

/** What the chain is known to hold of one question's vote (gate-2 N2): on it, not on it, or not known from here. */
export type ChainRecord = 'recorded' | 'missing' | 'unknown'

// Statuses whose outcome nobody has settled: `signed` is an anonymous vote this tab cannot verify; `submitting` and
// `confirming` are a transaction that went out and was never answered. `signing` built no transaction; `failed` and
// `unconfirmed` are answers (`unconfirmed`: signed, and the backend read the chain without it, with nothing to resend).
const OUTCOME_UNKNOWN = new Set(['signed', 'submitting', 'confirming'])

/**
 * One question's `ChainRecord`. `onChain`: the SDK or the flow's own check holds it as voted, or the voter holds its
 * vote id. `pending`: the SDK keeps its transaction to send again, after a refusal or an unknown outcome alike.
 * `outcomeUnknown`: the last cast failed because the chain could not be read (`VoterLocalState.castUnconfirmed`), so
 * a pending transaction may have landed until the SDK reads the chain again (it does when the vote ends).
 */
export const chainRecordOf = ({
  onChain,
  status,
  pending,
  outcomeUnknown,
}: {
  onChain: boolean
  status: string | undefined
  pending: boolean
  outcomeUnknown: boolean
}): ChainRecord => {
  if (onChain) return 'recorded'
  if ((pending && outcomeUnknown) || (status !== undefined && OUTCOME_UNKNOWN.has(status))) return 'unknown'
  return 'missing'
}

export type SendingPhase = 1 | 2 | 3

const IN_BATCH = new Set(['signing', 'submitting', 'confirming', 'confirmed'])

/**
 * The sending screen's phase (audit F15): the lowest stage any question still in the batch is at. `failed`,
 * `unconfirmed` and `signed` are not in the batch. Nothing known yet reads as the first phase.
 */
export const sendingPhase = (statuses: readonly (string | undefined)[]): SendingPhase => {
  const live = statuses.filter((status): status is string => !!status && IN_BATCH.has(status))
  if (!live.length || live.includes('signing')) return 1
  if (live.includes('submitting')) return 2
  return 3
}

const IN_FLIGHT = new Set(['signing', 'submitting', 'confirming'])

/**
 * How many answers the batch carries, for "Enviant les 4 respostes": the ones in flight. A question already on chain
 * reads `confirmed` from the start of a re-send after a partial cast and is not in it (gate F15).
 */
export const batchSize = (statuses: readonly (string | undefined)[]): number =>
  statuses.filter((status) => !!status && IN_FLIGHT.has(status)).length

const HISTORY_KEY = 'voterStep'

/** The `history.state` entry for a step: the step only, never an answer. */
export const historyStateFor = (current: unknown, step: VoterStep): Record<string, unknown> => ({
  ...(current && typeof current === 'object' ? (current as Record<string, unknown>) : {}),
  [HISTORY_KEY]: step,
})

/** The step a `history.state` holds, or null when it holds none (or something that is not a step). */
export const stepFromHistory = (state: unknown): VoterStep | null => {
  if (!state || typeof state !== 'object') return null
  const step = (state as Record<string, unknown>)[HISTORY_KEY]
  if (!step || typeof step !== 'object') return null
  const { name, index } = step as { name?: unknown; index?: unknown }
  if (name === 'welcome' || name === 'review') return { name }
  if (name === 'question' && typeof index === 'number' && Number.isInteger(index) && index >= 0) {
    return { name, index }
  }
  return null
}

/** The SDK form's values for `useQuestionsForm().vote()`: the flow's answers plus the `memo.<index>` fields. */
export const formValuesFor = (local: Pick<VoterLocalState, 'answers' | 'memos'>): Record<string, unknown> => ({
  ...local.answers,
  ...(Object.keys(local.memos).length ? { memo: { ...local.memos } } : {}),
})

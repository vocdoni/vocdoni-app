import type { QuestionStatus } from '@vocdoni/api-types'
import { BallotType, questionSelectionRange, tryInferQuestionBallotType } from '@vocdoni/ballot'
import type { QuestionState, VoteState } from '~utils/vote-state'
import { VOTER_CLOCK_TOLERANCE_MS } from './live'

/** Which results the voter would see: secret until the end, live, or the final tally. */
export type ResultsState = 'hidden' | 'provisional' | 'final'

/**
 * What the chain or the CSP holds of the voter's vote on one question of a question-by-question vote. `unknown`: a
 * cast went out and its outcome was never learnt (the SDK's unknown outcome), so it may have landed. `late`: the
 * relay refused the cast because the question closed between the voter pressing the button and the relay receiving it.
 */
export type RoomCast = 'recorded' | 'authorised' | 'lost' | 'unknown' | 'pending' | 'late' | 'none'
/** A cast question as frame 3 tells it: on chain, authorised from another tab (anonymous), or signed and lost. */
export type RoomRecord = Extract<RoomCast, 'recorded' | 'authorised' | 'lost'>
/** A closed question whose vote is not known to be on chain, though one was cast (3c never says "No l'has votada"). */
export type RoomMissedRecord = Extract<RoomCast, 'lost' | 'unknown' | 'late'>

/** One question of a question-by-question vote as the room reads it: the organiser's state and the voter's cast. */
export type RoomQuestion = {
  id: string
  /** `deriveQuestionState`, the organiser's rule. */
  state: QuestionState
  cast: RoomCast
  /** When it closed (ms epoch), when the read says. */
  endedAt: number | null
  /** The creator chose that voters see this question's result when it closes (`voterSeesQuestionResult`). */
  showsResult?: boolean
  /** False when the membership check says this voter may not vote it (`canVote`, an eligibility subset). */
  eligible?: boolean
}

/** A question-by-question vote: its derived state (`deriveVoteState`) and each question's. */
export type RoomFacts = { voteState: VoteState; questions: RoomQuestion[] }

/**
 * The one thing the voter page shows (spec D4). The `room*` kinds are a question-by-question vote's frames (boards
 * V4VoterWideLive / M4VoterLive): 0 `roomNotStarted`, 1 `roomOpen`, 2 `roomQuestion` (paused: V4VoterWideMore 2),
 * 3 `roomVoted`, 3b `roomSkipped`, 3c `roomMissed`, 4 `roomNone`. When the creator shows each closed question's
 * result to voters: 3d `roomMissed` with `result`, 3e `roomClosedVoted`. `roomNotEligible`: the open question is not
 * for this voter (the check's `canVote`). `results` is SP5's (V4VoterWideMore 9 to 11).
 */
export type VoterScreen =
  | { kind: 'identify'; notice?: 'sessionExpired' }
  | { kind: 'code' }
  | { kind: 'checking' }
  // `refused`: the membership check was refused for good, so waiting or a retry will not change the screen.
  | { kind: 'unavailable'; refused?: true }
  | { kind: 'roomNotStarted' }
  | { kind: 'roomOpen'; index: number }
  | { kind: 'roomQuestion'; index: number; paused: boolean; blocked?: true }
  | { kind: 'roomVoted'; index: number; record: RoomRecord }
  | { kind: 'roomSkipped'; index: number }
  | { kind: 'roomMissed'; index: number; result?: true; record?: RoomMissedRecord }
  | { kind: 'roomNotEligible'; index: number }
  | { kind: 'roomClosedVoted'; index: number }
  | { kind: 'roomNone' }
  | { kind: 'welcome' }
  | { kind: 'question'; index: number; paused: boolean }
  | { kind: 'review'; paused: boolean }
  | { kind: 'sending' }
  | { kind: 'receipt' }
  | { kind: 'alreadyVoted' }
  | { kind: 'verifyReceipt' }
  | { kind: 'upcoming' }
  | { kind: 'closed' }
  | { kind: 'paused' }
  | { kind: 'canceled' }
  | { kind: 'notEligible' }
  | { kind: 'results'; state: ResultsState }

export type VoterScreenKind = VoterScreen['kind']

/** The flow's own membership check (`useQuery(['voter-check', id, authToken])`). */
export type Membership = 'idle' | 'pending' | 'ok' | 'notInProcess' | 'sessionLost' | 'unavailable'

/** What the SDK and the flow's own reads report. Facts win over the voter's navigation. */
export type VoterFacts = {
  /** The process read is there. */
  loaded: boolean
  /** `useElection().status`: computed from the questions, UPCOMING before the start. */
  status: QuestionStatus | null
  /** A question-by-question vote's room (Task 2 fills it); absent or null for an all-at-once vote. */
  room?: RoomFacts | null
  /** The scheduled end has passed by the clock, or the end-instant timer fired. */
  endedBySchedule: boolean
  /** Some question hides its tallies until the end. */
  secretUntilTheEnd: boolean
  /** The creator lets voters see the results on this page (`voterSeesResults`); off, they are never offered. */
  resultsShown: boolean
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
   * answer typed after it (or for another device's vote). Memory only, like `answers`. All at once only: no room frame
   * names an answer (gate-3 F1, owner ruling 2026-11-24).
   */
  sent: Record<string, Answer>
  /** The SDK's sentence for the last failed cast; kept by the flow because a poll resets the form's errors. */
  castError: string | null
  /** The last failed cast could not learn whether its votes landed (the SDK's `errors.vote_unconfirmed`). */
  castUnconfirmed: boolean
  /** When the last failed cast was refused (ms epoch), for `lateCastOf`. */
  castFailedAt: number | null
  /** "Comprova el teu vot": identify on an ended vote to reach the receipt. */
  checkReceipt: boolean
  /** "Mostra els resultats" and the other links to results. */
  viewResults: boolean
  /** "Verifica el teu comprovant" (anonymous census): the page where one receipt code is checked on the Explorer. */
  verifyReceipt: boolean
  /** Question by question: the open question the voter left with "Enrere" (frame 1), until they go back to it. */
  parked: string | null
  /** Question by question: questions skipped with "No votar aquesta pregunta" (frame 3b). Nothing was cast for them. */
  skipped: readonly string[]
  /** Question by question: the question of the last cast, so its error shows on that question only. */
  castQuestionId: string | null
  /** Question by question: the questions whose last cast ended with an unknown outcome (`castUnconfirmed`). */
  uncertain: readonly string[]
  /** Question by question: the questions whose refused cast came after they closed (`lateCastOf`). */
  late: readonly string[]
  /** Question by question: a cast here sent nothing because the check found the question already voted elsewhere. */
  votedElsewhere: string | null
  notice: 'sessionExpired' | null
}

export type VoterAction =
  | { type: 'go'; step: VoterStep; returnToReview?: boolean }
  | { type: 'restore'; step: VoterStep }
  | { type: 'answer'; key: string; value: Answer }
  | { type: 'memo'; key: string; value: string }
  | { type: 'castStarted'; questionId?: string }
  | { type: 'questionCastSucceeded' }
  | { type: 'park'; questionId: string }
  | { type: 'skip'; questionId: string }
  | { type: 'resume'; questionId: string }
  | { type: 'castSucceeded' }
  | { type: 'castFailed'; message: string; unconfirmed?: boolean; at?: number }
  | { type: 'castFoundVoted'; questionId: string }
  | { type: 'castLate'; questionId: string }
  | { type: 'castRefused'; questionId: string; message: string }
  | { type: 'openChanged'; questionId: string | null }
  | { type: 'checkReceipt' }
  | { type: 'leaveReceipt' }
  | { type: 'viewResults'; on: boolean }
  | { type: 'verifyReceipt'; on: boolean }
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
  castFailedAt: null,
  checkReceipt: false,
  viewResults: false,
  verifyReceipt: false,
  parked: null,
  skipped: [],
  castQuestionId: null,
  uncertain: [],
  late: [],
  votedElsewhere: null,
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
      return {
        ...state,
        castError: null,
        castUnconfirmed: false,
        sent: { ...state.answers },
        viewResults: false,
        castQuestionId: action.questionId ?? null,
      }
    case 'questionCastSucceeded': {
      // Question by question: frame 3 follows from the SDK's state; the receipt is the all-at-once screen.
      const id = state.castQuestionId
      return {
        ...state,
        castError: null,
        castUnconfirmed: false,
        uncertain: state.uncertain.filter((questionId) => questionId !== id),
      }
    }
    case 'park':
      return { ...state, parked: action.questionId, viewResults: false }
    case 'skip':
      return {
        ...state,
        skipped: state.skipped.includes(action.questionId) ? state.skipped : [...state.skipped, action.questionId],
        parked: null,
        viewResults: false,
      }
    case 'resume':
      return {
        ...state,
        parked: state.parked === action.questionId ? null : state.parked,
        skipped: state.skipped.filter((questionId) => questionId !== action.questionId),
        viewResults: false,
      }
    case 'castSucceeded':
      return { ...state, castDone: true, castError: null, castUnconfirmed: false }
    case 'castFailed': {
      const unconfirmed = action.unconfirmed ?? false
      const id = state.castQuestionId
      // Kept per question: a later answer clears `castUnconfirmed`, not what is known of this question's vote.
      const uncertain = !id || state.uncertain.includes(id) ? state.uncertain : [...state.uncertain, id]
      return {
        ...state,
        castError: action.message,
        castUnconfirmed: unconfirmed,
        castFailedAt: action.at ?? null,
        uncertain: unconfirmed ? uncertain : state.uncertain,
      }
    }
    case 'castFoundVoted':
      return { ...state, votedElsewhere: action.questionId }
    case 'castLate':
      return state.late.includes(action.questionId) ? state : { ...state, late: [...state.late, action.questionId] }
    // Nothing was sent for the question, so, unlike a failed cast, what earlier casts left unknown stays as it was. An
    // unknown outcome shown on this question stays too: a refusal must not replace it.
    case 'castRefused':
      if (state.castQuestionId === action.questionId && state.castUnconfirmed) return state
      return {
        ...state,
        castQuestionId: action.questionId,
        castError: action.message,
        castUnconfirmed: false,
        castFailedAt: null,
      }
    // A parked frame belongs to the question it was left on: once another question is the open one, it is forgotten.
    // No open question (a paused vote) keeps it, so the held question still shows as it was left.
    case 'openChanged':
      return action.questionId === null || state.parked === null || state.parked === action.questionId
        ? state
        : { ...state, parked: null }
    case 'checkReceipt':
      return { ...state, checkReceipt: true, viewResults: false }
    case 'leaveReceipt':
      return { ...state, checkReceipt: false }
    case 'viewResults':
      return { ...state, viewResults: action.on }
    case 'verifyReceipt':
      return { ...state, verifyReceipt: action.on }
    case 'signedOut':
      return { ...initialVoterState, notice: action.notice ?? null }
  }
}

const ENDED: ReadonlySet<QuestionStatus> = new Set<QuestionStatus>(['ENDED', 'RESULTS'])

/** The vote is over: its stored status, or the clock (stored statuses lag the scheduled end). */
export const isVoteOver = (facts: Pick<VoterFacts, 'status' | 'endedBySchedule'>): boolean =>
  (facts.status !== null && ENDED.has(facts.status)) || facts.endedBySchedule

/**
 * Whether the live count shows on identify: never when the creator hid the results from voters; a secret-until-the-end
 * vote hides it until the end, which is then public (audit F16).
 */
export const showsLiveResults = (
  facts: Pick<VoterFacts, 'status' | 'endedBySchedule' | 'secretUntilTheEnd' | 'resultsShown'>
): boolean => facts.resultsShown && (!facts.secretUntilTheEnd || isVoteOver(facts))

// Question by question the results page stays hidden while the vote runs (R11). The creator's per-question choice
// (`metadata.voterResults`) shows a closed question's result on the room's own frames (3d, 3e), not on this page.
const resultsStateOf = (
  facts: Pick<VoterFacts, 'status' | 'endedBySchedule' | 'secretUntilTheEnd' | 'room'>
): ResultsState => (isVoteOver(facts) ? 'final' : facts.secretUntilTheEnd || facts.room ? 'hidden' : 'provisional')

/** The index of the first question not answered, or -1 when every one is. */
export const firstUnanswered = (answered: readonly boolean[]): number => answered.findIndex((done) => !done)

/**
 * What one question of a question-by-question vote holds of the voter's vote: on chain first, then the SDK.
 * `outcomeUnknown`: this question's last cast failed without learning whether it landed (`VoterLocalState.uncertain`).
 * As in `chainRecordOf`, a transaction that went out and was never answered is `unknown`, never "not voted".
 */
export const roomCastOf = ({
  onChain,
  status,
  pending,
  outcomeUnknown = false,
}: {
  onChain: boolean
  status: string | undefined
  pending: boolean
  outcomeUnknown?: boolean
}): RoomCast => {
  if (onChain || status === 'confirmed') return 'recorded'
  if (status === 'signed') return 'authorised'
  if (status === 'unconfirmed') return 'lost'
  if ((pending && outcomeUnknown) || status === 'submitting' || status === 'confirming') return 'unknown'
  if (pending) return 'pending'
  return 'none'
}

const CAST: ReadonlySet<RoomCast> = new Set<RoomCast>(['recorded', 'authorised', 'lost'])

/** The voter cast this question: on chain, authorised from another tab, or signed and lost. Nothing is left to vote. */
export const isRoomCast = (question: Pick<RoomQuestion, 'cast'>): boolean => CAST.has(question.cast)

/** The question that closed last: the latest end time, else the agenda's order. -1 when none has closed. */
export const lastClosedIndex = (questions: readonly RoomQuestion[]): number => {
  let last = -1
  questions.forEach((question, index) => {
    if (question.state !== 'closed') return
    const ended = question.endedAt ?? -Infinity
    const lastEnded = last === -1 ? -Infinity : (questions[last].endedAt ?? -Infinity)
    if (last === -1 || ended >= lastEnded) last = index
  })
  return last
}

/** The voter may vote this question: the check does not leave them out of it (`canVote`). */
export const isRoomEligible = (question: Pick<RoomQuestion, 'eligible'>): boolean => question.eligible !== false

/**
 * Whether a pending cast was refused after its question ended, so the close is why it did not count. `castFailedAt` is
 * dated when `vote()` returns, up to ~2 min after the relay refused. Within `VOTER_CLOCK_TOLERANCE_MS` of the end it
 * still counts as late: a trusted device clock can read that far off the server's.
 */
export const lateCastOf = (
  cast: RoomCast,
  questionId: string,
  local: Pick<VoterLocalState, 'castQuestionId' | 'castError' | 'castUnconfirmed' | 'castFailedAt'>,
  endedAt: number | null
): boolean =>
  cast === 'pending' &&
  local.castQuestionId === questionId &&
  local.castError !== null &&
  !local.castUnconfirmed &&
  endedAt !== null &&
  local.castFailedAt !== null &&
  endedAt <= local.castFailedAt + VOTER_CLOCK_TOLERANCE_MS

/**
 * The open question the room shows: the first the voter can still vote, else the first open one. More than one open
 * at a time only happens through the API (the organiser's pages never open two, R29).
 */
export const shownOpenIndex = (questions: readonly RoomQuestion[]): number => {
  const open = questions.flatMap((question, index) => (question.state === 'open' ? [index] : []))
  return open.find((index) => !isRoomCast(questions[index]) && isRoomEligible(questions[index])) ?? open[0] ?? -1
}

/**
 * Whether casting the shown open question would sign another one too: SDK #118 signs every open question this voter
 * has not cast, and the form encodes each of them, so with a second one open the voter would cast an answer they never
 * chose (or none at all). Such a cast is refused until only one is open (gate-3 F10).
 */
export const roomCastBlocked = (questions: readonly RoomQuestion[], index: number): boolean =>
  questions.some((question, other) => other !== index && question.state === 'open' && question.cast === 'none')

/**
 * A question-by-question vote's frame for an identified voter (boards V4VoterWideLive / M4VoterLive). The open
 * question decides: its ballot, unless the voter cast it (3), skipped it (3b), left it (1), or may not vote it. With
 * none open: the held question's ballot while paused (V4VoterWideMore 2), else the paused screen (1); not started (0);
 * the question that closed last if it was not cast (3c; a cast lost or of unknown outcome says so, never "No l'has
 * votada"), or cast and recorded when its result is shown (3e); else none open (4). Once over (reached only with
 * "Comprova el teu vot", or every question over with a canceled one): the codes of any cast question, else the closed
 * screen.
 */
const deriveRoomScreen = (
  facts: VoterFacts,
  room: RoomFacts,
  local: VoterLocalState,
  results: VoterScreen
): VoterScreen => {
  const { questions, voteState } = room
  if (isVoteOver(facts) || voteState === 'closed') {
    if (local.viewResults) return results
    return questions.some(isRoomCast) ? { kind: 'alreadyVoted' } : { kind: 'closed' }
  }
  if (local.viewResults) return results

  const open = shownOpenIndex(questions)
  if (open !== -1) {
    const question = questions[open]
    if (isRoomCast(question)) return { kind: 'roomVoted', index: open, record: question.cast as RoomRecord }
    if (!isRoomEligible(question)) return { kind: 'roomNotEligible', index: open }
    if (local.skipped.includes(question.id)) return { kind: 'roomSkipped', index: open }
    if (local.parked === question.id) return { kind: 'roomOpen', index: open }
    return roomCastBlocked(questions, open)
      ? { kind: 'roomQuestion', index: open, paused: false, blocked: true }
      : { kind: 'roomQuestion', index: open, paused: false }
  }
  if (voteState === 'paused') {
    const held = questions.findIndex((question) => question.state === 'paused')
    const question = questions[held]
    if (
      question &&
      !isRoomCast(question) &&
      isRoomEligible(question) &&
      !local.skipped.includes(question.id) &&
      local.parked !== question.id
    ) {
      return { kind: 'roomQuestion', index: held, paused: true }
    }
    return { kind: 'paused' }
  }
  if (voteState === 'ready') return { kind: 'roomNotStarted' }
  const last = lastClosedIndex(questions)
  if (last !== -1) {
    const closed = questions[last]
    const result = closed.showsResult ? ({ result: true } as const) : {}
    // A cast the chain does not hold, or whose outcome is not known: 3c says which, never "No l'has votada".
    // 'late' is set by lateCastOf in the provider before deriveRoomScreen runs (gate-3 F2 extension).
    if (closed.cast === 'lost' || closed.cast === 'unknown' || closed.cast === 'late') {
      return { kind: 'roomMissed', index: last, ...result, record: closed.cast }
    }
    // The creator shows the result of a closed question until the next one opens (3d, 3e). A question this voter
    // could not vote has nothing to tell them.
    if (!isRoomCast(closed) && isRoomEligible(closed)) return { kind: 'roomMissed', index: last, ...result }
    if (closed.showsResult && closed.cast === 'recorded') return { kind: 'roomClosedVoted', index: last }
  }
  return { kind: 'roomNone' }
}

/**
 * The screen, first match wins (spec D4 precedence as amended by audit F5 and the owner's rulings). One addition,
 * listed for the owner: a connected member who can vote no question of an ongoing vote lands on `notEligible`.
 * Question by question, after identification: `deriveRoomScreen`.
 */
export const deriveVoterScreen = (facts: VoterFacts, asked: VoterLocalState): VoterScreen => {
  // Results the creator hid are never shown, whatever asked for them.
  const local = asked.viewResults && !facts.resultsShown ? { ...asked, viewResults: false } : asked
  if (!facts.loaded) return { kind: 'checking' }
  if (facts.voting) return { kind: 'sending' }
  // One code is checked on the Explorer with no identification, from any screen that links to it ("Enrere" leaves).
  if (local.verifyReceipt) return { kind: 'verifyReceipt' }
  // A canceled vote wins over the receipt: if the vote is canceled after the voter casts, the page switches live.
  if (facts.status === 'CANCELED') return { kind: 'canceled' }
  // The receipt offers the results (R19 Q1): they open over it while asked for, and "Enrere" comes back to it.
  if (local.castDone && !local.viewResults) return { kind: 'receipt' }
  if (facts.status === 'UPCOMING') return { kind: 'upcoming' }

  const results: VoterScreen = { kind: 'results', state: resultsStateOf(facts) }
  if (local.castDone) return results
  const over = isVoteOver(facts)
  if (over && !local.checkReceipt) return local.viewResults ? results : { kind: 'closed' }
  // A question-by-question vote between two questions mixes ended and paused ones (PROCESS_UNKNOWN): not unavailable.
  if (facts.status === null || (facts.status === 'PROCESS_UNKNOWN' && !facts.room)) return { kind: 'unavailable' }
  if (facts.room && facts.room.questions.length === 0) return { kind: 'unavailable' }

  if (!facts.connected) {
    if (facts.challengePending) return { kind: 'code' }
    if (local.viewResults) return results
    return local.notice ? { kind: 'identify', notice: local.notice } : { kind: 'identify' }
  }
  if (facts.membership === 'idle' || facts.membership === 'pending') return { kind: 'checking' }
  if (facts.membership === 'unavailable') return { kind: 'unavailable', refused: true }
  if (facts.membership === 'sessionLost') return { kind: 'identify', notice: 'sessionExpired' }
  if (facts.membership === 'notInProcess') return { kind: 'notEligible' }
  if (!facts.voterStateReady) return { kind: 'checking' }
  // Question by question: its own frames. They come before the all-at-once rules below, because with SDK #118
  // `isAbleToVote` is false whenever no question the voter can still vote is open.
  if (facts.room) return deriveRoomScreen(facts, facts.room, local, results)
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
      // At least one, and no more than the question's cap. Nothing else checks the cap: the SDK's approval field
      // asks for one or more and the encoder does not count them, so this rule is the only guard (gate F10, gate-2 N4).
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

/** The most options an approval question lets the voter approve of, when that is fewer than its options. */
export const approvalCap = (question: QuestionShape): number | undefined => {
  if (tryInferQuestionBallotType(question) !== BallotType.Approval) return undefined
  const { max } = questionSelectionRange(question)
  return max < question.choices.length ? max : undefined
}

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

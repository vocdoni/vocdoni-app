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
 * result to voters: 3d `roomMissed` with `result`, 3e `roomClosedVoted`. `results` is SP5's (V4VoterWideMore 9 to 11).
 */
export type VoterScreen =
  | { kind: 'identify'; notice?: 'sessionExpired' }
  | { kind: 'code' }
  | { kind: 'checking' }
  // `refused`: the membership check was refused for good, so waiting or a retry will not change the screen.
  | { kind: 'unavailable'; refused?: true }
  | { kind: 'roomNotStarted' }
  | { kind: 'roomOpen'; index: number }
  | { kind: 'roomQuestion'; index: number; paused: boolean }
  | { kind: 'roomVoted'; index: number; record: RoomRecord }
  | { kind: 'roomSkipped'; index: number }
  | { kind: 'roomMissed'; index: number; result?: true; record?: RoomMissedRecord }
  | { kind: 'roomClosedVoted'; index: number }
  | { kind: 'roomNone' }
  | { kind: 'welcome' }
  | { kind: 'question'; index: number; paused: boolean; set?: true }
  | { kind: 'review'; paused: boolean; set?: true; index?: number }
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
  /** The room (`null` when every question is open now: the classic all-at-once flow, `roomNeeded`). */
  room?: RoomFacts | null
  /** The scheduled end has passed by the clock, or the end-instant timer fired. */
  endedBySchedule: boolean
  /** The vote was created question by question (started paused): its results wait for each question to close (R11). */
  byQuestion?: boolean
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
  /** Question by question: the open set the voter left with "Enrere" (frame 1), its ids joined (`roomGroupKey`). */
  parked: string | null
  /** Question by question: questions skipped with "No votar aquesta pregunta" (frame 3b). Nothing was cast for them. */
  skipped: readonly string[]
  /** Question by question: the question of the last cast, so its error shows on that question only. */
  castQuestionId: string | null
  /** Question by question: every question the last cast sent (an open set's), so a refusal late counts for each. */
  castSet: readonly string[]
  /** Question by question: the questions whose last cast ended with an unknown outcome (`castUnconfirmed`). */
  uncertain: readonly string[]
  /** Question by question: the questions whose refused cast came after they closed (`lateCastOf`). */
  late: readonly string[]
  /** Question by question: a cast here sent nothing because the check found the question already voted elsewhere. */
  votedElsewhere: string | null
  /** The questions the voter was seen ineligible for this session: kept once the check stops saying so (after the end). */
  ineligible: readonly string[]
  notice: 'sessionExpired' | null
}

export type VoterAction =
  | { type: 'go'; step: VoterStep; returnToReview?: boolean }
  | { type: 'restore'; step: VoterStep }
  | { type: 'answer'; key: string; value: Answer }
  | { type: 'memo'; key: string; value: string }
  | { type: 'castStarted'; questionId?: string; questionIds?: readonly string[] }
  | { type: 'questionCastSucceeded' }
  | { type: 'park'; questionId: string }
  | { type: 'skip'; questionId: string }
  | { type: 'resume'; questionId: string }
  | { type: 'castSucceeded' }
  | { type: 'castFailed'; message: string; unconfirmed?: boolean; at?: number; questionId?: string }
  | { type: 'castFoundVoted'; questionId: string }
  | { type: 'castLate'; questionId: string }
  | { type: 'castRefused'; questionId: string; message: string }
  | { type: 'ineligibleSeen'; questionIds: readonly string[] }
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
  castSet: [],
  uncertain: [],
  late: [],
  votedElsewhere: null,
  ineligible: [],
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
        castSet: action.questionIds ?? [],
      }
    case 'questionCastSucceeded': {
      // Question by question: frame 3 follows from the SDK's state; the receipt is the all-at-once screen.
      const sent = castIdsOf(state)
      return {
        ...state,
        castError: null,
        castUnconfirmed: false,
        uncertain: state.uncertain.filter((questionId) => !sent.includes(questionId)),
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
        // The parked key is the open set's ids, so resuming any one of them unparks the set.
        parked: state.parked?.split(',').includes(action.questionId) ? null : state.parked,
        skipped: state.skipped.filter((questionId) => questionId !== action.questionId),
        viewResults: false,
      }
    case 'castSucceeded':
      return { ...state, castDone: true, castError: null, castUnconfirmed: false }
    case 'castFailed': {
      const unconfirmed = action.unconfirmed ?? false
      // Kept per question: a later answer clears `castUnconfirmed`, not what is known of each question's vote.
      const uncertain = [...state.uncertain, ...castIdsOf(state).filter((id) => !state.uncertain.includes(id))]
      return {
        ...state,
        // The question the failure shows on: the first of the set still to vote, when the cast landed in part.
        castQuestionId: action.questionId ?? state.castQuestionId,
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
    case 'ineligibleSeen': {
      const added = action.questionIds.filter((questionId) => !state.ineligible.includes(questionId))
      return added.length ? { ...state, ineligible: [...state.ineligible, ...added] } : state
    }
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

/** The questions the last cast sent: an open set's, else the one question it was for. */
const castIdsOf = (state: Pick<VoterLocalState, 'castSet' | 'castQuestionId'>): readonly string[] =>
  state.castSet.length ? state.castSet : state.castQuestionId ? [state.castQuestionId] : []

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
// A room that exists only for an ineligible question (every question open) is not question by question.
const resultsStateOf = (
  facts: Pick<VoterFacts, 'status' | 'endedBySchedule' | 'secretUntilTheEnd' | 'room' | 'byQuestion'>
): ResultsState => {
  if (isVoteOver(facts)) return 'final'
  const staged = facts.room?.questions.some((question) => question.state !== 'open' && question.state !== 'canceled')
  return facts.secretUntilTheEnd || facts.byQuestion || staged ? 'hidden' : 'provisional'
}

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
    // A question this voter may not vote has nothing to show them, so it is not the last one they saw close.
    if (question.state !== 'closed' || !isRoomEligible(question)) return
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
  local: Pick<VoterLocalState, 'castQuestionId' | 'castError' | 'castUnconfirmed' | 'castFailedAt'> &
    Partial<Pick<VoterLocalState, 'castSet'>>,
  endedAt: number | null
): boolean =>
  cast === 'pending' &&
  (local.castQuestionId === questionId || !!local.castSet?.includes(questionId)) &&
  local.castError !== null &&
  !local.castUnconfirmed &&
  endedAt !== null &&
  local.castFailedAt !== null &&
  endedAt <= local.castFailedAt + VOTER_CLOCK_TOLERANCE_MS

/**
 * The room's layout: it shows unless every question is open now (or canceled), the classic all-at-once flow. An open
 * question this voter may not vote joins the room only while another is votable; with none, the vote is not theirs.
 */
export const roomNeeded = (questions: readonly Pick<RoomQuestion, 'state' | 'eligible'>[]): boolean =>
  questions.some((question) => question.state !== 'open' && question.state !== 'canceled') ||
  (questions.some((question) => question.state === 'open' && question.eligible !== false) &&
    questions.some((question) => question.eligible === false))

/**
 * The open set the ballot covers: the questions open now that this voter has not cast and may vote. A question this
 * voter may not vote is absent: no screen, no answer, nothing to wait for.
 */
export const roomGroup = (questions: readonly RoomQuestion[]): number[] =>
  questions.flatMap((question, index) =>
    question.state === 'open' && !isRoomCast(question) && isRoomEligible(question) ? [index] : []
  )

/** The open set's key, the ids joined: "Enrere" parks the set it was pressed on, and a new set is not parked. */
export const roomGroupKey = (questions: readonly RoomQuestion[]): string =>
  roomGroup(questions)
    .map((index) => questions[index].id)
    .join(',')

/**
 * The open question the room shows: the first of the open set this voter can vote and has not answered yet, else the
 * first they can vote (all answered: the group's cast), else the first open one (a cast question of the set).
 * `answered` is the flow's rule.
 */
const shownOpenIndex = (questions: readonly RoomQuestion[], answered: readonly boolean[]): number => {
  const group = roomGroup(questions)
  const open = questions.flatMap((question, index) =>
    question.state === 'open' && isRoomEligible(question) ? [index] : []
  )
  // A question the voter cast in this set comes before the others: the recorded answer is the frame.
  const cast = open.find((index) => isRoomCast(questions[index]))
  return group.find((index) => !answered[index]) ?? group[0] ?? cast ?? open[0] ?? -1
}

/**
 * The questions the voter answers together in one form: the open set's, when there are two or more. One question is the
 * room's single question. The questions this voter may not vote are not in the form either.
 */
export const roomFormSet = (questions: readonly RoomQuestion[], voteState: VoteState = 'live'): number[] | null => {
  const set = roomHeldSet(questions, voteState)
  return set.length > 1 ? set : null
}

/**
 * The set a skip, park or form acts on: the open one, or, in a whole-vote pause with nothing open, the paused questions
 * not yet cast (they were the open set). Limit: a paused question reads as paused only with votes
 * (`deriveQuestionState`), so a held question with none yet is left out, and a set with no votes reads as no pause.
 */
export const roomHeldSet = (questions: readonly RoomQuestion[], voteState: VoteState): number[] => {
  const group = roomGroup(questions)
  if (group.length || voteState !== 'paused') return group
  return questions.flatMap((question, index) =>
    question.state === 'paused' && !isRoomCast(question) && isRoomEligible(question) ? [index] : []
  )
}

/** The form's screens for an open set: its questions in order, then review; "Canvia" returns to a question of the set. */
const roomFormScreen = (
  set: readonly number[],
  answered: readonly boolean[],
  step: VoterStep,
  paused = false
): VoterScreen => {
  const left = set.find((index) => !answered[index])
  if (step.name === 'question' && set.includes(step.index)) {
    return { kind: 'question', index: step.index, paused, set: true }
  }
  if (left !== undefined) return { kind: 'question', index: left, paused, set: true }
  return { kind: 'review', paused, set: true, index: set[set.length - 1] }
}

/**
 * The room's frame for an identified voter (boards V4VoterWideLive / M4VoterLive): the open set decides, after the
 * voter's own cast, skip and park. The frame order is in the function body, and the cases are in the tests.
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

  const open = shownOpenIndex(questions, facts.answered)
  if (open !== -1) {
    const question = questions[open]
    if (isRoomCast(question)) return { kind: 'roomVoted', index: open, record: question.cast as RoomRecord }
    if (local.skipped.includes(question.id)) return { kind: 'roomSkipped', index: open }
    if (local.parked === roomGroupKey(questions)) return { kind: 'roomOpen', index: open }
    const set = roomFormSet(questions, voteState)
    if (set) return roomFormScreen(set, facts.answered, local.step)
    return { kind: 'roomQuestion', index: open, paused: false }
  }
  if (voteState === 'paused') {
    const set = roomFormSet(questions, voteState)
    const parked = local.parked?.split(',') ?? []
    if (
      set &&
      !set.some((index) => parked.includes(questions[index].id) || local.skipped.includes(questions[index].id))
    ) {
      return roomFormScreen(set, facts.answered, local.step, true)
    }
    const held = questions.findIndex((question) => question.state === 'paused' && isRoomEligible(question))
    const question = questions[held]
    if (
      !set &&
      question &&
      !isRoomCast(question) &&
      !local.skipped.includes(question.id) &&
      !local.parked?.split(',').includes(question.id)
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
    // The creator shows the result of a closed question until the next one opens (3d, 3e).
    if (!isRoomCast(closed)) return { kind: 'roomMissed', index: last, ...result }
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
  // A room the voter may vote none of, and has cast none of: the same screen as a non-member, as no question is left.
  if (
    facts.room?.questions.length &&
    facts.room.questions.every((question) => !isRoomEligible(question)) &&
    !facts.room.questions.some(isRoomCast)
  ) {
    return { kind: 'notEligible' }
  }
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

import type { VotingProcessQuestion } from '@vocdoni/api-types'
import { encodeQuestionSelections, questionSelectionRange } from '@vocdoni/ballot'
import {
  allowsBlankVote,
  approvalCap,
  batchSize,
  chainRecordOf,
  deriveVoterScreen,
  firstUnanswered,
  formValuesFor,
  historyStateFor,
  initialVoterState,
  isAnswered,
  isRoomCast,
  lastClosedIndex,
  lateCastOf,
  ON_CHAIN_NOTICE,
  roomCastBlocked,
  roomCastOf,
  sendingPhase,
  shownAnswer,
  stepFromHistory,
  voterReducer,
  type RoomCast,
  type RoomFacts,
  type VoterFacts,
  type VoterLocalState,
} from './voter-flow'
import { VOTER_CLOCK_TOLERANCE_MS } from './live'
import type { QuestionState, VoteState } from '~utils/vote-state'

// A connected member of an ongoing three-question vote who has answered nothing yet.
const facts = (over: Partial<VoterFacts> = {}): VoterFacts => ({
  loaded: true,
  status: 'ONGOING',
  endedBySchedule: false,
  secretUntilTheEnd: false,
  resultsShown: true,
  connected: true,
  challengePending: false,
  membership: 'ok',
  voterStateReady: true,
  hasVoted: false,
  isAbleToVote: true,
  voting: false,
  everyQuestionSettled: false,
  questionCount: 3,
  answered: [false, false, false],
  ...over,
})
const local = (over: Partial<VoterLocalState> = {}): VoterLocalState => ({ ...initialVoterState, ...over })
const screen = (f: Partial<VoterFacts> = {}, l: Partial<VoterLocalState> = {}) => deriveVoterScreen(facts(f), local(l))

// A question-by-question vote's room: each entry is a state, or [state, cast, endedAt].
const roomOf = (
  entries: Array<QuestionState | [QuestionState, RoomCast?, (number | null)?]>,
  voteState: VoteState = 'live',
  showsResult = false
): RoomFacts => ({
  voteState,
  questions: entries.map((entry, index) => {
    const [state, cast = 'none', endedAt = null] = Array.isArray(entry) ? entry : [entry]
    return { id: `q${index + 1}`, state, cast, endedAt, ...(showsResult ? { showsResult } : {}) }
  }),
})
const qbq = (room: RoomFacts, over: Partial<VoterFacts> = {}): Partial<VoterFacts> => ({
  room,
  questionCount: room.questions.length,
  answered: room.questions.map(() => false),
  // SDK #118: able only while an unvoted question is open.
  isAbleToVote: room.questions.some((question) => question.state === 'open' && question.cast === 'none'),
  ...over,
})
// Questions 1 and 2 closed and voted, 3 open, 4 to open (board V4VoterWideLive 1 to 4).
const LIVE = roomOf([['closed', 'recorded', 1], ['closed', 'recorded', 2], 'open', 'toOpen'])

describe('deriveVoterScreen: precedence, first match wins', () => {
  it('waits for the process read', () => {
    expect(screen({ loaded: false })).toEqual({ kind: 'checking' })
  })

  it('1. sending: a cast in flight beats everything, even a vote that just closed, paused or was canceled', () => {
    expect(screen({ voting: true, status: 'CANCELED' })).toEqual({ kind: 'sending' })
    expect(screen({ voting: true, endedBySchedule: true })).toEqual({ kind: 'sending' })
    expect(screen({ voting: true, connected: false })).toEqual({ kind: 'sending' })
  })

  it('2. receipt: a cast confirmed in this session, even once the vote closes (but not if canceled)', () => {
    expect(screen({ status: 'ENDED' }, { castDone: true })).toEqual({ kind: 'receipt' })
  })

  it('3. canceled: wins over the receipt so the page turns live when the org cancels after the voter cast', () => {
    expect(screen({ status: 'CANCELED', connected: false })).toEqual({ kind: 'canceled' })
    expect(screen({ status: 'CANCELED' }, { castDone: true })).toEqual({ kind: 'canceled' })
  })

  it('4. question by question: identify first, even before a question opens or while paused (R3)', () => {
    const ready = roomOf(['toOpen', 'toOpen'], 'ready')
    expect(screen(qbq(ready, { connected: false, status: 'PAUSED' }))).toEqual({ kind: 'identify' })
    expect(screen(qbq(LIVE, { connected: false }))).toEqual({ kind: 'identify' })
    expect(screen(qbq(LIVE, { connected: false, challengePending: true }))).toEqual({ kind: 'code' })
    expect(screen(qbq(roomOf([]), { connected: false }))).toEqual({ kind: 'unavailable' })
  })

  it('4b. an ended question-by-question vote is closed, with its results (gate F8)', () => {
    expect(screen(qbq(LIVE, { status: 'ENDED', connected: false }))).toEqual({ kind: 'closed' })
    expect(screen(qbq(LIVE, { endedBySchedule: true }), { viewResults: true })).toEqual({
      kind: 'results',
      state: 'final',
    })
  })

  it('5. upcoming always precedes identification', () => {
    expect(screen({ status: 'UPCOMING', connected: false })).toEqual({ kind: 'upcoming' })
    expect(screen({ status: 'UPCOMING' }, { checkReceipt: true })).toEqual({ kind: 'upcoming' })
  })

  it('6. closed: by stored status or by the clock, before identification', () => {
    expect(screen({ status: 'ENDED', connected: false })).toEqual({ kind: 'closed' })
    expect(screen({ status: 'RESULTS' })).toEqual({ kind: 'closed' })
    expect(screen({ endedBySchedule: true, connected: true })).toEqual({ kind: 'closed' })
  })

  it('7. unavailable: an unknown or missing status on a vote that is not question by question', () => {
    expect(screen({ status: 'PROCESS_UNKNOWN' })).toEqual({ kind: 'unavailable' })
    expect(screen({ status: null, connected: false })).toEqual({ kind: 'unavailable' })
  })

  it('8. not connected: identify, or the code screen while a challenge waits', () => {
    expect(screen({ connected: false })).toEqual({ kind: 'identify' })
    expect(screen({ connected: false, challengePending: true })).toEqual({ kind: 'code' })
    expect(screen({ connected: false }, { notice: 'sessionExpired' })).toEqual({
      kind: 'identify',
      notice: 'sessionExpired',
    })
  })

  it('8b. identify comes first even when the vote is paused; the paused screen follows identification', () => {
    expect(screen({ status: 'PAUSED', connected: false })).toEqual({ kind: 'identify' })
    expect(screen({ status: 'PAUSED', connected: false, challengePending: true })).toEqual({ kind: 'code' })
    expect(screen({ status: 'PAUSED' })).toEqual({ kind: 'paused' })
  })

  it('9. checking: connected while the membership check has not answered, or the SDK state is not in', () => {
    expect(screen({ membership: 'pending' })).toEqual({ kind: 'checking' })
    expect(screen({ membership: 'idle' })).toEqual({ kind: 'checking' })
    expect(screen({ voterStateReady: false })).toEqual({ kind: 'checking' })
  })

  it('the membership check refused for good (a client error that asking again will not change): unavailable', () => {
    expect(screen({ membership: 'unavailable' })).toEqual({ kind: 'unavailable', refused: true })
  })

  it('10. session lost: the check answered 401', () => {
    expect(screen({ membership: 'sessionLost' })).toEqual({ kind: 'identify', notice: 'sessionExpired' })
  })

  it('11. notEligible: the check answered belongsToProcess false', () => {
    expect(screen({ membership: 'notInProcess', isAbleToVote: false })).toEqual({ kind: 'notEligible' })
  })

  it('12. alreadyVoted: every question on chain, or signed and not castable from this tab', () => {
    expect(screen({ hasVoted: true, isAbleToVote: false })).toEqual({ kind: 'alreadyVoted' })
    expect(screen({ isAbleToVote: false, everyQuestionSettled: true })).toEqual({ kind: 'alreadyVoted' })
    // Settled but still able to vote (a pending re-send) is not "already voted".
    expect(screen({ everyQuestionSettled: true }, { step: { name: 'question', index: 0 } }).kind).toBe('question')
  })

  it('12b. after "Comprova el teu vot" on an ended vote: already voted for a voter who voted, closed for one who did not', () => {
    expect(screen({ status: 'ENDED', hasVoted: true, isAbleToVote: false }, { checkReceipt: true })).toEqual({
      kind: 'alreadyVoted',
    })
    expect(screen({ status: 'ENDED', isAbleToVote: false }, { checkReceipt: true })).toEqual({ kind: 'closed' })
    expect(screen({ status: 'ENDED', connected: false }, { checkReceipt: true })).toEqual({ kind: 'identify' })
  })

  it('12c-bis. every question open to the member is settled: already voted, not ineligible', () => {
    // `hasVoted` is false (a question is not on chain) but every question left is settled for this voter.
    expect(screen({ isAbleToVote: false, everyQuestionSettled: true, hasVoted: false })).toEqual({
      kind: 'alreadyVoted',
    })
  })

  it('12c. a member who can vote no question of an ongoing vote lands on notEligible (addition, for the owner)', () => {
    expect(screen({ isAbleToVote: false })).toEqual({ kind: 'notEligible' })
  })

  it('13. paused on entry: the voter has not started the ballot', () => {
    expect(screen({ status: 'PAUSED' })).toEqual({ kind: 'paused' })
  })

  it('14. local step: welcome, the question, review; paused mid-ballot keeps the step', () => {
    expect(screen()).toEqual({ kind: 'welcome' })
    expect(screen({}, { step: { name: 'question', index: 0 } })).toEqual({ kind: 'question', index: 0, paused: false })
    expect(screen({ answered: [true, true, true] }, { step: { name: 'review' } })).toEqual({
      kind: 'review',
      paused: false,
    })
    expect(
      screen({ status: 'PAUSED', answered: [true, false, false] }, { step: { name: 'question', index: 1 } })
    ).toEqual({ kind: 'question', index: 1, paused: true })
    expect(screen({ status: 'PAUSED', answered: [true, true, true] }, { step: { name: 'review' } })).toEqual({
      kind: 'review',
      paused: true,
    })
  })
})

describe('deriveVoterScreen: results links', () => {
  it('shows results in place of identify, closed, alreadyVoted and the local step', () => {
    expect(screen({ connected: false }, { viewResults: true })).toEqual({ kind: 'results', state: 'provisional' })
    expect(screen({ status: 'ENDED' }, { viewResults: true })).toEqual({ kind: 'results', state: 'final' })
    expect(screen({ hasVoted: true, isAbleToVote: false }, { viewResults: true })).toEqual({
      kind: 'results',
      state: 'provisional',
    })
    expect(screen({ secretUntilTheEnd: true }, { viewResults: true })).toEqual({ kind: 'results', state: 'hidden' })
  })

  it('never when the creator hid the results from voters', () => {
    const hidden = { resultsShown: false }
    expect(screen({ ...hidden, connected: false }, { viewResults: true }).kind).toBe('identify')
    expect(screen({ ...hidden, status: 'ENDED' }, { viewResults: true }).kind).toBe('closed')
    expect(screen({ ...hidden, hasVoted: true, isAbleToVote: false }, { viewResults: true }).kind).toBe('alreadyVoted')
    expect(screen(hidden, { castDone: true, viewResults: true }).kind).toBe('receipt')
  })

  it('never over sending, canceled, upcoming or a pending code', () => {
    expect(screen({ voting: true }, { viewResults: true }).kind).toBe('sending')
    expect(screen({ status: 'CANCELED' }, { viewResults: true }).kind).toBe('canceled')
    expect(screen({ status: 'UPCOMING' }, { viewResults: true }).kind).toBe('upcoming')
    expect(screen({ connected: false, challengePending: true }, { viewResults: true }).kind).toBe('code')
  })

  it('opens the results over the receipt that offers them, and goes back to it (R19 Q1)', () => {
    expect(screen({}, { castDone: true })).toEqual({ kind: 'receipt' })
    expect(screen({}, { castDone: true, viewResults: true })).toEqual({ kind: 'results', state: 'provisional' })
    expect(screen({ status: 'ENDED' }, { castDone: true, viewResults: true })).toEqual({
      kind: 'results',
      state: 'final',
    })
    // Canceled after the cast: there is nothing to show. A cast in flight is never interrupted.
    expect(screen({ status: 'CANCELED' }, { castDone: true, viewResults: true }).kind).toBe('canceled')
    expect(screen({ voting: true }, { castDone: true, viewResults: true }).kind).toBe('sending')
  })

  it('follows the vote: hidden or provisional turn final when it ends, by its status or by the clock', () => {
    const visitor = { connected: false }
    expect(screen({ ...visitor, secretUntilTheEnd: true }, { viewResults: true })).toEqual({
      kind: 'results',
      state: 'hidden',
    })
    expect(screen({ ...visitor, secretUntilTheEnd: true, status: 'RESULTS' }, { viewResults: true })).toEqual({
      kind: 'results',
      state: 'final',
    })
    expect(screen({ ...visitor, endedBySchedule: true }, { viewResults: true })).toEqual({
      kind: 'results',
      state: 'final',
    })
  })
})

describe('deriveVoterScreen: completeness gate (audit F4)', () => {
  it('a question step past an unanswered one goes to the first unanswered', () => {
    expect(screen({ answered: [true, false, false] }, { step: { name: 'question', index: 2 } })).toEqual({
      kind: 'question',
      index: 1,
      paused: false,
    })
  })

  it('reaching review by any route with question 2 emptied lands on question 2', () => {
    expect(screen({ answered: [true, false, true] }, { step: { name: 'review' } })).toEqual({
      kind: 'question',
      index: 1,
      paused: false,
    })
  })

  it('clamps a step outside the vote (a stale history entry)', () => {
    expect(screen({ answered: [true, true, true] }, { step: { name: 'question', index: 9 } })).toEqual({
      kind: 'question',
      index: 2,
      paused: false,
    })
  })

  it('firstUnanswered', () => {
    expect(firstUnanswered([true, false, false])).toBe(1)
    expect(firstUnanswered([true, true])).toBe(-1)
  })
})

describe('voterReducer', () => {
  it('goes to a step, remembering "Canvia" until the next move', () => {
    const changed = voterReducer(local(), { type: 'go', step: { name: 'question', index: 1 }, returnToReview: true })
    expect(changed).toMatchObject({ step: { name: 'question', index: 1 }, returnToReview: true })
    expect(voterReducer(changed, { type: 'go', step: { name: 'review' } }).returnToReview).toBe(false)
  })

  it('a restored history step drops "Canvia"', () => {
    const state = local({ returnToReview: true })
    expect(voterReducer(state, { type: 'restore', step: { name: 'welcome' } })).toMatchObject({
      step: { name: 'welcome' },
      returnToReview: false,
    })
  })

  it('keeps answers and memos by field name, and a new answer clears the last cast error', () => {
    let state = voterReducer(local({ castError: 'boom' }), { type: 'answer', key: '0', value: '1' })
    state = voterReducer(state, { type: 'answer', key: '1', value: ['0', '2'] })
    state = voterReducer(state, { type: 'memo', key: '1', value: 'Other' })
    expect(state).toMatchObject({ answers: { '0': '1', '1': ['0', '2'] }, memos: { '1': 'Other' }, castError: null })
  })

  it('names the question a refused cast belongs to, and does not date it as late', () => {
    const refused = voterReducer(local(), { type: 'castFailed', message: 'x', questionId: 'q2' })
    expect(refused).toMatchObject({ castQuestionId: 'q2', castFailedAt: null, castUnconfirmed: false })
  })

  it('remembers the questions the voter was seen ineligible for, until sign out', () => {
    const seen = voterReducer(local(), { type: 'ineligibleSeen', questionIds: ['q1', 'q3'] })
    expect(seen.ineligible).toEqual(['q1', 'q3'])
    expect(voterReducer(seen, { type: 'ineligibleSeen', questionIds: ['q3'] })).toBe(seen)
    expect(voterReducer(seen, { type: 'signedOut' }).ineligible).toEqual([])
  })

  it('tracks a cast', () => {
    const failed = voterReducer(local(), { type: 'castFailed', message: 'Your vote could not be cast: x' })
    expect(failed.castError).toBe('Your vote could not be cast: x')
    expect(voterReducer(failed, { type: 'castStarted' }).castError).toBeNull()
    expect(voterReducer(failed, { type: 'castSucceeded' })).toMatchObject({ castDone: true, castError: null })
  })

  it('keeps when the last failed cast was refused, for the late-cast check', () => {
    const failed = voterReducer(local(), { type: 'castFailed', message: 'x', at: 1_000 })
    expect(failed.castFailedAt).toBe(1_000)
    expect(voterReducer(local(), { type: 'castFailed', message: 'x' }).castFailedAt).toBeNull()
  })

  it('remembers whether a failed cast could not learn its outcome, until the next cast or answer (gate-2 N2)', () => {
    const unknown = voterReducer(local(), { type: 'castFailed', message: 'x', unconfirmed: true })
    expect(unknown.castUnconfirmed).toBe(true)
    expect(voterReducer(local(), { type: 'castFailed', message: 'x' }).castUnconfirmed).toBe(false)
    expect(voterReducer(unknown, { type: 'castStarted' }).castUnconfirmed).toBe(false)
    expect(voterReducer(unknown, { type: 'answer', key: '0', value: '1' }).castUnconfirmed).toBe(false)
    expect(voterReducer(unknown, { type: 'signedOut' }).castUnconfirmed).toBe(false)
  })

  it('keeps what a cast sent, so an answer typed later never shows as sent (gate F2)', () => {
    const started = voterReducer(local({ answers: { '0': '1' } }), { type: 'castStarted' })
    expect(started.sent).toEqual({ '0': '1' })
    const later = voterReducer(started, { type: 'answer', key: '0', value: '0' })
    expect(shownAnswer(later, '0', ON_CHAIN_NOTICE)).toBe('1')
    expect(shownAnswer(later, '0', undefined)).toBe('0')
    // On chain from another device: nothing of this session to show.
    expect(shownAnswer(local({ answers: { '1': '0' } }), '1', ON_CHAIN_NOTICE)).toBeUndefined()
  })

  it('sets the results and receipt flags; navigating clears the results view', () => {
    const results = voterReducer(local(), { type: 'viewResults', on: true })
    expect(results.viewResults).toBe(true)
    expect(voterReducer(results, { type: 'checkReceipt' })).toMatchObject({ checkReceipt: true, viewResults: false })
    expect(voterReducer({ ...results, checkReceipt: true }, { type: 'leaveReceipt' })).toMatchObject({
      checkReceipt: false,
    })
    expect(voterReducer(results, { type: 'go', step: { name: 'welcome' } }).viewResults).toBe(false)
  })

  it('a cast closes any results view, so its receipt shows first', () => {
    expect(voterReducer(local({ viewResults: true }), { type: 'castStarted' }).viewResults).toBe(false)
  })

  it('signing out forgets everything, answers included', () => {
    const state = local({ answers: { '0': '1' }, memos: { '0': 'x' }, step: { name: 'review' }, castDone: true })
    expect(voterReducer(state, { type: 'signedOut' })).toEqual(initialVoterState)
    expect(voterReducer(state, { type: 'signedOut', notice: 'sessionExpired' }).notice).toBe('sessionExpired')
  })
})

describe('history.state mirroring', () => {
  it('stores the step only, next to what the page already keeps there', () => {
    expect(historyStateFor({ other: 1 }, { name: 'question', index: 2 })).toEqual({
      other: 1,
      voterStep: { name: 'question', index: 2 },
    })
    expect(historyStateFor(null, { name: 'review' })).toEqual({ voterStep: { name: 'review' } })
  })

  it('reads a step back, and nothing else', () => {
    expect(stepFromHistory({ voterStep: { name: 'question', index: 1 } })).toEqual({ name: 'question', index: 1 })
    expect(stepFromHistory({ voterStep: { name: 'review' } })).toEqual({ name: 'review' })
    expect(stepFromHistory({ voterStep: { name: 'question', index: -1 } })).toBeNull()
    expect(stepFromHistory({ voterStep: { name: 'question', index: '1' } })).toBeNull()
    expect(stepFromHistory({ voterStep: 'welcome' })).toBeNull()
    expect(stepFromHistory(null)).toBeNull()
  })
})

const q = (over: Partial<VotingProcessQuestion>): VotingProcessQuestion =>
  ({
    id: 'q',
    title: { default: 'Q' },
    choices: [
      { title: { default: 'A' }, value: 0 },
      { title: { default: 'B' }, value: 1 },
      { title: { default: 'C' }, value: 2 },
    ],
    ...over,
  }) as VotingProcessQuestion
const single = q({
  type: 'singlechoice',
  ballotProtocol: {
    maxCount: 1,
    maxValue: 2,
    maxVoteOverwrites: 0,
    costExponent: 1,
    uniqueValues: false,
    maxTotalCost: 0,
    costFromWeight: false,
  },
})
const multiple = (min: number, max: number) =>
  q({
    type: 'multichoice',
    typeSetup: { maxChoices: max, minChoices: min, uniqueChoices: false },
    ballotProtocol: {
      maxCount: 3,
      maxValue: 1,
      maxVoteOverwrites: 0,
      costExponent: 1,
      uniqueValues: false,
      maxTotalCost: max,
      costFromWeight: false,
    },
  })
// A pick-slot multiple choice whose protocol reserves abstain values: the SDK accepts choosing nothing.
const blankable = q({
  type: 'multichoice',
  typeSetup: { maxChoices: 2, minChoices: 0, uniqueChoices: false },
  ballotProtocol: {
    maxCount: 2,
    maxValue: 4,
    maxVoteOverwrites: 0,
    costExponent: 1,
    uniqueValues: true,
    maxTotalCost: 0,
    costFromWeight: false,
  },
})
const ranked = q({
  metadata: { type: { name: 'ranked' } },
  ballotProtocol: {
    maxCount: 3,
    maxValue: 2,
    maxVoteOverwrites: 0,
    costExponent: 1,
    uniqueValues: true,
    maxTotalCost: 0,
    costFromWeight: false,
  },
})

describe('isAnswered', () => {
  it('single choice: one value', () => {
    expect(isAnswered(single, '1')).toBe(true)
    expect(isAnswered(single, '')).toBe(false)
    expect(isAnswered(single, undefined)).toBe(false)
  })

  it('multiple choice: a count within the question range, chosen on purpose', () => {
    expect(isAnswered(multiple(1, 2), ['0'])).toBe(true)
    expect(isAnswered(multiple(1, 2), ['0', '1', '2'])).toBe(false)
    expect(isAnswered(multiple(1, 2), [])).toBe(false)
    // A blank vote is an empty list the voter chose; an untouched field ('') is not an answer.
    expect(isAnswered(blankable, [])).toBe(true)
    expect(isAnswered(blankable, '')).toBe(false)
  })

  it('ranked: every position filled', () => {
    expect(isAnswered(ranked, ['2', '0', '1'])).toBe(true)
    expect(isAnswered(ranked, ['2', '', '1'])).toBe(false)
    expect(isAnswered(ranked, ['2', '0'])).toBe(false)
  })

  it('approval: one at least and no more than its cap (gate F10)', () => {
    const approval = q({
      metadata: { type: { name: 'approval' } },
      typeSetup: { maxChoices: 2, minChoices: 1, uniqueChoices: false },
    })
    expect(isAnswered(approval, ['0'])).toBe(true)
    expect(isAnswered(approval, ['0', '2'])).toBe(true)
    expect(isAnswered(approval, ['0', '1', '2'])).toBe(false)
    expect(isAnswered(approval, [])).toBe(false)
  })

  it('approval: a cap is reported only when it is below the options (gate F10)', () => {
    const approval = (maxChoices?: number) =>
      q({ metadata: { type: { name: 'approval' } }, typeSetup: { maxChoices, minChoices: 1, uniqueChoices: false } })
    expect(approvalCap(approval(2))).toBe(2)
    expect(approvalCap(approval(3))).toBeUndefined()
    expect(approvalCap(approval())).toBeUndefined()
    expect(approvalCap(single)).toBeUndefined()
  })

  // Gate-2 N4: the flow's rule is the only guard on an approval's cap, so it is pinned to the SDK's own range, the
  // number its fields and badge read, for every way a question can declare that cap.
  it('approval: answered exactly when 1 <= count <= questionSelectionRange(question).max (gate-2 N4)', () => {
    const protocol = (maxTotalCost: number) => ({
      maxCount: 3,
      maxValue: 1,
      maxVoteOverwrites: 0,
      costExponent: 1,
      uniqueValues: false,
      maxTotalCost,
      costFromWeight: false,
    })
    const approvals = [
      q({
        metadata: { type: { name: 'approval' } },
        typeSetup: { maxChoices: 1, minChoices: 1, uniqueChoices: false },
      }),
      q({
        metadata: { type: { name: 'approval' } },
        typeSetup: { maxChoices: 2, minChoices: 1, uniqueChoices: false },
      }),
      q({ metadata: { type: { name: 'approval' } } }),
      q({ metadata: { type: { name: 'approval' } }, ballotProtocol: protocol(2) }),
    ] as VotingProcessQuestion[]
    expect(approvals.map((question) => questionSelectionRange(question).max)).toEqual([1, 2, 3, 2])
    for (const question of approvals) {
      const { max } = questionSelectionRange(question)
      for (let count = 0; count <= question.choices.length; count++) {
        const answer = question.choices.slice(0, count).map((choice) => String(choice.value))
        expect(isAnswered(question, answer)).toBe(count >= 1 && count <= max)
      }
    }
  })

  it('approval: the encoder takes a selection over the cap, which is why the rule above guards it (gate-2 N4)', () => {
    const approval = q({
      metadata: { type: { name: 'approval' } },
      typeSetup: { maxChoices: 2, minChoices: 1, uniqueChoices: false },
    })
    // If this ever throws, the encoder guards the cap too: say so in the comment on the approval rule.
    expect(() => encodeQuestionSelections(approval, [0, 1, 2])).not.toThrow()
    expect(isAnswered(approval, ['0', '1', '2'])).toBe(false)
  })

  it('budget and quadratic questions are never answered here (gate F10)', () => {
    expect(isAnswered(q({ metadata: { type: { name: 'budget-based' } } }), '1')).toBe(false)
    expect(isAnswered(q({ metadata: { type: { name: 'quadratic' } } }), '1')).toBe(false)
  })

  it('a locked question counts as done; a question with no ballot type never does', () => {
    expect(isAnswered(single, undefined, true)).toBe(true)
    expect(isAnswered(q({ type: '' }), '1')).toBe(false)
  })

  it('offers a blank vote only where the range allows choosing nothing', () => {
    expect(allowsBlankVote(blankable)).toBe(true)
    // A dense multiple choice always asks for one at least, whatever its typeSetup says.
    expect(allowsBlankVote(multiple(0, 2))).toBe(false)
    expect(allowsBlankVote(single)).toBe(false)
  })
})

describe('chainRecordOf (gate-2 N2)', () => {
  const record = (over: Partial<Parameters<typeof chainRecordOf>[0]> = {}) =>
    chainRecordOf({ onChain: false, status: undefined, pending: false, outcomeUnknown: false, ...over })

  it('on chain wins over any status', () => {
    expect(record({ onChain: true, status: 'failed', pending: true, outcomeUnknown: true })).toBe('recorded')
  })

  it('a refused relay, a signature that never came, or a vote the chain was read without: not recorded', () => {
    // A refused relay keeps its transaction to resend, but it never reached the chain.
    expect(record({ status: 'failed', pending: true })).toBe('missing')
    expect(record({ status: 'signing' })).toBe('missing')
    expect(record({ status: 'unconfirmed' })).toBe('missing')
    expect(record()).toBe('missing')
  })

  it('a transaction whose landing was never checked, or an anonymous vote this tab cannot verify: unknown', () => {
    expect(record({ status: 'failed', pending: true, outcomeUnknown: true })).toBe('unknown')
    expect(record({ status: 'signed' })).toBe('unknown')
    expect(record({ status: 'submitting' })).toBe('unknown')
    expect(record({ status: 'confirming' })).toBe('unknown')
    // Once the SDK reads the chain again (it drops the stored transaction at the end), the answer is known.
    expect(record({ status: 'unconfirmed', outcomeUnknown: true })).toBe('missing')
  })
})

describe('sendingPhase (audit F15)', () => {
  it('is the lowest stage of the questions still in the batch', () => {
    expect(sendingPhase([])).toBe(1)
    expect(sendingPhase(['signing', 'submitting'])).toBe(1)
    expect(sendingPhase(['submitting', 'confirming'])).toBe(2)
    expect(sendingPhase(['confirming', 'confirmed'])).toBe(3)
    expect(sendingPhase(['confirmed', 'confirmed'])).toBe(3)
  })

  it('ignores failed, unconfirmed and signed questions; the automatic re-send starts at phase 2', () => {
    expect(sendingPhase(['failed', 'confirming', 'signed', undefined])).toBe(3)
    expect(sendingPhase(['submitting', 'unconfirmed'])).toBe(2)
    // A question already on chain is not in the batch of a re-send (gate F15).
    expect(batchSize(['submitting', 'unconfirmed', 'confirmed', undefined])).toBe(1)
  })
})

describe('verifyReceipt ("Verifica el teu comprovant", anonymous census)', () => {
  it('shows its own screen from any state that links to it, and "Enrere" returns to where it came from', () => {
    // From the closed screen, from the final results and from an already-voted screen, with no identification.
    expect(screen({ status: 'ENDED', connected: false }, { verifyReceipt: true })).toEqual({ kind: 'verifyReceipt' })
    expect(screen({ status: 'ENDED', connected: false }, { verifyReceipt: true, viewResults: true })).toEqual({
      kind: 'verifyReceipt',
    })
    expect(screen({ hasVoted: true }, { verifyReceipt: true })).toEqual({ kind: 'verifyReceipt' })
    // Back: the flag goes and the screen underneath comes back unchanged.
    expect(screen({ status: 'ENDED', connected: false }, { viewResults: true })).toEqual({
      kind: 'results',
      state: 'final',
    })
    expect(screen({ status: 'ENDED', connected: false })).toEqual({ kind: 'closed' })
    expect(screen({ hasVoted: true })).toEqual({ kind: 'alreadyVoted' })
  })

  it('never interrupts a cast in flight', () => {
    expect(screen({ voting: true }, { verifyReceipt: true })).toEqual({ kind: 'sending' })
  })

  it('is set and cleared by its own action and cleared by signing out', () => {
    const open = voterReducer(local(), { type: 'verifyReceipt', on: true })
    expect(open.verifyReceipt).toBe(true)
    expect(voterReducer(open, { type: 'verifyReceipt', on: false }).verifyReceipt).toBe(false)
    expect(voterReducer(open, { type: 'signedOut' }).verifyReceipt).toBe(false)
  })
})

describe('formValuesFor', () => {
  it('builds the SDK form values from the flow, memos under `memo`', () => {
    expect(formValuesFor({ answers: { '0': '1' }, memos: {} })).toEqual({ '0': '1' })
    expect(formValuesFor({ answers: { '0': '1' }, memos: { '0': 'x' } })).toEqual({ '0': '1', memo: { '0': 'x' } })
  })
})

describe('deriveVoterScreen: question by question (boards V4VoterWideLive, M4VoterLive)', () => {
  it('keeps the shared screens: upcoming, canceled, not eligible, session lost, checking', () => {
    const ready = roomOf(['toOpen', 'toOpen'], 'ready')
    expect(screen(qbq(ready, { status: 'UPCOMING', connected: false }))).toEqual({ kind: 'upcoming' })
    expect(screen(qbq(LIVE, { status: 'CANCELED' }))).toEqual({ kind: 'canceled' })
    expect(screen(qbq(LIVE, { membership: 'notInProcess' }))).toEqual({ kind: 'notEligible' })
    expect(screen(qbq(LIVE, { membership: 'sessionLost' }))).toEqual({ kind: 'identify', notice: 'sessionExpired' })
    expect(screen(qbq(LIVE, { voterStateReady: false }))).toEqual({ kind: 'checking' })
  })

  it('0. no question opened yet: the vote has not started', () => {
    expect(screen(qbq(roomOf(['toOpen', 'toOpen', 'toOpen'], 'ready'), { status: 'PAUSED' }))).toEqual({
      kind: 'roomNotStarted',
    })
  })

  it('2. an open question takes the voter to its ballot, never to notEligible (SDK #118 isAbleToVote)', () => {
    expect(screen(qbq(LIVE))).toEqual({ kind: 'roomQuestion', index: 2, paused: false })
    expect(screen(qbq(LIVE, { isAbleToVote: false }))).toEqual({ kind: 'roomQuestion', index: 2, paused: false })
  })

  it('1. "Enrere" leaves the ballot for the room until the voter goes back; it never holds the next question', () => {
    expect(screen(qbq(LIVE), { parked: 'q3' })).toEqual({ kind: 'roomOpen', index: 2 })
    const next = roomOf([['closed', 'recorded', 1], ['closed', 'recorded', 2], ['closed', 'none', 3], 'open'])
    expect(screen(qbq(next), { parked: 'q3' })).toEqual({ kind: 'roomQuestion', index: 3, paused: false })
  })

  it('3b. a skipped open question: nothing cast, and it can still be voted', () => {
    expect(screen(qbq(LIVE), { skipped: ['q3'] })).toEqual({ kind: 'roomSkipped', index: 2 })
    expect(screen(qbq(LIVE), { skipped: ['q3'], parked: 'q3' })).toEqual({ kind: 'roomSkipped', index: 2 })
  })

  it('3. the open question cast: recorded, authorised elsewhere (anonymous) or lost', () => {
    const cast = (record: RoomCast) =>
      roomOf([['closed', 'recorded', 1], ['closed', 'recorded', 2], ['open', record], 'toOpen'])
    expect(screen(qbq(cast('recorded')))).toEqual({ kind: 'roomVoted', index: 2, record: 'recorded' })
    expect(screen(qbq(cast('authorised')))).toEqual({ kind: 'roomVoted', index: 2, record: 'authorised' })
    expect(screen(qbq(cast('lost')))).toEqual({ kind: 'roomVoted', index: 2, record: 'lost' })
    // A stored transaction waiting to be re-sent is not cast yet: its ballot shows the SDK's notice.
    expect(screen(qbq(cast('pending')))).toEqual({ kind: 'roomQuestion', index: 2, paused: false })
    // Voted, then skipped earlier: the vote wins.
    expect(screen(qbq(cast('recorded')), { skipped: ['q3'] })).toEqual({
      kind: 'roomVoted',
      index: 2,
      record: 'recorded',
    })
    // Every question cast while the last one is still open: frame 3, not "Ja has votat".
    const last = roomOf([
      ['closed', 'recorded', 1],
      ['open', 'recorded'],
    ])
    expect(screen(qbq(last, { hasVoted: true }))).toEqual({ kind: 'roomVoted', index: 1, record: 'recorded' })
  })

  it('3c. the question that closed last was not cast, skipped or not: closed without voting', () => {
    const missed = roomOf([['closed', 'recorded', 1], ['closed', 'recorded', 2], ['closed', 'none', 3], 'toOpen'])
    expect(screen(qbq(missed, { status: 'PROCESS_UNKNOWN' }))).toEqual({ kind: 'roomMissed', index: 2 })
    expect(screen(qbq(missed, { status: 'PROCESS_UNKNOWN' }), { skipped: ['q3'] })).toEqual({
      kind: 'roomMissed',
      index: 2,
    })
  })

  describe('3d, 3e. the creator shows the result of each closed question', () => {
    const closed = (cast: RoomCast, showsResult: boolean) =>
      roomOf([['closed', 'recorded', 1], ['closed', cast, 2], 'toOpen'], 'live', showsResult)
    const between = { status: 'PROCESS_UNKNOWN' } as const

    it('3d. closed without voting: the result shows, skipped or never voted', () => {
      const expected = { kind: 'roomMissed', index: 1, result: true }
      expect(screen(qbq(closed('none', true), between))).toEqual(expected)
      expect(screen(qbq(closed('none', true), between), { skipped: ['q2'] })).toEqual(expected)
    })

    it('3e. closed after voting: the result shows', () => {
      expect(screen(qbq(closed('recorded', true), between))).toEqual({ kind: 'roomClosedVoted', index: 1 })
    })

    it('without the key the frames stay 3c and 4', () => {
      expect(screen(qbq(closed('none', false), between))).toEqual({ kind: 'roomMissed', index: 1 })
      expect(screen(qbq(closed('recorded', false), between))).toEqual({ kind: 'roomNone' })
    })

    it('a vote that is not on chain is never told as voted, nor as not voted (gate-3 F2, F3)', () => {
      expect(screen(qbq(closed('lost', true), between))).toEqual({
        kind: 'roomMissed',
        index: 1,
        result: true,
        record: 'lost',
      })
      expect(screen(qbq(closed('unknown', true), between))).toEqual({
        kind: 'roomMissed',
        index: 1,
        result: true,
        record: 'unknown',
      })
      expect(screen(qbq(closed('authorised', true), between))).toEqual({ kind: 'roomNone' })
    })

    it('lasts until the next question opens, then its ballot', () => {
      const next = roomOf([['closed', 'recorded', 1], ['closed', 'recorded', 2], 'open'], 'live', true)
      expect(screen(qbq(next))).toEqual({ kind: 'roomQuestion', index: 2, paused: false })
    })

    it('a held (paused) vote shows the paused screen, not the result', () => {
      const held = roomOf([['closed', 'recorded', 1], 'toOpen'], 'paused', true)
      expect(screen(qbq(held, between))).toEqual({ kind: 'paused' })
    })
  })

  it('3c. a cast lost or of unknown outcome says so, never "No l\'has votada" (gate-3 F2, F3)', () => {
    const between = { status: 'PROCESS_UNKNOWN' } as const
    const lost = roomOf([['closed', 'recorded', 1], ['closed', 'lost', 2], 'toOpen'])
    expect(screen(qbq(lost, between))).toEqual({ kind: 'roomMissed', index: 1, record: 'lost' })
    const unknown = roomOf([['closed', 'recorded', 1], ['closed', 'unknown', 2], 'toOpen'])
    expect(screen(qbq(unknown, between))).toEqual({ kind: 'roomMissed', index: 1, record: 'unknown' })
    // Still open, a cast of unknown outcome keeps its ballot (the error and "Torna-ho a provar"), as a pending one does.
    const open = roomOf([['closed', 'recorded', 1], ['open', 'unknown'], 'toOpen'])
    expect(screen(qbq(open))).toEqual({ kind: 'roomQuestion', index: 1, paused: false })
  })

  describe('3c. late cast: voter pressed the button as the organiser closed the question (gate-3 F2 extension)', () => {
    const between = { status: 'PROCESS_UNKNOWN' } as const

    // lateCastOf is the single source of the late-cast rule; the provider uses it to convert 'pending' to 'late'
    // before deriveRoomScreen runs, so the screen sees 'late' directly (the 'cast already set' case below).
    const ENDED_AT = Date.parse('2026-06-01T12:00:00.000Z')
    const refused = {
      castQuestionId: 'q2',
      castError: 'question closed',
      castUnconfirmed: false,
      castFailedAt: ENDED_AT + 5_000,
    }

    it('lateCastOf: refused after the question ended = true', () => {
      expect(lateCastOf('pending', 'q2', refused, ENDED_AT)).toBe(true)
      expect(lateCastOf('pending', 'q2', { ...refused, castFailedAt: ENDED_AT }, ENDED_AT)).toBe(true)
    })

    it('lateCastOf: refused a few seconds before the end, within the clock tolerance, is still late', () => {
      expect(lateCastOf('pending', 'q2', { ...refused, castFailedAt: ENDED_AT - 5_000 }, ENDED_AT)).toBe(true)
      expect(
        lateCastOf('pending', 'q2', { ...refused, castFailedAt: ENDED_AT - VOTER_CLOCK_TOLERANCE_MS }, ENDED_AT)
      ).toBe(true)
    })

    it('lateCastOf: refused well before the question ended is a failed cast, whatever happens after (gate-3 F2)', () => {
      expect(
        lateCastOf('pending', 'q2', { ...refused, castFailedAt: ENDED_AT - VOTER_CLOCK_TOLERANCE_MS - 1 }, ENDED_AT)
      ).toBe(false)
      expect(lateCastOf('pending', 'q2', { ...refused, castError: 'The CSP did not sign' }, null)).toBe(false)
    })

    it('lateCastOf: castUnconfirmed means unknown outcome, not a refusal', () => {
      expect(lateCastOf('pending', 'q2', { ...refused, castUnconfirmed: true }, ENDED_AT)).toBe(false)
    })

    it('lateCastOf: castQuestionId does not match', () => {
      expect(lateCastOf('pending', 'q2', { ...refused, castQuestionId: 'q1' }, ENDED_AT)).toBe(false)
    })

    it('lateCastOf: no castError or no refusal instant', () => {
      expect(lateCastOf('pending', 'q2', { ...refused, castError: null }, ENDED_AT)).toBe(false)
      expect(lateCastOf('pending', 'q2', { ...refused, castFailedAt: null }, ENDED_AT)).toBe(false)
    })

    it('lateCastOf: non-pending cast is never late', () => {
      expect(lateCastOf('none', 'q2', refused, ENDED_AT)).toBe(false)
      expect(lateCastOf('late', 'q2', refused, ENDED_AT)).toBe(false)
      expect(lateCastOf('recorded', 'q2', refused, ENDED_AT)).toBe(false)
    })

    it('cast already set to late by the provider: roomMissed with record late', () => {
      // The provider converts pending → late via lateCastOf; deriveRoomScreen sees 'late' directly.
      const room = roomOf([['closed', 'recorded', 1], ['closed', 'late', 2], 'toOpen'])
      expect(screen(qbq(room, between))).toEqual({ kind: 'roomMissed', index: 1, record: 'late' })
    })

    it('with the result card when the creator shows this question result', () => {
      const room = roomOf([['closed', 'recorded', 1], ['closed', 'late', 2], 'toOpen'], 'live', true)
      expect(screen(qbq(room, between))).toEqual({ kind: 'roomMissed', index: 1, result: true, record: 'late' })
    })
  })

  describe('a question the check leaves this voter out of (canVote false, gate-3 F10)', () => {
    const notFor = (room: RoomFacts, id: string): RoomFacts => ({
      ...room,
      questions: room.questions.map((question) => (question.id === id ? { ...question, eligible: false } : question)),
    })

    it('open: its own frame, no ballot', () => {
      expect(screen(qbq(notFor(LIVE, 'q3')))).toEqual({ kind: 'roomNotEligible', index: 2 })
    })

    it('closed: nothing to tell, never "No l\'has votada"', () => {
      const closed = notFor(roomOf([['closed', 'recorded', 1], ['closed', 'none', 2], 'toOpen']), 'q2')
      expect(screen(qbq(closed, { status: 'PROCESS_UNKNOWN' }))).toEqual({ kind: 'roomNone' })
    })

    it('held by a pause: the paused screen, not its ballot', () => {
      const held = notFor(roomOf([['closed', 'recorded', 1], 'paused', 'toOpen'], 'paused'), 'q2')
      expect(screen(qbq(held, { status: 'PROCESS_UNKNOWN' }))).toEqual({ kind: 'paused' })
    })

    it('an open question the SDK skips (its form locks it) does not block the one the voter can cast', () => {
      const two = roomOf([['closed', 'recorded', 1], 'open', 'open'])
      const skipped: RoomFacts = {
        ...two,
        questions: two.questions.map((question) =>
          question.id === 'q3' ? { ...question, skippedBySdk: true } : question
        ),
      }
      expect(screen(qbq(skipped))).toEqual({ kind: 'roomQuestion', index: 1, paused: false })
      expect(roomCastBlocked(skipped.questions, 1)).toBe(false)
    })

    it('an open question only the check leaves out of still blocks, as the SDK would sign it', () => {
      expect(roomCastBlocked(notFor(roomOf([['closed', 'recorded', 1], 'open', 'open']), 'q3').questions, 1)).toBe(true)
    })

    it('no question the voter may vote, and none cast: not eligible, as a non-member', () => {
      const none = roomOf(['open', 'toOpen'])
      const all = { ...none, questions: none.questions.map((question) => ({ ...question, eligible: false })) }
      expect(screen(qbq(all))).toEqual({ kind: 'notEligible' })
    })
  })

  describe('two questions open at once (only through the API, gate-3 F10)', () => {
    it('blocks the cast while another open question is not cast, as the SDK would sign both', () => {
      const two = roomOf([['closed', 'recorded', 1], 'open', 'open'])
      expect(screen(qbq(two))).toEqual({ kind: 'roomQuestion', index: 1, paused: false, blocked: true })
    })

    it('shows the open question still to vote, unblocked, once the other is cast', () => {
      const first = roomOf([['open', 'recorded'], 'open', 'toOpen'])
      expect(screen(qbq(first))).toEqual({ kind: 'roomQuestion', index: 1, paused: false })
      const second = roomOf(['open', ['open', 'recorded'], 'toOpen'])
      expect(screen(qbq(second))).toEqual({ kind: 'roomQuestion', index: 0, paused: false })
    })
  })

  it('an all-at-once vote has no room, so the key changes nothing', () => {
    expect(screen({ status: 'ENDED' }, { checkReceipt: true })).toEqual(
      screen({ status: 'ENDED', room: null }, { checkReceipt: true })
    )
    expect(screen({ hasVoted: true })).toEqual({ kind: 'alreadyVoted' })
  })

  it('4. none open after a cast question, or between questions: no unavailable screen', () => {
    const none = roomOf([['closed', 'recorded', 1], ['closed', 'none', 2], ['closed', 'recorded', 3], 'toOpen'])
    expect(screen(qbq(none, { status: 'PROCESS_UNKNOWN' }))).toEqual({ kind: 'roomNone' })
  })

  it('the paused vote: the held question keeps its ballot (M2), anything else is the paused screen (M1)', () => {
    const held = roomOf([['closed', 'recorded', 1], 'paused', 'toOpen'], 'paused')
    expect(screen(qbq(held, { status: 'PROCESS_UNKNOWN' }))).toEqual({ kind: 'roomQuestion', index: 1, paused: true })
    expect(screen(qbq(held, { status: 'PROCESS_UNKNOWN' }), { skipped: ['q2'] })).toEqual({ kind: 'paused' })
    expect(screen(qbq(held, { status: 'PROCESS_UNKNOWN' }), { parked: 'q2' })).toEqual({ kind: 'paused' })
    const castHeld = roomOf([['closed', 'recorded', 1], ['paused', 'recorded'], 'toOpen'], 'paused')
    expect(screen(qbq(castHeld, { status: 'PROCESS_UNKNOWN' }))).toEqual({ kind: 'paused' })
    // Resumed: the skipped question is still skipped (R10: it can be voted while open).
    expect(screen(qbq(LIVE), { skipped: ['q3'] }).kind).toBe('roomSkipped')
  })

  it('5. after the end, "Comprova el teu vot" shows the codes of any cast question, else the closed screen', () => {
    const ended = roomOf(
      [
        ['closed', 'recorded', 1],
        ['closed', 'none', 2],
      ],
      'closed'
    )
    expect(screen(qbq(ended, { status: 'ENDED' }), { checkReceipt: true })).toEqual({ kind: 'alreadyVoted' })
    const none = roomOf(
      [
        ['closed', 'none', 1],
        ['closed', 'none', 2],
      ],
      'closed'
    )
    expect(screen(qbq(none, { status: 'ENDED' }), { checkReceipt: true })).toEqual({ kind: 'closed' })
    // Every question over with a canceled one (no single stored status says ended): the same rule.
    const mixed = roomOf([['closed', 'recorded', 1], 'canceled'], 'closed')
    expect(screen(qbq(mixed, { status: 'PROCESS_UNKNOWN' }))).toEqual({ kind: 'alreadyVoted' })
  })

  it('no results on the voter screen while a question-by-question vote runs (R11 default)', () => {
    expect(screen(qbq(LIVE), { viewResults: true })).toEqual({ kind: 'results', state: 'hidden' })
    expect(screen(qbq(LIVE, { connected: false }), { viewResults: true })).toEqual({ kind: 'results', state: 'hidden' })
    // The all-at-once vote keeps its live results.
    expect(screen({}, { viewResults: true })).toEqual({ kind: 'results', state: 'provisional' })
  })

  it('follows the reads with no reload: opens, casts, closes, opens the next, skips, closes, ends', () => {
    const reads: [RoomFacts, Partial<VoterFacts>][] = [
      [roomOf(['toOpen', 'toOpen', 'toOpen'], 'ready'), { status: 'PAUSED' }],
      [roomOf(['open', 'toOpen', 'toOpen']), {}],
      [roomOf([['open', 'recorded'], 'toOpen', 'toOpen']), {}],
      [roomOf([['closed', 'recorded', 1], 'toOpen', 'toOpen']), { status: 'PROCESS_UNKNOWN' }],
      [roomOf([['closed', 'recorded', 1], 'open', 'toOpen']), {}],
      [roomOf([['closed', 'recorded', 1], ['closed', 'none', 2], 'toOpen']), { status: 'PROCESS_UNKNOWN' }],
      [roomOf([['closed', 'recorded', 1], ['closed', 'none', 2], 'open']), {}],
      [
        roomOf(
          [
            ['closed', 'recorded', 1],
            ['closed', 'none', 2],
            ['closed', 'none', 3],
          ],
          'closed'
        ),
        { status: 'ENDED' },
      ],
    ]
    const kinds = reads.map(([room, over]) => screen(qbq(room, over), { skipped: ['q2'] }).kind)
    expect(kinds).toEqual([
      'roomNotStarted',
      'roomQuestion',
      'roomVoted',
      'roomNone',
      'roomSkipped',
      'roomMissed',
      'roomQuestion',
      'closed',
    ])
  })
})

describe('question by question helpers', () => {
  it('roomCastOf: on chain first, then the SDK status, then a pending re-send', () => {
    expect(roomCastOf({ onChain: true, status: 'signed', pending: true })).toBe('recorded')
    expect(roomCastOf({ onChain: false, status: 'confirmed', pending: false })).toBe('recorded')
    expect(roomCastOf({ onChain: false, status: 'signed', pending: false })).toBe('authorised')
    expect(roomCastOf({ onChain: false, status: 'unconfirmed', pending: false })).toBe('lost')
    expect(roomCastOf({ onChain: false, status: 'failed', pending: true })).toBe('pending')
    expect(roomCastOf({ onChain: false, status: undefined, pending: false })).toBe('none')
  })

  it('roomCastOf: a cast whose outcome is unknown may have landed, so it is never "none" (gate-3 F3)', () => {
    expect(roomCastOf({ onChain: false, status: 'failed', pending: true, outcomeUnknown: true })).toBe('unknown')
    expect(roomCastOf({ onChain: false, status: 'submitting', pending: false })).toBe('unknown')
    expect(roomCastOf({ onChain: false, status: 'confirming', pending: false })).toBe('unknown')
    // The chain wins over any doubt.
    expect(roomCastOf({ onChain: true, status: 'failed', pending: true, outcomeUnknown: true })).toBe('recorded')
  })

  it('isRoomCast counts recorded, authorised and lost', () => {
    expect(
      (['recorded', 'authorised', 'lost', 'pending', 'none'] as RoomCast[]).map((cast) => isRoomCast({ cast }))
    ).toEqual([true, true, true, false, false])
  })

  it('lastClosedIndex: the latest end time, else the agenda order', () => {
    expect(lastClosedIndex(roomOf(['toOpen']).questions)).toBe(-1)
    expect(lastClosedIndex(roomOf([['closed', 'none', 5], ['closed', 'none', 3], 'open']).questions)).toBe(0)
    expect(
      lastClosedIndex(
        roomOf([
          ['closed', 'none', null],
          ['closed', 'none', null],
        ]).questions
      )
    ).toBe(1)
  })
})

describe('voterReducer: question by question', () => {
  it('parks, skips and resumes by question id', () => {
    let state = voterReducer(initialVoterState, { type: 'park', questionId: 'q3' })
    expect(state.parked).toBe('q3')
    state = voterReducer(state, { type: 'skip', questionId: 'q3' })
    expect(state).toMatchObject({ parked: null, skipped: ['q3'] })
    state = voterReducer(state, { type: 'skip', questionId: 'q3' })
    expect(state.skipped).toEqual(['q3'])
    state = voterReducer(state, { type: 'resume', questionId: 'q3' })
    expect(state).toMatchObject({ parked: null, skipped: [] })
  })

  it('a question cast records the question it was for and never opens the receipt', () => {
    let state = voterReducer({ ...initialVoterState, answers: { '2': '0' } }, { type: 'castStarted', questionId: 'q3' })
    expect(state).toMatchObject({ castQuestionId: 'q3', sent: { '2': '0' } })
    state = voterReducer({ ...state, castError: 'x' }, { type: 'questionCastSucceeded' })
    expect(state).toMatchObject({ castDone: false, castError: null })
    // The all-at-once cast still clears it.
    expect(voterReducer(state, { type: 'castStarted' }).castQuestionId).toBeNull()
  })

  it('forgets a parked question once another question is the open one', () => {
    let state = voterReducer(initialVoterState, { type: 'park', questionId: 'q2' })
    // Question 2 closes and question 3 opens: the frame parked on question 2 has nothing left to show.
    state = voterReducer(state, { type: 'openChanged', questionId: 'q3' })
    expect(state.parked).toBeNull()
  })

  it('keeps a parked question while it stays the open one, or while no question is open (a paused vote)', () => {
    const parked = voterReducer(initialVoterState, { type: 'park', questionId: 'q2' })
    expect(voterReducer(parked, { type: 'openChanged', questionId: 'q2' }).parked).toBe('q2')
    expect(voterReducer(parked, { type: 'openChanged', questionId: null }).parked).toBe('q2')
  })

  it('a refused cast says why on its question and sends nothing, so an earlier unknown outcome stays', () => {
    const state = voterReducer(
      { ...initialVoterState, castQuestionId: 'q1', castUnconfirmed: true, uncertain: ['q1'] },
      { type: 'castRefused', questionId: 'q2', message: 'voter.room.blocked' }
    )
    expect(state).toMatchObject({ castQuestionId: 'q2', castError: 'voter.room.blocked', castUnconfirmed: false })
    expect(state.uncertain).toEqual(['q1'])
  })

  it('a definite refusal of a later cast keeps the unknown outcome of an earlier one (only a chain record settles it)', () => {
    let state = voterReducer(initialVoterState, { type: 'castStarted', questionId: 'q2' })
    state = voterReducer(state, { type: 'castFailed', message: 'errors.vote_unconfirmed', unconfirmed: true })
    state = voterReducer(state, { type: 'castStarted', questionId: 'q2' })
    state = voterReducer(state, { type: 'castFailed', message: 'errors.vote_no_open_question' })
    expect(state).toMatchObject({ castUnconfirmed: false, uncertain: ['q2'] })
  })

  it('a refusal does not replace the unknown-outcome notice of the same question', () => {
    const unknown = {
      ...initialVoterState,
      castQuestionId: 'q2',
      castError: 'errors.vote_unconfirmed',
      castUnconfirmed: true,
    }
    expect(voterReducer(unknown, { type: 'castRefused', questionId: 'q2', message: 'voter.room.blocked' })).toEqual(
      unknown
    )
  })

  it('signing out forgets what was parked and skipped', () => {
    const state = voterReducer(
      { ...initialVoterState, parked: 'q1', skipped: ['q2'], uncertain: ['q2'] },
      { type: 'signedOut' }
    )
    expect(state).toMatchObject({ parked: null, skipped: [], castQuestionId: null, uncertain: [] })
  })

  it('keeps an unknown outcome per question until that question is cast, whatever is answered meanwhile (gate-3 F3)', () => {
    let state = voterReducer(initialVoterState, { type: 'castStarted', questionId: 'q2' })
    state = voterReducer(state, { type: 'castFailed', message: 'errors.vote_unconfirmed', unconfirmed: true })
    expect(state).toMatchObject({ castUnconfirmed: true, uncertain: ['q2'] })
    state = voterReducer(state, { type: 'answer', key: '2', value: '0' })
    expect(state).toMatchObject({ castUnconfirmed: false, uncertain: ['q2'] })
    state = voterReducer(state, { type: 'castStarted', questionId: 'q2' })
    state = voterReducer(state, { type: 'questionCastSucceeded' })
    expect(state.uncertain).toEqual([])
  })
})

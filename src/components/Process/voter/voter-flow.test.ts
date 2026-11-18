import type { VotingProcessQuestion } from '@vocdoni/api-types'
import {
  allowsBlankVote,
  batchSize,
  chainRecordOf,
  deriveVoterScreen,
  encodableAnswer,
  firstUnanswered,
  formValuesFor,
  historyStateFor,
  initialVoterState,
  isAnswered,
  ON_CHAIN_NOTICE,
  sendingPhase,
  shownAnswer,
  stepFromHistory,
  voterReducer,
  type VoterFacts,
  type VoterLocalState,
} from './voter-flow'

// A connected member of an ongoing three-question vote who has answered nothing yet.
const facts = (over: Partial<VoterFacts> = {}): VoterFacts => ({
  loaded: true,
  status: 'ONGOING',
  questionByQuestion: false,
  endedBySchedule: false,
  secretUntilTheEnd: false,
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

describe('deriveVoterScreen: precedence, first match wins', () => {
  it('waits for the process read', () => {
    expect(screen({ loaded: false })).toEqual({ kind: 'checking' })
  })

  it('1. sending: a cast in flight beats everything, even a vote that just closed, paused or was canceled', () => {
    expect(screen({ voting: true, status: 'CANCELED' })).toEqual({ kind: 'sending' })
    expect(screen({ voting: true, endedBySchedule: true })).toEqual({ kind: 'sending' })
    expect(screen({ voting: true, connected: false })).toEqual({ kind: 'sending' })
  })

  it('2. receipt: a cast confirmed in this session, even once the vote closes', () => {
    expect(screen({ status: 'ENDED' }, { castDone: true })).toEqual({ kind: 'receipt' })
  })

  it('3. canceled', () => {
    expect(screen({ status: 'CANCELED', connected: false })).toEqual({ kind: 'canceled' })
  })

  it('4. unsupported: a question-by-question vote, before identification', () => {
    expect(screen({ questionByQuestion: true, connected: false })).toEqual({ kind: 'unsupported' })
    expect(screen({ questionByQuestion: true, status: 'PROCESS_UNKNOWN' })).toEqual({ kind: 'unsupported' })
  })

  it('4b. an ended question-by-question vote is closed, with its results (gate F8)', () => {
    expect(screen({ questionByQuestion: true, status: 'ENDED', connected: false })).toEqual({ kind: 'closed' })
    expect(screen({ questionByQuestion: true, endedBySchedule: true }, { viewResults: true })).toEqual({
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

  it('12b. after "Comprova el teu vot" on an ended vote: the receipt for a voter who voted, closed for one who did not', () => {
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

  it('never over sending, receipt, canceled, unsupported or upcoming', () => {
    expect(screen({ voting: true }, { viewResults: true }).kind).toBe('sending')
    expect(screen({}, { viewResults: true, castDone: true }).kind).toBe('receipt')
    expect(screen({ status: 'CANCELED' }, { viewResults: true }).kind).toBe('canceled')
    expect(screen({ questionByQuestion: true }, { viewResults: true }).kind).toBe('unsupported')
    expect(screen({ status: 'UPCOMING' }, { viewResults: true }).kind).toBe('upcoming')
    expect(screen({ connected: false, challengePending: true }, { viewResults: true }).kind).toBe('code')
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

  it('tracks a cast', () => {
    const failed = voterReducer(local(), { type: 'castFailed', message: 'Your vote could not be cast: x' })
    expect(failed.castError).toBe('Your vote could not be cast: x')
    expect(voterReducer(failed, { type: 'castStarted' }).castError).toBeNull()
    expect(voterReducer(failed, { type: 'castSucceeded' })).toMatchObject({ castDone: true, castError: null })
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
    expect(voterReducer(results, { type: 'go', step: { name: 'welcome' } }).viewResults).toBe(false)
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

  it('budget and quadratic questions are never answered here (gate F10)', () => {
    expect(isAnswered(q({ metadata: { type: { name: 'budget-based' } } }), '1')).toBe(false)
    expect(isAnswered(q({ metadata: { type: { name: 'quadratic' } } }), '1')).toBe(false)
  })

  it('a locked question counts as done; a question with no ballot type never does', () => {
    expect(isAnswered(single, undefined, true)).toBe(true)
    expect(isAnswered(q({ type: '' }), '1')).toBe(false)
  })

  it('gives a question already on chain a placeholder its encoder accepts (gate F2)', () => {
    for (const question of [single, multiple(1, 2), multiple(2, 3), ranked]) {
      expect(isAnswered(question, encodableAnswer(question))).toBe(true)
    }
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

describe('formValuesFor', () => {
  it('builds the SDK form values from the flow, memos under `memo`', () => {
    expect(formValuesFor({ answers: { '0': '1' }, memos: {} })).toEqual({ '0': '1' })
    expect(formValuesFor({ answers: { '0': '1' }, memos: { '0': 'x' } })).toEqual({ '0': '1', memo: { '0': 'x' } })
  })
})

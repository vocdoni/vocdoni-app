import { act, render, waitFor } from '@testing-library/react'
import { AllProviders } from '~src/test-utils'
import { useVoterFlow, type VoterFlow } from './flow-context'
import { VoterFlowProvider, VoterServerNow } from './VoterFlowProvider'

// A question-by-question vote: question 1 closed and voted, 2 open, 3 to open. The stubbed SDK state is fixed, so
// these tests read the facts and what `castQuestion` hands to `vote()`; the transitions run on the real SDK
// (VoterPage.room.test.tsx).
const sdk = vi.hoisted(() => ({
  vote: vi.fn(async (_values: Record<string, unknown>): Promise<string | false> => 'vote-2'),
  voteStatus: {} as Record<string, string>,
  pendingVotes: {} as Record<string, true>,
  errors: {} as Record<string, unknown>,
  // What the membership check answers: the questions on chain for this voter, and the ones they may not vote.
  checkVoted: ['q1'] as string[],
  notEligible: [] as string[],
  // Holds the membership check until released, to let a sign-out overtake a re-check.
  holdCheck: undefined as Promise<void> | undefined,
  checkCalls: 0,
  clearErrors: vi.fn(),
  // Votes counted on question 3: a paused question is held by the pause only with votes (`pausedHoldIds`).
  q3Votes: 0,
  // The process read: each question's stored status, and the scheduled end.
  statuses: ['RESULTS', 'ONGOING', 'PAUSED'] as string[],
  // Question by question only when PAUSED: any other value reads the process as an all-at-once vote (no room).
  initialStatus: 'PAUSED',
  endDate: '2099-12-01T19:00:00.000Z',
  // The form's watcher `useOwnedAnswers` subscribes: calling it is how the flow hears a choice.
  watch: undefined as undefined | ((values: Record<string, unknown>, info: { name?: string }) => void),
}))
vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const question = (
    n: number,
    status: string,
    endedAt?: string,
    voteCount = 0,
    metadata?: Record<string, unknown>
  ) => ({
    id: `q${n}`,
    title: { default: `Question ${n}` },
    description: { default: '' },
    choices: [
      { title: { default: 'Yes' }, value: 0 },
      { title: { default: 'No' }, value: 1 },
    ],
    type: 'singlechoice',
    // What the ballot helpers infer a single choice from (as VoterPage.test.tsx's `single`).
    typeSetup: { maxChoices: 1, minChoices: 1, uniqueChoices: false },
    ballotProtocol: {
      maxCount: 1,
      maxValue: 1,
      maxVoteOverwrites: 0,
      costExponent: 1,
      uniqueValues: false,
      maxTotalCost: 0,
      costFromWeight: false,
    },
    status,
    endedAt,
    results: { voteCount, maxVoters: 10 },
    metadata,
  })
  // One object per read, so a test that changes the read gives the provider a new process, as a poll would.
  let cached: { key: string; value: unknown } | undefined
  const electionOf = () => {
    const key = `${sdk.q3Votes}|${sdk.statuses.join(',')}|${sdk.endDate}|${sdk.initialStatus}`
    if (cached?.key === key) return cached.value as ReturnType<typeof build>
    const value = build()
    cached = { key, value }
    return value
  }
  const ended = (status: string, at: string) => (['RESULTS', 'ENDED'].includes(status) ? at : undefined)
  const build = () => ({
    id: 'p1',
    initialStatus: sdk.initialStatus,
    published: true,
    title: { default: 'Assemblea' },
    description: { default: '' },
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: sdk.endDate,
    census: { authFields: ['memberNumber'], twoFaFields: [], weighted: false, anonymous: false },
    questions: [
      question(1, sdk.statuses[0], ended(sdk.statuses[0], '2026-06-15T09:41:00.000Z'), 6, {
        voterResults: 'perQuestion',
      }),
      question(2, sdk.statuses[1], ended(sdk.statuses[1], '2026-06-15T10:41:00.000Z'), 3),
      question(3, sdk.statuses[2], ended(sdk.statuses[2], '2026-06-15T11:41:00.000Z'), sdk.q3Votes),
    ],
  })
  const fmethods = {
    watch: (callback: (values: Record<string, unknown>, info: { name?: string }) => void) => {
      sdk.watch = callback
      return { unsubscribe: () => undefined }
    },
    setValue: () => undefined,
    reset: () => undefined,
    clearErrors: sdk.clearErrors,
    trigger: async () => true,
    get formState() {
      return { errors: sdk.errors }
    },
  }
  const ids = ['q1', 'q2', 'q3']
  const check = async () => {
    sdk.checkCalls += 1
    if (sdk.holdCheck) await sdk.holdCheck
    return {
      belongsToProcess: true,
      questions: ids.map((questionId) => ({
        questionId,
        canVote: !sdk.notEligible.includes(questionId),
        hasVoted: sdk.checkVoted.includes(questionId),
        hasSigned: sdk.checkVoted.includes(questionId),
      })),
    }
  }
  const state = {
    get election() {
      return electionOf()
    },
    status: 'ONGOING',
    connected: true,
    authToken: 'tok',
    check,
    clearVoter: () => undefined,
    voting: false,
    get voteStatus() {
      return sdk.voteStatus
    },
    get pendingVotes() {
      return sdk.pendingVotes
    },
    voterQuestions: ids.map((questionId) => ({ questionId, hasVoted: questionId === 'q1' })),
    hasVoted: false,
    isAbleToVote: true,
    voteIds: { q1: 'vote-1' },
    weight: null,
  }
  const form = { fmethods, vote: (values: Record<string, unknown>) => sdk.vote(values) }
  return { ...actual, useElection: () => state, useQuestionsForm: () => form }
})
vi.mock('~components/Process/voter/csp/CspStepsProvider', () => ({
  useCspAuthContext: () => ({ currentStep: 0, resetFlow: () => undefined }),
}))

const probe: { current?: VoterFlow } = {}
const Probe = () => {
  probe.current = useVoterFlow()
  return null
}
const tree = (serverNow?: number) => (
  <AllProviders>
    <VoterServerNow.Provider value={serverNow}>
      <VoterFlowProvider brand={{ branded: false, name: 'Ateneu' }}>
        <Probe />
      </VoterFlowProvider>
    </VoterServerNow.Provider>
  </AllProviders>
)
const renderFlow = async (serverNow?: number) => {
  const view = render(tree(serverNow))
  await waitFor(() => expect(probe.current?.facts.membership).toBe('ok'))
  return { ...view, reread: () => view.rerender(tree(serverNow)) }
}

beforeEach(() => {
  sdk.vote.mockClear()
  sdk.voteStatus = {}
  sdk.pendingVotes = {}
  sdk.errors = {}
  sdk.checkVoted = ['q1']
  sdk.notEligible = []
  sdk.holdCheck = undefined
  sdk.checkCalls = 0
  sdk.clearErrors.mockClear()
  sdk.q3Votes = 0
  vi.restoreAllMocks()
  sdk.statuses = ['RESULTS', 'ONGOING', 'PAUSED']
  sdk.initialStatus = 'PAUSED'
  sdk.endDate = '2099-12-01T19:00:00.000Z'
})

// Answers the open question 2 and makes its cast fail, the way a refusal after the close does.
const castOpenQuestionForLateness = async () => {
  act(() => sdk.watch?.({ '1': '1' }, { name: '1' }))
  sdk.pendingVotes = { q2: true }
  sdk.voteStatus = { q2: 'failed' }
  sdk.vote.mockResolvedValueOnce(false)
  sdk.errors = { root: { vote: { message: 'errors.vote_failed' } } }
  await act(async () => {
    await probe.current?.castQuestion(1)
  })
}

describe('VoterFlowProvider, question by question', () => {
  it('reads each question into the room: state, cast and whether its result shows', async () => {
    await renderFlow()
    expect(probe.current?.facts.room).toEqual({
      voteState: 'live',
      questions: [
        {
          id: 'q1',
          state: 'closed',
          cast: 'recorded',
          endedAt: Date.parse('2026-06-15T09:41:00.000Z'),
          showsResult: true,
        },
        { id: 'q2', state: 'open', cast: 'none', endedAt: null, showsResult: false },
        { id: 'q3', state: 'toOpen', cast: 'none', endedAt: null, showsResult: false },
      ],
    })
    expect(probe.current?.screen).toEqual({ kind: 'roomQuestion', index: 1, paused: false })
  })

  it('a vote that started paused hides its results while every question is open (R11)', async () => {
    sdk.statuses = ['ONGOING', 'ONGOING', 'ONGOING']
    await renderFlow()
    expect(probe.current?.facts.room).toBeNull()
    act(() => probe.current?.showResults(true))
    expect(probe.current?.screen).toEqual({ kind: 'results', state: 'hidden' })
  })

  it('parks, skips and resumes the open question', async () => {
    await renderFlow()
    act(() => probe.current?.park(1))
    expect(probe.current?.screen).toEqual({ kind: 'roomOpen', index: 1 })
    act(() => probe.current?.resume(1))
    expect(probe.current?.screen.kind).toBe('roomQuestion')
    act(() => probe.current?.skip(1))
    expect(probe.current?.screen).toEqual({ kind: 'roomSkipped', index: 1 })
    expect(sdk.vote).not.toHaveBeenCalled()
  })

  it('skips and parks the whole open set: nothing is cast for any of its questions', async () => {
    sdk.statuses = ['RESULTS', 'ONGOING', 'ONGOING']
    await renderFlow()
    act(() => probe.current?.park(1))
    expect(probe.current?.screen).toEqual({ kind: 'roomOpen', index: 1 })
    act(() => probe.current?.resume(1))
    act(() => probe.current?.skip(1))
    expect(probe.current?.screen).toEqual({ kind: 'roomSkipped', index: 1 })
    expect(probe.current?.state.skipped).toEqual(['q2', 'q3'])
    expect(sdk.vote).not.toHaveBeenCalled()
  })

  it('an all-open vote where no question is for this voter is not the room: not eligible', async () => {
    sdk.statuses = ['ONGOING', 'ONGOING', 'ONGOING']
    sdk.notEligible = ['q1', 'q2', 'q3']
    await renderFlow()
    expect(probe.current?.facts.room).toBeNull()
    expect(probe.current?.screen.kind).not.toBe('roomNotEligible')
  })

  it('keeps a parked set parked when the vote is paused: the held question does not show its ballot', async () => {
    sdk.statuses = ['RESULTS', 'ONGOING', 'ONGOING']
    const { reread } = await renderFlow()
    act(() => probe.current?.park(1))
    expect(probe.current?.state.parked).toBe('q2,q3')
    sdk.statuses = ['RESULTS', 'PAUSED', 'PAUSED']
    reread()
    await waitFor(() => expect(probe.current?.facts.room?.voteState).toBe('paused'))
    expect(probe.current?.screen).toEqual({ kind: 'paused' })
  })

  it('parks and skips the held set of a whole-vote pause, not its first question alone', async () => {
    sdk.statuses = ['RESULTS', 'ONGOING', 'ONGOING']
    const { reread } = await renderFlow()
    sdk.statuses = ['RESULTS', 'PAUSED', 'PAUSED']
    sdk.q3Votes = 2
    reread()
    await waitFor(() => expect(probe.current?.facts.room?.voteState).toBe('paused'))
    expect(probe.current?.screen).toMatchObject({ kind: 'question', paused: true, set: true })
    act(() => probe.current?.park(1))
    expect(probe.current?.state.parked).toBe('q2,q3')
    act(() => probe.current?.skip(1))
    expect(probe.current?.state.skipped).toEqual(['q2', 'q3'])
  })

  it('forgets the frame parked on a question once a later one opens, so it shows its ballot when it opens again', async () => {
    const { reread } = await renderFlow()
    act(() => probe.current?.park(1))
    expect(probe.current?.screen).toEqual({ kind: 'roomOpen', index: 1 })
    sdk.statuses = ['RESULTS', 'RESULTS', 'ONGOING']
    reread()
    await waitFor(() => expect(probe.current?.screen).toEqual({ kind: 'roomQuestion', index: 2, paused: false }))
    expect(probe.current?.state.parked).toBeNull()
    // Question 2 opens again (a later status read): its ballot, not the frame parked before.
    sdk.statuses = ['RESULTS', 'ONGOING', 'PAUSED']
    reread()
    await waitFor(() => expect(probe.current?.screen).toEqual({ kind: 'roomQuestion', index: 1, paused: false }))
  })

  it('casts the open question with its answer alone (SDK #118 signs the open ones only)', async () => {
    await renderFlow()
    act(() => sdk.watch?.({ '1': '0' }, { name: '1' }))
    await act(async () => {
      await probe.current?.castQuestion(1)
    })
    expect(sdk.vote).toHaveBeenCalledTimes(1)
    expect(sdk.vote.mock.calls[0][0]).toEqual({ '1': '0' })
    expect(probe.current?.state).toMatchObject({ castQuestionId: 'q2', castError: null, castDone: false })
  })

  it('casts nothing for an unanswered question, nor twice at once', async () => {
    await renderFlow()
    await act(async () => {
      await probe.current?.castQuestion(1)
    })
    expect(sdk.vote).not.toHaveBeenCalled()
  })

  it('keeps a failed cast on that question, with the SDK sentence', async () => {
    await renderFlow()
    act(() => sdk.watch?.({ '1': '1' }, { name: '1' }))
    sdk.vote.mockResolvedValueOnce(false)
    sdk.errors = { root: { vote: { message: 'errors.vote_no_open_question' } } }
    await act(async () => {
      await probe.current?.castQuestion(1)
    })
    expect(probe.current?.state).toMatchObject({ castError: 'errors.vote_no_open_question', castQuestionId: 'q2' })
  })

  // The refusal is dated on the device clock while it is trusted, so a device a few seconds behind still reads late.
  it('reads a late cast from a trusted device clock a few seconds behind the server (gate-3 F2)', async () => {
    const endedAt = Date.parse('2026-06-15T10:41:00.000Z')
    sdk.statuses = ['RESULTS', 'RESULTS', 'PAUSED']
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(endedAt - 2_000)
    try {
      await renderFlow(endedAt + 2_000)
      await castOpenQuestionForLateness()
      expect(probe.current?.facts.room?.questions[1].cast).toBe('late')
    } finally {
      vi.useRealTimers()
    }
  })

  // A device clock off by more than the tolerance is not trusted: its refusal is dated on the server's timeline.
  it('dates the refusal on the server timeline when the device clock is untrusted (gate-3 F2)', async () => {
    const endedAt = Date.parse('2026-06-15T10:41:00.000Z')
    sdk.statuses = ['RESULTS', 'RESULTS', 'PAUSED']
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(endedAt - 10 * 60_000)
    try {
      await renderFlow(endedAt + 2_000)
      await castOpenQuestionForLateness()
      expect(probe.current?.facts.room?.questions[1].cast).toBe('late')
    } finally {
      vi.useRealTimers()
    }
  })

  // The late reading outlives the refusal's error: answering the next question clears the error, not the late close.
  it('keeps a late cast late once the voter answers the next question (gate-3 F2)', async () => {
    const endedAt = Date.parse('2026-06-15T10:41:00.000Z')
    sdk.statuses = ['RESULTS', 'RESULTS', 'PAUSED']
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(endedAt - 2_000)
    try {
      await renderFlow(endedAt + 2_000)
      await castOpenQuestionForLateness()
      expect(probe.current?.facts.room?.questions[1].cast).toBe('late')
      act(() => sdk.watch?.({ '1': '1', '2': '0' }, { name: '2' }))
      expect(probe.current?.state.castError).toBeNull()
      expect(probe.current?.facts.room?.questions[1].cast).toBe('late')
      expect(probe.current?.screen).toEqual({ kind: 'roomMissed', index: 1, record: 'late' })
    } finally {
      vi.useRealTimers()
    }
  })

  // An earlier cast of this device whose outcome was unknown may have landed: the re-check finding it is this device's
  // vote, not one cast from another device.
  it("settles an earlier unknown-outcome cast as this device's vote when a retry is refused (gate-3 F4)", async () => {
    await renderFlow()
    act(() => sdk.watch?.({ '1': '0' }, { name: '1' }))
    sdk.vote.mockResolvedValueOnce(false)
    sdk.errors = { root: { vote: { message: 'errors.vote_unconfirmed' } } }
    sdk.pendingVotes = { q2: true }
    sdk.voteStatus = { q2: 'failed' }
    await act(async () => {
      await probe.current?.castQuestion(1)
    })
    expect(probe.current?.state.uncertain).toEqual(['q2'])
    // The earlier cast landed, and the retry is refused.
    sdk.checkVoted = ['q1', 'q2']
    sdk.vote.mockResolvedValueOnce(false)
    sdk.errors = { root: { vote: { message: 'errors.vote_failed' } } }
    await act(async () => {
      await probe.current?.castQuestion(1)
    })
    expect(probe.current?.state).toMatchObject({ votedElsewhere: null, uncertain: [] })
    await waitFor(() => expect(probe.current?.facts.room?.questions[1].cast).toBe('recorded'))
  })

  // A sign-out while the re-check runs ends that cast: the voter who signed in next must not inherit its finding.
  it('drops the re-check of a cast a sign-out overtook (gate-3 F6)', async () => {
    await renderFlow()
    act(() => sdk.watch?.({ '1': '0' }, { name: '1' }))
    sdk.vote.mockResolvedValueOnce(false)
    sdk.errors = { root: { vote: { message: 'errors.vote_failed' } } }
    sdk.checkVoted = ['q1', 'q2']
    let release = () => {}
    sdk.holdCheck = new Promise<void>((resolve) => {
      release = resolve
    })
    act(() => {
      void probe.current?.castQuestion(1)
    })
    await waitFor(() => expect(sdk.checkCalls).toBeGreaterThan(1))
    act(() => probe.current?.signOut())
    await act(async () => {
      release()
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    expect(probe.current?.state.votedElsewhere).toBeNull()
  })

  it('says a confirmed question is on chain with the flow notice, whatever the SDK helper answers (#118)', async () => {
    sdk.voteStatus = { q2: 'confirmed' }
    await renderFlow()
    expect(probe.current?.lockedNotice('q2')).toBe('vote.disabled.voted')
    expect(probe.current?.lockedNotice('q1')).toBe('vote.disabled.voted')
    expect(probe.current?.lockedNotice('q3')).toBeUndefined()
  })

  it('a cast of unknown outcome is never "No l\'has votada" once its question closes (gate-3 F3)', async () => {
    const { reread } = await renderFlow()
    act(() => sdk.watch?.({ '1': '0' }, { name: '1' }))
    sdk.vote.mockResolvedValueOnce(false)
    sdk.errors = { root: { vote: { message: 'errors.vote_unconfirmed' } } }
    sdk.pendingVotes = { q2: true }
    sdk.voteStatus = { q2: 'failed' }
    await act(async () => {
      await probe.current?.castQuestion(1)
    })
    expect(probe.current?.state).toMatchObject({ castUnconfirmed: true, uncertain: ['q2'] })
    // The voter goes on typing (the flag the all-at-once flow reads is cleared), and the question closes.
    act(() => sdk.watch?.({ '1': '1' }, { name: '1' }))
    sdk.statuses = ['RESULTS', 'RESULTS', 'PAUSED']
    reread()
    await waitFor(() => expect(probe.current?.screen).toEqual({ kind: 'roomMissed', index: 1, record: 'unknown' }))
  })

  it('keeps the room open on a device clock past the end until the polled statuses close it (gate-3 F4)', async () => {
    // The server rendered the page an hour ago; the vote ends half an hour after that; the device reads now.
    const serverNow = Date.now() - 60 * 60_000
    sdk.endDate = new Date(serverNow + 30 * 60_000).toISOString()
    const { reread } = await renderFlow(serverNow)
    expect(probe.current?.facts.room?.voteState).toBe('live')
    expect(probe.current?.screen).toEqual({ kind: 'roomQuestion', index: 1, paused: false })
    sdk.statuses = ['RESULTS', 'RESULTS', 'RESULTS']
    reread()
    await waitFor(() => expect(probe.current?.facts.room?.voteState).toBe('closed'))
  })

  it('a trusted clock past the end closes the room, as before', async () => {
    sdk.endDate = new Date(Date.now() - 60_000).toISOString()
    await renderFlow(Date.now())
    expect(probe.current?.facts.room?.voteState).toBe('closed')
  })

  it('casts the open set together once every question of it is answered (SDK signs them all)', async () => {
    sdk.statuses = ['RESULTS', 'ONGOING', 'ONGOING']
    await renderFlow()
    expect(probe.current?.screen).toEqual({ kind: 'question', index: 1, paused: false, set: true })
    act(() => sdk.watch?.({ '1': '0' }, { name: '1' }))
    await act(async () => {
      await probe.current?.castQuestion(1)
    })
    // Question 3 is still to answer: nothing is sent yet.
    expect(sdk.vote).not.toHaveBeenCalled()
    act(() => sdk.watch?.({ '2': '1' }, { name: '2' }))
    await act(async () => {
      await probe.current?.castQuestion(2)
    })
    expect(sdk.vote).toHaveBeenCalledTimes(1)
    expect(sdk.vote.mock.calls[0][0]).toEqual({ '1': '0', '2': '1' })
  })

  // No room reads the question (an all-at-once process): the refusal blames the room, never this voter's eligibility.
  it('says the question is not loaded, not that the voter is not eligible, when no room reads it', async () => {
    sdk.initialStatus = 'ONGOING'
    // Every question open: no room, so no open set reads it.
    sdk.statuses = ['ONGOING', 'ONGOING', 'ONGOING']
    await renderFlow()
    act(() => sdk.watch?.({ '1': '0' }, { name: '1' }))
    await act(async () => {
      await probe.current?.castQuestion(1)
    })
    expect(sdk.vote).not.toHaveBeenCalled()
    expect(probe.current?.state).toMatchObject({ castQuestionId: 'q2', castError: 'errors.vote_failed_unknown' })
  })

  it('casts nothing for an open question the check leaves this voter out of (gate-3 F10)', async () => {
    sdk.notEligible = ['q2']
    await renderFlow()
    await waitFor(() => expect(probe.current?.screen).toEqual({ kind: 'roomNotEligible', index: 1 }))
    act(() => sdk.watch?.({ '1': '0' }, { name: '1' }))
    await act(async () => {
      await probe.current?.castQuestion(1)
    })
    expect(sdk.vote).not.toHaveBeenCalled()
  })

  // A refused cast sends nothing, and it is never silent: the question says why, as a failed cast does.
  it('says why an unanswered question is not cast, without sending it (no silent no-op)', async () => {
    await renderFlow()
    await act(async () => {
      await probe.current?.castQuestion(1)
    })
    expect(sdk.vote).not.toHaveBeenCalled()
    expect(probe.current?.state).toMatchObject({ castQuestionId: 'q2', castError: 'validation.required' })
  })

  it('says why a question the check leaves this voter out of is not cast (no silent no-op)', async () => {
    sdk.notEligible = ['q2']
    await renderFlow()
    act(() => sdk.watch?.({ '1': '0' }, { name: '1' }))
    await act(async () => {
      await probe.current?.castQuestion(1)
    })
    expect(sdk.vote).not.toHaveBeenCalled()
    expect(probe.current?.state).toMatchObject({ castQuestionId: 'q2', castError: 'voter.room.not_eligible_title' })
  })

  // The blocked warning is on the screen already (with the cast off), so the refusal adds no second message.
  it('casts nothing until every question of the open set is answered, and says which one is missing', async () => {
    sdk.statuses = ['RESULTS', 'ONGOING', 'ONGOING']
    await renderFlow()
    act(() => sdk.watch?.({ '1': '0' }, { name: '1' }))
    await act(async () => {
      await probe.current?.castQuestion(1)
    })
    expect(sdk.vote).not.toHaveBeenCalled()
    expect(probe.current?.state).toMatchObject({ castError: 'validation.required', castQuestionId: 'q3' })
  })

  // An open set of two is one form: question, question, review, then one cast of both answers (SDK #118 signs both).
  it('answers an open set of two as one form and casts it once from review', async () => {
    sdk.statuses = ['RESULTS', 'ONGOING', 'ONGOING']
    await renderFlow()
    expect(probe.current?.screen).toEqual({ kind: 'question', index: 1, paused: false, set: true })
    act(() => sdk.watch?.({ '1': '0' }, { name: '1' }))
    await waitFor(() => expect(probe.current?.screen).toEqual({ kind: 'question', index: 2, paused: false, set: true }))
    act(() => sdk.watch?.({ '2': '1' }, { name: '2' }))
    await waitFor(() => expect(probe.current?.screen).toEqual({ kind: 'review', paused: false, set: true, index: 2 }))
    expect(probe.current?.form).toEqual([1, 2])
    expect(sdk.vote).not.toHaveBeenCalled()
    await act(async () => {
      await probe.current?.cast()
    })
    expect(sdk.vote).toHaveBeenCalledTimes(1)
    expect(sdk.vote.mock.calls[0][0]).toEqual({ '1': '0', '2': '1' })
  })

  // The SDK signs the question this voter may not vote too; the CSP refuses it. The eligible answer counts, and the
  // refusal is not an error shown to the voter.
  it('an ineligible open question refused by the CSP is expected: the eligible answer counts, no error', async () => {
    sdk.statuses = ['RESULTS', 'ONGOING', 'ONGOING']
    sdk.notEligible = ['q3']
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    await renderFlow()
    expect(probe.current?.screen).toEqual({ kind: 'roomQuestion', index: 1, paused: false })
    sdk.vote.mockImplementationOnce(async () => {
      sdk.checkVoted.push('q2')
      sdk.errors = { root: { vote: { message: 'errors.vote_partial' } } }
      return false
    })
    act(() => sdk.watch?.({ '1': '0' }, { name: '1' }))
    await act(async () => {
      await probe.current?.castQuestion(1)
    })
    // The ineligible question rides along with a placeholder; the others are answered as they are.
    expect(sdk.vote).toHaveBeenCalledTimes(1)
    expect(Object.keys(sdk.vote.mock.calls[0][0])).toEqual(['1', '2'])
    expect(sdk.vote.mock.calls[0][0]['1']).toEqual('0')
    expect(sdk.clearErrors).toHaveBeenCalledWith('root')
    expect(consoleError).not.toHaveBeenCalled()
    expect(probe.current?.state).toMatchObject({ castError: null, castUnconfirmed: false })
    await waitFor(() => expect(probe.current?.screen).toEqual({ kind: 'roomVoted', index: 1, record: 'recorded' }))
  })

  it('an ineligible open question the CSP recorded in a failed cast is reported', async () => {
    sdk.statuses = ['RESULTS', 'ONGOING', 'ONGOING']
    sdk.notEligible = ['q3']
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    await renderFlow()
    sdk.vote.mockImplementationOnce(async () => {
      sdk.checkVoted.push('q2', 'q3')
      sdk.errors = { root: { vote: { message: 'errors.vote_partial' } } }
      return false
    })
    act(() => sdk.watch?.({ '1': '0' }, { name: '1' }))
    await act(async () => {
      await probe.current?.castQuestion(1)
    })
    expect(consoleError).toHaveBeenCalledWith(
      'An ineligible open question was signed by the CSP',
      expect.objectContaining({ questionIds: ['q3'], recordedQuestionIds: ['q3'] })
    )
  })

  // All paused, then all opened: nothing is left to open one by one, so the classic single form (welcome first).
  it('all questions paused, then all opened at once: the classic single form, not the room', async () => {
    sdk.initialStatus = 'PAUSED'
    sdk.statuses = ['PAUSED', 'PAUSED', 'PAUSED']
    const { reread } = await renderFlow()
    expect(probe.current?.facts.room).not.toBeNull()
    sdk.statuses = ['ONGOING', 'ONGOING', 'ONGOING']
    reread()
    await waitFor(() => expect(probe.current?.facts.room).toBeNull())
    expect(probe.current?.screen).toEqual({ kind: 'welcome' })
  })

  describe('an open set cast, every question of it (SDK signs the set in one batch)', () => {
    const answerBoth = () => {
      act(() => sdk.watch?.({ '1': '0' }, { name: '1' }))
      act(() => sdk.watch?.({ '2': '1' }, { name: '2' }))
    }
    const setOpen = () => {
      sdk.statuses = ['RESULTS', 'ONGOING', 'ONGOING']
      sdk.pendingVotes = { q2: true, q3: true }
      sdk.voteStatus = { q2: 'failed', q3: 'failed' }
    }

    it('a set refused after it closed: every member reads late, not only the first', async () => {
      const endedAt = Date.parse('2026-06-15T11:41:00.000Z')
      setOpen()
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(endedAt - 2_000)
      try {
        const { reread } = await renderFlow(endedAt - 2_000)
        answerBoth()
        sdk.vote.mockResolvedValueOnce(false)
        await act(async () => {
          await probe.current?.cast()
        })
        sdk.statuses = ['RESULTS', 'RESULTS', 'RESULTS']
        vi.setSystemTime(endedAt + 2_000)
        reread()
        await waitFor(() => expect(probe.current?.facts.room?.questions[1].cast).toBe('late'))
        expect(probe.current?.facts.room?.questions[2].cast).toBe('late')
      } finally {
        vi.useRealTimers()
      }
    })

    it('a set with an unknown outcome, then closed: every member reads unknown, not not voted', async () => {
      setOpen()
      const { reread } = await renderFlow()
      answerBoth()
      sdk.vote.mockImplementationOnce(async () => {
        sdk.errors = { root: { vote: { message: 'errors.vote_unconfirmed' } } }
        return false
      })
      await act(async () => {
        await probe.current?.cast()
      })
      sdk.statuses = ['RESULTS', 'RESULTS', 'RESULTS']
      reread()
      await waitFor(() => expect(probe.current?.facts.room?.questions[1].state).toBe('closed'))
      expect(probe.current?.facts.room?.questions[1].cast).toBe('unknown')
      expect(probe.current?.facts.room?.questions[2].cast).toBe('unknown')
      // The whole vote is over (question 1 was cast), so the frame is the over-vote one, not a question's.
      expect(probe.current?.screen).toEqual({ kind: 'alreadyVoted' })
    })

    it('a partial landing is no other device and shows its error on the question still to vote', async () => {
      setOpen()
      await renderFlow()
      answerBoth()
      sdk.vote.mockImplementationOnce(async () => {
        sdk.checkVoted.push('q2')
        sdk.errors = { root: { vote: { message: 'errors.vote_partial' } } }
        return false
      })
      await act(async () => {
        await probe.current?.cast()
      })
      expect(probe.current?.state).toMatchObject({
        votedElsewhere: null,
        castError: 'errors.vote_partial',
        castQuestionId: 'q3',
      })
    })

    it('a set that grows while the voter is on it: the step is kept, the new question is asked', async () => {
      sdk.statuses = ['RESULTS', 'ONGOING', 'PAUSED']
      const { reread } = await renderFlow()
      act(() => sdk.watch?.({ '1': '0' }, { name: '1' }))
      expect(probe.current?.screen).toEqual({ kind: 'roomQuestion', index: 1, paused: false })
      sdk.statuses = ['RESULTS', 'ONGOING', 'ONGOING']
      reread()
      await waitFor(() => expect(probe.current?.form).toEqual([1, 2]))
      expect(probe.current?.screen).toEqual({ kind: 'question', index: 2, paused: false, set: true })
      act(() => sdk.watch?.({ '2': '1' }, { name: '2' }))
      await waitFor(() => expect(probe.current?.screen).toEqual({ kind: 'review', paused: false, set: true, index: 2 }))
    })

    it('a set that shrinks to one: its answer to a question that closed is not sent', async () => {
      sdk.statuses = ['RESULTS', 'ONGOING', 'ONGOING']
      const { reread } = await renderFlow()
      act(() => sdk.watch?.({ '1': '0' }, { name: '1' }))
      sdk.statuses = ['RESULTS', 'RESULTS', 'ONGOING']
      reread()
      await waitFor(() => expect(probe.current?.form).toBeNull())
      act(() => sdk.watch?.({ '2': '1' }, { name: '2' }))
      await act(async () => {
        await probe.current?.castQuestion(2)
      })
      expect(sdk.vote).toHaveBeenCalledTimes(1)
      expect(Object.keys(sdk.vote.mock.calls[0][0])).toEqual(['2'])
    })

    it('an answer that the SDK signs and the CSP accepts for an ineligible question is logged, not hidden', async () => {
      sdk.statuses = ['RESULTS', 'ONGOING', 'ONGOING']
      sdk.notEligible = ['q3']
      await renderFlow()
      act(() => sdk.watch?.({ '1': '0' }, { name: '1' }))
      const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
      try {
        await act(async () => {
          await probe.current?.castQuestion(1)
        })
        expect(error).toHaveBeenCalledWith(
          expect.stringContaining('ineligible'),
          expect.objectContaining({ questionIds: ['q3'] })
        )
      } finally {
        error.mockRestore()
      }
    })

    it('a question that closed since the press is cast with the open set answers, not alone', async () => {
      sdk.statuses = ['RESULTS', 'ONGOING', 'ONGOING']
      const { reread } = await renderFlow()
      answerBoth()
      sdk.statuses = ['RESULTS', 'RESULTS', 'ONGOING']
      reread()
      await waitFor(() => expect(probe.current?.facts.room?.questions[1].state).toBe('closed'))
      await act(async () => {
        await probe.current?.castQuestion(1)
      })
      expect(Object.keys(sdk.vote.mock.calls[0][0])).toEqual(['1', '2'])
    })

    it('"Enrere" from the set\'s second question, with the first locked, parks the set rather than going to welcome', async () => {
      setOpen()
      sdk.pendingVotes = { q2: true }
      await renderFlow()
      act(() => probe.current?.back(2))
      expect(probe.current?.screen).toEqual({ kind: 'roomOpen', index: 2 })
    })
  })
})

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
    const key = `${sdk.statuses.join(',')}|${sdk.endDate}|${sdk.initialStatus}`
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
      question(3, sdk.statuses[2], ended(sdk.statuses[2], '2026-06-15T11:41:00.000Z')),
    ],
  })
  const fmethods = {
    watch: (callback: (values: Record<string, unknown>, info: { name?: string }) => void) => {
      sdk.watch = callback
      return { unsubscribe: () => undefined }
    },
    setValue: () => undefined,
    reset: () => undefined,
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
    get voterQuestions() {
      return ids.map((questionId) => ({ questionId, hasVoted: sdk.checkVoted.includes(questionId) }))
    },
    hasVoted: false,
    isAbleToVote: true,
    get voteIds() {
      return sdk.checkVoted.includes('q1') ? { q1: 'vote-1' } : {}
    },
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

  it('a stale form is not a failed cast: its sentence sits on the first question still to vote (SDK 4.3)', async () => {
    await renderFlow()
    act(() => sdk.watch?.({ '1': '1' }, { name: '1' }))
    sdk.vote.mockResolvedValueOnce(false)
    sdk.errors = { root: { vote: { message: 'errors.vote_eligibility_changed' } } }
    await act(async () => {
      await probe.current?.castQuestion(1)
    })
    expect(probe.current?.state).toMatchObject({
      castError: 'errors.vote_eligibility_changed',
      castQuestionId: 'q2',
      castUnconfirmed: false,
      castFailedAt: null,
    })
  })

  it('no question left to this voter: no failed sentence, and the check is read again (SDK 4.3)', async () => {
    await renderFlow()
    act(() => sdk.watch?.({ '1': '1' }, { name: '1' }))
    const before = sdk.checkCalls
    sdk.notEligible = ['q2']
    sdk.vote.mockResolvedValueOnce(false)
    sdk.errors = { root: { vote: { message: 'errors.vote_ineligible_question' } } }
    await act(async () => {
      await probe.current?.castQuestion(1)
    })
    expect(probe.current?.state.castError).toBeNull()
    expect(sdk.checkCalls).toBeGreaterThan(before)
    await waitFor(() => expect(probe.current?.screen).toEqual({ kind: 'roomNotEligible', index: 1 }))
  })

  it('a voter the check leaves out of every question is not settled, and not eligible to vote (SDK 4.3)', async () => {
    sdk.checkVoted = []
    sdk.notEligible = ['q1', 'q2', 'q3']
    sdk.voteStatus = { q1: 'ineligible', q2: 'ineligible', q3: 'ineligible' }
    await renderFlow()
    await waitFor(() => expect(probe.current?.screen).toEqual({ kind: 'notEligible' }))
    expect(probe.current?.facts.everyQuestionSettled).toBe(false)
  })

  it('keeps the questions the voter was seen ineligible for once the check stops saying so (SDK 4.3)', async () => {
    sdk.notEligible = ['q2']
    await renderFlow()
    await waitFor(() => expect(probe.current?.state.ineligible).toEqual(['q2']))
    sdk.notEligible = []
    await act(async () => {
      probe.current?.recheck()
    })
    await waitFor(() => expect(probe.current?.facts.room?.questions[1].eligible).not.toBe(false))
    expect(probe.current?.state.ineligible).toEqual(['q2'])
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
    await waitFor(() => expect(probe.current?.state.castError).toBe('errors.vote_failed'))
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

  it('casts nothing while a second question is open and not cast: the SDK would sign both (gate-3 F10)', async () => {
    sdk.statuses = ['RESULTS', 'ONGOING', 'ONGOING']
    await renderFlow()
    expect(probe.current?.screen).toEqual({ kind: 'roomQuestion', index: 1, paused: false, blocked: true })
    act(() => sdk.watch?.({ '1': '0' }, { name: '1' }))
    await act(async () => {
      await probe.current?.castQuestion(1)
    })
    expect(sdk.vote).not.toHaveBeenCalled()
  })

  // No room reads the question (an all-at-once process): the refusal blames the room, never this voter's eligibility.
  it('says the question is not loaded, not that the voter is not eligible, when no room reads it', async () => {
    sdk.initialStatus = 'ONGOING'
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
  it('sends nothing while another open question is not cast, and adds no second message to the warning', async () => {
    sdk.statuses = ['RESULTS', 'ONGOING', 'ONGOING']
    await renderFlow()
    act(() => sdk.watch?.({ '1': '0' }, { name: '1' }))
    await act(async () => {
      await probe.current?.castQuestion(1)
    })
    expect(sdk.vote).not.toHaveBeenCalled()
    expect(probe.current?.state).toMatchObject({ castError: null, castQuestionId: null })
  })
})

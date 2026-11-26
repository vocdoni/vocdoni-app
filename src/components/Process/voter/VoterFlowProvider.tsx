import { useQueryClient } from '@tanstack/react-query'
import { computeProcessStatus, isSecretUntilTheEnd, resolveEndDate } from '@vocdoni/api-client'
import {
  electionQueryKeys,
  lockedQuestionNotice,
  useElection,
  useQuestionsForm,
  useReactComponentsLocalize,
} from '@vocdoni/react-components'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { useCspAuthContext } from '~components/Process/voter/csp/CspStepsProvider'
import { isQuestionByQuestion } from '~src/types/voting-process'
import type { ProcessBrand } from '~utils/process-brand'
import { useNow } from '~utils/use-now'
import { deriveQuestionState, deriveVoteState, hasEndedBySchedule } from '~utils/vote-state'
import { voterSeesQuestionResult, voterSeesResults } from '~utils/voter-results'
import { VoterFlowContext, type VoterFlow } from './flow-context'
import { VOTER_CLOCK_TOLERANCE_MS, VOTER_POLL_MS, VOTER_STATE_GRACE_MS } from './live'
import { useOwnedAnswers } from './use-owned-answers'
import { useVoterCheck, voterCheckKey } from './use-voter-check'
import {
  chainRecordOf,
  deriveVoterScreen,
  firstUnanswered,
  formValuesFor,
  historyStateFor,
  initialVoterState,
  isAnswered,
  isRoomCast,
  isRoomEligible,
  lateCastOf,
  ON_CHAIN_NOTICE,
  roomFormSet,
  roomGroup,
  roomGroupKey,
  roomHeldSet,
  roomNeeded,
  stepFromHistory,
  roomCastOf,
  voterReducer,
  WELCOME,
  type RoomFacts,
  type RoomQuestion,
  type VoterFacts,
  type VoterStep,
} from './voter-flow'

const SETTLED = new Set(['confirmed', 'signed', 'unconfirmed', 'ineligible'])
// The vote counts as running for the check's `canVote` only while more than this is left before its end.
const ENDS_SOON_MS = 5 * 60_000
const ENDED_STATUSES = ['ENDED', 'RESULTS', 'CANCELED']

type FormErrors = Record<string, { message?: unknown } | undefined> & { root?: { vote?: { message?: unknown } } }

/**
 * The SDK's sentence for a failed `vote()`, and whether it says the outcome is unknown. The SDK reports a cast whose
 * landing it could not check only in its sentence (alone, or inside the partial one): read here, in the language it
 * was written in, so the closed screen never calls it unrecorded (gate-2 N2).
 */
const castFailureOf = (errors: FormErrors, questionCount: number, unknownOutcome: string) => {
  const fieldError = Array.from({ length: questionCount }, (_x, index) => errors[String(index)]?.message).find(Boolean)
  const message = String(errors.root?.vote?.message ?? fieldError ?? '')
  return { message, unconfirmed: unknownOutcome !== '' && message.includes(unknownOutcome) }
}

/**
 * The SDK refuses a cast over eligibility before it signs anything: `changed` (EligibilityChangedError, the form is stale)
 * or `none` (NoEligibleQuestionError, no question is left to this voter). Neither is a failed cast.
 */
const eligibilityRefusalOf = (message: string, localize: (key: string) => string) => ({
  changed: message === localize('errors.vote_eligibility_changed'),
  none: [localize('errors.vote_ineligible_question'), localize('errors.vote_ineligible_questions')].includes(message),
})

/** The first open question the voter has not cast and may vote: where a stale form's refusal is shown. */
const firstToVoteOf = (questions: readonly RoomQuestion[]) =>
  questions.find((question) => question.state === 'open' && !isRoomCast(question) && isRoomEligible(question))?.id

/**
 * The instant the server rendered the page (`Date.now()` in its loader, carried in the page data). The browser's first
 * render reads the clock at this instant, so it picks the screen the server picked (an upcoming vote, a scheduled
 * end); the browser's own clock takes over right after hydration.
 */
export const VoterServerNow = createContext<number | undefined>(undefined)

const subscribeNever = () => () => {}
// True on the server and while React hydrates its markup; false once the page is the browser's (and on a page the
// browser renders itself), when React renders again with the client snapshot.
const useHydrating = () =>
  useSyncExternalStore(
    subscribeNever,
    () => false,
    () => true
  )

type VoterFlowProviderProps = {
  brand: ProcessBrand
  /** The end-instant timer fired (`useVoterLive`). */
  endPassed?: boolean
  children: ReactNode
}

/**
 * The voter page's state: the facts the SDK reports, the flow's own membership check, the voter's navigation and
 * answers, and the one screen they decide (`deriveVoterScreen`). Rendered inside `ElectionProvider`, the voter's
 * `ConfirmProvider`, `QuestionsFormProvider` and `CspAuthProvider`. It renders nothing until the process read exists
 * (so `checking` for a read not loaded is never drawn); the page always seeds that read from the server.
 */
export const VoterFlowProvider = ({ brand, endPassed = false, children }: VoterFlowProviderProps) => {
  const {
    election,
    status: sdkStatus,
    connected,
    authToken,
    check,
    clearVoter,
    voting,
    voteStatus,
    pendingVotes,
    voterQuestions,
    hasVoted,
    isAbleToVote,
    voteIds,
    weight,
  } = useElection()
  const csp = useCspAuthContext()
  const { fmethods, vote } = useQuestionsForm()
  const localize = useReactComponentsLocalize()
  const queryClient = useQueryClient()
  const clock = useNow(VOTER_POLL_MS)
  const serverNow = useContext(VoterServerNow)
  const hydrating = useHydrating()
  // The page data's instant is the server's clock. A device clock far from it (one that runs ahead would close the
  // vote early for this voter, on every reload) does not decide the end: the process read, polled, does (gate F4).
  const [clockTrusted] = useState(
    () => serverNow === undefined || Math.abs(Date.now() - serverNow) <= VOTER_CLOCK_TOLERANCE_MS
  )
  // A refusal is dated on the server's timeline only when this device's clock is off: the page's instant may be a
  // minute stale (the HTML cache), which is the error a trusted clock must not inherit.
  const [serverOffset] = useState(() => (clockTrusted || serverNow === undefined ? 0 : serverNow - Date.now()))
  // The SDK reads its own clock for `status` (a vote not started yet is UPCOMING): until hydration ends, both read the
  // server's instant instead, so the server's HTML and the browser's first render agree (conformance D-24).
  const firstFrameNow = hydrating && serverNow !== undefined ? new Date(serverNow) : undefined
  const now = firstFrameNow ?? clock
  const status =
    firstFrameNow && election
      ? computeProcessStatus(election.questions, { startDate: election.startDate, now: firstFrameNow })
      : sdkStatus
  const [state, dispatch] = useReducer(voterReducer, initialVoterState)
  const { forgetAll } = useOwnedAnswers(state.answers, state.memos, dispatch)
  // Each sign out, or lost session, starts a new one: a cast that settles after it is not the next voter's to show.
  const sessionRef = useRef(0)

  const questions = election?.questions ?? []
  const id = election?.id
  const statusKey = `${sdkStatus}:${questions.map((question) => question.status).join(',')}`
  // The room reads the clock only where it can end a question or the vote. A device clock that is not trusted never
  // ends them (gate F4): the room reads it held just short of the scheduled end, and the polled statuses close it,
  // as `facts.endedBySchedule` does for the whole vote (gate-3 F4).
  const end = election ? resolveEndDate(election)?.getTime() : undefined
  const roomNow = hydrating || clockTrusted || end === undefined || now.getTime() < end ? now : new Date(end - 1)
  const running =
    status !== null && !ENDED_STATUSES.includes(status) && (end === undefined || end - roomNow.getTime() > ENDS_SOON_MS)
  const { membership, votedElsewhere, votedIds, ineligibleIds } = useVoterCheck({
    id,
    authToken,
    connected,
    check,
    statusKey,
    running,
  })
  // A question is ineligible when the SDK says so on connect, the check does (`canVote: false`), or the session saw it so.
  const ineligibleOf = (questionId: string) =>
    voteStatus[questionId] === 'ineligible' ||
    ineligibleIds.includes(questionId) ||
    state.ineligible.includes(questionId)

  // The SDK publishes the voter's per-question state a moment after the check. If it never does (its own check failed
  // and it does not retry), nothing can be cast from this session: back to identification, never a wrong sentence.
  const stateMissing = membership === 'ok' && voterQuestions.length === 0
  useEffect(() => {
    if (!stateMissing) return
    const timer = setTimeout(() => {
      sessionRef.current += 1
      clearVoter()
      csp.resetFlow()
      forgetAll()
      dispatch({ type: 'signedOut', notice: 'sessionExpired' })
    }, VOTER_STATE_GRACE_MS)
    return () => clearTimeout(timer)
  }, [stateMissing]) // eslint-disable-line react-hooks/exhaustive-deps

  // A question whose vote is already on chain (a partial cast, or a session resumed after one) has nothing left to
  // answer (gate F2): the SDK skips it on the next cast, so an answer changed here would show on review and never be
  // sent. It is locked like the ones the SDK's own rule locks, so no route (rail, "Enrere", Back) reaches its fields.
  const onChain = useCallback(
    (questionId: string) =>
      voteStatus[questionId] === 'confirmed' ||
      voterQuestions.some((entry) => entry.questionId === questionId && entry.hasVoted),
    [voteStatus, voterQuestions]
  )
  // The questions the voter was seen ineligible for this session: the check forgets them once the vote ends.
  const ineligibleNow = questions.filter((question) => ineligibleOf(question.id)).map((question) => question.id)
  const ineligibleKey = ineligibleNow.join(',')
  useEffect(() => {
    if (ineligibleNow.length) dispatch({ type: 'ineligibleSeen', questionIds: ineligibleNow })
  }, [ineligibleKey]) // eslint-disable-line react-hooks/exhaustive-deps
  // On chain first: SDK #118 answers `vote.disabled.question_voted` for a confirmed question, and review keys the
  // answer this session sent for it on the flow's own notice (gate F2). Same result on SDK 4.1.0.
  const lockedNotice = useCallback(
    (questionId: string) =>
      onChain(questionId) ? ON_CHAIN_NOTICE : lockedQuestionNotice(questionId, pendingVotes, voteStatus),
    [pendingVotes, voteStatus, onChain]
  )
  const answered = questions.map((question, index) =>
    isAnswered(question, state.answers[String(index)], !!lockedNotice(question.id))
  )
  const settledQuestion = (questionId: string) =>
    voterQuestions.some((entry) => entry.questionId === questionId && entry.hasVoted) ||
    SETTLED.has(voteStatus[questionId] ?? '')
  // An ineligible question counts as settled, but a voter ineligible for every question has voted none of them.
  const settledBySdk =
    questions.length > 0 &&
    questions.every((question) => settledQuestion(question.id)) &&
    questions.some((question) => settledQuestion(question.id) && !ineligibleOf(question.id))

  // The room, from the polled process read and the voter's state: the open set decides the frame (`roomNeeded`), not
  // how the vote was created. `roomNow` is the server's instant on the first frame, so server and browser pick the same
  // one.
  const roomFacts: RoomFacts | null = election
    ? {
        voteState: deriveVoteState(election, roomNow),
        questions: questions.map((question) => {
          const endedAt = question.endedAt ? Date.parse(question.endedAt) || null : null
          const questionState = deriveQuestionState(question, election, roomNow)
          return {
            id: question.id,
            state: questionState,
            cast: (() => {
              const base = roomCastOf({
                onChain: onChain(question.id) || !!voteIds[question.id] || votedIds.includes(question.id),
                status: voteStatus[question.id],
                pending: !!pendingVotes[question.id],
                outcomeUnknown: state.uncertain.includes(question.id),
              })
              // A refusal that came after the organiser closed the question (gate-3 F2 extension): surface as 'late'
              // so the rail note matches the roomMissed screen. Kept in `state.late`: an answer to the next question
              // clears the refusal's error, not that it came late.
              if (
                base === 'pending' &&
                (state.late.includes(question.id) || lateCastOf(base, question.id, state, endedAt))
              ) {
                return 'late' as const
              }
              return base
            })(),
            endedAt,
            showsResult: voterSeesQuestionResult(question),
            // The SDK locks a question it marks 'ineligible'. The check alone hides only a question that is not open: an
            // open one the SDK did not lock is still sent, and the SDK signs it or refuses it (EligibilityChangedError).
            ...(voteStatus[question.id] === 'ineligible' || (questionState !== 'open' && ineligibleOf(question.id))
              ? { eligible: false }
              : {}),
          }
        }),
      }
    : null
  // A whole-vote pause of a vote not created question by question keeps its classic paused screens: the data cannot
  // tell it from a question-by-question vote with nothing opened yet, so only the creation flag does.
  const classicPause = !!election && !isQuestionByQuestion(election) && status === 'PAUSED'
  const room = roomFacts && roomNeeded(roomFacts.questions) && !classicPause ? roomFacts : null

  // The open set's key: a parked frame belongs to the set it was left on, so a changed set forgets it.
  const openKey = room ? roomGroupKey(room.questions) || null : null

  const lateIds = (room?.questions ?? []).flatMap((question) =>
    question.cast === 'late' && !state.late.includes(question.id) ? [question.id] : []
  )
  const lateKey = lateIds.join(',')
  useEffect(() => {
    lateIds.forEach((questionId) => dispatch({ type: 'castLate', questionId }))
  }, [lateKey]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    dispatch({ type: 'openChanged', questionId: openKey })
  }, [openKey])
  // The set answered in one form (`roomFormSet`): its questions only, in the classic navigation.
  // Kept by its key: `room` is rebuilt on every render, and the navigation callbacks below depend on the set.
  const formKey = room ? (roomFormSet(room.questions, room.voteState) ?? []).join(',') : ''
  const form = useMemo(() => (formKey ? formKey.split(',').map(Number) : null), [formKey])
  const inForm = useCallback((index: number) => !form || form.includes(index), [form])

  const facts: VoterFacts = {
    loaded: !!election,
    status,
    room,
    byQuestion: !!election && isQuestionByQuestion(election),
    // `hydrating ||`: the first client render repeats the server's HTML, which read the server's own clock.
    endedBySchedule: (hydrating || clockTrusted) && (endPassed || (!!election && hasEndedBySchedule(election, now))),
    secretUntilTheEnd: !!election && isSecretUntilTheEnd(election),
    resultsShown: voterSeesResults(election?.questions),
    connected,
    challengePending: csp.currentStep === 1,
    membership,
    voterStateReady: voterQuestions.length > 0,
    hasVoted: hasVoted || votedElsewhere,
    isAbleToVote,
    voting,
    everyQuestionSettled: settledBySdk || votedElsewhere,
    questionCount: questions.length,
    answered,
  }
  const screen = deriveVoterScreen(facts, state)

  // A lost session: forget the voter and go back to identification with a note (audit F5).
  useEffect(() => {
    if (membership !== 'sessionLost') return
    sessionRef.current += 1
    clearVoter()
    csp.resetFlow()
    forgetAll()
    dispatch({ type: 'signedOut', notice: 'sessionExpired' })
  }, [membership]) // eslint-disable-line react-hooks/exhaustive-deps

  // The browser's Back and Forward move between steps; history.state holds the step only.
  useEffect(() => {
    window.history.replaceState(historyStateFor(window.history.state, WELCOME), '')
    const onPop = (event: PopStateEvent) => dispatch({ type: 'restore', step: stepFromHistory(event.state) ?? WELCOME })
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  const go = useCallback((step: VoterStep, returnToReview = false) => {
    window.history.pushState(historyStateFor(window.history.state, step), '')
    dispatch({ type: 'go', step, returnToReview })
  }, [])

  // A locked question (its vote is being re-sent) has nothing to answer: the navigation steps over it (audit F14).
  const openQuestionAfter = useCallback(
    (index: number) => {
      for (let i = index + 1; i < questions.length; i++) {
        if (inForm(i) && !lockedNotice(questions[i].id)) return i
      }
      return -1
    },
    [questions, lockedNotice, inForm]
  )
  const openQuestionBefore = useCallback(
    (index: number) => {
      for (let i = Math.min(index, questions.length) - 1; i >= 0; i--) {
        if (inForm(i) && !lockedNotice(questions[i].id)) return i
      }
      return -1
    },
    [questions, lockedNotice, inForm]
  )

  // Results: the process read carries the figures and keeps polling (spec D5); it is read fresh when a view opens.
  const resultsOpen = screen.kind === 'results'
  useEffect(() => {
    if (resultsOpen && id) void queryClient.invalidateQueries({ queryKey: electionQueryKeys.election(id) })
  }, [resultsOpen, id, queryClient])

  // The heading of a new screen takes the focus, but not on the first paint.
  // The question's index is part of the key: a question that opens moves the focus to its title (auto-navigation).
  const screenKey = 'index' in screen ? `${screen.kind}:${screen.index}` : screen.kind
  const [firstScreen] = useState(screenKey)
  const movedRef = useRef(false)
  if (screenKey !== firstScreen) movedRef.current = true
  const moved = movedRef.current

  const latest = useRef(state)
  latest.current = state
  const latestRoom = useRef(room)
  latestRoom.current = room
  const castingRef = useRef(false)
  const [casting, setCasting] = useState(false)

  // A refused cast. The SDK's eligibility refusals are not failed casts: a stale form sits on the first open question
  // still to vote (else on the one being cast), and a refusal with no question left shows nothing, the check decides.
  const failCast = useCallback(
    (failure: ReturnType<typeof castFailureOf>, castingId?: string) => {
      const refusal = eligibilityRefusalOf(failure.message, localize)
      if (refusal.none) return
      if (refusal.changed) {
        dispatch({
          type: 'castFailed',
          ...failure,
          questionId: firstToVoteOf(latestRoom.current?.questions ?? []) ?? castingId,
        })
      } else {
        dispatch({ type: 'castFailed', ...failure, at: Date.now() + serverOffset, questionId: castingId })
      }
    },
    [localize, serverOffset]
  )

  const cast = useCallback(async () => {
    if (castingRef.current || voting || firstUnanswered(answered) !== -1) return
    castingRef.current = true
    setCasting(true)
    const session = sessionRef.current
    dispatch({ type: 'castStarted' })
    try {
      fmethods.clearErrors('root')
      const result = await vote(formValuesFor(latest.current))
      if (session !== sessionRef.current) return
      if (result === false) {
        failCast(
          castFailureOf(fmethods.formState.errors as FormErrors, questions.length, localize('errors.vote_unconfirmed'))
        )
        // A question may have closed or the vote paused meanwhile ("question is not open for voting"): read the
        // process again and let the facts decide. Never a sign out.
        if (id) void queryClient.invalidateQueries({ queryKey: electionQueryKeys.election(id) })
      } else {
        dispatch({ type: 'castSucceeded' })
      }
      void queryClient.invalidateQueries({ queryKey: voterCheckKey(id) })
    } catch (error) {
      // `vote()` reports its failures through the form, but anything it throws must still end on review with a
      // sentence (the SDK's generic one, from an empty message), not an unhandled rejection (gate F14). The error
      // holds no answer.
      console.error('Voter cast failed:', error)
      if (session === sessionRef.current) dispatch({ type: 'castFailed', message: '', at: Date.now() + serverOffset })
      void queryClient.invalidateQueries({ queryKey: voterCheckKey(id) })
    } finally {
      castingRef.current = false
      setCasting(false)
    }
  }, [answered, failCast, fmethods, id, localize, queryClient, questions, serverOffset, vote, voting])

  // The open set's cast: the open questions this voter may vote (answered in the form) and the question the cast was
  // pressed on. Only the asked set's answers are sent: the room leaves out the questions this voter may not vote.
  const castQuestion = useCallback(
    async (index: number) => {
      const roomQuestions = latestRoom.current?.questions ?? []
      const sorted = (members: number[]) => [...new Set(members)].sort((x, y) => x - y)
      // The questions this cast answers: the open ones this voter may vote, and the one pressed on if it has closed.
      const askedSet = sorted([...roomGroup(roomQuestions), index])
      const question = questions[index]
      if (!question || castingRef.current || voting) return
      // A refusal sends nothing, but never passes in silence: the question says why, as a failed cast does.
      const refuse = (questionId: string, message: string) => dispatch({ type: 'castRefused', questionId, message })
      const unanswered = askedSet.find(
        (member) =>
          !isAnswered(questions[member], latest.current.answers[String(member)], !!lockedNotice(questions[member].id))
      )
      if (unanswered !== undefined) return refuse(questions[unanswered].id, localize('validation.required'))
      // No room reads the question, or this voter may not vote it: the generic sentence, nothing to blame on the voter.
      const target = roomQuestions[index]
      if (!target || target.eligible === false) return refuse(question.id, localize('errors.vote_failed_unknown'))
      const session = sessionRef.current
      // Which of them were already on chain: a cast that landed some of them is not "another device" (gate-3 F2).
      const onChainAtPress = new Set(askedSet.filter((member) => onChain(questions[member].id)))
      castingRef.current = true
      setCasting(true)
      dispatch({
        type: 'castStarted',
        questionId: questions[askedSet[0]].id,
        questionIds: askedSet.map((member) => questions[member].id),
      })
      try {
        // Only the asked set's answers: the SDK signs the batch it is given, and locks what its own form locks.
        const all = formValuesFor(latest.current) as Record<string, unknown> & { memo?: Record<string, string> }
        const values: Record<string, unknown> = {}
        const memo: Record<string, string> = {}
        for (const member of askedSet) {
          const key = String(member)
          values[key] = all[key]
          if (all.memo?.[key] !== undefined) memo[key] = all.memo[key]
        }
        if (Object.keys(memo).length) values.memo = memo
        fmethods.clearErrors('root')
        const result = await vote(values)
        // A sign-out or a lost session while the cast ran: its outcome belongs to the voter who left.
        if (session !== sessionRef.current) return
        const fresh = result === false ? await check().catch(() => null) : null
        // A sign-out or a lost session while the re-check ran: the finding belongs to the voter who left.
        if (session !== sessionRef.current) return
        if (result === false) {
          const failure = castFailureOf(
            fmethods.formState.errors as FormErrors,
            questions.length,
            localize('errors.vote_unconfirmed')
          )
          // Landed in part: the failure shows on the first question still to vote, and no other device is blamed.
          const landed = askedSet.filter(
            (member) =>
              !onChainAtPress.has(member) &&
              fresh?.questions.some((entry) => entry.questionId === questions[member].id && entry.hasVoted)
          )
          const stillToVote = askedSet.find((member) => !landed.includes(member)) ?? askedSet[0]
          failCast(failure, questions[stillToVote].id)
          // The set may have closed meanwhile ("not open for voting"): read the process again, the facts decide.
          if (id) void queryClient.invalidateQueries({ queryKey: electionQueryKeys.election(id) })
          // Every question of the cast is on chain, and none was before: another device or tab voted them first, and frame
          // 3 says so (owner ruling 2026-11-24). A part landed by this cast, or an unconfirmed one, never counts, nor
          // does a set of this device whose earlier cast had an unknown outcome: that one landed, and is this device's.
          if (!failure.unconfirmed && landed.length === askedSet.length) {
            const earlier = askedSet.some((member) => latest.current.uncertain.includes(questions[member].id))
            dispatch(
              earlier
                ? { type: 'questionCastSucceeded' }
                : { type: 'castFoundVoted', questionId: questions[askedSet[0]].id }
            )
          }
        } else {
          dispatch({ type: 'questionCastSucceeded' })
        }
        void queryClient.invalidateQueries({ queryKey: voterCheckKey(id) })
      } catch (error) {
        console.error('Voter cast failed:', error)
        if (session === sessionRef.current) dispatch({ type: 'castFailed', message: '', at: Date.now() + serverOffset })
        void queryClient.invalidateQueries({ queryKey: voterCheckKey(id) })
      } finally {
        castingRef.current = false
        setCasting(false)
      }
    },
    [check, failCast, fmethods, id, localize, lockedNotice, onChain, queryClient, questions, serverOffset, vote, voting]
  )

  const signOut = useCallback(() => {
    sessionRef.current += 1
    clearVoter()
    csp.resetFlow()
    forgetAll()
    dispatch({ type: 'signedOut' })
  }, [clearVoter, csp, forgetAll])

  const next = useCallback(
    (index: number) => {
      if (!answered[index]) {
        void fmethods.trigger(String(index))
        return
      }
      const following = openQuestionAfter(index)
      if (latest.current.returnToReview || following === -1) go({ name: 'review' })
      else go({ name: 'question', index: following })
    },
    [answered, fmethods, go, openQuestionAfter]
  )

  // The ids a skip, or its resume, acts on: the open set the shown question belongs to.
  const groupIdsOf = (index: number): string[] => {
    const group = roomHeldSet(latestRoom.current?.questions ?? [], latestRoom.current?.voteState ?? 'live')
    return (group.includes(index) ? group : [index]).map((member) => questions[member].id)
  }

  if (!election) return null

  const first = openQuestionAfter(-1)
  const park = (index: number) => {
    const held = roomHeldSet(latestRoom.current?.questions ?? [], latestRoom.current?.voteState ?? 'live')
    dispatch({ type: 'park', questionId: held.map((member) => questions[member].id).join(',') || questions[index].id })
  }
  const flow: VoterFlow = {
    screen,
    moved,
    election,
    brand,
    facts,
    state,
    weight,
    weighted: election.census?.weighted === true,
    anonymous: election.census?.anonymous === true,
    voteIds,
    lockedNotice,
    statuses: questions.map((question) => voteStatus[question.id]),
    chain: questions.map((question) =>
      chainRecordOf({
        onChain: onChain(question.id) || !!voteIds[question.id] || votedIds.includes(question.id),
        status: voteStatus[question.id],
        pending: !!pendingVotes[question.id],
        outcomeUnknown: state.castUnconfirmed,
      })
    ),
    start: () => go(first === -1 ? { name: 'review' } : { name: 'question', index: first }),
    next,
    back: (index) => {
      const previous = openQuestionBefore(index)
      // Nothing before it in the form (its first question, or the ones before it are locked): the room, where the set waits.
      if (previous === -1 && form) return park(index)
      go(previous === -1 ? WELCOME : { name: 'question', index: previous })
    },
    goTo: (index) => go({ name: 'question', index }),
    change: (index) => go({ name: 'question', index }, true),
    review: () => go({ name: 'review' }),
    chooseBlank: (index, on) => fmethods.setValue(String(index), on ? [] : ''),
    // The form's review casts the set; a single room question casts through the same ballot.
    cast: form ? () => castQuestion(form[0]) : cast,
    form,
    // The open set is one unit for "Enrere", "No votar aquesta pregunta" and "Torna-la a votar" (its key parks it).
    park,
    skip: (index) => groupIdsOf(index).forEach((questionId) => dispatch({ type: 'skip', questionId })),
    resume: (index) => groupIdsOf(index).forEach((questionId) => dispatch({ type: 'resume', questionId })),
    castQuestion,
    casting,
    signOut,
    showResults: (on) => dispatch({ type: 'viewResults', on }),
    recheck: () => {
      if (connected) void queryClient.invalidateQueries({ queryKey: voterCheckKey(id) })
    },
    verifyReceipt: (on) => dispatch({ type: 'verifyReceipt', on }),
    checkReceipt: () => {
      dispatch({ type: 'checkReceipt' })
      // A connected voter whose vote could not be confirmed as it closed asks the chain again (gate-2 N2).
      if (connected) void queryClient.invalidateQueries({ queryKey: voterCheckKey(id) })
    },
    leaveReceipt: () => dispatch({ type: 'leaveReceipt' }),
  }

  return <VoterFlowContext.Provider value={flow}>{children}</VoterFlowContext.Provider>
}

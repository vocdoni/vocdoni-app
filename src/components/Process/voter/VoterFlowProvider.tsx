import { useQueryClient } from '@tanstack/react-query'
import { computeProcessStatus, isSecretUntilTheEnd } from '@vocdoni/api-client'
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
import { hasEndedBySchedule } from '~utils/vote-state'
import { VoterFlowContext, type VoterFlow } from './flow-context'
import { VOTER_CLOCK_TOLERANCE_MS, VOTER_POLL_MS, VOTER_STATE_GRACE_MS } from './live'
import { useOwnedAnswers } from './use-owned-answers'
import { useVoterCheck, voterCheckKey } from './use-voter-check'
import {
  chainRecordOf,
  deriveVoterScreen,
  encodableAnswer,
  firstUnanswered,
  formValuesFor,
  historyStateFor,
  initialVoterState,
  isAnswered,
  ON_CHAIN_NOTICE,
  stepFromHistory,
  voterReducer,
  WELCOME,
  type VoterFacts,
  type VoterStep,
} from './voter-flow'

const SETTLED = new Set(['confirmed', 'signed', 'unconfirmed'])

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
  /** Tells the page whether a live results view is open, so it can poll the results read. */
  onResultsLive?: (live: boolean) => void
  children: ReactNode
}

/**
 * The voter page's state: the facts the SDK reports, the flow's own membership check, the voter's navigation and
 * answers, and the one screen they decide (`deriveVoterScreen`). Rendered inside `ElectionProvider`, the voter's
 * `ConfirmProvider`, `QuestionsFormProvider` and `CspAuthProvider`. It renders nothing until the process read exists
 * (so `checking` for a read not loaded is never drawn); the page always seeds that read from the server.
 */
export const VoterFlowProvider = ({ brand, endPassed = false, onResultsLive, children }: VoterFlowProviderProps) => {
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
  const { membership, votedElsewhere, votedIds } = useVoterCheck({ id, authToken, connected, check, statusKey })

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
  const lockedNotice = useCallback(
    (questionId: string) =>
      lockedQuestionNotice(questionId, pendingVotes, voteStatus) ?? (onChain(questionId) ? ON_CHAIN_NOTICE : undefined),
    [pendingVotes, voteStatus, onChain]
  )
  const answered = questions.map((question, index) =>
    isAnswered(question, state.answers[String(index)], !!lockedNotice(question.id))
  )
  const settledBySdk =
    questions.length > 0 &&
    questions.every(
      (question) =>
        voterQuestions.some((entry) => entry.questionId === question.id && entry.hasVoted) ||
        SETTLED.has(voteStatus[question.id] ?? '')
    )

  const facts: VoterFacts = {
    loaded: !!election,
    status,
    questionByQuestion: isQuestionByQuestion(election),
    // `hydrating ||`: the first client render repeats the server's HTML, which read the server's own clock.
    endedBySchedule: (hydrating || clockTrusted) && (endPassed || (!!election && hasEndedBySchedule(election, now))),
    secretUntilTheEnd: !!election && isSecretUntilTheEnd(election),
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
        if (!lockedNotice(questions[i].id)) return i
      }
      return -1
    },
    [questions, lockedNotice]
  )
  const openQuestionBefore = useCallback(
    (index: number) => {
      for (let i = Math.min(index, questions.length) - 1; i >= 0; i--) {
        if (!lockedNotice(questions[i].id)) return i
      }
      return -1
    },
    [questions, lockedNotice]
  )

  // Results: poll them while a live view is open, and read them fresh when it opens.
  const resultsOpen = screen.kind === 'results'
  const resultsLive = resultsOpen && screen.state !== 'final'
  useEffect(() => {
    onResultsLive?.(resultsLive)
  }, [resultsLive, onResultsLive])
  useEffect(() => {
    if (resultsOpen && id) void queryClient.invalidateQueries({ queryKey: electionQueryKeys.results(id) })
  }, [resultsOpen, id, queryClient])

  // The heading of a new screen takes the focus, but not on the first paint.
  const screenKey = screen.kind === 'question' ? `question:${screen.index}` : screen.kind
  const [firstScreen] = useState(screenKey)
  const movedRef = useRef(false)
  if (screenKey !== firstScreen) movedRef.current = true
  const moved = movedRef.current

  const latest = useRef(state)
  latest.current = state
  const castingRef = useRef(false)
  const [casting, setCasting] = useState(false)

  const cast = useCallback(async () => {
    if (castingRef.current || voting || firstUnanswered(answered) !== -1) return
    castingRef.current = true
    setCasting(true)
    const session = sessionRef.current
    dispatch({ type: 'castStarted' })
    try {
      const values = formValuesFor(latest.current)
      // A question on chain with no answer in this session (resumed after a partial cast) still goes through the
      // SDK's encoder, which refuses an empty answer: it gets a placeholder the SDK never signs (gate F2).
      questions.forEach((question, index) => {
        const key = String(index)
        if (onChain(question.id) && !isAnswered(question, latest.current.answers[key])) {
          values[key] = encodableAnswer(question)
        }
      })
      const result = await vote(values)
      if (session !== sessionRef.current) return
      if (result === false) {
        const errors = fmethods.formState.errors as Record<string, { message?: unknown } | undefined> & {
          root?: { vote?: { message?: unknown } }
        }
        const fieldError = questions.map((_question, index) => errors[String(index)]?.message).find(Boolean)
        const message = String(errors.root?.vote?.message ?? fieldError ?? '')
        // The SDK reports a cast whose landing it could not check only in its sentence (alone, or inside the partial
        // one): read here, in the language it was written in, so the closed screen never calls it unrecorded (gate-2 N2).
        const unknownOutcome = localize('errors.vote_unconfirmed')
        const unconfirmed = unknownOutcome !== '' && message.includes(unknownOutcome)
        dispatch({ type: 'castFailed', message, unconfirmed })
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
      if (session === sessionRef.current) dispatch({ type: 'castFailed', message: '' })
      void queryClient.invalidateQueries({ queryKey: voterCheckKey(id) })
    } finally {
      castingRef.current = false
      setCasting(false)
    }
  }, [answered, fmethods, id, localize, onChain, queryClient, questions, vote, voting])

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

  if (!election) return null

  const first = openQuestionAfter(-1)
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
      go(previous === -1 ? WELCOME : { name: 'question', index: previous })
    },
    goTo: (index) => go({ name: 'question', index }),
    change: (index) => go({ name: 'question', index }, true),
    review: () => go({ name: 'review' }),
    chooseBlank: (index, on) => fmethods.setValue(String(index), on ? [] : ''),
    cast,
    casting,
    signOut,
    showResults: (on) => dispatch({ type: 'viewResults', on }),
    checkReceipt: () => {
      dispatch({ type: 'checkReceipt' })
      // A connected voter whose vote could not be confirmed as it closed asks the chain again (gate-2 N2).
      if (connected) void queryClient.invalidateQueries({ queryKey: voterCheckKey(id) })
    },
    leaveReceipt: () => dispatch({ type: 'leaveReceipt' }),
  }

  return <VoterFlowContext.Provider value={flow}>{children}</VoterFlowContext.Provider>
}

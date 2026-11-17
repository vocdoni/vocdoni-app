import { isSecretUntilTheEnd, processVoteCount, resolveEndDate } from '@vocdoni/api-client'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import { useElection } from '@vocdoni/react-components'
import { useQueryClient } from '@tanstack/react-query'
import { useMemo, useSyncExternalStore } from 'react'
import { QueryKeys } from '~queries/keys'
import { useActions } from '~components/Actions/ActionsContext'
import { useProcessEarlyEndDate } from '~queries/process-end-date'
import { isQuestionByQuestion } from '~src/types/voting-process'
import {
  closedAt,
  closedBeforeSchedule,
  deriveQuestionState,
  percentOf,
  type QuestionState,
  type VoteState,
} from '~utils/vote-state'

/** Everything Gestió shows, derived once from the single process read. */
export type SummaryModel = {
  election: VotingProcessResponse
  byQuestion: boolean
  /** The page's state (`useActions().state`), whole-vote pause included. */
  state: VoteState
  /**
   * People who voted: the highest per-question count (hence "at least" question by question), from the served results
   * or, while they are missing, from the counts the process read carries.
   */
  count: number
  /** No count to show: the results request failed and the process read carries none. */
  countUnknown: boolean
  /** The census size; without it there is no share to show. */
  total?: number
  percent?: number
  /** Results stay hidden until the vote (or each question) closes. */
  secret: boolean
  /** When it closes, or closed (`closedAt`: a question-by-question vote's last question, the chain's end, the schedule). */
  endDate?: Date
  /** It closed before its scheduled end: someone ended it, or its last question closed. */
  endedEarly: boolean
  /** A manager of the vote: only they are served each question's own electorate. */
  canManage: boolean
  /** Per question, in order; a question held by a whole-vote pause reads as paused. */
  questionStates: QuestionState[]
  now: Date
}

export const useSummaryModel = (): SummaryModel | null => {
  const { election, results } = useElection()
  const { state, now, votePause, canManage } = useActions()
  const { data: earlyEndDate } = useProcessEarlyEndDate(election)
  const { heldQuestionIds } = votePause
  const resultsFailed = useResultsFailed(election?.id)

  return useMemo(() => {
    if (!election || !state) return null
    const byQuestion = isQuestionByQuestion(election)
    const heldIds = new Set(heldQuestionIds)
    const total = election.census?.size
    const carried = election.questions.filter((question) => question.results)
    const count = Math.max(processVoteCount(results), ...carried.map((question) => question.results?.voteCount ?? 0))
    const closed = closedAt(election, earlyEndDate)
    return {
      election,
      byQuestion,
      state,
      count,
      countUnknown: !results && resultsFailed && !carried.length,
      total,
      percent: percentOf(count, total),
      secret: isSecretUntilTheEnd(election),
      endDate: state === 'closed' ? closed : (earlyEndDate ?? resolveEndDate(election)),
      endedEarly: state === 'closed' && closedBeforeSchedule(election, closed),
      canManage,
      questionStates: election.questions.map((question) =>
        heldIds.has(question.id) ? 'paused' : deriveQuestionState(question, election, now)
      ),
      now,
    }
  }, [election, results, now, earlyEndDate, state, heldQuestionIds, canManage, resultsFailed])
}

/** Whether the results read of this vote failed (the provider keeps its error to itself). */
const useResultsFailed = (id: string | undefined): boolean => {
  const queryClient = useQueryClient()
  return useSyncExternalStore(
    (onChange) => queryClient.getQueryCache().subscribe(onChange),
    () => !!id && queryClient.getQueryState(QueryKeys.election.results(id))?.status === 'error'
  )
}

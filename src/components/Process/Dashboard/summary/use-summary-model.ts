import { isSecretUntilTheEnd, processVoteCount, resolveEndDate } from '@vocdoni/api-client'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import { useElection } from '@vocdoni/react-components'
import { useMemo } from 'react'
import { useActions } from '~components/Actions/ActionsContext'
import { useProcessEarlyEndDate } from '~queries/process-end-date'
import { isQuestionByQuestion } from '~src/types/voting-process'
import { deriveQuestionState, percentOf, type QuestionState, type VoteState } from '~utils/vote-state'

/** Everything Resum shows, derived once from the single process read. */
export type SummaryModel = {
  election: VotingProcessResponse
  byQuestion: boolean
  /** The page's state (`useActions().state`), whole-vote pause included. */
  state: VoteState
  /** People who voted: the highest per-question count on a question-by-question vote, hence "at least". */
  count: number
  /** The census size; without it there is no share to show. */
  total?: number
  percent?: number
  /** Results stay hidden until the vote (or each question) closes. */
  secret: boolean
  /** When it closes, or closed: the early end the chain recorded wins over the schedule. */
  endDate?: Date
  /** Someone ended it before its scheduled closing. */
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

  return useMemo(() => {
    if (!election || !state) return null
    const byQuestion = isQuestionByQuestion(election)
    const heldIds = new Set(heldQuestionIds)
    const total = election.census?.size
    const count = processVoteCount(results)
    return {
      election,
      byQuestion,
      state,
      count,
      total,
      percent: percentOf(count, total),
      secret: isSecretUntilTheEnd(election),
      endDate: earlyEndDate ?? resolveEndDate(election),
      endedEarly: !!earlyEndDate,
      canManage,
      questionStates: election.questions.map((question) =>
        heldIds.has(question.id) ? 'paused' : deriveQuestionState(question, election, now)
      ),
      now,
    }
  }, [election, results, now, earlyEndDate, state, heldQuestionIds, canManage])
}

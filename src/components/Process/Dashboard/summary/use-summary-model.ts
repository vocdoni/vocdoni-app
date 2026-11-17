import { isSecretUntilTheEnd, processVoteCount, resolveEndDate } from '@vocdoni/api-client'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import { useElection } from '@vocdoni/react-components'
import { useMemo } from 'react'
import { useProcessEarlyEndDate } from '~queries/process-end-date'
import { useVotePause } from '~queries/vote-pause'
import { isQuestionByQuestion } from '~src/types/voting-process'
import { useNow } from '~utils/use-now'
import { deriveQuestionState, deriveVoteState, percentOf, type QuestionState, type VoteState } from '~utils/vote-state'

/** Everything Resum shows, derived once from the single process read. */
export type SummaryModel = {
  election: VotingProcessResponse
  byQuestion: boolean
  /** `paused` also for a question-by-question vote held as a whole (`useVotePause`). */
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
  /** Per question, in order; a question held by a whole-vote pause reads as paused. */
  questionStates: QuestionState[]
  now: Date
}

export const useSummaryModel = (): SummaryModel | null => {
  const { election, results } = useElection()
  const now = useNow()
  const { data: earlyEndDate } = useProcessEarlyEndDate(election)
  const { isHeld, heldQuestionIds } = useVotePause(election)
  const held = heldQuestionIds.join()

  return useMemo(() => {
    if (!election) return null
    const byQuestion = isQuestionByQuestion(election)
    const voteState = deriveVoteState(election, now)
    // With every question held and none closed, the derived state reads `ready`: the pause wins over both.
    const paused = byQuestion && isHeld && (voteState === 'live' || voteState === 'ready')
    const heldIds = new Set(paused ? held.split(',') : [])
    const total = election.census?.size
    const count = processVoteCount(results)
    return {
      election,
      byQuestion,
      state: paused ? 'paused' : voteState,
      count,
      total,
      percent: percentOf(count, total),
      secret: isSecretUntilTheEnd(election),
      endDate: earlyEndDate ?? resolveEndDate(election),
      questionStates: election.questions.map((question) =>
        heldIds.has(question.id) ? 'paused' : deriveQuestionState(question, election, now)
      ),
      now,
    }
  }, [election, results, now, earlyEndDate, isHeld, held])
}

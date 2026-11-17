import type { Choice, QuestionResults, VotingProcessQuestion } from '@vocdoni/api-types'
import {
  BallotType,
  decodeQuestionResults,
  tryInferQuestionBallotType,
  type DecodedChoiceResult,
} from '@vocdoni/ballot'

/**
 * A question's result in a few words. There is no approval semantic, so the most voted choice is the
 * outcome. `votes` are voters on a plain census and summed weight on a weighted one.
 * - `pair`: single choice with exactly two choices on an unweighted census ("198 to 7")
 * - `winner`: any other single choice ("X wins with N votes")
 * - `top`: multiple choice ("Most voted: X")
 * - `tie`: the top tally is shared
 */
export type QuestionOutcome =
  | { kind: 'pair'; winner: Choice; winnerVotes: number; otherVotes: number }
  | { kind: 'winner'; winner: Choice; votes: number; weighted: boolean }
  | { kind: 'top'; choice: Choice; votes: number; weighted: boolean }
  | { kind: 'tie' }

type OutcomeQuestion = Pick<
  VotingProcessQuestion,
  'choices' | 'ballotProtocol' | 'type' | 'metadata' | 'secretUntilTheEnd'
>

/** Null when there is nothing honest to say: no tally yet, still encrypted, no votes, or a ballot type we cannot read. */
export const questionOutcome = (
  question: OutcomeQuestion,
  results: QuestionResults | null | undefined,
  { weighted = false }: { weighted?: boolean } = {}
): QuestionOutcome | null => {
  if (!results?.results?.length || !results.voteCount) return null
  if (question.secretUntilTheEnd && results.finalResults !== true) return null
  const type = tryInferQuestionBallotType(question)
  const isSingle = type === BallotType.SingleChoice
  if (!isSingle && type !== BallotType.MultiChoice && type !== BallotType.Approval) return null

  let tallies: DecodedChoiceResult[]
  try {
    tallies = decodeQuestionResults(question, results.results).filter(
      (entry): entry is DecodedChoiceResult => entry.choice !== 'abstain'
    )
  } catch {
    return null
  }
  const top = Math.max(0, ...tallies.map((entry) => entry.votes))
  if (top === 0) return null
  const leaders = tallies.filter((entry) => entry.votes === top)
  if (leaders.length > 1) return { kind: 'tie' }
  const choice = question.choices.find((candidate) => candidate.value === leaders[0].choice)
  if (!choice) return null

  if (!isSingle) return { kind: 'top', choice, votes: top, weighted }
  if (question.choices.length === 2 && !weighted) {
    const other = tallies.find((entry) => entry.choice !== choice.value)?.votes ?? 0
    return { kind: 'pair', winner: choice, winnerVotes: top, otherVotes: other }
  }
  return { kind: 'winner', winner: choice, votes: top, weighted }
}

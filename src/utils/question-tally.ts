import type { QuestionResults, VotingProcessQuestion } from '@vocdoni/api-types'
import { BallotType, decodeQuestionResults, tryInferQuestionBallotType } from '@vocdoni/ballot'

export type Tally = { key: string; value?: number; votes: number }

/**
 * A question's tally, one entry per choice in ballot order, then the abstentions of a multiple-choice question. Null
 * while there is none to read: not served yet, or a legacy question whose ballot type cannot be told.
 */
export const tallyOf = (question: VotingProcessQuestion, results?: QuestionResults): Tally[] | null => {
  if (!results?.results?.length || !tryInferQuestionBallotType(question)) return null
  try {
    const decoded = decodeQuestionResults(question, results.results)
    const byChoice = new Map<number | 'abstain', number>(decoded.map((entry) => [entry.choice, entry.votes] as const))
    const rows: Tally[] = question.choices.map((choice) => ({
      key: String(choice.value),
      value: choice.value,
      votes: byChoice.get(choice.value) ?? 0,
    }))
    const abstain = byChoice.get('abstain')
    return abstain !== undefined ? [...rows, { key: 'abstain', votes: abstain }] : rows
  } catch {
    return null
  }
}

// Ranked and budget tallies count points; a quadratic one counts several votes per voter.
const POINTS: ReadonlySet<BallotType> = new Set([BallotType.Ranked, BallotType.Budget])
const SHARE_OF_TOTAL: ReadonlySet<BallotType> = new Set([...POINTS, BallotType.Quadratic])

/** What a tally's figures count: points (ranked, budget), summed weights (a weighted census) or votes. */
export type TallyUnit = 'votes' | 'points' | 'weight'

export const tallyUnit = (question: VotingProcessQuestion, weighted: boolean): TallyUnit => {
  const type = tryInferQuestionBallotType(question)
  if (type && POINTS.has(type)) return 'points'
  return weighted ? 'weight' : 'votes'
}

/**
 * What a choice's share is taken of: the people who answered, or the tally's total where a figure is not one per
 * voter (points, several votes per voter, weights).
 */
export const tallyBase = (
  question: VotingProcessQuestion,
  results: QuestionResults | undefined,
  tally: Tally[],
  weighted: boolean
): number => {
  const type = tryInferQuestionBallotType(question)
  const total = tally.reduce((sum, entry) => sum + entry.votes, 0)
  return weighted || (type && SHARE_OF_TOTAL.has(type)) ? total : results?.voteCount || total
}

/**
 * Whether a question's tally may be shown: it has votes, it can be read, and a secret one only once the chain marked
 * it final. Any ballot type the tally decodes counts, ranked, budget and quadratic included.
 */
export const tallyIsPublic = (
  question: VotingProcessQuestion,
  results: QuestionResults | undefined = question.results
): boolean =>
  !!results?.voteCount && (!question.secretUntilTheEnd || results.finalResults === true) && !!tallyOf(question, results)

import type { QuestionResults, VotingProcessQuestion } from '@vocdoni/api-types'
import { decodeQuestionResults, tryInferQuestionBallotType } from '@vocdoni/ballot'

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

import type { VotingProcessQuestion } from '@vocdoni/api-types'
import { BallotType, questionSelectionRange, tryInferQuestionBallotType } from '@vocdoni/ballot'
import type { TFunction } from 'i18next'

/**
 * How a question is answered, in a few words ("One choice, simple majority", "Up to 2 of 4 options"), or null for
 * a question whose ballot type cannot be read (legacy projections carry no protocol).
 */
export const questionKind = (t: TFunction, question: VotingProcessQuestion): string | null => {
  const choices = question.choices.length
  const budget = question.ballotProtocol?.maxTotalCost ?? 0
  switch (tryInferQuestionBallotType(question)) {
    case BallotType.SingleChoice:
      return t('votes.summary.kind.single', { defaultValue: 'One choice, simple majority' })
    case BallotType.MultiChoice:
    case BallotType.Approval: {
      let max = choices
      try {
        max = questionSelectionRange(question).max
      } catch {
        // An approval ballot has no slot range: every option may be picked.
      }
      return t('votes.summary.kind.multiple', { defaultValue: 'Up to {{max}} of {{choices}} options', max, choices })
    }
    case BallotType.Ranked:
      return t('votes.summary.kind.ranked', {
        defaultValue_one: '{{count, number}} option is ranked',
        defaultValue_other: '{{count, number}} options are ranked',
        count: choices,
      })
    case BallotType.Budget:
      return budget
        ? t('votes.summary.kind.budget', {
            defaultValue_one: '{{count, number}} point per person',
            defaultValue_other: '{{count, number}} points per person',
            count: budget,
          })
        : null
    case BallotType.Quadratic:
      return budget
        ? t('votes.summary.kind.quadratic', {
            defaultValue_one: '{{count, number}} credit per person',
            defaultValue_other: '{{count, number}} credits per person',
            count: budget,
          })
        : null
    default:
      return null
  }
}

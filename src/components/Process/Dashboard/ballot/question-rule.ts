import type { VotingProcessQuestion } from '@vocdoni/api-types'
import { BallotType, questionSelectionRange, tryInferQuestionBallotType } from '@vocdoni/ballot'
import type { TFunction } from 'i18next'
import { resultTypeLabel } from '~components/Process/resultTypeLabels'

/** The empty mark drawn before each option: a radio, a checkbox, a rank box or a points box. */
export type MarkKind = 'one' | 'many' | 'rank' | 'points'

/** How a question is answered, as the ballot says it: the mark, a sentence and a short tag. */
export type QuestionRule = { mark: MarkKind; note: string; tag: string }

/**
 * The rule of a question, written from its real numbers (how many options, how many may be marked, how many points).
 * Null for a question whose ballot type cannot be read (legacy projections carry no protocol): it is drawn without a
 * mark, note or tag.
 */
export const questionRule = (t: TFunction, question: VotingProcessQuestion): QuestionRule | null => {
  const type = tryInferQuestionBallotType(question)
  if (!type) return null
  const options = question.choices.length

  switch (type) {
    case BallotType.SingleChoice:
      return {
        mark: 'one',
        note: t('votes.ballot.rule.single', { defaultValue: 'Pick one option. The one with the most votes wins.' }),
        tag: t('votes.ballot.tag.single', { defaultValue: 'One option' }),
      }
    case BallotType.MultiChoice: {
      const { min, max } = questionSelectionRange(question)
      const upTo = t('votes.ballot.tag.up_to', { defaultValue: 'Up to {{max}} of {{total}}', max, total: options })
      if (min === max) {
        return {
          mark: 'many',
          note: t('votes.ballot.rule.multiple_exact', {
            defaultValue_one: 'Mark {{count, number}} option. The one with the most votes is chosen.',
            defaultValue_other: 'Mark {{count, number}} options. The {{count, number}} with the most votes are chosen.',
            count: max,
          }),
          tag: t('votes.ballot.tag.exact', { defaultValue: '{{max}} of {{total}}', max, total: options }),
        }
      }
      return {
        mark: 'many',
        note:
          min > 1
            ? t('votes.ballot.rule.multiple_between', {
                defaultValue: 'Mark between {{min}} and {{max}} options. The {{max}} with the most votes are chosen.',
                min,
                max,
              })
            : t('votes.ballot.rule.multiple_up_to', {
                defaultValue_one:
                  'Up to {{count, number}} option can be marked. The one with the most votes is chosen.',
                defaultValue_other:
                  'Up to {{count, number}} options can be marked. The {{count, number}} with the most votes are chosen.',
                count: max,
              }),
        tag: upTo,
      }
    }
    case BallotType.Approval: {
      const { max } = questionSelectionRange(question)
      const any = max >= options
      return {
        mark: 'many',
        note: any
          ? t('votes.ballot.rule.approval_any', {
              defaultValue: 'Any number of options can be approved. The one approved most wins.',
            })
          : t('votes.ballot.rule.approval_up_to', {
              defaultValue_one: 'Up to {{count, number}} option can be approved. The one approved most wins.',
              defaultValue_other: 'Up to {{count, number}} options can be approved. The one approved most wins.',
              count: max,
            }),
        tag: any
          ? resultTypeLabel(t, type)
          : t('votes.ballot.tag.up_to', { defaultValue: 'Up to {{max}} of {{total}}', max, total: options }),
      }
    }
    case BallotType.Ranked:
      return {
        mark: 'rank',
        note: t('votes.ballot.rule.ranked', {
          defaultValue_one: 'The {{count, number}} option is put in order, from the most wanted to the least.',
          defaultValue_other: 'The {{count, number}} options are put in order, from the most wanted to the least.',
          count: options,
        }),
        tag: resultTypeLabel(t, type),
      }
    case BallotType.Budget:
    case BallotType.Quadratic: {
      const budget = type === BallotType.Budget
      const total = question.ballotProtocol?.maxTotalCost ?? 0
      // Points that follow each voter's weight, or a protocol without a total, have no one figure to print.
      if (!total || question.ballotProtocol?.costFromWeight) {
        return {
          mark: 'points',
          note: budget
            ? t('votes.ballot.rule.budget_weighted', {
                defaultValue_one: 'Each person shares out points among the {{count, number}} option, as they like.',
                defaultValue_other: 'Each person shares out points among the {{count, number}} options, as they like.',
                count: options,
              })
            : t('votes.ballot.rule.quadratic_weighted', {
                defaultValue_one:
                  'Each person spends credits on the {{count, number}} option. Each extra vote for the same option costs more credits.',
                defaultValue_other:
                  'Each person spends credits across the {{count, number}} options. Each extra vote for the same option costs more credits.',
                count: options,
              }),
          tag: resultTypeLabel(t, type),
        }
      }
      const amount = budget
        ? t('votes.ballot.points', {
            defaultValue_one: '{{count, number}} point',
            defaultValue_other: '{{count, number}} points',
            count: total,
          })
        : t('votes.ballot.credits', {
            defaultValue_one: '{{count, number}} credit',
            defaultValue_other: '{{count, number}} credits',
            count: total,
          })
      return {
        mark: 'points',
        note: budget
          ? t('votes.ballot.rule.budget', {
              defaultValue_one: 'Each person shares out {{amount}} among the {{count, number}} option, as they like.',
              defaultValue_other:
                'Each person shares out {{amount}} among the {{count, number}} options, as they like.',
              amount,
              count: options,
            })
          : t('votes.ballot.rule.quadratic', {
              defaultValue_one:
                'Each person spends {{amount}} on the {{count, number}} option. Each extra vote for the same option costs more credits.',
              defaultValue_other:
                'Each person spends {{amount}} across the {{count, number}} options. Each extra vote for the same option costs more credits.',
              amount,
              count: options,
            }),
        tag: t('votes.ballot.tag.per_person', { defaultValue: '{{amount}} per person', amount }),
      }
    }
    default:
      return null
  }
}

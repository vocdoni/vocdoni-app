import { BallotType, inferQuestionBallotType } from '@vocdoni/ballot'
import { useTranslation } from 'react-i18next'

type ResultTypeConfig = {
  key: string
  defaultValue: string
}

const RESULT_TYPE_CONFIG: Record<BallotType, ResultTypeConfig> = {
  [BallotType.SingleChoice]: {
    key: 'process.voting_method.single_choice',
    defaultValue: 'Single choice',
  },
  [BallotType.MultiChoice]: {
    key: 'process.voting_method.multiple_choice',
    defaultValue: 'Multiple choice',
  },
  [BallotType.Approval]: {
    key: 'process.voting_method.approval',
    defaultValue: 'Approval voting',
  },
  [BallotType.Budget]: {
    key: 'process.voting_method.budget',
    defaultValue: 'Budget allocation',
  },
  [BallotType.Quadratic]: {
    key: 'process.voting_method.quadratic',
    defaultValue: 'Quadratic voting',
  },
  [BallotType.Ranked]: {
    key: 'process.voting_method.ranked',
    defaultValue: 'Ranked voting',
  },
}

// t('process.voting_method.single_choice', { defaultValue: 'Single choice' })
// t('process.voting_method.multiple_choice', { defaultValue: 'Multiple choice' })
// t('process.voting_method.approval', { defaultValue: 'Approval voting' })
// t('process.voting_method.budget', { defaultValue: 'Budget allocation' })
// t('process.voting_method.quadratic', { defaultValue: 'Quadratic voting' })
// t('process.voting_method.ranked', { defaultValue: 'Ranked voting' })

/**
 * The question's ballot type, or `undefined` when it cannot be inferred: a question that states
 * neither a type nor a ballot protocol (e.g. the read-only projection of a legacy multiple-choice
 * election) makes `inferQuestionBallotType` throw, and a label is not worth crashing a page over.
 */
export const inferQuestionBallotTypeOrUndefined = (
  question: Parameters<typeof inferQuestionBallotType>[0]
): BallotType | undefined => {
  try {
    return inferQuestionBallotType(question)
  } catch {
    return undefined
  }
}

export const useResultTypeLabel = (type?: BallotType | null, defaultValue = '') => {
  const { t } = useTranslation()

  if (type == null) return defaultValue

  const config = RESULT_TYPE_CONFIG[type]
  if (!config) return defaultValue

  return t(config.key, {
    defaultValue: config.defaultValue ?? defaultValue,
  })
}

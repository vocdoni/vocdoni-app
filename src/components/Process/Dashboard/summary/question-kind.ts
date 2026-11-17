import type { VotingProcessQuestion } from '@vocdoni/api-types'
import { tryInferQuestionBallotType } from '@vocdoni/ballot'
import type { TFunction } from 'i18next'
import { resultTypeLabel } from '~components/Process/resultTypeLabels'

/**
 * The method a question is answered with, by its name alone ("Single choice", "Multiple choice", "Ranked voting"),
 * or null for a question whose ballot type cannot be read (legacy projections carry no protocol).
 */
export const questionKind = (t: TFunction, question: VotingProcessQuestion): string | null =>
  resultTypeLabel(t, tryInferQuestionBallotType(question)) || null

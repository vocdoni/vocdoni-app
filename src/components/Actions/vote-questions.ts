import type { VotingProcessQuestion, VotingProcessResponse } from '@vocdoni/api-types'
import { useTranslation } from 'react-i18next'
import { deriveQuestionState } from '~utils/vote-state'

type NumberedQuestion = { question: VotingProcessQuestion; number: number }

export type QuestionGroups = {
  /** Open or paused now; a question held by a whole-vote pause counts even with no votes. */
  active: NumberedQuestion[]
  /** Never opened. */
  unopened: NumberedQuestion[]
}

/** The questions an end or a cancel speaks of, numbered from 1 as the ballot shows them. */
export const groupQuestions = (
  process: VotingProcessResponse,
  heldQuestionIds: readonly string[],
  now: Date
): QuestionGroups => {
  const held = new Set(heldQuestionIds)
  const groups: QuestionGroups = { active: [], unopened: [] }
  process.questions.forEach((question, index) => {
    const state = deriveQuestionState(question, process, now)
    const entry = { question, number: index + 1 }
    // A paused question with no votes derives as "to open": the pause memory tells it apart.
    if (state === 'open' || state === 'paused' || (state === 'toOpen' && held.has(question.id))) {
      groups.active.push(entry)
    } else if (state === 'toOpen') {
      groups.unopened.push(entry)
    }
  })
  return groups
}

/** "3 and 4", "4, 5 and 6": question numbers listed as the page language joins them. */
export const useNumberList = () => {
  const { i18n } = useTranslation()
  return (entries: readonly NumberedQuestion[]) =>
    new Intl.ListFormat(i18n.language, { type: 'conjunction' }).format(entries.map(({ number }) => String(number)))
}

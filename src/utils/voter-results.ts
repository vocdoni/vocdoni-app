/**
 * Whether voters see the results on the voting page, in both voting modes. The creator's choice is stored on every
 * question under `metadata.voterResults` (the API keeps `metadata` as it is and returns it on the public process read):
 * `shown` or `hidden`. A vote created before the choice existed has none and keeps its old behaviour: the results
 * screen is offered, and a question-by-question vote shows no result as each question closes.
 */
const VOTER_RESULTS_KEY = 'voterResults'
const SHOWN = 'shown'
const HIDDEN = 'hidden'
// Written by the first question-by-question builds; it means shown.
const LEGACY_SHOWN = 'perQuestion'

export type VoterResultsChoice = typeof SHOWN | typeof HIDDEN

type WithMetadata = { metadata?: Record<string, unknown> | null } | null | undefined

const choiceOf = (question: WithMetadata): VoterResultsChoice | null => {
  const value = question?.metadata?.[VOTER_RESULTS_KEY]
  if (value === SHOWN || value === LEGACY_SHOWN) return SHOWN
  if (value === HIDDEN) return HIDDEN
  return null
}

/** The creator's choice for the vote, from the first question that carries one; null on a vote that predates it. */
export const voterResultsChoice = (questions: readonly WithMetadata[] | null | undefined): VoterResultsChoice | null =>
  (questions ?? []).map(choiceOf).find((choice) => choice !== null) ?? null

/** The voter may open the vote's results screen: not when the creator hid them. */
export const voterSeesResults = (questions: readonly WithMetadata[] | null | undefined): boolean =>
  voterResultsChoice(questions) !== HIDDEN

/** Question by question: the voter sees this question's result once it closes, until the next one opens. */
export const voterSeesQuestionResult = (question: WithMetadata): boolean => choiceOf(question) === SHOWN

/** The metadata entry merged into every question of a new vote. */
export const voterResultsMetadata = (shown: boolean): Record<string, unknown> => ({
  [VOTER_RESULTS_KEY]: shown ? SHOWN : HIDDEN,
})

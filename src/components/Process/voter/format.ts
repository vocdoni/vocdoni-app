import { processVoteCount } from '@vocdoni/api-client'
import type { VotingProcessQuestion, VotingProcessResponse } from '@vocdoni/api-types'
import { BallotType, tryInferQuestionBallotType } from '@vocdoni/ballot'
import type { Answer } from './voter-flow'

type Text = string | Record<string, string | undefined> | undefined

/** A process text as the SDK's slots show it: the `default` entry, else the first one. */
export const textOf = (value: Text): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.default ?? Object.values(value).find((entry): entry is string => !!entry) ?? ''
}

/**
 * The contact a code was sent to, masked (spec D4 "code"): the first letter of an email and its domain
 * ("a•••@exemple.cat"), the last three digits of a phone ("•••678").
 */
export const maskContact = (contact: string | undefined): string => {
  const value = (contact ?? '').trim()
  const at = value.indexOf('@')
  if (at > 0) return `${value[0]}•••${value.slice(at)}`
  const digits = value.replace(/\D/g, '')
  return digits.length > 3 ? `•••${digits.slice(-3)}` : '•••'
}

type DateOptions = { month?: boolean; timeZone?: string }

/** "dijous 12 de març", or "dijous 12" without the month, in the page's language. */
export const formatVoteDay = (date: Date, language: string, { month = true, timeZone }: DateOptions = {}): string =>
  new Intl.DateTimeFormat(language, {
    weekday: 'long',
    day: 'numeric',
    ...(month ? { month: 'long' } : {}),
    timeZone,
  }).format(date)

/** "20:00", or "20:00 CET" with the zone (the opening time always carries it: spec D4 "upcoming", audit F18). */
export const formatVoteTime = (
  date: Date,
  language: string,
  { zone = false, timeZone }: { zone?: boolean; timeZone?: string } = {}
): string =>
  new Intl.DateTimeFormat(language, {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    ...(zone ? { timeZoneName: 'short' } : {}),
    timeZone,
  }).format(date)

/** Joins answer labels as the boards do, with commas ("Teulada, Calefacció, Rampa"), in every language. */
const joinLabels = (labels: string[]): string => labels.join(', ')

const choiceLabel = (question: VotingProcessQuestion, value: string): string => {
  const choice = question.choices.find((entry) => String(entry.value) === value)
  return choice ? textOf(choice.title as Text) : value
}

export type AnswerWords = {
  /** "Vot en blanc". */
  blank: string
  /** "1. Teulada": a ranked position on review. */
  ranked: (position: number, label: string) => string
}

/**
 * An answer as words, for the rail ("Teulada, Calefacció, Rampa") and the review ("1. Teulada, 2. Calefacció, 3.
 * Rampa"): one formatter for both, `positions` adds the ranks on review.
 */
export const describeAnswer = (
  question: VotingProcessQuestion,
  answer: Answer | undefined,
  words: AnswerWords,
  { positions = false }: { positions?: boolean } = {}
): string => {
  if (answer === undefined || answer === '') return ''
  if (!Array.isArray(answer)) return choiceLabel(question, answer)
  const values = answer.filter((value) => value !== '')
  if (!values.length) return words.blank
  const ranked = tryInferQuestionBallotType(question as Parameters<typeof tryInferQuestionBallotType>[0])
  const labels = values.map((value, index) =>
    positions && ranked === BallotType.Ranked
      ? words.ranked(index + 1, choiceLabel(question, value))
      : choiceLabel(question, value)
  )
  return joinLabels(labels)
}

export type Turnout = { count: number; total?: number }

/**
 * Who has voted, for the welcome count, the closed screen and the results (spec D4 "Turnout", audit F16): nothing
 * when the deployment hides counts; the denominator is the questions' `maxVoters` when the read carries it. The
 * welcome screen hides its count line when `count` is 0 (that is the screen's rule; closed and results still show it).
 */
export const voterTurnout = (
  election: Pick<VotingProcessResponse, 'questions'>,
  env: { HIDE_VOTER_COUNT?: boolean }
): Turnout | null => {
  if (env.HIDE_VOTER_COUNT) return null
  const results = election.questions.map((question) => ({ ...question.results, questionId: question.id }))
  const count = processVoteCount({ questions: results } as Parameters<typeof processVoteCount>[0])
  const totals = election.questions.map((question) => question.results?.maxVoters ?? 0).filter((value) => value > 0)
  return totals.length ? { count, total: Math.max(...totals) } : { count }
}

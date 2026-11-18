import { processVoteCount } from '@vocdoni/api-client'
import type { VotingProcessQuestion, VotingProcessResponse } from '@vocdoni/api-types'
import { BallotType, questionSelectionRange, tryInferQuestionBallotType } from '@vocdoni/ballot'
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

type DateOptions = { reference?: Date; timeZone?: string }

const yearOf = (date: Date, timeZone?: string): string =>
  new Intl.DateTimeFormat('en', { year: 'numeric', timeZone }).format(date)

const monthOf = (date: Date, timeZone?: string): string =>
  new Intl.DateTimeFormat('en', { month: 'numeric', timeZone }).format(date)

/** The date's parts in the locale's own order, from `formatToParts`: no month name or order is written here. */
const dayText = (date: Date, locale: string, fields: Intl.DateTimeFormatOptions, timeZone?: string) =>
  new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', ...fields, timeZone }).formatToParts(date)

/**
 * Joins the parts as ICU words them, except the comma some locales put after a leading weekday ("dijous, 17 de
 * desembre"): the date sits mid-sentence ("Oberta fins dijous 17 de desembre a les 20:00"), where it would dangle.
 */
const dropWeekdayComma = (parts: Intl.DateTimeFormatPart[]): string =>
  parts
    .map((part, index) =>
      part.type === 'literal' && parts[index - 1]?.type === 'weekday' ? part.value.replace(/^\s*,\s*/, ' ') : part.value
    )
    .join('')

/** Languages whose weekday keeps its comma mid-sentence ("am Donnerstag, 17. Dezember", gate F16): ICU's own text. */
const KEEPS_WEEKDAY_COMMA = new Set(['de'])

const joinDay = (parts: Intl.DateTimeFormatPart[], language: string): string =>
  KEEPS_WEEKDAY_COMMA.has(language.split('-')[0]) ? parts.map((part) => part.value).join('') : dropWeekdayComma(parts)

/**
 * The vote's day as the boards draw it, relative to a `reference` ("now" by default; for the end date inside the
 * upcoming sentence, the start date): in the reference's month and year "dilluns 17"; in another month "dilluns 17
 * de juny"; in another year the year too, in ICU's wording ("del 2027"). English always carries the month
 * and reads in English order ("Monday 17 November"), as does any language whose weekday and day do not read weekday
 * first.
 */
export const formatVoteDay = (
  date: Date,
  language: string,
  { reference = new Date(), timeZone }: DateOptions = {}
): string => {
  const english = language.split('-')[0] === 'en'
  const locale = english ? 'en-GB' : language
  const sameYear = yearOf(date, timeZone) === yearOf(reference, timeZone)
  if (!english && sameYear && monthOf(date, timeZone) === monthOf(reference, timeZone)) {
    const short = dayText(date, locale, {}, timeZone)
    const types = short.map((part) => part.type)
    if (types.indexOf('weekday') < types.indexOf('day')) return joinDay(short, language)
  }
  return joinDay(dayText(date, locale, { month: 'long', ...(sameYear ? {} : { year: 'numeric' }) }, timeZone), language)
}

/** The full stop that ends a sentence made of a title: none when the title already ends in punctuation ("Vols?"). */
export const sentenceStop = (title: string): string => (/[.!?…;]["')»”]?\s*$/.test(title) ? '' : '.')

const calendarDay = (date: Date, timeZone?: string): number => {
  const [year, month, day] = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone,
  })
    .format(date)
    .split('-')
    .map(Number)
  return Date.UTC(year, month - 1, day) / 86_400_000
}

/**
 * The day to come back on, as a sentence says it ("tornar-hi dijous", board 9): the bare weekday when the date falls
 * in the next six days, where it is unambiguous, else the full day.
 */
export const formatVoteReturnDay = (
  date: Date,
  language: string,
  { reference = new Date(), timeZone }: DateOptions = {}
): string => {
  const ahead = calendarDay(date, timeZone) - calendarDay(reference, timeZone)
  if (ahead < 0 || ahead > 6) return formatVoteDay(date, language, { reference, timeZone })
  return new Intl.DateTimeFormat(language.split('-')[0] === 'en' ? 'en-GB' : language, {
    weekday: 'long',
    timeZone,
  }).format(date)
}

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
 * Who has voted, for the closed screen and the results (spec D4 "Turnout", audit F16): nothing when the deployment
 * hides counts; the denominator is the questions' `maxVoters` when the read carries it.
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

/** How a question was answered, for the line under its title on the results (boards M10, M11). */
type ResultKind = { key: 'single' } | { key: 'multiple'; count: number } | { key: 'approval' } | { key: 'ranked' }

/**
 * A question's `ResultKind`, or null when the line says nothing: a legacy question with no ballot type, and the
 * budget and quadratic types the voter page cannot cast (their bars still count points).
 */
export const resultKind = (question: VotingProcessQuestion): ResultKind | null => {
  const shape = question as Parameters<typeof questionSelectionRange>[0]
  switch (tryInferQuestionBallotType(shape)) {
    case BallotType.SingleChoice:
      return { key: 'single' }
    case BallotType.MultiChoice:
      return { key: 'multiple', count: questionSelectionRange(shape).max }
    case BallotType.Approval:
      return { key: 'approval' }
    case BallotType.Ranked:
      return { key: 'ranked' }
    default:
      return null
  }
}

/** Every question carries the chain's final tally: the results are final, no longer being counted. */
export const resultsFinal = (election: Pick<VotingProcessResponse, 'questions'>): boolean =>
  election.questions.length > 0 && election.questions.every((question) => question.results?.finalResults === true)

import type { TFunction } from 'i18next'
import type { Option, Question } from './common'

const isBlank = (value?: string) => !value?.trim()

const isEmptyOption = (option: Option) => isBlank(option.option) && isBlank(option.description) && !option.image

// A leading "1.", "2)", "-", "*" or "•" is list formatting, not part of the option
const LIST_MARKER = /^\s*(?:[-*•]|\d+[.)])\s+/

/** A pasted list, one option per line. Blank lines and list markers are dropped. */
export const splitPastedOptions = (text: string): string[] =>
  text
    .split(/\r?\n/)
    .map((line) => line.replace(LIST_MARKER, '').trim())
    .filter(Boolean)

/**
 * Lays pasted lines out from the option they were pasted into: an empty target takes the first
 * line, following empty options are filled next, and whatever is left is inserted after them.
 */
export const insertPastedOptions = (options: Option[], at: number, lines: string[]): Option[] => {
  const result = options.map((option) => ({ ...option }))
  let position = result[at] && isBlank(result[at].option) ? at : at + 1

  for (const line of lines) {
    if (position < result.length && isBlank(result[position].option)) {
      result[position] = { ...result[position], option: line }
    } else {
      result.splice(position, 0, { option: line })
    }
    position++
  }

  return result
}

/** Drops options left completely empty, keeping the two every question needs. */
export const pruneEmptyOptions = (options: Option[]): Option[] => {
  const kept = options.filter((option) => !isEmptyOption(option))
  if (kept.length >= 2) return kept
  // Too few filled in: keep the first empty ones so the question still shows two fields to fill
  const empties = options.filter(isEmptyOption).slice(0, 2 - kept.length)
  return options.filter((option) => kept.includes(option) || empties.includes(option))
}

/** Nothing typed in yet, so deleting it loses nothing and needs no confirmation. */
export const isQuestionEmpty = (question: Question) =>
  isBlank(question.title) && isBlank(question.description) && question.options.every(isEmptyOption)

export const yesNoAbstain = (t: TFunction): Option[] => [
  { option: t('process_create.question.yes', { defaultValue: 'Yes' }) },
  { option: t('process_create.question.no', { defaultValue: 'No' }) },
  { option: t('process_create.question.abstain', { defaultValue: 'Abstain' }) },
]

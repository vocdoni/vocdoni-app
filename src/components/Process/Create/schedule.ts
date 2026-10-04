import { addDays, format, isValid, parse } from 'date-fns'
import type { Process } from './common'

/** The value format of a native `<input type='date'>` */
export const DATE_INPUT_FORMAT = 'yyyy-MM-dd'

const DAY_MS = 24 * 60 * 60 * 1000

export type ScheduleValues = Pick<Process, 'autoStart' | 'startDate' | 'startTime' | 'endDate' | 'endTime'>

export type ScheduleIssue =
  | 'start_missing'
  | 'start_in_past'
  | 'end_missing'
  | 'end_in_past'
  | 'end_before_start'
  | 'too_long'

// Same parsing as the request builder, so what the page checks is what the API receives
const parseLocal = (date?: string, time?: string): Date | undefined => {
  if (!date || !time) return undefined
  const parsed = parse(`${date} ${time}`, 'yyyy-MM-dd HH:mm', new Date())
  return isValid(parsed) ? parsed : undefined
}

/** The plan's longest vote, in days; `undefined` when the plan sets no limit. */
export const parseMaxDays = (value: unknown): number | undefined => {
  const days = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10)
  return Number.isFinite(days) && days > 0 ? days : undefined
}

/** When the vote opens: now when it starts right away, otherwise the chosen date and time. */
export const scheduleStart = (values: ScheduleValues, now: Date): Date | undefined =>
  values.autoStart ? now : parseLocal(values.startDate, values.startTime)

export const scheduleEnd = (values: ScheduleValues): Date | undefined => parseLocal(values.endDate, values.endTime)

/**
 * The closing date can't be picked before the vote opens, nor past what the plan allows. A start
 * date without a time yet still bounds the picker by its day.
 */
export const endDateBounds = (values: ScheduleValues, now: Date, maxDays?: number) => {
  const start =
    scheduleStart(values, now) ??
    (values.startDate ? parse(values.startDate, DATE_INPUT_FORMAT, new Date()) : undefined) ??
    now
  const from = isValid(start) ? start : now

  return {
    min: format(from, DATE_INPUT_FORMAT),
    max: maxDays ? format(addDays(from, maxDays), DATE_INPUT_FORMAT) : undefined,
  }
}

/** Everything that stops these dates from being published, in the order it's worth fixing. */
export const getScheduleIssues = (values: ScheduleValues, now: Date, maxDays?: number): ScheduleIssue[] => {
  const issues: ScheduleIssue[] = []
  const start = scheduleStart(values, now)

  if (!values.autoStart) {
    if (!start) issues.push('start_missing')
    else if (start < now) issues.push('start_in_past')
  }

  const end = scheduleEnd(values)
  if (!end) {
    issues.push('end_missing')
    return issues
  }

  if (end <= now) issues.push('end_in_past')
  else if (start && end <= start) issues.push('end_before_start')

  if (start && maxDays && end.getTime() - start.getTime() > maxDays * DAY_MS) issues.push('too_long')

  return issues
}

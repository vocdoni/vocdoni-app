import type { LocalizedInput } from '@vocdoni/api-types'
import { formatDuration, type Duration } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { getLocalizedRawText } from '~utils/localized-text'
import { timeLeft } from '~utils/vote-state'
import { datesLocale } from './locales'

const LONG_DATE: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
}
const SHORT_DATE: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }
const WEEKDAY: Intl.DateTimeFormatOptions = { weekday: 'long' }
const TIME: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }
const MINUTE = 60_000

/** Dates, time left and result wording of the votes screens, in the page language. */
export const useVoteText = () => {
  const { t, i18n } = useTranslation()
  const text = (value: LocalizedInput | undefined) =>
    typeof value === 'string' ? value : getLocalizedRawText(value, i18n.language)

  // Intl, because Catalan needs "9 d'abril", which no date-fns pattern gives. A day of another year carries it.
  const formatDate = (date: Date | string | undefined, options: Intl.DateTimeFormatOptions) => {
    const value = date ? new Date(date) : undefined
    if (!value || isNaN(value.getTime())) return ''
    const withYear = options.month && value.getFullYear() !== new Date().getFullYear()
    return new Intl.DateTimeFormat(i18n.language, withYear ? { ...options, year: 'numeric' } : options).format(value)
  }

  // Each unit in words, then the two as a list in the page's language ("2 days and 4 hours").
  const durationWords = (duration: Duration) => {
    const locale = datesLocale(i18n.language)
    const units = (Object.keys(duration) as (keyof Duration)[])
      .filter((unit) => duration[unit])
      .map((unit) => formatDuration({ [unit]: duration[unit] }, { locale }))
    return new Intl.ListFormat(i18n.language, { type: 'conjunction' }).format(units)
  }

  // The boards' date ("dijous 12 de març a les 20:00") is a translated pattern over Intl parts: Intl's own long
  // form puts commas around the weekday and the time in some languages.
  const dateParts = (date: Date | string | undefined) => ({
    weekday: formatDate(date, WEEKDAY),
    day: formatDate(date, SHORT_DATE),
    time: formatDate(date, TIME),
  })
  const day = (date: Date | string | undefined) => {
    const parts = dateParts(date)
    return parts.day ? t('votes.date.day', { defaultValue: '{{weekday}}, {{day}}', ...parts }) : ''
  }

  return {
    /** "Thursday, March 12" (ca "dijous 12 de març"): weekday, day and month. */
    day,
    /** "Thursday, March 12 at 20:00" (ca "dijous 12 de març a les 20:00"): the boards' date and time; the year only when it is not this one. */
    dateAt: (date: Date | string | undefined) => {
      const parts = dateParts(date)
      return parts.day ? t('votes.date.at', { defaultValue: '{{weekday}}, {{day}} at {{time}}', ...parts }) : ''
    },
    /** "20:00". */
    time: (date: Date | string | undefined) => formatDate(date, TIME),
    /** "46 minutes ago", in the largest whole unit (a minute at least). */
    ago: (date: Date, now: Date) => {
      const minutes = Math.max(1, Math.floor((now.getTime() - date.getTime()) / MINUTE))
      const relative = new Intl.RelativeTimeFormat(i18n.language, { numeric: 'always' })
      if (minutes < 60) return relative.format(-minutes, 'minute')
      if (minutes < 24 * 60) return relative.format(-Math.floor(minutes / 60), 'hour')
      return relative.format(-Math.floor(minutes / (24 * 60)), 'day')
    },
    /** "1 hour and 28 minutes" from `start` to `end`: the two largest units, a minute at least. */
    duration: (start: Date, end: Date) => durationWords(timeLeft(end, start) ?? { minutes: 1 }),
    /** A title, choice or description in the page language. */
    text,
    /** "Thursday, April 9 at 20:00": weekday; the year only when it is not this one. */
    longDate: (date: Date | string | undefined) => formatDate(date, LONG_DATE),
    /** "April 9" ("April 9, 2024" another year): the closed date in the list's state column. */
    shortDate: (date: Date | string | undefined) => formatDate(date, SHORT_DATE),
    /** "2 days and 4 hours left", or null once the end has passed. */
    timeLeft: (end: Date | undefined, now: Date) => {
      const duration = timeLeft(end, now)
      if (!duration) return null
      return t('votes.time_left', { defaultValue: '{{duration}} left', duration: durationWords(duration) })
    },
  }
}

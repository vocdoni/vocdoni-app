import type { LocalizedInput, Choice } from '@vocdoni/api-types'
import { formatDuration, type Duration } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { getLocalizedRawText } from '~utils/localized-text'
import { quantity } from '~utils/numbers'
import type { QuestionOutcome } from '~utils/vote-outcome'
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

  // Intl, because Catalan needs "9 d'abril", which no date-fns pattern gives (audit F6).
  const formatDate = (date: Date | string | undefined, options: Intl.DateTimeFormatOptions) => {
    const value = date ? new Date(date) : undefined
    return value && !isNaN(value.getTime()) ? new Intl.DateTimeFormat(i18n.language, options).format(value) : ''
  }

  const durationWords = (duration: Duration) =>
    formatDuration(duration, {
      locale: datesLocale(i18n.language),
      delimiter: t('votes.time_left_delimiter', { defaultValue: ' and ' }),
    })

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
    /** "Thursday, March 12 at 20:00" (ca "dijous 12 de març a les 20:00"): the boards' date and time, no year. */
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
    /** "Thursday, April 9 at 20:00": weekday, no year. */
    longDate: (date: Date | string | undefined) => formatDate(date, LONG_DATE),
    /** "April 9": the closed date in the list's state column. */
    shortDate: (date: Date | string | undefined) => formatDate(date, SHORT_DATE),
    /** "2 days and 4 hours left", or null once the end has passed. */
    timeLeft: (end: Date | undefined, now: Date) => {
      const duration = timeLeft(end, now)
      if (!duration) return null
      return t('votes.time_left', { defaultValue: '{{duration}} left', duration: durationWords(duration) })
    },
    /** A question's result in a few words, or null when there is none to show. */
    outcome: (outcome: QuestionOutcome | null) => {
      if (!outcome) return null
      const name = (choice: Choice) => text(choice.title)
      switch (outcome.kind) {
        case 'tie':
          return t('votes.outcome.tie', { defaultValue: 'Tie' })
        case 'pair':
          return t('votes.outcome.pair', {
            defaultValue: '{{winner}}, {{winnerVotes}} to {{otherVotes}}',
            winner: name(outcome.winner),
            winnerVotes: quantity(outcome.winnerVotes),
            otherVotes: quantity(outcome.otherVotes),
          })
        case 'winner':
          return outcome.weighted
            ? t('votes.outcome.winner_weighted', {
                defaultValue: '{{winner}} wins with a weight of {{votes}}',
                winner: name(outcome.winner),
                votes: quantity(outcome.votes),
              })
            : t('votes.outcome.winner', {
                defaultValue_one: '{{winner}} wins with {{votes}} vote',
                defaultValue_other: '{{winner}} wins with {{votes}} votes',
                count: outcome.votes,
                winner: name(outcome.winner),
                votes: quantity(outcome.votes),
              })
        case 'top':
          return t('votes.outcome.top', { defaultValue: 'Most voted: {{choice}}', choice: name(outcome.choice) })
      }
    },
  }
}

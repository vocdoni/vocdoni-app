import type { LocalizedInput, Choice } from '@vocdoni/api-types'
import { formatDuration } from 'date-fns'
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

  return {
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
      const words = formatDuration(duration, {
        locale: datesLocale(i18n.language),
        delimiter: t('votes.time_left_delimiter', { defaultValue: ' and ' }),
      })
      return t('votes.time_left', { defaultValue: '{{duration}} left', duration: words })
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

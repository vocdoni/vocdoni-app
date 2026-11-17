import { useTranslation } from 'react-i18next'
import type { QuestionStateCounts } from '~utils/vote-state'
import type { ManageStep } from './row-state'

type CountState = keyof QuestionStateCounts

// The questions cards count closed first; the phone band starts with what is open (boards).
const ORDER: Record<'card' | 'band', CountState[]> = {
  card: ['closed', 'open', 'paused', 'toOpen', 'notOpened', 'canceled'],
  band: ['open', 'paused', 'closed', 'toOpen', 'notOpened', 'canceled'],
}

/** The question counts (Gestió and Resum) and the next-step line of the Gestió tab. */
export const useManageText = () => {
  const { t, i18n } = useTranslation()

  const part = (state: CountState, count: number) => {
    switch (state) {
      case 'closed':
        return t('votes.manage.count.closed', {
          defaultValue_one: '{{count, number}} closed',
          defaultValue_other: '{{count, number}} closed',
          count,
        })
      case 'open':
        return t('votes.manage.count.open', {
          defaultValue_one: '{{count, number}} open',
          defaultValue_other: '{{count, number}} open',
          count,
        })
      case 'paused':
        return t('votes.manage.count.paused', {
          defaultValue_one: '{{count, number}} paused',
          defaultValue_other: '{{count, number}} paused',
          count,
        })
      case 'toOpen':
        return t('votes.manage.count.to_open', {
          defaultValue_one: '{{count, number}} to open',
          defaultValue_other: '{{count, number}} to open',
          count,
        })
      case 'notOpened':
        return t('votes.manage.count.not_opened', {
          defaultValue_one: '{{count, number}} not opened',
          defaultValue_other: '{{count, number}} not opened',
          count,
        })
      case 'canceled':
        return t('votes.manage.count.canceled', {
          defaultValue_one: '{{count, number}} voided',
          defaultValue_other: '{{count, number}} voided',
          count,
        })
    }
  }

  const list = (numbers: number[]) =>
    new Intl.ListFormat(i18n.language, { type: 'conjunction' }).format(numbers.map(String))

  return {
    /** "2 closed · 1 open · 1 to open" (card) or "1 open, 2 closed, 1 to open" (band). Held questions count as paused. */
    counts: (counts: QuestionStateCounts & { held?: number }, where: 'card' | 'band') => {
      const of: QuestionStateCounts = { ...counts, paused: counts.paused + (counts.held ?? 0) }
      return ORDER[where]
        .filter((state) => of[state] > 0)
        .map((state) => part(state, of[state]))
        .join(where === 'card' ? ' · ' : ', ')
    },
    next: (step: ManageStep) => {
      switch (step.action) {
        case 'close':
          return t('votes.manage.next.close', {
            defaultValue_one: 'Next step: close question {{numbers}}',
            defaultValue_other: 'Next step: close questions {{numbers}}',
            count: step.numbers.length,
            numbers: list(step.numbers),
          })
        case 'open':
          return t('votes.manage.next.open', {
            defaultValue: 'Next step: open question {{numbers}}',
            numbers: list(step.numbers),
          })
        case 'resume':
          return t('votes.manage.next.resume', {
            defaultValue: 'Next step: resume question {{numbers}}',
            numbers: list(step.numbers),
          })
        case 'resumeVote':
          return t('votes.manage.next.resume_vote', { defaultValue: 'Next step: resume the vote' })
      }
    },
  }
}

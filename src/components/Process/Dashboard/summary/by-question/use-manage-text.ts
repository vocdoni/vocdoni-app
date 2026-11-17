import type { VotingProcessQuestion } from '@vocdoni/api-types'
import { useTranslation } from 'react-i18next'
import { useVoteText } from '~i18n/use-vote-text'
import { quantity } from '~utils/numbers'
import type { QuestionStateCounts } from '~utils/vote-state'
import { questionKind } from '../question-kind'
import type { ManageStep } from './row-state'

type CountState = keyof QuestionStateCounts

// A description is markdown: its links keep their text, its emphasis and heading marks go.
const plainText = (markdown: string) =>
  markdown
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_~`#>]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()

// Closed first, as both boards count them.
const ORDER: CountState[] = ['closed', 'open', 'paused', 'toOpen', 'notOpened', 'canceled']

/** The question counts, the next step and the lines of Resum's question rows (question by question). */
export const useManageText = () => {
  const { t, i18n } = useTranslation()
  const { text } = useVoteText()

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
    /**
     * "2 closed · 1 open · 1 to open" on the desktop board, a list in the page's language on a phone or tablet. Held
     * questions count as paused.
     */
    counts: (counts: QuestionStateCounts & { held?: number }, desktop: boolean) => {
      const of: QuestionStateCounts = { ...counts, paused: counts.paused + (counts.held ?? 0) }
      const parts = ORDER.filter((state) => of[state] > 0).map((state) => part(state, of[state]))
      return desktop ? parts.join(' · ') : new Intl.ListFormat(i18n.language, { type: 'unit' }).format(parts)
    },
    /**
     * The quiet line under a question's title: its text, as plain text (it is written in markdown), and how it is
     * answered as a sentence of its own ("Single choice."). Nothing is added after the organiser's text.
     */
    note: (question: VotingProcessQuestion, withDescription = true) => {
      const kind = questionKind(t, question)
      const description = withDescription && question.description ? plainText(text(question.description)) : ''
      const kindSentence = kind ? t('votes.manage.kind', { defaultValue: '{{kind}}.', kind }) : ''
      return [description, kindSentence].filter(Boolean).join(' ')
    },
    /** "Turnout: 172 of 312" over a question's bar, or its votes when the electorate is unknown. */
    turnout: (votes: number, electorate?: number) =>
      electorate
        ? t('votes.summary.answered', {
            defaultValue: 'Turnout: {{answered}} of {{total}}',
            answered: quantity(votes),
            total: quantity(electorate),
          })
        : t('votes.summary.question_votes', {
            defaultValue_one: '{{count, number}} vote',
            defaultValue_other: '{{count, number}} votes',
            count: votes,
          }),
    /** The bar's accessible name. */
    turnoutLabel: (votes: number, electorate: number | undefined, percent: number | undefined) =>
      electorate
        ? t('votes.manage.question_ruler', {
            defaultValue: '{{voted}} of {{total}} people voted, {{percent}}%.',
            voted: quantity(votes),
            total: quantity(electorate),
            percent: percent ?? 0,
          })
        : t('votes.manage.question_ruler_count', { defaultValue: '{{voted}} people voted.', voted: quantity(votes) }),
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
        case 'resumeVote':
          return t('votes.manage.next.resume_vote', { defaultValue: 'Next step: resume the vote' })
      }
    },
  }
}

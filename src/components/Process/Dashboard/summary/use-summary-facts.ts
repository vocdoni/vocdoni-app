import { isBeforeStart } from '@vocdoni/api-client'
import { tryInferQuestionBallotType } from '@vocdoni/ballot'
import { isSameDay } from 'date-fns'
import { useTranslation } from 'react-i18next'
import type { Fact } from '~components/ui/FactList'
import { useVoteText } from '~i18n/use-vote-text'
import { useAnonymityLabels } from '../../anonymityLabels'
import { useResultTypeLabel } from '../../resultTypeLabels'
import type { SummaryModel } from './use-summary-model'

/**
 * The hero's facts, as many as each board draws: four rows on the desktop (census, questions, close, results; a
 * question-by-question vote shows its start instead of the questions and close, and has no delegated votes to show),
 * seven on a phone or tablet (the same plus ballot type, anonymity and vote change).
 */
export const useSummaryFacts = (model: SummaryModel, desktop: boolean): Fact[] => {
  const { t } = useTranslation()
  const { dateAt, time } = useVoteText()
  const { election, byQuestion, state, secret, endDate, now } = model
  const firstQuestion = election.questions[0]
  const ballotType = useResultTypeLabel(firstQuestion ? tryInferQuestionBallotType(firstQuestion) : undefined, '')
  const { short: anonymity, mechanismDescription } = useAnonymityLabels(election.census?.anonymous)

  const census: Fact = {
    id: 'census',
    label: t('votes.summary.label.census', { defaultValue: 'Census' }),
    value: t('votes.summary.fact.census', {
      defaultValue_one: '{{count, number}} person',
      defaultValue_other: '{{count, number}} people',
      count: election.census?.size ?? 0,
    }),
  }
  const questions: Fact = {
    id: 'questions',
    label: t('votes.summary.label.questions', { defaultValue: 'Questions' }),
    value: byQuestion
      ? t('votes.summary.fact.questions_by_question', {
          defaultValue_one: '{{count, number}}, question by question',
          defaultValue_other: '{{count, number}}, question by question',
          count: election.questions.length,
        })
      : t('votes.summary.fact.questions_all', {
          defaultValue_one: '{{count, number}}, all at once',
          defaultValue_other: '{{count, number}}, all at once',
          count: election.questions.length,
        }),
  }
  const closes: Fact = {
    id: 'closes',
    label:
      state === 'closed'
        ? t('votes.summary.label.closed', { defaultValue: 'Closed' })
        : t('votes.summary.label.closes', { defaultValue: 'Closes' }),
    value: dateAt(endDate),
  }
  const results: Fact = {
    id: 'results',
    label: t('votes.summary.label.results', { defaultValue: 'Results' }),
    value:
      state === 'closed' && !byQuestion
        ? t('votes.summary.fact.results_out', { defaultValue: 'public' })
        : !secret
          ? t('votes.summary.fact.results_live', { defaultValue: 'live, during the vote' })
          : byQuestion
            ? t('votes.summary.fact.results_hidden_by_question', { defaultValue: 'when each question closes' })
            : t('votes.summary.fact.results_hidden', { defaultValue: 'when the vote closes' }),
  }

  if (desktop) {
    if (!byQuestion) return [census, questions, closes, results]
    const startDate = election.startDate ? new Date(election.startDate) : undefined
    let started = dateAt(startDate)
    if (isBeforeStart(election.startDate, now)) {
      started = t('votes.summary.fact.starts_planned', { defaultValue: 'planned {{date}}', date: started })
    } else if (startDate && isSameDay(startDate, now)) {
      started = t('votes.summary.fact.started_today', {
        defaultValue: 'today at {{time}}',
        time: time(startDate),
      })
    }
    const start: Fact = {
      id: 'start',
      label: t('votes.summary.label.start', { defaultValue: 'Start' }),
      value: started,
    }
    return [census, start, results]
  }

  return [
    census,
    questions,
    closes,
    results,
    { id: 'ballot', label: t('votes.summary.label.type', { defaultValue: 'Type' }), value: ballotType },
    {
      id: 'anonymity',
      label: t('votes.summary.label.anonymity', { defaultValue: 'Anonymity' }),
      value: anonymity,
      tooltip: mechanismDescription,
    },
    {
      id: 'overwrite',
      label: t('votes.summary.label.overwrite', { defaultValue: 'Vote overwrite' }),
      value: firstQuestion?.ballotProtocol?.maxVoteOverwrites
        ? t('votes.summary.fact.overwrite_allowed', { defaultValue: 'Enabled' })
        : t('votes.summary.fact.overwrite_not_allowed', { defaultValue: 'Disabled' }),
    },
  ]
}

import { isBeforeStart } from '@vocdoni/api-client'
import { tryInferQuestionBallotType } from '@vocdoni/ballot'
import { isSameDay } from 'date-fns'
import { useTranslation } from 'react-i18next'
import type { Fact } from '~components/ui/FactList'
import { useVoteText } from '~i18n/use-vote-text'
import { useAnonymityLabels } from '../../anonymityLabels'
import { useResultTypeLabel } from '../../resultTypeLabels'
import type { SummaryModel } from './use-summary-model'

// The one value every question shares, or undefined when they differ (the vote has no single answer then).
const shared = <T>(values: T[]): T | undefined =>
  values.length && values.every((value) => value === values[0]) ? values[0] : undefined

/**
 * The hero's facts, as many as each board draws: four rows on the desktop (census, questions, close, results; a
 * question-by-question vote that is not over shows its start instead of the questions), seven on a phone or tablet
 * (the same plus ballot type, anonymity and vote change). A fact the backend has no data for is left out, and so is a
 * fact about the questions they do not share (each question has its own ballot).
 */
export const useSummaryFacts = (model: SummaryModel, desktop: boolean): Fact[] => {
  const { t } = useTranslation()
  const { dateAt, time } = useVoteText()
  const { election, byQuestion, state, secret, endDate, now } = model
  const sharedType = shared(election.questions.map((question) => tryInferQuestionBallotType(question)))
  const ballotType = useResultTypeLabel(sharedType, '')
  const sharedOverwrite = shared(election.questions.map((question) => !!question.ballotProtocol?.maxVoteOverwrites))
  const { short: anonymity, mechanismDescription } = useAnonymityLabels(election.census?.anonymous)
  const closed = state === 'closed'

  const census: Fact | null = election.census?.size
    ? {
        id: 'census',
        label: t('votes.summary.label.census', { defaultValue: 'Census' }),
        value: t('votes.summary.fact.census', {
          defaultValue_one: '{{count, number}} person',
          defaultValue_other: '{{count, number}} people',
          count: election.census.size,
        }),
      }
    : null
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
          // One question has no "all at once" to it.
          defaultValue_one: '{{count, number}}',
          defaultValue_other: '{{count, number}}, all at once',
          count: election.questions.length,
        }),
  }
  const closes: Fact | null = endDate
    ? {
        id: 'closes',
        label: closed
          ? t('votes.summary.label.closed', { defaultValue: 'Closed' })
          : t('votes.summary.label.closes', { defaultValue: 'Closes' }),
        value: dateAt(endDate),
      }
    : null
  const results: Fact = {
    id: 'results',
    label: t('votes.summary.label.results', { defaultValue: 'Results' }),
    value: closed
      ? t('votes.summary.fact.results_out', { defaultValue: 'public' })
      : !secret
        ? t('votes.summary.fact.results_live', { defaultValue: 'live, during the vote' })
        : byQuestion
          ? t('votes.summary.fact.results_hidden_by_question', { defaultValue: 'when each question closes' })
          : t('votes.summary.fact.results_hidden', { defaultValue: 'when the vote closes' }),
  }
  const present = (facts: (Fact | null)[]) => facts.filter((fact): fact is Fact => !!fact)

  if (desktop) {
    // A closed vote reads the same in both modes: when it closed and that the results are public.
    if (!byQuestion || closed) return present([census, questions, closes, results])
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
    const start: Fact | null = startDate
      ? { id: 'start', label: t('votes.summary.label.start', { defaultValue: 'Start' }), value: started }
      : null
    return present([census, start, closes, results])
  }

  return present([
    census,
    questions,
    closes,
    results,
    sharedType !== undefined && ballotType
      ? { id: 'ballot', label: t('votes.summary.label.type', { defaultValue: 'Type' }), value: ballotType }
      : null,
    {
      id: 'anonymity',
      label: t('votes.summary.label.anonymity', { defaultValue: 'Anonymity' }),
      value: anonymity,
      tooltip: mechanismDescription,
    },
    sharedOverwrite === undefined
      ? null
      : {
          id: 'overwrite',
          label: t('votes.summary.label.overwrite', { defaultValue: 'Vote overwrite' }),
          value: sharedOverwrite
            ? t('votes.summary.fact.overwrite_allowed', { defaultValue: 'Enabled' })
            : t('votes.summary.fact.overwrite_not_allowed', { defaultValue: 'Disabled' }),
        },
  ])
}

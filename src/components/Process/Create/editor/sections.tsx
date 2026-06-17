import { ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { IconType } from 'react-icons'
import { LuCalendarClock, LuChartNoAxesColumn, LuUsersRound } from 'react-icons/lu'
import { Process } from '../common'
import { AccessSettings } from './controls/AccessSettings'
import { ResultsSettings } from './controls/ResultsSettings'
import { ScheduleSettings } from './controls/ScheduleSettings'

export type EditorSectionId = 'schedule' | 'results' | 'access'

export type EditorSection = {
  id: EditorSectionId
  icon: IconType
  title: string
  subtitle: string
  /** One-line live summary of the section's current state. */
  summary: string
  /** True when the section is meaningfully configured (drives completion dots). */
  complete: boolean
  render: () => ReactNode
}

/**
 * Single source of truth for the three settings groups. Path A renders these as
 * cards directly; Paths B and C reuse the data (icon/title/summary/complete) and
 * the control bodies while presenting them with bespoke chrome.
 */
export const useEditorSections = (): EditorSection[] => {
  const { t } = useTranslation()
  const { watch } = useFormContext<Process>()

  const autoStart = watch('autoStart')
  const startDate = watch('startDate')
  const endDate = watch('endDate')
  const resultVisibility = watch('resultVisibility')
  const weightedVote = watch('weightedVote')
  const census = watch('census')

  const scheduleSummary = autoStart
    ? endDate
      ? t('editor.summary.schedule_now_until', { defaultValue: 'Starts now · ends {{date}}', date: endDate })
      : t('editor.summary.schedule_now', { defaultValue: 'Starts immediately' })
    : startDate && endDate
      ? t('editor.summary.schedule_range', { defaultValue: '{{start}} → {{end}}', start: startDate, end: endDate })
      : t('editor.summary.schedule_unset', { defaultValue: 'Set start and end' })

  // Both choices are unset by default — the admin must pick each one.
  const resultsChosen = resultVisibility != null && weightedVote != null
  const resultsSummary = resultsChosen
    ? [
        resultVisibility === 'live'
          ? t('process_create.result_visibility.live', { defaultValue: 'Live results' })
          : t('process_create.result_visibility.hidden', { defaultValue: 'Hidden until the end' }),
        weightedVote
          ? t('process_create.weight.weighted', { defaultValue: 'Weighted by voting power' })
          : t('process_create.weight.equal', { defaultValue: 'One person, one vote' }),
      ].join(' · ')
    : t('editor.summary.results_unset', { defaultValue: 'Choose visibility & voting power' })

  const accessSummary = census
    ? t('editor.summary.access_ready', { defaultValue: '{{count}} voters · authentication ready', count: census.size })
    : t('editor.summary.access_unset', { defaultValue: 'Choose voters & authentication' })

  return [
    {
      id: 'schedule',
      icon: LuCalendarClock,
      title: t('editor.section.schedule', { defaultValue: 'Schedule' }),
      subtitle: t('editor.section.schedule_sub', { defaultValue: 'When voting opens and closes' }),
      summary: scheduleSummary,
      complete: autoStart ? !!endDate : !!(startDate && endDate),
      render: () => <ScheduleSettings />,
    },
    {
      id: 'results',
      icon: LuChartNoAxesColumn,
      title: t('editor.section.results', { defaultValue: 'Results & voting' }),
      subtitle: t('editor.section.results_sub', { defaultValue: 'Visibility and voting power' }),
      summary: resultsSummary,
      complete: resultsChosen,
      render: () => <ResultsSettings />,
    },
    {
      id: 'access',
      icon: LuUsersRound,
      title: t('editor.section.access', { defaultValue: 'Voter access' }),
      subtitle: t('editor.section.access_sub', { defaultValue: 'Who can vote and how they sign in' }),
      summary: accessSummary,
      complete: !!census,
      render: () => <AccessSettings />,
    },
  ]
}

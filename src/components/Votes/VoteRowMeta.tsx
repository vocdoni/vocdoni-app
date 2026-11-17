import { Text } from '@chakra-ui/react'
import { processVoteCount, resolveEndDate } from '@vocdoni/api-client'
import type { VotingProcessResultsResponse } from '@vocdoni/api-types'
import { useTranslation } from 'react-i18next'
import { isQuestionByQuestion } from '~src/types/voting-process'
import { draftWarning, percentOf, type VoteRow } from '~utils/vote-state'

type VoteRowMetaProps = {
  row: VoteRow
  results?: VotingProcessResultsResponse | null
  now: Date
}

/** "Thursday 12 at 20:00": the month only when it is not this month's, as the board writes a near date. */
const useRowDate = (now: Date) => {
  const { t, i18n } = useTranslation()
  return (value: Date | string | undefined) => {
    const date = value ? new Date(value) : undefined
    if (!date || isNaN(date.getTime())) return ''
    const format = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(i18n.language, options).format(date)
    const thisMonth = date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
    return t('votes.list.when', {
      defaultValue: '{{weekday}} {{day}} at {{time}}',
      weekday: format({ weekday: 'long' }),
      day: format(thisMonth ? { day: 'numeric' } : { day: 'numeric', month: 'long' }),
      time: format({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }),
    })
  }
}

/**
 * The sentences under a vote's title, as the board writes them per state, with the one stressed fragment: what a draft
 * lacks (warning). A closed vote gives its turnout, never who won.
 */
export const VoteRowMeta = ({ row, results, now }: VoteRowMetaProps) => {
  const { t } = useTranslation()
  const rowDate = useRowDate(now)
  const { process, state } = row
  const size = process.census?.size

  const questions = t('votes.list.meta_questions', {
    count: process.questions.length,
    defaultValue_one: '{{count, number}} question',
    defaultValue_other: '{{count, number}} questions',
  })
  const counts =
    size === undefined
      ? t('votes.list.meta_no_voters', { defaultValue: '{{questions}}.', questions })
      : t('votes.list.meta', {
          defaultValue: '{{questions}}, {{voters}}.',
          questions,
          voters: t('votes.list.meta_voters', {
            count: size,
            defaultValue_one: '{{count, number}} voter',
            defaultValue_other: '{{count, number}} voters',
          }),
        })

  // A ready vote is told by when it opens alone; a question-by-question one is held live, in a meeting.
  if (state === 'ready') {
    const date = rowDate(process.startDate)
    return (
      <Text textStyle='meta' color='fg.subtle'>
        {isQuestionByQuestion(process)
          ? t('votes.list.starts_live', { defaultValue: 'Live, {{date}}.', date })
          : t('votes.list.starts', { defaultValue: 'Starts {{date}}.', date })}
      </Text>
    )
  }

  let after: string | null = null
  if (state === 'live' || state === 'paused') {
    const end = resolveEndDate(process)
    if (end) after = t('votes.list.closes', { defaultValue: 'Closes {{date}}.', date: rowDate(end) })
  }

  const warning = state === 'draft' ? draftWarning(process, now) : null
  const warningText =
    warning === 'missingEndDate'
      ? t('votes.list.warning.missing_end', { defaultValue: 'No closing date yet.' })
      : warning === 'endDatePassed'
        ? t('votes.list.warning.end_passed', { defaultValue: 'The closing date has passed.' })
        : null

  // A closed vote says how many took part and nothing about who won: the result is read on its page.
  const percent = state === 'closed' && results ? percentOf(processVoteCount(results), size) : undefined
  const closing =
    percent === undefined ? null : t('votes.list.turnout', { defaultValue: '{{percent}}% turnout.', percent })

  return (
    <Text textStyle='meta' color='fg.subtle'>
      {counts}
      {after && ` ${after}`}
      {warningText && (
        <>
          {' '}
          <Text as='span' fontWeight='medium-plus' color='status.warning.fg'>
            {warningText}
          </Text>
        </>
      )}
      {closing && <> {closing}</>}
    </Text>
  )
}

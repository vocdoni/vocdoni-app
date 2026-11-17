import { Text } from '@chakra-ui/react'
import { processVoteCount, resolveEndDate } from '@vocdoni/api-client'
import type { VotingProcessResultsResponse } from '@vocdoni/api-types'
import { useMemo, type ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useVoteText } from '~i18n/use-vote-text'
import { isQuestionByQuestion } from '~src/types/voting-process'
import { questionOutcome } from '~utils/vote-outcome'
import { draftWarning, isSettledQuestion, percentOf, type VoteRow } from '~utils/vote-state'

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
 * The sentences under a vote's title, as the board writes them per state, with its two stressed fragments: what a
 * draft lacks (warning) and a closed vote's result.
 */
export const VoteRowMeta = ({ row, results, now }: VoteRowMetaProps) => {
  const { t } = useTranslation()
  const { outcome } = useVoteText()
  const rowDate = useRowDate(now)
  const { process, state } = row
  const size = process.census?.size

  // Decoding a tally is the one costly step here; the rest is wording.
  const closedOutcome = useMemo(() => {
    const [question] = process.questions
    if (state !== 'closed' || process.questions.length !== 1 || !question) return null
    const entry = results?.questions.find((candidate) => candidate.questionId === question.id)
    // A result only once the tally is final: closed by the clock alone, votes may still land.
    if (!isSettledQuestion(question, entry)) return null
    return questionOutcome(question, entry, { weighted: !!process.census?.weighted })
  }, [process, state, results])

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

  const result = state === 'closed' ? outcome(closedOutcome) : null
  const percent = state === 'closed' && results ? percentOf(processVoteCount(results), size) : undefined
  const strong = <Text as='span' fontWeight='medium-plus' color='fg' />
  // One sentence per variant, so a language can put the result and the turnout in its own order.
  let closing: ReactNode = null
  if (result && percent !== undefined) {
    closing = (
      <Trans
        i18nKey='votes.list.result_turnout'
        defaults='<b>{{result}}</b> with {{percent}}% turnout.'
        values={{ result, percent }}
        components={{ b: strong }}
      />
    )
  } else if (result) {
    closing = (
      <Trans i18nKey='votes.list.result' defaults='<b>{{result}}</b>.' values={{ result }} components={{ b: strong }} />
    )
  } else if (percent !== undefined) {
    closing = t('votes.list.turnout', { defaultValue: '{{percent}}% turnout.', percent })
  }

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

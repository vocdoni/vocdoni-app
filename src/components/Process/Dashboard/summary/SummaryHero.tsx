import { Box, Card, Heading, Span, Stack, Text } from '@chakra-ui/react'
import { useId, type ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { CensusRuler } from '~components/ui/CensusRuler'
import { useVoteText } from '~i18n/use-vote-text'
import { quantity } from '~utils/numbers'
import { isSettledQuestion, timeLeft } from '~utils/vote-state'
import type { SummaryModel } from './use-summary-model'

/** A flexible column and the facts' one: Resum's questions and the cards beside them. */
export const SUMMARY_COLUMNS = '[minmax(0, 1fr) {sizes.facts}]'

/** What the headline says: how many voted, of how many, and the share; or that nobody has. */
const useHeadline = ({ byQuestion, state, count, countUnknown, total, percent }: SummaryModel): string => {
  const { t } = useTranslation()
  if (countUnknown) return t('votes.summary.count_unknown', { defaultValue: 'The turnout could not be loaded.' })
  if (count === 0)
    return state === 'closed'
      ? t('votes.summary.headline.nobody', { defaultValue: 'Nobody voted.' })
      : t('votes.summary.headline.nobody_yet', { defaultValue: 'Nobody has voted yet.' })
  // No census size: the count alone, which is known.
  if (total === undefined || percent === undefined)
    return byQuestion
      ? t('votes.summary.headline.any_count', {
          defaultValue_one: 'At least {{count, number}} person has voted on a question.',
          defaultValue_other: 'At least {{count, number}} people have voted on a question.',
          count,
        })
      : t('votes.summary.headline.count', {
          defaultValue_one: '{{count, number}} person has voted.',
          defaultValue_other: '{{count, number}} people have voted.',
          count,
        })
  // The noun goes with the census ("1 of 312 people").
  return byQuestion
    ? t('votes.summary.headline.any_of', {
        defaultValue_one: 'At least {{voted}} of {{count, number}} person has voted on a question, {{percent}}%.',
        defaultValue_other: 'At least {{voted}} of {{count, number}} people have voted on a question, {{percent}}%.',
        voted: quantity(count),
        count: total,
        percent,
      })
    : t('votes.summary.headline.of', {
        defaultValue_one: '{{voted}} of {{count, number}} person has voted, {{percent}}%.',
        defaultValue_other: '{{voted}} of {{count, number}} people have voted, {{percent}}%.',
        voted: quantity(count),
        count: total,
        percent,
      })
}

/** The line under the headline: the time left, the pause, or whether the results are final. */
const useSecondLine = ({ election, state, endDate, now }: SummaryModel): ReactNode => {
  const { t } = useTranslation()
  const { duration } = useVoteText()
  const ink = <Span color='fg' />
  if (state === 'live') {
    if (!endDate || !timeLeft(endDate, now)) return null
    return (
      <Trans
        i18nKey='votes.summary.line.left'
        defaults='<b>{{left}}</b> left to vote.'
        values={{ left: duration(now, endDate) }}
        components={{ b: ink }}
      />
    )
  }
  if (state === 'paused')
    return <Trans i18nKey='votes.summary.line.paused' defaults='The vote is <b>paused</b>.' components={{ b: ink }} />
  if (state === 'closed')
    // Only once the server has every question over: until then the tally may still change.
    return election.questions.every((question) => isSettledQuestion(question))
      ? t('votes.summary.idle.ended_final', { defaultValue: 'The results are final and voters can already see them.' })
      : t('votes.summary.idle.ended_counting', { defaultValue: 'The final results are still being counted.' })
  return null
}

/**
 * The top card of Resum (board V4VoteManageAll, R34): a sentence that says how many voted, a line on the time left,
 * the pause or the results, and the turnout bar from 0 to the census. A question-by-question vote that has not started
 * or was canceled says where it stands instead. The same card at every width; the type steps down below `lg`.
 */
export const SummaryHero = ({ model }: { model: SummaryModel }) => {
  const { t } = useTranslation()
  const labelId = useId()
  const headline = useHeadline(model)
  const second = useSecondLine(model)
  const { byQuestion, state, count, countUnknown, total, percent } = model
  const padding = { px: { base: '4', md: 'card', lg: '6' } } as const

  if (byQuestion && (state === 'ready' || state === 'canceled')) {
    return (
      <Card.Root variant='frame' as='section' aria-labelledby={labelId}>
        <Box {...padding} py={{ base: '4.5', md: 'card', lg: '6' }}>
          <Heading as='h2' id={labelId} textStyle='state-title'>
            {state === 'ready'
              ? t('votes.summary.idle.not_started', { defaultValue: 'It has not started yet' })
              : t('votes.summary.idle.canceled_title', { defaultValue: 'Vote canceled' })}
          </Heading>
          <Text mt='1.5' textStyle='state-body' color='fg.muted'>
            {state === 'ready'
              ? t('votes.summary.idle.by_question_body', {
                  defaultValue: 'When it starts, the questions start closed and you open them one at a time.',
                })
              : t('votes.summary.idle.canceled_body', {
                  defaultValue: 'The votes cast were discarded. There are no results.',
                })}
          </Text>
        </Box>
      </Card.Root>
    )
  }

  // The bar needs a census to measure against, and a count to draw.
  const bar = !countUnknown && total !== undefined
  const barLabel = byQuestion
    ? t('votes.summary.ruler_label_any', {
        defaultValue: 'At least {{voted}} of {{total}} people voted on a question, {{percent}}%',
        voted: count,
        total: total ?? 0,
        percent: percent ?? 0,
      })
    : t('votes.summary.ruler_label', {
        defaultValue: '{{count, number}} of {{total}} people voted, {{percent}}%',
        count,
        total: total ?? 0,
        percent: percent ?? 0,
      })

  return (
    <Card.Root variant='frame' as='section' aria-labelledby={labelId}>
      <Stack
        gap={{ base: '1.5', lg: '2.5' }}
        {...padding}
        pt={{ base: '4.5', md: 'card', lg: '6' }}
        pb={bar ? undefined : { base: '4.5', md: 'card', lg: '6' }}
      >
        <Heading as='h2' id={labelId} textStyle='turnout-headline'>
          {headline}
        </Heading>
        {second && (
          <Text textStyle='turnout-line' color='fg.subtle'>
            {second}
          </Text>
        )}
      </Stack>
      {bar && (
        <Box {...padding} pt={{ base: '5', md: '6', lg: 'bar' }} pb={{ base: '4', md: '5', lg: 'card' }}>
          <CensusRuler value={count} max={total} closed={state === 'closed'} label={barLabel} />
        </Box>
      )}
    </Card.Root>
  )
}

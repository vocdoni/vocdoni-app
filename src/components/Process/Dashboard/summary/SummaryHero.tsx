import { Box, Card, chakra, Flex, Grid, Heading, Icon, Stat, Text } from '@chakra-ui/react'
import { useId, type ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { CensusRuler } from '~components/ui/CensusRuler'
import { FactList } from '~components/ui/FactList'
import { ProcessStatus } from '~components/ui/ProcessStatus'
import { InfoIcon } from '~theme/icons'
import { quantity } from '~utils/numbers'
import { useSummaryFacts } from './use-summary-facts'
import { isSettledQuestion } from '~utils/vote-state'
import type { SummaryModel } from './use-summary-model'

/** A flexible column and the facts' one: the hero's figure and facts, and Resum's cards under it. */
export const SUMMARY_COLUMNS = '[minmax(0, 1fr) {sizes.facts}]'
// Between `lg` and `xl` the fixed facts column would squeeze the figure, so the two share the width.
const NARROW_COLUMNS = '[minmax(0, 3fr) minmax(0, 2fr)]'

/**
 * The participation hero: the share that voted, how many of the census, the facts and the ruler. A phone stacks the
 * figure, the ruler and the facts; from `lg` the facts sit beside the figure and the ruler runs under both. A closed
 * all-at-once vote adds whether its results are final in a row under the ruler, from `lg` (a live or paused one says
 * its deadline in the header).
 */
export const SummaryHero = ({ model, desktop }: { model: SummaryModel; desktop: boolean }) => {
  const { t } = useTranslation()
  const labelId = useId()
  const facts = useSummaryFacts(model, desktop)
  const { byQuestion, state, count, countUnknown, total, percent } = model
  // Before the start (and once canceled, on touch screens) a question-by-question vote says where it stands in place
  // of the figure.
  const stateCard = byQuestion && (state === 'ready' || (!desktop && state === 'canceled'))

  let caption: ReactNode = null
  if (countUnknown) {
    caption = t('votes.summary.count_unknown', { defaultValue: 'The turnout could not be loaded.' })
  } else if (count === 0) {
    caption =
      state === 'closed'
        ? t('votes.summary.nobody_voted', { defaultValue: 'Nobody voted.' })
        : t('votes.summary.nobody_voted_yet', { defaultValue: 'Nobody has voted yet.' })
  } else if (total === undefined) {
    // No census size: the count alone, which is known.
    caption = byQuestion
      ? t('votes.summary.voted_any_count', {
          defaultValue_one: 'At least {{count, number}} person voted on a question',
          defaultValue_other: 'At least {{count, number}} people voted on a question',
          count,
        })
      : t('votes.summary.voted_count', {
          defaultValue_one: '{{count, number}} person voted',
          defaultValue_other: '{{count, number}} people voted',
          count,
        })
  } else {
    caption = byQuestion ? (
      // One line on a phone, two on the desktop board ("… voted / on a question").
      <Trans
        i18nKey='votes.summary.voted_any_lines'
        defaults='At least {{voted}} of {{total}} voted <br/>on a question'
        values={{ voted: quantity(count), total: quantity(total) }}
        components={{ br: <chakra.br hideBelow='lg' /> }}
      />
    ) : (
      t('votes.summary.voted_of', {
        defaultValue: '{{count, number}} of {{total}} voted',
        count,
        total: quantity(total),
      })
    )
  }

  // The ruler needs a census to measure against, and a count to draw.
  const ruler = !stateCard && !countUnknown && total !== undefined
  const rulerLabel = byQuestion
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

  // Only once the server has every question over: until then the tally may still change.
  let hint: string | null = null
  if (!byQuestion && state === 'closed') {
    hint = model.election.questions.every((question) => isSettledQuestion(question))
      ? t('votes.summary.idle.ended_final', {
          defaultValue: 'The results are final and voters can already see them.',
        })
      : t('votes.summary.idle.ended_counting', { defaultValue: 'The final results are still being counted.' })
  }

  return (
    <Card.Root variant='frame' as='section' aria-labelledby={labelId}>
      <Grid
        templateColumns={{ base: 'minmax(0, 1fr)', lg: NARROW_COLUMNS, xl: SUMMARY_COLUMNS }}
        templateAreas={
          stateCard
            ? { base: '"figure" "facts"', lg: '"figure facts"' }
            : { base: '"figure" "bar" "facts"', lg: '"figure facts" "bar bar"' }
        }
        columnGap='8'
        rowGap={{ base: '4.5', md: 'card', lg: '0' }}
        px={{ base: '4', md: 'card', lg: '6' }}
        pt={{ base: '4.5', md: 'card', lg: byQuestion ? '6' : 'card' }}
        pb={{ base: '4.5', md: 'card' }}
      >
        {stateCard ? (
          <Box gridArea='figure'>
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
        ) : (
          <Stat.Root
            size='hero'
            as='div'
            gridArea='figure'
            minW='0'
            justifyContent='space-between'
            // From `lg` the figure sits at the foot of the facts' column, never right under the label.
            gap={{ base: '4.5', md: 'card', lg: '6' }}
          >
            {/* The header already names the vote's state: the card says what its figure is. */}
            <Stat.Label as='div' id={labelId}>
              {t('votes.summary.turnout', { defaultValue: 'Turnout' })}
            </Stat.Label>
            <Flex
              direction={{ base: 'column', md: 'row' }}
              align={{ base: 'flex-start', md: 'flex-end' }}
              gap={{ base: '2.5', md: '4.5', lg: '5' }}
            >
              {percent !== undefined && !countUnknown && (
                <Stat.ValueText as='div'>
                  {percent}
                  <Stat.ValueUnit>%</Stat.ValueUnit>
                </Stat.ValueText>
              )}
              {caption && <Text textStyle='hero-caption'>{caption}</Text>}
            </Flex>
          </Stat.Root>
        )}
        <FactList facts={facts} layout='summary' gridArea='facts' alignSelf='end' />
        {ruler && (
          <CensusRuler
            gridArea='bar'
            mt={{ lg: byQuestion ? 'hero.compact' : 'hero.ruler' }}
            value={count}
            max={total}
            // The count under the fill only on the all-at-once hero (from lg, by the ruler's own CSS).
            marker={!byQuestion}
            closed={state === 'closed' || state === 'canceled'}
            label={rulerLabel}
          />
        )}
      </Grid>
      {hint && (
        <Flex
          hideBelow='lg'
          align='center'
          gap='2'
          minH='11'
          px='6'
          borderTopWidth='hairline'
          borderColor='border.muted'
          textStyle='body-sm'
          color='fg.subtle'
        >
          <Icon as={InfoIcon} boxSize='3.5' />
          <Text>{hint}</Text>
        </Flex>
      )}
    </Card.Root>
  )
}

import { Card, chakra, Flex, Grid, Icon, Stat, Text } from '@chakra-ui/react'
import { useId, type ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { CensusRuler } from '~components/ui/CensusRuler'
import { FactList } from '~components/ui/FactList'
import { ProcessStatus } from '~components/ui/ProcessStatus'
import { useVoteText } from '~i18n/use-vote-text'
import { InfoIcon } from '~theme/icons'
import { quantity } from '~utils/numbers'
import { useSummaryFacts } from './use-summary-facts'
import type { SummaryModel } from './use-summary-model'

/** A flexible column and the facts' one: the hero's figure and facts, and Resum's cards under it. */
export const SUMMARY_COLUMNS = '[minmax(0, 1fr) {sizes.facts}]'
// Between `lg` and `xl` the fixed facts column would squeeze the figure, so the two share the width.
const NARROW_COLUMNS = '[minmax(0, 3fr) minmax(0, 2fr)]'

/**
 * The participation hero: the share that voted, how many of the census, the facts and the ruler. A phone stacks the
 * figure, the ruler and the facts; from `lg` the facts sit beside the figure and the ruler runs under both. A live or
 * paused all-at-once vote adds the deadline (or the pause) in a row under the ruler, from `lg`.
 */
export const SummaryHero = ({ model, desktop }: { model: SummaryModel; desktop: boolean }) => {
  const { t } = useTranslation()
  const { dateAt, timeLeft } = useVoteText()
  const labelId = useId()
  const facts = useSummaryFacts(model, desktop)
  const { byQuestion, state, count, total, percent, endDate, now } = model
  // The question-by-question board heads its hero with the vote's state; every other board says "Turnout".
  const headedByState = desktop && byQuestion

  let caption: ReactNode = null
  if (total !== undefined) {
    caption = byQuestion ? (
      // One line on a phone, two on the desktop board ("… voted / on a question").
      <Trans
        i18nKey='votes.summary.voted_any_lines'
        defaults='At least {{voted}} of {{total}} voted <br/>on a question'
        values={{ voted: quantity(count), total: quantity(total) }}
        components={{ br: <chakra.br hideBelow='lg' /> }}
      />
    ) : (
      t('votes.summary.voted_of', { defaultValue: '{{count, number}} of {{total}} voted', count, total: quantity(total) })
    )
  }

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

  let hint: string | null = null
  if (!byQuestion) {
    hint =
      state === 'paused'
        ? t('votes.summary.hint.paused', { defaultValue: 'Paused. Turnout will not move until you resume it.' })
        : t('votes.summary.hint.closes', {
            defaultValue: 'Closes {{date}}. {{left}}',
            date: dateAt(endDate),
            left: timeLeft(endDate, now) ?? '',
          }).trim()
  }

  return (
    <Card.Root
      variant='frame'
      as='section'
      aria-label={headedByState ? t('votes.summary.overview', { defaultValue: 'Vote summary' }) : undefined}
      aria-labelledby={headedByState ? undefined : labelId}
    >
      <Grid
        templateColumns={{ base: 'minmax(0, 1fr)', lg: NARROW_COLUMNS, xl: SUMMARY_COLUMNS }}
        templateAreas={{ base: '"figure" "bar" "facts"', lg: '"figure facts" "bar bar"' }}
        columnGap='8'
        rowGap={{ base: '4.5', md: 'card', lg: '0' }}
        px={{ base: '4', md: 'card', lg: '6' }}
        pt={{ base: '4.5', md: 'card', lg: byQuestion ? '6' : 'card' }}
        pb={{ base: '4.5', md: 'card' }}
      >
        <Stat.Root
          size='hero'
          as='div'
          gridArea='figure'
          minW='0'
          justifyContent='space-between'
          gap={{ base: '4.5', md: 'card', lg: headedByState ? 'hero.compact' : '0' }}
        >
          {headedByState ? (
            <ProcessStatus state={state} alignSelf='flex-start' gap='2' />
          ) : (
            <Stat.Label as='div' id={labelId}>
              {t('votes.summary.turnout', { defaultValue: 'Turnout' })}
            </Stat.Label>
          )}
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ base: 'flex-start', md: 'flex-end' }}
            gap={{ base: '2.5', md: '4.5', lg: '5' }}
          >
            {percent !== undefined && (
              <Stat.ValueText as='div'>
                {percent}
                <Stat.ValueUnit>%</Stat.ValueUnit>
              </Stat.ValueText>
            )}
            {caption && <Text textStyle='hero-caption'>{caption}</Text>}
          </Flex>
        </Stat.Root>
        <FactList facts={facts} layout='summary' gridArea='facts' alignSelf='end' />
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

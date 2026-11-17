import { Flex, Link, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router'
import { CensusRuler } from '~components/ui/CensusRuler'
import { ProcessStatus, type ProcessStatusState } from '~components/ui/ProcessStatus'
import { quantity } from '~utils/numbers'
import { percentOf } from '~utils/vote-state'
import { Figures } from './Figures'

export type ManageStripProps = {
  state: ProcessStatusState
  /** The highest per-question count: at least that many people voted on some question. */
  voted: number
  total?: number
  /** "1 open, 2 closed, 1 to open": what the phone and tablet band says in place of the bar. */
  counts: string
  summaryHref: string
}

/**
 * The vote's state over the questions. From `lg` a card: the state, "At least 229 of 312 voted on a question", the
 * compact bar, the share and a link to the Summary. Below `lg` a sunken band with the state and the question counts.
 */
export const ManageStrip = ({ state, voted, total, counts, summaryHref }: ManageStripProps) => {
  const { t } = useTranslation()
  const percent = percentOf(voted, total)
  const values = { voted: quantity(voted), total: total ? quantity(total) : '?' }
  const desktop = { base: 'none', lg: 'block' } as const

  return (
    <Flex
      as='section'
      aria-label={t('votes.manage.strip_label', { defaultValue: 'Vote status' })}
      wrap={{ base: 'wrap', lg: 'nowrap' }}
      align='center'
      columnGap={{ base: '3', lg: '5' }}
      rowGap='1'
      px={{ base: '4', lg: 'card' }}
      py={{ base: '3', lg: '3.5' }}
      borderRadius='md'
      bg={{ base: 'bg.muted', lg: 'bg.panel' }}
      boxShadow={{ lg: 'shadow.ring' }}
      textStyle='body'
      color='fg.muted'
    >
      <ProcessStatus state={state} />
      <Text textStyle='control' fontWeight='medium-plus' color='fg' whiteSpace='nowrap' display={desktop}>
        <Figures
          text={t('votes.manage.voted_any', {
            defaultValue: 'At least {{voted}} of {{total}} voted on a question',
            ...values,
          })}
        />
      </Text>
      <CensusRuler
        layout='compact'
        value={voted}
        max={total}
        flex='1'
        minW='20'
        display={desktop}
        label={t('votes.manage.ruler_label', {
          defaultValue: 'At least {{voted}} of {{total}} people voted on a question, {{percent}}%.',
          ...values,
          percent: percent ?? 0,
        })}
      />
      {percent !== undefined && (
        <Text textStyle='figure' color='fg.subtle' display={desktop}>
          {t('votes.manage.percent', { defaultValue: '{{percent}}%', percent })}
        </Text>
      )}
      <Link asChild textStyle='control' display={desktop} whiteSpace='nowrap'>
        <RouterLink to={summaryHref}>{t('votes.manage.summary_link', { defaultValue: 'Summary' })}</RouterLink>
      </Link>
      {counts && <Text display={{ lg: 'none' }}>{counts}</Text>}
    </Flex>
  )
}

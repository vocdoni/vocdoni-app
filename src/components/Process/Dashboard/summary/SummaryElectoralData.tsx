import { Card, Span, Text } from '@chakra-ui/react'
import { useId } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { SummaryCardHeader } from './SummaryCardHeader'
import type { SummaryModel } from './use-summary-model'

/**
 * "Voting data" beside the questions of a live or paused all-at-once vote: who has not voted yet. The board's other
 * rows (quorum, delegated votes, reminders, bounced notices) have no backend data and are left out.
 */
export const SummaryElectoralData = ({ model }: { model: SummaryModel }) => {
  const { t } = useTranslation()
  const titleId = useId()
  const { state, total, count } = model
  if (total === undefined || (state !== 'live' && state !== 'paused')) return null
  const notVoted = Math.max(0, total - count)

  return (
    <Card.Root variant='frame' as='section' aria-labelledby={titleId}>
      <SummaryCardHeader
        id={titleId}
        title={t('votes.summary.electoral_title', { defaultValue: 'Voting data' })}
        desktop
      />
      <Card.Body py='3'>
        <Text fontWeight='medium-plus'>
          <Trans
            i18nKey='votes.summary.not_voted'
            defaults='<n>{{count}}</n> have not voted yet'
            count={notVoted}
            components={{ n: <Span fontFamily='figure' fontSize='sm' letterSpacing='none' /> }}
          />
        </Text>
      </Card.Body>
    </Card.Root>
  )
}

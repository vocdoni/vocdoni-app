import { Card, Span, Text } from '@chakra-ui/react'
import { Fragment, useId, type ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { getAuthFieldLabel } from '~components/Process/CSP/fields'
import { SummaryCardHeader } from './SummaryCardHeader'
import type { SummaryModel } from './use-summary-model'

/**
 * How a voter proves who they are, in one sentence: every factor asked for, joined by "plus" (all are needed), and
 * for a one-time code the channels it can travel by, joined by "or". Only the factors stand out. Null for a census
 * that asks for nothing.
 */
const useAuthMethod = (authFields: readonly string[], twoFaFields: readonly string[]): ReactNode => {
  const { t } = useTranslation()
  const factors: ReactNode[] = authFields.map((field) => getAuthFieldLabel(t, field))
  const email = twoFaFields.includes('email')
  const phone = twoFaFields.includes('phone')
  if (email || phone) factors.push(t('votes.summary.auth.code', { defaultValue: 'one-time code' }))
  if (!factors.length) return null

  let channel = ''
  if (email && phone) channel = t('votes.summary.auth.by_email_or_sms', { defaultValue: ', by email or SMS' })
  else if (email) channel = t('votes.summary.auth.by_email', { defaultValue: ' by email' })
  else if (phone) channel = t('votes.summary.auth.by_sms', { defaultValue: ' by SMS' })

  return (
    <>
      {factors.map((factor, index) => (
        <Fragment key={index}>
          {index > 0 && t('votes.summary.auth.plus', { defaultValue: ' plus ' })}
          <Span fontWeight='medium' color='fg'>
            {factor}
          </Span>
        </Fragment>
      ))}
      {channel}
      {t('votes.summary.auth.end', { defaultValue: '.' })}
    </>
  )
}

/**
 * "Voting data" beside the questions of a live or paused all-at-once vote: how voters authenticate and who has not
 * voted yet. The board's other rows (quorum, delegated votes, reminders, bounced notices) have no backend data and
 * are left out.
 */
export const SummaryElectoralData = ({ model }: { model: SummaryModel }) => {
  const { t } = useTranslation()
  const titleId = useId()
  const { election, state, total, count } = model
  const authMethod = useAuthMethod(election.census?.authFields ?? [], election.census?.twoFaFields ?? [])
  if (state !== 'live' && state !== 'paused') return null
  if (!authMethod && total === undefined) return null

  return (
    <Card.Root variant='frame' as='section' aria-labelledby={titleId}>
      <SummaryCardHeader
        id={titleId}
        title={t('votes.summary.electoral_title', { defaultValue: 'Voting data' })}
        desktop
      />
      {authMethod && (
        <Card.Body py='3' gap='0'>
          <Text fontWeight='medium-plus'>
            {t('votes.summary.auth.title', { defaultValue: 'Authentication method' })}
          </Text>
          <Text textStyle='body-sm' color='fg.subtle'>
            {authMethod}
          </Text>
        </Card.Body>
      )}
      {total !== undefined && (
        <Card.Body py='3'>
          <Text fontWeight='medium-plus'>
            <Trans
              i18nKey='votes.summary.not_voted'
              defaults='<n>{{count, number}}</n> have not voted yet'
              count={Math.max(0, total - count)}
              components={{ n: <Span fontFamily='figure' fontSize='sm' letterSpacing='none' /> }}
            />
          </Text>
        </Card.Body>
      )}
    </Card.Root>
  )
}

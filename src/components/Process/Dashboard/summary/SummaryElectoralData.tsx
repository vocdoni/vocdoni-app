import { Card, Span, Text } from '@chakra-ui/react'
import { useId, type ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { censusFieldLabel, getAuthFieldLabel } from '~components/Process/CSP/fields'
import { SummaryCardHeader } from './SummaryCardHeader'
import type { SummaryModel } from './use-summary-model'

/**
 * How a voter proves who they are, in one whole sentence per case: the fields asked for (a list in the page's
 * language, all of them needed) and the channels a one-time code travels by. Only the factors stand out. The fields
 * are named as the voter lookup names them. Null for a census that asks for nothing.
 */
const useAuthMethod = (authFields: readonly string[], twoFaFields: readonly string[]): ReactNode => {
  const { t, i18n } = useTranslation()
  const labels = authFields.map((field) =>
    field === 'password' ? getAuthFieldLabel(t, field) : censusFieldLabel(t, field)
  )
  const email = twoFaFields.includes('email')
  const phone = twoFaFields.includes('phone')
  const channel = email && phone ? 'email_or_sms' : email ? 'email' : phone ? 'sms' : null
  if (!labels.length && !channel) return null

  const fields = new Intl.ListFormat(i18n.language, { type: 'conjunction' }).format(labels)
  const components = { b: <Span fontWeight='medium' color='fg' /> }
  const sentence = (key: string, defaults: string) => (
    <Trans i18nKey={key} defaults={defaults} values={{ fields }} components={components} />
  )

  if (!channel) return sentence('votes.summary.auth.fields', '<b>{{fields}}</b>.')
  if (!labels.length) {
    switch (channel) {
      case 'email':
        return sentence('votes.summary.auth.code_email', '<b>A one-time code</b> sent by email.')
      case 'sms':
        return sentence('votes.summary.auth.code_sms', '<b>A one-time code</b> sent by SMS.')
      default:
        return sentence('votes.summary.auth.code_email_or_sms', '<b>A one-time code</b> sent by email or SMS.')
    }
  }
  switch (channel) {
    case 'email':
      return sentence(
        'votes.summary.auth.fields_code_email',
        '<b>{{fields}}</b>, plus a <b>one-time code</b> sent by email.'
      )
    case 'sms':
      return sentence(
        'votes.summary.auth.fields_code_sms',
        '<b>{{fields}}</b>, plus a <b>one-time code</b> sent by SMS.'
      )
    default:
      return sentence(
        'votes.summary.auth.fields_code_email_or_sms',
        '<b>{{fields}}</b>, plus a <b>one-time code</b> sent by email or SMS.'
      )
  }
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

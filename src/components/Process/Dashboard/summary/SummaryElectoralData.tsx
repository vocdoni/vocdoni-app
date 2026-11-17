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
  const b = <Span fontWeight='medium' color='fg' />

  if (!channel)
    return (
      <Trans i18nKey='votes.summary.auth.fields' defaults='<b>{{fields}}</b>.' values={{ fields }} components={{ b }} />
    )
  if (!labels.length) {
    if (channel === 'email')
      return (
        <Trans
          i18nKey='votes.summary.auth.code_email'
          defaults='<b>A one-time code</b> sent by email.'
          components={{ b }}
        />
      )
    if (channel === 'sms')
      return (
        <Trans
          i18nKey='votes.summary.auth.code_sms'
          defaults='<b>A one-time code</b> sent by SMS.'
          components={{ b }}
        />
      )
    return (
      <Trans
        i18nKey='votes.summary.auth.code_email_or_sms'
        defaults='<b>A one-time code</b> sent by email or SMS.'
        components={{ b }}
      />
    )
  }
  if (channel === 'email')
    return (
      <Trans
        i18nKey='votes.summary.auth.fields_code_email'
        defaults='<b>{{fields}}</b>, plus a <b>one-time code</b> sent by email.'
        values={{ fields }}
        components={{ b }}
      />
    )
  if (channel === 'sms')
    return (
      <Trans
        i18nKey='votes.summary.auth.fields_code_sms'
        defaults='<b>{{fields}}</b>, plus a <b>one-time code</b> sent by SMS.'
        values={{ fields }}
        components={{ b }}
      />
    )
  return (
    <Trans
      i18nKey='votes.summary.auth.fields_code_email_or_sms'
      defaults='<b>{{fields}}</b>, plus a <b>one-time code</b> sent by email or SMS.'
      values={{ fields }}
      components={{ b }}
    />
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

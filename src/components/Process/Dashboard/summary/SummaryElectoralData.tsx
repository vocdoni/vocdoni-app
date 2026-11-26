import { Card, Span, Text } from '@chakra-ui/react'
import { useId, type ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { censusFieldLabel, getAuthFieldLabel } from '~components/Process/Create/VoterAuthentication/fields'
import { useVoteText } from '~i18n/use-vote-text'
import { ucfirst } from '~utils/strings'
import { isSettledQuestion } from '~utils/vote-state'
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

type Row = { id: string; title: string; note: ReactNode }

/**
 * "Dades electorals" (board V4VoteManageAll, R34), in both modes and in every state the turnout card shows: the census,
 * how voters authenticate, when it closes (or closed) and when the results show. A row the backend has no data for is
 * left out. The board's quorum and its other rows have no data either.
 */
export const SummaryElectoralData = ({ model }: { model: SummaryModel }) => {
  const { t, i18n } = useTranslation()
  const { dateAt } = useVoteText()
  const titleId = useId()
  const { election, state, byQuestion, secret, endDate } = model
  const authMethod = useAuthMethod(election.census?.authFields ?? [], election.census?.twoFaFields ?? [])
  if (state !== 'live' && state !== 'paused' && state !== 'closed') return null

  const closed = state === 'closed'
  let results: string
  if (closed)
    // "Already public" only once the server has every question over, as the top card says.
    results = election.questions.every((question) => isSettledQuestion(question))
      ? t('votes.summary.electoral.results_public', { defaultValue: 'Public now.' })
      : t('votes.summary.idle.ended_counting', { defaultValue: 'The final results are still being counted.' })
  else if (!secret)
    results = t('votes.summary.electoral.results_live', { defaultValue: 'They show live, during the vote.' })
  else if (byQuestion)
    results = t('votes.summary.electoral.results_by_question', { defaultValue: 'They show when each question closes.' })
  else results = t('votes.summary.electoral.results_secret', { defaultValue: 'They will show when the vote closes.' })

  const census = election.census?.size
  const rows: (Row | null)[] = [
    census
      ? {
          id: 'census',
          title: t('votes.summary.label.census', { defaultValue: 'Census' }),
          note: (
            <Trans
              i18nKey='votes.summary.electoral.census'
              defaults='<n>{{count, number}}</n> people with the right to vote.'
              count={census}
              components={{ n: <Span fontFamily='figure' letterSpacing='none' /> }}
            />
          ),
        }
      : null,
    authMethod
      ? {
          id: 'auth',
          title: t('votes.summary.auth.title', { defaultValue: 'Authentication method' }),
          note: authMethod,
        }
      : null,
    endDate
      ? {
          id: 'closes',
          title: closed
            ? t('votes.summary.label.closed', { defaultValue: 'Closed' })
            : t('votes.summary.electoral.closing', { defaultValue: 'Closing' }),
          note: t('votes.summary.electoral.date', {
            defaultValue: '{{date}}.',
            date: ucfirst(dateAt(endDate), i18n.language),
          }),
        }
      : null,
    { id: 'results', title: t('votes.summary.label.results', { defaultValue: 'Results' }), note: results },
  ]

  return (
    <Card.Root variant='frame' as='section' aria-labelledby={titleId}>
      <SummaryCardHeader id={titleId} title={t('votes.summary.electoral_title', { defaultValue: 'Voting data' })} />
      {rows
        .filter((row): row is Row => !!row)
        .map((row) => (
          <Card.Body key={row.id} py='3' gap='0'>
            <Text fontWeight='medium-plus'>{row.title}</Text>
            <Text textStyle={{ base: 'body', lg: 'body-sm' }} color='fg.subtle'>
              {row.note}
            </Text>
          </Card.Body>
        ))}
    </Card.Root>
  )
}

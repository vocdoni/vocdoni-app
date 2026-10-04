import { DataList, Flex, Link, Text } from '@chakra-ui/react'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import { getElectionTitle } from '@vocdoni/react-components'
import { useTranslation } from 'react-i18next'
import { createSearchParams, generatePath, Link as RouterLink } from 'react-router'
import { signInShortText } from '~components/Process/Dashboard/View/signIn'
import { SectionCard } from '~components/ui/SectionCard'
import { useDateFns } from '~i18n/use-date-fns'
import { Routes } from '~routes'
import { useCensusReadiness } from '~src/queries/members'
import { useMemberFields } from '../fields'
import { VoteStateBadge } from './CensusRow'
import { censusSourceLabel, untitledVote } from './labels'
import type { CensusSource, VoteState } from './model'

type VoteCardProps = {
  process: VotingProcessResponse
  state?: VoteState
  source?: CensusSource
  /** When the vote's own census was made (copied, or frozen at publish), from its marker */
  madeAt?: string
  /** The group to check who can get a code with, and how many are in it */
  groupId?: string
  total: number
  noReadiness?: boolean
  /** Name the vote, with its dates: off where the vote is the page already (its Voters tab) */
  withVote?: boolean
}

/**
 * The vote a census belongs to, on a vote's census: which vote and when, where its people came from,
 * and exactly how they sign in to it (the details they type and where the code goes), with how many
 * can get a code.
 */
export const VoteCard = ({ process, state, source, madeAt, groupId, total, noReadiness, withVote }: VoteCardProps) => {
  const { t, i18n } = useTranslation()
  const { format } = useDateFns()
  const fields = useMemberFields()
  const number = (value: number) => value.toLocaleString(i18n.resolvedLanguage)
  const twoFaFields = process.census?.twoFaFields ?? []
  const readiness = useCensusReadiness({ groupId, channels: twoFaFields, total, enabled: !noReadiness })

  const title = getElectionTitle(process) || untitledVote(t, !process.published)
  const link = process.published
    ? generatePath(Routes.dashboard.process, { id: process.id })
    : {
        pathname: generatePath(Routes.processes.create),
        search: createSearchParams({ draftId: process.id }).toString(),
      }
  const day = (value?: string) => (value ? format(value, 'd MMM yyyy, HH:mm') : '')
  const details = (process.census?.authFields ?? []).map((id) => fields.find((field) => field.id === id)?.label ?? id)
  const origin = source ? censusSourceLabel(t, source) : ''
  const madeOn = madeAt ? format(madeAt, 'd MMM yyyy') : ''

  const row = (label: string, value: string) => (
    <DataList.Item>
      <DataList.ItemLabel minW='7.5rem'>{label}</DataList.ItemLabel>
      <DataList.ItemValue>{value}</DataList.ItemValue>
    </DataList.Item>
  )

  return (
    <SectionCard title={t('census_detail.vote_card.title', { defaultValue: 'Vote' })}>
      {withVote && (
        <Flex align='center' justify='space-between' gap={2} mb={3}>
          <Link asChild fontSize='sm' fontWeight='bolder' minW={0}>
            <RouterLink to={link}>
              <Text as='span' truncate>
                {title}
              </Text>
            </RouterLink>
          </Link>
          <VoteStateBadge state={state} size='sm' />
        </Flex>
      )}
      <DataList.Root orientation='horizontal' size='sm'>
        {withVote &&
          process.startDate &&
          row(t('census_detail.vote_card.opens', { defaultValue: 'Opens' }), day(process.startDate))}
        {withVote &&
          process.endDate &&
          row(t('census_detail.vote_card.closes', { defaultValue: 'Closes' }), day(process.endDate))}
        {origin &&
          row(
            t('census_detail.vote_card.people', { defaultValue: 'People from' }),
            madeOn
              ? t('census_detail.vote_card.origin_on', {
                  defaultValue: '{{origin}}, on {{date}}',
                  origin,
                  date: madeOn,
                })
              : origin
          )}
        {row(
          t('census_detail.vote_card.sign_in', { defaultValue: 'Sign in with' }),
          details.length
            ? t('census_detail.vote_card.details_and_code', {
                defaultValue: '{{details}} · {{code}}',
                details: details.join(', '),
                code: signInShortText(t, twoFaFields),
              })
            : signInShortText(t, twoFaFields)
        )}
        {process.census?.weighted &&
          row(
            t('census_detail.vote_card.weight', { defaultValue: 'Voting power' }),
            t('census_detail.vote_card.weighted', { defaultValue: 'Weighted by each member' })
          )}
      </DataList.Root>
      {source?.kind === 'snapshot' && (
        // A list made from Everyone isn't fixed: say what it was made from, and that it can still change
        <Text fontSize='xs' color='fg.muted' mt={3}>
          {t('census_detail.vote_card.snapshot_note', {
            defaultValue:
              "This census was made with all your members when the vote was published. You can still add, edit and remove people; members you add to your organization later don't join it by themselves.",
          })}
        </Text>
      )}
      {readiness.available && (
        <Text
          fontSize='sm'
          color={readiness.unreachable ? 'fg.warning' : 'fg.muted'}
          mt={3}
          fontVariantNumeric='tabular-nums'
        >
          {t('census_detail.sign_in.ready', {
            defaultValue: '{{ready}} of {{total}} can get a code',
            ready: number(readiness.ready),
            total: number(readiness.total),
          })}
        </Text>
      )}
    </SectionCard>
  )
}

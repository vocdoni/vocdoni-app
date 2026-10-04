import { Box, Button, Icon, Skeleton, Stack, Text } from '@chakra-ui/react'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuPlus } from 'react-icons/lu'
import { generatePath, Link as RouterLink } from 'react-router'
import type { ProcessGroups } from '~components/Process/List/organize'
import { signInShortText } from '~components/Process/Dashboard/View/signIn'
import { Banner } from '~components/ui/Banner'
import { EmptyState } from '~components/ui/EmptyState'
import { FilterPills, type FilterPillItem } from '~components/ui/FilterPills'
import { useDateFns } from '~i18n/use-date-fns'
import { Routes } from '~routes'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { CensusRow, VoteStateBadge } from './CensusRow'
import { censusSourceLabel, peopleUnit, untitledVote, votersUnit } from './labels'
import { censusSourceOf, type SavedCensusRow, voteStateOf } from './model'
import { useCensusIndex } from './useCensusIndex'

/** Above this many rows, pills narrow the list down. */
export const PILLS_THRESHOLD = 8

type Filter = 'all' | keyof ProcessGroups | 'saved'

const VOTE_GROUPS: (keyof ProcessGroups)[] = ['live', 'scheduled', 'drafts', 'closed']

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <Box as='section' aria-label={title}>
    <Text as='h2' fontSize='sm' fontWeight='bolder' mb={3}>
      {title}
    </Text>
    {children}
  </Box>
)

const SubGroup = ({ title, children }: { title: string; children: ReactNode }) => (
  <Box>
    <Text
      as='h3'
      fontSize='xs'
      color='fg.muted'
      fontWeight='bold'
      textTransform='uppercase'
      letterSpacing='wide'
      mb={2}
    >
      {title}
    </Text>
    <Stack as='ul' gap={2} listStyleType='none' m={0} p={0}>
      {children}
    </Stack>
  </Box>
)

export const CensusesIndex = () => {
  const { t } = useTranslation()
  const { format } = useDateFns()
  const { index, isLoading, isError, error, markers } = useCensusIndex()
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    trackAnalyticsEvent({ name: AnalyticsEvents.CensusesViewed })
  }, [])

  const groupsById = useMemo(() => new Map(index.saved.map(({ group }) => [group.id, group])), [index.saved])
  const voteTitles = useMemo(
    () =>
      new Map(
        (Object.keys(index.votes) as (keyof ProcessGroups)[]).flatMap((key) =>
          index.votes[key].map((entry) => [entry.process.id, entry.title] as const)
        )
      ),
    [index.votes]
  )
  const sourceContext = {
    everyoneId: index.everyone?.id,
    markers,
    groupsById,
    voteTitle: (processId: string) => voteTitles.get(processId),
  }

  const groupLabels: Record<keyof ProcessGroups, string> = {
    live: t('censuses.group.live', { defaultValue: 'Live' }),
    scheduled: t('censuses.group.scheduled', { defaultValue: 'Scheduled' }),
    drafts: t('censuses.group.drafts', { defaultValue: 'Drafts' }),
    closed: t('censuses.group.closed', { defaultValue: 'Closed' }),
  }
  const savedLabel = t('censuses.saved.title', { defaultValue: 'Saved' })
  const voteCount = VOTE_GROUPS.reduce((sum, key) => sum + index.votes[key].length, 0)
  const showPills = index.total > PILLS_THRESHOLD
  const visible = (key: Filter) => !showPills || filter === 'all' || filter === key

  const pills: FilterPillItem<Filter>[] = [
    { value: 'all', label: t('censuses.filter.all', { defaultValue: 'All' }), count: index.total },
    ...VOTE_GROUPS.filter((key) => index.votes[key].length).map((key) => ({
      value: key as Filter,
      label: groupLabels[key],
      count: index.votes[key].length,
    })),
    ...(index.saved.length ? [{ value: 'saved' as Filter, label: savedLabel, count: index.saved.length }] : []),
  ]

  /** When the vote runs, in a few words: "Closes 12 Oct", "Opens 1 Oct", "Closed 3 Mar" (drafts: nothing). */
  const voteWhen = (process: VotingProcessResponse, state: ReturnType<typeof voteStateOf>) => {
    if (state === 'draft') return ''
    if (state === 'scheduled' && process.startDate)
      return t('censuses.when.opens', { defaultValue: 'Opens {{date}}', date: format(process.startDate, 'd MMM') })
    if (!process.endDate) return ''
    return state === 'ended' || state === 'canceled'
      ? t('censuses.when.closed', { defaultValue: 'Closed {{date}}', date: format(process.endDate, 'd MMM yyyy') })
      : t('censuses.when.closes', { defaultValue: 'Closes {{date}}', date: format(process.endDate, 'd MMM') })
  }

  const voteRow = (process: VotingProcessResponse, title: string) => {
    const state = voteStateOf(process)
    const size = process.census?.size ?? 0
    return (
      <CensusRow
        key={process.id}
        title={title || untitledVote(t, state === 'draft')}
        to={generatePath(Routes.dashboard.memberbase.voteCensus, { processId: process.id })}
        badge={<VoteStateBadge state={state} size='sm' />}
        meta={[
          voteWhen(process, state),
          signInShortText(t, process.census?.twoFaFields ?? []),
          censusSourceLabel(t, censusSourceOf(process, sourceContext)),
        ].filter(Boolean)}
        count={size}
        unit={votersUnit(t, size)}
      />
    )
  }

  const savedRow = ({ group, usedBy, copiedInto }: SavedCensusRow) => {
    const count = group.membersCount ?? 0
    const updated = format(group.updatedAt || group.createdAt, 'd MMM yyyy')
    return (
      <CensusRow
        key={group.id}
        title={group.title}
        to={generatePath(Routes.dashboard.memberbase.census, { groupId: group.id })}
        meta={[
          usedBy.length
            ? t('censuses.saved.used_by', {
                count: usedBy.length,
                defaultValue_one: 'Used by 1 vote',
                defaultValue_other: 'Used by {{count}} votes',
              })
            : copiedInto.length
              ? null
              : t('censuses.saved.unused', { defaultValue: 'Not used by any vote' }),
          copiedInto.length
            ? t('censuses.saved.copied_into', {
                count: copiedInto.length,
                defaultValue_one: 'Copied into 1 vote',
                defaultValue_other: 'Copied into {{count}} votes',
              })
            : null,
          updated ? t('censuses.saved.updated', { defaultValue: 'Updated {{date}}', date: updated }) : null,
        ]}
        count={count}
        unit={peopleUnit(t, count)}
      />
    )
  }

  if (isLoading)
    return (
      <Stack gap={2} aria-busy>
        {[0, 1, 2, 3].map((key) => (
          <Skeleton key={key} h={16} borderRadius='md' />
        ))}
      </Stack>
    )

  if (isError)
    return (
      <Banner status='error'>
        {t('censuses.load_error', { defaultValue: "We couldn't load your censuses." })}{' '}
        {error instanceof Error ? error.message : null}
      </Banner>
    )

  return (
    <Stack gap={6}>
      <Text fontSize='sm' color='fg.muted'>
        {t('censuses.description', {
          defaultValue: 'Who can vote in each of your votes, and censuses you saved to reuse.',
        })}
      </Text>

      {showPills && (
        <FilterPills<Filter>
          items={pills}
          current={filter}
          onSelect={(value) => setFilter(value)}
          label={t('censuses.filter.label', { defaultValue: 'Filter censuses' })}
        />
      )}

      {voteCount > 0 && VOTE_GROUPS.some((key) => visible(key) && index.votes[key].length) && (
        <Section title={t('censuses.in_votes', { defaultValue: 'In votes' })}>
          <Stack gap={4}>
            {VOTE_GROUPS.filter((key) => visible(key) && index.votes[key].length).map((key) => (
              <SubGroup key={key} title={groupLabels[key]}>
                {index.votes[key].map((entry) => voteRow(entry.process, entry.title))}
              </SubGroup>
            ))}
          </Stack>
        </Section>
      )}

      {index.saved.length > 0 && visible('saved') && (
        <Section title={savedLabel}>
          <Stack as='ul' gap={2} listStyleType='none' m={0} p={0}>
            {index.saved.map(savedRow)}
          </Stack>
        </Section>
      )}

      {index.total === 0 && (
        <EmptyState
          title={t('censuses.empty.title', { defaultValue: 'Your first census is created with your first vote.' })}
          description={t('censuses.empty.description', {
            defaultValue:
              'A census is made when you choose who can vote in a vote, or when you save a selection in People.',
          })}
          py={10}
          border='1px dashed'
          borderColor='border'
          borderRadius='md'
        >
          <Button asChild>
            <RouterLink to={generatePath(Routes.processes.create)}>
              <Icon as={LuPlus} />
              {t('censuses.empty.new_vote', { defaultValue: 'New vote' })}
            </RouterLink>
          </Button>
        </EmptyState>
      )}
    </Stack>
  )
}

import {
  Box,
  Button,
  Collapsible,
  Flex,
  Grid,
  Icon,
  Input,
  InputGroup,
  Link,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  LuBookmark,
  LuChevronDown,
  LuChevronRight,
  LuCircleAlert,
  LuKeyRound,
  LuMail,
  LuPlus,
  LuSearch,
  LuSmartphone,
  LuVote,
} from 'react-icons/lu'
import { generatePath, Link as RouterLink } from 'react-router'
import { signInShortText } from '~components/Process/Dashboard/View/signIn'
import type { ProcessGroups } from '~components/Process/List/organize'
import { Banner } from '~components/ui/Banner'
import { EmptyState } from '~components/ui/EmptyState'
import { FilterPills, type FilterPillItem } from '~components/ui/FilterPills'
import { useDateFns } from '~i18n/use-date-fns'
import { Routes } from '~routes'
import { useCensusReadiness } from '~src/queries/members'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { censusSourceLabel, peopleUnit, untitledVote, votersUnit } from './labels'
import { type CensusSource, censusSourceOf, type SavedCensusRow, sourceGroupId, voteStateOf } from './model'
import { useCensusIndex } from './useCensusIndex'
import { useNavigateToVote } from './useNavigateToVote'

/** Above this many censuses, a search and filter pills narrow the list down. */
export const PILLS_THRESHOLD = 8

type Filter = 'all' | keyof ProcessGroups | 'saved'

const VOTE_GROUPS: (keyof ProcessGroups)[] = ['live', 'scheduled', 'drafts', 'closed']

const DOT: Record<keyof ProcessGroups, string> = {
  live: 'green.500',
  scheduled: 'blue.500',
  drafts: 'gray.400',
  closed: 'gray.400',
}

const matches = (text: string, query: string) => !query || text.toLowerCase().includes(query.trim().toLowerCase())

/** A section of the tab: its title, a one-line explainer beside it, and an action on the right. */
const Section = ({
  title,
  hint,
  action,
  children,
}: {
  title: string
  hint?: string
  action?: ReactNode
  children: ReactNode
}) => (
  <Box as='section' aria-label={title}>
    <Flex align='center' justify='space-between' gap={3} mb={3} wrap='wrap'>
      <Flex align='baseline' gap={2} wrap='wrap' minW={0}>
        <Text as='h2' fontSize='md' fontWeight='bolder'>
          {title}
        </Text>
        {hint && (
          <Text fontSize='sm' color='fg.muted'>
            {hint}
          </Text>
        )}
      </Flex>
      {action}
    </Flex>
    {children}
  </Box>
)

/** The header strip of a state's card: "● LIVE · 1". The state is the container, not a badge. */
const StateHeader = ({ state, label, count }: { state: keyof ProcessGroups; label: string; count: number }) => (
  <Flex align='center' gap={2} px={4} py={2} bg='bg.subtle' borderBottomWidth='1px' borderColor='border'>
    <Box w={2} h={2} borderRadius='full' bg={DOT[state]} aria-hidden />
    <Text as='h3' fontSize='xs' fontWeight='bold' textTransform='uppercase' letterSpacing='wider' color='fg.muted'>
      {label}
    </Text>
    <Text fontSize='xs' color='fg.subtle' fontVariantNumeric='tabular-nums' aria-hidden>
      · {count}
    </Text>
  </Flex>
)

const ChannelIcon = ({ twoFaFields }: { twoFaFields: string[] }) => (
  <Icon
    as={
      twoFaFields.includes('phone') && !twoFaFields.includes('email')
        ? LuSmartphone
        : twoFaFields.length
          ? LuMail
          : LuKeyRound
    }
    boxSize={3.5}
    color='fg.muted'
    aria-hidden
  />
)

/** Whether people in a vote's census can get a code; only checked where it still matters. */
const useRowReadiness = (
  process: VotingProcessResponse,
  source: CensusSource,
  state: ReturnType<typeof voteStateOf>,
  everyoneId?: string
) => {
  const running = state === 'live' || state === 'paused' || state === 'scheduled'
  const groupId = sourceGroupId(source)
  // Everyone counts every member; a census of people picked one by one has no group to check
  const checkable = source.kind === 'everyone' || (!!groupId && groupId !== everyoneId)
  return useCensusReadiness({
    groupId: source.kind === 'everyone' ? undefined : groupId,
    channels: process.census?.twoFaFields ?? [],
    total: process.census?.size ?? 0,
    enabled: running && checkable,
  })
}

type VoteRowProps = {
  process: VotingProcessResponse
  title: string
  source: CensusSource
  when: string
  everyoneId?: string
}

/**
 * One vote's census, in its state's card: name and where its people came from | when it runs and how
 * they sign in | how many can vote, and how many can't get a code. On phones the middle folds under
 * the name.
 */
const VoteRow = ({ process, title, source, when, everyoneId }: VoteRowProps) => {
  const { t, i18n } = useTranslation()
  const state = voteStateOf(process)
  const size = process.census?.size ?? 0
  const twoFaFields = process.census?.twoFaFields ?? []
  const signIn = signInShortText(t, twoFaFields)
  const readiness = useRowReadiness(process, source, state, everyoneId)
  const number = (value: number) => value.toLocaleString(i18n.resolvedLanguage)

  return (
    <Grid
      as='li'
      templateColumns={{ base: 'minmax(0, 1fr) auto', md: 'minmax(0, 1fr) 13rem auto' }}
      gap={{ base: 3, md: 6 }}
      alignItems='center'
      px={4}
      py={3}
      position='relative'
      _hover={{ bg: 'bg.subtle' }}
      borderTopWidth='1px'
      borderColor='border'
      _first={{ borderTopWidth: 0 }}
    >
      <Box minW={0}>
        <Link
          asChild
          fontSize='sm'
          fontWeight='bolder'
          textDecoration='none'
          _hover={{ textDecoration: 'underline' }}
          // The whole row is the link's hit area
          _after={{ content: '""', position: 'absolute', inset: 0 }}
        >
          <RouterLink to={generatePath(Routes.dashboard.memberbase.voteCensus, { processId: process.id })}>
            {title || untitledVote(t, state === 'draft')}
          </RouterLink>
        </Link>
        <Text fontSize='xs' color='fg.muted' mt={0.5}>
          {censusSourceLabel(t, source)}
        </Text>
        {/* Phones: when and sign-in fold under the name */}
        <Text fontSize='xs' color='fg.muted' hideFrom='md'>
          {[when, signIn].filter(Boolean).join(' · ')}
        </Text>
      </Box>
      <Box hideBelow='md' fontSize='xs' color='fg.muted' minW={0}>
        <Text fontSize='xs' color='fg'>
          {when || t('censuses.when.no_dates', { defaultValue: 'No dates yet' })}
        </Text>
        <Flex align='center' gap={1.5}>
          <ChannelIcon twoFaFields={twoFaFields} />
          <Text as='span' fontSize='xs'>
            {signIn}
          </Text>
        </Flex>
      </Box>
      <Flex align='center' gap={2}>
        <Box textAlign='right'>
          <Text fontSize='sm' fontVariantNumeric='tabular-nums'>
            <Text as='span' fontSize='md' fontWeight='bolder'>
              {number(size)}
            </Text>{' '}
            <Text as='span' fontSize='xs' color='fg.muted'>
              {votersUnit(t, size)}
            </Text>
          </Text>
          {readiness.available && readiness.unreachable > 0 && (
            <Flex align='center' justify='flex-end' gap={1} color='fg.warning'>
              <Icon as={LuCircleAlert} boxSize={3} aria-hidden />
              <Text fontSize='xs'>
                {t('censuses.row.unreachable', {
                  count: readiness.unreachable,
                  formattedCount: number(readiness.unreachable),
                  defaultValue_one: "1 can't get a code",
                  defaultValue_other: "{{formattedCount}} can't get a code",
                })}
              </Text>
            </Flex>
          )}
        </Box>
        <Icon as={LuChevronRight} color='fg.muted' boxSize={4} aria-hidden hideBelow='md' />
      </Flex>
    </Grid>
  )
}

/** A card per vote state, rows divided by hairlines. */
const StateCard = ({ children, header }: { children: ReactNode; header: ReactNode }) => (
  <Box borderWidth='1px' borderColor='border' borderRadius='lg' overflow='hidden' bg='bg'>
    {header}
    <Box as='ul' listStyleType='none' m={0} p={0}>
      {children}
    </Box>
  </Box>
)

/**
 * A saved census as a card: its name and size, which vote it went into, and "Use in a vote". These are
 * the organization's reusable lists, so they look like things to act on, not like vote rows.
 */
const SavedCard = ({ row }: { row: SavedCensusRow }) => {
  const { t, i18n } = useTranslation()
  const { format } = useDateFns()
  const navigateToVote = useNavigateToVote()
  const { group, usedBy, copiedInto } = row
  const count = group.membersCount ?? 0
  const updated = format(group.updatedAt || group.createdAt, 'd MMM yyyy')
  const latest = copiedInto[0] ?? usedBy[0]
  const usage = copiedInto.length
    ? t('censuses.saved_card.copied_into', {
        count: copiedInto.length,
        more: copiedInto.length - 1,
        name: latest?.title || untitledVote(t, latest?.state === 'draft'),
        defaultValue_one: "Copied into '{{name}}'",
        defaultValue_other: "Copied into '{{name}}' and {{more}} more",
      })
    : usedBy.length
      ? t('censuses.saved.used_by', {
          count: usedBy.length,
          defaultValue_one: 'Used by 1 vote',
          defaultValue_other: 'Used by {{count}} votes',
        })
      : t('censuses.saved_card.unused', { defaultValue: 'Not used in a vote yet' })

  return (
    <Stack
      as='li'
      gap={3}
      p={4}
      borderWidth='1px'
      borderColor='border'
      borderRadius='lg'
      bg='bg'
      position='relative'
      _hover={{ borderColor: 'border.emphasized' }}
    >
      <Flex justify='space-between' align='flex-start' gap={3}>
        <Flex gap={3} minW={0}>
          <Flex
            align='center'
            justify='center'
            boxSize={8}
            borderRadius='md'
            bg='bg.subtle'
            borderWidth='1px'
            borderColor='border'
            flexShrink={0}
          >
            <Icon as={LuBookmark} boxSize={4} color='fg.muted' />
          </Flex>
          <Box minW={0}>
            <Link
              asChild
              fontSize='sm'
              fontWeight='bolder'
              textDecoration='none'
              _hover={{ textDecoration: 'underline' }}
              _after={{ content: '""', position: 'absolute', inset: 0 }}
            >
              <RouterLink to={generatePath(Routes.dashboard.memberbase.census, { groupId: group.id })}>
                {group.title}
              </RouterLink>
            </Link>
            {updated && (
              <Text fontSize='xs' color='fg.muted'>
                {t('censuses.saved.updated', { defaultValue: 'Updated {{date}}', date: updated })}
              </Text>
            )}
          </Box>
        </Flex>
        <Box textAlign='right' flexShrink={0}>
          <Text fontSize='lg' fontWeight='bolder' fontVariantNumeric='tabular-nums' lineHeight='short'>
            {count.toLocaleString(i18n.resolvedLanguage)}
          </Text>
          <Text fontSize='xs' color='fg.muted'>
            {peopleUnit(t, count)}
          </Text>
        </Box>
      </Flex>
      <Flex justify='space-between' align='center' gap={3} pt={3} borderTopWidth='1px' borderColor='border' wrap='wrap'>
        <Text fontSize='xs' color='fg.muted' minW={0} truncate>
          {usage}
        </Text>
        <Button
          size='xs'
          variant='outline'
          colorPalette='gray'
          // Above the card's own link
          position='relative'
          zIndex={1}
          onClick={() => navigateToVote(group.id)}
        >
          <Icon as={LuVote} />
          {t('censuses.saved_card.use', { defaultValue: 'Use in a vote' })}
        </Button>
      </Flex>
    </Stack>
  )
}

/** The way to a new saved census: People, to pick who's in it. */
const newSavedCensusLink = { pathname: generatePath(Routes.dashboard.memberbase.members, { page: '1' }) }
const NEW_SAVED_CENSUS_STATE = { saveCensusHint: true }

/** The last saved card: what a saved census is for, and the way to make one. Also the empty state. */
const NewSavedCard = () => {
  const { t } = useTranslation()
  return (
    <Stack
      as='li'
      gap={2}
      p={4}
      borderWidth='1px'
      borderStyle='dashed'
      borderColor='border.emphasized'
      borderRadius='lg'
      justify='center'
    >
      <Text fontSize='sm' fontWeight='bolder'>
        {t('censuses.saved_card.new_title', { defaultValue: "Save a list you'll reuse" })}
      </Text>
      <Text fontSize='xs' color='fg.muted'>
        {t('censuses.saved_card.new_description', {
          defaultValue: "Pick people or paste member numbers in People. Handy for 'paid-up members' or 'the board'.",
        })}
      </Text>
      <Button asChild size='xs' variant='outline' colorPalette='gray' alignSelf='flex-start'>
        <RouterLink to={newSavedCensusLink} state={NEW_SAVED_CENSUS_STATE}>
          <Icon as={LuPlus} />
          {t('censuses.saved.new', { defaultValue: 'New saved census' })}
        </RouterLink>
      </Button>
    </Stack>
  )
}

export const CensusesIndex = () => {
  const { t } = useTranslation()
  const { format } = useDateFns()
  const { index, isLoading, isError, error, markers } = useCensusIndex()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [closedOpen, setClosedOpen] = useState(false)

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
  const showTools = index.total > PILLS_THRESHOLD
  const searching = showTools && query.trim() !== ''
  const visible = (key: Filter) => !showTools || filter === 'all' || filter === key

  const votes = (key: keyof ProcessGroups) =>
    index.votes[key].filter((entry) => !showTools || matches(entry.title, query))
  const saved = index.saved.filter(({ group }) => !showTools || matches(group.title, query))

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
      return t('censuses.when.opens', { defaultValue: 'Opens {{date}}', date: format(process.startDate, 'EEE d MMM') })
    if (!process.endDate) return ''
    return state === 'ended' || state === 'canceled'
      ? t('censuses.when.closed', { defaultValue: 'Closed {{date}}', date: format(process.endDate, 'd MMM yyyy') })
      : t('censuses.when.closes', { defaultValue: 'Closes {{date}}', date: format(process.endDate, 'EEE d MMM') })
  }

  const rows = (key: keyof ProcessGroups) =>
    votes(key).map((entry) => (
      <VoteRow
        key={entry.process.id}
        process={entry.process}
        title={entry.title}
        source={censusSourceOf(entry.process, sourceContext)}
        when={voteWhen(entry.process, voteStateOf(entry.process))}
        everyoneId={index.everyone?.id}
      />
    ))

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

  const openGroups = (['live', 'scheduled', 'drafts'] as const).filter((key) => visible(key) && votes(key).length)
  const closed = votes('closed')
  // Closed votes pile up: one line until asked, open when filtered to or searched for
  const closedExpanded = closedOpen || filter === 'closed' || searching
  const lastClosed = closed[0]
  const showVotes = openGroups.length > 0 || (visible('closed') && closed.length > 0)
  const showSaved = visible('saved') && (!searching || saved.length > 0)

  return (
    <Stack gap={8}>
      <Text fontSize='sm' color='fg.muted'>
        {t('censuses.description', {
          defaultValue: 'Who can vote in each of your votes, and censuses you saved to reuse.',
        })}
      </Text>

      {showTools && (
        <Flex gap={3} wrap='wrap' align='center'>
          <InputGroup startElement={<LuSearch />} maxW={{ base: 'full', md: '22rem' }}>
            <Input
              size='sm'
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('censuses.search', { defaultValue: 'Search censuses' })}
              aria-label={t('censuses.search', { defaultValue: 'Search censuses' })}
            />
          </InputGroup>
          <FilterPills<Filter>
            items={pills}
            current={filter}
            onSelect={(value) => setFilter(value)}
            label={t('censuses.filter.label', { defaultValue: 'Filter censuses' })}
          />
        </Flex>
      )}

      {showVotes && (
        <Section
          title={t('censuses.in_votes', { defaultValue: 'In votes' })}
          hint={t('censuses.in_votes_hint', { defaultValue: 'Each vote has its own census' })}
        >
          <Stack gap={3}>
            {openGroups.map((key) => (
              <StateCard
                key={key}
                header={<StateHeader state={key} label={groupLabels[key]} count={votes(key).length} />}
              >
                {rows(key)}
              </StateCard>
            ))}
            {visible('closed') && closed.length > 0 && (
              <Collapsible.Root open={closedExpanded} onOpenChange={({ open }) => setClosedOpen(open)}>
                <Box borderWidth='1px' borderColor='border' borderRadius='lg' overflow='hidden' bg='bg'>
                  <Collapsible.Trigger asChild>
                    <Flex
                      as='button'
                      w='full'
                      align='center'
                      gap={2}
                      px={4}
                      py={3}
                      textAlign='left'
                      cursor='pointer'
                      _hover={{ bg: 'bg.subtle' }}
                      borderBottomWidth={closedExpanded ? '1px' : 0}
                      borderColor='border'
                    >
                      <Box w={2} h={2} borderRadius='full' bg={DOT.closed} aria-hidden />
                      <Text as='h3' fontSize='sm' fontWeight='bolder'>
                        {groupLabels.closed}
                      </Text>
                      <Text fontSize='sm' color='fg.muted' truncate minW={0} flex='1'>
                        {t('censuses.closed_summary', {
                          count: closed.length,
                          name: lastClosed?.title || untitledVote(t),
                          defaultValue_one: "1 vote · '{{name}}'",
                          defaultValue_other: "{{count}} votes · last: '{{name}}'",
                        })}
                      </Text>
                      <Icon
                        as={LuChevronDown}
                        color='fg.muted'
                        transform={closedExpanded ? 'rotate(180deg)' : undefined}
                        transition='transform 0.2s'
                        _motionReduce={{ transition: 'none' }}
                      />
                    </Flex>
                  </Collapsible.Trigger>
                  <Collapsible.Content>
                    <Box as='ul' listStyleType='none' m={0} p={0}>
                      {rows('closed')}
                    </Box>
                  </Collapsible.Content>
                </Box>
              </Collapsible.Root>
            )}
          </Stack>
        </Section>
      )}

      {showSaved && (
        <Section
          title={savedLabel}
          hint={t('censuses.saved.hint', { defaultValue: 'Reusable lists, copied into a vote when you use them' })}
          action={
            <Button asChild size='sm' variant='outline' colorPalette='gray'>
              <RouterLink to={newSavedCensusLink} state={NEW_SAVED_CENSUS_STATE}>
                <Icon as={LuPlus} />
                {t('censuses.saved.new', { defaultValue: 'New saved census' })}
              </RouterLink>
            </Button>
          }
        >
          <Grid
            as='ul'
            listStyleType='none'
            m={0}
            p={0}
            templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' }}
            gap={3}
          >
            {saved.map((row) => (
              <SavedCard key={row.group.id} row={row} />
            ))}
            {!searching && <NewSavedCard />}
          </Grid>
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

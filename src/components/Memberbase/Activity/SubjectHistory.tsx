import { Box, chakra, Flex, Icon, Link, Skeleton, Stack, Text } from '@chakra-ui/react'
import { useId, useMemo, type ElementType, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LuArrowRight, LuCopy, LuHistory, LuListChecks } from 'react-icons/lu'
import { Link as RouterLink } from 'react-router'
import { SectionCard } from '~components/ui/SectionCard'
import { useDateFns } from '~i18n/use-date-fns'
import { usePublicLanguage } from '~i18n/usePublicLanguage'
import { Routes } from '~routes'
import { useAppEnv } from '~src/app-env'
import {
  deriveVoteEvents,
  sortEvents,
  useActivity,
  type ActivityEvent,
  type ActivityQuery,
} from '~src/queries/activity'
import { censusSourceLabel, untitledVote } from '../Censuses/labels'
import type { ResolvedCensusState } from '../Censuses/useResolvedCensus'
import { ActivityRow, ActorLabel, EventSentence, ICONS } from './ActivityRow'
import { CENSUS_PARAM, savedKey, voteKey } from './censusRefs'

const HISTORY_LIMIT = 20

/** One subject's latest changes, newest first, each with its date and its masked diff. */
const HistoryList = ({ query, title }: { query: ActivityQuery; title: string }) => {
  const { t } = useTranslation()
  const headingId = useId()
  const activity = useActivity({ ...query, limit: HISTORY_LIMIT })

  return (
    <Stack as='section' gap={2} aria-labelledby={headingId}>
      <Text id={headingId} as='h3' fontSize='sm' fontWeight='bolder'>
        {title}
      </Text>
      {activity.isLoading ? (
        <Stack gap={2} aria-busy>
          <Skeleton h={5} />
          <Skeleton h={5} w='70%' />
        </Stack>
      ) : activity.isError ? (
        <Text fontSize='sm' color='fg.muted'>
          {t('activity.history.error', { defaultValue: "We couldn't load the history." })}
        </Text>
      ) : activity.events.length ? (
        <Box as='ul' m={0} p={0}>
          {sortEvents(activity.events).map((event) => (
            <ActivityRow key={event.id} event={event} showDate />
          ))}
        </Box>
      ) : (
        <Text fontSize='sm' color='fg.muted'>
          {t('activity.history.empty', { defaultValue: 'No changes recorded yet.' })}
        </Text>
      )}
    </Stack>
  )
}

type RailItem = {
  id: string
  at: string
  icon: ElementType
  title: ReactNode
  detail?: ReactNode
  /** A vote milestone: a filled dot */
  milestone?: boolean
}

const time = (iso?: string | null) => (iso ? new Date(iso).getTime() : NaN)

/**
 * A census' history on its own page, newest first, on a rail: what's known today (when it was created
 * and where its people came from, its vote opening and closing, the votes that copied it), plus every
 * change with who made it once the activity log is on (AppEnv `ACTIVITY_LOG`). The stretch of rail
 * while voting was open is green. Its footer opens the Activity tab filtered to this census.
 */
export const CensusHistory = ({ census }: { census: ResolvedCensusState }) => {
  const { t } = useTranslation()
  const { format } = useDateFns()
  const language = usePublicLanguage()
  const { ACTIVITY_LOG } = useAppEnv()
  const headingId = useId()
  const process = census.kind === 'vote' ? census.process : undefined
  const groupId = census.kind === 'saved' ? census.groupId : undefined
  const scoped = !!process || !!groupId
  const log = useActivity({
    processId: process?.id,
    subjectId: groupId,
    limit: HISTORY_LIMIT,
    enabled: !!ACTIVITY_LOG && scoped,
  })

  const items = useMemo(() => {
    const list: RailItem[] = []
    const logged = ACTIVITY_LOG ? log.events.filter((event): event is ActivityEvent & { at: string } => !!event.at) : []
    const loggedTypes = new Set(logged.map((event) => event.type))
    for (const event of logged)
      list.push({
        id: event.id,
        at: event.at,
        icon: ICONS[event.type],
        title: <EventSentence event={event} />,
        detail: <ActorLabel event={event} />,
        milestone: event.type.startsWith('process.'),
      })

    if (process) {
      const createdAt = census.marker?.createdAt || census.group?.createdAt
      if (createdAt && !loggedTypes.has('census.frozen'))
        list.push({
          id: 'created',
          at: createdAt,
          icon: LuCopy,
          title: t('activity.history.census_created', { defaultValue: 'Census created' }),
          detail: census.source ? censusSourceLabel(t, census.source) : undefined,
        })
      // The log records a vote opening and closing too: only what it doesn't have is worked out
      for (const event of deriveVoteEvents([process], { language }))
        if (!loggedTypes.has(event.type) && event.at)
          list.push({
            id: event.id,
            at: event.at,
            icon: ICONS[event.type],
            title: <EventSentence event={event} />,
            milestone: true,
          })
    }

    if (census.kind === 'saved') {
      const createdAt = census.group?.createdAt
      if (createdAt && !loggedTypes.has('group.created'))
        list.push({
          id: 'created',
          at: createdAt,
          icon: LuListChecks,
          title: t('activity.event.saved_created', { defaultValue: 'Saved census created' }),
        })
      for (const vote of census.copiedInto)
        if (vote.copiedAt)
          list.push({
            id: `copy:${vote.id}`,
            at: vote.copiedAt,
            icon: LuCopy,
            title: t('activity.history.copied_into', {
              defaultValue: "Copied into '{{name}}'",
              name: vote.title || untitledVote(t, vote.state === 'draft'),
            }),
          })
    }

    return list.filter((item) => !Number.isNaN(time(item.at))).sort((a, b) => time(b.at) - time(a.at))
  }, [ACTIVITY_LOG, log.events, process, census, language, t])

  if (!scoped) return null

  // The voting window, to paint that stretch of the rail
  const start = process?.published ? time(process.startDate) : NaN
  const end = Math.min(time((process as { endedAt?: string } | undefined)?.endedAt ?? process?.endDate), Date.now())
  const opened = !Number.isNaN(start) && start <= Date.now()
  const during = (iso: string) => opened && time(iso) >= start && time(iso) <= end
  const key = process ? voteKey(process.id) : savedKey(groupId!)
  const activityLink = `${Routes.dashboard.memberbase.activity}?${new URLSearchParams({ [CENSUS_PARAM]: key })}`

  return (
    <SectionCard>
      <Stack as='section' gap={3} aria-labelledby={headingId}>
        <Flex justify='space-between' align='center' gap={3}>
          <Text id={headingId} as='h3' fontSize='sm' fontWeight='bolder'>
            {t('activity.history.census_title', { defaultValue: 'History' })}
          </Text>
          {opened && (
            <Flex align='center' gap={1.5} fontSize='xs' color='fg.muted'>
              <Box w={3} h='2px' bg='green.500' borderRadius='full' aria-hidden />
              {t('activity.history.voting_open', { defaultValue: 'While voting was open' })}
            </Flex>
          )}
        </Flex>
        {ACTIVITY_LOG && log.isLoading ? (
          <Stack gap={2} aria-busy>
            <Skeleton h={5} />
            <Skeleton h={5} w='70%' />
          </Stack>
        ) : items.length ? (
          <Box as='ol' m={0} p={0}>
            {items.map((item, index) => {
              const last = index === items.length - 1
              const green = during(item.at)
              return (
                <Flex as='li' key={item.id} listStyleType='none' gap={3} align='stretch'>
                  {/* The rail: a dot per entry, joined by a line that's green while voting was open */}
                  <Flex direction='column' align='center' w={6} flexShrink={0}>
                    <Flex
                      boxSize={6}
                      align='center'
                      justify='center'
                      borderRadius='full'
                      borderWidth='1px'
                      borderColor={item.milestone ? 'transparent' : 'border'}
                      bg={item.milestone ? (green ? 'green.500' : 'fg') : 'bg'}
                      color={item.milestone ? 'bg' : 'fg.muted'}
                      flexShrink={0}
                    >
                      <Icon as={item.icon} boxSize={3} aria-hidden />
                    </Flex>
                    {!last && (
                      <Box
                        flex='1'
                        w='2px'
                        minH={3}
                        bg={green && during(items[index + 1].at) ? 'green.500' : 'border'}
                      />
                    )}
                  </Flex>
                  <Flex flex='1' minW={0} justify='space-between' gap={3} pb={last ? 0 : 4}>
                    <Box minW={0}>
                      <Text fontSize='sm' fontWeight='medium' lineHeight='1.5rem' className='ph-no-capture'>
                        {item.title}
                      </Text>
                      {item.detail && (
                        <Text as='div' fontSize='xs' color='fg.muted'>
                          {item.detail}
                        </Text>
                      )}
                    </Box>
                    <chakra.time
                      dateTime={item.at}
                      fontSize='xs'
                      color='fg.muted'
                      lineHeight='1.5rem'
                      fontVariantNumeric='tabular-nums'
                      flexShrink={0}
                    >
                      {format(item.at, 'd MMM, HH:mm')}
                    </chakra.time>
                  </Flex>
                </Flex>
              )
            })}
          </Box>
        ) : (
          <Flex align='center' gap={2} color='fg.muted'>
            <Icon as={LuHistory} boxSize={4} aria-hidden />
            <Text fontSize='sm'>
              {t('activity.history.census_empty', { defaultValue: 'Nothing has happened to this census yet.' })}
            </Text>
          </Flex>
        )}
        <Flex
          justify='space-between'
          align={{ base: 'flex-start', sm: 'center' }}
          direction={{ base: 'column', sm: 'row' }}
          gap={2}
          pt={3}
          borderTopWidth='1px'
          borderColor='border.muted'
        >
          <Text fontSize='xs' color='fg.muted'>
            {!ACTIVITY_LOG &&
              t('activity.history.soon', {
                defaultValue: 'Edits to its people, with who made them, will show here soon.',
              })}
          </Text>
          <Link asChild fontSize='sm' display='inline-flex' alignItems='center' gap={1}>
            <RouterLink to={activityLink}>
              {t('activity.history.see_in_activity', { defaultValue: 'See in Activity' })}
              <Icon as={LuArrowRight} boxSize={3.5} aria-hidden />
            </RouterLink>
          </Link>
        </Flex>
      </Stack>
    </SectionCard>
  )
}

/** A person's history: their edits, masked. Only with the activity log. */
export const PersonHistory = ({ memberId }: { memberId: string }) => {
  const { t } = useTranslation()
  const { ACTIVITY_LOG } = useAppEnv()
  if (!ACTIVITY_LOG) return null
  return (
    <HistoryList
      title={t('activity.history.person_title', { defaultValue: 'History' })}
      query={{ subjectType: 'member', subjectId: memberId }}
    />
  )
}

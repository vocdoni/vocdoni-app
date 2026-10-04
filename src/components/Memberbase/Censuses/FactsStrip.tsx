import { Box, Button, Clipboard, Flex, Grid, Icon, Link, Stack, Text } from '@chakra-ui/react'
import type { TFunction } from 'i18next'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { IconType } from 'react-icons'
import { LuCalendar, LuCheck, LuCircleAlert, LuCopy, LuInfo, LuKeyRound, LuUsers, LuVote } from 'react-icons/lu'
import { generatePath, Link as RouterLink } from 'react-router'
import { useDateFns } from '~i18n/use-date-fns'
import { Routes } from '~routes'
import { VoteStateBadge } from './CensusRow'
import { censusSummary, codeChannel, detailsList, signInFacts, sourceFacts, zoneName } from './facts'
import { membersUnit, peopleUnit, untitledVote } from './labels'
import type { ResolvedCensusState } from './useResolvedCensus'

/** What the readiness check says, as `useCensusReadiness` returns it. */
export type Readiness = { available: boolean; ready: number; total: number; unreachable: number }

const Tile = ({ icon, label, children }: { icon: IconType; label: string; children: ReactNode }) => (
  <Stack
    gap={1}
    px={4}
    py={3.5}
    minW={0}
    borderColor='border'
    // A 2x2 grid on phones, one row from md: the dividers follow
    borderRightWidth={{ base: 0, md: '1px' }}
    _last={{ borderRightWidth: 0 }}
  >
    <Flex align='center' gap={1.5} color='fg.muted'>
      <Icon as={icon} boxSize={4} aria-hidden />
      <Text fontSize='13px' fontWeight='medium'>
        {label}
      </Text>
    </Flex>
    {children}
  </Stack>
)

const Value = ({ children }: { children: ReactNode }) => (
  <Text fontSize='15px' fontWeight='bolder' lineHeight='short' lineClamp={3}>
    {children}
  </Text>
)

const Sub = ({ children }: { children: ReactNode }) => (
  <Text fontSize='13px' color='fg.muted' lineHeight='short'>
    {children}
  </Text>
)

const Count = ({ value, unit }: { value: string; unit: string }) => (
  <Text fontSize='xl' fontWeight='bolder' fontVariantNumeric='tabular-nums' lineHeight='short'>
    {value}{' '}
    <Text as='span' fontSize='13px' fontWeight='normal' color='fg.muted'>
      {unit}
    </Text>
  </Text>
)

const ShowButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <Button
    variant='plain'
    size='xs'
    fontSize='inherit'
    h='auto'
    p={0}
    minW={0}
    textDecoration='underline'
    onClick={onClick}
  >
    {label}
  </Button>
)

/** What someone lacks to get the code: "email", "mobile number" or both. */
const missingContact = (t: TFunction, twoFaFields: string[]) => {
  const email = twoFaFields.includes('email')
  const sms = twoFaFields.includes('phone')
  if (email && sms) return t('census_detail.facts.missing.email_or_mobile', { defaultValue: 'email or mobile number' })
  if (sms) return t('census_detail.facts.missing.mobile', { defaultValue: 'mobile number' })
  return t('census_detail.facts.missing.email', { defaultValue: 'email' })
}

/** Whether a vote's voters can get the code it sends: only said when it sends one. */
const VoteReadiness = ({
  readiness,
  twoFaFields,
  onShow,
}: {
  readiness: Readiness
  twoFaFields: string[]
  onShow?: () => void
}) => {
  const { t, i18n } = useTranslation()
  const channel = codeChannel(t, twoFaFields)
  if (!readiness.available || !channel) return null
  if (!readiness.unreachable)
    return (
      <Sub>{t('census_detail.facts.code_all', { defaultValue: 'All can get the code by {{channel}}', channel })}</Sub>
    )
  return (
    <Flex gap={1.5} align='flex-start' color='fg.warning'>
      <Icon as={LuCircleAlert} boxSize={3.5} mt='3px' flexShrink={0} aria-hidden />
      <Text fontSize='13px' lineHeight='short'>
        {t('census_detail.facts.code_missing', {
          count: readiness.unreachable,
          formattedCount: readiness.unreachable.toLocaleString(i18n.resolvedLanguage),
          missing: missingContact(t, twoFaFields),
          defaultValue_one: "1 has no {{missing}}, so they can't get the code",
          defaultValue_other: "{{formattedCount}} have no {{missing}}, so they can't get the code",
        })}
        {onShow && (
          <>
            {' · '}
            <ShowButton onClick={onShow} label={t('census_detail.facts.see_who', { defaultValue: 'See who' })} />
          </>
        )}
      </Text>
    </Flex>
  )
}

/** For a saved census: "92 can't get a code · Show them". Nothing when it can't be worked out. */
const ReadinessLine = ({ readiness, onShow }: { readiness: Readiness; onShow?: () => void }) => {
  const { t, i18n } = useTranslation()
  if (!readiness.available || !readiness.unreachable) return null
  return (
    <Flex gap={1.5} align='flex-start' color='fg.warning'>
      <Icon as={LuCircleAlert} boxSize={3.5} mt='3px' flexShrink={0} aria-hidden />
      <Text fontSize='13px' lineHeight='short'>
        {t('censuses.row.unreachable', {
          count: readiness.unreachable,
          formattedCount: readiness.unreachable.toLocaleString(i18n.resolvedLanguage),
          defaultValue_one: "1 can't get a code",
          defaultValue_other: "{{formattedCount}} can't get a code",
        })}
        {onShow && (
          <>
            {' · '}
            <ShowButton onClick={onShow} label={t('census_detail.facts.show_them', { defaultValue: 'Show them' })} />
          </>
        )}
      </Text>
    </Flex>
  )
}

type FactsStripProps = {
  census: ResolvedCensusState
  readiness: Readiness
  onShowUnreachable?: () => void
  /** Name the vote's dates: off where the vote is the page already (its Voters tab) */
  withVote?: boolean
}

/**
 * A census in four facts, one row: who's in it and whether they can get a code, how they sign in,
 * where they came from, and when the vote runs (or, for a saved census, which votes copied it).
 */
export const FactsStrip = ({ census, readiness, onShowUnreachable, withVote = true }: FactsStripProps) => {
  const { t, i18n } = useTranslation()
  const { format } = useDateFns()
  const number = (value: number) => value.toLocaleString(i18n.resolvedLanguage)
  const day = (iso: string) => format(iso, 'd MMM yyyy') ?? ''

  const tiles: ReactNode[] = []

  let summary: string | undefined

  if (census.kind === 'vote' && census.process) {
    const process = census.process
    const language = i18n.resolvedLanguage
    const twoFaFields = process.census?.twoFaFields ?? []
    const authFields = process.census?.authFields ?? []
    const draft = !process.published
    const copiedOn =
      census.source?.kind === 'copy' && census.groupId ? census.markers.get(census.groupId)?.createdAt : undefined
    const signIn = signInFacts(t, language, authFields, twoFaFields)
    const source = census.source
      ? sourceFacts(t, census.source, {
          draft,
          editable: census.edit !== 'none',
          copiedOn: copiedOn ? day(copiedOn) : undefined,
          day,
        })
      : undefined
    const over = census.state === 'ended' || census.state === 'canceled'
    const dates =
      process.published && process.startDate && process.endDate
        ? {
            start: format(process.startDate, 'd MMM') ?? '',
            end: format(process.endDate, 'd MMM yyyy') ?? '',
            weekday: format(process.endDate, 'EEE d MMM') ?? '',
            time: format(process.endDate, 'HH:mm') ?? '',
            zone: zoneName(String(process.endDate), language),
          }
        : undefined
    const at = dates ? (dates.zone ? `${dates.time} (${dates.zone})` : dates.time) : ''

    tiles.push(
      <Tile key='voters' icon={LuUsers} label={t('census_detail.facts.who', { defaultValue: 'Who can vote' })}>
        <Count
          value={number(census.count)}
          unit={
            census.atClose
              ? t('census_detail.facts.members_at_close', {
                  count: census.count,
                  defaultValue_one: 'member at close',
                  defaultValue_other: 'members at close',
                })
              : membersUnit(t, census.count)
          }
        />
        <VoteReadiness readiness={readiness} twoFaFields={twoFaFields} onShow={onShowUnreachable} />
        {process.census?.weighted && (
          <Sub>{t('census_detail.facts.weighted', { defaultValue: 'Votes count by voting power' })}</Sub>
        )}
      </Tile>,
      <Tile
        key='sign_in'
        icon={LuKeyRound}
        label={t('census_detail.facts.get_in.label', { defaultValue: 'How voters get in' })}
      >
        <Value>{signIn.value}</Value>
        {signIn.sub && <Sub>{signIn.sub}</Sub>}
      </Tile>
    )
    if (source)
      tiles.push(
        <Tile
          key='from'
          icon={source.icon}
          label={t('census_detail.facts.source.label', { defaultValue: 'Where the list comes from' })}
        >
          <Value>{source.value}</Value>
          {source.sub && <Sub>{source.sub}</Sub>}
        </Tile>
      )
    if (withVote) {
      tiles.push(
        <Tile
          key='voting'
          icon={LuCalendar}
          label={t('census_detail.facts.dates_label', { defaultValue: 'Voting dates' })}
        >
          {dates ? (
            <>
              <Value>
                {t('census_detail.facts.dates', {
                  defaultValue: '{{start}} – {{end}}',
                  start: dates.start,
                  end: dates.end,
                })}
              </Value>
              <Sub>
                {census.state === 'scheduled'
                  ? t('census_detail.facts.opens_at', {
                      defaultValue: 'Opens {{date}} at {{at}}',
                      date: format(process.startDate, 'EEE d MMM'),
                      at: (() => {
                        const time = format(process.startDate, 'HH:mm') ?? ''
                        const zone = zoneName(String(process.startDate), language)
                        return zone ? `${time} (${zone})` : time
                      })(),
                    })
                  : over
                    ? t('census_detail.facts.closed_at', {
                        defaultValue: 'Closed {{date}} at {{at}}',
                        date: dates.weekday,
                        at,
                      })
                    : t('census_detail.facts.closes_at', {
                        defaultValue: 'Closes {{date}} at {{at}}',
                        date: dates.weekday,
                        at,
                      })}
              </Sub>
            </>
          ) : (
            <>
              <Value>{t('census_detail.facts.not_scheduled', { defaultValue: 'Not scheduled yet' })}</Value>
              <Sub>
                {t('census_detail.facts.not_scheduled_hint', {
                  defaultValue: 'You set the dates when you edit the vote',
                })}
              </Sub>
            </>
          )}
        </Tile>
      )
      summary = censusSummary(t, {
        count: census.count,
        formattedCount: number(census.count),
        source: census.source,
        draft,
        copiedOn: copiedOn ? day(copiedOn) : undefined,
        day,
        details: authFields.length ? detailsList(t, language, authFields) : undefined,
        channel: codeChannel(t, twoFaFields),
        weighted: !!process.census?.weighted,
        dates: dates && {
          start: format(process.startDate, 'd MMM yyyy') ?? '',
          end: format(process.endDate, 'EEE d MMM yyyy') ?? '',
          time: dates.time,
          zone: dates.zone,
          over,
          canceled: census.state === 'canceled',
        },
      })
    }
  } else if (census.kind === 'saved') {
    const updated = census.group?.updatedAt || census.group?.createdAt
    const first = census.copiedInto[0]
    const firstUser = census.sharedWith[0]
    tiles.push(
      <Tile key='people' icon={LuUsers} label={t('census_detail.facts.people', { defaultValue: 'People' })}>
        <Count value={number(census.count)} unit={peopleUnit(t, census.count)} />
        {updated && <Sub>{t('censuses.saved.updated', { defaultValue: 'Updated {{date}}', date: day(updated) })}</Sub>}
      </Tile>,
      <Tile
        key='codes'
        icon={LuKeyRound}
        label={t('census_detail.facts.can_get_code', { defaultValue: 'Can get a code' })}
      >
        {readiness.available ? (
          <>
            <Value>
              {t('census_detail.facts.ready_any', {
                defaultValue: '{{ready}} by email or SMS',
                ready: number(readiness.ready),
              })}
            </Value>
            {readiness.unreachable > 0 && <ReadinessLine readiness={readiness} onShow={onShowUnreachable} />}
          </>
        ) : (
          <Sub>{t('census_detail.sign_in.per_vote', { defaultValue: 'Each vote sets how its voters sign in.' })}</Sub>
        )}
      </Tile>,
      <Tile key='copied' icon={LuCopy} label={t('census_detail.copied_into.title', { defaultValue: 'Copied into' })}>
        {first ? (
          <>
            <Flex align='center' gap={2} minW={0}>
              <Link asChild fontSize='15px' fontWeight='bolder' minW={0}>
                <RouterLink to={generatePath(Routes.dashboard.memberbase.voteCensus, { processId: first.id })}>
                  <Text as='span' truncate>
                    {first.title || untitledVote(t, first.state === 'draft')}
                  </Text>
                </RouterLink>
              </Link>
              <VoteStateBadge state={first.state === 'closed' ? 'ended' : first.state} size='sm' />
            </Flex>
            <Sub>
              {census.copiedInto.length > 1
                ? t('census_detail.facts.copied_more', {
                    count: census.copiedInto.length - 1,
                    defaultValue_one: 'And 1 more vote',
                    defaultValue_other: 'And {{count}} more votes',
                  })
                : first.copiedAt
                  ? t('census_detail.copied_into.on', { defaultValue: 'Copied on {{date}}', date: day(first.copiedAt) })
                  : null}
            </Sub>
          </>
        ) : (
          <>
            <Value>{t('census_detail.facts.no_copy', { defaultValue: 'No vote yet' })}</Value>
            <Sub>
              {t('census_detail.facts.no_copy_hint', { defaultValue: 'A vote that uses it gets its own copy' })}
            </Sub>
          </>
        )}
      </Tile>
    )
    if (firstUser)
      tiles.push(
        <Tile key='used' icon={LuVote} label={t('census_detail.used_by.title', { defaultValue: 'Used by' })}>
          <Link asChild fontSize='15px' fontWeight='bolder'>
            <RouterLink to={generatePath(Routes.dashboard.memberbase.voteCensus, { processId: firstUser.id })}>
              <Text as='span' truncate>
                {firstUser.title || untitledVote(t, firstUser.state === 'draft')}
              </Text>
            </RouterLink>
          </Link>
          <Sub>
            {census.sharedWith.length > 1
              ? t('census_detail.facts.used_more', {
                  count: census.sharedWith.length - 1,
                  defaultValue_one: 'And 1 more vote: changes here reach them',
                  defaultValue_other: 'And {{count}} more votes: changes here reach them',
                })
              : t('census_detail.facts.used_reach', { defaultValue: 'Changes here reach this vote' })}
          </Sub>
        </Tile>
      )
  }

  if (!tiles.length) return null
  const grid = (
    <Grid
      templateColumns={{ base: 'repeat(2, minmax(0, 1fr))', md: `repeat(${tiles.length}, minmax(0, 1fr))` }}
      rowGap={{ base: 2, md: 0 }}
      py={{ base: 1, md: 0 }}
    >
      {tiles}
    </Grid>
  )
  return (
    <Box borderWidth='1px' borderColor='border' borderRadius='lg' bg='bg' overflow='hidden'>
      {grid}
      {summary && (
        // The same facts in sentences, to paste into an email to the board
        <Flex gap={3} align='flex-start' px={4} py={3} bg='bg.subtle' borderTopWidth='1px' borderColor='border'>
          <Icon as={LuInfo} boxSize={4} color='fg.muted' mt='2px' flexShrink={0} aria-hidden />
          <Text fontSize='sm' flex={1}>
            {summary}
          </Text>
          <Clipboard.Root value={summary} flexShrink={0}>
            <Clipboard.Trigger asChild>
              <Button size='xs' variant='outline' colorPalette='gray'>
                <Clipboard.Indicator copied={<Icon as={LuCheck} />}>
                  <Icon as={LuCopy} />
                </Clipboard.Indicator>
                {t('census_detail.summary.copy', { defaultValue: 'Copy' })}
              </Button>
            </Clipboard.Trigger>
          </Clipboard.Root>
        </Flex>
      )}
    </Box>
  )
}

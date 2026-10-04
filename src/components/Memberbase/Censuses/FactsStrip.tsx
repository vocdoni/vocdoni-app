import { Box, Button, Flex, Grid, Icon, Link, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { IconType } from 'react-icons'
import { LuCalendar, LuCircleAlert, LuCopy, LuKeyRound, LuUsers, LuVote } from 'react-icons/lu'
import { generatePath, Link as RouterLink } from 'react-router'
import { signInShortText } from '~components/Process/Dashboard/View/signIn'
import { useDateFns } from '~i18n/use-date-fns'
import { Routes } from '~routes'
import { useMemberFields } from '../fields'
import { VoteStateBadge } from './CensusRow'
import { censusSourceLabel, peopleUnit, untitledVote, votersUnit } from './labels'
import type { ResolvedCensusState } from './useResolvedCensus'

/** What the readiness check says, as `useCensusReadiness` returns it. */
export type Readiness = { available: boolean; ready: number; total: number; unreachable: number }

const Tile = ({ icon, label, children }: { icon: IconType; label: string; children: ReactNode }) => (
  <Box
    px={4}
    py={3}
    minW={0}
    borderColor='border'
    // A 2x2 grid on phones, one row from md: the dividers follow
    borderRightWidth={{ base: 0, md: '1px' }}
    _last={{ borderRightWidth: 0 }}
  >
    <Flex align='center' gap={1.5} color='fg.muted' mb={1}>
      <Icon as={icon} boxSize={3.5} aria-hidden />
      <Text fontSize='xs' fontWeight='bold' textTransform='uppercase' letterSpacing='wide'>
        {label}
      </Text>
    </Flex>
    {children}
  </Box>
)

const Value = ({ children }: { children: ReactNode }) => (
  <Text fontSize='sm' fontWeight='bolder' lineClamp={2}>
    {children}
  </Text>
)

const Sub = ({ children }: { children: ReactNode }) => (
  <Text fontSize='xs' color='fg.muted'>
    {children}
  </Text>
)

/** "92 can't get a code · Show them", or a quiet all-clear. Nothing when it can't be worked out. */
const ReadinessLine = ({ readiness, onShow }: { readiness: Readiness; onShow?: () => void }) => {
  const { t, i18n } = useTranslation()
  if (!readiness.available) return null
  if (!readiness.unreachable)
    return <Sub>{t('census_detail.facts.all_ready', { defaultValue: 'All can get a code' })}</Sub>
  return (
    <Flex align='center' gap={1} color='fg.warning' wrap='wrap'>
      <Icon as={LuCircleAlert} boxSize={3} aria-hidden />
      <Text fontSize='xs'>
        {t('censuses.row.unreachable', {
          count: readiness.unreachable,
          formattedCount: readiness.unreachable.toLocaleString(i18n.resolvedLanguage),
          defaultValue_one: "1 can't get a code",
          defaultValue_other: "{{formattedCount}} can't get a code",
        })}
      </Text>
      {onShow && (
        <Button variant='plain' size='xs' h='auto' p={0} minW={0} textDecoration='underline' onClick={onShow}>
          {t('census_detail.facts.show_them', { defaultValue: 'Show them' })}
        </Button>
      )}
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
  const fields = useMemberFields()
  const number = (value: number) => value.toLocaleString(i18n.resolvedLanguage)
  const day = (iso: string) => format(iso, 'd MMM yyyy')

  const tiles: ReactNode[] = []

  if (census.kind === 'vote' && census.process) {
    const process = census.process
    const unit = votersUnit(t, census.count)
    const twoFaFields = process.census?.twoFaFields ?? []
    const details = (process.census?.authFields ?? []).map((id) => fields.find((field) => field.id === id)?.label ?? id)
    const copiedOn =
      census.source?.kind === 'copy' && census.groupId ? census.markers.get(census.groupId)?.createdAt : undefined

    tiles.push(
      <Tile key='voters' icon={LuUsers} label={t('census_detail.facts.voters', { defaultValue: 'Voters' })}>
        <Text fontSize='lg' fontWeight='bolder' fontVariantNumeric='tabular-nums' lineHeight='short'>
          {number(census.count)}{' '}
          <Text as='span' fontSize='xs' fontWeight='normal' color='fg.muted'>
            {census.atClose ? t('census_detail.people.at_close', { defaultValue: '{{unit}} at close', unit }) : unit}
          </Text>
        </Text>
        <ReadinessLine readiness={readiness} onShow={onShowUnreachable} />
        {process.census?.weighted && (
          <Sub>{t('census_detail.vote_card.weighted', { defaultValue: 'Weighted by each member' })}</Sub>
        )}
      </Tile>,
      <Tile key='sign_in' icon={LuKeyRound} label={t('census_detail.facts.sign_in', { defaultValue: 'Sign-in' })}>
        <Value>{signInShortText(t, twoFaFields)}</Value>
        {details.length > 0 && (
          <Sub>
            {t('census_detail.facts.they_type', {
              defaultValue: 'They also type: {{details}}',
              details: details.join(', '),
            })}
          </Sub>
        )}
      </Tile>,
      <Tile key='from' icon={LuCopy} label={t('census_detail.vote_card.people', { defaultValue: 'People from' })}>
        <Value>{census.source ? censusSourceLabel(t, census.source, day) : ''}</Value>
        {copiedOn && (
          <Sub>{t('census_detail.copied_into.on', { defaultValue: 'Copied on {{date}}', date: day(copiedOn) })}</Sub>
        )}
      </Tile>
    )
    if (withVote)
      tiles.push(
        <Tile key='voting' icon={LuCalendar} label={t('census_detail.facts.voting', { defaultValue: 'Voting' })}>
          {process.published && process.startDate && process.endDate ? (
            <>
              <Value>
                {t('census_detail.facts.dates', {
                  defaultValue: '{{start}} – {{end}}',
                  start: format(process.startDate, 'd MMM'),
                  end: format(process.endDate, 'd MMM yyyy'),
                })}
              </Value>
              <Sub>
                {census.state === 'scheduled'
                  ? t('census_detail.facts.opens', {
                      defaultValue: 'Opens {{date}}',
                      date: format(process.startDate, 'EEE d MMM, HH:mm'),
                    })
                  : census.state === 'ended' || census.state === 'canceled'
                    ? t('census_detail.facts.closed', {
                        defaultValue: 'Closed {{date}}',
                        date: format(process.endDate, 'd MMM yyyy'),
                      })
                    : t('census_detail.facts.closes', {
                        defaultValue: 'Closes {{date}}',
                        date: format(process.endDate, 'EEE d MMM, HH:mm'),
                      })}
              </Sub>
            </>
          ) : (
            <>
              <Value>{t('census_detail.facts.not_published', { defaultValue: 'Not published yet' })}</Value>
              <Sub>{t('census_detail.facts.draft', { defaultValue: 'A draft: dates are set in the editor' })}</Sub>
            </>
          )}
        </Tile>
      )
  } else if (census.kind === 'saved') {
    const updated = census.group?.updatedAt || census.group?.createdAt
    const first = census.copiedInto[0]
    const firstUser = census.sharedWith[0]
    tiles.push(
      <Tile key='people' icon={LuUsers} label={t('census_detail.facts.people', { defaultValue: 'People' })}>
        <Text fontSize='lg' fontWeight='bolder' fontVariantNumeric='tabular-nums' lineHeight='short'>
          {number(census.count)}{' '}
          <Text as='span' fontSize='xs' fontWeight='normal' color='fg.muted'>
            {peopleUnit(t, census.count)}
          </Text>
        </Text>
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
              <Link asChild fontSize='sm' fontWeight='bolder' minW={0}>
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
          <Link asChild fontSize='sm' fontWeight='bolder'>
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
  return (
    <Grid
      templateColumns={{ base: 'repeat(2, minmax(0, 1fr))', md: `repeat(${tiles.length}, minmax(0, 1fr))` }}
      borderWidth='1px'
      borderColor='border'
      borderRadius='lg'
      bg='bg'
      rowGap={{ base: 2, md: 0 }}
      py={{ base: 1, md: 0 }}
    >
      {tiles}
    </Grid>
  )
}

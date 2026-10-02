import { Box, Flex, Grid, Icon, Link, Skeleton, Stack, Text } from '@chakra-ui/react'
import { ElectionProvider } from '@vocdoni/react-components'
import type { TFunction } from 'i18next'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { LuLock } from 'react-icons/lu'
import { createSearchParams, generatePath, Link as RouterLink } from 'react-router'
import { VoterLookup } from '~components/Process/Dashboard/View/VoterLookup'
import { Banner } from '~components/ui/Banner'
import { SectionCard } from '~components/ui/SectionCard'
import { Routes } from '~routes'
import type { Group } from '~src/queries/groups'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { CensusMembersTable } from './CensusMembersTable'
import { peopleUnit, votersUnit } from './labels'
import { isEnded } from './model'
import { ExportCard, readOnlyText, SavedCensusActions, SignInCard } from './SideCards'
import { formatVoteList, UsedByCard } from './UsedBy'
import { type CensusDetailTarget, type ResolvedCensusState, useResolvedCensus } from './useResolvedCensus'

export type CensusDetailProps = CensusDetailTarget

/** One sentence on where this census' people come from and what changing it touches. */
const sourceSentence = (t: TFunction, language: string | undefined, census: ResolvedCensusState) => {
  if (census.kind === 'everyone')
    return t('census_detail.source.everyone', { defaultValue: 'Everyone: members you add later can vote too.' })
  if (census.sharedWith.length)
    return t('census_detail.source.shared', {
      defaultValue: 'Shared with {{votes}}. Changing it changes who can vote in all of them, even closed ones.',
      votes: formatVoteList(t, language, census.sharedWith),
    })
  if (census.kind === 'saved')
    return t('census_detail.source.saved', { defaultValue: 'A saved census you can reuse in your votes.' })
  switch (census.source?.kind) {
    case 'copy':
    case 'snapshot':
    case 'test':
      return t('census_detail.source.own', {
        defaultValue: "This vote's own census. Editing it doesn't change your members or other votes.",
      })
    case 'everyone':
      return t('census_detail.source.follows_everyone', {
        defaultValue: 'This vote follows Everyone: members you add can vote in it too.',
      })
    default:
      return t('census_detail.source.selected', { defaultValue: 'People picked one by one for this vote.' })
  }
}

const ReadOnlyNote = ({ census }: { census: ResolvedCensusState }) => {
  const { t } = useTranslation()
  if (!census.readOnly) return null
  return (
    <Flex gap={1.5} align='flex-start' fontSize='sm' color='fg.muted'>
      <Icon as={LuLock} mt={0.5} flexShrink={0} aria-hidden />
      <Text fontSize='sm'>
        {readOnlyText(t, census.readOnly)}{' '}
        {census.readOnly === 'draft_selected' && census.process && (
          <Link asChild fontSize='sm'>
            <RouterLink
              to={{
                pathname: generatePath(Routes.processes.create),
                search: createSearchParams({ draftId: census.process.id }).toString(),
              }}
            >
              {t('census_detail.open_draft', { defaultValue: 'Open the draft' })}
            </RouterLink>
          </Link>
        )}
      </Text>
    </Flex>
  )
}

const PeopleCard = ({ census }: { census: ResolvedCensusState }) => {
  const { t, i18n } = useTranslation()
  const count = census.count
  const unit = census.kind === 'vote' ? votersUnit(t, count) : peopleUnit(t, count)

  return (
    <SectionCard>
      <Stack gap={3}>
        <Flex justify='space-between' align='flex-start' gap={3} wrap='wrap'>
          <Box>
            <Text as='h2' fontSize='sm' fontWeight='bolder' mb={1}>
              {t('census_detail.people.title', { defaultValue: 'People' })}
            </Text>
            <Flex align='baseline' gap={2}>
              <Text fontSize='2xl' fontWeight='bolder' lineHeight='1' fontVariantNumeric='tabular-nums'>
                {count.toLocaleString(i18n.resolvedLanguage)}
              </Text>
              <Text fontSize='sm' color='fg.muted'>
                {census.atClose
                  ? t('census_detail.people.at_close', { defaultValue: '{{unit}} at close', unit })
                  : unit}
              </Text>
            </Flex>
          </Box>
        </Flex>
        <Text fontSize='sm' color='fg.muted'>
          {sourceSentence(t, i18n.resolvedLanguage, census)}
        </Text>
        <ReadOnlyNote census={census} />
        {census.browse === 'group' && census.groupId ? (
          <CensusMembersTable groupId={census.groupId} total={census.count} selectable={false} />
        ) : (
          <Text fontSize='sm' color='fg.muted'>
            {t('census_detail.lookup_note', {
              defaultValue:
                "This census isn't kept as a list we can show. To check someone, look them up by a detail this vote uses.",
            })}
          </Text>
        )}
      </Stack>
    </SectionCard>
  )
}

/**
 * A census: its people (searchable when they fit in memory), where they come from, how they sign in,
 * the votes it's shared with and its download. No page chrome, so the vote page can embed it too.
 */
export const CensusDetail = (props: CensusDetailProps) => {
  const { t } = useTranslation()
  const census = useResolvedCensus(props)
  const tracked = useRef(false)

  useEffect(() => {
    if (census.isLoading || tracked.current || census.error) return
    tracked.current = true
    trackAnalyticsEvent({
      name: AnalyticsEvents.CensusOpened,
      props: { kind: census.kind, state: census.state ?? 'saved' },
    })
  }, [census.isLoading, census.error, census.kind, census.state])

  if (census.isLoading)
    return (
      <Grid templateColumns={{ base: 'minmax(0, 1fr)', lg: 'minmax(0, 2fr) minmax(0, 1fr)' }} gap={4} aria-busy>
        <Skeleton h='320px' borderRadius='md' />
        <Skeleton h='160px' borderRadius='md' />
      </Grid>
    )

  if (census.error || (props.kind === 'saved' && !census.group))
    return (
      <Banner status='error'>{t('census_detail.not_found', { defaultValue: "We couldn't find this census." })}</Banner>
    )

  const twoFaFields = census.kind === 'vote' ? (census.process?.census?.twoFaFields ?? []) : undefined
  const readinessGroupId = census.kind === 'everyone' || census.source?.kind === 'everyone' ? undefined : census.groupId

  return (
    <Grid templateColumns={{ base: 'minmax(0, 1fr)', lg: 'minmax(0, 2fr) minmax(0, 1fr)' }} gap={4} alignItems='start'>
      <Stack gap={4} minW={0}>
        <PeopleCard census={census} />
        {census.browse === 'lookup' && census.process && (
          <ElectionProvider id={census.process.id}>
            <VoterLookup />
          </ElectionProvider>
        )}
      </Stack>
      <Stack gap={4} minW={0}>
        <SignInCard
          twoFaFields={twoFaFields}
          groupId={readinessGroupId}
          total={census.count}
          noReadiness={isEnded(census.state) || (census.browse === 'lookup' && census.source?.kind !== 'everyone')}
        />
        {census.kind === 'saved' && census.group && (
          <>
            <UsedByCard votes={census.sharedWith} />
            <SavedCensusActions group={census.group as Group} usedBy={census.sharedWith} />
          </>
        )}
        {census.browse === 'group' && census.groupId && (
          <ExportCard groupId={census.groupId} name={census.title || 'census'} kind={census.kind} />
        )}
      </Stack>
    </Grid>
  )
}

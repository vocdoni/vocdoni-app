import { Box, Button, Flex, Grid, Icon, Link, Skeleton, Stack, Text } from '@chakra-ui/react'
import { ElectionProvider } from '@vocdoni/react-components'
import type { TFunction } from 'i18next'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuLock, LuUserMinus, LuUserPlus } from 'react-icons/lu'
import { createSearchParams, generatePath, Link as RouterLink } from 'react-router'
import { VoterLookup } from '~components/Process/Dashboard/View/VoterLookup'
import { Banner } from '~components/ui/Banner'
import { SectionCard } from '~components/ui/SectionCard'
import { Routes } from '~routes'
import type { Group } from '~src/queries/groups'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import type { SelectedMember } from '../People/useSelection'
import { AddPeopleSheet, PickToRemoveSheet } from './AddPeopleSheet'
import { CensusMembersTable } from './CensusMembersTable'
import { peopleUnit, votersUnit } from './labels'
import { isEnded } from './model'
import { ExportCard, readOnlyText, SavedCensusActions, SignInCard } from './SideCards'
import { RemovePeopleDialog } from './RemovePeopleDialog'
import { CopiedIntoCard, CopiedIntoRunningBanner, formatVoteList, UsedByCard } from './UsedBy'
import { useCensusEditor } from './useCensusEditor'
import { VoteCard } from './VoteCard'
import { type CensusDetailTarget, type ResolvedCensusState, useResolvedCensus } from './useResolvedCensus'

export type CensusDetailProps = CensusDetailTarget & {
  /** For analytics: where the census is shown (its page in Members, a vote's Voters tab) */
  surface?: string
}

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
      return census.edit === 'process'
        ? t('census_detail.source.follows_everyone_live', {
            defaultValue:
              'This vote follows Everyone: members you add can vote in it too. Removing someone here only takes them out of this vote.',
          })
        : t('census_detail.source.follows_everyone', {
            defaultValue: 'This vote follows Everyone: members you add can vote in it too.',
          })
    case 'saved':
      return t('census_detail.source.legacy_saved', {
        defaultValue:
          "This vote follows the saved census '{{name}}', so changes to it reach this vote too. Changes made here only affect this vote.",
        name: census.source.group.title,
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
        {(census.readOnly === 'draft_selected' || census.readOnly === 'draft_saved') && census.process && (
          <Link asChild fontSize='sm'>
            <RouterLink
              to={{
                pathname: generatePath(Routes.processes.create),
                search: createSearchParams({ draftId: census.process.id }).toString(),
              }}
            >
              {census.readOnly === 'draft_saved'
                ? t('census_detail.open_in_editor', { defaultValue: 'Open in editor' })
                : t('census_detail.open_draft', { defaultValue: 'Open the draft' })}
            </RouterLink>
          </Link>
        )}
      </Text>
    </Flex>
  )
}

const PeopleCard = ({ census, surface }: { census: ResolvedCensusState; surface?: string }) => {
  const { t, i18n } = useTranslation()
  const editor = useCensusEditor(census)
  const [adding, setAdding] = useState(false)
  const [picking, setPicking] = useState(false)
  const [removing, setRemoving] = useState<SelectedMember[] | null>(null)
  const [removals, setRemovals] = useState(0)
  const count = census.count
  const unit = census.kind === 'vote' ? votersUnit(t, count) : peopleUnit(t, count)
  const name = census.title || t('census_detail.this_census', { defaultValue: 'this census' })

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
          {census.edit !== 'none' && (
            <Flex gap={2} wrap='wrap'>
              {census.edit === 'process' && (
                <Button size='sm' variant='outline' colorPalette='gray' onClick={() => setPicking(true)}>
                  <Icon as={LuUserMinus} />
                  {t('census_detail.remove.pick_button', { defaultValue: 'Remove people…' })}
                </Button>
              )}
              {/* Everyone already holds every member: there's nobody to add */}
              {census.source?.kind !== 'everyone' && (
                <Button size='sm' onClick={() => setAdding(true)}>
                  <Icon as={LuUserPlus} />
                  {t('census_detail.add.button', { defaultValue: 'Add people' })}
                </Button>
              )}
            </Flex>
          )}
        </Flex>
        <Text fontSize='sm' color='fg.muted'>
          {sourceSentence(t, i18n.resolvedLanguage, census)}
        </Text>
        <ReadOnlyNote census={census} />
        {census.browse === 'group' && census.groupId ? (
          <CensusMembersTable
            groupId={census.groupId}
            total={census.group?.memberIds?.length ?? census.count}
            selectable={census.edit === 'group'}
            onRemove={setRemoving}
            resetKey={removals}
          />
        ) : (
          <Text fontSize='sm' color='fg.muted'>
            {t('census_detail.lookup_note', {
              defaultValue:
                "This census isn't kept as a list we can show. To check someone, look them up by a detail this vote uses.",
            })}
          </Text>
        )}
      </Stack>
      {census.edit !== 'none' && (
        <>
          <AddPeopleSheet
            open={adding}
            onOpenChange={setAdding}
            census={census}
            editor={editor}
            name={name}
            surface={surface}
          />
          <PickToRemoveSheet
            process={census.process}
            open={picking}
            onOpenChange={setPicking}
            onPicked={(people) => {
              setPicking(false)
              setRemoving(people)
            }}
          />
          <RemovePeopleDialog
            open={!!removing}
            onOpenChange={(open) => !open && setRemoving(null)}
            people={removing ?? []}
            census={census}
            editor={editor}
            name={name}
            onRemoved={() => setRemovals((value) => value + 1)}
          />
        </>
      )}
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

  if (census.error || (props.kind === 'saved' ? !census.group : !census.process))
    return (
      <Banner status='error'>{t('census_detail.not_found', { defaultValue: "We couldn't find this census." })}</Banner>
    )

  const twoFaFields = census.kind === 'vote' ? (census.process?.census?.twoFaFields ?? []) : undefined
  const readinessGroupId = census.kind === 'everyone' || census.source?.kind === 'everyone' ? undefined : census.groupId

  return (
    <Grid templateColumns={{ base: 'minmax(0, 1fr)', lg: 'minmax(0, 2fr) minmax(0, 1fr)' }} gap={4} alignItems='start'>
      <Stack gap={4} minW={0}>
        {census.kind === 'saved' && <CopiedIntoRunningBanner votes={census.copiedInto} />}
        <PeopleCard census={census} surface={props.surface ?? 'census_page'} />
        {census.browse === 'lookup' && census.process && (
          <ElectionProvider id={census.process.id}>
            <VoterLookup />
          </ElectionProvider>
        )}
      </Stack>
      <Stack gap={4} minW={0}>
        {census.kind === 'vote' && census.process ? (
          // Which vote this census belongs to, and exactly how its people sign in to it
          <VoteCard
            process={census.process}
            state={census.state}
            source={census.source}
            madeAt={census.groupId ? census.markers.get(census.groupId)?.createdAt : undefined}
            groupId={readinessGroupId}
            total={census.count}
            noReadiness={isEnded(census.state) || (census.browse === 'lookup' && census.source?.kind !== 'everyone')}
            withVote={(props.surface ?? 'census_page') === 'census_page'}
          />
        ) : (
          <SignInCard
            twoFaFields={twoFaFields}
            groupId={readinessGroupId}
            total={census.count}
            noReadiness={isEnded(census.state) || (census.browse === 'lookup' && census.source?.kind !== 'everyone')}
          />
        )}
        {census.kind === 'saved' && census.group && (
          <>
            {/* "No vote uses it yet" above a list of votes that copied it would read as a contradiction */}
            {(census.sharedWith.length > 0 || census.copiedInto.length === 0) && (
              <UsedByCard votes={census.sharedWith} />
            )}
            <CopiedIntoCard votes={census.copiedInto} />
            <SavedCensusActions
              group={census.group as Group}
              usedBy={census.sharedWith}
              votesComplete={census.votesComplete}
            />
          </>
        )}
        {census.browse === 'group' && census.groupId && (
          <ExportCard groupId={census.groupId} name={census.title || 'census'} kind={census.kind} />
        )}
      </Stack>
    </Grid>
  )
}

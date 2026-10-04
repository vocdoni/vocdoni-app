import { Box, Button, Flex, Heading, Icon, Link, Skeleton, Stack, Text } from '@chakra-ui/react'
import { ElectionProvider } from '@vocdoni/react-components'
import type { TFunction } from 'i18next'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuArrowUpRight, LuClock, LuLock, LuUserMinus, LuUserPlus, LuVote } from 'react-icons/lu'
import { createSearchParams, generatePath, Link as RouterLink } from 'react-router'
import { VoterLookup } from '~components/Process/Dashboard/View/VoterLookup'
import { Banner } from '~components/ui/Banner'
import { useDateFns } from '~i18n/use-date-fns'
import { Routes } from '~routes'
import type { Group } from '~src/queries/groups'
import { useCensusReadiness } from '~src/queries/members'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { CensusHistory } from '../Activity/SubjectHistory'
import type { SelectedMember } from '../People/useSelection'
import { AddPeopleSheet, PickToRemoveSheet } from './AddPeopleSheet'
import { CensusMembersTable } from './CensusMembersTable'
import { VoteStateBadge } from './CensusRow'
import { FactsStrip } from './FactsStrip'
import { untitledVote } from './labels'
import { isEnded } from './model'
import { CensusDownloadButton, readOnlyText, SavedCensusMenu } from './SideCards'
import { RemovePeopleDialog } from './RemovePeopleDialog'
import { formatVoteList } from './UsedBy'
import { useCensusEditor } from './useCensusEditor'
import { useNavigateToVote } from './useNavigateToVote'
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
      // The facts and the note already say what this census is
      return null
    case 'everyone':
      // The facts already say all members can vote: only what removing someone does is left to say
      return census.edit === 'process'
        ? t('census_detail.source.everyone_remove', {
            defaultValue: 'Removing someone here only takes them out of this vote.',
          })
        : null
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

/** The neutral line under the facts: what this kind of census does when it changes. */
const censusNote = (t: TFunction, format: ReturnType<typeof useDateFns>['format'], census: ResolvedCensusState) => {
  let text: string | null = null
  if (census.kind === 'vote' && census.source?.kind === 'snapshot')
    text = census.source.madeAt
      ? t('census_detail.vote_card.snapshot_note_on', {
          defaultValue:
            "This census was created from your members list as it was on {{date}}, when you published the vote. You can still add or remove people here. Fixing someone's details also changes them in your members list.",
          date: format(census.source.madeAt, 'd MMM yyyy'),
        })
      : t('census_detail.vote_card.snapshot_note', {
          defaultValue:
            "This census was created from your members list as it was when you published the vote. You can still add or remove people here. Fixing someone's details also changes them in your members list.",
        })
  else if (census.kind === 'vote' && (census.source?.kind === 'copy' || census.source?.kind === 'test'))
    text = t('census_detail.note.own', {
      defaultValue:
        "Fixing someone's details changes them in your members list too. Removing someone only takes them out of this vote.",
    })
  else if (census.kind === 'saved' && census.copiedInto.length)
    text = t('census_detail.note.copied', {
      count: census.copiedInto.length,
      name: census.copiedInto[0].title || untitledVote(t, census.copiedInto[0].state === 'draft'),
      defaultValue_one: "'{{name}}' has its own copy of this census, so changes here don't change who votes there.",
      defaultValue_other:
        "The {{count}} votes that copied this census have their own copies, so changes here don't change who votes there.",
    })
  return text
}

/**
 * A census: who it belongs to and what can be done with it, its key facts, and its people, searchable
 * and filterable to whoever can't get a code. The full page (Members) adds a header with the census'
 * name and actions; embedded in a vote's Voters tab or the editor it keeps the actions in one row.
 */
export const CensusDetail = (props: CensusDetailProps) => {
  const { t, i18n } = useTranslation()
  const { format } = useDateFns()
  const census = useResolvedCensus(props)
  const editor = useCensusEditor(census)
  const navigateToVote = useNavigateToVote()
  const tracked = useRef(false)
  const [adding, setAdding] = useState(false)
  const [picking, setPicking] = useState(false)
  const [removing, setRemoving] = useState<SelectedMember[] | null>(null)
  const [removals, setRemovals] = useState(0)
  const [onlyUnreachable, setOnlyUnreachable] = useState(false)
  const surface = props.surface ?? 'census_page'
  const page = surface === 'census_page'

  const twoFaFields = census.kind === 'vote' ? (census.process?.census?.twoFaFields ?? []) : ['email', 'phone']
  const readinessGroupId = census.kind === 'everyone' || census.source?.kind === 'everyone' ? undefined : census.groupId
  const readiness = useCensusReadiness({
    groupId: readinessGroupId,
    channels: twoFaFields,
    total: census.count,
    enabled:
      !census.isLoading &&
      !isEnded(census.state) &&
      !(census.browse === 'lookup' && census.source?.kind !== 'everyone'),
  })
  const unreachable = useMemo(() => new Set(readiness.unreachableIds), [readiness.unreachableIds])

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
      <Stack gap={4} aria-busy>
        {page && <Skeleton h={14} borderRadius='md' />}
        <Skeleton h={20} borderRadius='lg' />
        <Skeleton h='320px' borderRadius='lg' />
      </Stack>
    )

  if (census.error || (props.kind === 'saved' ? !census.group : !census.process))
    return (
      <Banner status='error'>{t('census_detail.not_found', { defaultValue: "We couldn't find this census." })}</Banner>
    )

  const name = census.title || t('census_detail.this_census', { defaultValue: 'this census' })
  const purpose = sourceSentence(t, i18n.resolvedLanguage, census)
  // A vote's own census was made by the app (its marker says when); a saved one when it was saved.
  // Censuses from before vote-owned ones carry no such date: then nothing is said.
  const createdAt =
    census.kind === 'saved'
      ? census.group?.createdAt
      : census.groupId
        ? census.markers.get(census.groupId)?.createdAt
        : undefined
  // Everyone already holds every member: there's nobody to add
  const canAdd = census.edit !== 'none' && census.source?.kind !== 'everyone'
  const showUnreachable = () => setOnlyUnreachable(true)
  const process = census.process
  const voteLink = process
    ? process.published
      ? generatePath(Routes.dashboard.process, { id: process.id })
      : {
          pathname: generatePath(Routes.processes.create),
          search: createSearchParams({ draftId: process.id }).toString(),
        }
    : null

  const addButton = (variant: 'solid' | 'outline') =>
    canAdd && (
      <Button
        size='sm'
        variant={variant}
        colorPalette={variant === 'outline' ? 'gray' : undefined}
        onClick={() => setAdding(true)}
      >
        <Icon as={LuUserPlus} />
        {t('census_detail.add.button', { defaultValue: 'Add people' })}
      </Button>
    )
  const removeButton = census.edit === 'process' && (
    <Button size='sm' variant='outline' colorPalette='gray' onClick={() => setPicking(true)}>
      <Icon as={LuUserMinus} />
      {t('census_detail.remove.pick_button', { defaultValue: 'Remove people…' })}
    </Button>
  )

  const actions =
    census.kind === 'saved' && census.group ? (
      <>
        {addButton('outline')}
        <Button size='sm' onClick={() => navigateToVote(census.group!.id)}>
          <Icon as={LuVote} />
          {t('censuses.saved_card.use', { defaultValue: 'Use in a vote' })}
        </Button>
        <SavedCensusMenu
          group={census.group as Group}
          usedBy={census.sharedWith}
          votesComplete={census.votesComplete}
        />
      </>
    ) : (
      <>
        {page && voteLink && (
          <Button asChild size='sm' variant='outline' colorPalette='gray'>
            <RouterLink to={voteLink}>
              {t('census_detail.open_vote', { defaultValue: 'Open vote' })}
              <Icon as={LuArrowUpRight} />
            </RouterLink>
          </Button>
        )}
        {removeButton}
        {addButton('solid')}
      </>
    )

  return (
    <Stack gap={4}>
      {page ? (
        <Flex
          justify='space-between'
          align={{ base: 'stretch', md: 'flex-start' }}
          gap={3}
          direction={{ base: 'column', md: 'row' }}
        >
          <Box minW={0}>
            <Flex align='center' gap={2.5} minW={0} wrap='wrap'>
              <Heading as='h2' size='lg' fontWeight='bolder'>
                {name}
              </Heading>
              {census.kind === 'vote' && <VoteStateBadge state={census.state} />}
            </Flex>
            {createdAt && (
              // When this census came to be, to the minute: a copy is a picture of a moment
              <Flex align='center' gap={1.5} color='fg.muted' mt={1}>
                <Icon as={LuClock} boxSize={3.5} aria-hidden />
                <Text fontSize='xs' fontVariantNumeric='tabular-nums'>
                  {t('census_detail.header.created_at', {
                    defaultValue: 'Census created on {{date}} at {{time}}',
                    date: format(createdAt, 'd MMM yyyy'),
                    time: format(createdAt, 'HH:mm'),
                  })}
                </Text>
              </Flex>
            )}
            {purpose && (
              <Text fontSize='sm' color='fg.muted' mt={2} maxW='3xl'>
                {purpose}
              </Text>
            )}
          </Box>
          <Flex gap={2} wrap='wrap' flexShrink={0}>
            {actions}
          </Flex>
        </Flex>
      ) : (
        // Embedded (a vote's Voters tab, the editor): no header, but still what this census is
        <Flex justify='space-between' align='center' gap={3} wrap='wrap'>
          <Text fontSize='sm' color='fg.muted' flex='1' minW='16rem'>
            {purpose}
          </Text>
          {(canAdd || removeButton) && (
            <Flex gap={2} wrap='wrap'>
              {actions}
            </Flex>
          )}
        </Flex>
      )}

      <FactsStrip
        census={census}
        readiness={readiness}
        onShowUnreachable={showUnreachable}
        withVote={page}
        note={censusNote(t, format, census)}
      />
      <ReadOnlyNote census={census} />

      {census.browse === 'group' && census.groupId ? (
        <CensusMembersTable
          groupId={census.groupId}
          total={census.group?.memberIds?.length ?? census.count}
          selectable={census.edit === 'group'}
          onRemove={setRemoving}
          resetKey={removals}
          unreachable={readiness.available ? unreachable : undefined}
          channels={twoFaFields}
          onlyUnreachable={onlyUnreachable}
          onOnlyUnreachableChange={setOnlyUnreachable}
          onAdd={canAdd ? () => setAdding(true) : undefined}
          toolbarEnd={
            <CensusDownloadButton groupId={census.groupId} name={census.title || 'census'} kind={census.kind} />
          }
        />
      ) : (
        <>
          <Text fontSize='sm' color='fg.muted'>
            {t('census_detail.lookup_note', {
              defaultValue:
                "This census isn't kept as a list we can show. To check someone, look them up by a detail this vote uses.",
            })}
          </Text>
          {census.process && (
            <ElectionProvider id={census.process.id}>
              <VoterLookup />
            </ElectionProvider>
          )}
        </>
      )}
      <CensusHistory census={census} />

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
    </Stack>
  )
}

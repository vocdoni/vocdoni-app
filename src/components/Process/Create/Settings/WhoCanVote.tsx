import {
  Box,
  Button,
  Flex,
  Icon,
  Link,
  NativeSelect,
  RadioCard,
  SimpleGrid,
  Skeleton,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { LuChevronDown, LuCircleAlert, LuCircleCheck, LuUsers } from 'react-icons/lu'
import { Link as ReactRouterLink } from 'react-router'
import { CensusDetail } from '~components/Memberbase/Censuses/CensusDetail'
import { codeChannel, detailsList } from '~components/Memberbase/Censuses/facts'
import { copiedFromUnnamed, everyoneTitle } from '~components/Memberbase/Censuses/labels'
import { Banner } from '~components/ui/Banner'
import { Sheet } from '~components/ui/Sheet'
import { useToast } from '~components/Toast'
import { useDateFns } from '~i18n/use-date-fns'
import { Routes } from '~routes'
import { useUpdateGroupWithReport } from '~src/queries/groups'
import { copySourceName, type TestVote, useTestVote } from '~src/queries/voteGroups'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { ChoosePeopleSheet } from '../census/ChoosePeopleSheet'
import { type PreviousChoice, PreviousVoteSheet } from '../census/PreviousVoteSheet'
import { useCensusAttach } from '../census/useCensusAttach'
import { type CensusFacts, codeChannelsOf } from '../census/useCensusFacts'
import type { Process } from '../common'
import { useEditor } from '../editor-context'
import { useDraftCensus } from '../useDraftCensus'
import { getTwoFaFields } from '../VoterAuthentication/utils'

export type CensusSourceChoice = 'everyone' | 'saved' | 'choose' | 'previous'

type DraftCensus = ReturnType<typeof useDraftCensus>

/** Where a vote's own census came from, in a few words: "Copied from 'Quota pagada' on 2 Oct". */
const useOwnedSource = (census: DraftCensus) => {
  const { t } = useTranslation()
  const { format } = useDateFns()
  const { marker, groups, markers } = census
  const groupsById = useMemo(() => new Map(groups.map((group) => [group.id, group])), [groups])
  if (!marker) return ''
  const date = format(marker.createdAt, 'd MMM')
  if (marker.kind === 'test') return t('process_create.census.source.test', { defaultValue: 'The test vote’s people' })
  const name = marker.source === 'everyone' ? everyoneTitle(t) : copySourceName(marker, { groupsById, markers })
  if (name)
    return date
      ? t('process_create.census.source.copied_on', {
          defaultValue: "Copied from '{{name}}' on {{date}}",
          name,
          date,
        })
      : t('censuses.source.copy_from', { defaultValue: "Copied from '{{name}}'", name })
  return copiedFromUnnamed(t, marker.source)
}

/** The census in a sheet: browse it, check who can sign in and, for the vote's own, add or remove people. */
const CensusSheet = ({
  open,
  onOpenChange,
  census,
  draftId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  census: DraftCensus
  draftId: string | null
}) => {
  const { t } = useTranslation()
  const owned = census.mode === 'owned' && draftId
  const groupId = census.mode === 'pending' ? census.group?.id : census.everyoneId
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      size='xl'
      title={
        owned
          ? t('process_create.census.sheet_title', { defaultValue: 'Census of this vote' })
          : census.mode === 'pending'
            ? (census.group?.title ?? '')
            : everyoneTitle(t)
      }
    >
      {open &&
        (owned ? (
          <CensusDetail kind='vote' processId={draftId} surface='vote_editor' />
        ) : groupId ? (
          <CensusDetail kind='saved' groupId={groupId} />
        ) : null)}
    </Sheet>
  )
}

/**
 * "1,286 voters · 1,231 get their code by email, 55 by SMS · Review census", then "Census ready" once
 * everyone can get a code, or how many can't. Reports `census_configured` once per new setup (who
 * plus how they sign in) as soon as it's been checked.
 */
const CensusLine = ({ census, onReview }: { census: DraftCensus; onReview: () => void }) => {
  const { t, i18n } = useTranslation()
  const { control } = useFormContext<Process>()
  const signIn = useWatch({ control, name: 'census' })
  const { draft } = useEditor()
  const format = (value: number) => value.toLocaleString(i18n.resolvedLanguage)
  const channels = codeChannelsOf(signIn)
  const { breakdown, isLoading } = census.codes
  const total = census.total

  // A draft opened as it was saved isn't a new setup: only what changes from here on is reported
  const existedAtMount = useRef(!!draft?.id)
  const baseline = useRef<string | null | undefined>(undefined)
  const reported = useRef(new Set<string>())
  const signature = JSON.stringify([
    census.mode === 'everyone' ? 'everyone' : census.group?.id,
    [...(signIn?.credentials ?? [])].sort(),
    channels,
  ])
  useEffect(() => {
    if (census.mode === 'loading') return
    if (baseline.current === undefined) baseline.current = existedAtMount.current ? signature : null
    // Nothing to check without a code (details only): reported as soon as there's a sign-in
    const checked = !!breakdown || (channels.length === 0 && !!signIn?.credentials?.length)
    if (!checked || !total || signature === baseline.current || reported.current.has(signature)) return
    reported.current.add(signature)
    const marker = census.marker
    trackAnalyticsEvent({
      name: AnalyticsEvents.CensusConfigured,
      props: {
        source:
          census.mode === 'everyone'
            ? 'everyone'
            : (marker?.source ?? (marker?.kind === 'test' ? 'test' : marker?.fromId ? 'saved' : 'choose')),
        voters: total,
        is_test: marker?.kind === 'test',
        unreachable: breakdown?.unreachable ?? 0,
        auth_fields_count: signIn?.credentials?.length ?? 0,
        two_fa: !!signIn?.use2FA,
        two_fa_method: signIn?.use2FA ? (signIn.use2FAMethod ?? 'none') : 'none',
      },
    })
  }, [census.mode, census.marker, signature, breakdown, total, signIn, channels.length])

  if (!census.totalKnown) return null

  const how = !breakdown
    ? null
    : channels.includes('email') && channels.includes('phone')
      ? t('process_create.census.line.email_sms', {
          defaultValue: '{{email}} get their code by email, {{sms}} by SMS',
          email: format(breakdown.email),
          sms: format(breakdown.sms),
        })
      : channels.includes('phone')
        ? t('process_create.census.line.sms', {
            defaultValue: '{{sms}} get their code by SMS',
            sms: format(breakdown.sms),
          })
        : t('process_create.census.line.email', {
            defaultValue: '{{email}} get their code by email',
            email: format(breakdown.email),
          })

  return (
    <Stack gap={1} fontSize='xs'>
      <Flex gap={1.5} wrap='wrap' align='center' color='fg.muted' fontVariantNumeric='tabular-nums'>
        <Text as='span' fontSize='xs'>
          {t('process_create.census.line.voters', {
            count: total,
            formattedCount: format(total),
            defaultValue_one: '1 voter',
            defaultValue_other: '{{formattedCount}} voters',
          })}
        </Text>
        {how && (
          <>
            <Text as='span' fontSize='xs' aria-hidden>
              ·
            </Text>
            <Text as='span' fontSize='xs'>
              {how}
            </Text>
          </>
        )}
        <Text as='span' fontSize='xs' aria-hidden>
          ·
        </Text>
        <Button
          variant='plain'
          size='xs'
          h='auto'
          p={0}
          minW={0}
          fontSize='xs'
          textDecoration='underline'
          onClick={onReview}
        >
          {t('process_create.census.line.review', { defaultValue: 'Review census' })}
        </Button>
      </Flex>
      {isLoading && channels.length > 0 && (
        <Text fontSize='xs' color='fg.muted'>
          {t('process_create.census.line.checking', { defaultValue: 'Checking who can get a code…' })}
        </Text>
      )}
      {breakdown && breakdown.unreachable > 0 && (
        <Flex gap={1.5} align='flex-start' color='fg.warning'>
          <Icon as={LuCircleAlert} mt={0.5} flexShrink={0} aria-hidden />
          <Text fontSize='xs'>
            {t('process_create.census.line.unreachable', {
              count: breakdown.unreachable,
              formattedCount: format(breakdown.unreachable),
              defaultValue_one: "1 voter can't get a code: no email or mobile for it",
              defaultValue_other: "{{formattedCount}} voters can't get a code: no email or mobile for it",
            })}
          </Text>
        </Flex>
      )}
      {breakdown && breakdown.unreachable === 0 && total > 0 && (
        <Flex gap={1.5} align='center' color='fg.success'>
          <Icon as={LuCircleCheck} flexShrink={0} aria-hidden />
          <Text fontSize='xs' fontWeight='bolder'>
            {t('process_create.census.line.ready', { defaultValue: 'Census ready' })}
          </Text>
        </Flex>
      )}
    </Stack>
  )
}

/**
 * For a vote's own list copied from Everyone ("Edit this list"): how many members aren't in it, the
 * test people left out on purpose aside. They joined after the copy, or were taken out of it. Null
 * when it isn't such a list or the numbers aren't in yet.
 */
export const membersNotInCopy = (
  census: Pick<CensusFacts, 'mode' | 'marker' | 'memberIds' | 'everyone'>,
  testVote: TestVote | null
) => {
  if (census.mode !== 'owned' || census.marker?.source !== 'everyone' || !census.memberIds || !census.everyone)
    return null
  const inList = new Set(census.memberIds)
  const testLeftOut = (testVote?.memberIds ?? []).filter((id) => !inList.has(id)).length
  return Math.max(0, (census.everyone.membersCount ?? 0) - inList.size - testLeftOut)
}

/** How many of the test vote's people are in the census, or 0. */
export const testPeopleIn = (census: Pick<DraftCensus, 'mode' | 'memberIds'>, testVote: TestVote | null) => {
  if (!testVote) return 0
  if (census.mode === 'everyone') return testVote.memberIds.length
  if (census.mode !== 'owned' || !census.memberIds) return 0
  const test = new Set(testVote.memberIds)
  return census.memberIds.filter((id) => test.has(id)).length
}

const TestPeopleWarning = ({
  count,
  canLeaveOut,
  busy,
  onLeaveOut,
}: {
  count: number
  canLeaveOut: boolean
  busy: boolean
  onLeaveOut: () => void
}) => {
  const { t } = useTranslation()
  return (
    <Banner status='warning'>
      <Flex gap={2} align='center' wrap='wrap' fontSize='xs'>
        <Text fontSize='xs'>
          {t('process_create.census.test_people', {
            count,
            defaultValue_one: '1 test person is in your members',
            defaultValue_other: '{{count}} test people are in your members',
          })}
        </Text>
        {canLeaveOut && (
          <Button size='2xs' variant='outline' colorPalette='gray' loading={busy} onClick={onLeaveOut}>
            {t('process_create.census.test_people_leave_out', { defaultValue: 'Leave them out' })}
          </Button>
        )}
      </Flex>
    </Banner>
  )
}

/**
 * Who can vote: Everyone, a copy of a saved census, people chosen by hand, or the same people as a
 * previous vote. Every choice but Everyone gives the vote a census of its own; Everyone stays live
 * until publishing, when it's frozen. Once the vote has its own census, a summary takes the cards'
 * place, with a way to edit it or start over.
 */
export const WhoCanVote = ({
  onStartingOverChange,
  compact = false,
}: {
  /** Told when the admin starts choosing a new census (and when they're done): nothing is chosen meanwhile */
  onStartingOverChange?: (startingOver: boolean) => void
  /**
   * Says who can vote and how they sign in as one sentence, and lists the sources (one per line) only
   * when the admin changes them. Off, the four sources always show as cards.
   */
  compact?: boolean
} = {}) => {
  const { t, i18n } = useTranslation()
  const toast = useToast()
  const format = (value: number) => value.toLocaleString(i18n.resolvedLanguage)
  const { control } = useFormContext<Process>()
  const groupId = useWatch({ control, name: 'groupId' })
  const { draft } = useEditor()
  const draftId = draft?.id ?? null
  const census = useDraftCensus()
  const { attach, chooseEveryone, busy } = useCensusAttach()
  const ownedSource = useOwnedSource(census)
  const testVote = useTestVote()
  const updateGroup = useUpdateGroupWithReport()

  const [startingOver, setStartingOver] = useState(false)
  useEffect(() => {
    onStartingOverChange?.(startingOver)
  }, [startingOver, onStartingOverChange])
  const [picked, setPicked] = useState<CensusSourceChoice | null>(null)
  const [choosing, setChoosing] = useState(false)
  const [previousOpen, setPreviousOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [leavingOut, setLeavingOut] = useState(false)
  // Compact: the sources show only while the admin changes who can vote
  const [browsing, setBrowsing] = useState(false)
  const signIn = useWatch({ control, name: 'census' })

  // The census of this vote's own the next choice replaces (a snapshot from a failed publish too)
  const replacing = census.marker ? groupId : undefined
  const saved = useMemo(
    () =>
      census.groups
        .filter((group) => !group.isAutoGroup && !census.markers.has(group.id))
        .sort((a, b) => a.title.localeCompare(b.title)),
    [census.groups, census.markers]
  )

  const done = (worked: boolean) => {
    if (!worked) return false
    setPicked(null)
    setStartingOver(false)
    setBrowsing(false)
    return true
  }

  // A saved census opened from the Censuses tab, or an older draft that shares one: the vote gets its
  // own copy as soon as it exists (and at publish at the latest)
  const autoCopied = useRef<string | null>(null)
  useEffect(() => {
    if (census.mode !== 'pending' || !draftId || busy || autoCopied.current === groupId) return
    autoCopied.current = groupId
    void attach({ kind: 'saved', groupId, name: census.group?.title ?? '' })
  }, [census.mode, census.group?.title, draftId, busy, groupId, attach])

  if (census.mode === 'loading')
    return (
      <Stack gap={2} aria-busy>
        <Skeleton h={16} borderRadius='md' />
        <Skeleton h={4} w='60%' />
      </Stack>
    )

  const membersCount = census.everyone?.membersCount ?? 0
  if (membersCount === 0 && !saved.length)
    return (
      <Banner status='info'>
        <Text fontSize='xs'>
          {t('process_create.census.no_members', {
            defaultValue: 'Add your members first: then you choose who can vote.',
          })}{' '}
          <Link asChild textDecoration='underline' fontSize='xs'>
            <ReactRouterLink to={Routes.dashboard.memberbase.base}>
              {t('process_create.census.go_to_members', { defaultValue: 'Go to Members' })}
            </ReactRouterLink>
          </Link>
        </Text>
      </Banner>
    )

  const testCount = testVote && testVote.processId !== draftId ? testPeopleIn(census, testVote) : 0
  // Only a census of the vote's own is edited here: Everyone leaves the test people out when it's
  // frozen at publish (see `usePublishCensus`)
  const leaveOut = async () => {
    if (!testVote || census.mode !== 'owned' || !groupId) return
    const test = new Set(testVote.memberIds)
    setLeavingOut(true)
    try {
      await updateGroup.mutateAsync({
        groupId,
        body: { removeMembers: (census.memberIds ?? []).filter((id) => test.has(id)) },
      })
    } catch (error) {
      toast({
        type: 'error',
        title: t('process_create.census.error', { defaultValue: "Who can vote couldn't be changed" }),
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setLeavingOut(false)
    }
  }

  const testWarning =
    testCount > 0 &&
    (census.mode === 'everyone' ? (
      <Banner status='info'>
        <Text fontSize='xs'>
          {t('process_create.census.test_people_left_out', {
            count: testCount,
            defaultValue_one:
              "The test person from your test vote won't be in this vote. Everyone else you add before publishing will.",
            defaultValue_other:
              "The {{count}} test people from your test vote won't be in this vote. Everyone else you add before publishing will.",
          })}
        </Text>
      </Banner>
    ) : (
      <TestPeopleWarning count={testCount} canLeaveOut busy={leavingOut} onLeaveOut={leaveOut} />
    ))
  const sheets = (
    <>
      <ChoosePeopleSheet
        open={choosing}
        onOpenChange={(open) => {
          setChoosing(open)
          if (!open) setPicked(null)
        }}
        busy={busy === 'choose'}
        onConfirm={async (memberIds) => done(await attach({ kind: 'choose', memberIds }, replacing))}
      />
      <PreviousVoteSheet
        open={previousOpen}
        onOpenChange={(open) => {
          setPreviousOpen(open)
          if (!open) setPicked(null)
        }}
        draftId={draftId}
        everyoneId={census.everyoneId}
        groups={census.groups}
        markers={census.markers}
        busy={busy !== null}
        onPick={async (choice: PreviousChoice) => {
          const worked =
            choice.kind === 'everyone'
              ? census.everyoneId
                ? await chooseEveryone(census.everyoneId, replacing)
                : false
              : await attach({ kind: 'previous', groupId: choice.groupId, name: choice.name }, replacing)
          if (done(worked)) setPreviousOpen(false)
        }}
      />
      <CensusSheet open={sheetOpen} onOpenChange={setSheetOpen} census={census} draftId={draftId} />
    </>
  )
  const notInCopy = membersNotInCopy(census, testVote)

  const notInCopyBanner = !!notInCopy && (
    <Banner
      status='warning'
      action={
        <Button size='2xs' variant='outline' colorPalette='gray' onClick={() => setSheetOpen(true)}>
          {t('process_create.census.not_in_copy.review', { defaultValue: 'Review' })}
        </Button>
      }
    >
      <Text fontSize='xs'>
        {t('process_create.census.not_in_copy.text', {
          count: notInCopy,
          formattedCount: format(notInCopy),
          defaultValue_one: "1 member isn't in this list: someone added after you made it, or taken out of it.",
          defaultValue_other:
            "{{formattedCount}} members aren't in this list: people added after you made it, or taken out of it.",
        })}
      </Text>
    </Banner>
  )

  // Compact: who can vote and how they sign in, in one sentence; the who opens the sources
  const sentence = () => {
    // The verb agrees with how many can vote ("puede" / "pueden")
    const whoCount =
      census.mode === 'owned'
        ? census.total
        : census.mode === 'pending' && census.group
          ? (census.group.membersCount ?? 0)
          : membersCount
    const who =
      census.mode === 'owned'
        ? t('process_create.census.owned.count', {
            count: census.total,
            formattedCount: format(census.total),
            defaultValue_one: '1 person',
            defaultValue_other: '{{formattedCount}} people',
          })
        : census.mode === 'pending' && census.group
          ? t('process_create.who.from_saved', {
              count: census.group.membersCount ?? 0,
              formattedCount: format(census.group.membersCount ?? 0),
              name: census.group.title,
              defaultValue_one: "1 person from '{{name}}'",
              defaultValue_other: "{{formattedCount}} people from '{{name}}'",
            })
          : t('process_create.census.everyone.all', {
              count: membersCount,
              formattedCount: format(membersCount),
              defaultValue_one: 'The 1 member of your memberbase',
              defaultValue_other: 'All {{formattedCount}} members of your memberbase',
            })
    const credentials = signIn?.credentials ?? []
    const details = credentials.length ? detailsList(t, i18n.resolvedLanguage, credentials) : undefined
    const channel = signIn?.use2FA ? codeChannel(t, getTwoFaFields(signIn.use2FAMethod)) : undefined
    const bold = { b: <Text as='strong' fontSize='inherit' fontWeight='bolder' /> }
    const how =
      details && channel ? (
        <Trans
          i18nKey='process_create.who.confirm_code'
          defaults='They confirm their <b>{{details}}</b> and get a one-time code by <b>{{channel}}</b>.'
          values={{ details, channel }}
          components={bold}
        />
      ) : details ? (
        <Trans
          i18nKey='process_create.who.confirm'
          defaults='They confirm their <b>{{details}}</b>.'
          values={{ details }}
          components={bold}
        />
      ) : channel ? (
        <Trans
          i18nKey='process_create.who.code_only'
          defaults='They get a one-time code by <b>{{channel}}</b>.'
          values={{ channel }}
          components={bold}
        />
      ) : null
    const hint =
      census.mode === 'owned'
        ? ownedSource
        : census.mode === 'pending'
          ? !draftId
            ? t('process_create.census.saved.created_after_name', {
                defaultValue: 'The new census is created as soon as the vote has a name.',
              })
            : null
          : t('process_create.census.everyone.included', {
              defaultValue:
                'Anyone you add before publishing is included; after that, you add new people to the vote yourself.',
            })
    return (
      <Stack gap={1}>
        <Text fontSize='15px' lineHeight='tall'>
          <Button
            // The handle the e2e suite opens the sources by, whatever the census is called
            data-testid='census-source-change'
            variant='plain'
            h='auto'
            p={0}
            minW={0}
            fontSize='inherit'
            fontWeight='bolder'
            verticalAlign='baseline'
            whiteSpace='normal'
            textAlign='start'
            borderWidth={0}
            borderBottomWidth='1.5px'
            borderStyle='dashed'
            borderColor='fg.muted'
            borderRadius={0}
            aria-label={t('process_create.who.change', { defaultValue: 'Change who can vote: {{who}}', who })}
            onClick={() => (census.mode === 'owned' ? setStartingOver(true) : setBrowsing(true))}
          >
            {who}
            <Icon as={LuChevronDown} boxSize={3.5} />
          </Button>{' '}
          {t('process_create.who.can_vote', {
            count: whoCount,
            defaultValue_one: 'can vote.',
            defaultValue_other: 'can vote.',
          })}
          {how && <> {how}</>}
        </Text>
        {hint && (
          <Text fontSize='xs' color='fg.muted'>
            {hint}
          </Text>
        )}
      </Stack>
    )
  }

  if (compact && census.mode === 'owned' && !startingOver)
    return (
      <Stack gap={2}>
        {sentence()}
        <CensusLine census={census} onReview={() => setSheetOpen(true)} />
        {notInCopyBanner}
        {testWarning}
        {sheets}
      </Stack>
    )

  // The vote has its own census: say what it is, and offer to edit it or choose again
  if (census.mode === 'owned' && !startingOver)
    return (
      <Stack gap={2}>
        <Flex gap={3} p={3} borderWidth='1px' borderColor='border' borderRadius='md' align='flex-start'>
          <Icon as={LuUsers} color='fg.muted' mt={0.5} flexShrink={0} />
          <Box flex='1' minW={0}>
            <Text fontSize='sm' fontWeight='bolder' fontVariantNumeric='tabular-nums'>
              {t('process_create.census.owned.count', {
                count: census.total,
                formattedCount: format(census.total),
                defaultValue_one: '1 person',
                defaultValue_other: '{{formattedCount}} people',
              })}
            </Text>
            <Text fontSize='xs' color='fg.muted'>
              {ownedSource}
            </Text>
            <Flex gap={2} mt={2} wrap='wrap'>
              <Button size='xs' variant='outline' colorPalette='gray' onClick={() => setSheetOpen(true)}>
                {t('process_create.census.owned.edit', { defaultValue: 'Edit census' })}
              </Button>
              <Button size='xs' variant='ghost' colorPalette='gray' onClick={() => setStartingOver(true)}>
                {t('process_create.census.owned.start_over', { defaultValue: 'Start over' })}
              </Button>
            </Flex>
          </Box>
        </Flex>
        <CensusLine census={census} onReview={() => setSheetOpen(true)} />
        {notInCopyBanner}
        {testWarning}
        {sheets}
      </Stack>
    )

  const value: CensusSourceChoice | null =
    picked ??
    (startingOver ? null : census.mode === 'everyone' ? 'everyone' : census.mode === 'pending' ? 'saved' : null)

  const onChoose = async (next: CensusSourceChoice) => {
    if (busy) return
    if (next === 'everyone') {
      if (census.everyoneId) done(await chooseEveryone(census.everyoneId, replacing))
      return
    }
    setPicked(next)
    if (next === 'choose') setChoosing(true)
    if (next === 'previous') setPreviousOpen(true)
  }

  const pendingGroup = census.mode === 'pending' ? census.group : undefined
  const card = (choice: CensusSourceChoice, title: string, description: string, disabled = false) => (
    <RadioCard.Item value={choice} disabled={disabled || (busy !== null && busy !== choice)}>
      <RadioCard.ItemHiddenInput />
      <RadioCard.ItemControl p={2.5}>
        <RadioCard.ItemContent gap={0.5}>
          <RadioCard.ItemText fontSize='sm' fontWeight='bolder'>
            {title}
          </RadioCard.ItemText>
          {/* Compact: one line each, the hint only under the one chosen */}
          {(!compact || value === choice) && (
            <RadioCard.ItemDescription fontSize='xs' color='fg.muted'>
              {description}
            </RadioCard.ItemDescription>
          )}
        </RadioCard.ItemContent>
        {busy === choice ? <Spinner size='xs' flexShrink={0} /> : <RadioCard.ItemIndicator />}
      </RadioCard.ItemControl>
    </RadioCard.Item>
  )

  const listing = !compact || browsing || startingOver || (census.mode !== 'everyone' && census.mode !== 'pending')
  if (!listing)
    return (
      <Stack gap={2}>
        {sentence()}
        <CensusLine census={census} onReview={() => setSheetOpen(true)} />
        {testWarning}
        {sheets}
      </Stack>
    )

  return (
    <Stack gap={2}>
      {census.mode === 'missing' && (
        <Banner status='warning'>
          <Text fontSize='xs'>
            {t('process_create.census.missing', {
              defaultValue: 'The census this draft used was deleted. Choose who can vote again.',
            })}
          </Text>
        </Banner>
      )}
      <RadioCard.Root
        // The hidden radios carry `name`, the structural handle the e2e suite picks these by
        name='censusSource'
        size='sm'
        value={value}
        onValueChange={({ value: next }) => next && onChoose(next as CensusSourceChoice)}
        aria-label={t('process_create.voters.title', { defaultValue: 'Who can vote' })}
      >
        <SimpleGrid columns={compact ? 1 : { base: 1, sm: 2 }} gap={compact ? 1.5 : 2}>
          {card(
            'everyone',
            t('process_create.census.everyone.all', {
              count: membersCount,
              formattedCount: format(membersCount),
              defaultValue_one: 'The 1 member of your memberbase',
              defaultValue_other: 'All {{formattedCount}} members of your memberbase',
            }),
            t('process_create.census.everyone.included', {
              defaultValue:
                'Anyone you add before publishing is included; after that, you add new people to the vote yourself.',
            }),
            !census.everyoneId
          )}
          {card(
            'saved',
            t('process_create.census.saved.title', { defaultValue: 'From a saved census' }),
            t('process_create.census.saved.based_on', { defaultValue: 'A new census is created based on it.' }),
            !saved.length && !pendingGroup
          )}
          {card(
            'choose',
            t('process_create.census.choose.card', { defaultValue: 'Choose people' }),
            t('process_create.census.choose.description', {
              defaultValue: 'Search and tick people.',
            }),
            membersCount === 0
          )}
          {card(
            'previous',
            t('process_create.census.previous.card', { defaultValue: 'Same as a previous vote' }),
            t('process_create.census.previous.description', { defaultValue: 'Copy who could vote in it.' })
          )}
        </SimpleGrid>
      </RadioCard.Root>

      {value === 'saved' && (
        <Stack gap={1}>
          <NativeSelect.Root size='sm' disabled={busy !== null}>
            <NativeSelect.Field
              aria-label={t('process_create.census.saved.select', { defaultValue: 'Saved census' })}
              value={pendingGroup?.id ?? ''}
              onChange={async (event) => {
                const group = saved.find((entry) => entry.id === event.target.value)
                if (group) done(await attach({ kind: 'saved', groupId: group.id, name: group.title }, replacing))
              }}
            >
              <option value='' disabled>
                {t('process_create.census.saved.placeholder', { defaultValue: 'Choose a saved census' })}
              </option>
              {pendingGroup && !saved.some((group) => group.id === pendingGroup.id) && (
                <option value={pendingGroup.id}>{pendingGroup.title}</option>
              )}
              {saved.map((group) => (
                <option key={group.id} value={group.id}>
                  {t('process_create.census.saved.option', {
                    defaultValue: '{{name}} ({{formattedCount}})',
                    name: group.title,
                    formattedCount: format(group.membersCount ?? 0),
                  })}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
          {pendingGroup && !draftId && (
            <Text fontSize='xs' color='fg.muted'>
              {t('process_create.census.saved.created_after_name', {
                defaultValue: 'The new census is created as soon as the vote has a name.',
              })}
            </Text>
          )}
        </Stack>
      )}

      {(startingOver || browsing) && (
        <Button
          variant='plain'
          size='xs'
          alignSelf='flex-start'
          h='auto'
          p={0}
          textDecoration='underline'
          onClick={() => {
            setStartingOver(false)
            setBrowsing(false)
            setPicked(null)
          }}
        >
          {t('process_create.census.keep_current', { defaultValue: 'Keep the current census' })}
        </Button>
      )}

      {!compact && !startingOver && (census.mode === 'everyone' || census.mode === 'pending') && (
        <CensusLine census={census} onReview={() => setSheetOpen(true)} />
      )}
      {!compact && !startingOver && testWarning}
      {sheets}
    </Stack>
  )
}

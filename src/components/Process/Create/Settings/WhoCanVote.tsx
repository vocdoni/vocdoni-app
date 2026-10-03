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
import { useTranslation } from 'react-i18next'
import { LuCircleAlert, LuCircleCheck, LuUsers } from 'react-icons/lu'
import { Link as ReactRouterLink } from 'react-router'
import { CensusDetail } from '~components/Memberbase/Censuses/CensusDetail'
import { copiedFromUnnamed, everyoneTitle } from '~components/Memberbase/Censuses/labels'
import { Banner } from '~components/ui/Banner'
import { ConfirmDialog } from '~components/ui/ConfirmDialog'
import { Sheet } from '~components/ui/Sheet'
import { useToast } from '~components/Toast'
import { useDateFns } from '~i18n/use-date-fns'
import { Routes } from '~routes'
import { useUpdateGroupWithReport } from '~src/queries/groups'
import { MEMBERS_COLLECT_CAP, useMemberIdCollector } from '~src/queries/members'
import { copySourceName, type TestVote, useTestVote } from '~src/queries/voteGroups'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { ChoosePeopleSheet } from '../census/ChoosePeopleSheet'
import { type PreviousChoice, PreviousVoteSheet } from '../census/PreviousVoteSheet'
import { useCensusAttach } from '../census/useCensusAttach'
import { type CensusFacts, codeChannelsOf } from '../census/useCensusFacts'
import type { Process } from '../common'
import { useEditor } from '../editor-context'
import { useDraftCensus } from '../useReadiness'

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
          <CensusDetail kind='vote' processId={draftId} />
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
export const WhoCanVote = () => {
  const { t, i18n } = useTranslation()
  const toast = useToast()
  const format = (value: number) => value.toLocaleString(i18n.resolvedLanguage)
  const { control } = useFormContext<Process>()
  const groupId = useWatch({ control, name: 'groupId' })
  const { draft } = useEditor()
  const draftId = draft?.id ?? null
  const census = useDraftCensus()
  const { attach, chooseEveryone, copyEveryone, busy } = useCensusAttach()
  const ownedSource = useOwnedSource(census)
  const testVote = useTestVote()
  const collector = useMemberIdCollector()
  const updateGroup = useUpdateGroupWithReport()

  const [startingOver, setStartingOver] = useState(false)
  const [picked, setPicked] = useState<CensusSourceChoice | null>(null)
  const [choosing, setChoosing] = useState(false)
  const [previousOpen, setPreviousOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [leavingOut, setLeavingOut] = useState(false)
  const [confirmCopy, setConfirmCopy] = useState(false)

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
  const leaveOut = async () => {
    if (!testVote) return
    const test = new Set(testVote.memberIds)
    setLeavingOut(true)
    try {
      if (census.mode === 'owned' && groupId) {
        await updateGroup.mutateAsync({
          groupId,
          body: { removeMembers: (census.memberIds ?? []).filter((id) => test.has(id)) },
        })
        return
      }
      const { members, capped } = await collector.collect({ max: MEMBERS_COLLECT_CAP })
      if (capped) throw new Error('Too many members to copy here')
      done(
        await attach(
          {
            kind: 'everyone',
            memberIds: members.map((member) => member.id).filter((id) => !test.has(id)),
            name: everyoneTitle(t),
          },
          replacing
        )
      )
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

  const testWarning = testCount > 0 && (
    <TestPeopleWarning
      count={testCount}
      canLeaveOut={census.mode === 'owned' || membersCount <= MEMBERS_COLLECT_CAP}
      busy={leavingOut}
      onLeaveOut={leaveOut}
    />
  )
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
      <ConfirmDialog
        open={confirmCopy}
        onOpenChange={({ open }) => setConfirmCopy(open)}
        title={t('process_create.census.copy_everyone.title', { defaultValue: 'Edit this list?' })}
        description={t('process_create.census.copy_everyone.description', {
          defaultValue:
            "This vote gets its own list with all your members as they are now, and you can add or take out people. From then on, new members won't join it by themselves.",
        })}
        confirmText={t('process_create.census.copy_everyone.confirm', { defaultValue: 'Make its own list' })}
        loading={busy === 'everyone'}
        onConfirm={async () => {
          if (await copyEveryone()) {
            setConfirmCopy(false)
            setSheetOpen(true)
          }
        }}
      />
    </>
  )
  const notInCopy = membersNotInCopy(census, testVote)

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
        {!!notInCopy && (
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
        )}
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
          <RadioCard.ItemDescription fontSize='xs' color='fg.muted'>
            {description}
          </RadioCard.ItemDescription>
        </RadioCard.ItemContent>
        {busy === choice ? <Spinner size='xs' flexShrink={0} /> : <RadioCard.ItemIndicator />}
      </RadioCard.ItemControl>
    </RadioCard.Item>
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
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={2}>
          {card(
            'everyone',
            t('process_create.census.everyone.title', { defaultValue: 'Everyone' }),
            t('process_create.census.everyone.description', {
              count: membersCount,
              formattedCount: format(membersCount),
              defaultValue_one: "Your 1 member. New members join until you publish; then it's frozen.",
              defaultValue_other:
                "All {{formattedCount}} members. New members join until you publish; then it's frozen.",
            }),
            !census.everyoneId
          )}
          {card(
            'saved',
            t('process_create.census.saved.title', { defaultValue: 'From a saved census' }),
            t('process_create.census.saved.description', { defaultValue: 'This vote gets its own copy.' }),
            !saved.length && !pendingGroup
          )}
          {card(
            'choose',
            t('process_create.census.choose.card', { defaultValue: 'Choose people' }),
            t('process_create.census.choose.description', {
              defaultValue: 'Search, tick or paste a list.',
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
              {t('process_create.census.saved.after_name', {
                defaultValue: 'It gets its own copy as soon as the vote has a name.',
              })}
            </Text>
          )}
        </Stack>
      )}

      {startingOver && (
        <Button
          variant='plain'
          size='xs'
          alignSelf='flex-start'
          h='auto'
          p={0}
          textDecoration='underline'
          onClick={() => {
            setStartingOver(false)
            setPicked(null)
          }}
        >
          {t('process_create.census.keep_current', { defaultValue: 'Keep the current census' })}
        </Button>
      )}

      {!startingOver && (census.mode === 'everyone' || census.mode === 'pending') && (
        <CensusLine census={census} onReview={() => setSheetOpen(true)} />
      )}
      {!startingOver && census.mode === 'everyone' && (
        // Everyone itself can't be edited: this gives the vote its own list of everyone, to adjust
        <Button
          size='xs'
          variant='outline'
          colorPalette='gray'
          alignSelf='flex-start'
          disabled={busy !== null}
          onClick={() => setConfirmCopy(true)}
        >
          {t('process_create.census.copy_everyone.button', { defaultValue: 'Edit this list' })}
        </Button>
      )}
      {!startingOver && testWarning}
      {sheets}
    </Stack>
  )
}

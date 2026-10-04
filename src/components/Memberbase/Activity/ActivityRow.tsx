import { Badge, Box, chakra, Flex, Grid, Icon, Text } from '@chakra-ui/react'
import type { TFunction } from 'i18next'
import { ElementType, useId, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  LuChevronDown,
  LuCirclePlay,
  LuCircleStop,
  LuCopy,
  LuDownload,
  LuFlag,
  LuListChecks,
  LuLock,
  LuPencil,
  LuUpload,
  LuUserMinus,
  LuUserPlus,
} from 'react-icons/lu'
import { useDateFns } from '~i18n/use-date-fns'
import { formatChange, type ActivityEvent, type ActivityType, type FormattedChange } from '~src/queries/activity'
import { useMemberFields } from '../fields'
import { CensusChips } from './CensusChip'
import type { CensusFilter, CensusRef } from './censusRefs'

export const ICONS: Record<ActivityType, ElementType> = {
  'member.added': LuUserPlus,
  'member.updated': LuPencil,
  'member.deleted': LuUserMinus,
  'import.started': LuUpload,
  'import.completed': LuUpload,
  'import.failed': LuUpload,
  'group.created': LuListChecks,
  'group.updated': LuListChecks,
  'group.deleted': LuListChecks,
  'census.members_added': LuUserPlus,
  'census.members_removed': LuUserMinus,
  'census.frozen': LuCopy,
  'process.created': LuFlag,
  'process.published': LuFlag,
  'process.started': LuCirclePlay,
  'process.ended': LuCircleStop,
  'activity.exported': LuDownload,
}

const strong = { strong: <chakra.strong fontWeight='bolder' /> }

/**
 * Names and titles come from admins and imported files: escaped before `Trans` reads the sentence for
 * tags (interpolation is unescaped app-wide), then shown as plain text again. Unescaped, a name like
 * `<strong position="fixed" ...>` would render as a real element.
 */
const asText = { tOptions: { interpolation: { escapeValue: true } }, shouldUnescape: true }

/**
 * What happened, as a plain sentence. The census it happened to isn't in it: the row names it in its
 * own column, so a sentence reads the same in the Activity tab and on the census' page.
 */
export const EventSentence = ({ event }: { event: ActivityEvent }) => {
  const { t, i18n } = useTranslation()
  const values = { name: event.subject.label || t('activity.untitled', { defaultValue: 'Untitled' }) }
  const count = event.count ?? 0
  const number = count.toLocaleString(i18n.resolvedLanguage)

  switch (event.type) {
    case 'process.created':
      return t('activity.event.vote_created', { defaultValue: 'Vote created' })
    case 'process.published':
      return t('activity.event.vote_published', { defaultValue: 'Vote published' })
    case 'process.started':
      return t('activity.event.voting_opened', { defaultValue: 'Voting opened' })
    case 'process.ended':
      return t('activity.event.voting_closed', { defaultValue: 'Voting closed' })
    case 'member.added':
      return (
        <Trans
          i18nKey='activity.event.member_added'
          defaults='<strong>{{name}}</strong> added to members'
          values={values}
          components={strong}
          {...asText}
        />
      )
    case 'member.updated':
      return (
        <Trans
          i18nKey='activity.event.member_details_changed'
          defaults="<strong>{{name}}</strong>'s details changed"
          values={values}
          components={strong}
          {...asText}
        />
      )
    case 'member.deleted':
      return (
        <Trans
          i18nKey='activity.event.member_deleted'
          defaults='<strong>{{name}}</strong> deleted from members'
          values={values}
          components={strong}
          {...asText}
        />
      )
    case 'import.started':
    case 'import.completed':
    case 'import.failed':
      if (event.import)
        return t('activity.imports.added', {
          defaultValue_one: '{{added}} of {{total}} member imported',
          defaultValue_other: '{{added}} of {{total}} members imported',
          added: event.import.added.toLocaleString(i18n.resolvedLanguage),
          total: event.import.total.toLocaleString(i18n.resolvedLanguage),
          count: event.import.total,
        })
      return t('activity.event.import', {
        defaultValue_one: '{{number}} member imported',
        defaultValue_other: '{{number}} members imported',
        count,
        number,
      })
    case 'group.created':
      return event.count === undefined
        ? t('activity.event.saved_created', { defaultValue: 'Saved census created' })
        : t('activity.event.saved_created_with', {
            defaultValue_one: 'Saved census created with {{number}} person',
            defaultValue_other: 'Saved census created with {{number}} people',
            count,
            number,
          })
    case 'group.updated':
      return t('activity.event.census_details_changed', { defaultValue: 'Census details changed' })
    case 'group.deleted':
      return (
        <Trans
          i18nKey='activity.event.group_deleted'
          defaults='Census <strong>{{name}}</strong> deleted'
          values={values}
          components={strong}
          {...asText}
        />
      )
    case 'census.members_added':
      return t('activity.event.people_added', {
        defaultValue_one: '{{number}} person added',
        defaultValue_other: '{{number}} people added',
        count,
        number,
      })
    case 'census.members_removed':
      return t('activity.event.people_removed', {
        defaultValue_one: '{{number}} person removed',
        defaultValue_other: '{{number}} people removed',
        count,
        number,
      })
    case 'census.frozen':
      return t('activity.event.census_from_everyone', { defaultValue: 'Census copied from all your members' })
    case 'activity.exported':
      return t('activity.event.exported', { defaultValue: 'Activity exported' })
  }
}

/** Who did it, muted: a person's name, an API key's name with an "API key" tag, or Vocdoni. */
export const ActorLabel = ({ event }: { event: ActivityEvent }) => {
  const { t } = useTranslation()
  const { actor } = event
  if (!actor) return null
  const name = actor.label || (actor.type === 'system' ? t('activity.actor.system', { defaultValue: 'Vocdoni' }) : null)
  if (!name && actor.type !== 'api_key') return null
  return (
    <Text as='span' fontSize='sm' color='fg.muted' display='inline-flex' alignItems='center' gap={1.5}>
      {name}
      {actor.type === 'api_key' && (
        <Badge size='xs' variant='outline' color='fg.muted'>
          {t('activity.actor.api_key', { defaultValue: 'API key' })}
        </Badge>
      )}
    </Text>
  )
}

const ImportStatus = ({ status }: { status: NonNullable<ActivityEvent['import']>['status'] }) => {
  const { t } = useTranslation()
  const [palette, label] =
    status === 'pending'
      ? ['blue', t('activity.imports.status.pending', { defaultValue: 'Importing' })]
      : status === 'failed'
        ? ['red', t('activity.imports.status.failed', { defaultValue: 'Failed' })]
        : ['green', t('activity.imports.status.completed', { defaultValue: 'Done' })]
  return (
    <Badge size='xs' variant='subtle' colorPalette={palette}>
      {label}
    </Badge>
  )
}

const fieldLabel = (t: TFunction, fields: { id: string; label: string }[], field: string) =>
  fields.find((item) => item.id === field)?.label ??
  (field === 'other'
    ? t('activity.field.other', { defaultValue: 'Extra info' })
    : field === 'title'
      ? t('activity.field.title', { defaultValue: 'Name' })
      : t('activity.field.unknown', { defaultValue: 'A detail' }))

/** The changed fields, masked: before → after, or a lock where the value is kept private. */
const ChangeList = ({
  id,
  changes,
  labelOf,
}: {
  id: string
  changes: FormattedChange[]
  labelOf: (field: string) => string
}) => {
  const { t } = useTranslation()
  const empty = t('activity.change.empty', { defaultValue: 'empty' })
  return (
    <Grid
      as='dl'
      id={id}
      templateColumns='minmax(90px, max-content) 1fr'
      columnGap={4}
      rowGap={1}
      mt={2}
      px={3}
      py={2}
      bg='bg.subtle'
      borderRadius='md'
      fontSize='sm'
      className='ph-no-capture'
    >
      {changes.map((change, index) => (
        <Box key={`${change.field}-${index}`} display='contents'>
          <Text as='dt' color='fg.muted'>
            {labelOf(change.field)}
          </Text>
          <Text as='dd' m={0} minW={0}>
            {change.kind === 'changed' ? (
              <Text as='span' color='fg.muted' display='inline-flex' alignItems='center' gap={1}>
                <Icon as={LuLock} boxSize={3} aria-hidden />
                {t('activity.change.hidden', { defaultValue: 'Changed, hidden for privacy' })}
              </Text>
            ) : (
              <>
                <Text as='span' color='fg.muted' textDecoration='line-through'>
                  {change.before ?? empty}
                </Text>
                {' → '}
                <Text as='span'>{change.after ?? empty}</Text>
              </>
            )}
          </Text>
        </Box>
      ))}
    </Grid>
  )
}

type ActivityRowProps = {
  event: ActivityEvent
  /** Show the date with the time: off in the day-grouped timeline, whose heading says the day */
  showDate?: boolean
  /** The censuses it reached, in the right-hand column. Left out where the census is the page itself */
  censuses?: CensusRef[]
  onSelectCensus?: (filter: CensusFilter) => void
}

/**
 * One event, left to right: when, what (a plain sentence) and who, then on the right the census it
 * belongs to. Changed fields open beneath it, masked (see `formatChange`).
 */
export const ActivityRow = ({ event, showDate = false, censuses, onSelectCensus }: ActivityRowProps) => {
  const { t } = useTranslation()
  const { format } = useDateFns()
  const fields = useMemberFields()
  const [open, setOpen] = useState(false)
  const changesId = useId()
  const changes = (event.changes ?? []).map((change) =>
    formatChange(change.field, change.before, change.after, change.redacted)
  )
  const when = event.at ? format(event.at, showDate ? 'PP p' : 'p') : '–'
  // "During voting" is the one coloured flag: a change that reached a vote while it was open. A vote
  // opening is not a change made during voting.
  const duringVoting = !!event.live && !event.type.startsWith('process.')
  const withCensus = !!censuses && !!onSelectCensus
  const hasSide = withCensus || duringVoting

  return (
    <Grid
      as='li'
      listStyleType='none'
      templateColumns={{ base: '20px minmax(0, 1fr)', md: `64px 20px minmax(0, 1fr)${hasSide ? ' auto' : ''}` }}
      templateAreas={{
        base: `"icon main" ". side"`,
        md: `"time icon main${hasSide ? ' side' : ''}"`,
      }}
      columnGap={3}
      rowGap={1.5}
      py={2.5}
      borderBottomWidth='1px'
      borderColor='border.muted'
      _last={{ borderBottomWidth: 0 }}
      alignItems='start'
    >
      <chakra.time
        gridArea='time'
        display={{ base: 'none', md: 'block' }}
        dateTime={event.at ?? undefined}
        fontSize='sm'
        color='fg.muted'
        fontVariantNumeric='tabular-nums'
        lineHeight='1.5rem'
        whiteSpace='nowrap'
      >
        {when}
      </chakra.time>
      <Flex gridArea='icon' h={6} align='center'>
        <Icon as={ICONS[event.type]} boxSize={4} color='fg.muted' aria-hidden />
      </Flex>
      <Box gridArea='main' minW={0}>
        <Flex align='center' columnGap={2} rowGap={0.5} wrap='wrap' minH={6}>
          <Text fontSize='sm' className='ph-no-capture'>
            <EventSentence event={event} />
          </Text>
          {event.test && (
            <Badge size='xs' variant='subtle'>
              {t('activity.test_vote', { defaultValue: 'Test vote' })}
            </Badge>
          )}
          {!!event.import?.problems && (
            <Badge size='xs' variant='outline' color='fg.muted'>
              {t('activity.imports.problems', {
                defaultValue_one: '{{count}} row had problems',
                defaultValue_other: '{{count}} rows had problems',
                count: event.import.problems,
              })}
            </Badge>
          )}
          {event.import && <ImportStatus status={event.import.status} />}
          <ActorLabel event={event} />
          {changes.length > 0 && (
            <chakra.button
              type='button'
              display='inline-flex'
              alignItems='center'
              gap={1}
              fontSize='sm'
              color='fg.muted'
              _hover={{ color: 'fg' }}
              aria-expanded={open}
              aria-controls={changesId}
              onClick={() => setOpen((value) => !value)}
            >
              {open
                ? t('activity.changes_hide', {
                    defaultValue_one: 'Hide {{count}} change',
                    defaultValue_other: 'Hide {{count}} changes',
                    count: changes.length,
                  })
                : t('activity.changes_show', {
                    defaultValue_one: 'Show {{count}} change',
                    defaultValue_other: 'Show {{count}} changes',
                    count: changes.length,
                  })}
              <Icon as={LuChevronDown} boxSize={3} transform={open ? 'rotate(180deg)' : undefined} aria-hidden />
            </chakra.button>
          )}
        </Flex>
        {/* On phones the time sits under the sentence, the chips under that */}
        <Text display={{ base: 'block', md: 'none' }} fontSize='xs' color='fg.muted' fontVariantNumeric='tabular-nums'>
          {when}
        </Text>
        {open && changes.length > 0 && (
          <ChangeList id={changesId} changes={changes} labelOf={(field) => fieldLabel(t, fields, field)} />
        )}
      </Box>
      {hasSide && (
        <Flex gridArea='side' align='center' gap={2} justify={{ base: 'flex-start', md: 'flex-end' }} wrap='wrap'>
          {duringVoting && (
            <Badge size='sm' variant='subtle' colorPalette='yellow'>
              {t('activity.during_voting', { defaultValue: 'During voting' })}
            </Badge>
          )}
          {withCensus && <CensusChips censuses={censuses!} onSelect={onSelectCensus!} />}
        </Flex>
      )}
    </Grid>
  )
}

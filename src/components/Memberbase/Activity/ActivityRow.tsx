import { Badge, Box, chakra, Flex, Icon, Stack, Text } from '@chakra-ui/react'
import type { TFunction } from 'i18next'
import { ElementType, useId, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  LuChevronDown,
  LuCirclePlay,
  LuCircleStop,
  LuDownload,
  LuFlag,
  LuListChecks,
  LuPencil,
  LuSnowflake,
  LuUpload,
  LuUserMinus,
  LuUserPlus,
} from 'react-icons/lu'
import { useDateFns } from '~i18n/use-date-fns'
import { formatChange, type ActivityEvent, type ActivityType, type FormattedChange } from '~src/queries/activity'
import { useMemberFields } from '../fields'

const ICONS: Record<ActivityType, ElementType> = {
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
  'census.frozen': LuSnowflake,
  'process.created': LuFlag,
  'process.published': LuFlag,
  'process.started': LuCirclePlay,
  'process.ended': LuCircleStop,
  'activity.exported': LuDownload,
}

const strong = { strong: <chakra.strong fontWeight='bolder' /> }

/** What happened, as a sentence with its subject in bold. */
const EventSentence = ({ event }: { event: ActivityEvent }) => {
  const { t, i18n } = useTranslation()
  const values = { name: event.subject.label || t('activity.untitled', { defaultValue: 'Untitled' }) }
  const count = event.count ?? 0
  const number = count.toLocaleString(i18n.resolvedLanguage)

  switch (event.type) {
    case 'process.started':
      return (
        <Trans
          i18nKey='activity.event.process_started'
          defaults='<strong>{{name}}</strong> started'
          values={values}
          components={strong}
        />
      )
    case 'process.ended':
      return (
        <Trans
          i18nKey='activity.event.process_ended'
          defaults='<strong>{{name}}</strong> ended'
          values={values}
          components={strong}
        />
      )
    case 'process.created':
      return (
        <Trans
          i18nKey='activity.event.process_created'
          defaults='<strong>{{name}}</strong> created'
          values={values}
          components={strong}
        />
      )
    case 'process.published':
      return (
        <Trans
          i18nKey='activity.event.process_published'
          defaults='<strong>{{name}}</strong> published'
          values={values}
          components={strong}
        />
      )
    case 'member.added':
      return (
        <Trans
          i18nKey='activity.event.member_added'
          defaults='<strong>{{name}}</strong> added to members'
          values={values}
          components={strong}
        />
      )
    case 'member.updated':
      return (
        <Trans
          i18nKey='activity.event.member_updated'
          defaults='<strong>{{name}}</strong> edited'
          values={values}
          components={strong}
        />
      )
    case 'member.deleted':
      return (
        <Trans
          i18nKey='activity.event.member_deleted'
          defaults='<strong>{{name}}</strong> deleted from members'
          values={values}
          components={strong}
        />
      )
    case 'import.started':
    case 'import.completed':
    case 'import.failed':
      return t('activity.event.import', {
        defaultValue_one: '{{number}} member imported',
        defaultValue_other: '{{number}} members imported',
        count,
        number,
      })
    case 'group.created':
      return (
        <Trans
          i18nKey='activity.event.group_created'
          defaults='Census <strong>{{name}}</strong> saved'
          values={values}
          components={strong}
        />
      )
    case 'group.updated':
      return (
        <Trans
          i18nKey='activity.event.group_updated'
          defaults='Census <strong>{{name}}</strong> edited'
          values={values}
          components={strong}
        />
      )
    case 'group.deleted':
      return (
        <Trans
          i18nKey='activity.event.group_deleted'
          defaults='Census <strong>{{name}}</strong> deleted'
          values={values}
          components={strong}
        />
      )
    case 'census.members_added':
      return t('activity.event.census_members_added', {
        defaultValue_one: "{{number}} person added to '{{name}}'",
        defaultValue_other: "{{number}} people added to '{{name}}'",
        count,
        number,
        name: values.name,
      })
    case 'census.members_removed':
      return t('activity.event.census_members_removed', {
        defaultValue_one: "{{number}} person removed from '{{name}}'",
        defaultValue_other: "{{number}} people removed from '{{name}}'",
        count,
        number,
        name: values.name,
      })
    case 'census.frozen':
      return (
        <Trans
          i18nKey='activity.event.census_frozen'
          defaults='Census of <strong>{{name}}</strong> frozen at publish'
          values={values}
          components={strong}
        />
      )
    case 'activity.exported':
      return t('activity.event.exported', { defaultValue: 'Activity exported' })
  }
}

const actorLabel = (t: TFunction, event: ActivityEvent) => {
  const { actor } = event
  if (!actor) return null
  if (actor.label) return actor.label
  if (actor.type === 'api_key') return t('activity.actor.api_key', { defaultValue: 'API key' })
  if (actor.type === 'system') return t('activity.actor.system', { defaultValue: 'Vocdoni' })
  return null
}

const ChangeLine = ({ change, label }: { change: FormattedChange; label: string }) => {
  const { t } = useTranslation()
  const empty = t('activity.change.empty', { defaultValue: 'empty' })

  return (
    <Text as='li' fontSize='sm' color='fg.muted'>
      {change.kind === 'changed'
        ? t('activity.change.changed', { defaultValue: '{{field}} changed', field: label })
        : t('activity.change.values', {
            defaultValue: '{{field}}: {{before}} → {{after}}',
            field: label,
            before: change.before ?? empty,
            after: change.after ?? empty,
          })}
    </Text>
  )
}

/**
 * One event: an icon, a sentence, who did it and when. When it changed fields, they open beneath it,
 * masked (see `formatChange`).
 */
export const ActivityRow = ({ event, showDate = false }: { event: ActivityEvent; showDate?: boolean }) => {
  const { t } = useTranslation()
  const { format } = useDateFns()
  const fields = useMemberFields()
  const [open, setOpen] = useState(false)
  const changesId = useId()
  const changes = (event.changes ?? []).map((change) =>
    formatChange(change.field, change.before, change.after, change.redacted)
  )
  const labelOf = (field: string) =>
    fields.find((item) => item.id === field)?.label ??
    (field === 'other'
      ? t('activity.field.other', { defaultValue: 'Extra info' })
      : field === 'title'
        ? t('activity.field.title', { defaultValue: 'Name' })
        : t('activity.field.unknown', { defaultValue: 'A detail' }))
  const who = actorLabel(t, event)
  const when = event.at ? format(event.at, showDate ? 'PP p' : 'p') : undefined

  return (
    <Box as='li' listStyleType='none'>
      <Flex align='center' gap={3} minH='40px' py={1}>
        <Icon as={ICONS[event.type]} boxSize={4} color='fg.muted' flexShrink={0} aria-hidden />
        <Text fontSize='sm' flex='1' minW={0} className='ph-no-capture'>
          <EventSentence event={event} />
          {event.test && (
            <Badge size='xs' variant='subtle' ms={2}>
              {t('activity.test_vote', { defaultValue: 'Test vote' })}
            </Badge>
          )}
          {who && (
            <Text as='span' fontSize='sm' color='fg.muted'>
              {' · '}
              {t('activity.by', { defaultValue: 'by {{who}}', who })}
            </Text>
          )}
        </Text>
        {changes.length > 0 && (
          <chakra.button
            type='button'
            display='inline-flex'
            alignItems='center'
            gap={1}
            fontSize='xs'
            color='fg.muted'
            _hover={{ color: 'fg' }}
            aria-expanded={open}
            aria-controls={changesId}
            onClick={() => setOpen((value) => !value)}
          >
            {t('activity.changes', {
              defaultValue_one: '{{count}} change',
              defaultValue_other: '{{count}} changes',
              count: changes.length,
            })}
            <Icon as={LuChevronDown} boxSize={3} transform={open ? 'rotate(180deg)' : undefined} />
          </chakra.button>
        )}
        {when && (
          <chakra.time
            dateTime={event.at!}
            fontSize='xs'
            color='fg.muted'
            fontVariantNumeric='tabular-nums'
            flexShrink={0}
          >
            {when}
          </chakra.time>
        )}
      </Flex>
      {open && changes.length > 0 && (
        <Stack as='ul' id={changesId} gap={0.5} ps={7} pb={2} m={0} className='ph-no-capture'>
          {changes.map((change, index) => (
            <ChangeLine key={`${change.field}-${index}`} change={change} label={labelOf(change.field)} />
          ))}
        </Stack>
      )}
    </Box>
  )
}

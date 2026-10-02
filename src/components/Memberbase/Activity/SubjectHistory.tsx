import { Box, Skeleton, Stack, Text } from '@chakra-ui/react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { SectionCard } from '~components/ui/SectionCard'
import { useAppEnv } from '~src/app-env'
import { sortEvents, useActivity, type ActivityQuery } from '~src/queries/activity'
import { ActivityRow } from './ActivityRow'

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

/**
 * A census's history: who added or removed people, and when. Only with the activity log
 * (AppEnv `ACTIVITY_LOG`); without it there's nothing to show, so it renders nothing.
 */
export const CensusHistory = ({ groupId, processId }: { groupId?: string; processId?: string }) => {
  const { t } = useTranslation()
  const { ACTIVITY_LOG } = useAppEnv()
  if (!ACTIVITY_LOG || (!groupId && !processId)) return null
  return (
    <SectionCard>
      <HistoryList
        title={t('activity.history.census_title', { defaultValue: 'History' })}
        query={{ subjectType: 'census', subjectId: groupId, processId }}
      />
    </SectionCard>
  )
}

/** A person's history: their edits, masked. Only with the activity log, like `CensusHistory`. */
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

import { Box, Flex, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useDateFns } from '~i18n/use-date-fns'
import { groupByDay, type ActivityEvent } from '~src/queries/activity'
import { ActivityRow } from './ActivityRow'
import { censusesOf, type CensusDirectory, type CensusFilter } from './censusRefs'

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

const DayHeading = ({ children, aside }: { children: ReactNode; aside?: ReactNode }) => (
  <Flex
    as='h3'
    position='sticky'
    top={0}
    zIndex={1}
    bg='bg'
    py={1.5}
    justify='space-between'
    gap={3}
    fontSize='xs'
    fontWeight='bolder'
    color='fg.muted'
    borderBottom='1px solid'
    borderColor='border.muted'
  >
    {/* Only the first letter: capitalizing every word gives "28 De Setembre" in ca/es */}
    <Text as='span' fontSize='inherit' _firstLetter={{ textTransform: 'uppercase' }}>
      {children}
    </Text>
    {aside && (
      <Text as='span' fontSize='inherit' fontWeight='normal'>
        {aside}
      </Text>
    )}
  </Flex>
)

type ActivityTimelineProps = {
  events: ActivityEvent[]
  /** Name each event's census in a column on the right, clicking one to filter by it */
  directory?: CensusDirectory
  onSelectCensus?: (filter: CensusFilter) => void
}

/**
 * Events by day, newest first, under sticky day headings. Events with no date yet (imports, until
 * jobs carry one) come last, under their own heading.
 */
export const ActivityTimeline = ({ events, directory, onSelectCensus }: ActivityTimelineProps) => {
  const { t } = useTranslation()
  const { format } = useDateFns()
  const today = new Date()
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
  const undated = events.filter((event) => !event.at)

  const dayLabel = (date: Date) => {
    const full = format(date, 'PPPP')
    if (sameDay(date, today)) return t('activity.day.today', { defaultValue: 'Today · {{date}}', date: full })
    if (sameDay(date, yesterday))
      return t('activity.day.yesterday', { defaultValue: 'Yesterday · {{date}}', date: full })
    return full
  }

  const row = (event: ActivityEvent) => (
    <ActivityRow
      key={event.id}
      event={event}
      censuses={directory ? censusesOf(event, directory) : undefined}
      onSelectCensus={onSelectCensus}
    />
  )

  return (
    <Stack gap={3}>
      {groupByDay(events).map(({ day, date, events: items }) => (
        <Box as='section' key={day} aria-label={dayLabel(date)}>
          <DayHeading>{dayLabel(date)}</DayHeading>
          <Box as='ul' m={0} p={0}>
            {items.map(row)}
          </Box>
        </Box>
      ))}
      {!!undated.length && (
        <Box as='section' aria-label={t('activity.day.undated', { defaultValue: 'Date not recorded yet' })}>
          {/* Imports carry no date until the backend sends one (ticket T7a) */}
          <DayHeading aside={t('activity.day.undated_hint', { defaultValue: 'Imports get a date soon' })}>
            {t('activity.day.undated', { defaultValue: 'Date not recorded yet' })}
          </DayHeading>
          <Box as='ul' m={0} p={0}>
            {undated.map(row)}
          </Box>
        </Box>
      )}
    </Stack>
  )
}

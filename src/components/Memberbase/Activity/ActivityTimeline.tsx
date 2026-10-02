import { Box, Stack, Text } from '@chakra-ui/react'
import { useDateFns } from '~i18n/use-date-fns'
import { groupByDay, type ActivityEvent } from '~src/queries/activity'
import { ActivityRow } from './ActivityRow'

/** Dated events by day, newest first, under sticky day headings. */
export const ActivityTimeline = ({ events }: { events: ActivityEvent[] }) => {
  const { format } = useDateFns()

  return (
    <Stack gap={2}>
      {groupByDay(events).map(({ day, date, events: items }) => (
        <Box as='section' key={day} aria-label={format(date, 'PPPP')}>
          <Text
            as='h3'
            position='sticky'
            top={0}
            zIndex={1}
            bg='bg'
            py={1}
            fontSize='xs'
            fontWeight='bolder'
            color='fg.muted'
            textTransform='capitalize'
            borderBottom='1px solid'
            borderColor='border.muted'
          >
            {format(date, 'PPPP')}
          </Text>
          <Box as='ul' m={0} p={0}>
            {items.map((event) => (
              <ActivityRow key={event.id} event={event} />
            ))}
          </Box>
        </Box>
      ))}
    </Stack>
  )
}

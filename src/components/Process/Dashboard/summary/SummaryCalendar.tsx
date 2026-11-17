import { Box, Card, Flex, Text } from '@chakra-ui/react'
import { isBeforeStart } from '@vocdoni/api-client'
import { useId, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { SummaryCardHeader } from './SummaryCardHeader'
import type { SummaryModel } from './use-summary-model'

type CalendarEntry = { id: string; day: Date; what: string; note?: string; current?: boolean }

const DAY: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric' }
const TIME: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }

/**
 * The all-at-once vote's calendar: when it opens, today (paused, if it is), and when it closes and everyone sees the
 * results, or when it ended. The board's convocation, quorum and votes-today entries have no backend data.
 */
export const SummaryCalendar = ({ model }: { model: SummaryModel }) => {
  const { t, i18n } = useTranslation()
  const titleId = useId()
  const { election, state, endDate, now } = model

  const entries = useMemo(() => {
    const time = new Intl.DateTimeFormat(i18n.language, TIME)
    const at = (date: Date) => t('votes.summary.calendar.at', { defaultValue: 'At {{time}}.', time: time.format(date) })
    const list: CalendarEntry[] = []
    const start = election.startDate ? new Date(election.startDate) : undefined
    if (start && !isNaN(start.getTime())) {
      list.push({
        id: 'start',
        day: start,
        what: isBeforeStart(start, now)
          ? t('votes.summary.calendar.opens', { defaultValue: 'Vote opens' })
          : t('votes.summary.calendar.opened', { defaultValue: 'Vote opened' }),
        note: at(start),
      })
    }
    if (state === 'live' || state === 'paused') {
      list.push(
        state === 'paused'
          ? {
              id: 'today',
              day: now,
              what: t('votes.summary.calendar.today_paused', { defaultValue: 'Today. Vote paused' }),
              note: t('votes.summary.calendar.today_paused_note', {
                defaultValue: 'Nobody can vote until you resume it.',
              }),
              current: true,
            }
          : { id: 'today', day: now, what: t('votes.summary.calendar.today', { defaultValue: 'Today' }), current: true }
      )
    }
    if (endDate && state === 'closed') {
      list.push({
        id: 'ended',
        day: endDate,
        what: t('votes.summary.calendar.ended', { defaultValue: 'Vote ended' }),
        note: at(endDate),
        current: true,
      })
    } else if (endDate && state !== 'canceled') {
      list.push({
        id: 'close',
        day: endDate,
        what: t('votes.summary.calendar.close', { defaultValue: 'Closing and results for everyone' }),
        note: at(endDate),
      })
    }
    return list
  }, [t, i18n.language, election.startDate, state, endDate, now])

  if (!entries.length) return null
  const day = new Intl.DateTimeFormat(i18n.language, DAY)

  return (
    <Card.Root variant='frame' as='section' aria-labelledby={titleId}>
      <SummaryCardHeader id={titleId} title={t('votes.summary.calendar.title', { defaultValue: 'Calendar' })} desktop />
      <Card.Body as='ol' pt='2' pb='2.5' gap='0'>
        {entries.map((entry) => (
          <Flex as='li' key={entry.id} gap='3' py='1.5' aria-current={entry.current ? 'step' : undefined}>
            <Text
              as='span'
              textStyle='figure'
              w='10'
              flexShrink='0'
              pt='0.5'
              color={entry.current ? 'fg' : 'fg.subtle'}
              fontWeight={entry.current ? 'medium' : 'normal'}
            >
              {day.format(entry.day)}
            </Text>
            {/* A filled accent dot for where the vote is now, a hollow mark for the rest. */}
            <Box
              aria-hidden
              flexShrink='0'
              boxSize='dot'
              mt='2'
              borderRadius='full'
              bg={entry.current ? 'accent.solid' : 'transparent'}
              borderWidth={entry.current ? '[0]' : 'mark'}
              borderColor='fg.faint'
            />
            <Box minW='0'>
              <Text fontWeight={entry.current ? 'medium-plus' : 'medium'}>{entry.what}</Text>
              {entry.note && (
                <Text textStyle='body-sm' color='fg.subtle'>
                  {entry.note}
                </Text>
              )}
            </Box>
          </Flex>
        ))}
      </Card.Body>
    </Card.Root>
  )
}

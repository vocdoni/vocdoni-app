import { Box, Card, Flex, Text } from '@chakra-ui/react'
import { isBeforeStart } from '@vocdoni/api-client'
import { useId, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { SummaryCardHeader } from './SummaryCardHeader'
import type { SummaryModel } from './use-summary-model'

type CalendarEntry = { id: string; day: Date; what: string; note?: string; current?: boolean }

// Day and month in figures ("12/03") in every language: a weekday and a day alone do not say which month.
const dayMonth = (date: Date) =>
  `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`
const TIME: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }

/**
 * The all-at-once vote's calendar, newest first: when it closes and everyone sees the results (or how it ended),
 * today (paused, if it is) and when it opens, joined by a thread from mark to mark. The board's convocation, quorum
 * and votes-today entries have no backend data.
 */
export const SummaryCalendar = ({ model, desktop }: { model: SummaryModel; desktop: boolean }) => {
  const { t, i18n } = useTranslation()
  const titleId = useId()
  const { election, state, endDate, endedEarly, now } = model

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
        // What a pause means is the banner's to say, once.
        state === 'paused'
          ? {
              id: 'today',
              day: now,
              what: t('votes.summary.calendar.today_paused', { defaultValue: 'Today. Vote paused' }),
              current: true,
            }
          : { id: 'today', day: now, what: t('votes.summary.calendar.today', { defaultValue: 'Today' }), current: true }
      )
    }
    if (endDate && state === 'closed') {
      list.push({
        id: 'ended',
        day: endDate,
        // Stopping before the schedule and the schedule closing it read differently.
        what: endedEarly
          ? t('votes.summary.calendar.ended_manual', { defaultValue: 'Ended manually' })
          : t('votes.summary.calendar.ended_auto', { defaultValue: 'Closed automatically at the deadline' }),
        note: at(endDate),
        current: true,
      })
    } else if (endDate && state !== 'canceled') {
      list.push({
        id: 'close',
        day: endDate,
        what: t('votes.summary.calendar.close', { defaultValue: 'Automatic closing and results for everyone' }),
        note: at(endDate),
      })
    }
    // Newest first: what comes next (or how it ended) on top, the opening at the bottom.
    return list.reverse()
  }, [t, i18n.language, election.startDate, state, endDate, endedEarly, now])

  if (!entries.length) return null

  return (
    <Card.Root variant='frame' as='section' aria-labelledby={titleId}>
      <SummaryCardHeader
        id={titleId}
        title={t('votes.summary.calendar.title', { defaultValue: 'Calendar' })}
        desktop={desktop}
      />
      <Card.Body as='ol' pt={{ base: '0', lg: '2' }} pb='2.5' gap='0' borderTopWidth={{ base: '[0]', lg: 'hairline' }}>
        {entries.map((entry, index) => (
          <Flex
            as='li'
            key={entry.id}
            gap='3'
            py={{ base: '2', lg: '1.5' }}
            aria-current={entry.current ? 'step' : undefined}
          >
            <Text
              as='span'
              textStyle='figure'
              w={{ base: '11', lg: '10' }}
              flexShrink='0'
              pt={{ base: '1', lg: '0.5' }}
              color={entry.current ? 'fg' : 'fg.subtle'}
              fontWeight={entry.current ? 'medium' : 'normal'}
            >
              {dayMonth(entry.day)}
            </Text>
            {/* A filled accent dot for where the vote is now, a hollow mark for the rest, and under each but the last
                the thread that runs down to the next mark, through the rows' padding. */}
            <Flex
              aria-hidden
              direction='column'
              align='center'
              gap='1'
              flexShrink='0'
              w='[calc({sizes.dot} + {spacing.0.5})]'
              pt={{ base: '2', lg: '1.5' }}
            >
              <Box
                boxSize='dot'
                flexShrink='0'
                borderRadius='full'
                bg={entry.current ? 'accent.solid' : 'transparent'}
                borderWidth={entry.current ? '[0]' : 'mark'}
                borderColor='fg.faint'
              />
              {index < entries.length - 1 && (
                <Box
                  flex='1'
                  borderInlineStartWidth='hairline'
                  borderColor='border.emphasized'
                  mb={{ base: '-5', lg: '-4' }}
                />
              )}
            </Flex>
            <Box minW='0'>
              <Text fontSize={{ base: 'item', lg: 'md' }} fontWeight={entry.current ? 'medium-plus' : 'medium'}>
                {entry.what}
              </Text>
              {entry.note && (
                <Text textStyle={{ base: 'body', lg: 'body-sm' }} color='fg.subtle'>
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

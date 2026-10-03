import { Badge, Box, Flex, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { SectionCard } from '~components/ui/SectionCard'
import { useDateFns } from '~i18n/use-date-fns'
import type { ActivityEvent } from '~src/queries/activity'

const StatusBadge = ({ status }: { status: NonNullable<ActivityEvent['import']>['status'] }) => {
  const { t } = useTranslation()
  if (status === 'pending')
    return (
      <Badge size='sm' colorPalette='blue'>
        {t('activity.imports.status.pending', { defaultValue: 'Importing' })}
      </Badge>
    )
  if (status === 'failed')
    return (
      <Badge size='sm' colorPalette='red'>
        {t('activity.imports.status.failed', { defaultValue: 'Failed' })}
      </Badge>
    )
  return (
    <Badge size='sm' colorPalette='green'>
      {t('activity.imports.status.completed', { defaultValue: 'Done' })}
    </Badge>
  )
}

/**
 * The latest member imports: how many people each one brought in and how many rows had problems
 * (counts only: the rows themselves hold emails and phones). Dated once jobs say when.
 */
export const RecentImports = ({ imports }: { imports: ActivityEvent[] }) => {
  const { t, i18n } = useTranslation()
  const { format } = useDateFns()
  const number = (value: number) => value.toLocaleString(i18n.resolvedLanguage)

  return (
    <SectionCard title={t('activity.imports.title', { defaultValue: 'Recent imports' })}>
      <Box as='ul' m={0} p={0}>
        {imports.map((event) => {
          const summary = event.import!
          return (
            <Flex
              as='li'
              key={event.id}
              listStyleType='none'
              align='center'
              wrap='wrap'
              columnGap={3}
              rowGap={1}
              minH='40px'
              py={1}
            >
              <Text fontSize='sm' flex={{ base: '1 1 100%', sm: '1' }} minW={0} fontVariantNumeric='tabular-nums'>
                {t('activity.imports.added', {
                  defaultValue_one: '{{added}} of {{total}} member imported',
                  defaultValue_other: '{{added}} of {{total}} members imported',
                  added: number(summary.added),
                  total: number(summary.total),
                  count: summary.total,
                })}
                {summary.problems > 0 && (
                  <Text as='span' fontSize='sm' color='fg.muted'>
                    {' · '}
                    {t('activity.imports.problems', {
                      defaultValue_one: '{{count}} row had problems',
                      defaultValue_other: '{{count}} rows had problems',
                      count: summary.problems,
                    })}
                  </Text>
                )}
              </Text>
              <Text as='span' fontSize='xs' color='fg.muted' fontVariantNumeric='tabular-nums' flexShrink={0}>
                {/* Imports carry no date until the backend sends one (ticket T7a) */}
                {event.at
                  ? format(event.at, 'PP p')
                  : t('activity.imports.no_date', { defaultValue: 'Date not shown yet' })}
              </Text>
              <StatusBadge status={summary.status} />
            </Flex>
          )
        })}
      </Box>
    </SectionCard>
  )
}

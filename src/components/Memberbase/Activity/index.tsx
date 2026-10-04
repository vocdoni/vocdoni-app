import { Box, Button, Flex, Icon, Skeleton, Stack, Text } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuDownload, LuHistory, LuInfo } from 'react-icons/lu'
import { useSearchParams } from 'react-router'
import { useToast } from '~components/Toast'
import { Banner } from '~components/ui/Banner'
import { InterestButton, SoonTag } from '~components/ui/ComingSoon'
import { FilterPills, type FilterPillItem } from '~components/ui/FilterPills'
import { SectionCard } from '~components/ui/SectionCard'
import {
  type ActivityCategory,
  type ActivityQuery,
  categoryOf,
  useActivity,
  useActivityAvailable,
  useActivityExport,
} from '~src/queries/activity'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { downloadBlob } from '~utils/download'
import { ActivityTimeline } from './ActivityTimeline'
import { CensusPicker } from './CensusPicker'
import { CENSUS_PARAM, type CensusFilter, matchesCensus, useCensusDirectory } from './censusRefs'

type Kind = ActivityCategory | 'all'

/** The kind pills, in the order an admin thinks of them. */
const KINDS: ActivityCategory[] = ['member', 'census', 'process', 'import']

const useTrackViewed = (ready: boolean, source: string) => {
  const tracked = useRef(false)
  useEffect(() => {
    if (!ready || tracked.current) return
    tracked.current = true
    trackAnalyticsEvent({ name: AnalyticsEvents.ActivityViewed, props: { source } })
  }, [ready, source])
}

const Loading = () => (
  <Stack gap={3} aria-busy>
    <Skeleton h='40px' />
    <Skeleton h='40px' />
    <Skeleton h='40px' w='70%' />
  </Stack>
)

const Empty = ({ onShowAll }: { onShowAll?: () => void }) => {
  const { t } = useTranslation()
  return (
    <Flex direction='column' align='center' gap={2} py={8} textAlign='center'>
      <Icon as={LuHistory} boxSize={6} color='fg.muted' />
      <Text fontSize='sm' color='fg.muted'>
        {onShowAll
          ? t('activity.empty_filtered', { defaultValue: 'Nothing recorded here yet.' })
          : t('activity.empty', { defaultValue: 'Nothing here yet. Imports and votes appear as they happen.' })}
      </Text>
      {onShowAll && (
        <Button size='sm' variant='ghost' onClick={onShowAll}>
          {t('activity.show_everything', { defaultValue: 'Show everything' })}
        </Button>
      )}
    </Flex>
  )
}

/** Today's tab, before the activity log: one quiet line on what's missing, instead of a banner and a card. */
const SoonLine = () => {
  const { t } = useTranslation()
  return (
    <Flex
      align={{ base: 'flex-start', sm: 'center' }}
      direction={{ base: 'column', sm: 'row' }}
      gap={3}
      px={3}
      py={2}
      mb={3}
      borderRadius='md'
      bg='purple.subtle'
    >
      <Flex align='center' gap={2} flex='1' minW={0}>
        <Icon as={LuInfo} boxSize={4} color='purple.fg' flexShrink={0} aria-hidden />
        <Text fontSize='sm' color='purple.fg'>
          {t('activity.soon_line', {
            defaultValue:
              'For now this shows votes and imports. Edits to people and censuses, with who made them, are coming.',
          })}{' '}
          <SoonTag />
        </Text>
      </Flex>
      <InterestButton feature='activity_log' surface='members_activity' flexShrink={0} />
    </Flex>
  )
}

/** The census filter as the activity log reads it: a vote's census by its vote, a saved one by its id. */
const censusQuery = (census: CensusFilter): Pick<ActivityQuery, 'processId' | 'subjectId'> => {
  if (census.startsWith('vote:')) return { processId: census.slice(5) }
  if (census.startsWith('saved:')) return { subjectId: census.slice(6) }
  return {}
}

/**
 * The Members section's Activity tab: one timeline, by day, each change tagged with the census it
 * belongs to. Filter by census (or click a census' chip) to read that census' history, and by kind.
 *
 * With AppEnv `ACTIVITY_LOG` on, it reads the backend's log a page at a time and exports it; until
 * then, the same timeline shows what can be derived (vote dates and imports) under one Soon line.
 */
export const ActivityTab = () => {
  const { t } = useTranslation()
  const toast = useToast()
  const { full } = useActivityAvailable()
  const [params, setParams] = useSearchParams()
  const census: CensusFilter = params.get(CENSUS_PARAM) || 'all'
  const [kind, setKind] = useState<Kind>('all')
  const [page, setPage] = useState(1)
  const [exporting, setExporting] = useState(false)
  const { directory } = useCensusDirectory()

  const category = kind === 'all' ? undefined : kind
  // The log filters on the server; derived events are all here already, and filtered below
  const activity = useActivity(full ? { category, page, ...censusQuery(census) } : {})
  const exportActivity = useActivityExport()
  useTrackViewed(!activity.isLoading, full ? 'log' : 'derived')

  const inCensus = activity.events.filter((event) => matchesCensus(event, census, directory))
  const events = full ? inCensus : inCensus.filter((event) => kind === 'all' || categoryOf(event.type) === kind)

  const setCensus = (value: CensusFilter) => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (value === 'all') next.delete(CENSUS_PARAM)
        else next.set(CENSUS_PARAM, value)
        return next
      },
      { replace: true }
    )
    setPage(1)
  }

  const labels: Record<ActivityCategory, string> = {
    member: t('activity.filter.people', { defaultValue: 'People' }),
    census: t('activity.filter.census_changes', { defaultValue: 'Census changes' }),
    process: t('activity.filter.votes', { defaultValue: 'Votes' }),
    import: t('activity.filter.imports', { defaultValue: 'Imports' }),
  }
  // Today only votes and imports exist: a pill that could never show anything is left out
  const present = new Set(activity.events.map((event) => categoryOf(event.type)))
  const kinds = full ? KINDS : KINDS.filter((value) => present.has(value) || value === kind)
  const items: FilterPillItem<Kind>[] = [
    { value: 'all', label: t('activity.filter.everything', { defaultValue: 'Everything' }) },
    ...kinds.map((value) => ({ value, label: labels[value] })),
  ]

  const download = async () => {
    setExporting(true)
    try {
      const blob = await exportActivity({ category, ...censusQuery(census) })
      downloadBlob(blob, 'activity.csv')
      trackAnalyticsEvent({ name: AnalyticsEvents.ActivityExported, props: { filter: kind } })
    } catch (error) {
      toast({
        title: t('activity.export_error', { defaultValue: "We couldn't export the activity" }),
        description: error instanceof Error ? error.message : undefined,
        type: 'error',
      })
    } finally {
      setExporting(false)
    }
  }

  const filtered = census !== 'all' || kind !== 'all'

  return (
    <Stack gap={4}>
      <Flex justify='space-between' align='center' gap={3} wrap='wrap'>
        <Flex align='center' gap={3} wrap='wrap' minW={0} flex='1'>
          <Box flexBasis={{ base: '100%', sm: 'auto' }}>
            <CensusPicker directory={directory} value={census} onChange={setCensus} />
          </Box>
          {items.length > 1 && (
            <Box maxW='full' overflowX='auto'>
              <FilterPills
                items={items}
                current={kind}
                label={t('activity.filter.label', { defaultValue: 'Filter activity' })}
                onSelect={(value) => {
                  setKind(value)
                  setPage(1)
                }}
              />
            </Box>
          )}
        </Flex>
        {full && (
          <Button size='sm' variant='outline' onClick={download} loading={exporting}>
            <Icon as={LuDownload} />
            {t('activity.export', { defaultValue: 'Export CSV' })}
          </Button>
        )}
      </Flex>
      <SectionCard>
        {!full && <SoonLine />}
        {activity.isLoading ? (
          <Loading />
        ) : activity.isError ? (
          <Banner status='error'>
            {t('activity.error', { defaultValue: "We couldn't load the activity. Try again in a moment." })}
          </Banner>
        ) : events.length ? (
          <ActivityTimeline events={events} directory={directory} onSelectCensus={setCensus} />
        ) : (
          <Empty
            onShowAll={
              filtered
                ? () => {
                    setKind('all')
                    setCensus('all')
                  }
                : undefined
            }
          />
        )}
        {full && (page > 1 || !!activity.pagination?.nextPage) && (
          <Flex justify='space-between' mt={3}>
            <Button size='sm' variant='ghost' disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
              {t('activity.newer', { defaultValue: 'Newer' })}
            </Button>
            <Button
              size='sm'
              variant='ghost'
              disabled={!activity.pagination?.nextPage}
              onClick={() => setPage((value) => value + 1)}
            >
              {t('activity.older', { defaultValue: 'Older' })}
            </Button>
          </Flex>
        )}
      </SectionCard>
    </Stack>
  )
}

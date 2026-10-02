import { Button, Flex, Icon, Skeleton, Stack, Text } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuDownload, LuHistory } from 'react-icons/lu'
import { generatePath, Navigate } from 'react-router'
import { useToast } from '~components/Toast'
import { Banner } from '~components/ui/Banner'
import { ComingSoonCard } from '~components/ui/ComingSoonCard'
import { FilterPills, type FilterPillItem } from '~components/ui/FilterPills'
import { SectionCard } from '~components/ui/SectionCard'
import { Routes } from '~routes'
import {
  ACTIVITY_CATEGORIES,
  type ActivityCategory,
  useActivity,
  useActivityAvailable,
  useActivityExport,
} from '~src/queries/activity'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { downloadBlob } from '~utils/download'
import { ActivityTimeline } from './ActivityTimeline'
import { RecentImports } from './RecentImports'

type Filter = ActivityCategory | 'all'

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

const Empty = () => {
  const { t } = useTranslation()
  return (
    <Flex direction='column' align='center' gap={2} py={8} textAlign='center'>
      <Icon as={LuHistory} boxSize={6} color='fg.muted' />
      <Text fontSize='sm' color='fg.muted'>
        {t('activity.empty', { defaultValue: 'Nothing here yet. Imports and votes appear as they happen.' })}
      </Text>
    </Flex>
  )
}

/**
 * The activity log in full (AppEnv `ACTIVITY_LOG` on): every change with who and when, filtered by
 * kind, a page at a time, and exportable for the minutes.
 */
const FullActivity = () => {
  const { t } = useTranslation()
  const toast = useToast()
  const [filter, setFilter] = useState<Filter>('all')
  const [page, setPage] = useState(1)
  const [exporting, setExporting] = useState(false)
  const category = filter === 'all' ? undefined : filter
  const activity = useActivity({ category, page })
  const exportActivity = useActivityExport()
  useTrackViewed(!activity.isLoading, 'log')

  const labels: Record<ActivityCategory, string> = {
    import: t('activity.filter.imports', { defaultValue: 'Imports' }),
    member: t('activity.filter.people', { defaultValue: 'People' }),
    census: t('activity.filter.censuses', { defaultValue: 'Censuses' }),
    process: t('activity.filter.votes', { defaultValue: 'Votes' }),
  }
  const items: FilterPillItem<Filter>[] = [
    { value: 'all', label: t('activity.filter.all', { defaultValue: 'All' }) },
    ...ACTIVITY_CATEGORIES.map((value) => ({ value, label: labels[value] })),
  ]

  const download = async () => {
    setExporting(true)
    try {
      const blob = await exportActivity({ category })
      downloadBlob(blob, 'activity.csv')
      trackAnalyticsEvent({ name: AnalyticsEvents.ActivityExported, props: { filter } })
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

  return (
    <Stack gap={4}>
      <Flex justify='space-between' align='center' gap={3} wrap='wrap'>
        <FilterPills
          items={items}
          current={filter}
          label={t('activity.filter.label', { defaultValue: 'Filter activity' })}
          onSelect={(value) => {
            setFilter(value)
            setPage(1)
          }}
        />
        <Button size='sm' variant='outline' onClick={download} loading={exporting}>
          <Icon as={LuDownload} />
          {t('activity.export', { defaultValue: 'Export CSV' })}
        </Button>
      </Flex>
      <SectionCard>
        {activity.isLoading ? (
          <Loading />
        ) : activity.isError ? (
          <Banner status='error'>
            {t('activity.error', { defaultValue: "We couldn't load the activity. Try again in a moment." })}
          </Banner>
        ) : activity.events.length ? (
          <ActivityTimeline events={activity.events} />
        ) : (
          <Empty />
        )}
        {(page > 1 || !!activity.pagination?.nextPage) && (
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

/**
 * What can be shown before the activity log exists: vote starts and ends, the latest imports, and
 * one card for the rest.
 */
const DerivedActivity = () => {
  const { t } = useTranslation()
  const activity = useActivity()
  useTrackViewed(!activity.isLoading, 'derived')

  const votes = activity.events.filter((event) => event.type.startsWith('process.'))
  const imports = activity.events.filter((event) => event.import)

  return (
    <Stack gap={4}>
      {activity.isLoading ? (
        <SectionCard>
          <Loading />
        </SectionCard>
      ) : activity.isError ? (
        <Banner status='error'>
          {t('activity.error', { defaultValue: "We couldn't load the activity. Try again in a moment." })}
        </Banner>
      ) : votes.length || imports.length ? (
        <>
          {!!votes.length && (
            <SectionCard title={t('activity.votes.title', { defaultValue: 'Votes' })}>
              <ActivityTimeline events={votes} />
            </SectionCard>
          )}
          {!!imports.length && <RecentImports imports={imports} />}
        </>
      ) : (
        <SectionCard>
          <Empty />
        </SectionCard>
      )}
      <ComingSoonCard
        feature='activity_log'
        surface='members_activity'
        title={t('activity.soon.title', { defaultValue: 'Soon: every change, with who and when' })}
        description={t('activity.soon.description', {
          defaultValue: 'Edits to members and censuses will show here, ready to export for your minutes.',
        })}
      />
    </Stack>
  )
}

/** The Members section's Activity tab. Until it has something real to show, it sends people to People. */
export const ActivityTab = () => {
  const { available, isLoading, full } = useActivityAvailable()

  if (isLoading)
    return (
      <SectionCard>
        <Loading />
      </SectionCard>
    )
  if (!available) return <Navigate to={generatePath(Routes.dashboard.memberbase.members, { page: '1' })} replace />
  return full ? <FullActivity /> : <DerivedActivity />
}

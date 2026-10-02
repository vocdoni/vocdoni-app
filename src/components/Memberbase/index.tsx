import { Button, Icon, Tabs, Text } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuUpload, LuUserPlus } from 'react-icons/lu'
import { generatePath, Outlet, Link as RouterLink, useLocation, useNavigate } from 'react-router'
import { useAuth } from '~components/Auth/useAuth'
import { PageHeader } from '~components/Dashboard/Contents'
import { Routes } from '~routes'
import { useActivityAvailable } from '~src/queries/activity'
import { useMembersCount } from '~src/queries/members'
import { useCensusIndex } from './Censuses/useCensusIndex'
import { getStoredImportJobId, readAccountId, setStoredImportJobId } from './importJobStorage'
import { JobId, MembersPageProvider } from './MembersPageContext'
import { AddPersonSheet } from './People/AddPersonSheet'
import { ExportMembersButton } from './People/ExportMembersButton'

export type { JobId } from './MembersPageContext'

type TabItem = {
  label: string
  route: string
  count?: number
}

export const MemberbaseTabs = () => {
  const { t, i18n } = useTranslation()
  const { currentAddress } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const accountId = readAccountId(currentAddress)
  const [jobId, setJobIdState] = useState<JobId>(() => getStoredImportJobId(accountId))
  const [addPersonOpen, setAddPersonOpen] = useState(false)
  // Unfiltered total: this query never carries the search term, so the count keeps showing the
  // whole member list while the table is filtered.
  const members = useMembersCount()
  const censuses = useCensusIndex()
  const activity = useActivityAvailable()

  const tabs: TabItem[] = [
    {
      label: t('memberbase.members.title', { defaultValue: 'People' }),
      route: generatePath(Routes.dashboard.memberbase.members, { page: '1' }),
      count: members.known ? members.count : undefined,
    },
    {
      label: t('memberbase.censuses.title', { defaultValue: 'Censuses' }),
      route: Routes.dashboard.memberbase.censuses,
      count: censuses.isLoading ? undefined : censuses.index.total,
    },
    // Only once there's something real to show (see useActivityAvailable)
    ...(activity.available
      ? [
          {
            label: t('memberbase.activity.title', { defaultValue: 'Activity' }),
            route: Routes.dashboard.memberbase.activity,
          },
        ]
      : []),
  ]
  const activeTab =
    tabs.find((tab, index) => index > 0 && location.pathname.startsWith(tab.route))?.route ?? tabs[0].route

  useEffect(() => {
    setJobIdState(getStoredImportJobId(accountId))
  }, [accountId])

  const context = useMemo(
    () => ({
      jobId,
      setJobId: (next: JobId) => {
        setStoredImportJobId(next, accountId)
        setJobIdState(next)
      },
      openImport: () => navigate(Routes.dashboard.memberbase.import),
      openAddPerson: () => setAddPersonOpen(true),
    }),
    [jobId, accountId, navigate]
  )

  return (
    <MembersPageProvider value={context}>
      <PageHeader
        title={t('memberbase.title', { defaultValue: 'Members' })}
        description={t('memberbase.description', {
          defaultValue: 'Everyone in your organization. You choose who votes in each vote.',
        })}
        actions={
          <>
            {/* data-testid: the e2e suite's copy-free handle for the way into the import */}
            <Button asChild variant='outline'>
              <RouterLink to={Routes.dashboard.memberbase.import} data-testid='members-import-open'>
                <Icon as={LuUpload} />
                {t('memberbase.importer.button', { defaultValue: 'Import' })}
              </RouterLink>
            </Button>
            {members.known && members.count > 0 && <ExportMembersButton />}
            {/* On a census page its own action is the main one: only one black button per page */}
            <Button
              variant={location.pathname.startsWith(`${Routes.dashboard.memberbase.censuses}/`) ? 'outline' : 'solid'}
              onClick={() => setAddPersonOpen(true)}
            >
              <Icon as={LuUserPlus} />
              {t('memberbase.add_person', { defaultValue: 'Add person' })}
            </Button>
          </>
        }
      />
      <Tabs.Root
        variant='line'
        value={activeTab}
        onValueChange={({ value }) => {
          if (value !== activeTab) navigate(value)
        }}
      >
        <Tabs.List mb={5} overflowX='auto' overflowY='hidden'>
          {tabs.map((tab) => (
            <Tabs.Trigger
              key={tab.route}
              value={tab.route}
              // On a page inside the tab (a census), the tab leads back to its list
              onClick={() => {
                if (location.pathname.startsWith(`${tab.route}/`)) navigate(tab.route)
              }}
            >
              {tab.label}
              {!!tab.count && (
                <Text as='span' fontSize='xs' color='fg.muted' fontVariantNumeric='tabular-nums'>
                  {tab.count.toLocaleString(i18n.resolvedLanguage)}
                </Text>
              )}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>
      <Outlet />
      <AddPersonSheet open={addPersonOpen} onOpenChange={setAddPersonOpen} />
    </MembersPageProvider>
  )
}

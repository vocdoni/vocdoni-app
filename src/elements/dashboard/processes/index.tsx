import { Tabs } from '@chakra-ui/react'
import { ElectionStatus } from '@vocdoni/sdk'
import { useTranslation } from 'react-i18next'
import { generatePath, matchPath, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { DashboardContents, Heading, SubHeading } from '~components/Dashboard/Contents'
import { Routes } from '~routes'

const OrganizationVotings = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const menuItems = [
    {
      label: t('all_processes', { defaultValue: 'All' }),
      route: generatePath(Routes.dashboard.processes.all, { page: 1 }),
    },
    {
      label: t('ended_processes', { defaultValue: 'Ended' }),
      route: generatePath(Routes.dashboard.processes.ended, { page: 1, status: ElectionStatus.RESULTS }),
    },
    {
      label: t('draft_processes', { defaultValue: 'Drafts' }),
      route: generatePath(Routes.dashboard.processes.drafts, { page: 1 }),
    },
  ]

  const isDrafts = !!matchPath(Routes.dashboard.processes.drafts, location.pathname)
  const isEnded = !!matchPath(Routes.dashboard.processes.ended, location.pathname)
  const currentTabIndex = isDrafts ? 2 : isEnded ? 1 : 0
  const activeTabValue = menuItems[currentTabIndex]?.route

  return (
    <DashboardContents>
      <Heading>{t('voting_processes')}</Heading>
      <SubHeading>{t('voting_processes_description')}</SubHeading>
      <Tabs.Root
        variant='settings'
        value={activeTabValue}
        onValueChange={({ value }) => {
          const item = menuItems.find((entry) => entry.route === value)
          if (item) navigate(item.route)
        }}
        lazyMount
      >
        <Tabs.List mb={6}>
          {menuItems.map((item) => (
            <Tabs.Trigger key={item.route} value={item.route}>
              {item.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Outlet />
      </Tabs.Root>
    </DashboardContents>
  )
}

export default OrganizationVotings

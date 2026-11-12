import { Tabs } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { generatePath, matchPath, Outlet, useLocation, useNavigate } from 'react-router'
import { DashboardContents } from '~components/Dashboard/Contents'
import { PageSubtitle, PageTitle } from '~components/ui/PageTitle'
import { Routes } from '~routes'

const OrganizationVotings = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const menuItems = [
    {
      label: t('all_processes', { defaultValue: 'All' }),
      route: generatePath(Routes.dashboard.processes.all, { page: '1' }),
    },
    {
      label: t('ended_processes', { defaultValue: 'Ended' }),
      // Legacy status name kept in the route; the list query maps it onto the SAAS status union
      route: generatePath(Routes.dashboard.processes.ended, { page: '1', status: 'RESULTS' }),
    },
    {
      label: t('draft_processes', { defaultValue: 'Drafts' }),
      route: generatePath(Routes.dashboard.processes.drafts, { page: '1' }),
    },
  ]

  const isDrafts = !!matchPath(Routes.dashboard.processes.drafts, location.pathname)
  const isEnded = !!matchPath(Routes.dashboard.processes.ended, location.pathname)
  const currentTabIndex = isDrafts ? 2 : isEnded ? 1 : 0
  const activeTabValue = menuItems[currentTabIndex]?.route

  return (
    <DashboardContents>
      <PageTitle>{t('voting_processes')}</PageTitle>
      <PageSubtitle>{t('voting_processes_description')}</PageSubtitle>
      <Tabs.Root
        value={activeTabValue}
        onValueChange={({ value }) => {
          const item = menuItems.find((entry) => entry.route === value)
          if (item) navigate(item.route)
        }}
        lazyMount
      >
        <Tabs.List mb='6'>
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

import { TabsList, TabsRoot, TabsTrigger } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useSaasAccount } from '~components/Account/SaasAccountProvider'
import { DashboardContents, Heading, SubHeading } from '~components/Dashboard/Contents'
import QueryDataLayout from '~components/Layout/QueryDataLayout'
import { Routes } from '~src/router/routes'

type MenuItem = {
  label: string
  component?: React.ReactNode
  href?: string
  route?: string
}

const Settings = () => {
  const { t } = useTranslation()
  const { isLoading, isError, error, organization } = useSaasAccount()
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems: MenuItem[] = [
    {
      label: t('organization.organization', { defaultValue: 'Organization Details' }),
      route: Routes.dashboard.settings.organization,
    },
    {
      label: t('team.title', { defaultValue: 'Team' }),
      route: Routes.dashboard.settings.team,
    },
    {
      label: t('subscription.title', { defaultValue: 'Subscription Plan' }),
      route: Routes.dashboard.settings.subscription,
    },
    {
      label: t('support', { defaultValue: 'Support' }),
      route: Routes.dashboard.settings.support,
    },
  ]

  const currentTabIndex = useMemo(
    () => menuItems.findIndex((item) => (item.route ? location.pathname.endsWith(item.route) : false)),
    [location.pathname, menuItems]
  )
  const activeTabValue = currentTabIndex === -1 ? menuItems[0]?.route : menuItems[currentTabIndex]?.route

  return (
    <DashboardContents>
      <Heading>
        {t('organization_settings.title', {
          defaultValue: '{{organization}} Settings',
          organization: organization.account.name.default,
        })}
      </Heading>
      <SubHeading>
        {t('organization_settings.subtitle', {
          defaultValue: 'Manage your organization, team members and your subscription plan',
        })}
      </SubHeading>
      <QueryDataLayout isLoading={isLoading} isError={isError} error={error}>
        <TabsRoot
          variant='settings'
          value={activeTabValue}
          onValueChange={({ value }) => {
            const item = menuItems.find((entry) => entry.route === value)
            if (!item?.route) return
            navigate(item.route)
          }}
          lazyMount
        >
          <TabsList mb={6}>
            {menuItems.map((item) => (
              <TabsTrigger key={item.route} value={item.route}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <Outlet />
        </TabsRoot>
      </QueryDataLayout>
    </DashboardContents>
  )
}

export default Settings

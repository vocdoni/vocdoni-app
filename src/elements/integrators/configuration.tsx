import { TabsList, TabsRoot, TabsTrigger } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { DashboardContents, Heading, SubHeading } from '~components/Dashboard/Contents'
import { useWalletAccess } from '~queries/wallet'
import { Routes, stripCheckoutReturn } from '~src/router/routes'

type ConfigTab = {
  label: string
  route: string
}

/**
 * Integrator Configuration: a tabbed container (Billing + Support) mirroring the admin settings
 * screen, but limited to the tabs integrators need. Tabs are child routes so they are deep-linkable.
 */
const IntegratorConfiguration = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { canView: canViewWallet } = useWalletAccess()

  const tabs: ConfigTab[] = [
    ...(canViewWallet
      ? [
          {
            label: t('billing.title', { defaultValue: 'Billing' }),
            route: Routes.integrators.configuration.billing,
          },
        ]
      : []),
    {
      label: t('support', { defaultValue: 'Support' }),
      route: Routes.integrators.configuration.support,
    },
  ]

  const currentTabIndex = useMemo(
    () => tabs.findIndex((tab) => stripCheckoutReturn(location.pathname).endsWith(tab.route)),
    [location.pathname, tabs]
  )
  const activeTabValue = currentTabIndex === -1 ? tabs[0]?.route : tabs[currentTabIndex]?.route

  return (
    <DashboardContents>
      <Heading>{t('integrators.configuration.title', { defaultValue: 'Configuration' })}</Heading>
      <SubHeading>
        {t('integrators.configuration.subtitle', {
          defaultValue: 'Manage your billing and support.',
        })}
      </SubHeading>
      <TabsRoot
        variant='settings'
        value={activeTabValue}
        onValueChange={({ value }) => {
          const tab = tabs.find((entry) => entry.route === value)
          if (tab) navigate(tab.route)
        }}
        lazyMount
      >
        <TabsList mb={6}>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.route} value={tab.route}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <Outlet />
      </TabsRoot>
    </DashboardContents>
  )
}

export default IntegratorConfiguration

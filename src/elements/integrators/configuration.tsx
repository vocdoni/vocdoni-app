import { useTranslation } from 'react-i18next'
import { DashboardContents } from '~components/Dashboard/Contents'
import { PageSubtitle, PageTitle } from '~components/ui/PageTitle'
import { RoutedTabs, type RoutedTab } from '~components/ui/RoutedTabs'
import { useWalletAccess } from '~queries/wallet'
import { Routes } from '~src/router/routes'

/**
 * Integrator Configuration: a tabbed container (Billing + Support) mirroring the admin settings
 * screen, but limited to the tabs integrators need. Tabs are child routes so they are deep-linkable.
 */
const IntegratorConfiguration = () => {
  const { t } = useTranslation()
  const { canView: canViewWallet } = useWalletAccess()

  const tabs: RoutedTab[] = [
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

  return (
    <DashboardContents>
      <PageTitle>{t('integrators.configuration.title', { defaultValue: 'Configuration' })}</PageTitle>
      <PageSubtitle>
        {t('integrators.configuration.subtitle', {
          defaultValue: 'Manage your billing and support.',
        })}
      </PageSubtitle>
      <RoutedTabs tabs={tabs} />
    </DashboardContents>
  )
}

export default IntegratorConfiguration

import { useTranslation } from 'react-i18next'
import { DashboardContents } from '~components/Dashboard/Contents'
import { PageSubtitle, PageTitle } from '~components/ui/PageTitle'
import { RoutedTabs, type RoutedTab } from '~components/ui/RoutedTabs'
import { Routes } from '~src/router/routes'

/**
 * Integrator Configuration: a tabbed container (Subscription + Support) mirroring the admin
 * settings screen, but limited to the two tabs integrators need. Tabs are child routes so they are
 * deep-linkable.
 */
const IntegratorConfiguration = () => {
  const { t } = useTranslation()

  const tabs: RoutedTab[] = [
    {
      label: t('subscription.title', { defaultValue: 'Subscription plan' }),
      route: Routes.integrators.configuration.subscription,
    },
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
          defaultValue: 'Manage your subscription and get support.',
        })}
      </PageSubtitle>
      <RoutedTabs tabs={tabs} />
    </DashboardContents>
  )
}

export default IntegratorConfiguration

import { useTranslation } from 'react-i18next'
import { useSaasAccount } from '~components/Account/SaasAccountProvider'
import { DashboardContents } from '~components/Dashboard/Contents'
import { PageSubtitle, PageTitle } from '~components/ui/PageTitle'
import { RoutedTabs, type RoutedTab } from '~components/ui/RoutedTabs'
import QueryDataLayout from '~components/Layout/QueryDataLayout'
import { Routes } from '~src/router/routes'

const Settings = () => {
  const { t } = useTranslation()
  const { isLoading, isError, error, organization } = useSaasAccount()

  const menuItems: RoutedTab[] = [
    {
      label: t('organization.organization', { defaultValue: 'Organization details' }),
      route: Routes.dashboard.settings.organization,
    },
    {
      label: t('team.title', { defaultValue: 'Team' }),
      route: Routes.dashboard.settings.team,
    },
    {
      label: t('subscription.title', { defaultValue: 'Subscription plan' }),
      route: Routes.dashboard.settings.subscription,
    },
    {
      label: t('support', { defaultValue: 'Support' }),
      route: Routes.dashboard.settings.support,
    },
  ]

  return (
    <DashboardContents>
      <PageTitle>
        {t('organization_settings.title', {
          defaultValue: '{{organization}} Settings',
          organization: organization.account.name.default,
        })}
      </PageTitle>
      <PageSubtitle>
        {t('organization_settings.subtitle', {
          defaultValue: 'Manage your organization, team members and your subscription plan',
        })}
      </PageSubtitle>
      <QueryDataLayout loading={isLoading} isError={isError} error={error}>
        <RoutedTabs tabs={menuItems} />
      </QueryDataLayout>
    </DashboardContents>
  )
}

export default Settings

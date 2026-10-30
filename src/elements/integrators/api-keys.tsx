import { useTranslation } from 'react-i18next'
import { DashboardContents } from '~components/Dashboard/Contents'
import { PageSubtitle, PageTitle } from '~components/ui/PageTitle'
import ApiKeysPanel from '~components/Integrator/ApiKeysPanel'

/**
 * API keys section: list, create and revoke programmatic credentials for the integrator org.
 */
const IntegratorApiKeys = () => {
  const { t } = useTranslation()

  return (
    <DashboardContents>
      <PageTitle>{t('integrators.api_keys.title', { defaultValue: 'API keys' })}</PageTitle>
      <PageSubtitle>
        {t('integrators.api_keys.subtitle', {
          defaultValue: 'Create and manage API keys to access the API programmatically.',
        })}
      </PageSubtitle>
      <ApiKeysPanel />
    </DashboardContents>
  )
}

export default IntegratorApiKeys

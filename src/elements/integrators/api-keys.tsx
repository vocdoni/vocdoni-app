import { useTranslation } from 'react-i18next'
import { DashboardCardHeader, DashboardContents } from '~components/Dashboard/Contents'
import ApiKeysPanel from '~components/Integrator/ApiKeysPanel'

/**
 * API keys section: list, create and revoke programmatic credentials for the integrator org.
 */
const IntegratorApiKeys = () => {
  const { t } = useTranslation()

  return (
    <DashboardContents>
      <DashboardCardHeader
        title={t('integrators.api_keys.title', { defaultValue: 'API keys' })}
        subtitle={t('integrators.api_keys.subtitle', {
          defaultValue: 'Create and manage API keys to access the API programmatically.',
        })}
      />
      <ApiKeysPanel />
    </DashboardContents>
  )
}

export default IntegratorApiKeys

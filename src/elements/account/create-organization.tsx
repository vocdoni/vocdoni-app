import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router'
import { OrganizationCreate } from '~components/Organization/Create'
import { AuthOutletContextType } from '~elements/LayoutAuth'
import { Routes } from '~src/router/routes'

const CreateOrganization = () => {
  const { t } = useTranslation()
  const { setTitle, setSubtitle } = useOutletContext<AuthOutletContextType>()

  // Set layout title and subtitle and back button
  useEffect(() => {
    setTitle(t('create_org.title', { defaultValue: 'Tell us about your organization' }))
    setSubtitle(t('create_org.subtitle', { defaultValue: 'This information helps us customize your experience' }))
  }, [])

  return <OrganizationCreate canSkip onSuccessRoute={Routes.dashboard.base} minified />
}

export default CreateOrganization

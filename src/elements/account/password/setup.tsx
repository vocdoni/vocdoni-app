import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useOutletContext, useSearchParams } from 'react-router'
import PasswordSetupForm from '~components/Account/PasswordSetupForm'
import { AuthOutletContextType } from '~elements/LayoutAuth'

const PasswordSetup = () => {
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()
  const { setTitle, setSubtitle } = useOutletContext<AuthOutletContextType>()

  useEffect(() => {
    setTitle(t('password_setup.title', { defaultValue: 'Set a password' }))
    setSubtitle(
      t('password_setup.subtitle', {
        defaultValue: 'Enter the code we emailed you and choose a password to sign in with your email.',
      })
    )
  }, [setTitle, setSubtitle, t])

  return <PasswordSetupForm code={searchParams.get('code') || ''} />
}

export default PasswordSetup

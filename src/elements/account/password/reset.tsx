import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useOutletContext, useSearchParams } from 'react-router'
import PasswordResetForm from '~components/Account/PasswordResetForm'
import { AuthOutletContextType } from '~elements/LayoutAuth'

const PasswordReset = () => {
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()
  const { setTitle, setSubtitle } = useOutletContext<AuthOutletContextType>()

  const code = searchParams.get('code') || ''
  const email = searchParams.get('email') || ''

  // Set layout title and subtitle
  useEffect(() => {
    setTitle(t('password_reset.title', { defaultValue: 'Password reset' }))
    setSubtitle(
      t('password_reset.subtitle', {
        defaultValue:
          "If your email corresponds to an existing account, you'll receive an email with a code to reset your password.",
      })
    )
  }, [setTitle, setSubtitle, t])

  return <PasswordResetForm code={code} email={email} />
}

export default PasswordReset

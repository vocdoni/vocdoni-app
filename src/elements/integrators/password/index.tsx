import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router-dom'
import PasswordForgotForm from '~components/Account/PasswordForgotForm'
import { AuthOutletContextType } from '~elements/LayoutAuth'
import { Routes } from '~routes'

const IntegratorsPasswordForgot = () => {
  const { t } = useTranslation()
  const { setTitle, setSubtitle } = useOutletContext<AuthOutletContextType>()

  // Set layout title and subtitle
  useEffect(() => {
    setTitle(t('forgot_password_title'))
    setSubtitle(t('forgot_password_subtitle'))
  }, [setTitle, setSubtitle, t])

  // Keep integrators within their own flow: the reset (verification) form lives under
  // /integrators too. Email links still land on the regular /account reset, which is fine.
  return <PasswordForgotForm resetRoute={Routes.integrators.passwordReset} />
}

export default IntegratorsPasswordForgot

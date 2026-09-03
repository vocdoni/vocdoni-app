import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router'
import PasswordForgotForm from '~components/Account/PasswordForgotForm'
import { AuthOutletContextType } from '~elements/LayoutAuth'

const PasswordForgot = () => {
  const { t } = useTranslation()
  const { setTitle, setSubtitle } = useOutletContext<AuthOutletContextType>()

  // Set layout title and subtitle
  useEffect(() => {
    setTitle(t('forgot_password_title'))
    setSubtitle(t('forgot_password_subtitle'))
  }, [setTitle, setSubtitle, t])

  return <PasswordForgotForm />
}

export default PasswordForgot

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router'
import SignUp from '~components/Auth/SignUp'
import { AuthOutletContextType } from '~elements/LayoutAuth'
import { Routes } from '~routes'

const IntegratorsSignup = () => {
  const { t } = useTranslation()
  const { setTitle, setSubtitle } = useOutletContext<AuthOutletContextType>()

  // Set layout title and subtitle
  useEffect(() => {
    setTitle(t('integrators.signup_title', { defaultValue: 'Create your integrator account' }))
    setSubtitle(t('integrators.signup_subtitle', { defaultValue: 'Sign up to manage organizations as an integrator.' }))
  }, [])

  // Integrators have no standalone verify route: render the verification form inline right after
  // registering, and send the verified user to the integrators app (where the org is provisioned).
  return <SignUp signInRoute={Routes.integrators.signIn} verifyInline verifyNextRoute={Routes.integrators.base} />
}

export default IntegratorsSignup

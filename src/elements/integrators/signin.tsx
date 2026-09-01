import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useOutletContext, useSearchParams } from 'react-router'
import SignIn from '~components/Auth/SignIn'
import { AuthOutletContextType } from '~elements/LayoutAuth'
import { Routes } from '~routes'

const IntegratorsSignin = () => {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const { setTitle, setSubtitle } = useOutletContext<AuthOutletContextType>()

  // Set layout title and subtitle
  useEffect(() => {
    setTitle(t('integrators.signin_title', { defaultValue: 'Sign in' }))
    setSubtitle(t('integrators.signin_subtitle', { defaultValue: 'Access your integrator dashboard.' }))
  }, [])

  return (
    <SignIn
      email={searchParams.get('email') ?? undefined}
      successRoute={Routes.integrators.base}
      signUpRoute={Routes.integrators.signUp}
      recoveryRoute={Routes.integrators.recovery}
      verifyNextRoute={Routes.integrators.base}
    />
  )
}

export default IntegratorsSignin

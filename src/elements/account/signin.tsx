import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router'
import SignIn from '~components/Auth/SignIn'
import { useVerticalSlug } from '~components/Auth/vertical'
import { withVerticalParam } from '~constants/verticals'
import { AuthOutletContextType } from '~elements/LayoutAuth'
import { Routes } from '~routes'

const Signin = () => {
  const { t } = useTranslation()
  const { setTitle, setSubtitle } = useOutletContext<AuthOutletContextType>()
  // The vertical also survives in session storage, but carrying it in the URL keeps every auth
  // link shareable and the branding honest about where the visitor came from.
  const vertical = useVerticalSlug()

  // Set layout title and subtitle
  useEffect(() => {
    setTitle(t('signin_title'))
    setSubtitle(t('signin_subtitle'))
  }, [])

  return (
    <SignIn
      signUpRoute={withVerticalParam(Routes.auth.signUp, vertical)}
      recoveryRoute={withVerticalParam(Routes.auth.recovery, vertical)}
    />
  )
}

export default Signin

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router'
import SignUp from '~components/Auth/SignUp'
import { useVerticalSlug } from '~components/Auth/vertical'
import { withVerticalParam } from '~constants/verticals'
import { AuthOutletContextType } from '~elements/LayoutAuth'
import { Routes } from '~routes'

const Signup = () => {
  const { t } = useTranslation()
  const { setTitle, setSubtitle } = useOutletContext<AuthOutletContextType>()
  const vertical = useVerticalSlug()

  // Set layout title and subtitle
  useEffect(() => {
    setTitle(t('signup_title'))
    setSubtitle(t('signup_subtitle'))
  }, [])

  return (
    <SignUp
      signInRoute={withVerticalParam(Routes.auth.signIn, vertical)}
      afterRegisterRoute={withVerticalParam(Routes.auth.verify, vertical)}
    />
  )
}

export default Signup

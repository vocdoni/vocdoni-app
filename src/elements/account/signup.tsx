import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router'
import SignUp from '~components/Auth/SignUp'
import { AuthOutletContextType } from '~elements/LayoutAuth'

const Signup = () => {
  const { t } = useTranslation()
  const { setTitle, setSubtitle } = useOutletContext<AuthOutletContextType>()

  // Set layout title and subtitle
  useEffect(() => {
    setTitle(t('signup_title'))
    setSubtitle(t('signup_subtitle'))
  }, [])

  return <SignUp />
}

export default Signup

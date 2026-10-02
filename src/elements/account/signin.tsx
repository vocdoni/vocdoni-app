import SignIn from '~components/Auth/SignIn'
import { useVerticalSlug } from '~components/Auth/vertical'
import { withVerticalParam } from '~constants/verticals'
import { Routes } from '~routes'

const Signin = () => {
  // The vertical also survives in session storage, but carrying it in the URL keeps every auth
  // link shareable and the branding honest about where the visitor came from.
  const vertical = useVerticalSlug()

  return (
    <SignIn
      signUpRoute={withVerticalParam(Routes.auth.signUp, vertical)}
      recoveryRoute={withVerticalParam(Routes.auth.recovery, vertical)}
    />
  )
}

export default Signin

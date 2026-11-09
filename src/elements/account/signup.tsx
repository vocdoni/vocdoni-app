import SignUp from '~components/Auth/SignUp'
import { useVerticalSlug } from '~components/Auth/vertical'
import { withVerticalParam } from '~constants/verticals'
import { Routes } from '~routes'

const Signup = () => {
  const vertical = useVerticalSlug()

  return (
    <SignUp
      signInRoute={withVerticalParam(Routes.auth.signIn, vertical)}
      afterRegisterRoute={withVerticalParam(Routes.auth.verify, vertical)}
    />
  )
}

export default Signup

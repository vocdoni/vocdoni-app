import { Routes } from '~routes'
import { AuthLayout } from './LayoutAuth'

// The integrators app gets the single-column card: no showcase panel, no trust bar.
const LayoutIntegratorsAuth = () => <AuthLayout signInPath={Routes.integrators.signIn} />

export default LayoutIntegratorsAuth

import { Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom'
import { useAccountHealthTools } from '~components/Account/use-account-health-tools'
import { useAuth } from '~components/Auth/useAuth'
import { Loading } from '~src/router/SuspenseLoader'
import { Routes } from './routes'

// redirectTo lets reusable auth groups (e.g. the integrators app) send already-authenticated
// users to their own root instead of the default dashboard. A group that sets it owns its
// destination; the default /account group derives one from the account's organization state.
const NonLoggedRoute = ({ redirectTo }: { redirectTo?: string }) => {
  const { pathname } = useLocation()
  const { isAuthenticated, isAuthLoading } = useAuth()
  const { exists, isUnknown } = useAccountHealthTools()
  const context = useOutletContext()

  if (isAuthLoading) {
    return <Loading />
  }

  if (isAuthenticated && pathname !== Routes.auth.passwordReset) {
    // Verifying an email logs the account in while it is still on /account/verify, so this
    // guard runs before Verify's own navigation has settled and its <Navigate> lands last.
    // Sending a freshly verified account to the dashboard therefore *replaces* the
    // organization creation step it was on its way to. It has nothing to do on the dashboard
    // anyway, so point it at the same step. `isUnknown` keeps an owner whose address lookup
    // merely failed from being pushed into creating a second organization.
    const target = redirectTo ?? (exists || isUnknown ? Routes.dashboard.base : Routes.auth.organizationCreate)
    return <Navigate to={target} replace />
  }

  return <Outlet context={context} />
}

export default NonLoggedRoute

import { Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom'
import { useAuth } from '~components/Auth/useAuth'
import { Loading } from '~src/router/SuspenseLoader'
import { Routes } from './routes'

// redirectTo lets reusable auth groups (e.g. the integrators app) send already-authenticated
// users to their own root instead of the default dashboard.
const NonLoggedRoute = ({ redirectTo = Routes.dashboard.base }: { redirectTo?: string }) => {
  const { pathname } = useLocation()
  const { isAuthenticated, isAuthLoading } = useAuth()
  const context = useOutletContext()

  if (isAuthLoading) {
    return <Loading />
  }

  if (isAuthenticated && pathname !== Routes.auth.passwordReset) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet context={context} />
}

export default NonLoggedRoute

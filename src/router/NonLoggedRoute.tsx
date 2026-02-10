import { Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom'
import { useAuth } from '~components/Auth/useAuth'
import { Loading } from '~src/router/SuspenseLoader'
import { Routes } from './routes'

const NonLoggedRoute = () => {
  const { pathname } = useLocation()
  const { isAuthenticated, isAuthLoading } = useAuth()
  const context = useOutletContext()

  if (isAuthLoading) {
    return <Loading />
  }

  if (isAuthenticated && pathname !== Routes.auth.passwordReset) {
    return <Navigate to={Routes.dashboard.base} />
  }

  return <Outlet context={context} />
}

export default NonLoggedRoute

import { Outlet, useLocation, useOutletContext } from 'react-router-dom'
import { useAuth } from '~components/Auth/useAuth'
import { Loading } from '~src/router/SuspenseLoader'
import { AppNavigate } from './appNavigation'
import { Routes } from './routes'

const NonLoggedRoute = () => {
  const { pathname } = useLocation()
  const { isAuthenticated, isAuthLoading } = useAuth()
  const context = useOutletContext()

  if (isAuthLoading) {
    return <Loading />
  }

  if (isAuthenticated && pathname !== Routes.auth.passwordReset) {
    return <AppNavigate to={Routes.dashboard.base} replace />
  }

  return <Outlet context={context} />
}

export default NonLoggedRoute

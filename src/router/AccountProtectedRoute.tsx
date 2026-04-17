import { useClient } from '@vocdoni/react-components'
import { Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom'
import { useAuth } from '~components/Auth/useAuth'
import { Loading } from '~src/router/SuspenseLoader'
import { Routes } from './routes'

const AccountProtectedRoute = () => {
  const context = useOutletContext()
  const {
    loaded: { account: fetchLoaded },
    loading: { account: fetchLoading },
  } = useClient()
  const { isAuthenticated, isAuthLoading } = useAuth()
  const { pathname } = useLocation()

  if ((!fetchLoaded && fetchLoading) || isAuthLoading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    localStorage.setItem('redirectTo', pathname)
    return <Navigate to={Routes.auth.signIn} replace />
  }

  return <Outlet context={context} />
}

export default AccountProtectedRoute

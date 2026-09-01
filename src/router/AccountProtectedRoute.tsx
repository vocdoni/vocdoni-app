import { Navigate, Outlet, useLocation, useOutletContext } from 'react-router'
import { useAuth } from '~components/Auth/useAuth'
import { Loading } from '~src/router/SuspenseLoader'
import { Routes } from './routes'

type AccountProtectedRouteProps = {
  // Where to send unauthenticated users. Overridable so the integrators app keeps users within
  // its own auth flow (/integrators/signin); defaults to the regular /account sign in.
  signInRoute?: string
}

const AccountProtectedRoute = ({ signInRoute = Routes.auth.signIn }: AccountProtectedRouteProps) => {
  const context = useOutletContext()
  const { isAuthenticated, isAuthLoading } = useAuth()
  const { pathname } = useLocation()

  if (isAuthLoading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    localStorage.setItem('redirectTo', pathname)
    return <Navigate to={signInRoute} replace />
  }

  return <Outlet context={context} />
}

export default AccountProtectedRoute

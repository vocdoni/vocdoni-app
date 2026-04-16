import { useClient } from '@vocdoni/react-components'
import { Outlet, useLocation, useOutletContext } from 'react-router-dom'
import { useAuth } from '~components/Auth/useAuth'
import { Loading } from '~src/router/SuspenseLoader'
import { AppNavigate } from './appNavigation'
import { normalizeAuthRedirectTarget } from './authRedirects'
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
    localStorage.setItem('redirectTo', normalizeAuthRedirectTarget(pathname))
    return <AppNavigate to={Routes.auth.signIn} replace />
  }

  return <Outlet context={context} />
}

export default AccountProtectedRoute

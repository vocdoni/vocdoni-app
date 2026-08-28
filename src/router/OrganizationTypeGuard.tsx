import { Navigate, Outlet } from 'react-router'
import { Routes } from './routes'
import { Loading } from '~src/router/SuspenseLoader'
import { LocalStorageKeys } from '~components/Auth/useAuthProvider'
import { useAuth } from '~components/Auth/useAuth'
import { useProfile } from '~src/queries/account'
import { getPrivateAppRoot } from './privateAppRouting'

interface OrganizationTypeGuardProps {
  redirectPath: string // The path this guard should redirect to (/admin or /integrators)
}

/**
 * Guard component that redirects users based on whether their selected organization
 * matches the expected type for this route.
 * - If org is integrator but route expects non-integrator, redirect to /integrators
 * - If org is non-integrator but route expects integrator, redirect to /admin
 */
const OrganizationTypeGuard = ({ redirectPath }: OrganizationTypeGuardProps) => {
  const { isAuthenticated, isAuthLoading } = useAuth()
  const { data: profile, isLoading: isProfileLoading } = useProfile()

  if (isAuthLoading || isProfileLoading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return <Navigate to={Routes.auth.signIn} replace />
  }

  // Determine the correct private app root based on organization type
  const expectedRoot = redirectPath
  const actualRoot = getPrivateAppRoot(profile ?? null, localStorage.getItem(LocalStorageKeys.SignerAddress) ?? '')

  // If the actual root doesn't match the expected path, redirect
  if (actualRoot !== expectedRoot) {
    return <Navigate to={actualRoot} replace />
  }

  return <Outlet context={undefined} />
}

export default OrganizationTypeGuard

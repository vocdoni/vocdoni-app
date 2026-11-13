import { Navigate, Outlet, useOutletContext } from 'react-router'
import { useAuth } from '~components/Auth/useAuth'
import { useProfile } from '~src/queries/account'
import { usePrefetchOrganization } from '~src/queries/organization'
import { PageLoader } from '~components/ui/Loader'
import { getPrivateAppRoot } from './privateAppRouting'

type PrivateAppGuardProps = {
  // The private app root this route tree belongs to (/admin or /integrators).
  redirectPath: string
}

/**
 * The single waiting state of a private app, rendered inside its frame. It waits for the
 * session probe (the address list) and the profile, fetched in parallel, then sends an
 * organization of the other type to its own app. Sits below a non-blocking
 * AccountProtectedRoute, which already sent visitors with no session to sign in.
 */
const PrivateAppGuard = ({ redirectPath }: PrivateAppGuardProps) => {
  const context = useOutletContext()
  const { isAuthenticated, isAuthLoading, currentAddress, unconfirmedAddress } = useAuth()
  const { data: profile, isLoading: isProfileLoading } = useProfile({ enabled: isAuthenticated })

  // Starts the stored organization's reads alongside the session probe. Pages only render
  // through the confirmed `currentAddress`, and a rejected address's data is dropped.
  usePrefetchOrganization(unconfirmedAddress)

  if (!isAuthenticated || isAuthLoading || isProfileLoading) {
    return <PageLoader />
  }

  const actualRoot = getPrivateAppRoot(profile ?? null, currentAddress ?? '')
  if (actualRoot !== redirectPath) {
    return <Navigate to={actualRoot} replace />
  }

  return <Outlet context={context} />
}

export default PrivateAppGuard

import { useOrganization } from '@vocdoni/react-components'
import { PropsWithChildren } from 'react'
import { useAuth } from '~components/Auth/useAuth'
import { OrganizationsUnavailablePage } from '~components/Organization/OrganizationsUnavailable'
import { PageLoader } from '~components/ui/Loader'

/**
 * Guards dashboard page content until the active organization has loaded. Pages read
 * `organization` during render; it is null until the org request answers or after the
 * cache is cleared on an org switch.
 */
export const OrganizationGate = ({ children }: PropsWithChildren) => {
  const { currentAddress, addresses } = useAuth()
  const { organization, error, fetch } = useOrganization()

  // No currentAddress can mean "no orgs" (pass through) or "selection not applied yet"
  // (addresses exist but effect hasn't run). Only pass through in the first case.
  if ((!currentAddress && !addresses.length) || organization) return <>{children}</>
  if (error) return <OrganizationsUnavailablePage onRetry={() => fetch()} />
  return <PageLoader />
}

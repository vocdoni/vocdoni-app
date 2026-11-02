import { useOrganization } from '@vocdoni/react-components'
import { PropsWithChildren } from 'react'
import { useAuth } from '~components/Auth/useAuth'
import { OrganizationsUnavailablePage } from '~components/Organization/OrganizationsUnavailable'
import { Loading } from '~src/router/SuspenseLoader'

/**
 * Guards dashboard page content until the active organization has loaded. Pages read
 * `organization` during render; it is null until the org request answers or after the
 * cache is cleared on an org switch.
 */
export const OrganizationGate = ({ children }: PropsWithChildren) => {
  const { currentAddress } = useAuth()
  const { organization, error, fetch } = useOrganization()

  if (!currentAddress || organization) return <>{children}</>
  if (error) return <OrganizationsUnavailablePage onRetry={() => fetch()} />
  return <Loading />
}

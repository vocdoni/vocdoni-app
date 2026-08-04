import { Outlet, useOutletContext } from 'react-router-dom'
import { useAccountHealthTools } from '~components/Account/use-account-health-tools'
import { NoOrganizationsPage } from '~components/Organization/NoOrganizations'
import { OrganizationsUnavailablePage } from '~components/Organization/OrganizationsUnavailable'

// This protected routes are supposed to be inside of a AccountProtectedRoute
// So no auth/loading checks are performed here
const OrganizationProtectedRoute = () => {
  const context = useOutletContext()
  const { exists, isUnknown } = useAccountHealthTools()

  // The address lookup failed, so whether this account owns an organization is
  // unknown. Say so and offer a retry rather than sending an org owner to the
  // "you have no organizations" onboarding screen.
  if (isUnknown) {
    return <OrganizationsUnavailablePage />
  }

  if (!exists) {
    return <NoOrganizationsPage />
  }

  return <Outlet context={context} />
}

export default OrganizationProtectedRoute

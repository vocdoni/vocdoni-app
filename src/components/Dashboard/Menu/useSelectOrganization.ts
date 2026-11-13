import { type Query, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useAuth } from '~components/Auth/useAuth'
import { LocalStorageKeys } from '~components/Auth/useAuthProvider'
import { Routes } from '~routes'
import { Organization } from '~src/queries/account'
import { QueryKeys } from '~src/queries/keys'

/**
 * Key prefixes of the queries that belong to the signed-in user, not to the active
 * organization, and so survive an organization switch. An allowlist on purpose: any
 * other query, including ones added later, is dropped so no organization's data can
 * show under another.
 */
const USER_LEVEL_QUERY_KEYS: readonly (readonly unknown[])[] = [
  QueryKeys.profile,
  // useAuthProvider's address list; refreshAddresses refetches it right after.
  ['auth', 'addresses'],
  // Reference lists from the API, the same for every organization.
  QueryKeys.organization.roles,
  QueryKeys.organization.types,
  QueryKeys.organization.languages,
]

const isUserLevelQuery = ({ queryKey }: Query) =>
  USER_LEVEL_QUERY_KEYS.some((prefix) => prefix.every((part, index) => queryKey[index] === part))

/**
 * Switches the active organization app-wide: points signerAddress at the given org, drops the
 * previous organization's queries, re-resolves the active org address and navigates to the
 * matching private app root. Shared by the sidebar OrganizationSwitcher and the integrator
 * "switch instead of creating" modal so the switch side-effects live in a single place.
 */
export const useSelectOrganization = () => {
  const { refreshAddresses } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // `isIntegrator` comes from the membership wrapper (UserRole), not the organization itself.
  return async (organization: Organization, isIntegrator: boolean = false) => {
    localStorage.setItem(LocalStorageKeys.SignerAddress, organization.address)
    // Keep the user-level queries so the switch does not refetch the profile and replay the boot.
    queryClient.removeQueries({ predicate: (query) => !isUserLevelQuery(query) })
    queryClient.getMutationCache().clear()
    // re-resolve the active organization address for the new selection
    await refreshAddresses()
    // Navigate to the correct private app root based on the selected org's integrator flag
    const targetPath = isIntegrator ? Routes.integrators.base : Routes.dashboard.base
    navigate(targetPath, { replace: true })
  }
}

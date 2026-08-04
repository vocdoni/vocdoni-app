import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '~components/Auth/useAuth'
import { LocalStorageKeys } from '~components/Auth/useAuthProvider'
import { Routes } from '~routes'
import { Organization } from '~src/queries/account'

/**
 * Switches the active organization app-wide: points signerAddress at the given org, resets the
 * query cache, re-resolves the active org address and navigates to the matching private app root.
 * Shared by the sidebar OrganizationSwitcher and the integrator "switch instead of creating" modal
 * so the switch side-effects live in a single place.
 */
export const useSelectOrganization = () => {
  const { refreshAddresses } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // `isIntegrator` comes from the membership wrapper (UserRole), not the organization itself.
  return async (organization: Organization, isIntegrator: boolean = false) => {
    localStorage.setItem(LocalStorageKeys.SignerAddress, organization.address)
    // clear all query client query cache
    queryClient.clear()
    // re-resolve the active organization address for the new selection
    await refreshAddresses()
    // Navigate to the correct private app root based on the selected org's integrator flag
    const targetPath = isIntegrator ? Routes.integrators.base : Routes.dashboard.base
    navigate(targetPath, { replace: true })
  }
}

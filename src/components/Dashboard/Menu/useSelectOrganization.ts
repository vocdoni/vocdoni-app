import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '~components/Auth/useAuth'
import { LocalStorageKeys } from '~components/Auth/useAuthProvider'
import { Routes } from '~routes'
import { Organization } from '~src/queries/account'

/**
 * Switches the active organization app-wide: points signerAddress at the given org, resets the
 * query cache, refreshes the SDK signer and navigates to the matching private app root. Shared by
 * the sidebar OrganizationSwitcher and the integrator "switch instead of creating" modal so the
 * switch side-effects live in a single place.
 */
export const useSelectOrganization = () => {
  const { signerRefresh } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return async (organization: Organization) => {
    localStorage.setItem(LocalStorageKeys.SignerAddress, organization.address)
    // clear all query client query cache
    queryClient.clear()
    // refresh signer
    await signerRefresh()
    // Navigate to the correct private app root based on the selected org's integrator flag
    const targetPath = organization.isIntegrator ? Routes.integrators.base : Routes.dashboard.base
    navigate(targetPath, { replace: true })
  }
}

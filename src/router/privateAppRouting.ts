import { Organization } from '~src/queries/account'

export interface Profile {
  organizations: Array<{
    role: string
    isIntegrator?: boolean
    organization: Organization
  }>
}

/**
 * Returns the selected organization from profile by address, or the first org if not found.
 */
export const getSelectedOrganization = (profile: Profile | null, selectedAddress: string): Organization | undefined => {
  if (!profile?.organizations) return undefined

  const selectedOrg = profile.organizations.find((org) => org.organization.address === selectedAddress)
  return selectedOrg?.organization ?? profile.organizations[0]?.organization
}

/**
 * Returns true if the selected membership (or first one as fallback) is an integrator. The flag
 * lives on the membership wrapper, not the nested organization (see UserRole).
 */
export const isSelectedOrganizationIntegrator = (profile: Profile | null, selectedAddress: string): boolean => {
  if (!profile?.organizations) return false
  const selected = profile.organizations.find((org) => org.organization.address === selectedAddress)
  return (selected ?? profile.organizations[0])?.isIntegrator ?? false
}

/**
 * Returns the private app root path based on whether the selected organization is an integrator.
 */
export const getPrivateAppRoot = (profile: Profile | null, selectedAddress: string): string => {
  return isSelectedOrganizationIntegrator(profile, selectedAddress) ? '/integrators' : '/admin'
}

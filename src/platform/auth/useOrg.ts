import { useProfile } from '~platform/queries/profile'

// An integrator user belongs to exactly one organization, so there is nothing to "switch" between:
// we resolve that single org (and the user's role on it) straight from the profile. The org is the
// one the user can administer (admin or manager); `address` is undefined only before the profile
// has loaded or for a brand-new account that hasn't been provisioned yet (see OrgGuard).
export const useOrg = () => {
  const { data: profile, isLoading } = useProfile()
  const membership = (profile?.organizations ?? []).find((o) => o.role === 'admin' || o.role === 'manager')

  return {
    address: membership?.organization.address,
    role: membership?.role,
    isAdmin: membership?.role === 'admin',
    isLoading,
  }
}

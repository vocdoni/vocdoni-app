import { useAuth } from '~components/Auth/useAuth'

/**
 * Whether the session has a usable organization: an org exists when the session
 * resolved an active organization address.
 *
 * `exists: false` is only meaningful when `isUnknown` is false — a failed address
 * lookup also leaves the address unset, and treating that as "no organizations"
 * shows onboarding to a user who has one.
 */
export const useAccountHealthTools = () => {
  const { currentAddress, addressesError } = useAuth()

  return {
    exists: !!currentAddress,
    isUnknown: !currentAddress && !!addressesError,
  }
}

import { useAuth } from '~components/Auth/useAuth'
import { isClientError } from '~components/Auth/useAuthProvider'

/**
 * Whether the session has a usable organization: an org exists when the session
 * resolved an active organization address.
 *
 * `exists: false` is only meaningful when `isUnknown` is false — a failed address
 * lookup also leaves the address unset, and treating that as "no organizations"
 * shows onboarding to a user who has one.
 *
 * "This account owns no organizations" is itself an error response: the SaaS
 * answers `/auth/addresses` with 404 `user has no organizations` (code 40012).
 * That is a definitive answer, so only errors that aren't a 4xx — a 5xx, a
 * dropped connection — leave the account state genuinely unknown.
 */
export const useAccountHealthTools = () => {
  const { currentAddress, addressesError } = useAuth()

  return {
    exists: !!currentAddress,
    isUnknown: !currentAddress && !!addressesError && !isClientError(addressesError),
  }
}

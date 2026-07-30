import { useAuth } from '~components/Auth/useAuth'

/**
 * Whether the session has a usable organization: an org exists when the session
 * resolved an active organization address.
 */
export const useAccountHealthTools = () => {
  const { currentAddress } = useAuth()

  return {
    exists: !!currentAddress,
  }
}

import { useAuth } from '~components/Auth/useAuth'

/**
 * Whether the session has a usable organization. Formerly derived from the on-chain
 * account object (RemoteSigner-connected, checking it existed and wasn't archived); now
 * an org simply exists when the session resolved an active organization address.
 */
export const useAccountHealthTools = () => {
  const { currentAddress } = useAuth()

  return {
    exists: !!currentAddress,
  }
}

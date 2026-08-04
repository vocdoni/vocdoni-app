import { useMutation } from '@tanstack/react-query'
import { ensure0x } from '~utils/address'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'

export const usePortalSession = () => {
  const { bearedFetch, currentAddress } = useAuth()

  return useMutation({
    mutationFn: () =>
      bearedFetch<{ portalURL: string }>(
        ApiEndpoints.SubscriptionPortal.replace('{address}', ensure0x(currentAddress))
      ),
  })
}

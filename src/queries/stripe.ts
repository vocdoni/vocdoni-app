import { useMutation } from '@tanstack/react-query'
import { useClient } from '@vocdoni/react-components'
import { ensure0x } from '@vocdoni/sdk'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'

export const usePortalSession = () => {
  const { bearedFetch } = useAuth()
  const { account } = useClient()

  return useMutation({
    mutationFn: () =>
      bearedFetch<{ portalURL: string }>(
        ApiEndpoints.SubscriptionPortal.replace('{address}', ensure0x(account?.address))
      ),
  })
}

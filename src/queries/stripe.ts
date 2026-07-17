import { useMutation } from '@tanstack/react-query'
import { useClient } from '@vocdoni/react-components'
import { ensure0x } from '@vocdoni/sdk'
import { ApiEndpoints } from '~components/Auth/api'
import type { SubscriptionType } from '~components/Auth/Subscription'
import { useAuth } from '~components/Auth/useAuth'

export const useUpdateSubscription = () => {
  const { bearedFetch } = useAuth()
  const { account } = useClient()

  return useMutation<SubscriptionType>({
    mutationFn: async () =>
      await bearedFetch(ApiEndpoints.OrganizationSubscription.replace('{address}', ensure0x(account?.address))),
  })
}

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

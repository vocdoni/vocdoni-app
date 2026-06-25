import { useMutation, useQuery } from '@tanstack/react-query'
import { ApiEndpoints } from '~platform/api/endpoints'
import { useAuth } from '~platform/auth/AuthContext'
import { useOrg } from '~platform/auth/useOrg'
import { QueryKeys } from './keys'

const ensure0x = (address: string) => (address.startsWith('0x') ? address : `0x${address}`)

// Trimmed view of saas-backend OrganizationSubscriptionInfo (GET /organizations/{address}/subscription).
export type OrganizationSubscriptionInfo = {
  subscriptionDetails: {
    planId: string // Stripe product ID
    startDate: string
    renewalDate: string
    lastPaymentDate: string
    active: boolean
    maxCensusSize: number
    email: string
  }
  usage: {
    sentSMS: number
    sentEmails: number
    subOrgs: number
    users: number
    processes: number
  }
  plan: {
    id: string // Stripe product ID
    name: string
    monthlyPrice: number
    yearlyPrice: number
    default: boolean
  }
}

/** Current subscription (plan + usage) for the active organization (admin only). */
export const useSubscription = () => {
  const { bearedFetch } = useAuth()
  const { address } = useOrg()

  return useQuery<OrganizationSubscriptionInfo>({
    queryKey: QueryKeys.subscription(address),
    enabled: !!address,
    staleTime: 5 * 60 * 1000,
    retry: false,
    queryFn: () =>
      bearedFetch<OrganizationSubscriptionInfo>(
        ApiEndpoints.OrganizationSubscription.replace('{address}', ensure0x(address!))
      ),
  })
}

/** Creates a Stripe billing-portal session; returns the URL to redirect the admin to. */
export const usePortalSession = () => {
  const { bearedFetch } = useAuth()
  const { address } = useOrg()

  return useMutation<{ portalURL: string }, Error, void>({
    mutationFn: () =>
      bearedFetch<{ portalURL: string }>(ApiEndpoints.SubscriptionPortal.replace('{address}', ensure0x(address!)), {
        method: 'POST',
      }),
  })
}

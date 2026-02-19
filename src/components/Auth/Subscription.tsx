import { useQuery } from '@tanstack/react-query'
import { enforceHexPrefix, useClient } from '@vocdoni/react-providers'
import { dotobject } from '@vocdoni/sdk'
import { ReactNode, createContext, useContext, useMemo } from 'react'
import { useAuth } from '~components/Auth/useAuth'
import type { Plan } from '~components/Pricing/Plans'
import { QueryKeys } from '~src/queries/keys'
import { ApiEndpoints } from './api'

type PermissionsContextType = {
  permission: (key: string) => any
  subscription: SubscriptionType
  loading: boolean
  error: Error | null
}

export type SubscriptionType = {
  subscriptionDetails: {
    planId: number
    startDate: string
    endDate: string
    lastPaymentDate: string
    renewalDate: string
    active: boolean
    maxCensusSize: number
    email: string
  }
  usage: {
    sentSMS: number
    sentEmails: number
    processes: number
    subOrgs: number
    users: number
  }
  plan: Plan
}

const SubscriptionContext = createContext<PermissionsContextType | undefined>(undefined)

const useSubscription = () => {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}

const SubscriptionProviderComponent: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { bearedFetch } = useAuth()
  const { account } = useClient()

  // Fetch organization subscription details
  // TODO: In the future, this may be merged with the role permissions (not yet defined)
  const {
    data: subscription,
    isFetching,
    error,
  } = useQuery({
    queryKey: QueryKeys.organization.subscription(enforceHexPrefix(account?.address)),
    queryFn: () =>
      bearedFetch<SubscriptionType>(
        ApiEndpoints.OrganizationSubscription.replace('{address}', enforceHexPrefix(account?.address))
      ),
    // Cache for 15 minutes
    staleTime: 15 * 60 * 1000,
    enabled: !!account?.address,
  })

  // Helper function to access permission using dot notation
  const permission = useMemo(() => {
    return (key: string) => {
      if (!subscription || !subscription.plan) return undefined
      return dotobject(subscription.plan, key)
    }
  }, [subscription])

  const value = { permission, subscription, loading: isFetching, error }

  return <SubscriptionContext.Provider value={value} children={children} />
}

export { SubscriptionProviderComponent as SubscriptionProvider, useSubscription }

import { useQuery } from '@tanstack/react-query'
import { dotobject } from '@vocdoni/sdk'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { SubscriptionPermission } from '~constants'
import { QueryKeys } from './keys'

export type Plan = {
  id: string
  name: string
  stripeID: string
  yearlyPrice: number
  monthlyPrice: number
  default: boolean
  freeTrialDays: number
  organization: {
    teamMembers: number
    subOrgs: number
    censusSize: number
    maxProcesses: number
    maxCensus: number
    maxDuration: string
    customURL: boolean
    drafts: boolean
  }
  votingTypes: {
    single: boolean
    multiple: boolean
    approval: boolean
    cumulative: boolean
    ranked: boolean
    weighted: boolean
  }
  features: {
    anonymous: boolean
    overwrite: boolean
    liveResults: boolean
    personalization: boolean
    emailReminder: boolean
    '2FAsms': number
    '2FAemail': number
    whiteLabel: boolean
    liveStreaming: boolean
    phoneSupport: boolean
  }
}

export type SubscriptionCheckoutFormValues = {
  billingPeriod: 'month' | 'year'
  planId: string | null
}

export const usePlans = () => {
  const { bearedFetch } = useAuth()
  return useQuery({
    queryKey: QueryKeys.plans,
    queryFn: () => bearedFetch<Plan[]>(ApiEndpoints.Plans),
    // Sort by price
    select: (data) => data.sort((a, b) => a.yearlyPrice - b.yearlyPrice),
    // Cache for 20 minutes
    staleTime: 20 * 60 * 1000,
  })
}

export const useGetPlansWithFeature = (feature: SubscriptionPermission) => {
  const { data: plans = [] } = usePlans()
  return plans.filter((plan) => dotobject(plan, feature))
}

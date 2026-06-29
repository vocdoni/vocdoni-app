import { useQuery } from '@tanstack/react-query'
import { ApiEndpoints } from '~platform/api/endpoints'
import { useAuth } from '~platform/auth/AuthContext'

export type IntegratorLimits = {
  maxManagedOrgs: number
}

// The plan's pooled org limits. The process and census-size caps for an integrator now live here
// (relocated out of integratorLimits; saas-backend feat/integrator-usage-counters).
export type PlanLimits = {
  maxProcesses: number
  maxCensus: number
}

// Subset of the backend SubscriptionPlan we use here (saas-backend#532 exposes integratorLimits).
export type Plan = {
  id: string // Stripe product ID
  name: string
  monthlyPrice: number
  yearlyPrice: number
  default: boolean
  organization: PlanLimits
  integratorLimits: IntegratorLimits
}

const isIntegratorPlan = (plan: Plan) => (plan.integratorLimits?.maxManagedOrgs ?? 0) > 0

/**
 * Integrator plans to offer in the upgrade dialog: every plan whose integrator limits grant at
 * least one managed org, free tier included, cheapest first. The hardcoded Custom card is appended
 * by the dialog after these.
 */
export const useIntegratorPlans = () => {
  const { bearedFetch } = useAuth()

  return useQuery<Plan[], Error, Plan[]>({
    queryKey: ['plans'],
    staleTime: 10 * 60 * 1000,
    queryFn: () => bearedFetch<Plan[]>(ApiEndpoints.Plans),
    select: (plans) => (plans ?? []).filter(isIntegratorPlan).sort((a, b) => a.monthlyPrice - b.monthlyPrice),
  })
}

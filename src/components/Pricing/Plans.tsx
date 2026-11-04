import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { PlanName } from '~constants'
import { QueryKeys } from '~src/queries/keys'

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

export const usePlanTranslations = () => {
  const { t } = useTranslation()

  return {
    [PlanName.Free]: {
      title: t('pricing.free_title', { defaultValue: 'Free' }),
    },
    [PlanName.Starter]: {
      title: t('pricing.essential_title', { defaultValue: 'Essential' }),
    },
    [PlanName.Professional]: {
      title: t('pricing.premium_title', { defaultValue: 'Premium' }),
    },
  }
}

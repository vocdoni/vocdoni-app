import {
  Flex,
  ProgressRange,
  ProgressRoot,
  ProgressTrack,
  SimpleGrid,
  TabsList,
  TabsRoot,
  TabsTrigger,
  TagLabel,
  TagRoot,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import {
  LuChartColumn,
  LuCircleCheckBig,
  LuMail,
  LuPalette,
  LuShield,
  LuUserCheck,
  LuUsers,
  LuVote,
} from 'react-icons/lu'
import { ApiEndpoints } from '~components/Auth/api'
import { useSubscription } from '~components/Auth/Subscription'
import { useAuth } from '~components/Auth/useAuth'
import { ListStateAlert } from '~components/shared/Feedback/ListStateAlert'
import { PlanId } from '~constants'
import { QueryKeys } from '~src/queries/keys'
import PricingCard from './Card'
import { useSubscriptionCheckout } from './use-subscription-checkout'

export type Plan = {
  id: number
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
    customPlan: boolean
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
  planId: number | null
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

export const usePlanTranslations = (plans?: Plan[]) => {
  const { t } = useTranslation()

  const byId = useMemo(() => {
    const m = new Map<PlanId, Plan>()
    plans?.forEach((p) => m.set(p.id, p))
    return m
  }, [plans])

  const getMembers = (id: PlanId, fallback = 100) => byId.get(id)?.organization?.maxCensus ?? fallback
  const getProcesses = (id: PlanId, fallback = 10) => byId.get(id)?.organization?.maxProcesses ?? fallback
  const getTeamMembers = (id: PlanId, fallback = 1) => byId.get(id)?.organization?.teamMembers ?? fallback
  const get2FAsms = (id: PlanId, fallback = 0) => byId.get(id)?.features?.['2FAsms'] ?? fallback
  const get2FAemail = (id: PlanId, fallback = 0) => byId.get(id)?.features?.['2FAemail'] ?? fallback

  const get2FA = (id: PlanId) => {
    const hasEmail = Number(get2FAemail(id)) > 0
    const hasSms = Number(get2FAsms(id)) > 0

    const suffix =
      hasSms && hasEmail
        ? t('pricing.2fa_suffix_both', { defaultValue: 'Email & SMS' })
        : hasEmail
          ? t('pricing.2fa_suffix_email', { defaultValue: 'Email' })
          : t('pricing.2fa_suffix_sms', { defaultValue: 'SMS' })

    return suffix
  }

  const translations = {
    [PlanId.Free]: {
      title: t('pricing.free_title', { defaultValue: 'Free' }),
      subtitle: t('pricing.free_subtitle', {
        defaultValue: 'Perfect for getting started',
      }),
      features: [
        {
          icon: LuUsers,
          text: t('pricing.core_voting', {
            defaultValue: 'Up to {{ count }} members',
            count: getMembers(PlanId.Free, 100),
          }),
        },
        {
          icon: LuVote,
          text: t('pricing.yearly_processes', {
            defaultValue: '{{ count }} votes per year¹',
            count: getProcesses(PlanId.Free, 10),
          }),
        },
        {
          icon: LuUserCheck,
          text: t('pricing.up_to_admins', {
            defaultValue: '{{ count }} admins',
            count: getTeamMembers(PlanId.Free, 1),
          }),
        },
        {
          icon: LuCircleCheckBig,
          text: t('pricing.different_voting_methods', { defaultValue: 'Different voting methods' }),
        },
        {
          icon: LuShield,
          text: t('pricing.2fa', {
            suffix: get2FA(PlanId.Free),
            defaultValue: '2FA authentication² ({{suffix}})',
          }),
        },
        { icon: LuChartColumn, text: t('pricing.basic_analytics', { defaultValue: 'Basic analytics' }) },
        { icon: LuMail, text: t('pricing.ticket_support_72', { defaultValue: 'Email support (72h)' }) },
      ],
    },
    [PlanId.Essential]: {
      title: t('pricing.essential_title', { defaultValue: 'Essential' }),
      subtitle: t('pricing.essential_subtitle', {
        defaultValue: 'For growing organizations',
      }),
      features: [
        {
          icon: LuUsers,
          text: t('pricing.core_voting', {
            count: getMembers(PlanId.Essential, 500),
          }),
        },
        {
          icon: LuVote,
          text: t('pricing.yearly_processes', {
            count: getProcesses(PlanId.Essential, 20),
          }),
        },
        {
          icon: LuUserCheck,
          text: t('pricing.up_to_admins', {
            count: getTeamMembers(PlanId.Essential, 1),
          }),
        },
        { icon: LuCircleCheckBig, text: t('pricing.different_voting_methods') },
        {
          icon: LuShield,
          text: t('pricing.2fa', {
            suffix: get2FA(PlanId.Essential),
          }),
        },
        { icon: LuChartColumn, text: t('pricing.basic_analytics', { defaultValue: 'Basic analytics' }) },
        { icon: LuMail, text: t('pricing.ticket_support_48', { defaultValue: 'Email support (48h)' }) },
      ],
    },
    [PlanId.Premium]: {
      title: t('pricing.premium_title', { defaultValue: 'Premium' }),
      subtitle: t('pricing.premium_subtitle', {
        defaultValue: 'For established organizations',
      }),
      features: [
        {
          icon: LuUsers,
          text: t('pricing.core_voting', {
            count: getMembers(PlanId.Premium, 2000),
          }),
        },
        {
          icon: LuVote,
          text: t('pricing.yearly_processes', {
            count: getProcesses(PlanId.Premium, 50),
          }),
        },
        {
          icon: LuUserCheck,
          text: t('pricing.up_to_admins', {
            count: getTeamMembers(PlanId.Premium, 5),
          }),
        },
        { icon: LuCircleCheckBig, text: t('pricing.different_voting_methods') },
        {
          icon: LuShield,
          text: t('pricing.2fa', {
            suffix: get2FA(PlanId.Premium),
          }),
        },
        { icon: LuPalette, text: t('pricing.custom_branding', { defaultValue: 'Custom branding*' }) },
        { icon: LuMail, text: t('pricing.priority_support', { defaultValue: 'Priority email support (24h)' }) },
      ],
    },
    [PlanId.Custom]: {
      title: t('pricing.custom_title', { defaultValue: 'Custom' }),
      subtitle: t('pricing.custom_subtitle', {
        defaultValue: 'Tailored for your needs',
      }),
    },
  }

  return translations
}

type NormalizeFn = (value?: string | null) => string | undefined

type TranslateFn = (rawName?: string | null, fallback?: string | null) => string | undefined

const normalizeName: NormalizeFn = (value) => value?.trim().toLowerCase() || undefined

export const usePlanNameTranslator = () => {
  const { data: plans } = usePlans()
  const planTranslations = usePlanTranslations()

  const planTitleByName = useMemo(() => {
    if (!plans?.length) return {}

    return plans.reduce<Record<string, string>>((acc, plan) => {
      const normalizedPlanName = normalizeName(plan.name)
      if (normalizedPlanName) {
        acc[normalizedPlanName] = planTranslations[plan.id]?.title || plan.name
      }
      return acc
    }, {})
  }, [plans, planTranslations])

  const translatePlanName = useCallback<TranslateFn>(
    (rawName, fallback) => {
      const normalizedName = normalizeName(rawName)
      if (normalizedName && planTitleByName[normalizedName]) {
        return planTitleByName[normalizedName]
      }
      if (fallback) return fallback
      return rawName ?? undefined
    },
    [planTitleByName]
  )

  return translatePlanName
}

export const SubscriptionPlans = () => {
  const { subscription, error: subscriptionError } = useSubscription()
  const { data: plans, isLoading, error: plansError } = usePlans()
  const translations = usePlanTranslations(plans)
  const scheckout = useSubscriptionCheckout()
  const { t } = useTranslation()

  const methods = useForm<SubscriptionCheckoutFormValues>({
    defaultValues: {
      billingPeriod: 'year',
      planId: null,
    },
  })

  const { handleSubmit } = methods
  const period = methods.watch('billingPeriod')

  const onSubmit = (data: SubscriptionCheckoutFormValues) => {
    scheckout.showCheckout(data)
  }

  const cards = useMemo(() => {
    if (!plans) return []

    return plans.map((plan) => {
      return {
        popular: plan.id === PlanId.Premium,
        title: translations[plan.id]?.title || plan.name,
        subtitle: translations[plan.id]?.subtitle || '',
        price: period === 'year' ? plan.yearlyPrice / 12 : plan.monthlyPrice,
        features: translations[plan.id]?.features || [],
        isCurrentPlan: subscription && plan.id === subscription?.plan.id,
      }
    })
  }, [plans, subscription, translations, period])

  const error = plansError ?? subscriptionError
  const hasError = !!error && !isLoading
  const isEmpty = (plans?.length ?? 0) === 0 && !isLoading && !hasError
  const showAlert = hasError || isEmpty
  const alertTitle = hasError
    ? t('pricing.load_error', { defaultValue: 'Unable to load plans' })
    : t('pricing.empty', { defaultValue: 'No plans found' })
  const alertDescription = hasError
    ? error instanceof Error
      ? error.message.toString()
      : t('pricing.load_error_description', { defaultValue: 'Please try again.' })
    : t('pricing.empty_description', { defaultValue: 'Check back later for available plans.' })

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex flexDir='column' gap={4}>
          {isLoading && (
            <ProgressRoot value={null}>
              <ProgressTrack>
                <ProgressRange />
              </ProgressTrack>
            </ProgressRoot>
          )}
          {showAlert && (
            <ListStateAlert
              show
              status={hasError ? 'error' : 'info'}
              title={alertTitle}
              description={alertDescription}
            />
          )}
          <TabsRoot
            variant='settings'
            alignSelf='center'
            value={period}
            onValueChange={({ value }) => methods.setValue('billingPeriod', value as 'month' | 'year')}
          >
            <TabsList>
              <TabsTrigger value='month'>
                <Trans i18nKey='monthly'>Monthly</Trans>
              </TabsTrigger>
              <TabsTrigger value='year'>
                <Trans i18nKey='annual'>
                  Annual
                  <TagRoot colorPalette='green' ml={2} size='sm' fontWeight='extrabold'>
                    <TagLabel>Save 40%</TagLabel>
                  </TagRoot>
                </Trans>
              </TabsTrigger>
            </TabsList>
          </TabsRoot>
          <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={6}>
            {cards.map((card, idx) => (
              <PricingCard key={idx} plan={plans[idx]} {...card} />
            ))}
          </SimpleGrid>
        </Flex>
      </form>
    </FormProvider>
  )
}

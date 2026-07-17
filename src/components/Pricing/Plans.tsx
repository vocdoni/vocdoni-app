import { Flex, Progress, SimpleGrid, Tabs, Tag } from '@chakra-ui/react'
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
import { useSubscription } from '~components/Auth/Subscription'
import { ListStateAlert } from '~components/Feedback/ListStateAlert'
import { getPlanKey, isPlanNamed, PlanName } from '~constants'
import { usePlans, type Plan, type SubscriptionCheckoutFormValues } from '~queries/plans'
import PricingCard from './Card'
import { useSubscriptionCheckout } from './use-subscription-checkout'

// Re-exported for existing consumers; the canonical definitions live in the queries layer.
export { usePlans }
export type { Plan, SubscriptionCheckoutFormValues }

export const usePlanTranslations = (plans?: Plan[]) => {
  const { t } = useTranslation()

  const byName = useMemo(() => {
    const m = new Map<string, Plan>()
    plans?.forEach((p) => {
      const key = normalizeName(p.name)
      if (key) m.set(key, p)
    })
    return m
  }, [plans])

  const get = (name: PlanName) => byName.get(name.toLowerCase())
  const getMembers = (name: PlanName, fallback = 100) => get(name)?.organization?.maxCensus ?? fallback
  const getProcesses = (name: PlanName, fallback = 10) => get(name)?.organization?.maxProcesses ?? fallback
  const getTeamMembers = (name: PlanName, fallback = 1) => get(name)?.organization?.teamMembers ?? fallback
  const get2FAsms = (name: PlanName, fallback = 0) => get(name)?.features?.['2FAsms'] ?? fallback
  const get2FAemail = (name: PlanName, fallback = 0) => get(name)?.features?.['2FAemail'] ?? fallback

  const get2FA = (name: PlanName) => {
    const hasEmail = Number(get2FAemail(name)) > 0
    const hasSms = Number(get2FAsms(name)) > 0

    const suffix =
      hasSms && hasEmail
        ? t('pricing.2fa_suffix_both', { defaultValue: 'Email & SMS' })
        : hasEmail
          ? t('pricing.2fa_suffix_email', { defaultValue: 'Email' })
          : t('pricing.2fa_suffix_sms', { defaultValue: 'SMS' })

    return suffix
  }

  const translations = {
    [PlanName.Free]: {
      title: t('pricing.free_title', { defaultValue: 'Free' }),
      subtitle: t('pricing.free_subtitle', {
        defaultValue: 'Perfect for getting started',
      }),
      features: [
        {
          icon: LuUsers,
          text: t('pricing.core_voting', {
            defaultValue: 'Up to {{ count }} members',
            count: getMembers(PlanName.Free, 100),
          }),
        },
        {
          icon: LuVote,
          text: t('pricing.yearly_processes', {
            defaultValue: '{{ count }} votes per year¹',
            count: getProcesses(PlanName.Free, 10),
          }),
        },
        {
          icon: LuUserCheck,
          text: t('pricing.up_to_admins', {
            defaultValue: '{{ count }} admins',
            count: getTeamMembers(PlanName.Free, 1),
          }),
        },
        {
          icon: LuCircleCheckBig,
          text: t('pricing.different_voting_methods', { defaultValue: 'Different voting methods' }),
        },
        {
          icon: LuShield,
          text: t('pricing.2fa', {
            suffix: get2FA(PlanName.Free),
            defaultValue: '2FA authentication² ({{suffix}})',
          }),
        },
        { icon: LuChartColumn, text: t('pricing.basic_analytics', { defaultValue: 'Basic analytics' }) },
        { icon: LuMail, text: t('pricing.ticket_support_72', { defaultValue: 'Email support (72h)' }) },
      ],
    },
    [PlanName.Starter]: {
      title: t('pricing.essential_title', { defaultValue: 'Essential' }),
      subtitle: t('pricing.essential_subtitle', {
        defaultValue: 'For growing organizations',
      }),
      features: [
        {
          icon: LuUsers,
          text: t('pricing.core_voting', {
            count: getMembers(PlanName.Starter, 500),
          }),
        },
        {
          icon: LuVote,
          text: t('pricing.yearly_processes', {
            count: getProcesses(PlanName.Starter, 20),
          }),
        },
        {
          icon: LuUserCheck,
          text: t('pricing.up_to_admins', {
            count: getTeamMembers(PlanName.Starter, 1),
          }),
        },
        { icon: LuCircleCheckBig, text: t('pricing.different_voting_methods') },
        {
          icon: LuShield,
          text: t('pricing.2fa', {
            suffix: get2FA(PlanName.Starter),
          }),
        },
        { icon: LuChartColumn, text: t('pricing.basic_analytics', { defaultValue: 'Basic analytics' }) },
        { icon: LuMail, text: t('pricing.ticket_support_48', { defaultValue: 'Email support (48h)' }) },
      ],
    },
    [PlanName.Professional]: {
      title: t('pricing.premium_title', { defaultValue: 'Premium' }),
      subtitle: t('pricing.premium_subtitle', {
        defaultValue: 'For established organizations',
      }),
      features: [
        {
          icon: LuUsers,
          text: t('pricing.core_voting', {
            count: getMembers(PlanName.Professional, 2000),
          }),
        },
        {
          icon: LuVote,
          text: t('pricing.yearly_processes', {
            count: getProcesses(PlanName.Professional, 50),
          }),
        },
        {
          icon: LuUserCheck,
          text: t('pricing.up_to_admins', {
            count: getTeamMembers(PlanName.Professional, 5),
          }),
        },
        { icon: LuCircleCheckBig, text: t('pricing.different_voting_methods') },
        {
          icon: LuShield,
          text: t('pricing.2fa', {
            suffix: get2FA(PlanName.Professional),
          }),
        },
        { icon: LuPalette, text: t('pricing.custom_branding', { defaultValue: 'Custom branding*' }) },
        { icon: LuMail, text: t('pricing.priority_support', { defaultValue: 'Priority email support (24h)' }) },
      ],
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
        const planKey = getPlanKey(plan)
        acc[normalizedPlanName] = (planKey ? planTranslations[planKey]?.title : undefined) || plan.name
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

// Synthetic plan backing the hardcoded custom card. PricingCard short-circuits all
// plan-data usage when `isCustom` is set, so a minimal shape is enough.
const CUSTOM_PLAN = { id: 'custom', name: 'Custom', organization: {} } as unknown as Plan

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

    const planCards = plans.map((plan) => {
      const key = getPlanKey(plan)
      return {
        plan,
        isCustom: false,
        popular: isPlanNamed(plan, PlanName.Professional),
        title: (key ? translations[key]?.title : undefined) || plan.name,
        subtitle: (key ? translations[key]?.subtitle : undefined) || '',
        price: period === 'year' ? plan.yearlyPrice / 12 : plan.monthlyPrice,
        features: (key ? translations[key]?.features : undefined) || [],
        isCurrentPlan: !!subscription && isPlanNamed(plan, subscription.plan?.name),
      }
    })

    // The "custom" plan no longer exists in the API; it's hardcoded and appended last.
    planCards.push({
      plan: CUSTOM_PLAN,
      isCustom: true,
      popular: false,
      title: t('pricing.custom_title', { defaultValue: 'Custom' }),
      subtitle: t('pricing.custom_subtitle', { defaultValue: 'Tailored for your needs' }),
      price: 0,
      features: [],
      isCurrentPlan: false,
    })

    return planCards
  }, [plans, subscription, translations, period, t])

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
            <Progress.Root value={null}>
              <Progress.Track>
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
          )}
          {showAlert && (
            <ListStateAlert
              show
              status={hasError ? 'error' : 'info'}
              title={alertTitle}
              description={alertDescription}
            />
          )}
          <Tabs.Root
            alignSelf='center'
            value={period}
            onValueChange={({ value }) => methods.setValue('billingPeriod', value as 'month' | 'year')}
          >
            <Tabs.List>
              <Tabs.Trigger value='month'>
                <Trans i18nKey='monthly'>Monthly</Trans>
              </Tabs.Trigger>
              <Tabs.Trigger value='year'>
                <Trans i18nKey='annual'>
                  Annual
                  <Tag.Root variant='subtle' colorPalette='green' ml={2} fontSize='xs' fontWeight='extrabold' py={0.5}>
                    <Tag.Label>Save 40%</Tag.Label>
                  </Tag.Root>
                </Trans>
              </Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>
          <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={6}>
            {cards.map((card) => (
              <PricingCard key={card.plan.id} {...card} />
            ))}
          </SimpleGrid>
        </Flex>
      </form>
    </FormProvider>
  )
}

import { Alert, Button, Center, Flex, Spinner, Stack, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useSubscription } from '~components/Auth/Subscription'
import { BookerModalButton } from '~components/Dashboard/Booker'
import { DashboardBox } from '~components/Dashboard/Contents'
import { useToast } from '~components/Toast'
import { usePortalSession } from '~queries/stripe'

/**
 * Integrator subscription tab: shows the current plan and a "Change plan" action that opens the
 * shared Cal.com contact modal (integrators change plans by talking to us, not via self-serve
 * checkout). Paid plans also expose the Stripe billing portal.
 */
const IntegratorSubscriptionTab = () => {
  const { t } = useTranslation()
  const { subscription, loading } = useSubscription()
  const portal = usePortalSession()
  const toast = useToast()

  const openPortal = async () => {
    try {
      const { portalURL } = await portal.mutateAsync()
      if (portalURL) window.open(portalURL, '_blank', 'noopener,noreferrer')
    } catch (e) {
      toast({
        type: 'error',
        title: t('integrators.subscription.portal_error', { defaultValue: 'Could not open the billing portal' }),
        description: (e as Error).message,
      })
    }
  }

  if (loading) {
    return (
      <Center py={12}>
        <Spinner />
      </Center>
    )
  }

  if (!subscription?.plan) {
    return (
      <Alert.Root status='info'>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>
            {t('integrators.subscription.unavailable', { defaultValue: 'Subscription details are unavailable' })}
          </Alert.Title>
        </Alert.Content>
      </Alert.Root>
    )
  }

  const { plan, subscriptionDetails } = subscription
  const isPaid = !plan.default && (plan.monthlyPrice > 0 || plan.yearlyPrice > 0)

  return (
    <DashboardBox p={6} justifyContent='flex-start'>
      <Flex justify='space-between' align='flex-start' gap={4} wrap='wrap'>
        <Stack gap={1}>
          <Text fontSize='sm' color='texts.subtle'>
            {t('integrators.subscription.current_plan', { defaultValue: 'Current plan' })}
          </Text>
          <Text size='2xl' fontWeight='bold'>
            {plan.name}
          </Text>
          <Text fontSize='sm' color='texts.subtle'>
            {subscriptionDetails.active
              ? t('integrators.subscription.active', { defaultValue: 'Active' })
              : t('integrators.subscription.inactive', { defaultValue: 'Inactive' })}
          </Text>
        </Stack>
        <Flex gap={2} wrap='wrap'>
          <BookerModalButton variant='solid' colorPalette='gray'>
            {t('integrators.change_plan', { defaultValue: 'Change plan' })}
          </BookerModalButton>
          {isPaid && (
            <Button variant='outline' onClick={openPortal} loading={portal.isPending}>
              {t('integrators.subscription.billing_details', { defaultValue: 'Billing details' })}
            </Button>
          )}
        </Flex>
      </Flex>
    </DashboardBox>
  )
}

export default IntegratorSubscriptionTab

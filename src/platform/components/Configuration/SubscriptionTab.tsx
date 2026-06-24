import { Alert, Button, Card, Center, Flex, Spinner, Stack, Text } from '@chakra-ui/react'
import { getApiErrorMessage } from '~platform/api/client'
import { toaster } from '~platform/components/ui/toaster'
import { UpgradePlansButton } from '~platform/components/Integrator/UpgradeDialog'
import { usePortalSession, useSubscription } from '~platform/queries/subscription'

const formatDate = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  return isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

const SubscriptionTab = () => {
  const { data, isLoading, error } = useSubscription()
  const portal = usePortalSession()

  const openPortal = async () => {
    try {
      const { portalURL } = await portal.mutateAsync()
      if (portalURL) window.open(portalURL, '_blank', 'noopener,noreferrer')
    } catch (err) {
      toaster.create({
        type: 'error',
        title: 'Could not open billing portal',
        description: getApiErrorMessage(err),
        closable: true,
      })
    }
  }

  if (isLoading) {
    return (
      <Center py={12}>
        <Spinner />
      </Center>
    )
  }

  // GET subscription is admin-gated; managers get a 401.
  if (error || !data) {
    return (
      <Alert.Root status='info'>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Subscription is admin-only</Alert.Title>
          <Alert.Description>Only organization admins can view subscription details.</Alert.Description>
        </Alert.Content>
      </Alert.Root>
    )
  }

  const { plan, subscriptionDetails } = data
  const isPaid = !plan.default && (plan.monthlyPrice > 0 || plan.yearlyPrice > 0)

  return (
    <Stack gap={6}>
      <Card.Root>
        <Card.Body>
          <Flex justify='space-between' align='flex-start' gap={4} wrap='wrap'>
            <Stack gap={1}>
              <Text fontSize='sm' color='fg.muted'>
                Current plan
              </Text>
              <Text fontSize='2xl' fontWeight='bold'>
                {plan.name}
              </Text>
              <Text fontSize='sm' color='fg.muted'>
                {subscriptionDetails.active ? 'Active' : 'Inactive'} · Renews{' '}
                {formatDate(subscriptionDetails.renewalDate)}
              </Text>
            </Stack>
            <Flex gap={2} wrap='wrap'>
              <UpgradePlansButton label='Change plan' />
              {isPaid && (
                <Button variant='outline' onClick={openPortal} loading={portal.isPending}>
                  Billing details
                </Button>
              )}
            </Flex>
          </Flex>
        </Card.Body>
      </Card.Root>
    </Stack>
  )
}

export default SubscriptionTab

import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  CloseButton,
  Dialog,
  Flex,
  Heading,
  HStack,
  Icon,
  Portal,
  SegmentGroup,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react'
import { BillingAddressElement, CheckoutProvider, PaymentElement, useCheckout } from '@stripe/react-stripe-js/checkout'
import { loadStripe, type Stripe, type StripeCheckoutOptions } from '@stripe/stripe-js'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { LuArrowLeft, LuSparkles } from 'react-icons/lu'
import { ApiEndpoints } from '~platform/api/endpoints'
import { useAuth } from '~platform/auth/AuthContext'
import { useOrg } from '~platform/auth/OrgContext'
import { toaster } from '~platform/components/ui/toaster'
import { QueryKeys } from '~platform/queries/keys'
import { Plan, useIntegratorPlans } from '~platform/queries/plans'
import { useSubscription } from '~platform/queries/subscription'

type BillingPeriod = 'month' | 'year'

const ensure0x = (address: string) => (address.startsWith('0x') ? address : `0x${address}`)

const formatPrice = (cents: number) => `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`

// Where the "Custom" plan card sends people. No Stripe involved: custom integrator plans are
// arranged by talking to the team rather than self-serve checkout.
const contactURL = 'https://vocdoni.io/contact'

// Loaded once; loadStripe('') throws, and the key is optional.
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const stripePromise: Promise<Stripe | null> | null = publishableKey ? loadStripe(publishableKey) : null

type CheckoutResponse = { clientSecret: string; sessionId: string }

const PlanCard = ({
  plan,
  period,
  isCurrent,
  onSelect,
}: {
  plan: Plan
  period: BillingPeriod
  isCurrent: boolean
  onSelect: (plan: Plan) => void
}) => {
  const price = period === 'year' ? plan.yearlyPrice / 12 : plan.monthlyPrice
  return (
    <Card.Root borderColor={isCurrent ? 'blue.solid' : undefined} borderWidth={isCurrent ? '2px' : undefined}>
      <Card.Body gap={3}>
        <HStack justify='space-between' align='start'>
          <Heading size='md'>{plan.name}</Heading>
          {isCurrent && <Badge colorPalette='blue'>Current plan</Badge>}
        </HStack>
        <HStack align='baseline' gap={1}>
          <Text fontSize='2xl' fontWeight='bold'>
            {formatPrice(price)}
          </Text>
          <Text color='fg.muted' fontSize='sm'>
            /mo{period === 'year' ? ' billed yearly' : ''}
          </Text>
        </HStack>
        <Stack gap={1} fontSize='sm' color='fg.muted'>
          <Text>{plan.integratorLimits.maxManagedOrgs} managed organizations</Text>
          <Text>{plan.integratorLimits.maxManagedProcesses} voting processes</Text>
          <Text>{plan.integratorLimits.maxManagedCensusSize} census size</Text>
        </Stack>
        {isCurrent ? (
          <Button mt={2} variant='outline' disabled>
            Current plan
          </Button>
        ) : (
          <Button mt={2} onClick={() => onSelect(plan)}>
            Choose {plan.name}
          </Button>
        )}
      </Card.Body>
    </Card.Root>
  )
}

// CustomPlanCard offers a tailored integrator plan when there is no self-serve option to show
// (no paid plans configured in Stripe). It needs no Stripe — the CTA just opens the contact page.
const CustomPlanCard = () => (
  <Card.Root>
    <Card.Body gap={3}>
      <Heading size='md'>Custom</Heading>
      <HStack align='baseline' gap={1}>
        <Text fontSize='2xl' fontWeight='bold'>
          Let&apos;s talk
        </Text>
      </HStack>
      <Text fontSize='sm' color='fg.muted'>
        Have specific integration needs or higher volumes? We&apos;ll tailor an integrator plan — managed organizations,
        voting processes and census size — to fit your project.
      </Text>
      <Button asChild mt={2}>
        <a href={contactURL} target='_blank' rel='noopener noreferrer'>
          <Icon as={LuSparkles} />
          Contact us
        </a>
      </Button>
    </Card.Body>
  </Card.Root>
)

const PlansView = ({ onSelect }: { onSelect: (plan: Plan, period: BillingPeriod) => void }) => {
  const { data: plans, isLoading, error } = useIntegratorPlans()
  const { data: subscription } = useSubscription()
  const currentPlanId = subscription?.plan.id
  const [period, setPeriod] = useState<BillingPeriod>('year')

  if (isLoading) {
    return (
      <Flex justify='center' py={10}>
        <Spinner />
      </Flex>
    )
  }
  if (error) {
    return (
      <Alert.Root status='error'>
        <Alert.Indicator />
        <Alert.Title>Unable to load plans</Alert.Title>
      </Alert.Root>
    )
  }
  if (!plans?.length) {
    return <CustomPlanCard />
  }

  return (
    <Stack gap={5}>
      <Flex justify='center'>
        <SegmentGroup.Root value={period} onValueChange={(e) => setPeriod(e.value as BillingPeriod)} size='sm'>
          <SegmentGroup.Indicator />
          <SegmentGroup.Item value='month'>
            <SegmentGroup.ItemText>Monthly</SegmentGroup.ItemText>
            <SegmentGroup.ItemHiddenInput />
          </SegmentGroup.Item>
          <SegmentGroup.Item value='year'>
            <SegmentGroup.ItemText>Yearly</SegmentGroup.ItemText>
            <SegmentGroup.ItemHiddenInput />
          </SegmentGroup.Item>
        </SegmentGroup.Root>
      </Flex>
      <Stack gap={4}>
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            period={period}
            isCurrent={plan.id === currentPlanId}
            onSelect={(p) => onSelect(p, period)}
          />
        ))}
        {/* Custom is always offered as the final, contact-only option after the self-serve plans. */}
        <CustomPlanCard />
      </Stack>
    </Stack>
  )
}

const CheckoutForm = ({ onBack, onComplete }: { onBack: () => void; onComplete: () => Promise<void> }) => {
  const checkoutState = useCheckout()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (checkoutState.type === 'loading') {
    return (
      <Flex justify='center' py={10}>
        <Spinner />
      </Flex>
    )
  }
  if (checkoutState.type === 'error') {
    return (
      <Stack gap={4}>
        <Button alignSelf='flex-start' variant='ghost' onClick={onBack}>
          <Icon as={LuArrowLeft} /> Back
        </Button>
        <Alert.Root status='error'>
          <Alert.Indicator />
          <Alert.Title>{checkoutState.error.message}</Alert.Title>
        </Alert.Root>
      </Stack>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (checkoutState.type !== 'success') return
    setIsSubmitting(true)
    setError(null)
    try {
      const result = await checkoutState.checkout.confirm({ redirect: 'if_required' })
      if (result.type === 'error') {
        setError(result.error.message)
        setIsSubmitting(false)
      } else {
        await onComplete()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
      setIsSubmitting(false)
    }
  }

  return (
    <Box as='form' onSubmit={handleSubmit}>
      <Stack gap={5}>
        <Button alignSelf='flex-start' variant='ghost' onClick={onBack} type='button'>
          <Icon as={LuArrowLeft} /> Back
        </Button>
        <BillingAddressElement options={{ display: { name: 'split' } }} />
        <PaymentElement />
        {error && (
          <Alert.Root status='error'>
            <Alert.Indicator />
            <Alert.Title>{error}</Alert.Title>
          </Alert.Root>
        )}
        <Button type='submit' w='full' loading={isSubmitting} disabled={checkoutState.type !== 'success'}>
          Subscribe
        </Button>
      </Stack>
    </Box>
  )
}

const CheckoutView = ({
  plan,
  period,
  onBack,
  onClose,
}: {
  plan: Plan
  period: BillingPeriod
  onBack: () => void
  onClose: () => void
}) => {
  const { bearedFetch } = useAuth()
  const { selectedAddress } = useOrg()
  const queryClient = useQueryClient()

  const fetchClientSecret = useCallback(async () => {
    const data = await bearedFetch<CheckoutResponse>(ApiEndpoints.SubscriptionCheckout, {
      method: 'POST',
      body: {
        lookupKey: plan.id,
        billingPeriod: period,
        address: ensure0x(selectedAddress!),
        locale: 'en',
      },
    })
    return data.clientSecret
  }, [bearedFetch, plan.id, period, selectedAddress])

  const onComplete = async () => {
    toaster.create({ type: 'success', title: 'Subscription active', closable: true })
    await queryClient.invalidateQueries({ queryKey: QueryKeys.integrator.info(selectedAddress) })
    onClose()
  }

  const options: StripeCheckoutOptions = { fetchClientSecret }

  if (!stripePromise) {
    return (
      <Alert.Root status='warning'>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Payments are temporarily unavailable</Alert.Title>
          <Alert.Description>Please try again later.</Alert.Description>
        </Alert.Content>
      </Alert.Root>
    )
  }

  return (
    <CheckoutProvider stripe={stripePromise} options={options}>
      <CheckoutForm onBack={onBack} onComplete={onComplete} />
    </CheckoutProvider>
  )
}

/**
 * Admin-only action to upgrade the active organization to a paid integrator plan via Stripe.
 * Managers can't check out (the backend requires admin), so it renders nothing for them.
 */
export const UpgradePlansButton = ({ label = 'Upgrade plan' }: { label?: string }) => {
  const { isAdmin } = useOrg()
  const [open, setOpen] = useState(false)
  const [selection, setSelection] = useState<{ plan: Plan; period: BillingPeriod } | null>(null)

  if (!isAdmin) return null

  const close = () => {
    setOpen(false)
    setSelection(null)
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => (e.open ? setOpen(true) : close())}
      placement='center'
      size='lg'
      scrollBehavior='inside'
    >
      <Dialog.Trigger asChild>
        <Button size='sm'>
          <Icon as={LuSparkles} />
          {label}
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.CloseTrigger asChild>
              <CloseButton />
            </Dialog.CloseTrigger>
            <Dialog.Header>
              <Dialog.Title>
                {selection ? (
                  <HStack>
                    <Text>{selection.plan.name}</Text>
                    <Badge colorPalette='blue'>{selection.period === 'year' ? 'Yearly' : 'Monthly'}</Badge>
                  </HStack>
                ) : (
                  'Choose an integrator plan'
                )}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body pb={6}>
              {selection ? (
                <CheckoutView
                  plan={selection.plan}
                  period={selection.period}
                  onBack={() => setSelection(null)}
                  onClose={close}
                />
              ) : (
                <PlansView onSelect={(plan, period) => setSelection({ plan, period })} />
              )}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

import { AlertRoot as Alert, AlertDescription, Box, Button, Flex, Grid, IconButton } from '@chakra-ui/react'
import {
  BillingAddressElement,
  CheckoutProvider,
  PaymentElement,
  TaxIdElement,
  useCheckout,
} from '@stripe/react-stripe-js/checkout'
import { loadStripe, Stripe, StripeCheckoutOptions } from '@stripe/stripe-js'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ensure0x } from '~utils/address'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuArrowLeft } from 'react-icons/lu'
import { useAnalytics } from '~components/AnalyticsProvider'
import { ApiEndpoints } from '~components/Auth/api'
import { SubscriptionType, useSubscription } from '~components/Auth/Subscription'
import { useAuth } from '~components/Auth/useAuth'
import { useToast } from '~components/Toast'
import { useAppEnv } from '~src/app-env'
import { QueryKeys } from '~src/queries/keys'
import { useColorMode } from '~theme/color-mode'
import { AnalyticsEvents } from '~utils/analytics'
import { OrderSummary } from './OrderSummary'
import { PromotionCodeInput } from './PromotionCodeInput'
import { useSubscriptionCheckout } from './use-subscription-checkout'

export type SubscriptionPaymentData = {
  billingPeriod: 'month' | 'year'
  lookupKey: string
}

type CheckoutResponse = {
  clientSecret: string
  sessionId: string
}

const useUpdateSubscription = () => {
  const { bearedFetch, currentAddress } = useAuth()

  return useMutation<SubscriptionType>({
    mutationFn: async () =>
      await bearedFetch(ApiEndpoints.OrganizationSubscription.replace('{address}', ensure0x(currentAddress))),
  })
}

type SubscriptionPaymentProps = SubscriptionPaymentData & {
  onClose: () => void
}

type CheckoutFormProps = {
  onClose: () => void
  onComplete: () => Promise<void>
  sessionId: string | null
}

const CheckoutForm = ({ onComplete, sessionId }: CheckoutFormProps) => {
  const { t } = useTranslation()
  const checkoutState = useCheckout()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { showPlans } = useSubscriptionCheckout()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (checkoutState.type !== 'success') return

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await checkoutState.checkout.confirm({
        redirect: 'if_required',
        // Ensure we return to the same locale after the checkout process
        returnUrl: (() => {
          const url = new URL(window.location.href)
          if (sessionId) {
            url.searchParams.set('session_id', sessionId)
          }
          url.hash = '' // Remove hash if present, to match original behavior
          return url.toString()
        })(),
      })
      if (result.type === 'error') {
        setError(result.error.message)
        setIsSubmitting(false)
      } else {
        // Payment successful, trigger completion callback
        await onComplete()
      }
    } catch (err: any) {
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  if (checkoutState.type === 'loading') {
    return (
      <Box textAlign='center' py={8}>
        {t('loading', { defaultValue: 'Loading...' })}
      </Box>
    )
  }

  if (checkoutState.type === 'error') {
    return (
      <Box>
        <Flex justifyContent='flex-start' mb={4}>
          <IconButton aria-label={t('back', { defaultValue: 'Back' })} onClick={showPlans} variant='ghost'>
            <LuArrowLeft />
          </IconButton>
        </Flex>
        <Box color='red.500' textAlign='center'>
          {t('error.title', { defaultValue: 'Error' })}: {checkoutState.error.message}
        </Box>
      </Box>
    )
  }

  const { checkout } = checkoutState

  return (
    <Box as='form' onSubmit={handleSubmit}>
      <Flex justifyContent='flex-start' mb={6}>
        <IconButton aria-label={t('back', { defaultValue: 'Back' })} onClick={showPlans} variant='ghost'>
          <LuArrowLeft />
        </IconButton>
      </Flex>

      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
        {/* Left Column: Order Summary + Promo Code */}
        <Flex as='section' flexDirection='column' gap={5}>
          <OrderSummary checkout={checkout} />
          <PromotionCodeInput />
        </Flex>

        {/* Right Column: Payment Element + Submit */}
        <Flex as='section' flexDirection='column' gap={5}>
          <BillingAddressElement options={{ display: { name: 'split' } }} />
          <TaxIdElement
            options={{
              visibility: 'auto',
            }}
          />
          <PaymentElement />

          {error && (
            <Alert status='error'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type='submit' w='full' mt={6} loading={isSubmitting} disabled={checkoutState.type !== 'success'}>
            {t('subscribe', { defaultValue: 'Subscribe' })}
          </Button>
        </Flex>
      </Grid>
    </Box>
  )
}

export const SubscriptionPayment = ({ lookupKey, billingPeriod, onClose }: SubscriptionPaymentProps) => {
  const { bearedFetch, currentAddress } = useAuth()
  const { t, i18n } = useTranslation()
  const { subscription } = useSubscription()
  const { mutateAsync: checkSubscription } = useUpdateSubscription()
  const toast = useToast()
  const { trackPlausibleEvent } = useAnalytics()
  const { colorMode } = useColorMode()
  const stripePublicKey = useAppEnv().STRIPE_PUBLIC_KEY

  // Lazy initializer so loadStripe runs once (not on every render), and only when
  // a key is configured — loadStripe('') throws, and STRIPE_PUBLIC_KEY is optional.
  const [stripePromise] = useState<Promise<Stripe | null> | null>(() =>
    stripePublicKey
      ? loadStripe(stripePublicKey, {
          locale: i18n.resolvedLanguage as any,
          betas: ['custom_checkout_tax_id_1'],
        })
      : null
  )
  const [sessionId, setSessionId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const fetchClientSecret = useCallback(async () => {
    if (!currentAddress) {
      toast({
        type: 'error',
        title: t('error.title', { defaultValue: 'Error' }),
        description: t('wallet_not_connected', { defaultValue: 'Wallet not connected' }),
      })
      onClose()
      return null
    }

    const signerAddress = currentAddress
    if (signerAddress) {
      const body = {
        lookupKey,
        billingPeriod,
        address: signerAddress,
        locale: i18n.resolvedLanguage,
      }
      // Create a Checkout Session
      return await bearedFetch<CheckoutResponse>(ApiEndpoints.SubscriptionCheckout, {
        method: 'POST',
        body,
      })
        .then((data) => {
          // Store session ID for use in return URL
          setSessionId(data.sessionId)
          // Return the client secret, required by stripe.js
          return data.clientSecret
        })
        .catch((e) => {
          toast({
            type: 'error',
            title: t('error.title', { defaultValue: 'Error' }),
            description: e.message,
          })
          onClose()

          return null
        })
    }
    return await Promise.resolve('')
  }, [currentAddress, bearedFetch, lookupKey, i18n.resolvedLanguage, toast, t, onClose])

  const onComplete = async () => {
    let nsub = await checkSubscription()
    while (
      nsub.plan.id === subscription.plan.id &&
      nsub.subscriptionDetails.renewalDate === subscription.subscriptionDetails.renewalDate
    ) {
      await new Promise((resolve) => {
        return setTimeout(resolve, 200)
      })
      nsub = await checkSubscription()
    }
    await queryClient.invalidateQueries({ queryKey: QueryKeys.organization.subscription() })
    trackPlausibleEvent({
      name: AnalyticsEvents.SubscriptionSuccessful,
    })
    onClose()
  }

  const options: StripeCheckoutOptions = {
    fetchClientSecret,
    elementsOptions: {
      appearance: {
        theme: colorMode === 'dark' ? ('night' as const) : ('stripe' as const),
        variables: {
          // Stripe renders in an iframe, so theme CSS vars are unreachable; raw values mirror the `bg` token
          colorBackground: colorMode === 'dark' ? '#0a0a0a' : 'white',
        },
      },
    },
  }

  if (!stripePromise) {
    return (
      <Box id='checkout' p={4} color='red.500' textAlign='center'>
        {t('payment.stripe_unavailable', {
          defaultValue: 'Payments are temporarily unavailable. Please try again later.',
        })}
      </Box>
    )
  }

  return (
    <Box id='checkout' p={4}>
      <CheckoutProvider stripe={stripePromise} options={options}>
        <CheckoutForm onClose={onClose} onComplete={onComplete} sessionId={sessionId} />
      </CheckoutProvider>
    </Box>
  )
}

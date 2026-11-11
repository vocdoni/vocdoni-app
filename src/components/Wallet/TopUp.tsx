import {
  Alert,
  Box,
  Button,
  Card,
  Field,
  Flex,
  HStack,
  IconButton,
  Input,
  Separator,
  Text,
  VStack,
} from '@chakra-ui/react'
import {
  BillingAddressElement,
  CheckoutElementsProvider,
  PaymentElement,
  TaxIdElement,
  useCheckoutElements,
} from '@stripe/react-stripe-js/checkout'
import type { StripeCheckoutElementsSdkOptions } from '@stripe/stripe-js'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BackIcon } from '~theme/icons'
import { checkoutReturnBase, useCheckoutAppearance, useStripePromise } from '~components/Pricing/stripe'
import { useWalletTopUp, WALLET_TOPUP_MAX_CENTS, WALLET_TOPUP_MIN_CENTS } from '~queries/wallet'
import { currency, parseEuroAmountCents } from '~utils/numbers'

const PRESET_AMOUNTS_EUR = [50, 100, 500, 1000]

type WalletTopUpProps = {
  // Called when the payment is submitted, before Stripe may redirect the page away.
  onStart?: (amountCents: number) => void
  onDone: (amountCents: number) => void
  onCancel: () => void
}

type AmountStepProps = {
  amount: string
  onAmountChange: (amount: string) => void
  onContinue: (amountCents: number) => void
  onCancel: () => void
}

const AmountStep = ({ amount, onAmountChange, onContinue, onCancel }: AmountStepProps) => {
  const { t } = useTranslation()
  const trimmed = amount.trim()
  const amountCents = parseEuroAmountCents(trimmed)
  const isValid = amountCents !== null && amountCents >= WALLET_TOPUP_MIN_CENTS && amountCents <= WALLET_TOPUP_MAX_CENTS
  const hasTooManyDecimals = /^\d*\.\d{3,}$/.test(trimmed)

  return (
    <VStack align='stretch' gap={5}>
      <Field.Root invalid={trimmed !== '' && !isValid}>
        <Field.Label>{t('wallet.topup.amount', { defaultValue: 'Amount (EUR, VAT excluded)' })}</Field.Label>
        <Input
          type='number'
          inputMode='decimal'
          step='0.01'
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
        />
        <Field.HelperText>
          {t('wallet.topup.hint', { defaultValue: 'VAT is added at checkout from your billing details.' })}
        </Field.HelperText>
        <Field.ErrorText>
          {hasTooManyDecimals
            ? t('wallet.topup.amount_decimals', { defaultValue: 'Use at most 2 decimals.' })
            : t('wallet.topup.amount_range', {
                defaultValue: 'Enter an amount between {{min}} and {{max}}.',
                min: currency(WALLET_TOPUP_MIN_CENTS),
                max: currency(WALLET_TOPUP_MAX_CENTS),
              })}
        </Field.ErrorText>
      </Field.Root>

      <HStack gap={2} wrap='wrap'>
        {PRESET_AMOUNTS_EUR.map((preset) => (
          <Button key={preset} variant='outline' size='sm' onClick={() => onAmountChange(String(preset))}>
            {currency(preset * 100)}
          </Button>
        ))}
      </HStack>

      <Flex justify='flex-end' gap={3}>
        <Button variant='ghost' onClick={onCancel}>
          {t('cancel', { defaultValue: 'Cancel' })}
        </Button>
        <Button disabled={!isValid} onClick={() => amountCents !== null && onContinue(amountCents)}>
          {t('wallet.topup.continue', { defaultValue: 'Continue to payment' })}
        </Button>
      </Flex>
    </VStack>
  )
}

type PaymentStepProps = {
  amountCents: number
  onBack: () => void
  onStart?: (amountCents: number) => void
  onDone: (amountCents: number) => void
}

type CheckoutFormProps = {
  amountCents: number
  onBack: () => void
  onStart?: (amountCents: number) => void
  onDone: (amountCents: number) => void
}

const CheckoutForm = ({ amountCents, onBack, onStart, onDone }: CheckoutFormProps) => {
  const { t } = useTranslation()
  const checkoutState = useCheckoutElements()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (checkoutState.type !== 'success' || isSubmitting) return

    setIsSubmitting(true)
    setError(null)
    onStart?.(amountCents)

    try {
      // No returnUrl here: the session already carries the return URL sent with the top-up.
      const result = await checkoutState.checkout.confirm({ redirect: 'if_required' })
      if (result.type === 'error') {
        setError(result.error.message)
        setIsSubmitting(false)
      } else {
        // The wallet is credited by a webhook later; this only means the payment was accepted
        onDone(amountCents)
      }
    } catch (err: any) {
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  const backButton = (
    <IconButton aria-label={t('back', { defaultValue: 'Back' })} onClick={onBack} variant='ghost'>
      <BackIcon />
    </IconButton>
  )

  if (checkoutState.type === 'loading') {
    return (
      <Box textAlign='center' py={8}>
        {t('loading', { defaultValue: 'Loading...' })}
      </Box>
    )
  }

  if (checkoutState.type === 'error') {
    return (
      <VStack align='stretch' gap={4}>
        <Flex justify='flex-start'>{backButton}</Flex>
        <Alert.Root status='error'>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{checkoutState.error.message}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      </VStack>
    )
  }

  const { checkout } = checkoutState

  return (
    <Box as='form' onSubmit={handleSubmit}>
      <VStack align='stretch' gap={5}>
        <Flex justify='flex-start'>{backButton}</Flex>

        <Card.Root variant='section' size='md' gap={3}>
          <Flex justify='space-between'>
            <Text>{t('wallet.topup.amount_net', { defaultValue: 'Top-up (VAT excluded)' })}</Text>
            <Text>{currency(amountCents)}</Text>
          </Flex>
          {checkout.total && (
            <>
              <Flex justify='space-between'>
                <Text>{t('wallet.topup.vat', { defaultValue: 'VAT' })}</Text>
                <Text>{checkout.total.taxExclusive.amount}</Text>
              </Flex>
              <Separator />
              <Flex justify='space-between'>
                <Text fontWeight='bold'>{t('wallet.topup.total', { defaultValue: 'Total' })}</Text>
                <Text fontWeight='bold'>{checkout.total.total.amount}</Text>
              </Flex>
            </>
          )}
        </Card.Root>

        <BillingAddressElement options={{ display: { name: 'split' } }} />
        <TaxIdElement options={{ visibility: 'auto' }} />
        <PaymentElement />

        {error && (
          <Alert.Root status='error'>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}

        <Button type='submit' w='full' loading={isSubmitting}>
          {t('wallet.topup.pay', {
            defaultValue: 'Pay {{amount}}',
            amount: currency(amountCents),
          })}
        </Button>
      </VStack>
    </Box>
  )
}

type TopUpCheckoutProps = CheckoutFormProps & {
  stripePromise: NonNullable<ReturnType<typeof useStripePromise>>
}

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error))

// Opens the top-up session once for this amount, then mounts the provider with its client secret
const TopUpCheckout = ({ stripePromise, amountCents, onBack, onStart, onDone }: TopUpCheckoutProps) => {
  const { t, i18n } = useTranslation()
  const appearance = useCheckoutAppearance()
  const { mutateAsync: createTopUp } = useWalletTopUp()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  // StrictMode runs the effect twice in development: the ref keeps the session from being created twice
  const startedRef = useRef(false)

  // Stripe redirects a bank-redirect payment to returnURL + /{sessionId}; the wallet return route takes it from there.
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    createTopUp({
      amountCents,
      locale: i18n.resolvedLanguage,
      returnURL: checkoutReturnBase(),
    }).then(
      (topUp) => setClientSecret(topUp.clientSecret),
      (err) => setLoadError(errorMessage(err))
    )
  }, [createTopUp, amountCents, i18n.resolvedLanguage])

  if (loadError) {
    return (
      <VStack align='stretch' gap={4}>
        <Flex justify='flex-start'>
          <IconButton aria-label={t('back', { defaultValue: 'Back' })} onClick={onBack} variant='ghost'>
            <BackIcon />
          </IconButton>
        </Flex>
        <Alert.Root status='error'>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{loadError}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      </VStack>
    )
  }

  if (!clientSecret) {
    return (
      <Box textAlign='center' py={8}>
        {t('loading', { defaultValue: 'Loading...' })}
      </Box>
    )
  }

  const options: StripeCheckoutElementsSdkOptions = {
    clientSecret,
    elementsOptions: { appearance },
  }

  return (
    <CheckoutElementsProvider stripe={stripePromise} options={options}>
      <CheckoutForm amountCents={amountCents} onBack={onBack} onStart={onStart} onDone={onDone} />
    </CheckoutElementsProvider>
  )
}

const PaymentStep = ({ amountCents, onBack, onStart, onDone }: PaymentStepProps) => {
  const { t } = useTranslation()
  const stripePromise = useStripePromise()

  if (!stripePromise) {
    return (
      <VStack align='stretch' gap={4}>
        <Flex justify='flex-start'>
          <IconButton aria-label={t('back', { defaultValue: 'Back' })} onClick={onBack} variant='ghost'>
            <BackIcon />
          </IconButton>
        </Flex>
        <Box color='status.error.fg' textAlign='center'>
          {t('payment.stripe_unavailable', {
            defaultValue: 'Payments are temporarily unavailable. Please try again later.',
          })}
        </Box>
      </VStack>
    )
  }

  return (
    <TopUpCheckout
      stripePromise={stripePromise}
      amountCents={amountCents}
      onBack={onBack}
      onStart={onStart}
      onDone={onDone}
    />
  )
}

export const WalletTopUp = ({ onStart, onDone, onCancel }: WalletTopUpProps) => {
  const [amount, setAmount] = useState('')
  const [amountCents, setAmountCents] = useState<number | null>(null)

  if (amountCents === null) {
    return <AmountStep amount={amount} onAmountChange={setAmount} onContinue={setAmountCents} onCancel={onCancel} />
  }

  return <PaymentStep amountCents={amountCents} onBack={() => setAmountCents(null)} onStart={onStart} onDone={onDone} />
}

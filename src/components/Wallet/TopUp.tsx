import { Alert, Box, Button, Field, Flex, HStack, IconButton, Input, Separator, Text, VStack } from '@chakra-ui/react'
import {
  BillingAddressElement,
  CheckoutProvider,
  PaymentElement,
  TaxIdElement,
  useCheckout,
} from '@stripe/react-stripe-js/checkout'
import type { StripeCheckoutOptions } from '@stripe/stripe-js'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuArrowLeft } from 'react-icons/lu'
import { checkoutReturnUrl, useCheckoutAppearance, useStripePromise } from '~components/Pricing/stripe'
import { useWalletTopUp, WALLET_TOPUP_MAX_CENTS, WALLET_TOPUP_MIN_CENTS } from '~queries/wallet'
import { currency } from '~utils/numbers'

const PRESET_AMOUNTS_EUR = [50, 100, 500, 1000]
const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/

type WalletTopUpProps = {
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
  const amountCents = AMOUNT_PATTERN.test(trimmed) ? Math.round(Number(trimmed) * 100) : null
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
  onDone: (amountCents: number) => void
}

type CheckoutFormProps = {
  amountCents: number
  sessionId: string | null
  onBack: () => void
  onDone: (amountCents: number) => void
}

const CheckoutForm = ({ amountCents, sessionId, onBack, onDone }: CheckoutFormProps) => {
  const { t } = useTranslation()
  const checkoutState = useCheckout()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (checkoutState.type !== 'success' || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await checkoutState.checkout.confirm({
        redirect: 'if_required',
        returnUrl: checkoutReturnUrl({ topup: 'return', session_id: sessionId }),
      })
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
      <LuArrowLeft />
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

        <VStack align='stretch' gap={3} p={5} borderWidth={1} borderRadius='md' bg='card.bg'>
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
        </VStack>

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

const PaymentStep = ({ amountCents, onBack, onDone }: PaymentStepProps) => {
  const { t, i18n } = useTranslation()
  const stripePromise = useStripePromise()
  const appearance = useCheckoutAppearance()
  const { mutateAsync: createTopUp } = useWalletTopUp()
  const [sessionId, setSessionId] = useState<string | null>(null)

  // The return URL is passed to checkout.confirm() instead, so the body does not carry one.
  const fetchClientSecret = useCallback(async () => {
    const { clientSecret, sessionId: newSessionId } = await createTopUp({
      amountCents,
      locale: i18n.resolvedLanguage,
    })
    setSessionId(newSessionId)
    return clientSecret
  }, [createTopUp, amountCents, i18n.resolvedLanguage])

  if (!stripePromise) {
    return (
      <VStack align='stretch' gap={4}>
        <Flex justify='flex-start'>
          <IconButton aria-label={t('back', { defaultValue: 'Back' })} onClick={onBack} variant='ghost'>
            <LuArrowLeft />
          </IconButton>
        </Flex>
        <Box color='red.500' textAlign='center'>
          {t('payment.stripe_unavailable', {
            defaultValue: 'Payments are temporarily unavailable. Please try again later.',
          })}
        </Box>
      </VStack>
    )
  }

  const options: StripeCheckoutOptions = {
    fetchClientSecret,
    elementsOptions: { appearance },
  }

  return (
    <CheckoutProvider stripe={stripePromise} options={options}>
      <CheckoutForm amountCents={amountCents} sessionId={sessionId} onBack={onBack} onDone={onDone} />
    </CheckoutProvider>
  )
}

export const WalletTopUp = ({ onDone, onCancel }: WalletTopUpProps) => {
  const [amount, setAmount] = useState('')
  const [amountCents, setAmountCents] = useState<number | null>(null)

  if (amountCents === null) {
    return <AmountStep amount={amount} onAmountChange={setAmount} onContinue={setAmountCents} onCancel={onCancel} />
  }

  return <PaymentStep amountCents={amountCents} onBack={() => setAmountCents(null)} onDone={onDone} />
}

import { Alert, Box, Button, CloseButton, Dialog, Flex, Grid, Spinner, Stack, Text } from '@chakra-ui/react'
import {
  BillingAddressElement,
  CheckoutProvider,
  PaymentElement,
  TaxIdElement,
  useCheckout,
} from '@stripe/react-stripe-js/checkout'
import type { StripeCheckoutOptions } from '@stripe/stripe-js'
import { useQueryClient } from '@tanstack/react-query'
import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { apiErrorDetails, ErrorCode } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { QueryKeys } from '~queries/keys'
import {
  ProcessCheckout as ProcessCheckoutSession,
  processCheckoutEndpoint,
  ProcessCheckoutStatus,
  publishPaidProcess,
  waitForPaymentOutcome,
} from '~queries/process-checkout'
import { useProcessPrice } from '~queries/process-price'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { publishPaymentErrorMessage } from './payment-errors'
import { ProcessOrderSummary } from './ProcessOrderSummary'
import { useCheckoutElementsOptions, useStripePromise } from './stripe'

// Set on the URL Stripe returns to after a payment that left the page (e.g. a bank redirect), so
// the wizard reopens this dialog to wait for its outcome.
export const checkoutReturnParam = 'checkout'

/**
 * Where the dialog starts: `checkout` opens (or resumes) the payment, `confirming` waits for the
 * outcome of one already made.
 */
export type ProcessCheckoutStart = 'checkout' | 'confirming'

type Step =
  | { name: ProcessCheckoutStart }
  | { name: 'publishing' }
  | { name: 'processing' }
  | { name: 'failed' }
  | { name: 'timeout' }
  // retry: the step its retry button goes back to; detail: the backend's reason, when any
  | { name: 'error'; message: string; detail?: string; retry: 'checkout' | 'publishing' }

type ProcessCheckoutDialogProps = {
  // The draft being paid for; the dialog is open while set
  processId: string | null
  start: ProcessCheckoutStart
  onClose: () => void
  onPublished: (processId: string) => void
}

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error))

/**
 * Pay and publish (vocdoni-app#1767): the one-time checkout of a draft, then the wait for its
 * outcome. The payment is only taken as done once the backend says so: Stripe's own confirmation
 * in the browser proves nothing. Once paid, the backend publishes the process itself; the dialog
 * publishes it too, which is free and a no-op when the backend got there first.
 */
export const ProcessCheckoutDialog = ({ processId, start, onClose, onPublished }: ProcessCheckoutDialogProps) => (
  <Dialog.Root
    open={!!processId}
    onOpenChange={({ open }) => !open && onClose()}
    placement='center'
    size={{ base: 'full', md: 'xl' }}
    scrollBehavior='inside'
    // Clicking outside would drop a filled-in payment form
    closeOnInteractOutside={false}
  >
    <Dialog.Backdrop />
    <Dialog.Positioner>
      <Dialog.Content>
        <Dialog.CloseTrigger asChild>
          <CloseButton />
        </Dialog.CloseTrigger>
        <Dialog.Header>
          <Dialog.Title>
            <Trans i18nKey='process.checkout.title'>Pay and publish</Trans>
          </Dialog.Title>
        </Dialog.Header>
        <Dialog.Body pb={6}>
          {processId && (
            <ProcessCheckoutFlow key={processId} processId={processId} start={start} onPublished={onPublished} />
          )}
        </Dialog.Body>
      </Dialog.Content>
    </Dialog.Positioner>
  </Dialog.Root>
)

const ProcessCheckoutFlow = ({
  processId,
  start,
  onPublished,
}: Pick<ProcessCheckoutDialogProps, 'start' | 'onPublished'> & { processId: string }) => {
  const { t, i18n } = useTranslation()
  const { bearedFetch } = useAuth()
  const { client } = useApiClient()
  const queryClient = useQueryClient()
  const [step, setStep] = useState<Step>({ name: start })
  // Each checkout attempt opens its session once: a second request while the first one holds the
  // draft is refused (40903), and the backend reuses an open session anyway
  const [attempt, setAttempt] = useState(0)
  const [session, setSession] = useState<{ attempt: number; clientSecret: string } | null>(null)
  const requestedAttempt = useRef<number | null>(null)
  // Read when a publication ends, so a new callback (or language) does not publish again
  const onPublishedRef = useRef(onPublished)
  const tRef = useRef(t)
  useEffect(() => {
    onPublishedRef.current = onPublished
    tRef.current = t
  })

  useEffect(() => {
    if (step.name !== 'checkout' || requestedAttempt.current === attempt) return
    requestedAttempt.current = attempt
    bearedFetch<ProcessCheckoutSession>(processCheckoutEndpoint(processId), {
      method: 'POST',
      body: { locale: i18n.resolvedLanguage },
    })
      .then(({ clientSecret }) => setSession({ attempt, clientSecret }))
      .catch((error) => {
        // Already paid, processing, or completed and settling: never a second charge, so its
        // outcome is waited for instead
        if (apiErrorDetails(error)?.code === ErrorCode.PaymentSessionConflict) {
          setStep({ name: 'confirming' })
          return
        }
        setStep({
          name: 'error',
          message: publishPaymentErrorMessage(t, error) ?? errorMessage(error),
          retry: 'checkout',
        })
      })
  }, [step.name, attempt, processId, bearedFetch, i18n.resolvedLanguage, t])

  useEffect(() => {
    if (step.name !== 'confirming') return
    const controller = new AbortController()
    waitForPaymentOutcome(() => bearedFetch<ProcessCheckoutStatus>(processCheckoutEndpoint(processId)), {
      signal: controller.signal,
    }).then((outcome) => {
      // The price (and its payment status) moved along with the payment
      void queryClient.invalidateQueries({ queryKey: QueryKeys.process.price(processId) })
      switch (outcome) {
        case 'paid':
          return setStep({ name: 'publishing' })
        case 'processing':
          return setStep({ name: 'processing' })
        case 'failed':
          return setStep({ name: 'failed' })
        case 'timeout':
          return setStep({ name: 'timeout' })
        case 'open':
          // Never completed: resume the session, which the backend reuses
          return retryCheckout()
      }
    })
    return () => controller.abort()
    // retryCheckout only bumps state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.name, processId, bearedFetch, queryClient])

  useEffect(() => {
    if (step.name !== 'publishing') return
    const controller = new AbortController()
    publishPaidProcess(() => client.elections.publishAndWait(processId), { signal: controller.signal })
      .then(() => {
        if (!controller.signal.aborted) onPublishedRef.current(processId)
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        const t = tRef.current
        setStep({
          name: 'error',
          message: t('process.checkout.publish_failed', {
            defaultValue:
              'Your payment went through, but the voting process could not be published yet. Publishing it again is free.',
          }),
          detail: publishPaymentErrorMessage(t, error) ?? errorMessage(error),
          retry: 'publishing',
        })
      })
    return () => controller.abort()
  }, [step.name, processId, client])

  const retryCheckout = () => {
    setSession(null)
    setAttempt((current) => current + 1)
    setStep({ name: 'checkout' })
  }

  switch (step.name) {
    case 'checkout':
      if (!session || session.attempt !== attempt) return <Waiting />
      return (
        <CheckoutForm
          key={attempt}
          processId={processId}
          clientSecret={session.clientSecret}
          onPaid={() => setStep({ name: 'confirming' })}
        />
      )
    case 'confirming':
      return (
        <Waiting>
          <Trans i18nKey='process.checkout.confirming'>Confirming your payment…</Trans>
        </Waiting>
      )
    case 'publishing':
      return (
        <Waiting>
          <Trans i18nKey='process.checkout.publishing'>Payment received. Publishing your voting process…</Trans>
        </Waiting>
      )
    case 'processing':
      return (
        <Outcome status='info'>
          <Trans i18nKey='process.checkout.processing'>
            Your payment is being processed. Some payment methods take a few days to clear. The voting process is
            published automatically once it does, and its draft cannot be changed meanwhile. You can close this window.
          </Trans>
        </Outcome>
      )
    case 'failed':
      return (
        <Outcome
          status='error'
          action={
            <Button onClick={retryCheckout}>
              <Trans i18nKey='process.checkout.retry_payment'>Try paying again</Trans>
            </Button>
          }
        >
          <Trans i18nKey='process.checkout.failed'>
            The payment did not go through, so nothing was charged and the voting process was not published. You can try
            again, with the same or another payment method.
          </Trans>
        </Outcome>
      )
    case 'timeout':
      return (
        <Outcome
          status='warning'
          action={
            <Button onClick={() => setStep({ name: 'confirming' })}>
              <Trans i18nKey='process.checkout.check_again'>Check again</Trans>
            </Button>
          }
        >
          <Trans i18nKey='process.checkout.timeout'>
            Your payment has not been confirmed yet. Do not pay again: once it is confirmed, the voting process is
            published automatically. Check again in a moment.
          </Trans>
        </Outcome>
      )
    case 'error':
      return (
        <Outcome
          status='error'
          action={
            <Button onClick={step.retry === 'checkout' ? retryCheckout : () => setStep({ name: 'publishing' })}>
              <Trans i18nKey='common.retry'>Try again</Trans>
            </Button>
          }
        >
          {step.message}
          {step.detail && (
            <Text mt={2} fontSize='sm'>
              {step.detail}
            </Text>
          )}
        </Outcome>
      )
  }
}

const Waiting = ({ children }: { children?: ReactNode }) => (
  <Flex direction='column' align='center' gap={4} py={10} textAlign='center' role='status'>
    <Spinner size='lg' />
    {children && <Text>{children}</Text>}
  </Flex>
)

const Outcome = ({
  status,
  action,
  children,
}: {
  status: 'info' | 'warning' | 'error'
  action?: ReactNode
  children: ReactNode
}) => (
  <Stack gap={4} align='flex-start'>
    <Alert.Root status={status}>
      <Alert.Indicator />
      <Alert.Description>{children}</Alert.Description>
    </Alert.Root>
    {action}
  </Stack>
)

type CheckoutFormProps = {
  processId: string
  clientSecret: string
  onPaid: () => void
}

const CheckoutForm = ({ processId, clientSecret, onPaid }: CheckoutFormProps) => {
  const { t } = useTranslation()
  const stripePromise = useStripePromise()
  const elementsOptions = useCheckoutElementsOptions()
  const options = useMemo<StripeCheckoutOptions>(
    () => ({ fetchClientSecret: () => Promise.resolve(clientSecret), elementsOptions }),
    // The appearance is read once: a new options object would not restyle a mounted checkout
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clientSecret]
  )

  if (!stripePromise) {
    return (
      <Outcome status='error'>
        {t('payment.stripe_unavailable', {
          defaultValue: 'Payments are temporarily unavailable. Please try again later.',
        })}
      </Outcome>
    )
  }

  return (
    <CheckoutProvider stripe={stripePromise} options={options}>
      <CheckoutFormFields processId={processId} onPaid={onPaid} />
    </CheckoutProvider>
  )
}

// Where Stripe sends the customer back when a payment method leaves the page: this draft in the
// wizard, flagged so it waits for the payment's outcome.
const returnUrl = (processId: string) => {
  const url = new URL(window.location.href)
  url.searchParams.set('draftId', processId)
  url.searchParams.set(checkoutReturnParam, 'return')
  url.hash = ''
  return url.toString()
}

const CheckoutFormFields = ({ processId, onPaid }: Omit<CheckoutFormProps, 'clientSecret'>) => {
  const { t } = useTranslation()
  const checkoutState = useCheckout()
  const { price } = useProcessPrice(processId)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (checkoutState.type === 'loading') return <Waiting />

  if (checkoutState.type === 'error') {
    return <Outcome status='error'>{checkoutState.error.message}</Outcome>
  }

  const { checkout } = checkoutState

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const result = await checkout.confirm({ redirect: 'if_required', returnUrl: returnUrl(processId) })
      if (result.type === 'error') {
        setError(result.error.message)
        setIsSubmitting(false)
        return
      }
      // Stripe accepted the payment; whether it is paid is the backend's to say
      onPaid()
    } catch (err) {
      setError(errorMessage(err))
      setIsSubmitting(false)
    }
  }

  return (
    <Box as='form' onSubmit={handleSubmit}>
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
        <Flex as='section' flexDirection='column' gap={5}>
          <ProcessOrderSummary checkout={checkout} priceLines={price?.lines} />
        </Flex>

        <Flex as='section' flexDirection='column' gap={5}>
          <BillingAddressElement options={{ display: { name: 'split' } }} />
          <TaxIdElement options={{ visibility: 'auto' }} />
          <PaymentElement />

          {error && (
            <Alert.Root status='error'>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Root>
          )}

          <Button type='submit' w='full' loading={isSubmitting} disabled={!checkout.canConfirm}>
            {t('process.checkout.pay', {
              defaultValue: 'Pay {{amount}} and publish',
              amount: checkout.total.total.amount,
            })}
          </Button>
        </Flex>
      </Grid>
    </Box>
  )
}

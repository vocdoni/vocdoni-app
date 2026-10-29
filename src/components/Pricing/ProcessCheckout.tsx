import { Alert, Button, Flex, HStack, IconButton, Separator, Spinner, Text, VStack } from '@chakra-ui/react'
import {
  BillingAddressElement,
  CheckoutProvider,
  PaymentElement,
  TaxIdElement,
  useCheckout,
} from '@stripe/react-stripe-js/checkout'
import type { StripeCheckoutOptions } from '@stripe/stripe-js'
import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LuArrowLeft } from 'react-icons/lu'
import { JobFailedError, VocdoniApiError } from '@vocdoni/api-client'
import { apiErrorDetails, ErrorCode } from '~components/Auth/api'
import { useApiClient } from '~src/providers/ApiClientProvider'
import {
  enqueuedJobId,
  httpStatus,
  isPermanentFailure,
  useProcessCheckoutApi,
  waitForPublication,
  type ProcessCheckout as ProcessCheckoutSession,
} from '~queries/process-checkout'
import { useProcessPrice } from '~queries/process-price'
import { useWallet } from '~queries/wallet'
import { currency } from '~utils/numbers'
import { publishNeedsWalletTopUp, publishPaymentErrorMessage } from './payment-errors'
import { checkoutReturnUrl, useCheckoutAppearance, useStripePromise } from './stripe'

// The URL param Stripe's return URL carries after a redirect-based payment: ?draftId=…&checkout=return
export const checkoutReturnParam = 'checkout'

// What a 40178 refusal says the top-up must cover, in EUR cents, VAT excluded
export type WalletShortfall = { shortfallCents: number; balanceCents: number }

/** Where the view starts. */
export type ProcessCheckoutStart =
  // A publish refused for the wallet shortfall (40178)
  | { kind: 'checkout'; shortfall?: WalletShortfall }
  // A publish refused by an open top-up (40177): resume or cancel it
  | { kind: 'conflict' }
  // Back from a redirect-based payment: wait for its outcome
  | { kind: 'return' }
  // The wizard published the draft: wait for the process, on its publish job when it has one
  | { kind: 'publishing'; jobId?: string }

type Step =
  | { name: 'conflict' }
  | { name: 'opening' }
  | { name: 'checkout'; session: ProcessCheckoutSession }
  | { name: 'publishing' }
  | { name: 'waiting'; afterPayment: boolean; paid?: boolean; jobId?: string }
  | { name: 'unconfirmed' }
  | { name: 'unpaid' }
  | { name: 'timeout'; paid: boolean }
  | { name: 'error'; message: string }

type ProcessCheckoutProps = {
  processId: string
  start: ProcessCheckoutStart
  onPublished: (processId: string) => void
  onClose: () => void
}

// The backend may take about 15 minutes on a slow chain
const publicationTimeoutMs = 15 * 60 * 1000

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error))

/**
 * The view a refused publish opens, or undefined when a top-up cannot settle the refusal. The
 * caller decides who may pay.
 */
export const checkoutStartForRefusal = (error: unknown): ProcessCheckoutStart | undefined => {
  if (publishNeedsWalletTopUp(error)) {
    const data = (apiErrorDetails(error)?.data ?? {}) as { shortfallCents?: unknown; balanceCents?: unknown }
    const hasShortfall = typeof data.shortfallCents === 'number' && typeof data.balanceCents === 'number'
    return {
      kind: 'checkout',
      shortfall: hasShortfall
        ? { shortfallCents: data.shortfallCents as number, balanceCents: data.balanceCents as number }
        : undefined,
    }
  }
  if (apiErrorDetails(error)?.code === ErrorCode.PaymentSessionConflict) return { kind: 'conflict' }
  return undefined
}

const initialStep = (start: ProcessCheckoutStart): Step => {
  switch (start.kind) {
    case 'conflict':
      return { name: 'conflict' }
    case 'return':
      return { name: 'waiting', afterPayment: true, paid: false }
    case 'publishing':
      return { name: 'waiting', afterPayment: false, jobId: start.jobId }
    case 'checkout':
      return { name: 'opening' }
  }
}

/**
 * Top up and publish (vocdoni-app#1767). Inline, not a Dialog: a modal focus trap breaks Stripe's
 * 3D Secure lightbox. It waits for the backend to publish: a browser success proves nothing.
 */
export const ProcessCheckout = ({ processId, start, onPublished, onClose }: ProcessCheckoutProps) => {
  const { t, i18n } = useTranslation()
  const { client } = useApiClient()
  const checkoutApi = useProcessCheckoutApi()
  const stripePromise = useStripePromise()
  const { price } = useProcessPrice(processId)
  const { data: wallet } = useWallet()
  const [step, setStep] = useState<Step>(() => initialStep(start))
  // Set once a read of the payment says it is paid, for a return that starts without knowing
  const [paymentSeen, setPaymentSeen] = useState(false)
  const [shortfall, setShortfall] = useState<WalletShortfall | undefined>(
    start.kind === 'checkout' ? start.shortfall : undefined
  )
  // A publish from the wallet after a 400 is tried once: a second refusal ends in the error step
  const walletPublishRef = useRef(false)
  // The client and checkout API change with the bearer token: the waits read them from here, so a
  // refreshed token does not restart them
  const latest = useRef({ client, checkoutApi, t, language: i18n.resolvedLanguage, onPublished })
  useEffect(() => {
    latest.current = { client, checkoutApi, t, language: i18n.resolvedLanguage, onPublished }
  })

  const resume = (next: ProcessCheckoutStart) => {
    if (next.kind === 'checkout') setShortfall(next.shortfall)
    setStep(initialStep(next))
  }

  // Publishes the draft, paid from the wallet. `before` runs first (cancelling an open top-up). With
  // `reopen` off, a refusal ends in the error step instead of reopening the checkout.
  const publishDraft = (before?: () => Promise<unknown>, reopen = true) => {
    setStep({ name: 'publishing' })
    Promise.resolve(before?.())
      .then(() => latest.current.client.elections.publish(processId))
      .then((response) => setStep({ name: 'waiting', afterPayment: false, jobId: enqueuedJobId(response) }))
      .catch((error) => {
        const next = reopen ? checkoutStartForRefusal(error) : undefined
        if (next) return resume(next)
        setStep({ name: 'error', message: publishPaymentErrorMessage(latest.current.t, error) ?? errorMessage(error) })
      })
  }

  useEffect(() => {
    if (step.name !== 'opening') return
    let stale = false
    const fail = (error: unknown) => {
      setStep({ name: 'error', message: publishPaymentErrorMessage(latest.current.t, error) ?? errorMessage(error) })
    }
    latest.current.checkoutApi
      .checkout(processId, { locale: latest.current.language })
      .then((session) => {
        if (!stale) setStep({ name: 'checkout', session })
      })
      .catch((error) => {
        if (stale) return
        const status = httpStatus(error)
        if (status === 409 && apiErrorDetails(error)?.code === ErrorCode.PaymentSessionConflict) {
          // Paid, or completed and being credited: never a second charge, so read which before deciding
          latest.current.checkoutApi.getCheckout(processId).then(
            (payment) => {
              if (stale) return
              if (payment.status === 'paid') publishDraft(undefined, false)
              else if (payment.sessionStatus === 'complete')
                setStep({ name: 'waiting', afterPayment: true, paid: true })
              else fail(error)
            },
            () => {
              if (!stale) fail(error)
            }
          )
          return
        }
        // The wallet covers the price now (or the process is free): publish once, paid from it
        if (status === 400 && !walletPublishRef.current) {
          walletPublishRef.current = true
          publishDraft(undefined, false)
          return
        }
        fail(error)
      })
    return () => {
      stale = true
    }
    // publishDraft and fail only read the refs and the process id, so they need no re-run
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, processId])

  useEffect(() => {
    if (step.name !== 'waiting') return
    const controller = new AbortController()
    const startedAt = Date.now()
    // Whether the latest read of the payment says it was paid: only then may a timeout say so
    let paid = false
    const pollProcess = (timeoutMs: number, withPayment: boolean) => {
      const readPayment = withPayment
        ? () =>
            latest.current.checkoutApi.getCheckout(processId).then((payment) => {
              paid = payment.status === 'paid'
              if (paid) setPaymentSeen(true)
              return payment
            })
        : undefined
      waitForPublication(
        () => latest.current.client.elections.get(processId).then((election) => election.published === true),
        { readPayment, timeoutMs, signal: controller.signal }
      )
        .then((outcome) => {
          if (controller.signal.aborted) return
          if (outcome === 'published') latest.current.onPublished(processId)
          else if (outcome === 'unconfirmed') setStep({ name: 'unconfirmed' })
          else if (outcome === 'unpaid') setStep({ name: 'unpaid' })
          else if (outcome === 'timeout') setStep({ name: 'timeout', paid })
        })
        .catch((error) => {
          if (!controller.signal.aborted) setStep({ name: 'error', message: errorMessage(error) })
        })
    }
    if (step.jobId && !step.afterPayment) {
      // A direct publish: its job says how it went, so a failure is reported at once, not after the timeout
      latest.current.client.jobs
        .waitFor(step.jobId, { timeoutMs: publicationTimeoutMs, signal: controller.signal })
        .then(() => {
          if (!controller.signal.aborted) latest.current.onPublished(processId)
        })
        .catch((error) => {
          if (controller.signal.aborted) return
          if (error instanceof JobFailedError || (error instanceof VocdoniApiError && isPermanentFailure(error))) {
            setStep({ name: 'error', message: errorMessage(error) })
            return
          }
          // A blip in reading the job (502, 429, network) says nothing about the publish: poll the process
          // for the time left
          const remaining = publicationTimeoutMs - (Date.now() - startedAt)
          if (remaining <= 0) setStep({ name: 'timeout', paid: false })
          else pollProcess(remaining, false)
        })
      return () => controller.abort()
    }
    pollProcess(publicationTimeoutMs, step.afterPayment)
    return () => controller.abort()
  }, [step, processId])

  const title =
    start.kind === 'publishing'
      ? t('process.checkout.publish_title', { defaultValue: 'Publish voting process' })
      : t('process.checkout.title', { defaultValue: 'Top up and publish' })
  const frame = (children: ReactNode) => (
    <Frame title={title} onBack={onClose}>
      {children}
    </Frame>
  )
  const publishAgain = (
    <Button onClick={() => publishDraft()}>
      {t('process.checkout.publish_again', { defaultValue: 'Publish again' })}
    </Button>
  )

  switch (step.name) {
    case 'conflict':
      return frame(
        <>
          <Outcome status='warning'>
            {t('process.checkout.conflict', {
              defaultValue:
                'A top-up for this voting process is still open, so it cannot be published yet. Resume the payment to finish it, or cancel it and publish from your wallet.',
            })}
          </Outcome>
          <HStack gap={3} wrap='wrap'>
            <Button onClick={() => setStep({ name: 'opening' })}>
              {t('process.checkout.resume', { defaultValue: 'Resume payment' })}
            </Button>
            <Button
              variant='outline'
              onClick={() =>
                publishDraft(() =>
                  // Nothing open to cancel is fine: the publish is what is left to do
                  latest.current.checkoutApi.cancelCheckout(processId).catch((error) => {
                    if (httpStatus(error) !== 404) throw error
                  })
                )
              }
            >
              {t('process.checkout.cancel_open', { defaultValue: 'Cancel the open payment' })}
            </Button>
          </HStack>
        </>
      )
    case 'opening':
      return <Waiting />
    case 'checkout':
      return (
        <CheckoutStep
          title={title}
          processId={processId}
          session={step.session}
          shortfall={shortfall}
          stripePromise={stripePromise}
          totalCents={price?.totalCents}
          balanceCents={wallet?.balanceCents}
          onPaid={() => setStep({ name: 'waiting', afterPayment: true, paid: true })}
          onBack={onClose}
        />
      )
    case 'publishing':
      return <Waiting>{t('process.checkout.publishing', { defaultValue: 'Publishing your voting process…' })}</Waiting>
    case 'waiting':
      return (
        <Waiting>
          {step.afterPayment && (step.paid || paymentSeen)
            ? t('process.checkout.publishing_after_payment', {
                defaultValue: 'Payment received. Publishing your voting process…',
              })
            : t('process.checkout.publishing', { defaultValue: 'Publishing your voting process…' })}
        </Waiting>
      )
    case 'unconfirmed':
      return frame(
        <Outcome
          status='info'
          action={
            <Button variant='outline' onClick={() => setStep({ name: 'waiting', afterPayment: true, paid: false })}>
              {t('process.checkout.check_again', { defaultValue: 'Check again' })}
            </Button>
          }
        >
          {t('process.checkout.unconfirmed', {
            defaultValue:
              'Your payment is still being confirmed. Some payment methods take a few days to clear. The voting process is published automatically once the payment is confirmed, so you can leave this page.',
          })}
        </Outcome>
      )
    case 'unpaid':
      return frame(
        <Outcome
          status='error'
          action={
            <Button onClick={() => setStep({ name: 'opening' })}>
              {t('common.retry', { defaultValue: 'Try again' })}
            </Button>
          }
        >
          {t('process.checkout.unpaid', { defaultValue: 'The payment did not go through. You can try again.' })}
        </Outcome>
      )
    case 'timeout':
      return frame(
        <Outcome status='warning' action={publishAgain}>
          {step.paid
            ? t('process.checkout.timeout', {
                defaultValue:
                  'Your payment is confirmed and the voting process publishes shortly. If it does not, publish it again: it is paid from your wallet.',
              })
            : t('process.checkout.timeout_unpaid', {
                defaultValue:
                  'The voting process is still being published. If it does not appear shortly, publish it again: it is paid from your wallet.',
              })}
        </Outcome>
      )
    case 'error':
      return frame(<Outcome status='error'>{step.message}</Outcome>)
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
  <VStack align='stretch' gap={4}>
    <Alert.Root status={status}>
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Description>{children}</Alert.Description>
      </Alert.Content>
    </Alert.Root>
    {action}
  </VStack>
)

const Frame = ({ title, onBack, children }: { title: string; onBack: () => void; children: ReactNode }) => {
  const { t } = useTranslation()
  return (
    <VStack align='stretch' gap={5}>
      <Flex align='center' gap={2}>
        <IconButton aria-label={t('back', { defaultValue: 'Back' })} onClick={onBack} variant='ghost' size='sm'>
          <LuArrowLeft />
        </IconButton>
        <Text fontSize='lg' fontWeight='bold'>
          {title}
        </Text>
      </Flex>
      {children}
    </VStack>
  )
}

type CheckoutStepProps = {
  title: string
  processId: string
  session: ProcessCheckoutSession
  shortfall?: WalletShortfall
  stripePromise: ReturnType<typeof useStripePromise>
  totalCents?: number
  balanceCents?: number
  onPaid: () => void
  onBack: () => void
}

const CheckoutStep = ({
  title,
  processId,
  session,
  shortfall,
  stripePromise,
  totalCents,
  balanceCents,
  onPaid,
  onBack,
}: CheckoutStepProps) => {
  const { t } = useTranslation()
  const appearance = useCheckoutAppearance()
  // The session is already open: Stripe only needs to hear its secret, once per mount
  const fetchClientSecret = useCallback(() => Promise.resolve(session.clientSecret), [session.clientSecret])

  if (!stripePromise) {
    return (
      <Frame title={title} onBack={onBack}>
        <Outcome status='error'>
          {t('payment.stripe_unavailable', {
            defaultValue: 'Payments are temporarily unavailable. Please try again later.',
          })}
        </Outcome>
      </Frame>
    )
  }

  return (
    <Frame title={title} onBack={onBack}>
      <CheckoutProvider stripe={stripePromise} options={{ fetchClientSecret, elementsOptions: { appearance } }}>
        <CheckoutFormFields
          processId={processId}
          session={session}
          shortfall={shortfall}
          totalCents={totalCents}
          balanceCents={balanceCents}
          onPaid={onPaid}
        />
      </CheckoutProvider>
    </Frame>
  )
}

const SummaryRow = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <Flex justify='space-between' gap={4}>
    <Text fontWeight={bold ? 'bold' : undefined}>{label}</Text>
    <Text fontWeight={bold ? 'bold' : undefined}>{value}</Text>
  </Flex>
)

type CheckoutFormFieldsProps = Pick<
  CheckoutStepProps,
  'processId' | 'shortfall' | 'totalCents' | 'balanceCents' | 'onPaid'
> & {
  session: ProcessCheckoutSession
}

const CheckoutFormFields = ({
  processId,
  session,
  shortfall,
  totalCents,
  balanceCents,
  onPaid,
}: CheckoutFormFieldsProps) => {
  const { t } = useTranslation()
  const checkoutState = useCheckout()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (checkoutState.type === 'loading') {
    return (
      <Flex justify='center' py={8}>
        <Spinner />
      </Flex>
    )
  }

  if (checkoutState.type === 'error') {
    return <Outcome status='error'>{checkoutState.error.message}</Outcome>
  }

  const { checkout } = checkoutState
  // Only a 40178 refusal tells the shortfall; without one there is nothing to compare the top-up with
  const restStaysInWallet = shortfall !== undefined && session.amountCents > shortfall.shortfallCents
  // The amount Stripe charges, VAT included, when it says so
  const payAmount = checkout.total?.total.amount ?? currency(session.amountCents)
  const walletBalanceCents = shortfall?.balanceCents ?? balanceCents

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setError(null)
    try {
      const result = await checkout.confirm({
        redirect: 'if_required',
        returnUrl: checkoutReturnUrl({ draftId: processId, [checkoutReturnParam]: 'return' }),
      })
      if (result.type === 'error') {
        setError(result.error.message)
        setIsSubmitting(false)
        return
      }
      // Stripe accepted the payment; whether the wallet was credited is the backend's to say
      onPaid()
    } catch (err) {
      setError(errorMessage(err))
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <VStack align='stretch' gap={5}>
        <VStack align='stretch' gap={3} p={5} borderWidth={1} borderRadius='md' bg='card.bg'>
          {shortfall ? (
            <SummaryRow
              label={t('process.checkout.shortfall', { defaultValue: 'Shortfall (VAT excluded)' })}
              value={currency(shortfall.shortfallCents)}
            />
          ) : (
            totalCents !== undefined && (
              <SummaryRow
                label={t('process.checkout.draft_total', { defaultValue: 'Draft total (VAT excluded)' })}
                value={currency(totalCents)}
              />
            )
          )}
          {walletBalanceCents !== undefined && (
            <SummaryRow
              label={t('process.checkout.wallet_balance', { defaultValue: 'Wallet balance' })}
              value={currency(walletBalanceCents)}
            />
          )}
          <SummaryRow
            label={t('process.checkout.top_up', { defaultValue: 'Top-up (VAT excluded)' })}
            value={currency(session.amountCents)}
            bold
          />
          {checkout.total && (
            <>
              <SummaryRow
                label={t('wallet.topup.vat', { defaultValue: 'VAT' })}
                value={checkout.total.taxExclusive.amount}
              />
              <Separator />
              <SummaryRow
                label={t('wallet.topup.total', { defaultValue: 'Total' })}
                value={checkout.total.total.amount}
                bold
              />
            </>
          )}
          {restStaysInWallet && (
            <Text fontSize='sm' color='fg.muted'>
              {t('process.checkout.rest_stays', { defaultValue: 'The rest stays in your wallet.' })}
            </Text>
          )}
        </VStack>

        <BillingAddressElement options={{ display: { name: 'split' } }} />
        <TaxIdElement options={{ visibility: 'auto' }} />
        <PaymentElement />

        {error && <Outcome status='error'>{error}</Outcome>}

        <Button type='submit' w='full' loading={isSubmitting}>
          {t('process.checkout.pay', {
            defaultValue: 'Pay {{amount}} and publish',
            amount: payAmount,
          })}
        </Button>
      </VStack>
    </form>
  )
}

import { Alert, Button, Spinner } from '@chakra-ui/react'
import {
  BillingAddressElement,
  CheckoutElementsProvider,
  PaymentElement,
  TaxIdElement,
  useCheckoutElements,
} from '@stripe/react-stripe-js/checkout'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LuLock } from 'react-icons/lu'
import { Link as RouterLink, useHref } from 'react-router'
import { ApiErrorCode, isApiError, JobFailedError, VocdoniApiError } from '@vocdoni/api-client'
import type { ProcessCheckoutResponse } from '@vocdoni/api-types'
import { apiErrorDetails } from '~components/Auth/api'
import {
  PublishReviewAmountRow,
  PublishReviewAmounts,
  PublishReviewBody,
  PublishReviewColumn,
  PublishReviewColumns,
  PublishReviewFooter,
  PublishReviewHeader,
  PublishReviewIntro,
  PublishReviewLead,
  PublishReviewNote,
  PublishReviewSecureNote,
  PublishReviewSectionTitle,
  PublishReviewSkeleton,
  PublishReviewStatus,
  PublishReviewStep,
} from '~components/Process/Create/PublishReview/anatomy'
import { Routes } from '~routes'
import { useApiClient } from '~src/providers/ApiClientProvider'
import {
  enqueuedJobId,
  httpStatus,
  isPermanentFailure,
  clearPendingCheckout,
  storePendingCheckout,
  useProcessCheckoutApi,
  waitForPublication,
} from '~queries/process-checkout'
import { currency } from '~utils/numbers'
import { publishNeedsWalletTopUp, publishPaymentErrorMessage } from './payment-errors'
import { useCheckoutAppearance, useStripePromise } from './stripe'

// What a 40178 refusal says the top-up must cover, in EUR cents, VAT excluded
export type WalletShortfall = { shortfallCents: number; balanceCents: number }

/** Where the checkout starts. */
export type ProcessCheckoutStart =
  // A publish refused for the wallet shortfall (40178)
  | { kind: 'checkout'; shortfall?: WalletShortfall }
  // A publish refused by an open top-up (40177): resume or cancel it
  | { kind: 'conflict' }
  // Back from a redirect-based payment: wait for its outcome
  | { kind: 'return' }
  // The draft was published: wait for the process, on its publish job when it has one
  | { kind: 'publishing'; jobId?: string }

/** Where the publish dialog starts: on its summary, or in one of the checkout's states. */
export type PublishFlowStart = { kind: 'summary' } | ProcessCheckoutStart

export type ProcessCheckoutStep =
  | { name: 'summary' }
  // The wallet covers the price: what it takes and what is left, as the summary showed them
  | { name: 'wallet'; totalCents: number; afterCents: number }
  | { name: 'conflict' }
  | { name: 'opening' }
  | { name: 'checkout'; session: ProcessCheckoutResponse }
  | { name: 'publishing' }
  | { name: 'waiting'; afterPayment: boolean; paid?: boolean; jobId?: string }
  | { name: 'unconfirmed' }
  | { name: 'unpaid' }
  | { name: 'timeout'; paid: boolean }
  // `openWallet`: a wallet shortfall the wallet page can settle
  | { name: 'error'; message: string; openWallet?: boolean }

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
  if (isApiError(error, ApiErrorCode.PaymentSessionConflict)) return { kind: 'conflict' }
  return undefined
}

const initialStep = (start: PublishFlowStart): ProcessCheckoutStep => {
  switch (start.kind) {
    case 'summary':
      return { name: 'summary' }
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

const paymentSteps: ProcessCheckoutStep['name'][] = ['conflict', 'opening', 'checkout']

type UseProcessCheckoutOptions = {
  processId: string
  start: PublishFlowStart
  /** Only who may top up the wallet is taken to the payment when a publish is refused for it. */
  canTopUp: boolean
  onPublished: (processId: string) => void
}

/**
 * Publish, top up and publish (vocdoni-app#1767), and wait for the outcome. It waits for the backend
 * to publish: a browser success proves nothing.
 */
export const useProcessCheckout = ({ processId, start, canTopUp, onPublished }: UseProcessCheckoutOptions) => {
  const { t, i18n } = useTranslation()
  const { client } = useApiClient()
  const checkoutApi = useProcessCheckoutApi()
  const [step, setStep] = useState<ProcessCheckoutStep>(() => initialStep(start))
  // Whether a payment is part of this publish: it names the outcome views
  const [topUp, setTopUp] = useState(start.kind !== 'summary' && start.kind !== 'publishing')
  // Set once a read of the payment says it is paid, for a return that starts without knowing
  const [paymentSeen, setPaymentSeen] = useState(false)
  const [shortfall, setShortfall] = useState<WalletShortfall | undefined>(
    start.kind === 'checkout' ? start.shortfall : undefined
  )
  // A publish from the wallet after a 400 is tried once: a second refusal ends in the error step
  const walletPublishRef = useRef(false)
  // The publish request in flight: a second click must not send another
  const publishingRef = useRef(false)
  // The session request of the current 'opening' step: StrictMode runs its effect twice, and only one POST may go out
  const openingRef = useRef<{
    step: ProcessCheckoutStep
    processId: string
    request: Promise<ProcessCheckoutResponse>
  } | null>(null)
  // The client and checkout API change with the bearer token: the waits read them from here, so a
  // refreshed token does not restart them
  // Stripe appends the session id to the return URL, so the redirect lands on the wizard's return route
  const returnURL = new URL(useHref(Routes.processes.createReturn.split('/:sessionId')[0]), window.location.origin)
  const latest = useRef({ client, checkoutApi, t, language: i18n.resolvedLanguage, onPublished, returnURL, canTopUp })
  useEffect(() => {
    latest.current = { client, checkoutApi, t, language: i18n.resolvedLanguage, onPublished, returnURL, canTopUp }
  })

  useEffect(() => {
    if (paymentSteps.includes(step.name)) setTopUp(true)
  }, [step])

  const resume = (next: ProcessCheckoutStart) => {
    if (next.kind === 'checkout') setShortfall(next.shortfall)
    setStep(initialStep(next))
  }

  // Publishes the draft, paid from the wallet. `before` runs first (cancelling an open top-up). With
  // `reopen` off, a refusal ends in the error step instead of reopening the checkout.
  const publishDraft = (before?: () => Promise<unknown>, reopen = true) => {
    if (publishingRef.current) return
    publishingRef.current = true
    setStep({ name: 'publishing' })
    Promise.resolve(before?.())
      .then(() => latest.current.client.elections.publish(processId))
      .then((response) => setStep({ name: 'waiting', afterPayment: false, jobId: enqueuedJobId(response) }))
      .catch((error) => {
        const next = reopen && latest.current.canTopUp ? checkoutStartForRefusal(error) : undefined
        if (next) return resume(next)
        setStep({
          name: 'error',
          message: publishPaymentErrorMessage(latest.current.t, error) ?? errorMessage(error),
          openWallet: publishNeedsWalletTopUp(error),
        })
      })
      .finally(() => {
        publishingRef.current = false
      })
  }

  useEffect(() => {
    if (step.name !== 'opening') return
    let stale = false
    const fail = (error: unknown) => {
      setStep({ name: 'error', message: publishPaymentErrorMessage(latest.current.t, error) ?? errorMessage(error) })
    }
    if (openingRef.current?.step !== step || openingRef.current.processId !== processId) {
      openingRef.current = {
        step,
        processId,
        request: latest.current.checkoutApi.checkout(processId, {
          locale: latest.current.language,
          returnURL: latest.current.returnURL.toString(),
        }),
      }
    }
    openingRef.current.request
      .then((session) => {
        if (!stale) setStep({ name: 'checkout', session })
      })
      .catch((error) => {
        if (stale) return
        const status = httpStatus(error)
        if (status === 409 && isApiError(error, ApiErrorCode.PaymentSessionConflict)) {
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

  return {
    step,
    topUp,
    paymentSeen,
    shortfall,
    /** Publishes from the wallet (a free or wallet-paid vote), or after a timeout. */
    publish: () => publishDraft(),
    showWallet: (quote: { totalCents: number; afterCents: number }) => setStep({ name: 'wallet', ...quote }),
    /** Opens the card checkout for what the wallet lacks. */
    payByCard: (known?: WalletShortfall) => {
      setShortfall(known)
      setStep({ name: 'opening' })
    },
    backToSummary: () => setStep({ name: 'summary' }),
    resumePayment: () => setStep({ name: 'opening' }),
    cancelOpenPayment: () =>
      publishDraft(() =>
        // Nothing open to cancel is fine: the publish is what is left to do
        latest.current.checkoutApi.cancelCheckout(processId).catch((error) => {
          if (httpStatus(error) !== 404) throw error
        })
      ),
    checkAgain: () => setStep({ name: 'waiting', afterPayment: true, paid: false }),
    paid: () => setStep({ name: 'waiting', afterPayment: true, paid: true }),
  }
}

export type ProcessCheckoutFlow = ReturnType<typeof useProcessCheckout>

/** Whether the dialog must stay open: a publish was sent and its outcome is not known yet. */
export const isPublishing = (step: ProcessCheckoutStep) => step.name === 'publishing' || step.name === 'waiting'

type ProcessCheckoutContentProps = {
  flow: ProcessCheckoutFlow
  processId: string
  /** Id of the element that names the dialog. */
  titleId: string
  /** The draft's price, VAT excluded, and the wallet balance, when known. */
  totalCents?: number
  balanceCents?: number
  /** Back to the summary; left out when the dialog has none (the return from a payment). */
  onBack?: () => void
  onClose: () => void
}

/** The dialog body for every checkout state: the card payment, the waits and the outcomes. */
export const ProcessCheckoutContent = ({
  flow,
  processId,
  titleId,
  totalCents,
  balanceCents,
  onBack,
  onClose,
}: ProcessCheckoutContentProps) => {
  const { t } = useTranslation()
  const stripePromise = useStripePromise()
  const { step } = flow
  const title = flow.topUp
    ? t('process.checkout.title', { defaultValue: 'Top up and publish' })
    : t('process.checkout.publish_title', { defaultValue: 'Publish voting process' })

  const outcome = (body: ReactNode, actions?: ReactNode) => (
    <OutcomeStep title={title} titleId={titleId} onClose={onClose} actions={actions}>
      {body}
    </OutcomeStep>
  )
  // Every outcome without its own way forward gets a way out besides the small close button
  const exit = <ExitButton onBack={onBack} onClose={onClose} />

  switch (step.name) {
    case 'summary':
    case 'wallet':
      // The dialog's own steps
      return null
    case 'conflict':
      return outcome(
        <Outcome status='warning'>
          {t('process.checkout.conflict', {
            defaultValue:
              'A top-up for this voting process is still open, so it cannot be published yet. Resume the payment to finish it, or cancel it and publish from your wallet.',
          })}
        </Outcome>,
        <>
          <Button variant='outline' onClick={flow.cancelOpenPayment}>
            {t('process.checkout.cancel_open', { defaultValue: 'Cancel the open payment' })}
          </Button>
          <Button onClick={flow.resumePayment}>
            {t('process.checkout.resume', { defaultValue: 'Resume payment' })}
          </Button>
        </>
      )
    case 'opening':
      return <StatusStep title={title} titleId={titleId} onClose={onClose} />
    case 'checkout':
      if (!stripePromise) {
        return outcome(
          <Outcome status='error'>
            {t('payment.stripe_unavailable', {
              defaultValue: 'Payments are temporarily unavailable. Please try again later.',
            })}
          </Outcome>,
          exit
        )
      }
      return (
        <CardStep
          title={title}
          titleId={titleId}
          processId={processId}
          session={step.session}
          shortfall={flow.shortfall}
          stripePromise={stripePromise}
          totalCents={totalCents}
          balanceCents={balanceCents}
          onPaid={flow.paid}
          onBack={onBack}
          onClose={onClose}
        />
      )
    case 'publishing':
      return (
        <StatusStep title={title} titleId={titleId}>
          {t('process.checkout.publishing', { defaultValue: 'Publishing your voting process…' })}
        </StatusStep>
      )
    case 'waiting':
      return (
        <StatusStep title={title} titleId={titleId}>
          {step.afterPayment && (step.paid || flow.paymentSeen)
            ? t('process.checkout.publishing_after_payment', {
                defaultValue: 'Payment received. Publishing your voting process…',
              })
            : t('process.checkout.publishing', { defaultValue: 'Publishing your voting process…' })}
        </StatusStep>
      )
    case 'unconfirmed':
      return outcome(
        <Outcome status='info'>
          {t('process.checkout.unconfirmed', {
            defaultValue:
              'Your payment is still being confirmed. Some payment methods take a few days to clear. The voting process is published automatically once the payment is confirmed, so you can leave this page.',
          })}
        </Outcome>,
        <Button variant='outline' onClick={flow.checkAgain}>
          {t('process.checkout.check_again', { defaultValue: 'Check again' })}
        </Button>
      )
    case 'unpaid':
      return outcome(
        <Outcome status='error'>
          {t('process.checkout.unpaid', { defaultValue: 'The payment did not go through. You can try again.' })}
        </Outcome>,
        <Button onClick={flow.resumePayment}>{t('common.retry', { defaultValue: 'Try again' })}</Button>
      )
    case 'timeout':
      return outcome(
        <Outcome status='warning'>
          {step.paid
            ? t('process.checkout.timeout', {
                defaultValue:
                  'Your payment is confirmed and the voting process publishes shortly. If it does not, publish it again: it is paid from your wallet.',
              })
            : t('process.checkout.timeout_unpaid', {
                defaultValue:
                  'The voting process is still being published. If it does not appear shortly, publish it again: it is paid from your wallet.',
              })}
        </Outcome>,
        <Button onClick={flow.publish}>{t('process.checkout.publish_again', { defaultValue: 'Publish again' })}</Button>
      )
    case 'error':
      return outcome(
        <Outcome status='error' lead={failedLead(t)}>
          {step.message}
        </Outcome>,
        <>
          {exit}
          {step.openWallet && (
            <Button asChild>
              <RouterLink to={Routes.dashboard.settings.billing}>
                {t('process.payment.error.open_wallet', { defaultValue: 'Open wallet' })}
              </RouterLink>
            </Button>
          )}
        </>
      )
  }
}

type StepFrameProps = { title: string; titleId: string; onClose?: () => void; children?: ReactNode }

// A wait: no close button when given no onClose, since the publish is under way
const StatusStep = ({ title, titleId, onClose, children }: StepFrameProps) => (
  <PublishReviewStep>
    <PublishReviewHeader eyebrow={title} titleId={titleId} onClose={onClose} />
    <PublishReviewStatus role='status'>
      <Spinner size='lg' />
      {children && <p>{children}</p>}
    </PublishReviewStatus>
  </PublishReviewStep>
)

const OutcomeStep = ({ title, titleId, onClose, actions, children }: StepFrameProps & { actions?: ReactNode }) => (
  <PublishReviewStep>
    <PublishReviewHeader eyebrow={title} titleId={titleId} onClose={onClose} />
    <PublishReviewBody>{children}</PublishReviewBody>
    {actions && <PublishReviewFooter>{actions}</PublishReviewFooter>}
  </PublishReviewStep>
)

type OutcomeProps = {
  status: 'info' | 'warning' | 'error'
  /** A translated sentence above the message, for messages that may be raw (a backend or network error). */
  lead?: ReactNode
  children: ReactNode
}

const Outcome = ({ status, lead, children }: OutcomeProps) => (
  <Alert.Root status={status}>
    <Alert.Indicator />
    <Alert.Content>
      {lead && <Alert.Title>{lead}</Alert.Title>}
      <Alert.Description>{children}</Alert.Description>
    </Alert.Content>
  </Alert.Root>
)

const failedLead = (t: ReturnType<typeof useTranslation>['t']) =>
  t('process.publish_review.failed', { defaultValue: 'The vote could not be published.' })

// Back to the summary when there is one (not on the return from a payment), else a plain close
const ExitButton = ({ onBack, onClose }: { onBack?: () => void; onClose: () => void }) => {
  const { t } = useTranslation()
  return onBack ? (
    <Button variant='outline' onClick={onBack}>
      {t('process.publish_review.back', { defaultValue: 'Back to the summary' })}
    </Button>
  ) : (
    <Button variant='outline' onClick={onClose}>
      {t('process.publish_review.close', { defaultValue: 'Close' })}
    </Button>
  )
}

type CardStepProps = {
  title: string
  titleId: string
  processId: string
  session: ProcessCheckoutResponse
  shortfall?: WalletShortfall
  stripePromise: NonNullable<ReturnType<typeof useStripePromise>>
  totalCents?: number
  balanceCents?: number
  onPaid: () => void
  onBack?: () => void
  onClose: () => void
}

const CardStep = ({ stripePromise, session, ...props }: CardStepProps) => {
  const appearance = useCheckoutAppearance()

  return (
    // The session is already open, so Stripe only needs its client secret
    <CheckoutElementsProvider
      stripe={stripePromise}
      options={{ clientSecret: session.clientSecret, elementsOptions: { appearance } }}
    >
      <CardForm session={session} {...props} />
    </CheckoutElementsProvider>
  )
}

const CardForm = ({
  title,
  titleId,
  processId,
  session,
  shortfall,
  totalCents,
  balanceCents,
  onPaid,
  onBack,
  onClose,
}: Omit<CardStepProps, 'stripePromise'>) => {
  const { t } = useTranslation()
  const checkoutState = useCheckoutElements()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (checkoutState.type === 'error') {
    return (
      <OutcomeStep
        title={title}
        titleId={titleId}
        onClose={onClose}
        actions={<ExitButton onBack={onBack} onClose={onClose} />}
      >
        <Outcome status='error' lead={failedLead(t)}>
          {checkoutState.error.message}
        </Outcome>
      </OutcomeStep>
    )
  }

  const checkout = checkoutState.type === 'success' ? checkoutState.checkout : undefined
  const loading = !checkout
  const walletBalanceCents = shortfall?.balanceCents ?? balanceCents
  // The refusal's shortfall when there was one; otherwise what the price and the balance leave
  const shortCents =
    shortfall?.shortfallCents ??
    (totalCents !== undefined && walletBalanceCents !== undefined
      ? Math.max(totalCents - walletBalanceCents, 0)
      : undefined)
  // Above the shortfall when the €1 minimum top-up is more than what is short
  const restStaysInWallet = shortCents !== undefined && session.amountCents > shortCents
  // The amount Stripe charges, VAT included, when it says so
  const payAmount = checkout ? (checkout.total?.total.amount ?? currency(session.amountCents)) : undefined

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (isSubmitting || !checkout) return

    setIsSubmitting(true)
    setError(null)
    try {
      // Stripe's redirect drops the page: the return route reads the draft from here
      storePendingCheckout(processId)
      const result = await checkout.confirm({ redirect: 'if_required' })
      // No redirect happened, so the return route will not need the draft
      if (result.type === 'error') {
        clearPendingCheckout()
        setError(result.error.message)
        setIsSubmitting(false)
        return
      }
      clearPendingCheckout()
      // Stripe accepted the payment; whether the wallet was credited is the backend's to say
      onPaid()
    } catch (err) {
      clearPendingCheckout()
      setError(errorMessage(err))
      setIsSubmitting(false)
    }
  }

  const lead =
    walletBalanceCents === undefined
      ? null
      : walletBalanceCents > 0
        ? t('process.publish_review.card.lead_balance', {
            defaultValue: "The organization's balance covers {{balance}}. The rest is paid now, with VAT.",
            balance: currency(walletBalanceCents),
          })
        : t('process.publish_review.card.lead_whole', { defaultValue: 'You pay the whole vote now, with VAT.' })

  const note = restStaysInWallet
    ? t('process.checkout.rest_stays', { defaultValue: 'The rest stays in your wallet.' })
    : shortCents !== undefined
      ? t('process.publish_review.card.note_zero', { defaultValue: 'After publishing, the balance is left at zero.' })
      : null

  return (
    <PublishReviewStep asChild>
      <form onSubmit={handleSubmit}>
        <PublishReviewHeader
          eyebrow={onBack ? undefined : title}
          titleId={onBack ? undefined : titleId}
          onBack={onBack && !isSubmitting ? onBack : undefined}
          onClose={isSubmitting ? undefined : onClose}
        >
          <PublishReviewLead id={onBack ? titleId : undefined}>
            {payAmount ? (
              t('process.publish_review.card.title', {
                defaultValue: 'Pay {{amount}} and the vote is published.',
                amount: payAmount,
              })
            ) : (
              // A span: the lead is a paragraph
              <PublishReviewSkeleton data-kind='lead' asChild>
                <span />
              </PublishReviewSkeleton>
            )}
          </PublishReviewLead>
          {lead && <PublishReviewIntro>{lead}</PublishReviewIntro>}
        </PublishReviewHeader>

        <PublishReviewColumns>
          <PublishReviewColumn>
            <PublishReviewSectionTitle>
              {t('process.publish_review.pay_now', { defaultValue: 'What you pay now' })}
            </PublishReviewSectionTitle>
            <PublishReviewAmounts>
              {totalCents !== undefined && (
                <PublishReviewAmountRow
                  label={t('process.publish_review.this_vote', { defaultValue: 'This vote' })}
                  value={currency(totalCents)}
                />
              )}
              {walletBalanceCents !== undefined && walletBalanceCents > 0 && (
                <PublishReviewAmountRow
                  label={t('process.publish_review.org_balance', { defaultValue: 'Organization balance' })}
                  value={currency(-walletBalanceCents)}
                />
              )}
              {shortCents !== undefined && (
                <PublishReviewAmountRow
                  label={t('process.publish_review.card.short', { defaultValue: 'Short' })}
                  value={currency(shortCents)}
                  ruled
                />
              )}
              {(session.amountCents !== shortCents || (checkout && !checkout.total)) && (
                <PublishReviewAmountRow
                  label={t('process.publish_review.card.top_up', { defaultValue: 'Top-up, VAT excluded' })}
                  value={currency(session.amountCents)}
                />
              )}
              {loading ? (
                <PublishReviewSkeleton data-kind='amounts' />
              ) : (
                checkout?.total && (
                  <>
                    <PublishReviewAmountRow
                      label={t('wallet.topup.vat', { defaultValue: 'VAT' })}
                      value={checkout.total.taxExclusive.amount}
                    />
                    <PublishReviewAmountRow
                      label={t('process.publish_review.total_now', { defaultValue: 'Total to pay now' })}
                      value={checkout.total.total.amount}
                      strong
                      ruled
                    />
                  </>
                )
              )}
            </PublishReviewAmounts>
            {note && <PublishReviewNote>{note}</PublishReviewNote>}
            <PublishReviewSectionTitle>
              {t('process.publish_review.card.billing', { defaultValue: 'Billing details' })}
            </PublishReviewSectionTitle>
            {loading ? (
              <PublishReviewSkeleton data-kind='field' />
            ) : (
              <>
                <BillingAddressElement options={{ display: { name: 'split' } }} />
                <TaxIdElement options={{ visibility: 'auto' }} />
              </>
            )}
          </PublishReviewColumn>

          <PublishReviewColumn>
            <PublishReviewSectionTitle>
              {t('process.publish_review.how_you_pay', { defaultValue: 'How you pay' })}
            </PublishReviewSectionTitle>
            {loading ? <PublishReviewSkeleton data-kind='field' /> : <PaymentElement />}
            <PublishReviewSecureNote>
              <LuLock aria-hidden />
              <span>
                {t('process.publish_review.card.secure', {
                  defaultValue: 'Secure payment processed by Stripe. Vocdoni neither sees nor stores the card details.',
                })}
              </span>
            </PublishReviewSecureNote>
          </PublishReviewColumn>
        </PublishReviewColumns>

        {/* Next to the button that was clicked, so a refused card never shows out of view */}
        <PublishReviewFooter
          note={
            error && (
              <span role='alert' data-tone='error'>
                {error}
              </span>
            )
          }
        >
          {onBack && (
            <Button variant='outline' onClick={onBack} disabled={isSubmitting}>
              {t('process.publish_review.back', { defaultValue: 'Back to the summary' })}
            </Button>
          )}
          {/* Only a payment under way spins, with words: a form still loading just waits */}
          <Button
            type='submit'
            loading={isSubmitting}
            loadingText={t('process.publish_review.card.processing', { defaultValue: 'Processing the payment…' })}
            disabled={loading}
          >
            {payAmount
              ? t('process.checkout.pay', { defaultValue: 'Pay {{amount}} and publish', amount: payAmount })
              : t('process.publish_review.card.cta_loading', { defaultValue: 'Pay and publish' })}
          </Button>
        </PublishReviewFooter>
      </form>
    </PublishReviewStep>
  )
}

import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHref } from 'react-router'
import { ApiErrorCode, isApiError, JobFailedError, VocdoniApiError } from '@vocdoni/api-client'
import type { ProcessCheckoutResponse } from '@vocdoni/api-types'
import { apiErrorDetails } from '~components/Auth/api'
import { Routes } from '~routes'
import { useApiClient } from '~src/providers/ApiClientProvider'
import {
  enqueuedJobId,
  httpStatus,
  isPermanentFailure,
  useProcessCheckoutApi,
  waitForPublication,
} from '~queries/process-checkout'
import { publishNeedsWalletTopUp, publishPaymentErrorMessage } from './payment-errors'

// The publish flow's state machine. Its views (the dialog's checkout steps) live with the dialog,
// in Process/Create/PublishReview

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
  // The backend confirmed the publication: shown for a moment before handing off (see `successMs`)
  | { name: 'published' }
  | { name: 'unconfirmed' }
  | { name: 'unpaid' }
  | { name: 'timeout'; paid: boolean }
  // `openWallet`: a wallet shortfall the wallet page can settle
  | { name: 'error'; message: string; openWallet?: boolean }

// The backend may take about 15 minutes on a slow chain
const publicationTimeoutMs = 15 * 60 * 1000

// How long "Vote published" shows before the hand-off: long enough to register, short enough never
// to be in the way. Nothing waits for someone who asks for less motion, nor when that cannot be told
// (no matchMedia)
const successShownMs = 700
const defaultSuccessMs = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? successShownMs
    : 0

export const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error))

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
  /** How long the success shows before `onPublished`; defaults to a short beat, none under reduced motion. */
  successMs?: number
}

/**
 * Publish, top up and publish (vocdoni-app#1767), and wait for the outcome. It waits for the backend
 * to publish: a browser success proves nothing.
 */
export const useProcessCheckout = ({
  processId,
  start,
  canTopUp,
  onPublished,
  successMs,
}: UseProcessCheckoutOptions) => {
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

  // The publication was confirmed: show it, then hand off. The dialog cannot be closed meanwhile
  // (`isPublishing`), so the hand-off always comes
  const handedOff = useRef<ProcessCheckoutStep | null>(null)
  useEffect(() => {
    if (step.name !== 'published') return
    const delay = successMs ?? defaultSuccessMs()
    if (delay <= 0) {
      // StrictMode runs the effect twice: hand off once
      if (handedOff.current === step) return
      handedOff.current = step
      latest.current.onPublished(processId)
      return
    }
    const timer = window.setTimeout(() => latest.current.onPublished(processId), delay)
    return () => window.clearTimeout(timer)
  }, [step, processId, successMs])

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
          if (outcome === 'published') setStep({ name: 'published' })
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
          if (!controller.signal.aborted) setStep({ name: 'published' })
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
export const isPublishing = (step: ProcessCheckoutStep) =>
  step.name === 'publishing' || step.name === 'waiting' || step.name === 'published'

import { ApiEndpoints, apiErrorDetails, ErrorCode } from '~components/Auth/api'
import type { ProcessPaymentStatus } from './process-price'

// One-time checkout of a voting process (vocdoni-app#1767): the embedded Stripe session the
// process is paid through. AmountCents is the net total, VAT excluded.
export type ProcessCheckout = {
  clientSecret: string
  sessionId: string
  amountCents: number
  currency: string
}

// The stored payment of a process, with the live state of its Stripe session when it has one.
export type ProcessCheckoutStatus = {
  status: ProcessPaymentStatus
  amountCents: number
  currency: string
  paidAt?: string
  sessionStatus?: 'open' | 'complete' | 'expired' | (string & {})
  sessionPaymentStatus?: 'paid' | 'unpaid' | 'no_payment_required' | (string & {})
}

// The id comes from the URL (?draftId=): encoded, so it cannot point the request elsewhere
export const processCheckoutEndpoint = (processId: string) =>
  ApiEndpoints.ProcessCheckout.replace('{processId}', encodeURIComponent(processId))

/**
 * What a payment status means for the customer waiting on it:
 * - `paid`: the money is taken; the backend publishes the process (publishing again is free).
 * - `processing`: a delayed method (e.g. SEPA debit) is clearing, which can take days. Nothing
 *   can be paid meanwhile, so waiting on it here is pointless.
 * - `failed`: the payment failed or its session expired; a new checkout can be started.
 * - `open`: the checkout was never completed; it can be resumed.
 * - `settling`: the checkout was completed and its outcome has not reached the backend yet.
 */
export type PaymentOutcome = 'paid' | 'processing' | 'failed' | 'open' | 'settling'

export const paymentOutcome = ({ status, sessionStatus }: ProcessCheckoutStatus): PaymentOutcome => {
  switch (status) {
    case 'paid':
      return 'paid'
    case 'processing':
      return 'processing'
    case 'pending':
      // The webhook moves an expired session to failed; it is already unpayable meanwhile
      if (sessionStatus === 'expired') return 'failed'
      if (sessionStatus === 'open') return 'open'
      // complete, or a session Stripe could not be asked about: the webhook decides
      return 'settling'
    default:
      // failed, or refunded: the draft it paid for was deleted, so nothing is left to wait for
      return 'failed'
  }
}

export type WaitForPaymentOptions = {
  // First delay between reads; it grows by `backoff` up to `maxIntervalMs`
  intervalMs?: number
  maxIntervalMs?: number
  backoff?: number
  // Total time to wait before giving up
  timeoutMs?: number
  sleep?: (ms: number) => Promise<void>
  now?: () => number
  // Stops waiting (e.g. the dialog was closed); resolves to `undefined`
  signal?: AbortSignal
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * Polls the payment of a process until it settles (anything but `settling`), with a growing
 * delay and a time limit, unlike the subscription flow, which polls forever. Resolves to
 * `timeout` once the limit passes with the payment still settling: the webhook may still land,
 * so the caller offers to check again rather than claiming it failed. A failed read is retried
 * like a settling one, since the payment did not change because a request failed.
 */
export const waitForPaymentOutcome = async (
  read: () => Promise<ProcessCheckoutStatus>,
  {
    intervalMs = 2000,
    maxIntervalMs = 10000,
    backoff = 1.5,
    timeoutMs = 120000,
    sleep = defaultSleep,
    now = Date.now,
    signal,
  }: WaitForPaymentOptions = {}
): Promise<Exclude<PaymentOutcome, 'settling'> | 'timeout' | undefined> => {
  const deadline = now() + timeoutMs
  let delay = intervalMs
  while (!signal?.aborted) {
    try {
      const outcome = paymentOutcome(await read())
      if (outcome !== 'settling') return signal?.aborted ? undefined : outcome
    } catch (error) {
      console.warn('could not read the payment status, retrying', error)
    }
    if (now() + delay > deadline) return signal?.aborted ? undefined : 'timeout'
    await sleep(delay)
    delay = Math.min(delay * backoff, maxIntervalMs)
  }
  return undefined
}

/**
 * Publishes a paid process. The webhook that marked it paid is publishing it too, so the
 * publication may already be done (publish then answers at once, for free) or in flight, which
 * publish refuses with 40903: that one is waited out a bounded number of times. Any other
 * failure is the caller's to show; publishing again later never charges again.
 */
export const publishPaidProcess = async <T>(
  publish: () => Promise<T>,
  {
    attempts = 6,
    delayMs = 3000,
    sleep = defaultSleep,
    signal,
  }: Pick<WaitForPaymentOptions, 'sleep' | 'signal'> & {
    attempts?: number
    delayMs?: number
  } = {}
): Promise<T> => {
  for (let attempt = 1; ; attempt++) {
    try {
      return await publish()
    } catch (error) {
      if (attempt >= attempts || signal?.aborted || apiErrorDetails(error)?.code !== ErrorCode.PublishInProgress) {
        throw error
      }
    }
    await sleep(delayMs)
  }
}

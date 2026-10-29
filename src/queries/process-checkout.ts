import { VocdoniApiError } from '@vocdoni/api-client'
import type { ProcessCheckoutRequest, ProcessPaymentStatusResponse } from '@vocdoni/api-types'
import { useMemo } from 'react'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { isProcessId } from './process-price'

// The id may come from the URL (?draftId=) or from storage; one that is not a process id could point
// the request at another endpoint (see isProcessId), so it is refused instead
export const validProcessId = (processId: string) => {
  if (!isProcessId(processId)) throw new Error(`invalid process id: ${processId}`)
  return processId
}

// The draft a redirect-based payment was opened for. Stripe sends the browser back to the wizard
// with only the session id, so the draft id is kept here until the return route reads it.
const pendingCheckoutKey = 'process-checkout-pending'

// sessionStorage can be blocked (private windows), so every access is guarded
export const storePendingCheckout = (draftId: string) => {
  try {
    sessionStorage.setItem(pendingCheckoutKey, JSON.stringify({ draftId }))
  } catch {
    // Without storage the return has no draft to reopen, and says so
  }
}

export const readPendingCheckout = (): string | undefined => {
  try {
    const value = sessionStorage.getItem(pendingCheckoutKey)
    if (value === null) return undefined
    const { draftId } = JSON.parse(value) as { draftId?: unknown }
    return typeof draftId === 'string' && isProcessId(draftId) ? draftId : undefined
  } catch {
    return undefined
  }
}

export const clearPendingCheckout = () => {
  try {
    sessionStorage.removeItem(pendingCheckoutKey)
  } catch {
    // Nothing to clear when storage is unavailable
  }
}

// The job a publish was enqueued as: a publish already done answers without one
export const enqueuedJobId = (response: unknown): string | undefined => {
  const jobId = (response as { jobId?: unknown } | undefined)?.jobId
  return typeof jobId === 'string' ? jobId : undefined
}

// The HTTP status of a refusal from the integrator SDK
export const httpStatus = (error: unknown): number | undefined => {
  if (error instanceof VocdoniApiError) return error.status
  return undefined
}

// The checkout calls of the SDK, with the process id checked first
export const useProcessCheckoutApi = () => {
  const { client } = useApiClient()

  return useMemo(
    () => ({
      // Opens the checkout, or resumes the open session for the same price and shortfall (admin only)
      checkout: (processId: string, body: ProcessCheckoutRequest) =>
        client.elections.checkout(validProcessId(processId), body),
      // The stored payment, for polling only: a browser success is never proof of payment
      getCheckout: (processId: string) => client.elections.getCheckout(validProcessId(processId)),
      // Cancels the open checkout and expires its session (admin only)
      cancelCheckout: (processId: string) => client.elections.cancelCheckout(validProcessId(processId)),
    }),
    [client]
  )
}

// A refusal no wait changes (not allowed, no such process), unlike a failed request or a server
// error, which the next read may get past
export const isPermanentFailure = (error: unknown) => {
  const status = httpStatus(error)
  return status !== undefined && status >= 400 && status < 500 && status !== 408 && status !== 429
}

/**
 * A checkout Stripe completed but has not confirmed as paid: a delayed method (such as SEPA debit)
 * clears for days, and nothing is left to wait on the browser for.
 */
export const isUnconfirmedPayment = ({ status, sessionStatus, sessionPaymentStatus }: ProcessPaymentStatusResponse) =>
  status === 'pending' && sessionStatus === 'complete' && sessionPaymentStatus === 'unpaid'

export type PublicationWait = 'published' | 'unconfirmed' | 'unpaid' | 'timeout'

export type WaitForPublicationOptions = {
  // First delay between reads; it grows by `backoff` up to `maxIntervalMs`
  intervalMs?: number
  maxIntervalMs?: number
  backoff?: number
  // Total time to wait; the backend may take about 15 minutes on a slow chain
  timeoutMs?: number
  // How long a payment may stay unconfirmed before the wait says so
  unconfirmedAfterMs?: number
  // How long a checkout may stay open after the payment before the payment counts as unpaid
  openGraceMs?: number
  // Reads the payment too. A failed read never fails the wait.
  readPayment?: () => Promise<ProcessPaymentStatusResponse>
  sleep?: (ms: number, signal?: AbortSignal) => Promise<void>
  now?: () => number
  // Stops waiting (e.g. the view was left); resolves to `undefined`
  signal?: AbortSignal
}

// Resolves early when aborted, so an abandoned wait does not hold its timer
const defaultSleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve) => {
    if (signal?.aborted) return resolve()
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        resolve()
      },
      { once: true }
    )
  })

/**
 * Polls a process until it is published, the backend's answer after a payment. The wait is
 * bounded and backs off; `timeout` means the publication may still land, so callers do not say
 * it failed.
 */
export const waitForPublication = async (
  isPublished: () => Promise<boolean>,
  {
    intervalMs = 2000,
    maxIntervalMs = 10000,
    backoff = 1.5,
    timeoutMs = 15 * 60 * 1000,
    unconfirmedAfterMs = 2 * 60 * 1000,
    openGraceMs = 30 * 1000,
    readPayment,
    sleep = defaultSleep,
    now = Date.now,
    signal,
  }: WaitForPublicationOptions = {}
): Promise<PublicationWait | undefined> => {
  const started = now()
  const deadline = started + timeoutMs
  let delay = intervalMs
  let unconfirmedSince: number | undefined
  while (!signal?.aborted) {
    try {
      if (await isPublished()) return signal?.aborted ? undefined : 'published'
    } catch (error) {
      if (isPermanentFailure(error)) throw error
      console.warn('could not read the process, retrying', error)
    }

    if (readPayment) {
      try {
        const payment = await readPayment()
        // Stripe gave up on the payment, or the checkout was left open past the grace period
        // A paid payment is never unpaid, whatever its session says
        if (payment.status !== 'paid') {
          if (payment.status === 'failed' || payment.sessionStatus === 'expired') {
            return signal?.aborted ? undefined : 'unpaid'
          }
          if (payment.sessionStatus === 'open' && now() - started >= openGraceMs) {
            return signal?.aborted ? undefined : 'unpaid'
          }
        }
        unconfirmedSince = isUnconfirmedPayment(payment) ? (unconfirmedSince ?? now()) : undefined
      } catch {
        // Keeps the last reading: a failed read says nothing about the payment
      }
      if (unconfirmedSince !== undefined && now() - unconfirmedSince >= unconfirmedAfterMs) {
        return signal?.aborted ? undefined : 'unconfirmed'
      }
    }

    if (signal?.aborted) return undefined
    if (now() + delay > deadline) return 'timeout'
    await sleep(delay, signal)
    delay = Math.min(delay * backoff, maxIntervalMs)
  }
  return undefined
}

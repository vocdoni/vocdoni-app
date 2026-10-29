import { useMutation } from '@tanstack/react-query'
import type { ProcessCensusCheckoutRequest, ProcessCheckoutResponse, WalletLedgerEntry } from '@vocdoni/api-types'
import { useCallback } from 'react'
import { useAuth } from '~components/Auth/useAuth'
import { ensure0x } from '~utils/address'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { defaultSleep, isPermanentFailure } from './process-checkout'
import { isProcessId } from './process-price'

// The SDK request, plus the process it is for. `returnURL` is where Stripe sends the browser back.
export type CensusCheckoutRequest = ProcessCensusCheckoutRequest & { processId: string }

/** Buys room in a process census (POST /processes/{processId}/census/checkout, admin only). */
export const useCensusCheckout = () => {
  const { client } = useApiClient()

  return useMutation<ProcessCheckoutResponse, Error, CensusCheckoutRequest>({
    mutationFn: ({ processId, ...body }) => {
      if (!isProcessId(processId)) return Promise.reject(new Error(`invalid process id: ${processId}`))
      return client.elections.censusCheckout(processId, body)
    },
  })
}

// The ledger lines of the payments that bought room for a process
export const censusPaymentIds = (history: WalletLedgerEntry[], processId: string): string[] =>
  history.filter((entry) => entry.kind === 'payment' && entry.processId === processId).map((entry) => entry.id)

/**
 * Reads the first page of the selected organization's ledger. The room's debit is written there, and
 * a new payment is on top of it.
 */
export const useReadWalletHistory = () => {
  const { client } = useApiClient()
  const { currentAddress } = useAuth()

  return useCallback(() => {
    if (!currentAddress) return Promise.reject(new Error('No organization address selected'))
    return client.organizations
      .getWallet(ensure0x(currentAddress), { page: 1, limit: 10 })
      .then((wallet) => wallet.history)
  }, [client, currentAddress])
}

export type WaitForCensusPaymentOptions = {
  // First delay between reads; it grows by `backoff` up to `maxIntervalMs`
  intervalMs?: number
  maxIntervalMs?: number
  backoff?: number
  // Total time to wait
  timeoutMs?: number
  sleep?: (ms: number, signal?: AbortSignal) => Promise<void>
  now?: () => number
  // Stops waiting (e.g. the view was left); resolves to `undefined`
  signal?: AbortSignal
}

export type CensusPaymentWait = { status: 'paid'; entry: WalletLedgerEntry } | { status: 'timeout' }

/**
 * Polls the wallet history until a payment for the process appears that was not in `knownIds`, the
 * snapshot taken before the payment. The debit is what the backend writes once the payment is
 * credited. `timeout` means the debit may still land, so callers do not say it failed.
 */
export const waitForCensusPayment = async (
  readHistory: () => Promise<WalletLedgerEntry[]>,
  processId: string,
  knownIds: string[],
  {
    intervalMs = 2000,
    maxIntervalMs = 10000,
    backoff = 1.5,
    timeoutMs = 2 * 60 * 1000,
    sleep = defaultSleep,
    now = Date.now,
    signal,
  }: WaitForCensusPaymentOptions = {}
): Promise<CensusPaymentWait | undefined> => {
  const deadline = now() + timeoutMs
  let delay = intervalMs
  while (!signal?.aborted) {
    try {
      const history = await readHistory()
      const entry = history.find(
        (candidate) =>
          candidate.kind === 'payment' && candidate.processId === processId && !knownIds.includes(candidate.id)
      )
      if (entry) return signal?.aborted ? undefined : { status: 'paid', entry }
    } catch (error) {
      if (isPermanentFailure(error)) throw error
      console.warn('could not read the wallet, retrying', error)
    }

    if (signal?.aborted) return undefined
    if (now() + delay > deadline) return { status: 'timeout' }
    await sleep(delay, signal)
    delay = Math.min(delay * backoff, maxIntervalMs)
  }
  return undefined
}

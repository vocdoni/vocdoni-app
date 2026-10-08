import { useQuery } from '@tanstack/react-query'
import { ApiEndpoints, BadRequestApiError } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { QueryKeys } from './keys'

// Kinds of the priced components of a voting process, as the backend names them.
export type ProcessPriceLineKind = 'base' | 'emailTwoFA' | 'smsTwoFA' | 'signedCertificate' | 'customUrl' | 'branding'

export type ProcessPriceLine = {
  // Typed loosely on purpose: a kind added by the backend must still render, with its own description
  kind: ProcessPriceLineKind | (string & {})
  // English only; the UI translates known kinds and falls back to it for unknown ones
  description: string
  amountCents: number
}

export type ProcessPaymentStatus = 'pending' | 'processing' | 'failed' | 'paid' | 'refunded'

// Pay-per-process price of a draft (vocdoni-app#1767): EUR cents, VAT excluded (checkout adds it).
export type ProcessPrice = {
  lines: ProcessPriceLine[]
  totalCents: number
  currency: string
  // Census above 15,000 voters: a custom quote is recommended
  quoteRecommended: boolean
  // Census above 50,000 voters: self-service payment is refused, only a custom quote can publish it
  quoteRequired: boolean
  // Absent until a payment has been started for the process
  paymentStatus?: ProcessPaymentStatus
}

/**
 * The backend's own price of a draft, the only one the app may show before payment: it depends on
 * the census size, the 2FA channels and the add-ons stored with the draft, so it only changes when
 * the draft saves them (see useUpdateProcess) or its group grows.
 *
 * A failed refetch keeps the last price in the query's `data`; it is dropped here, so a price the
 * backend no longer stands by is never shown, nor acted on.
 */
export const useProcessPrice = (processId?: string | null) => {
  const { bearedFetch } = useAuth()

  const query = useQuery<ProcessPrice, Error>({
    queryKey: QueryKeys.process.price(processId ?? undefined),
    enabled: !!processId,
    // The id comes from the URL (?draftId=): encoded, so it cannot point the request elsewhere
    queryFn: () =>
      bearedFetch<ProcessPrice>(ApiEndpoints.ProcessPrice.replace('{processId}', encodeURIComponent(processId!))),
    // Most failures are a draft the backend cannot price yet (isUnpriceableDraft): retrying them
    // only delays the hint
    retry: false,
  })

  return { ...query, data: query.isError ? undefined : query.data }
}

// The backend refuses to price a draft without voters (400), which drafts lack until their voters
// and authentication are set up.
export const isUnpriceableDraft = (error: unknown) => error instanceof BadRequestApiError

// Above the self-service limit only a custom quote publishes a process, so the app offers no way
// to publish it, until a payment settled that quote.
export const isQuoteOnly = (price?: ProcessPrice) => !!price?.quoteRequired && price.paymentStatus !== 'paid'

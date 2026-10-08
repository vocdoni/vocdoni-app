import { useQuery } from '@tanstack/react-query'
import { ApiEndpoints } from '~components/Auth/api'
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
 * the draft is saved (see useCreateProcess/useUpdateProcess) or its group grows.
 *
 * The backend refuses to price a draft without a census, which drafts lack until their voters
 * and authentication are set up, so callers treat an error as "no price yet".
 */
export const useProcessPrice = (processId?: string | null) => {
  const { bearedFetch } = useAuth()

  return useQuery<ProcessPrice, Error>({
    queryKey: QueryKeys.process.price(processId ?? undefined),
    enabled: !!processId,
    queryFn: () => bearedFetch<ProcessPrice>(ApiEndpoints.ProcessPrice.replace('{processId}', processId!)),
    // A missing census is the expected error here: retrying it only delays the hint
    retry: false,
  })
}

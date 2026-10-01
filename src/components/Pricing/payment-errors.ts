import { VocdoniApiError } from '@vocdoni/api-client'
import type { TFunction } from 'i18next'
import { ApiError, ErrorCode } from '~components/Auth/api'
import { currency } from '~utils/numbers'

// Pay-per-process billing (vocdoni-app#1767): the backend gates publication and census growth on
// payment, answering with these error codes. Amounts are EUR cents, VAT excluded.

export type QuoteLine = {
  kind: string
  description: string
  amountCents: number
}

// `data` of a publish refused with 40178: the quote still owed for the draft.
export type ProcessQuote = {
  lines: QuoteLine[]
  totalCents: number
  quoteRecommended: boolean
  quoteRequired: boolean
}

// `data` of a census growth refused with 40178: what growing the census of an already paid (or
// grandfathered) process would cost on top of what was paid for it.
export type ProcessCensusGrowthQuote = {
  processId: string
  lines: QuoteLine[]
  totalCents: number
  paidCents: number
  dueCents: number
  censusSize: number
  currency: string
}

// `data` of a 40175: the integrator wallet balance against the debit it could not cover. Absent
// when the backend could not read the balance.
export type WalletShortfall = {
  requiredCents: number
  availableCents: number
}

type ApiErrorDetails = {
  code?: number
  data?: unknown
}

// The app talks to the backend through both its own `api()` (ApiError) and the integrator SDK
// (VocdoniApiError); both carry the parsed error body, just under different names.
const apiErrorDetails = (error: unknown): ApiErrorDetails | undefined => {
  if (error instanceof ApiError) return { code: error.apiError?.code, data: error.apiError?.data }
  if (error instanceof VocdoniApiError) {
    const body = error.body as { data?: unknown } | undefined
    return { code: error.code, data: body?.data }
  }
  return undefined
}

const hasCents = <K extends string>(data: unknown, ...keys: K[]): data is Record<K, number> =>
  typeof data === 'object' &&
  data !== null &&
  keys.every((key) => typeof (data as Record<string, unknown>)[key] === 'number')

// A translated explanation of why publishing a draft was refused for payment reasons, or
// undefined when the error is not a payment one.
export const publishPaymentErrorMessage = (t: TFunction, error: unknown): string | undefined => {
  const details = apiErrorDetails(error)
  switch (details?.code) {
    case ErrorCode.PaymentRequired:
      if (!hasCents(details.data, 'totalCents')) break
      return t('process.payment.error.publish_payment_required', {
        defaultValue:
          'This voting process costs {{amount}} (VAT excluded) and must be paid before it can be published.',
        amount: currency(details.data.totalCents),
      })
    case ErrorCode.InsufficientWalletBalance:
      if (hasCents(details.data, 'requiredCents', 'availableCents')) {
        const { requiredCents, availableCents } = details.data
        return t('process.payment.error.wallet_insufficient_amounts', {
          defaultValue:
            'The integrator wallet has {{available}} and publishing this voting process costs {{required}} (VAT excluded). Top up the wallet and publish again.',
          available: currency(availableCents),
          required: currency(requiredCents),
        })
      }
      return t('process.payment.error.wallet_insufficient', {
        defaultValue:
          'The integrator wallet does not cover the price of this voting process. Top up the wallet and publish again.',
      })
    case ErrorCode.QuoteRequired:
      return t('process.payment.error.quote_required', {
        defaultValue:
          'Voting processes with more than 50,000 voters need a custom quote. Contact us to publish this one.',
      })
    case ErrorCode.PaymentSessionConflict:
      return t('process.payment.error.payment_in_progress', {
        defaultValue: 'A payment for this voting process is still being processed. Try again once it completes.',
      })
  }
  return undefined
}

// A translated explanation of why adding members was refused because it would grow the census of
// a voting process past what was paid for it, or undefined when the error is not a payment one.
// Every memberbase change that grows a census (adding, importing or editing members, adding them
// to a group or to a process census) can be refused this way.
export const censusGrowthPaymentErrorMessage = (t: TFunction, error: unknown): string | undefined => {
  const details = apiErrorDetails(error)
  switch (details?.code) {
    case ErrorCode.PaymentRequired:
      if (!hasCents(details.data, 'dueCents')) break
      return t('process.payment.error.census_growth_payment_required', {
        defaultValue:
          'These members would grow the census of a voting process beyond what was paid for it. Growing it costs {{amount}} more (VAT excluded).',
        amount: currency(details.data.dueCents),
      })
    case ErrorCode.PaymentSessionConflict:
      return t('process.payment.error.census_growth_payment_in_progress', {
        defaultValue:
          'A payment for a voting process using these members is still being processed. Try again once it completes.',
      })
  }
  return undefined
}

import type { TFunction } from 'i18next'
import { apiErrorDetails, ErrorCode } from '~components/Auth/api'
import { currency } from '~utils/numbers'

// Pay-per-process billing (vocdoni-app#1767): the backend gates publication and census growth on
// payment, answering with these error codes. Amounts are EUR cents, VAT excluded.

// Payloads (`data`) the guards below read; amounts are integer cents:
// - publish refused with 40178: the quote owed for the draft, `{ lines, totalCents, quoteRecommended, quoteRequired }`.
// - census growth refused with 40178: what growing the census of a paid (or grandfathered) process
//   would cost on top of what was paid, `{ processId, lines, totalCents, paidCents, dueCents, censusSize, currency }`.
// - 40175: the integrator wallet shortfall, `{ requiredCents, availableCents }`; absent when the
//   backend could not read the balance.

const hasCents = <K extends string>(data: unknown, ...keys: K[]): data is Record<K, number> =>
  typeof data === 'object' &&
  data !== null &&
  keys.every((key) => typeof (data as Record<string, unknown>)[key] === 'number')

const quoteRequiredMessage = (t: TFunction) =>
  t('process.payment.error.quote_required', {
    defaultValue: 'Voting processes with more than 50,000 voters need a custom quote. Contact us to publish this one.',
  })

// A translated explanation of why publishing a draft was refused for payment reasons, or
// undefined when the error is not a payment one.
export const publishPaymentErrorMessage = (t: TFunction, error: unknown): string | undefined => {
  const details = apiErrorDetails(error)
  switch (details?.code) {
    case ErrorCode.PaymentRequired:
      if (!hasCents(details.data, 'totalCents')) break
      // Above the self-service limit the quote is still sent, but checkout refuses it (40176):
      // asking the user to pay that price would send them to a dead end.
      if ((details.data as { quoteRequired?: unknown }).quoteRequired === true) return quoteRequiredMessage(t)
      return t('process.payment.error.publish_payment_required', {
        defaultValue:
          'This voting process costs {{amount}} (VAT excluded) and must be paid before it can be published.',
        amount: currency(details.data.totalCents),
      })
    case ErrorCode.InsufficientWalletBalance:
      if (hasCents(details.data, 'requiredCents', 'availableCents')) {
        const { requiredCents, availableCents } = details.data
        // requiredCents is what is still due, not the full price: a process that grew after a
        // wallet payment only owes the difference.
        return t('process.payment.error.wallet_insufficient_amounts', {
          defaultValue:
            'The integrator wallet has {{available}}, but {{required}} (VAT excluded) is still due to publish this voting process. Top up the wallet and publish again.',
          available: currency(availableCents),
          required: currency(requiredCents),
        })
      }
      return t('process.payment.error.wallet_insufficient', {
        defaultValue:
          'The integrator wallet does not cover the price of this voting process. Top up the wallet and publish again.',
      })
    case ErrorCode.QuoteRequired:
      return quoteRequiredMessage(t)
    case ErrorCode.PaymentSessionConflict:
      return t('process.payment.error.payment_in_progress', {
        defaultValue:
          'The payment of this voting process is not settled yet, so it cannot be published right now. Try again later, and contact us if it keeps happening.',
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

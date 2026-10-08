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

// Above this many voters the backend only sells a process through a custom quote: checkout and
// the integrator wallet both refuse it (40176), so no message may ask the user to pay. It mirrors
// the backend's threshold, which the census-growth payload does not carry yet; the locale strings
// that state it are checked against it in payment-errors.test.ts.
export const selfServiceVoterLimit = 50_000

// Prefers the backend's own verdict when the payload carries it, so a changed threshold needs no
// release here.
const exceedsSelfServiceLimit = (data: object): boolean => {
  const { quoteRequired, censusSize } = data as { quoteRequired?: unknown; censusSize?: unknown }
  if (typeof quoteRequired === 'boolean') return quoteRequired
  return typeof censusSize === 'number' && censusSize > selfServiceVoterLimit
}

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
      // The quote is the full price: for a draft that grew after it was paid, the backend does not
      // say how much was paid, so the copy cannot claim the whole amount is due.
      return t('process.payment.error.publish_payment_required', {
        defaultValue:
          'This voting process costs {{amount}} in total (VAT excluded) and must be paid before it can be published. If part of it was already paid, only the difference is due.',
        amount: currency(details.data.totalCents),
      })
    case ErrorCode.InsufficientWalletBalance:
      if (hasCents(details.data, 'requiredCents', 'availableCents')) {
        const { requiredCents, availableCents } = details.data
        // requiredCents is what is still due, not the full price: a process that grew after a
        // wallet payment only owes the difference.
        return t('process.payment.error.wallet_insufficient_amounts', {
          defaultValue:
            'The integrator wallet has {{available}}, but {{required}} (VAT excluded) is still due to publish this voting process. The integrator managing this organization must top up its wallet before you publish again.',
          available: currency(availableCents),
          required: currency(requiredCents),
        })
      }
      return t('process.payment.error.wallet_insufficient', {
        defaultValue:
          'The integrator wallet does not cover the price of this voting process. The integrator managing this organization must top up its wallet before you publish again.',
      })
    case ErrorCode.QuoteRequired:
      return quoteRequiredMessage(t)
    case ErrorCode.PaymentSessionConflict:
      // Also answered for a pending checkout or an unfinished refund, not only a payment being
      // processed, so the copy cannot promise that waiting is enough.
      return t('process.payment.error.payment_in_progress', {
        defaultValue:
          'A payment, checkout or refund of this voting process is not finished yet, so it cannot be published right now. Try again later, and contact us if it keeps happening.',
      })
  }
  return undefined
}

// Payment explanations are longer than a usual error toast, so they stay up long enough to read
// and can be dismissed. Spread into the toast options when a payment message is shown.
export const paymentErrorToastOptions = { duration: 10000, isClosable: true } as const

// A translated explanation of why a draft could not be saved because its payment is being
// processed (the backend locks it meanwhile), or undefined for any other error.
export const draftSavePaymentErrorMessage = (t: TFunction, error: unknown): string | undefined => {
  if (apiErrorDetails(error)?.code !== ErrorCode.PaymentSessionConflict) return undefined
  // The same code refuses adding branding to a draft paid without it, which retrying never fixes.
  return t('process.payment.error.draft_payment_in_progress', {
    defaultValue:
      'This draft cannot be saved because of its payment: either the payment is still being processed, or the change is not allowed once paid (such as adding branding). Contact us if it keeps happening.',
  })
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
      if (exceedsSelfServiceLimit(details.data)) {
        return t('process.payment.error.census_growth_quote_required', {
          defaultValue:
            'These members would take the census of a voting process above 50,000 voters, which needs a custom quote. Contact us to grow it.',
        })
      }
      // An upper bound: a bulk import is priced on every submitted row, including members the
      // census already has.
      return t('process.payment.error.census_growth_payment_required', {
        defaultValue:
          'These members would grow the census of a voting process beyond what was paid for it. Growing it costs up to {{amount}} more (VAT excluded).',
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

import { ApiErrorCode, isCensusGrowthQuote } from '@vocdoni/api-client'
import type { CensusGrowthQuote, InsufficientWalletBalanceData, PaymentRequiredData } from '@vocdoni/api-types'
import type { TFunction } from 'i18next'
import { apiErrorDetails } from '~components/Auth/api'
import { isProcessId } from '~queries/process-price'
import { currency } from '~utils/numbers'

// Pay-per-process billing (saas-backend#819): publish and census growth need payment. Amounts: EUR cents, no VAT.
// 40178: publish carries `shortfallCents` (exact); census growth carries `dueCents` (an upper bound).
// 40175 (managed orgs) carries `requiredCents` and `availableCents`, absent when the balance is unknown.

// The `data` of an ApiError is untyped JSON, so the SDK's payload types are only trusted once the
// fields the copy reads are numbers.
const hasNumbers = (data: unknown, ...keys: string[]): boolean =>
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

const censusGrowthQuoteRequiredMessage = (t: TFunction) =>
  t('process.payment.error.census_growth_quote_required', {
    defaultValue:
      'These members would take the census of a voting process above 50,000 voters, which needs a custom quote. Contact us to grow it.',
  })

// A translated explanation of why publishing a draft was refused for payment reasons, or
// undefined when the error is not a payment one.
export const publishPaymentErrorMessage = (t: TFunction, error: unknown): string | undefined => {
  const details = apiErrorDetails(error)
  switch (details?.code) {
    case ApiErrorCode.PaymentRequired: {
      const quote = details.data as PaymentRequiredData | CensusGrowthQuote
      // A census-growth refusal (dueCents) can carry totalCents too: it is not a publish one.
      if (!hasNumbers(quote, 'totalCents') || isCensusGrowthQuote(quote)) break
      // Above the self-service limit the quote is still sent, but checkout refuses it (40176):
      // asking the user to pay that price would send them to a dead end.
      if (quote.quoteRequired === true) return quoteRequiredMessage(t)
      if (hasNumbers(quote, 'balanceCents', 'shortfallCents')) {
        return t('process.payment.error.publish_wallet_short', {
          defaultValue:
            'Your wallet has {{balance}}, and publishing this voting process needs {{shortfall}} more (VAT excluded). Top up your wallet in Settings → Wallet, then publish again.',
          balance: currency(quote.balanceCents),
          shortfall: currency(quote.shortfallCents),
        })
      }
      return t('process.payment.error.publish_payment_required', {
        defaultValue:
          'This voting process costs {{amount}} in total (VAT excluded) and must be paid before it can be published. Top up your wallet in Settings → Wallet, then publish again.',
        amount: currency(quote.totalCents),
      })
    }
    case ApiErrorCode.InsufficientWalletBalance:
      if (hasNumbers(details.data, 'requiredCents', 'availableCents')) {
        const { requiredCents, availableCents } = details.data as InsufficientWalletBalanceData
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
    case ApiErrorCode.IntegratorOrgCannotOwnProcess:
      return t('process.payment.error.publish_integrator_org', {
        defaultValue:
          'Your integrator organization cannot own voting processes, only the organizations it manages can. Publish this process from one of them.',
      })
    case ApiErrorCode.QuoteRequired:
      return quoteRequiredMessage(t)
    case ApiErrorCode.SpendCapReached:
      // The backend may send this without data, so the copy does not read it.
      return t('process.payment.error.spend_cap_reached', {
        defaultValue:
          'Publishing this voting process would exceed the spend cap the integrator set for this organization. The integrator must raise it before you publish again.',
      })
    case ApiErrorCode.PaymentSessionConflict:
      // Also answered for an open top-up checkout or an unfinished draft deletion, so the copy
      // cannot promise that waiting is enough.
      return t('process.payment.error.payment_in_progress', {
        defaultValue:
          'This voting process cannot be published right now because of its payment: a top-up checkout may still be open, a payment may be being credited, or a change (such as adding branding after payment) may not be allowed. Check the draft and its payment, then try again.',
      })
  }
  return undefined
}

// Whether a publish refusal is a standard organization's wallet shortfall, which the wallet page
// can fix: the toast offers a way there only then.
export const publishNeedsWalletTopUp = (error: unknown): boolean => {
  const details = apiErrorDetails(error)
  if (details?.code !== ApiErrorCode.PaymentRequired) return false
  const quote = details.data as PaymentRequiredData | CensusGrowthQuote
  return hasNumbers(quote, 'totalCents') && !isCensusGrowthQuote(quote) && quote.quoteRequired !== true
}

// Payment explanations are longer than a usual error toast, so they stay up long enough to read
// and can be dismissed. Spread into the toast options when a payment message is shown.
export const paymentErrorToastOptions = { duration: 10000, isClosable: true } as const

// A translated explanation of why a draft could not be saved because of its payment, or
// undefined for any other error.
export const draftSavePaymentErrorMessage = (t: TFunction, error: unknown): string | undefined => {
  switch (apiErrorDetails(error)?.code) {
    case ApiErrorCode.IntegratorOrgCannotOwnProcess:
      return t('process.payment.error.draft_integrator_org', {
        defaultValue:
          'Your integrator organization cannot own voting processes, only the organizations it manages can. Save this draft from one of them.',
      })
    case ApiErrorCode.PaymentSessionConflict:
      // The same code also refuses adding branding or a custom URL to a draft paid without them,
      // which retrying never fixes.
      return t('process.payment.error.draft_payment_in_progress', {
        defaultValue:
          'This draft cannot be saved because of its payment. Branding or a custom URL cannot be added once it is paid: remove them. If a payment is being credited, wait a moment and try again.',
      })
  }
  return undefined
}

// The room a census-growth refusal (40178) would buy through checkout: the process, the census size
// it must reach and what it costs, EUR cents VAT excluded. Undefined when checkout cannot sell it:
// a refusal without the process, or one above the self-service limit (checkout refuses it, 40176).
export type CensusGrowthCheckoutTarget = {
  processId: string
  censusSize: number
  dueCents: number
  shortfallCents?: number
}

export const censusGrowthCheckoutTarget = (error: unknown): CensusGrowthCheckoutTarget | undefined => {
  const details = apiErrorDetails(error)
  if (details?.code !== ErrorCode.PaymentRequired || !hasCents(details.data, 'dueCents', 'censusSize')) return undefined
  const data = details.data as { processId?: unknown; shortfallCents?: unknown }
  const { censusSize, dueCents } = details.data
  if (typeof data.processId !== 'string' || !isProcessId(data.processId)) return undefined
  if (censusSize < 1 || exceedsSelfServiceLimit(details.data)) return undefined
  return {
    processId: data.processId,
    censusSize,
    dueCents,
    shortfallCents: typeof data.shortfallCents === 'number' ? data.shortfallCents : undefined,
  }
}

// A translated explanation of why adding members was refused because it would grow the census of
// a voting process past what was paid for it, or undefined when the error is not a payment one.
// Every memberbase change that grows a census (adding, importing or editing members, adding them
// to a group or to a process census) can be refused this way.
export const censusGrowthPaymentErrorMessage = (t: TFunction, error: unknown): string | undefined => {
  const details = apiErrorDetails(error)
  switch (details?.code) {
    case ApiErrorCode.PaymentRequired: {
      const quote = details.data as PaymentRequiredData | CensusGrowthQuote
      if (!hasNumbers(quote, 'dueCents') || !isCensusGrowthQuote(quote)) break
      if (exceedsSelfServiceLimit(quote)) return censusGrowthQuoteRequiredMessage(t)
      // An upper bound: a bulk import is priced on every submitted row, including members the
      // census already has.
      const { dueCents, shortfallCents } = quote
      if (hasNumbers(quote, 'shortfallCents') && shortfallCents > 0) {
        return t('process.payment.error.census_growth_payment_shortfall', {
          defaultValue:
            'These members would grow the census of a voting process beyond what was paid for it. Growing it costs up to {{amount}} more (VAT excluded), which must be bought before adding these members. Your wallet lacks {{shortfall}} of that amount.',
          amount: currency(dueCents),
          shortfall: currency(shortfallCents),
        })
      }
      return t('process.payment.error.census_growth_payment_required', {
        defaultValue:
          'These members would grow the census of a voting process beyond what was paid for it. Growing it costs up to {{amount}} more (VAT excluded), which must be bought before adding these members.',
        amount: currency(dueCents),
      })
    }
    case ApiErrorCode.InsufficientWalletBalance:
      if (hasNumbers(details.data, 'requiredCents', 'availableCents')) {
        const { requiredCents, availableCents } = details.data as InsufficientWalletBalanceData
        return t('process.payment.error.census_growth_wallet_insufficient_amounts', {
          defaultValue:
            'The integrator wallet has {{available}}, but {{required}} (VAT excluded) is needed to add these members to a voting process. The integrator managing this organization must top up its wallet first.',
          available: currency(availableCents),
          required: currency(requiredCents),
        })
      }
      return t('process.payment.error.census_growth_wallet_insufficient', {
        defaultValue:
          'The integrator wallet does not cover the cost of adding these members to a voting process. The integrator managing this organization must top up its wallet first.',
      })
    case ApiErrorCode.QuoteRequired:
      return censusGrowthQuoteRequiredMessage(t)
    case ApiErrorCode.PaymentSessionConflict:
      return t('process.payment.error.census_growth_payment_in_progress', {
        defaultValue:
          'A payment for a voting process using these members is still being processed. Try again once it completes.',
      })
  }
  return undefined
}

// A translated explanation of why an invitation or a role change was refused because the
// organization already has its maximum of admins and managers, or undefined for any other error.
export const teamWriterLimitErrorMessage = (t: TFunction, error: unknown): string | undefined => {
  if (apiErrorDetails(error)?.code !== ApiErrorCode.MaxWritersReached) return undefined
  return t('team.max_writers_reached', {
    defaultValue:
      'This organization already has 5 admins and managers, pending invitations included. Remove one or cancel a pending invitation to free a slot. Viewers are not limited.',
  })
}

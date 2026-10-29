import { VocdoniApiError } from '@vocdoni/api-client'
import type { TFunction } from 'i18next'
import { ApiError, ErrorCode } from '~components/Auth/api'
import {
  censusGrowthPaymentErrorMessage,
  draftSavePaymentErrorMessage,
  publishNeedsWalletTopUp,
  publishPaymentErrorMessage,
  selfServiceVoterLimit,
  teamWriterLimitErrorMessage,
} from './payment-errors'

vi.mock('~utils/numbers', () => ({ currency: (cents: number) => `€${cents / 100}` }))

// Renders the default English copy with its interpolations, so assertions read like the UI.
const t = ((_key: string, { defaultValue, ...values }: Record<string, string>) =>
  defaultValue.replace(/{{(\w+)}}/g, (_, name) => values[name])) as unknown as TFunction

// The app's own `api()` client
const apiError = (code: number, data?: unknown) =>
  new ApiError({ error: 'raw backend message', code, data }, new Response(null, { status: 402 }))

// The integrator SDK client: `body` is the parsed error response
const sdkError = (code: number, data?: unknown) =>
  new VocdoniApiError(402, { error: 'raw backend message', code, data }, 'raw backend message', code)

const quote = { lines: [], totalCents: 29000, quoteRecommended: false, quoteRequired: false }
const walletQuote = { ...quote, balanceCents: 5000, shortfallCents: 24000 }
const growth = {
  processId: '6650f0c0c0c0c0c0c0c0c0c0',
  lines: [],
  totalCents: 31000,
  paidCents: 29000,
  dueCents: 2000,
  censusSize: 700,
  currency: 'eur',
}

describe('publishPaymentErrorMessage', () => {
  it.each([
    ['the SDK client', sdkError],
    ['the app api client', apiError],
  ])('explains a publish refused for a short wallet through %s, with the balance and the shortfall', (_, build) => {
    expect(publishPaymentErrorMessage(t, build(ErrorCode.PaymentRequired, walletQuote))).toBe(
      'Your wallet has €50, and publishing this voting process needs €240 more (VAT excluded). Top up your wallet in Settings → Wallet, then publish again.'
    )
  })

  it('uses the shortfall, not the balance, when a refund left the balance negative', () => {
    expect(
      publishPaymentErrorMessage(
        t,
        apiError(ErrorCode.PaymentRequired, { ...walletQuote, balanceCents: -500, shortfallCents: 29500 })
      )
    ).toMatch(/needs €295 more \(VAT excluded\)/)
  })

  it('does not read a census growth refusal as a publish one', () => {
    // Both carry a total; only the growth payload carries what is due
    expect(publishPaymentErrorMessage(t, apiError(ErrorCode.PaymentRequired, growth))).toBeUndefined()
    expect(publishNeedsWalletTopUp(apiError(ErrorCode.PaymentRequired, growth))).toBe(false)
  })

  it('falls back to the quoted price when the wallet amounts are missing', () => {
    expect(publishPaymentErrorMessage(t, sdkError(ErrorCode.PaymentRequired, quote))).toBe(
      'This voting process costs €290 in total (VAT excluded) and must be paid before it can be published. Top up your wallet in Settings → Wallet, then publish again.'
    )
    expect(
      publishPaymentErrorMessage(t, apiError(ErrorCode.PaymentRequired, { ...quote, balanceCents: 5000 }))
    ).toMatch(/costs €290 in total/)
  })

  it('asks for a custom quote, not a payment, when the quote is above the self-service limit', () => {
    expect(
      publishPaymentErrorMessage(t, sdkError(ErrorCode.PaymentRequired, { ...walletQuote, quoteRequired: true }))
    ).toBe('Voting processes with more than 50,000 voters need a custom quote. Contact us to publish this one.')
  })

  it('explains a short integrator wallet, with the amounts when the backend sends them', () => {
    expect(
      publishPaymentErrorMessage(
        t,
        sdkError(ErrorCode.InsufficientWalletBalance, { requiredCents: 29000, availableCents: 5000 })
      )
    ).toBe(
      'The integrator wallet has €50, but €290 (VAT excluded) is still due to publish this voting process. The integrator managing this organization must top up its wallet before you publish again.'
    )
    expect(publishPaymentErrorMessage(t, sdkError(ErrorCode.InsufficientWalletBalance))).toBe(
      'The integrator wallet does not cover the price of this voting process. The integrator managing this organization must top up its wallet before you publish again.'
    )
  })

  it('explains an integrator organization that cannot own a process', () => {
    expect(publishPaymentErrorMessage(t, apiError(ErrorCode.IntegratorOrgCannotOwnProcess))).toMatch(
      /Publish this process from one of them/
    )
  })

  it('explains a spend cap the integrator must raise', () => {
    expect(
      publishPaymentErrorMessage(
        t,
        sdkError(ErrorCode.SpendCapReached, { capCents: 100000, spentCents: 90000, requiredCents: 29000 })
      )
    ).toMatch(/The integrator must raise it before you publish again/)
  })

  it('explains the custom quote and the unsettled payment refusals', () => {
    expect(publishPaymentErrorMessage(t, sdkError(ErrorCode.QuoteRequired))).toMatch(/custom quote/)
    expect(publishPaymentErrorMessage(t, sdkError(ErrorCode.PaymentSessionConflict))).toMatch(
      /cannot be published right now because of its payment/
    )
  })

  it('leaves non-payment errors, and a payment code without its quote, to the caller', () => {
    expect(publishPaymentErrorMessage(t, sdkError(ErrorCode.DraftLimitReached))).toBeUndefined()
    expect(publishPaymentErrorMessage(t, sdkError(ErrorCode.PaymentRequired))).toBeUndefined()
    expect(publishPaymentErrorMessage(t, sdkError(ErrorCode.MaxWritersReached))).toBeUndefined()
    expect(publishPaymentErrorMessage(t, new Error('network down'))).toBeUndefined()
    expect(publishPaymentErrorMessage(t, undefined)).toBeUndefined()
  })
})

describe('publishNeedsWalletTopUp', () => {
  it('offers the wallet only for a standard organization short on its wallet', () => {
    expect(publishNeedsWalletTopUp(sdkError(ErrorCode.PaymentRequired, walletQuote))).toBe(true)
    expect(publishNeedsWalletTopUp(apiError(ErrorCode.PaymentRequired, quote))).toBe(true)
    expect(publishNeedsWalletTopUp(sdkError(ErrorCode.PaymentRequired, { ...walletQuote, quoteRequired: true }))).toBe(
      false
    )
    expect(publishNeedsWalletTopUp(sdkError(ErrorCode.PaymentRequired))).toBe(false)
    expect(publishNeedsWalletTopUp(sdkError(ErrorCode.InsufficientWalletBalance))).toBe(false)
    expect(publishNeedsWalletTopUp(new Error('network down'))).toBe(false)
  })
})

describe('censusGrowthPaymentErrorMessage', () => {
  it.each([
    ['the SDK client', sdkError],
    ['the app api client', apiError],
  ])('explains a census growth refused for payment through %s, with the amount due', (_, build) => {
    expect(censusGrowthPaymentErrorMessage(t, build(ErrorCode.PaymentRequired, growth))).toBe(
      'These members would grow the census of a voting process beyond what was paid for it. Growing it costs up to €20 more (VAT excluded), which must be bought before adding these members.'
    )
  })

  it('also says what the wallet lacks when the shortfall is above zero', () => {
    expect(
      censusGrowthPaymentErrorMessage(
        t,
        apiError(ErrorCode.PaymentRequired, { ...growth, balanceCents: 500, shortfallCents: 1500 })
      )
    ).toBe(
      'These members would grow the census of a voting process beyond what was paid for it. Growing it costs up to €20 more (VAT excluded), which must be bought before adding these members. Your wallet lacks €15 of that amount.'
    )
    expect(
      censusGrowthPaymentErrorMessage(
        t,
        apiError(ErrorCode.PaymentRequired, { ...growth, balanceCents: 2000, shortfallCents: 0 })
      )
    ).not.toMatch(/wallet lacks/)
  })

  it('asks for a custom quote, not a payment, when the grown census is above the self-service limit', () => {
    expect(
      censusGrowthPaymentErrorMessage(t, apiError(ErrorCode.PaymentRequired, { ...growth, censusSize: 50001 }))
    ).toBe(
      'These members would take the census of a voting process above 50,000 voters, which needs a custom quote. Contact us to grow it.'
    )
    expect(
      censusGrowthPaymentErrorMessage(t, apiError(ErrorCode.PaymentRequired, { ...growth, censusSize: 50000 }))
    ).toMatch(/costs up to €20 more/)
  })

  it("follows the backend's own custom-quote verdict when the payload carries one", () => {
    expect(
      censusGrowthPaymentErrorMessage(
        t,
        apiError(ErrorCode.PaymentRequired, { ...growth, censusSize: 50001, quoteRequired: false })
      )
    ).toMatch(/costs up to €20 more/)
    expect(
      censusGrowthPaymentErrorMessage(t, apiError(ErrorCode.PaymentRequired, { ...growth, quoteRequired: true }))
    ).toMatch(/custom quote/)
  })

  it('asks for a custom quote on a quote-only refusal', () => {
    expect(censusGrowthPaymentErrorMessage(t, sdkError(ErrorCode.QuoteRequired))).toBe(
      'These members would take the census of a voting process above 50,000 voters, which needs a custom quote. Contact us to grow it.'
    )
  })

  it('explains a short integrator wallet for the growth, with the amounts when the backend sends them', () => {
    expect(
      censusGrowthPaymentErrorMessage(
        t,
        sdkError(ErrorCode.InsufficientWalletBalance, { requiredCents: 2000, availableCents: 500 })
      )
    ).toBe(
      'The integrator wallet has €5, but €20 (VAT excluded) is needed to add these members to a voting process. The integrator managing this organization must top up its wallet first.'
    )
    expect(censusGrowthPaymentErrorMessage(t, sdkError(ErrorCode.InsufficientWalletBalance))).toBe(
      'The integrator wallet does not cover the cost of adding these members to a voting process. The integrator managing this organization must top up its wallet first.'
    )
  })

  it('explains a growth refused while a payment is in flight', () => {
    expect(censusGrowthPaymentErrorMessage(t, apiError(ErrorCode.PaymentSessionConflict))).toMatch(
      /still being processed/
    )
  })

  it('does not read a publish quote as a census growth one', () => {
    // 40178 is shared by both refusals; only the growth payload carries what is due
    expect(censusGrowthPaymentErrorMessage(t, apiError(ErrorCode.PaymentRequired, quote))).toBeUndefined()
    expect(censusGrowthPaymentErrorMessage(t, apiError(ErrorCode.MalformedJSONBody))).toBeUndefined()
  })
})

describe('draftSavePaymentErrorMessage', () => {
  it('explains a draft locked by its payment', () => {
    expect(draftSavePaymentErrorMessage(t, sdkError(ErrorCode.PaymentSessionConflict))).toMatch(
      /cannot be saved because of its payment/
    )
  })

  it('explains an integrator organization that cannot own a draft', () => {
    expect(draftSavePaymentErrorMessage(t, apiError(ErrorCode.IntegratorOrgCannotOwnProcess))).toMatch(
      /Save this draft from one of them/
    )
  })

  it('leaves any other error to the caller', () => {
    expect(draftSavePaymentErrorMessage(t, sdkError(ErrorCode.DraftLimitReached))).toBeUndefined()
    expect(draftSavePaymentErrorMessage(t, sdkError(ErrorCode.PaymentRequired))).toBeUndefined()
    expect(draftSavePaymentErrorMessage(t, new Error('network down'))).toBeUndefined()
  })
})

describe('teamWriterLimitErrorMessage', () => {
  it.each([
    ['the SDK client', sdkError],
    ['the app api client', apiError],
  ])('explains a team with its admin and manager limit reached, through %s', (_, build) => {
    expect(teamWriterLimitErrorMessage(t, build(ErrorCode.MaxWritersReached))).toBe(
      'This organization already has 5 admins and managers, pending invitations included. Remove one or cancel a pending invitation to free a slot. Viewers are not limited.'
    )
  })

  it('leaves any other error to the caller', () => {
    expect(teamWriterLimitErrorMessage(t, apiError(ErrorCode.BadRequest))).toBeUndefined()
    expect(teamWriterLimitErrorMessage(t, new Error('network down'))).toBeUndefined()
  })
})

describe('selfServiceVoterLimit', () => {
  // The copy states the limit as a literal, each locale with its own digit grouping, so it is
  // checked here against the constant the messages are chosen by.
  const locales = import.meta.glob<{ process: { payment: { error: Record<string, string> } } }>(
    '../../i18n/locales/*/common.json',
    { eager: true, import: 'default' }
  )

  it.each(Object.keys(locales))('is the limit %s states in its custom-quote messages', (path) => {
    const { error } = locales[path].process.payment
    for (const key of ['quote_required', 'census_growth_quote_required']) {
      const digits = error[key].replace(/(\d)[\s.,\u00a0\u202f](?=\d{3})/g, '$1')
      expect(digits).toContain(String(selfServiceVoterLimit))
    }
  })
})

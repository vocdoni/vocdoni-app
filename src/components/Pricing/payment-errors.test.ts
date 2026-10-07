import { VocdoniApiError } from '@vocdoni/api-client'
import type { TFunction } from 'i18next'
import { ApiError, ErrorCode } from '~components/Auth/api'
import {
  censusGrowthPaymentErrorMessage,
  draftSavePaymentErrorMessage,
  publishPaymentErrorMessage,
  selfServiceVoterLimit,
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
  ])('explains a publish refused for payment through %s, with the quoted price', (_, build) => {
    expect(publishPaymentErrorMessage(t, build(ErrorCode.PaymentRequired, quote))).toBe(
      'This voting process costs €290 in total (VAT excluded) and must be paid before it can be published. If part of it was already paid, only the difference is due.'
    )
  })

  it('asks for a custom quote, not a payment, when the quote is above the self-service limit', () => {
    expect(publishPaymentErrorMessage(t, sdkError(ErrorCode.PaymentRequired, { ...quote, quoteRequired: true }))).toBe(
      'Voting processes with more than 50,000 voters need a custom quote. Contact us to publish this one.'
    )
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

  it('explains the custom quote and in-flight payment refusals', () => {
    expect(publishPaymentErrorMessage(t, sdkError(ErrorCode.QuoteRequired))).toMatch(/custom quote/)
    expect(publishPaymentErrorMessage(t, sdkError(ErrorCode.PaymentSessionConflict))).toMatch(
      /payment, checkout or refund/
    )
  })

  it('leaves non-payment errors, and a payment code without its quote, to the caller', () => {
    expect(publishPaymentErrorMessage(t, sdkError(ErrorCode.DraftLimitReached))).toBeUndefined()
    expect(publishPaymentErrorMessage(t, sdkError(ErrorCode.PaymentRequired))).toBeUndefined()
    expect(publishPaymentErrorMessage(t, new Error('network down'))).toBeUndefined()
    expect(publishPaymentErrorMessage(t, undefined)).toBeUndefined()
  })
})

describe('censusGrowthPaymentErrorMessage', () => {
  it.each([
    ['the SDK client', sdkError],
    ['the app api client', apiError],
  ])('explains a census growth refused for payment through %s, with the amount due', (_, build) => {
    expect(censusGrowthPaymentErrorMessage(t, build(ErrorCode.PaymentRequired, growth))).toBe(
      'These members would grow the census of a voting process beyond what was paid for it. Growing it costs up to €20 more (VAT excluded).'
    )
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
  it('explains a draft locked by its payment, and leaves any other error to the caller', () => {
    expect(draftSavePaymentErrorMessage(t, sdkError(ErrorCode.PaymentSessionConflict))).toMatch(
      /payment is still being processed/
    )
    expect(draftSavePaymentErrorMessage(t, sdkError(ErrorCode.DraftLimitReached))).toBeUndefined()
    expect(draftSavePaymentErrorMessage(t, new Error('network down'))).toBeUndefined()
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

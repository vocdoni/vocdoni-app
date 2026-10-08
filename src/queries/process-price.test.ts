import { BadRequestApiError, UnauthorizedApiError } from '~components/Auth/api'
import { isQuoteOnly, isUnpriceableDraft, type ProcessPrice } from './process-price'

const price = (overrides: Partial<ProcessPrice> = {}): ProcessPrice => ({
  lines: [],
  totalCents: 500000,
  currency: 'eur',
  quoteRecommended: true,
  quoteRequired: true,
  ...overrides,
})

describe('isQuoteOnly', () => {
  it('holds above the self-service limit until a payment settled the quote', () => {
    expect(isQuoteOnly(price())).toBe(true)
    expect(isQuoteOnly(price({ paymentStatus: 'pending' }))).toBe(true)
    expect(isQuoteOnly(price({ paymentStatus: 'paid' }))).toBe(false)
  })

  it('does not hold below the limit, nor without a price', () => {
    expect(isQuoteOnly(price({ quoteRequired: false }))).toBe(false)
    expect(isQuoteOnly(undefined)).toBe(false)
  })
})

describe('isUnpriceableDraft', () => {
  it("is the backend's refusal to price a draft without voters, not any failure", () => {
    expect(isUnpriceableDraft(new BadRequestApiError({ error: 'census size must be between 1 and 10000000' }))).toBe(
      true
    )
    expect(isUnpriceableDraft(new UnauthorizedApiError({ error: 'not a manager' }))).toBe(false)
    expect(isUnpriceableDraft(new Error('network down'))).toBe(false)
  })
})

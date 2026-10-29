import { VocdoniApiError } from '@vocdoni/api-client'
import type { ProcessPriceResponse } from '@vocdoni/api-types'
import { ErrorCode } from '~components/Auth/api'
import { isProcessId, isQuoteOnly, isUnpriceableDraft } from './process-price'

const price = (overrides: Partial<ProcessPriceResponse> = {}): ProcessPriceResponse => ({
  lines: [],
  totalCents: 500000,
  currency: 'eur',
  quoteRecommended: true,
  quoteRequired: true,
  ...overrides,
})

describe('isQuoteOnly', () => {
  it('holds above the self-service limit, whatever was paid', () => {
    expect(isQuoteOnly(price())).toBe(true)
    expect(isQuoteOnly(price({ paymentStatus: 'pending' }))).toBe(true)
    expect(isQuoteOnly(price({ paymentStatus: 'paid' }))).toBe(true)
  })

  it('holds for the zero total of a quote-only price, which is not a free process', () => {
    expect(isQuoteOnly(price({ lines: [], totalCents: 0 }))).toBe(true)
  })

  it('does not hold below the limit, nor without a price', () => {
    expect(isQuoteOnly(price({ quoteRequired: false }))).toBe(false)
    expect(isQuoteOnly(undefined)).toBe(false)
  })
})

describe('isUnpriceableDraft', () => {
  it("is the backend's refusal to price a draft without voters, not any failure", () => {
    expect(
      isUnpriceableDraft(
        new VocdoniApiError(
          400,
          { error: 'census size must be between 1 and 10000000', code: ErrorCode.MalformedJSONBody },
          'census size must be between 1 and 10000000',
          ErrorCode.MalformedJSONBody
        )
      )
    ).toBe(true)
    // A malformed process id is a 400 too (40010), but not one setting up voters fixes
    expect(
      isUnpriceableDraft(new VocdoniApiError(400, { error: 'invalid process ID' }, 'invalid process ID', 40010))
    ).toBe(false)
    expect(isUnpriceableDraft(new VocdoniApiError(401, { error: 'not a manager' }, 'not a manager', 401))).toBe(false)
    expect(isUnpriceableDraft(new Error('network down'))).toBe(false)
  })
})

describe('isProcessId', () => {
  it('only accepts an ObjectID, so a URL-supplied id cannot resolve to another path', () => {
    expect(isProcessId('6650f0c0c0c0c0c0c0c0c0c0')).toBe(true)
    for (const id of ['..', '.', 'x/../../users/me?', 'abc', '', null, undefined]) expect(isProcessId(id)).toBe(false)
  })
})

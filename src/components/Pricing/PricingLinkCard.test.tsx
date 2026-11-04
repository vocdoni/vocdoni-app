import { pricingUrl } from './PricingLinkCard'

describe('pricingUrl', () => {
  it('points English to the root pricing page', () => {
    expect(pricingUrl('en')).toBe('https://vocdoni.io/pricing')
  })

  it('points a published locale to its localized pricing page', () => {
    expect(pricingUrl('es')).toBe('https://vocdoni.io/es/pricing')
    expect(pricingUrl('pt-br')).toBe('https://vocdoni.io/pt-br/pricing')
  })

  it('falls back to the English pricing page for unknown locales', () => {
    expect(pricingUrl('ja')).toBe('https://vocdoni.io/pricing')
  })
})

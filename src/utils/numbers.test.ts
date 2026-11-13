import type { i18n as I18nInstance } from 'i18next'
import { setActiveI18n } from '~i18n/active-language'
import { amountFigure, currency, parseEuroAmountCents, quantity } from './numbers'

describe('currency', () => {
  afterEach(() => setActiveI18n(undefined))

  it('drops the decimals of whole amounts and keeps both cent digits otherwise', () => {
    setActiveI18n({ resolvedLanguage: 'en' } as I18nInstance)
    expect(currency(2900)).toBe('€29')
    expect(currency(29710)).toBe('€297.10')
    expect(currency(5050)).toBe('€50.50')
    // a fractional amount that rounds to whole euros, as a yearly price split into months
    expect(currency(59995 / 12)).toBe('€50')
  })

  it('formats in the language the page renders in', () => {
    setActiveI18n({ resolvedLanguage: 'es' } as I18nInstance)
    expect(currency(29710)).toBe('297,10 €')
    setActiveI18n({ resolvedLanguage: 'en' } as I18nInstance)
    expect(currency(29710)).toBe('€297.10')
  })
})

describe('amountFigure', () => {
  afterEach(() => setActiveI18n(undefined))

  it('keeps both cent digits and sets a real minus sign, so a column of amounts lines up', () => {
    setActiveI18n({ resolvedLanguage: 'en' } as I18nInstance)
    expect(amountFigure(3300)).toBe('€33.00')
    expect(amountFigure(693)).toBe('€6.93')
    expect(amountFigure(-3300)).toBe('\u2212€33.00')
    expect(amountFigure(0)).toBe('€0.00')
    expect(amountFigure(3300, 'USD')).toBe('$33.00')
    setActiveI18n({ resolvedLanguage: 'es' } as I18nInstance)
    expect(amountFigure(-3300)).toMatch(/^\u221233,00\s€$/)
  })

  it('leaves the short form alone', () => {
    setActiveI18n({ resolvedLanguage: 'en' } as I18nInstance)
    expect(currency(-3300)).toBe('-€33')
  })
})

describe('quantity', () => {
  afterEach(() => setActiveI18n(undefined))

  it('groups digits as the language the page renders in does', () => {
    setActiveI18n({ resolvedLanguage: 'en' } as I18nInstance)
    expect(quantity(50000)).toBe('50,000')
    setActiveI18n({ resolvedLanguage: 'es' } as I18nInstance)
    expect(quantity(50000)).toBe('50.000')
  })
})

describe('parseEuroAmountCents', () => {
  it('turns whole and up to 2-decimal euro amounts into cents', () => {
    expect(parseEuroAmountCents('12')).toBe(1200)
    expect(parseEuroAmountCents('12.5')).toBe(1250)
    expect(parseEuroAmountCents(' 0.07 ')).toBe(7)
    expect(parseEuroAmountCents('0')).toBe(0)
  })

  it('returns null for negative, over-precise or malformed amounts', () => {
    expect(parseEuroAmountCents('-5')).toBeNull()
    expect(parseEuroAmountCents('1.234')).toBeNull()
    expect(parseEuroAmountCents('1,50')).toBeNull()
    expect(parseEuroAmountCents('abc')).toBeNull()
    expect(parseEuroAmountCents('')).toBeNull()
    expect(parseEuroAmountCents('1e5')).toBeNull()
    expect(parseEuroAmountCents('.5')).toBeNull()
    expect(parseEuroAmountCents('100000000000000000')).toBeNull()
  })
})

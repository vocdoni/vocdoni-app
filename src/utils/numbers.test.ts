import type { i18n as I18nInstance } from 'i18next'
import { setActiveI18n } from '~i18n/active-language'
import { currency } from './numbers'

describe('currency', () => {
  afterEach(() => setActiveI18n(undefined))

  it('drops the decimals of whole amounts and keeps both cent digits otherwise', () => {
    setActiveI18n({ resolvedLanguage: 'en' } as I18nInstance)
    expect(currency(2900)).toBe('€29')
    expect(currency(29710)).toBe('€297.10')
    expect(currency(5050)).toBe('€50.50')
  })

  it('formats in the language the page renders in', () => {
    setActiveI18n({ resolvedLanguage: 'es' } as I18nInstance)
    expect(currency(29710)).toBe('297,10 €')
    setActiveI18n({ resolvedLanguage: 'en' } as I18nInstance)
    expect(currency(29710)).toBe('€297.10')
  })
})

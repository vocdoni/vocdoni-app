import { getActiveLanguage } from '~i18n/active-language'
import i18n from '~i18n/index'

// Whole euros render without decimals ("€29"), anything else with both cent digits ("€297.10").
// Formatted in the language the page renders in: localized routes use their own i18n instance.
export const currency = (amount: number, currency: string = 'EUR') =>
  (amount / 100).toLocaleString(getActiveLanguage() ?? i18n.resolvedLanguage, {
    style: 'currency',
    currency,
    minimumFractionDigits: amount % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
    currencyDisplay: 'symbol',
  })

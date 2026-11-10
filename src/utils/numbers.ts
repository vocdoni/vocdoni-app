import { getActiveLanguage } from '~i18n/active-language'
import i18n from '~i18n/index'

// Counts (voters, members...) with the digit grouping of the language the page renders in.
export const quantity = (count: number) => count.toLocaleString(getActiveLanguage() ?? i18n.resolvedLanguage)

export type CurrencyOptions = {
  /** `always`: both cent digits on whole amounts too ("€33.00"), so a column of amounts lines up. */
  cents?: 'auto' | 'always'
  /** `true`: a real minus sign (U+2212) in place of the hyphen, for amounts set as figures. */
  minus?: 'hyphen' | 'true'
}

// Whole euros render without decimals ("€29"), anything else with both cent digits ("€297.10"):
// the short form, for sentences and buttons. Formatted in the language the page renders in:
// localized routes use their own i18n instance.
export const currency = (amount: number, currency: string = 'EUR', options: CurrencyOptions = {}) => {
  const text = (amount / 100).toLocaleString(getActiveLanguage() ?? i18n.resolvedLanguage, {
    style: 'currency',
    currency,
    // Rounded first: callers may pass fractional cents (a yearly price split into months)
    minimumFractionDigits: options.cents === 'always' || Math.round(amount) % 100 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
    currencyDisplay: 'symbol',
  })
  return options.minus === 'true' ? text.replace('-', '\u2212') : text
}

/** An amount in a column of amounts (a receipt-like table): always with cents, with a real minus. */
export const amountFigure = (amount: number, code?: string) =>
  currency(amount, code, { cents: 'always', minus: 'true' })

// A euro amount typed by the user ("12", "12.5", "12.50") as EUR cents, or null when it is not one
// (negative, more than 2 decimals, not a number, or too large to count in cents exactly).
export const parseEuroAmountCents = (value: string): number | null => {
  const trimmed = value.trim()
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null
  const cents = Math.round(Number(trimmed) * 100)
  return Number.isSafeInteger(cents) ? cents : null
}

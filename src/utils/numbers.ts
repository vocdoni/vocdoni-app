import { getActiveLanguage } from '~i18n/active-language'
import i18n from '~i18n/index'

// Counts (voters, members...) with the digit grouping of the language the page renders in.
export const quantity = (count: number) => count.toLocaleString(getActiveLanguage() ?? i18n.resolvedLanguage)

// Whole euros render without decimals ("€29"), anything else with both cent digits ("€297.10").
// Formatted in the language the page renders in: localized routes use their own i18n instance.
export const currency = (amount: number, currency: string = 'EUR') =>
  (amount / 100).toLocaleString(getActiveLanguage() ?? i18n.resolvedLanguage, {
    style: 'currency',
    currency,
    // Rounded first: callers may pass fractional cents (a yearly price split into months)
    minimumFractionDigits: Math.round(amount) % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
    currencyDisplay: 'symbol',
  })

// A euro amount typed by the user ("12", "12.5", "12.50") as EUR cents, or null when it is not one
// (negative, more than 2 decimals, not a number, or too large to count in cents exactly).
export const parseEuroAmountCents = (value: string): number | null => {
  const trimmed = value.trim()
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null
  const cents = Math.round(Number(trimmed) * 100)
  return Number.isSafeInteger(cents) ? cents : null
}

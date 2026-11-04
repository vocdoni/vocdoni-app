import i18n from '~i18n/index'

export const currency = (amount: number, currency: string = 'EUR') =>
  (amount / 100).toLocaleString(i18n.resolvedLanguage, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    currencyDisplay: 'symbol',
  })

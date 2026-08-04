import { format as dformat } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { datesLocale } from './locales'

export const useDateFns = () => {
  const { i18n } = useTranslation()
  return {
    // Tolerates missing/unparseable values: SAAS processes created with an immediate
    // start come back with empty date strings even though the type declares them
    // required, and date-fns `format` throws a RangeError on invalid dates.
    format: (date: Date | number | string | null | undefined, format: string): string | undefined => {
      if (date === null || date === undefined || date === '') return undefined
      const value = date instanceof Date ? date : new Date(date)
      if (isNaN(value.getTime())) return undefined
      return dformat(value, format, { locale: datesLocale(i18n.language) })
    },
  }
}

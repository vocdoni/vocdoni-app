import { Locale } from 'date-fns'
/**
 * If you add or remove any languages, remember to also update languages.ts
 */
import ca from './ca/common.json'
import en from './en/common.json'
import es from './es/common.json'
import it from './it/common.json'

// no need to import english here, since it's date-fns default language
import { ca as dca } from 'date-fns/locale/ca'
import { es as des } from 'date-fns/locale/es'
import { it as dit } from 'date-fns/locale/it'

export const translations: { [key: string]: any } = {
  ca,
  en,
  es,
  it,
}

export const dateLocales: { [key: string]: Locale } = {
  ca: dca,
  es: des,
  it: dit,
}

export const datesLocale = (lang?: string) => {
  if (!lang) return
  if (!dateLocales.hasOwnProperty(lang)) return

  return dateLocales[lang]
}

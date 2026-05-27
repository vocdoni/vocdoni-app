import { Locale } from 'date-fns'
/**
 * If you add or remove any languages, remember to also update languages.ts
 */
import ca from './ca/common.json'
import caReactComponents from './ca/react-components.json'
import de from './de/common.json'
import deReactComponents from './de/react-components.json'
import el from './el/common.json'
import elReactComponents from './el/react-components.json'
import en from './en/common.json'
import enReactComponents from './en/react-components.json'
import es from './es/common.json'
import esReactComponents from './es/react-components.json'
import it from './it/common.json'
import itReactComponents from './it/react-components.json'

// no need to import english here, since it's date-fns default language
import { ca as dca } from 'date-fns/locale/ca'
import { de as dde } from 'date-fns/locale/de'
import { el as del } from 'date-fns/locale/el'
import { es as des } from 'date-fns/locale/es'
import { it as dit } from 'date-fns/locale/it'

export const translations: { [key: string]: any } = {
  ca,
  de,
  el,
  en,
  es,
  it,
}

export const reactComponentsTranslations: { [key: string]: any } = {
  ca: caReactComponents,
  de: deReactComponents,
  el: elReactComponents,
  en: enReactComponents,
  es: esReactComponents,
  it: itReactComponents,
}

export const dateLocales: { [key: string]: Locale } = {
  ca: dca,
  de: dde,
  el: del,
  es: des,
  it: dit,
}

export const datesLocale = (lang?: string) => {
  if (!lang) return
  if (!dateLocales.hasOwnProperty(lang)) return

  return dateLocales[lang]
}

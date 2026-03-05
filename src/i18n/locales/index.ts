import { Locale } from 'date-fns'
/**
 * If you add or remove any languages, remember to also update languages.ts
 */
import ca from './ca/common.json'
import en from './en/common.json'
import es from './es/common.json'
import it from './it/common.json'
import caReactProviders from './ca/react-providers.json'
import enReactProviders from './en/react-providers.json'
import esReactProviders from './es/react-providers.json'
import itReactProviders from './it/react-providers.json'
import caReactComponents from './ca/react-components.json'
import enReactComponents from './en/react-components.json'
import esReactComponents from './es/react-components.json'
import itReactComponents from './it/react-components.json'

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

export const reactProvidersTranslations: { [key: string]: any } = {
  ca: caReactProviders,
  en: enReactProviders,
  es: esReactProviders,
  it: itReactProviders,
}

export const reactComponentsTranslations: { [key: string]: any } = {
  ca: caReactComponents,
  en: enReactComponents,
  es: esReactComponents,
  it: itReactComponents,
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

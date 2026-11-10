import type { Locale } from 'date-fns'
import en from './en/common.json'
import enReactComponents from './en/react-components.json'

/** Everything one language ships: the app's two namespaces and its date-fns locale. */
export type LocaleBundle = {
  common: Record<string, unknown>
  reactComponents: Record<string, unknown>
  // Absent for English, which is date-fns' default.
  dateLocale?: Locale
}

// English is the source language and the default fallback, so it stays in the main
// chunk: a missing key always has something to fall back to without a request.
const englishBundle: LocaleBundle = { common: en, reactComponents: enReactComponents }

/**
 * Every other language is its own chunk, fetched only when it is needed.
 * If you add or remove any languages, remember to also update languages.ts
 */
const loaders: Record<string, () => Promise<{ default: LocaleBundle }>> = {
  ca: () => import('./ca'),
  de: () => import('./de'),
  el: () => import('./el'),
  es: () => import('./es'),
  eu: () => import('./eu'),
  fr: () => import('./fr'),
  it: () => import('./it'),
  pt: () => import('./pt'),
  'pt-br': () => import('./pt-br'),
}

const loaded: Record<string, LocaleBundle> = { en: englishBundle }
const pending: Record<string, Promise<LocaleBundle | undefined>> = {}

/** Maps a route or browser code (`pt-BR`, `es-AR`) to the bundle that serves it. */
export const toBundleLanguage = (language: string | undefined) => {
  const code = language?.trim().toLowerCase().replace(/_/g, '-')
  if (!code) return undefined
  if (loaded[code] || loaders[code]) return code
  const base = code.split('-')[0]
  return loaded[base] || loaders[base] ? base : undefined
}

export const getLoadedLocaleBundle = (language: string) => loaded[language]

export const getLoadedLanguages = () => Object.keys(loaded)

/** Resolves to undefined for a language with no bundle; a failed fetch rejects and can be retried. */
export const loadLocaleBundle = (language: string): Promise<LocaleBundle | undefined> => {
  if (loaded[language]) return Promise.resolve(loaded[language])
  const loader = loaders[language]
  if (!loader) return Promise.resolve(undefined)

  pending[language] ??= loader().then(
    ({ default: bundle }) => {
      delete pending[language]
      loaded[language] = bundle
      return bundle
    },
    (error) => {
      delete pending[language]
      throw error
    }
  )

  return pending[language]
}

/** The date-fns locale of a loaded language; undefined means date-fns' English default. */
export const datesLocale = (lang?: string) => (lang ? loaded[lang]?.dateLocale : undefined)

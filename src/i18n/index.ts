import { reactComponentsNamespace, reactComponentsResources } from '@vocdoni/react-components'
import { format, formatDistance } from 'date-fns'
import i18next, { BackendModule, i18n as I18nInstance, Resource } from 'i18next'
import BrowserLanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import { ucfirst } from '~utils/strings'
import { baseLanguages } from './languages'
import {
  datesLocale,
  getLoadedLanguages,
  getLoadedLocaleBundle,
  LocaleBundle,
  loadLocaleBundle,
  toBundleLanguage,
} from './locales'

// Each language is fetched on demand (English is always bundled as the fallback).
// The runtime LANGUAGES config decides which languages are offered and which is the
// fallback (see LanguageOptions below); the loader serves any of them.
const allLanguages = Object.keys(baseLanguages)
const DEFAULT_FALLBACK_LANGUAGE = 'en'
const defaultNamespaces = ['common', reactComponentsNamespace]
const isTestEnv = typeof process !== 'undefined' && (process.env.VITEST === 'true' || process.env.NODE_ENV === 'test')

/** Runtime-driven language configuration passed from the app's env. */
export type LanguageOptions = {
  supportedLanguages: string[]
  fallbackLanguage: string
}

const defaultLanguageOptions: LanguageOptions = {
  supportedLanguages: allLanguages,
  fallbackLanguage: DEFAULT_FALLBACK_LANGUAGE,
}

type DebugOptions = {
  isDev: boolean
  isTestEnv: boolean
  isBrowser: boolean
}

export const shouldEnableI18nDebug = ({ isDev, isTestEnv, isBrowser }: DebugOptions) => isDev && !isTestEnv && isBrowser

// Deep-merges the app's per-locale react-components overrides over the SDK's
// bundled resources. A shallow spread would replace whole sections (e.g. the
// app's `statuses` object silently dropping SDK-provided keys like
// `statuses.ready`), so nested objects are merged key by key instead.
const deepMergeResources = (base: Record<string, any>, override: Record<string, any>): Record<string, any> => {
  const merged = { ...base }

  for (const [key, value] of Object.entries(override)) {
    const baseValue = merged[key]
    if (value && baseValue && typeof value === 'object' && typeof baseValue === 'object' && !Array.isArray(value)) {
      merged[key] = deepMergeResources(baseValue, value)
    } else {
      merged[key] = value
    }
  }

  return merged
}

const resourcesCache: Record<string, Record<string, Record<string, any>>> = {}

const toResources = (lang: string, bundle: LocaleBundle) => {
  if (!resourcesCache[lang]) {
    const componentResources = reactComponentsResources[lang as keyof typeof reactComponentsResources]
    resourcesCache[lang] = {
      common: bundle.common,
      [reactComponentsNamespace]: deepMergeResources(
        componentResources?.[reactComponentsNamespace] ?? {},
        bundle.reactComponents
      ),
    }
  }
  return resourcesCache[lang]
}

// Seeds a new instance with every language loaded so far, so a page created after
// loadLanguages() renders (and hydrates) synchronously. Fresh outer objects, because
// i18next writes into the resources object it is given.
const loadedResources = (): Resource =>
  Object.fromEntries(getLoadedLanguages().map((lang) => [lang, { ...toResources(lang, getLoadedLocaleBundle(lang)) }]))

// Lets i18next fetch a language it does not have yet, e.g. on an in-place switch:
// changeLanguage waits for it before switching, so no key is ever shown.
const localeBackend: BackendModule = {
  type: 'backend',
  init: () => {},
  read: (language, namespace, callback) => {
    const lang = toBundleLanguage(language)
    if (!lang) return callback(null, {})

    loadLocaleBundle(lang).then(
      (bundle) => callback(null, bundle ? (toResources(lang, bundle)[namespace] ?? {}) : {}),
      (error) => callback(error, false)
    )
  },
}

const registerFormatters = (instance: I18nInstance) => {
  instance.services.formatter?.add('relative', (value: any, lng: string | undefined, options: any) => {
    const opts = { locale: datesLocale(lng) }
    const now = new Date()

    const relative = formatDistance(now, value, opts)

    if (!options.future && !options.past) {
      return relative
    }
    if (now < value) {
      return options.future.replace('%time', relative)
    }
    return options.past.replace('%time', relative)
  })

  instance.services.formatter?.add('duration', (value: any, lng: string | undefined) => {
    const opts = { locale: datesLocale(lng) }

    return formatDistance(value.begin, value.end, opts)
  })

  instance.services.formatter?.add('format', (value: any, lng: string | undefined, options: any) => {
    const opts = { locale: datesLocale(lng) }

    return format(value, options.format, opts)
  })

  instance.services.formatter?.add('uppercase', (value: string, lng: string | undefined) =>
    value.toLocaleUpperCase(lng)
  )
  instance.services.formatter?.add('lowercase', (value: string, lng: string | undefined) =>
    value.toLocaleLowerCase(lng)
  )
  instance.services.formatter?.add('ucfirst', (value: string, lng: string | undefined) => ucfirst(value, lng))
}

const getI18nOptions = ({
  language,
  isBrowser,
  supportedLanguages,
  fallbackLanguage,
}: { language?: string; isBrowser: boolean } & LanguageOptions) => ({
  lng: language,
  fallbackLng: fallbackLanguage,
  supportedLngs: supportedLanguages,
  lowerCaseLng: true,
  debug: shouldEnableI18nDebug({ isDev: import.meta.env.DEV, isTestEnv, isBrowser }),
  ns: defaultNamespaces,
  defaultNS: 'common',
  resources: loadedResources(),
  // Keeps the backend for the languages missing from `resources`.
  partialBundledLanguages: true,
  showSupportNotice: false,
  interpolation: {
    escapeValue: false,
  },
  returnEmptyString: false,
  initAsync: false,
})

const initializeInstance = ({
  instance,
  language,
  useBrowserLanguageDetector,
  languageOptions = defaultLanguageOptions,
}: {
  instance: I18nInstance
  language?: string
  useBrowserLanguageDetector: boolean
  languageOptions?: LanguageOptions
}) => {
  if (useBrowserLanguageDetector) {
    instance.use(BrowserLanguageDetector)
  }

  instance.use(localeBackend).use(initReactI18next)
  instance.init(
    getI18nOptions({
      language,
      isBrowser: typeof window !== 'undefined',
      ...languageOptions,
    }),
    (err) => {
      if (err) {
        console.error('i18next init error:', err)
        return
      }

      if (useBrowserLanguageDetector && instance.resolvedLanguage !== instance.language) {
        instance.changeLanguage(instance.resolvedLanguage)
      }
    }
  )
  registerFormatters(instance)
}

// Applies runtime LANGUAGES (supported set + fallback) to an already-initialized
// instance. i18next caches supportedLngs inside languageUtils at init time, so we
// update both the options and that cache, then re-resolve the active language
// against the new supported set.
const applyRuntimeLanguageOptions = (
  instance: I18nInstance,
  { supportedLanguages, fallbackLanguage }: LanguageOptions
) => {
  instance.options.supportedLngs = supportedLanguages
  instance.options.fallbackLng = fallbackLanguage

  const languageUtils = instance.services?.languageUtils as { supportedLngs?: string[] } | undefined
  if (languageUtils) {
    languageUtils.supportedLngs = supportedLanguages
  }

  if (instance.language) {
    instance.changeLanguage(instance.language)
  }
}

let baseI18nInstance: I18nInstance | null = null
let baseI18nHasRuntimeOptions = false

export const getBaseI18n = (languageOptions?: LanguageOptions) => {
  if (baseI18nInstance) {
    // The base instance is created eagerly at import time (see the default export
    // below) with default options, before AppProviders can supply the runtime
    // LANGUAGES slice. Apply those options the first time they arrive so the
    // configured supported languages and fallback actually take effect.
    if (languageOptions && !baseI18nHasRuntimeOptions) {
      applyRuntimeLanguageOptions(baseI18nInstance, languageOptions)
      baseI18nHasRuntimeOptions = true
    }
    return baseI18nInstance
  }

  baseI18nInstance = i18next.createInstance()
  baseI18nHasRuntimeOptions = Boolean(languageOptions)
  initializeInstance({
    instance: baseI18nInstance,
    useBrowserLanguageDetector: true,
    languageOptions,
  })

  return baseI18nInstance
}

export const createPageI18nInstance = (language: string, languageOptions?: LanguageOptions) => {
  const instance = i18next.createInstance()
  initializeInstance({
    instance,
    language,
    useBrowserLanguageDetector: false,
    languageOptions,
  })

  return instance
}

/**
 * Fetches these languages and adds them to the base instance, which imperative
 * callers (document titles, error messages) translate through. Pages created
 * afterwards start with them. A failed fetch is logged and the language falls back.
 */
export const loadLanguages = async (languages: (string | undefined)[]) => {
  const codes = [...new Set(languages.map(toBundleLanguage).filter((lang): lang is string => Boolean(lang)))]
  const base = getBaseI18n()

  await Promise.all(
    codes.map(async (lang) => {
      try {
        const bundle = await loadLocaleBundle(lang)
        if (!bundle) return
        for (const [namespace, resources] of Object.entries(toResources(lang, bundle))) {
          if (!base.hasResourceBundle(lang, namespace)) base.addResourceBundle(lang, namespace, resources)
        }
      } catch (error) {
        console.error(`i18n: could not load the "${lang}" translations`, error)
      }
    })
  )
}

export default getBaseI18n()

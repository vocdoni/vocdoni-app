import { reactComponentsNamespace, reactComponentsResources } from '@vocdoni/react-components'
import { format, formatDistance, Locale } from 'date-fns'
import i18next, { i18n as I18nInstance } from 'i18next'
import BrowserLanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import { AppEnv, getLanguagesEnv } from '~src/app-env'
import { ucfirst } from '~utils/strings'
import { dateLocales, reactComponentsTranslations, translations } from './locales'

const languagesSlice = getLanguagesEnv()
const supportedLanguages = Object.keys(languagesSlice)
const fallbackLanguage = supportedLanguages[0]
const defaultNamespaces = ['common', reactComponentsNamespace]
const isTestEnv = typeof process !== 'undefined' && (process.env.VITEST === 'true' || process.env.NODE_ENV === 'test')

type DebugOptions = {
  isDev: boolean
  isTestEnv: boolean
  isBrowser: boolean
}

export const shouldEnableI18nDebug = ({ isDev, isTestEnv, isBrowser }: DebugOptions) => isDev && !isTestEnv && isBrowser

const resources = Object.fromEntries(
  supportedLanguages.map((lang) => {
    const componentResources = reactComponentsResources[lang as keyof typeof reactComponentsResources]

    return [
      lang,
      {
        common: translations[lang] ?? {},
        [reactComponentsNamespace]: {
          ...(componentResources?.[reactComponentsNamespace] ?? {}),
          ...(reactComponentsTranslations[lang] ?? {}),
        },
      },
    ]
  })
)

const registerFormatters = (instance: I18nInstance) => {
  instance.services.formatter?.add('relative', (value: any, lng: string | undefined, options: any) => {
    const opts: { locale?: Locale } = {}
    const now = new Date()
    if (lng && lng !== 'en') {
      opts.locale = dateLocales[lng]
    }

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
    const opts: { locale?: Locale } = {}
    if (lng && lng !== 'en') {
      opts.locale = dateLocales[lng]
    }

    return formatDistance(value.begin, value.end, opts)
  })

  instance.services.formatter?.add('format', (value: any, lng: string | undefined, options: any) => {
    const opts: { locale?: Locale } = {}
    if (lng && lng !== 'en') {
      opts.locale = dateLocales[lng]
    }

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

const getI18nOptions = ({ language, isBrowser }: { language?: string; isBrowser: boolean }) => ({
  lng: language,
  fallbackLng: fallbackLanguage,
  supportedLngs: supportedLanguages,
  debug: shouldEnableI18nDebug({ isDev: AppEnv.DEV, isTestEnv, isBrowser }),
  ns: defaultNamespaces,
  defaultNS: 'common',
  resources,
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
}: {
  instance: I18nInstance
  language?: string
  useBrowserLanguageDetector: boolean
}) => {
  if (useBrowserLanguageDetector) {
    instance.use(BrowserLanguageDetector)
  }

  instance.use(initReactI18next)
  instance.init(
    getI18nOptions({
      language,
      isBrowser: typeof window !== 'undefined',
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

let baseI18nInstance: I18nInstance | null = null

export const getBaseI18n = () => {
  if (baseI18nInstance) {
    return baseI18nInstance
  }

  baseI18nInstance = i18next.createInstance()
  initializeInstance({
    instance: baseI18nInstance,
    useBrowserLanguageDetector: true,
  })

  return baseI18nInstance
}

export const createPageI18nInstance = (language: string) => {
  const instance = i18next.createInstance()
  initializeInstance({
    instance,
    language,
    useBrowserLanguageDetector: false,
  })

  return instance
}

export default getBaseI18n()

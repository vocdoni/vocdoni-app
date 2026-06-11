import { useTranslation } from 'react-i18next'
import { hasAcceptedCookieConsent } from '~components/Cookies/utils'
import { useLanguagesEnv } from '~src/app-env'
import { useLanguageRouting } from './LanguageRoutingContext'
import { localizePublicPath, persistPublicLanguagePreferenceClient } from './public-language'

const defaultNavigate = (url: string) => window.location.assign(url)

export const navigateToPublicLanguage = async ({
  language,
  supportedLanguages,
  currentPathname,
  publicLanguageLinks,
  navigate = defaultNavigate,
  changeLanguage,
}: {
  language: string
  supportedLanguages: string[]
  currentPathname?: string
  publicLanguageLinks?: Record<string, string>
  navigate?: (url: string) => void
  changeLanguage: (language: string) => Promise<unknown>
}) => {
  const cookieEnabled = typeof window !== 'undefined' && hasAcceptedCookieConsent()

  persistPublicLanguagePreferenceClient(language, {
    supportedLanguages,
    storage: typeof window === 'undefined' ? undefined : window.localStorage,
    cookieEnabled,
    document: typeof document === 'undefined' ? undefined : document,
    location: typeof window === 'undefined' ? undefined : window.location,
  })

  const targetUrl = publicLanguageLinks?.[language]

  if (targetUrl && typeof window !== 'undefined') {
    navigate(targetUrl)
    return
  }

  const pathname = currentPathname ?? (typeof window === 'undefined' ? undefined : window.location.pathname)

  if (pathname) {
    navigate(
      localizePublicPath({
        pathname,
        language,
        supportedLanguages,
      })
    )
  } else {
    await changeLanguage(language)
  }
}

export const usePublicLanguageRouting = ({
  publicLanguageLinks,
  navigate,
}: {
  publicLanguageLinks?: Record<string, string>
  navigate?: (url: string) => void
} = {}) => {
  const { i18n } = useTranslation()
  const supportedLanguages = Object.keys(useLanguagesEnv())
  const languageRouting = useLanguageRouting()

  return {
    currentLanguage: i18n.language,
    navigateToLanguage: (language: string) => {
      const hasPublicLink = Boolean(publicLanguageLinks?.[language])

      // Client-rendered (react-router) routes switch in place, without a full
      // page reload. Fall back to a localized URL navigation when the target is
      // a Vike SSR public page (its server must re-render the localized content),
      // when an explicit navigate override is given (e.g. tests), or when there
      // is no routing context available.
      if (languageRouting && !hasPublicLink && !navigate) {
        languageRouting.setLanguage(language)
        return
      }

      return navigateToPublicLanguage({
        language,
        supportedLanguages,
        publicLanguageLinks,
        navigate,
        changeLanguage: i18n.changeLanguage.bind(i18n),
      })
    },
  }
}

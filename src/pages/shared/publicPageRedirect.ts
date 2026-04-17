import { useEffect } from 'react'
import { hasAcceptedCookieConsent } from '~components/Cookies/utils'
import {
  getDefaultPublicLanguage,
  getPersistedPublicLanguageClient,
  getPublicPathLanguageContext,
  getSupportedPublicLanguages,
  localizePublicPath,
  persistPublicLanguagePreferenceClient,
  resolvePreferredPublicLanguageClient,
} from '~i18n/public-language'

const normalizePathname = (pathname: string) => pathname.replace(/\/+$/, '') || '/'
const withLocationSuffix = (url: string) =>
  typeof window === 'undefined' ? url : `${url}${window.location.search}${window.location.hash}`

export const usePreferredPublicLanguageRedirect = ({
  pathname,
  navigate,
}: {
  pathname: string
  navigate?: (url: string) => void
}) => {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const supportedLanguages = getSupportedPublicLanguages()
    const cookieEnabled = hasAcceptedCookieConsent()
    const { routeLanguage } = getPublicPathLanguageContext(pathname, supportedLanguages)
    const preferredLanguage = getPersistedPublicLanguageClient({
      supportedLanguages,
      storage: window.localStorage,
      cookie: document.cookie,
      cookieEnabled,
    })

    if (!preferredLanguage) {
      persistPublicLanguagePreferenceClient(routeLanguage, {
        supportedLanguages,
        storage: window.localStorage,
        cookieEnabled,
        document,
        location: window.location,
      })
      return
    }

    persistPublicLanguagePreferenceClient(preferredLanguage, {
      supportedLanguages,
      storage: window.localStorage,
      cookieEnabled,
      document,
      location: window.location,
    })

    if (preferredLanguage === routeLanguage) return

    const redirectTarget = localizePublicPath({
      pathname,
      language: preferredLanguage,
      supportedLanguages,
    })

    if (normalizePathname(window.location.pathname) === normalizePathname(redirectTarget)) return
    ;(navigate ?? ((url: string) => window.location.replace(url)))(withLocationSuffix(redirectTarget))
  }, [navigate, pathname])
}

export const useRootLanguageRedirect = ({ navigate }: { navigate?: (url: string) => void }) => {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const supportedLanguages = getSupportedPublicLanguages()
    const defaultLanguage = getDefaultPublicLanguage(supportedLanguages)
    const cookieEnabled = hasAcceptedCookieConsent()
    const persistedLanguage = getPersistedPublicLanguageClient({
      supportedLanguages,
      storage: window.localStorage,
      cookie: document.cookie,
      cookieEnabled,
    })
    const preferredLanguage =
      persistedLanguage ??
      resolvePreferredPublicLanguageClient({
        supportedLanguages,
        defaultLanguage,
        storage: window.localStorage,
        navigatorLanguages: [...(window.navigator.languages ?? []), window.navigator.language].filter(Boolean),
      })
    const redirectTarget = `/${preferredLanguage}`

    persistPublicLanguagePreferenceClient(preferredLanguage, {
      supportedLanguages,
      storage: window.localStorage,
      cookieEnabled,
      document,
      location: window.location,
    })

    if (normalizePathname(window.location.pathname) === normalizePathname(redirectTarget)) return
    ;(navigate ?? ((url: string) => window.location.replace(url)))(withLocationSuffix(redirectTarget))
  }, [navigate])
}

export const useLegacyPublicPathRedirect = ({
  pathname,
  navigate,
}: {
  pathname: string
  navigate?: (url: string) => void
}) => {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const supportedLanguages = getSupportedPublicLanguages()
    const cookieEnabled = hasAcceptedCookieConsent()
    const preferredLanguage =
      getPersistedPublicLanguageClient({
        supportedLanguages,
        storage: window.localStorage,
        cookie: document.cookie,
        cookieEnabled,
      }) ?? getDefaultPublicLanguage(supportedLanguages)

    persistPublicLanguagePreferenceClient(preferredLanguage, {
      supportedLanguages,
      storage: window.localStorage,
      cookieEnabled,
      document,
      location: window.location,
    })

    const redirectTarget = localizePublicPath({
      pathname,
      language: preferredLanguage,
      supportedLanguages,
    })

    if (normalizePathname(window.location.pathname) === normalizePathname(redirectTarget)) return
    ;(navigate ?? ((url: string) => window.location.replace(url)))(withLocationSuffix(redirectTarget))
  }, [navigate, pathname])
}

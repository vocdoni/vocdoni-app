import { useEffect } from 'react'
import {
  getPublicPathLanguageContext,
  getDefaultPublicLanguage,
  getStoredPublicLanguage,
  getSupportedPublicLanguages,
  localizePublicPath,
  persistPublicLanguage,
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
    const { routeLanguage } = getPublicPathLanguageContext(pathname, supportedLanguages)
    const preferredLanguage = getStoredPublicLanguage({
      supportedLanguages,
      storage: window.localStorage,
    })

    if (!preferredLanguage) {
      persistPublicLanguage(routeLanguage, {
        supportedLanguages,
        storage: window.localStorage,
      })
      return
    }

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
    const preferredLanguage = resolvePreferredPublicLanguageClient({
      supportedLanguages,
      defaultLanguage,
      storage: window.localStorage,
      navigatorLanguages: [...(window.navigator.languages ?? []), window.navigator.language].filter(Boolean),
    })
    const redirectTarget = `/${preferredLanguage}`

    persistPublicLanguage(preferredLanguage, {
      supportedLanguages,
      storage: window.localStorage,
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
    const preferredLanguage =
      getStoredPublicLanguage({
        supportedLanguages,
        storage: window.localStorage,
      }) ?? getDefaultPublicLanguage(supportedLanguages)

    persistPublicLanguage(preferredLanguage, {
      supportedLanguages,
      storage: window.localStorage,
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

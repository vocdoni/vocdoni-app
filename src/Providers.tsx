import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { hasAcceptedCookieConsent } from '~components/Cookies/utils'
import { LanguageRoutingContext } from '~i18n/LanguageRoutingContext'
import {
  localizePublicPath,
  normalizePublicLanguageCandidate,
  persistPublicLanguagePreferenceClient,
} from '~i18n/public-language'
import { getDefaultTitleForLanguage } from '~src/pages/shared/defaultHeadMeta'
import { AppProviders } from './AppProviders'
import { normalizeLanguages, resolveAppEnv } from './app-env'
import { RoutesProvider } from './router/Router'

export { AppProviders }

export const Providers = ({ basename, language }: { basename?: string; language?: string } = {}) =>
  language ? (
    // Localized (Vike `/:lang/...` catch-all) entry: language lives in client
    // state so it can be switched in place without a full page reload.
    <LocalizedProviders initialLanguage={language} />
  ) : (
    // Non-localized entry (e.g. the legacy SPA mount): keep the previous behavior.
    <AppProviders>
      <RoutesProvider basename={basename} />
    </AppProviders>
  )

const LocalizedProviders = ({ initialLanguage }: { initialLanguage: string }) => {
  const pageContext = usePageContext()
  const appEnv = resolveAppEnv(pageContext?.globalContext?.appEnv)
  const supportedLanguages = useMemo(() => Object.keys(normalizeLanguages(appEnv.LANGUAGES)), [appEnv.LANGUAGES])

  const [language, setLanguageState] = useState(initialLanguage)

  // In-place language switches (pushState, no Vike navigation) never re-run the
  // +title/+lang hooks, so keep the document metadata in the active language ourselves.
  useEffect(() => {
    document.documentElement.lang = language
    document.title = getDefaultTitleForLanguage(language, appEnv.title)
  }, [language, appEnv.title])

  // Keep the active language in sync with the URL on browser back/forward across
  // localized prefixes, so the router basename and i18n follow the address bar.
  useEffect(() => {
    const sync = () => {
      const urlLanguage = normalizePublicLanguageCandidate(
        window.location.pathname.split('/')[1] ?? '',
        supportedLanguages
      )
      if (urlLanguage) setLanguageState(urlLanguage)
    }
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [supportedLanguages])

  const setLanguage = useCallback(
    (next: string) => {
      const normalized = normalizePublicLanguageCandidate(next, supportedLanguages)
      if (!normalized) return

      // Re-selecting the active language is a no-op; avoids a duplicate history entry.
      const currentUrlLanguage = normalizePublicLanguageCandidate(
        window.location.pathname.split('/')[1] ?? '',
        supportedLanguages
      )
      if (normalized === currentUrlLanguage) return

      persistPublicLanguagePreferenceClient(normalized, {
        supportedLanguages,
        storage: window.localStorage,
        cookieEnabled: hasAcceptedCookieConsent(),
        document,
        location: window.location,
      })

      // Swap the visible URL language prefix without navigating/reloading; the
      // basename change below re-points the router at the already-updated URL.
      // Use pushState (not replaceState) so the switch is a real history entry the
      // user can navigate back from — the popstate listener above re-syncs the
      // language from the URL on back/forward.
      const target = localizePublicPath({
        pathname: window.location.pathname,
        language: normalized,
        supportedLanguages,
      })
      window.history.pushState(null, '', `${target}${window.location.search}${window.location.hash}`)

      setLanguageState(normalized)
    },
    [supportedLanguages]
  )

  const routingValue = useMemo(() => ({ language, setLanguage }), [language, setLanguage])

  return (
    <LanguageRoutingContext.Provider value={routingValue}>
      <AppProviders language={language}>
        <RoutesProvider basename={`/${language}`} />
      </AppProviders>
    </LanguageRoutingContext.Provider>
  )
}

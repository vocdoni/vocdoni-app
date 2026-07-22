import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ComponentsProvider, ConfirmProvider } from '@vocdoni/react-components'
import { AuthProvider as SdkAuthProvider } from '@vocdoni/react-providers'
import { setDefaultOptions } from 'date-fns'
import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react'
import { I18nextProvider, useTranslation } from 'react-i18next'
import { usePageContext } from 'vike-react/usePageContext'
import { WagmiProvider } from 'wagmi'
import { SaasAccountProvider } from '~components/Account/SaasAccountProvider'
import { AnalyticsProvider } from '~components/AnalyticsProvider'
import { UnauthorizedApiError } from '~components/Auth/api'
import { AuthProvider } from '~components/Auth/AuthContext'
import { SubscriptionProvider } from '~components/Auth/Subscription'
import { CookieConsent } from '~components/Cookies/CookieConsent'
import { hasAcceptedCookieConsent } from '~components/Cookies/utils'
import { ConnectionToastProvider } from '~components/Layout/ConnectionToast'
import { ToastProvider } from '~components/Toast'
import { ApiClientProvider, AUTH_STORAGE_KEY } from '~src/providers/ApiClientProvider'
import { LanguageRoutingContext } from '~i18n/LanguageRoutingContext'
import {
  localizePublicPath,
  normalizePublicLanguageCandidate,
  persistPublicLanguagePreferenceClient,
} from '~i18n/public-language'
import { getDefaultTitleForLanguage } from '~src/pages/shared/defaultHeadMeta'
import { uiScaffoldComponents } from '~theme/react-components'
import { AppEnvProvider, normalizeLanguages, useAppEnv } from './app-env'
import { buildAppEnv } from './app-env-build'
import { configureApiBaseUrl } from './components/Auth/api'
import { wagmiConfig } from './constants/rainbow'
import { createPageI18nInstance, getBaseI18n } from './i18n'
import { datesLocale } from './i18n/locales'
import { RoutesProvider } from './router/Router'
import { RainbowKitTheme, Theme } from './theme/Theme'

export const createAppQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          if (error instanceof UnauthorizedApiError) return false
          return failureCount < 3
        },
        refetchOnWindowFocus: false,
      },
    },
  })

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
  const appEnv = pageContext?.globalContext?.appEnv ?? buildAppEnv({})
  const supportedLanguages = useMemo(() => Object.keys(normalizeLanguages(appEnv.LANGUAGES)), [appEnv.LANGUAGES])

  const [language, setLanguageState] = useState(initialLanguage)

  // In-place language switches (pushState, no Vike navigation) never re-run the
  // +title hook, so keep the document title in the active language ourselves.
  useEffect(() => {
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

export const AppProviders = ({
  children,
  queryClient,
  language,
}: PropsWithChildren<{ queryClient?: QueryClient; language?: string }>) => {
  // Runtime env comes from Vike's globalContext (resolved on the server, passed
  // to the client). Fall back to defaults if it isn't available (e.g. an
  // unexpected render outside the Vike runtime).
  const pageContext = usePageContext()
  const appEnv = pageContext?.globalContext?.appEnv ?? buildAppEnv({})

  // Inject the runtime SaaS URL into the imperative API client (it can't use hooks).
  configureApiBaseUrl(appEnv.SAAS_URL)

  const [client] = useState(() => queryClient ?? createAppQueryClient())

  // The i18n instance is created once (seeded with the initial language) and is
  // NOT recreated when the language changes — otherwise every language switch
  // would remount the whole provider tree and drop the query cache. Subsequent
  // changes go through i18n.changeLanguage in the effect below, which re-renders
  // translated components in place. `language` is intentionally omitted from the
  // deps for this reason.
  const i18nInstance = useMemo(() => {
    const supportedLanguages = Object.keys(normalizeLanguages(appEnv.LANGUAGES))
    const languageOptions = { supportedLanguages, fallbackLanguage: supportedLanguages[0] }

    if (!language) return getBaseI18n(languageOptions)

    return createPageI18nInstance(language, languageOptions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appEnv.LANGUAGES])

  useEffect(() => {
    if (language && i18nInstance.language !== language) {
      i18nInstance.changeLanguage(language)
    }
  }, [language, i18nInstance])

  return (
    <AppEnvProvider value={appEnv}>
      <I18nextProvider i18n={i18nInstance}>
        <Theme>
          <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={client}>
              <AppRuntimeProviders>{children}</AppRuntimeProviders>
            </QueryClientProvider>
          </WagmiProvider>
        </Theme>
      </I18nextProvider>
    </AppEnvProvider>
  )
}

const SaasProviders = ({ children }: PropsWithChildren<{}>) => (
  <SdkAuthProvider storageKey={AUTH_STORAGE_KEY}>
    <AuthProvider>
      <SubscriptionProvider>
        <SaasAccountProvider>{children}</SaasAccountProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </SdkAuthProvider>
)

const AppRuntimeProviders = ({ children }: PropsWithChildren) => {
  const { i18n } = useTranslation()
  const locale = datesLocale(i18n.language)

  useEffect(() => {
    setDefaultOptions({ locale })
  }, [locale])

  return (
    <RainbowKitTheme>
      <ComponentsProvider components={uiScaffoldComponents}>
        {/* App-owned components (ActionButtons, ConfirmActionModal) call useConfirm
            outside any react-components auto-mounted provider, so one is needed for
            the whole tree. It must sit inside ComponentsProvider because the confirm
            modal renders through the themed component slots. */}
        <ConfirmProvider>
          <ToastProvider>
            <ConnectionToastProvider>
              <ApiClientProvider>
                <SaasProviders>
                  <AnalyticsProvider>
                    <CookieConsent />
                    {children}
                  </AnalyticsProvider>
                </SaasProviders>
              </ApiClientProvider>
            </ConnectionToastProvider>
          </ToastProvider>
        </ConfirmProvider>
      </ComponentsProvider>
    </RainbowKitTheme>
  )
}

import { Signer } from '@ethersproject/abstract-signer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ComponentsProvider } from '@vocdoni/react-components'
import { setDefaultOptions } from 'date-fns'
import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react'
import { I18nextProvider, useTranslation } from 'react-i18next'
import { usePageContext } from 'vike-react/usePageContext'
import { useWalletClient, WagmiProvider } from 'wagmi'
import { SaasAccountProvider } from '~components/Account/SaasAccountProvider'
import { AnalyticsProvider } from '~components/AnalyticsProvider'
import { UnauthorizedApiError } from '~components/Auth/api'
import { AuthProvider } from '~components/Auth/AuthContext'
import { SubscriptionProvider } from '~components/Auth/Subscription'
import { CookieConsent } from '~components/Cookies/CookieConsent'
import { hasAcceptedCookieConsent } from '~components/Cookies/utils'
import { ConnectionToastProvider } from '~components/Layout/ConnectionToast'
import { walletClientToSigner } from '~constants/wagmi-adapters'
import { LanguageRoutingContext } from '~i18n/LanguageRoutingContext'
import {
  localizePublicPath,
  normalizePublicLanguageCandidate,
  persistPublicLanguagePreferenceClient,
} from '~i18n/public-language'
import { uiScaffoldComponents } from '~theme/react-components'
import { AppEnvProvider, normalizeLanguages, useAppEnv } from './app-env'
import { buildAppEnv } from './app-env-build'
import { configureApiBaseUrl } from './components/Auth/api'
import { wagmiConfig } from './constants/rainbow'
import { createPageI18nInstance, getBaseI18n } from './i18n'
import { datesLocale } from './i18n/locales'
import { getVocdoniClientConfig } from './providers/vocdoni-client-config'
import { ClientProvider } from './providers/VocdoniClientProvider'
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

      persistPublicLanguagePreferenceClient(normalized, {
        supportedLanguages,
        storage: window.localStorage,
        cookieEnabled: hasAcceptedCookieConsent(),
        document,
        location: window.location,
      })

      // Swap the visible URL language prefix without navigating/reloading; the
      // basename change below re-points the router at the already-updated URL.
      const target = localizePublicPath({
        pathname: window.location.pathname,
        language: normalized,
        supportedLanguages,
      })
      window.history.replaceState(window.history.state, '', `${target}${window.location.search}${window.location.hash}`)

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
  <AuthProvider>
    <SubscriptionProvider>
      <SaasAccountProvider>{children}</SaasAccountProvider>
    </SubscriptionProvider>
  </AuthProvider>
)

const AppRuntimeProviders = ({ children }: PropsWithChildren) => {
  const { data } = useWalletClient()
  const { i18n } = useTranslation()
  const { VOCDONI_ENVIRONMENT } = useAppEnv()
  const locale = datesLocale(i18n.language)
  const { clientEnv, options } = useMemo(() => getVocdoniClientConfig(VOCDONI_ENVIRONMENT), [VOCDONI_ENVIRONMENT])

  const signer = data ? walletClientToSigner(data) : null

  useEffect(() => {
    setDefaultOptions({ locale })
  }, [locale])

  return (
    <RainbowKitTheme>
      <ComponentsProvider components={uiScaffoldComponents}>
        <ClientProvider env={clientEnv} signer={signer as Signer} options={options}>
          <ConnectionToastProvider>
            <SaasProviders>
              <AnalyticsProvider>
                <CookieConsent />
                {children}
              </AnalyticsProvider>
            </SaasProviders>
          </ConnectionToastProvider>
        </ClientProvider>
      </ComponentsProvider>
    </RainbowKitTheme>
  )
}

import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { ComponentsProvider, ConfirmProvider } from '@vocdoni/react-components'
import { AuthProvider as SdkAuthProvider } from '@vocdoni/react-providers'
import { setDefaultOptions } from 'date-fns'
import { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { I18nextProvider, useTranslation } from 'react-i18next'
import { usePageContext } from 'vike-react/usePageContext'
import { WagmiProvider } from 'wagmi'
import { SaasAccountProvider } from '~components/Account/SaasAccountProvider'
import { AnalyticsProvider } from '~components/AnalyticsProvider'
import { AuthProvider } from '~components/Auth/AuthContext'
import { CookieConsent } from '~components/Cookies/CookieConsent'
import { ConnectionToastProvider } from '~components/Layout/ConnectionToast'
import { ToastProvider } from '~components/Toast'
import { setActiveI18n } from '~i18n/active-language'
import { ApiClientProvider, AUTH_STORAGE_KEY } from '~src/providers/ApiClientProvider'
import { uiScaffoldComponents } from '~theme/react-components'
import { normalizeLanguages, resolveAppEnv, AppEnvProvider } from './app-env'
import { configureApiBaseUrl } from './components/Auth/api'
import { wagmiConfig } from './constants/wagmi'
import { createPageI18nInstance, getBaseI18n } from './i18n'
import { datesLocale } from './i18n/locales'
import { createAppQueryClient } from './query-client'
import { Theme } from './theme/Theme'

// The providers every page shares. Kept free of the router so the public SSR pages
// (voting page, summary, organization) do not pull the dashboard routes into their bundle;
// Providers.tsx adds the SPA router on top.
export const AppProviders = ({
  children,
  queryClient,
  language,
}: PropsWithChildren<{ queryClient?: QueryClient; language?: string }>) => {
  // Runtime env comes from Vike's globalContext (resolved on the server, passed
  // to the client). resolveAppEnv falls back to defaults if it isn't available
  // (e.g. an unexpected render outside the Vike runtime) and warns, so broken
  // passToClient wiring cannot revert every env var in silence.
  const pageContext = usePageContext()
  const appEnv = resolveAppEnv(pageContext?.globalContext?.appEnv)

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

  // Point the imperative api() layer at this tree's instance. During render, not in
  // an effect, so the first request a child fires already carries the language.
  setActiveI18n(i18nInstance)

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
      <SaasAccountProvider>{children}</SaasAccountProvider>
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
  )
}

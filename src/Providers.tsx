import { Signer } from '@ethersproject/abstract-signer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ComponentsProvider } from '@vocdoni/react-components'
import { setDefaultOptions } from 'date-fns'
import { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { I18nextProvider, useTranslation } from 'react-i18next'
import { usePageContext } from 'vike-react/usePageContext'
import { useWalletClient, WagmiProvider } from 'wagmi'
import { SaasAccountProvider } from '~components/Account/SaasAccountProvider'
import { AnalyticsProvider } from '~components/AnalyticsProvider'
import { UnauthorizedApiError } from '~components/Auth/api'
import { AuthProvider } from '~components/Auth/AuthContext'
import { SubscriptionProvider } from '~components/Auth/Subscription'
import { CookieConsent } from '~components/Cookies/CookieConsent'
import { ConnectionToastProvider } from '~components/Layout/ConnectionToast'
import { walletClientToSigner } from '~constants/wagmi-adapters'
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

export const Providers = ({ basename, language }: { basename?: string; language?: string } = {}) => (
  <AppProviders language={language}>
    <RoutesProvider basename={basename} />
  </AppProviders>
)

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

  const i18nInstance = useMemo(() => {
    const supportedLanguages = Object.keys(normalizeLanguages(appEnv.LANGUAGES))
    const languageOptions = { supportedLanguages, fallbackLanguage: supportedLanguages[0] }

    if (!language) return getBaseI18n(languageOptions)

    return createPageI18nInstance(language, languageOptions)
  }, [language, appEnv.LANGUAGES])

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

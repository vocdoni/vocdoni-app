import './i18n'
import { Signer } from '@ethersproject/abstract-signer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ComponentsProvider } from '@vocdoni/react-components'
import { setDefaultOptions } from 'date-fns'
import { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
import { wagmiConfig } from './constants/rainbow'
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

export const Providers = () => (
  <AppProviders>
    <RoutesProvider />
  </AppProviders>
)

export const AppProviders = ({ children, queryClient }: PropsWithChildren<{ queryClient?: QueryClient }>) => {
  const [client] = useState(() => queryClient ?? createAppQueryClient())

  return (
    <Theme>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={client}>
          <AppRuntimeProviders>{children}</AppRuntimeProviders>
        </QueryClientProvider>
      </WagmiProvider>
    </Theme>
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
  const locale = datesLocale(i18n.language)
  const { clientEnv, options } = useMemo(() => getVocdoniClientConfig(), [])

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

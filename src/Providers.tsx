import { Signer } from '@ethersproject/abstract-signer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClientEnv, ComponentsProvider } from '@vocdoni/react-components'
import { setDefaultOptions } from 'date-fns'
import { PropsWithChildren, useEffect, useMemo } from 'react'
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
import { VocdoniEnvironment } from './constants'
import { wagmiConfig } from './constants/rainbow'
import { datesLocale } from './i18n/locales'
import { ClientProvider } from './providers/VocdoniClientProvider'
import { RoutesProvider } from './router/Router'
import { RainbowKitTheme, Theme } from './theme/Theme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Never retry on 401 unauthorized errors - let each view handle them
        if (error instanceof UnauthorizedApiError) return false
        // Default retry logic for other errors (max 3 attempts)
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
    },
  },
})

export const Providers = () => {
  return (
    <Theme>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <AppProviders />
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

const AppProviders = () => {
  const { data } = useWalletClient()
  const { i18n } = useTranslation()
  const locale = datesLocale(i18n.language)
  const clientEnv: ClientEnv = VocdoniEnvironment === 'prod' ? 'prod' : 'dev'
  const options = useMemo(() => {
    const next: { options?: { api_url: string } } = {}
    if (clientEnv === 'dev') {
      next.options = { api_url: 'https://one-dev.vocdoni.net/v2' }
    }
    return next
  }, [clientEnv])

  const signer = data ? walletClientToSigner(data) : null

  useEffect(() => {
    setDefaultOptions({ locale })
  }, [locale])

  return (
    <RainbowKitTheme>
      <ComponentsProvider components={uiScaffoldComponents}>
        <ClientProvider env={clientEnv} signer={signer as Signer} {...options}>
          <ConnectionToastProvider>
            <SaasProviders>
              <AnalyticsProvider>
                <CookieConsent />
                <RoutesProvider />
              </AnalyticsProvider>
            </SaasProviders>
          </ConnectionToastProvider>
        </ClientProvider>
      </ComponentsProvider>
    </RainbowKitTheme>
  )
}

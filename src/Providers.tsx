import { Signer } from '@ethersproject/abstract-signer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ComponentsProvider } from '@vocdoni/react-components'
import { EnvOptions } from '@vocdoni/sdk'
import { setDefaultOptions } from 'date-fns'
import { PropsWithChildren, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAccount, useWalletClient, WagmiProvider } from 'wagmi'
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
  const { address } = useAccount()
  const { i18n } = useTranslation()
  const locale = datesLocale(i18n.language)

  let signer = null
  if (data && address && data.account.address === address) {
    signer = walletClientToSigner(data)
  }

  useEffect(() => {
    setDefaultOptions({ locale })
  }, [locale])

  const options: { options?: { api_url: string } } = {}
  if (VocdoniEnvironment === 'dev') {
    options.options = { api_url: 'https://one-dev.vocdoni.net/v2' }
  }

  return (
    <RainbowKitTheme>
      <ClientProvider env={VocdoniEnvironment as EnvOptions} signer={signer as Signer} {...options}>
        <ComponentsProvider components={uiScaffoldComponents}>
          <ConnectionToastProvider>
            <SaasProviders>
              <AnalyticsProvider>
                <CookieConsent />
                <RoutesProvider />
              </AnalyticsProvider>
            </SaasProviders>
          </ConnectionToastProvider>
        </ComponentsProvider>
      </ClientProvider>
    </RainbowKitTheme>
  )
}

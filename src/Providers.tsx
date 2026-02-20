import { Signer } from '@ethersproject/abstract-signer'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EnvOptions } from '@vocdoni/sdk'
import { PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'
import { useAccount, useWalletClient, WagmiProvider } from 'wagmi'
import { SaasAccountProvider } from '~components/Account/SaasAccountProvider'
import { AnalyticsProvider } from '~components/AnalyticsProvider'
import { UnauthorizedApiError } from '~components/Auth/api'
import { AuthProvider } from '~components/Auth/AuthContext'
import { SubscriptionProvider } from '~components/Auth/Subscription'
import { CookieConsent } from '~components/Cookies/CookieConsent'
import { ConnectionToastProvider } from '~components/Layout/ConnectionToast'
import { ClientProvider } from '~components/vocdoni-ui'
import { walletClientToSigner } from '~constants/wagmi-adapters'
import { VocdoniEnvironment } from './constants'
import { wagmiConfig } from './constants/rainbow'
import { datesLocale } from './i18n/locales'
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

  let signer = null
  if (data && address && data.account.address === address) {
    signer = walletClientToSigner(data)
  }

  return (
    <RainbowKitTheme>
      <ClientProvider
        env={VocdoniEnvironment as EnvOptions}
        signer={signer as Signer}
        datesLocale={datesLocale(i18n.language)}
      >
        <ConnectionToastProvider>
          <SaasProviders>
            <AnalyticsProvider>
              <CookieConsent />
              <RoutesProvider />
            </AnalyticsProvider>
          </SaasProviders>
        </ConnectionToastProvider>
      </ClientProvider>
    </RainbowKitTheme>
  )
}

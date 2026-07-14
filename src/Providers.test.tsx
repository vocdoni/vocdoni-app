import { render } from '@testing-library/react'
import type { ReactNode } from 'react'

vi.mock('wagmi', () => ({
  WagmiProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useAccount: () => ({ address: undefined }),
  useWalletClient: () => ({ data: null }),
  useDisconnect: () => ({ disconnect: vi.fn() }),
}))

vi.mock('@rainbow-me/rainbowkit', () => ({
  RainbowKitProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  lightTheme: () => ({}),
  darkTheme: () => ({}),
}))

vi.mock('./constants/rainbow', () => ({
  wagmiConfig: {},
}))

vi.mock('~components/Layout/ConnectionToast', () => ({
  ConnectionToastProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock('~components/Auth/AuthContext', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
  }),
}))

vi.mock('~components/Auth/Subscription', () => ({
  SubscriptionProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock('~components/Account/SaasAccountProvider', () => ({
  SaasAccountProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock('~components/AnalyticsProvider', () => ({
  AnalyticsProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock('~components/Cookies/CookieConsent', () => ({
  CookieConsent: () => null,
}))

describe('Providers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mounts without crashing', async () => {
    const { Providers } = await import('./Providers')
    const { container } = render(<Providers />)
    expect(container).toBeTruthy()
  }, 10000)

  it('does not overwrite the persisted preferred language when rendering a public page in english', async () => {
    window.localStorage.setItem('i18nextLng', 'ca')

    const { AppProviders } = await import('./Providers')

    render(
      <AppProviders language='en'>
        <div>public-page</div>
      </AppProviders>
    )

    expect(window.localStorage.getItem('i18nextLng')).toBe('ca')
  })
})

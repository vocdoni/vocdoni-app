import { render } from '@testing-library/react'
import type { ReactNode } from 'react'

vi.mock('wagmi', () => ({
  WagmiProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useAccount: () => ({ address: undefined }),
  useWalletClient: () => ({ data: null }),
  useDisconnect: () => ({ disconnect: vi.fn() }),
}))

vi.mock('./constants/wagmi', () => ({
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

  // Mounting this pulls in the whole provider graph (wagmi, chakra,
  // every locale bundle), which on a loaded machine takes well over the default
  // timeout. Timing out here used to cascade into the test below: the abandoned
  // render kept settling and its language detection landed mid-assertion.
  it('mounts without crashing', async () => {
    const { Providers } = await import('./Providers')
    const { container } = render(<Providers />)
    expect(container).toBeTruthy()
  }, 30000)

  it('does not overwrite the persisted preferred language when rendering a public page in english', async () => {
    // Import before seeding the preference: `~i18n` builds its detector-backed
    // singleton at import time, and that detection caches a language. Seeding
    // afterwards keeps this test independent of whether an earlier test already
    // paid for the import.
    const { AppProviders } = await import('./Providers')

    window.localStorage.setItem('i18nextLng', 'ca')

    render(
      <AppProviders language='en'>
        <div>public-page</div>
      </AppProviders>
    )

    expect(window.localStorage.getItem('i18nextLng')).toBe('ca')
  })
})

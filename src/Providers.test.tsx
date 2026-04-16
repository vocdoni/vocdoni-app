import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { walletClientToSigner } from '~constants/wagmi-adapters'

const wagmiState = {
  address: undefined as string | undefined,
  walletClient: null as any,
}

const clientProviderProps: Array<Record<string, unknown>> = []

vi.mock('wagmi', () => ({
  WagmiProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useAccount: () => ({ address: wagmiState.address }),
  useWalletClient: () => ({ data: wagmiState.walletClient }),
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

vi.mock('~constants/wagmi-adapters', () => ({
  walletClientToSigner: vi.fn(() => ({ id: 'mock-signer' })),
}))

vi.mock('./providers/VocdoniClientProvider', () => ({
  ClientProvider: ({ children, ...props }: { children: ReactNode }) => {
    clientProviderProps.push(props as Record<string, unknown>)
    return <>{children}</>
  },
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
    wagmiState.address = undefined
    wagmiState.walletClient = null
    clientProviderProps.length = 0
    vi.clearAllMocks()
  })

  it('mounts without crashing', async () => {
    const { Providers } = await import('./Providers')
    const { container } = render(<Providers />)
    expect(container).toBeTruthy()
  }, 10000)

  it('passes a signer on first wallet connection even with address casing differences', async () => {
    wagmiState.address = '0xabc0000000000000000000000000000000000000'
    wagmiState.walletClient = {
      account: { address: '0xAbC0000000000000000000000000000000000000' },
      chain: { id: 1, name: 'mainnet', contracts: {} },
      transport: {},
    }

    const { Providers } = await import('./Providers')
    render(<Providers />)

    expect(walletClientToSigner).toHaveBeenCalledWith(wagmiState.walletClient)
    expect(clientProviderProps.at(-1)?.signer).toEqual({ id: 'mock-signer' })
  })

  it('updates client signer after wallet connects post-mount', async () => {
    const { Providers } = await import('./Providers')
    const rendered = render(<Providers />)

    expect(clientProviderProps.at(-1)?.signer).toBeNull()

    wagmiState.address = '0xabc0000000000000000000000000000000000000'
    wagmiState.walletClient = {
      account: { address: '0xAbC0000000000000000000000000000000000000' },
      chain: { id: 1, name: 'mainnet', contracts: {} },
      transport: {},
    }

    rendered.rerender(<Providers />)

    expect(walletClientToSigner).toHaveBeenCalledWith(wagmiState.walletClient)
    expect(clientProviderProps.at(-1)?.signer).toEqual({ id: 'mock-signer' })
  })

  it('passes signer when wallet client is ready before account hook syncs', async () => {
    wagmiState.address = undefined
    wagmiState.walletClient = {
      account: { address: '0xAbC0000000000000000000000000000000000000' },
      chain: { id: 1, name: 'mainnet', contracts: {} },
      transport: {},
    }

    const { Providers } = await import('./Providers')
    render(<Providers />)

    expect(walletClientToSigner).toHaveBeenCalledWith(wagmiState.walletClient)
    expect(clientProviderProps.at(-1)?.signer).toEqual({ id: 'mock-signer' })
  })

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

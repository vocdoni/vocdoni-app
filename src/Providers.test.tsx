import { render } from '~src/test-utils'
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

describe('Providers', () => {
  it('mounts without crashing', async () => {
    const { Providers } = await import('./Providers')
    const { container } = render(<Providers />)
    expect(container).toBeTruthy()
  }, 10000)
})

import { createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'

// Wagmi survives here only as plumbing for the SaaS OAuth login connector
// (@vocdoni/rainbowkit-wallets): it never talks to a chain, so a single
// placeholder chain with no static connectors is enough. The web3 wallet
// connectors (MetaMask, WalletConnect, ...) were removed along with the
// wallet-based voting entry point — restore them from git history if
// wallet voting ever comes back.
export const wagmiConfig = createConfig({
  chains: [mainnet],
  connectors: [],
  transports: {
    [mainnet.id]: http(),
  },
})

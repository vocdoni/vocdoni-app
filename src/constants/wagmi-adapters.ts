import { ExternalProvider, Web3Provider } from '@ethersproject/providers'
import { type GetWalletClientReturnType } from '@wagmi/core'

export function walletClientToSigner(walletClient: GetWalletClientReturnType) {
  if (!walletClient) throw new Error('Wallet client not found')
  const { account, chain, transport } = walletClient
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }
  const provider = new Web3Provider(transport as ExternalProvider, network)
  const signer = provider.getSigner(account.address)
  return signer
}

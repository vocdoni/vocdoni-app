import { useMutation } from '@tanstack/react-query'
import { useAuth } from '~components/Auth/useAuth'
import { ensure0x } from '~utils/address'

// Mirrors the backend limits (saas-backend wallet top-up), in EUR cents, VAT excluded.
export const WALLET_TOPUP_MIN_CENTS = 100
export const WALLET_TOPUP_MAX_CENTS = 10_000_000

export type WalletTopUpResponse = { clientSecret: string; sessionId: string; amountCents: number; currency: string }

export const useWalletTopUp = () => {
  const { bearedFetch, currentAddress } = useAuth()

  return useMutation<WalletTopUpResponse, Error, { amountCents: number; locale?: string }>({
    mutationFn: (body) =>
      bearedFetch<WalletTopUpResponse>(`organizations/${ensure0x(currentAddress)}/wallet/topup`, {
        method: 'POST',
        body,
      }),
  })
}

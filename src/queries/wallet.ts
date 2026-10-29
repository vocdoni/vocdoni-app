import { useMutation, useQuery } from '@tanstack/react-query'
import { ensure0x } from '~utils/address'
import { ApiEndpoints, ApiError, ErrorCode } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { QueryKeys } from './keys'

export type WalletEntryKind = 'topup' | 'payment' | 'creditBack' | 'refund'

// One ledger line of the organization wallet. `amountCents` is signed: top-ups and refunds are
// positive, payments negative.
export type WalletEntry = {
  id: string
  orgAddress: string
  amountCents: number
  kind: WalletEntryKind
  processId?: string
  processOrgAddress?: string
  createdAt: string
}

export type Wallet = {
  balanceCents: number
  currency: string
  history: WalletEntry[]
  pagination: {
    currentPage: number
    lastPage: number
    nextPage: number | null
    previousPage: number | null
    totalItems: number
  }
}

export type WalletTopUpResponse = {
  clientSecret: string
  sessionId: string
  amountCents: number
  currency: string
}

// Mirrors the backend bounds for a top-up; requests outside them get a 400.
export const WALLET_TOPUP_MIN_CENTS = 100
export const WALLET_TOPUP_MAX_CENTS = 10_000_000

// Same guard as integrators.ts: a missing address rejects with a readable message instead of
// letting `ensure0x` throw an opaque TypeError inside the request.
const noAddressSelected = () => Promise.reject(new Error('No organization address selected'))

const isWalletClientError = (error: unknown) =>
  error instanceof ApiError && error.response?.status >= 400 && error.response?.status < 500

/** True when the backend refuses the wallet because the organization is managed by an integrator. */
export const isManagedOrgWalletError = (error: unknown): boolean =>
  error instanceof ApiError && error.apiError?.code === ErrorCode.ManagedOrgHasNoWallet

type UseWalletOptions = {
  page?: number
  limit?: number
  refetchInterval?: number
}

/** Paginated wallet balance and ledger of the selected organization (GET /organizations/{address}/wallet). */
export const useWallet = ({ page = 1, limit = 10, refetchInterval }: UseWalletOptions = {}) => {
  const { bearedFetch, currentAddress } = useAuth()
  const address = currentAddress

  return useQuery<Wallet>({
    queryKey: QueryKeys.organization.wallet(address, page, limit),
    enabled: !!address,
    refetchInterval,
    // A 4xx (a managed org's 403, a backend without wallets' 404) answers the same every time.
    retry: (failureCount, error) => !isWalletClientError(error) && failureCount < 3,
    queryFn: () => {
      if (!address) return noAddressSelected()
      return bearedFetch<Wallet>(
        `${ApiEndpoints.OrganizationWallet.replace('{address}', ensure0x(address))}?page=${page}&limit=${limit}`
      )
    },
  })
}

/**
 * Starts a prepaid top-up (POST /organizations/{address}/wallet/topup, admin only). The response
 * carries the payment client secret; the balance only changes once the payment completes.
 */
export const useWalletTopUp = () => {
  const { bearedFetch, currentAddress } = useAuth()
  const address = currentAddress

  return useMutation<WalletTopUpResponse, Error, { amountCents: number; locale?: string }>({
    mutationFn: (body) => {
      if (!address) return noAddressSelected()
      return bearedFetch<WalletTopUpResponse>(
        ApiEndpoints.OrganizationWalletTopUp.replace('{address}', ensure0x(address)),
        { method: 'POST', body }
      )
    },
  })
}

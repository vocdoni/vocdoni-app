import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { ApiErrorCode, isApiError, VocdoniApiError } from '@vocdoni/api-client'
import type { ProcessCheckoutResponse, WalletResponse, WalletTopUpRequest } from '@vocdoni/api-types'
import { ensure0x, sameAddress } from '~utils/address'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { useAuth } from '~components/Auth/useAuth'
import { useProfile } from './account'
import { QueryKeys } from './keys'

// Mirrors the backend bounds for a top-up; requests outside them get a 400.
export const WALLET_TOPUP_MIN_CENTS = 100
export const WALLET_TOPUP_MAX_CENTS = 10_000_000

// Same guard as integrators.ts: a missing address rejects with a readable message instead of
// letting `ensure0x` throw an opaque TypeError inside the request.
const noAddressSelected = () => Promise.reject(new Error('No organization address selected'))

const isWalletClientError = (error: unknown) =>
  error instanceof VocdoniApiError && error.status >= 400 && error.status < 500

/** True when the backend refuses the wallet because the organization is managed by an integrator. */
export const isManagedOrgWalletError = (error: unknown): boolean =>
  isApiError(error, ApiErrorCode.ManagedOrgHasNoWallet)

type UseWalletOptions = {
  page?: number
  limit?: number
  refetchInterval?: number
  enabled?: boolean
}

/** Paginated wallet balance and ledger of the selected organization (GET /organizations/{address}/wallet). */
export const useWallet = ({ page = 1, limit = 10, refetchInterval, enabled = true }: UseWalletOptions = {}) => {
  const { client } = useApiClient()
  const { currentAddress } = useAuth()
  const address = currentAddress

  return useQuery<WalletResponse>({
    queryKey: QueryKeys.organization.wallet(address, page, limit),
    enabled: !!address && enabled,
    refetchInterval,
    // Keeps the last page on screen while another one loads, instead of flashing the spinner
    placeholderData: keepPreviousData,
    // A 4xx (a managed org's 403, a backend without wallets' 404) answers the same every time.
    retry: (failureCount, error) => !isWalletClientError(error) && failureCount < 3,
    queryFn: () => {
      if (!address) return noAddressSelected()
      return client.organizations.getWallet(ensure0x(address), { page, limit })
    },
  })
}

/**
 * What the current user may do with the wallet of the selected organization: admins and managers read it,
 * only admins top it up (the backend enforces the same). Both are false until the profile has loaded.
 */
export const useWalletAccess = () => {
  const { currentAddress } = useAuth()
  const { data: profile } = useProfile()
  const membership = profile?.organizations.find((org) => sameAddress(org.organization.address, currentAddress))
  const role = membership?.role.toLowerCase()

  return { canView: role === 'admin' || role === 'manager', canTopUp: role === 'admin' }
}

/**
 * Starts a prepaid top-up (POST /organizations/{address}/wallet/topup, admin only). The response
 * carries the payment client secret; the balance only changes once the payment completes.
 */
export const useWalletTopUp = () => {
  const { client } = useApiClient()
  const { currentAddress } = useAuth()
  const address = currentAddress

  return useMutation<ProcessCheckoutResponse, Error, WalletTopUpRequest>({
    mutationFn: (body) => {
      if (!address) return noAddressSelected()
      return client.organizations.topUpWallet(ensure0x(address), body)
    },
  })
}

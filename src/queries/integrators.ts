import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { IntegratorInfo, ManagedOrganizationInfo, UpdateManagedOrganizationRequest } from '@vocdoni/api-types'
import { ensure0x } from '~utils/address'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { LocalStorageKeys } from '~components/Auth/useAuthProvider'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { QueryKeys } from './keys'

type ProvisionedOrganization = { address: string }

/**
 * Reads the signed-in integrator's quota and usage (GET /integrator, path-less — the org is
 * resolved from the session). Powers the Overview quota cards.
 */
export const useIntegratorInfo = () => {
  const { bearedFetch } = useAuth()
  const selectedAddress = localStorage.getItem(LocalStorageKeys.SignerAddress) ?? undefined

  return useQuery<IntegratorInfo>({
    queryKey: QueryKeys.integrator.info(selectedAddress),
    queryFn: () => bearedFetch<IntegratorInfo>(ApiEndpoints.Integrator),
  })
}

// A single organization managed by the integrator, with its spend cap and spend (SDK type).
export type ManagedOrganization = ManagedOrganizationInfo

// As the list returns it: an older backend omits the spend fields the SDK type requires.
export type ManagedOrganizationRow = Omit<ManagedOrganization, 'spendCapCents' | 'spentCents'> &
  Partial<Pick<ManagedOrganization, 'spendCapCents' | 'spentCents'>>

export type ManagedOrganizationsResponse = {
  pagination: {
    totalItems: number
    currentPage: number
    lastPage: number
    previousPage: number | null
    nextPage: number | null
  }
  organizations: ManagedOrganizationRow[]
}

/**
 * Paginated list of organizations managed by the signed-in integrator
 * (GET /integrator/organizations, path-less). Read-only.
 */
export const useManagedOrganizations = (page: number, limit: number) => {
  const { bearedFetch } = useAuth()
  const selectedAddress = localStorage.getItem(LocalStorageKeys.SignerAddress) ?? undefined

  return useQuery<ManagedOrganizationsResponse>({
    queryKey: QueryKeys.integrator.managed(selectedAddress, page, limit),
    // Keeps the previous page on screen while the next one loads, so pagination can be disabled meanwhile
    placeholderData: keepPreviousData,
    queryFn: () =>
      bearedFetch<ManagedOrganizationsResponse>(`${ApiEndpoints.ManagedOrganizations}?page=${page}&limit=${limit}`),
  })
}

// Assignable API key scopes (mirrors the backend). Human labels/descriptions are resolved in the
// create form so the query layer stays translation-free.
export const API_KEY_SCOPES = ['quota:read', 'managed:read', 'managed:write', 'voting:write', 'members:write'] as const

export type ApiKey = {
  id: string
  label: string
  prefix: string
  scopes: string[]
  createdBy: string
  createdAt: string
  lastUsedAt?: string
  expiresAt?: string
  revoked: boolean
}

export type CreateApiKeyBody = {
  label: string
  scopes: string[]
  expiresAt?: string
}

export type CreatedApiKey = ApiKey & { secret: string }

/**
 * `currentAddress` is undefined until the session resolves the address list, so every
 * api-key call has to handle its absence. Rejecting with a real message beats casting
 * it to `string` and letting `ensure0x` throw an opaque TypeError from inside the
 * mutation, where it surfaces to the user as a failed action rather than an
 * unavailable one.
 */
const noAddressSelected = () => Promise.reject(new Error('No organization address selected'))

/** API keys owned by the selected organization (GET /integrator/organizations/{orgAddress}/apikeys, admin only). */
export const useApiKeys = () => {
  const { bearedFetch, currentAddress } = useAuth()
  const address = currentAddress

  return useQuery<ApiKey[]>({
    queryKey: QueryKeys.organization.apikeys(address),
    enabled: !!address,
    queryFn: () => {
      if (!address) return noAddressSelected()
      return bearedFetch<{ apiKeys: ApiKey[] }>(
        ApiEndpoints.OrganizationApiKeys.replace('{orgAddress}', ensure0x(address))
      ).then((d) => d.apiKeys ?? [])
    },
  })
}

/** Create an API key. The returned secret is shown only once. */
export const useCreateApiKey = () => {
  const { bearedFetch, currentAddress } = useAuth()
  const address = currentAddress
  const queryClient = useQueryClient()

  return useMutation<CreatedApiKey, Error, CreateApiKeyBody>({
    mutationFn: (body) => {
      if (!address) return noAddressSelected()
      return bearedFetch<CreatedApiKey>(ApiEndpoints.OrganizationApiKeys.replace('{orgAddress}', ensure0x(address)), {
        method: 'POST',
        body,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.organization.apikeys(address) })
    },
  })
}

/** Revoke (permanently disable) an API key. */
export const useRevokeApiKey = () => {
  const { bearedFetch, currentAddress } = useAuth()
  const address = currentAddress
  const queryClient = useQueryClient()

  return useMutation<void, Error, { id: string }>({
    mutationFn: ({ id }) => {
      if (!address) return noAddressSelected()
      return bearedFetch<void>(
        ApiEndpoints.OrganizationApiKey.replace('{orgAddress}', ensure0x(address)).replace('{keyId}', id),
        { method: 'DELETE' }
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.organization.apikeys(address) })
    },
  })
}

/**
 * Self-serve integrator org provisioning. A signed-in integrator always has exactly one
 * organization, so when none exists yet (e.g. right after sign-up) we create one in the
 * background with no form:
 * - `provisionAccount: true` makes the backend forge the on-chain account at creation time,
 *   so the client never needs an SDK signer/wallet step.
 * - `integrator: true` subscribes the org to the free integrator plan, so `users/me` then
 *   reports `isIntegrator: true`.
 * - `name` gives the forged org a sensible default (integrators have no create form), so it
 *   shows up as "Integrator" rather than a raw address in the org switcher.
 * `type: 'others'` and the remaining fields are backend defaults. On success the profile is
 * refreshed so the new org shows up.
 */
export const useProvisionIntegratorOrganization = () => {
  const { bearedFetch } = useAuth()
  const queryClient = useQueryClient()

  return useMutation<ProvisionedOrganization, Error>({
    mutationFn: () =>
      bearedFetch<ProvisionedOrganization>(ApiEndpoints.Organizations, {
        method: 'POST',
        body: { type: 'others', provisionAccount: true, integrator: true, name: 'Integrator' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.profile })
    },
  })
}

/**
 * Sets (or lifts, with `null`) the spend cap of a managed organization
 * (PUT /integrator/organizations/{orgAddress}, integrator Admin only). Resolves with the updated organization.
 */
export const useUpdateManagedOrganization = () => {
  const { client } = useApiClient()
  const queryClient = useQueryClient()

  return useMutation<ManagedOrganization, Error, { address: string } & UpdateManagedOrganizationRequest>({
    mutationFn: ({ address, spendCapCents }) =>
      client.organizations.updateManaged(ensure0x(address), { spendCapCents }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.integrator.managed() })
    },
  })
}

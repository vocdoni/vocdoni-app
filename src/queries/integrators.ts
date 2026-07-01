import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiEndpoints } from '~components/Auth/api'
import { LocalStorageKeys } from '~components/Auth/useAuthProvider'
import { useAuth } from '~components/Auth/useAuth'
import { QueryKeys } from './keys'

type ProvisionedOrganization = { address: string }

// Effective caps for the integrator dashboard. Mirrors the backend `IntegratorLimits`. Note the
// zero semantics are not uniform: `maxVotes === 0` means unlimited, while the other caps at 0 mean
// no allowance (or "unknown" when an override integrator has no subscription plan to source them).
export type IntegratorLimits = {
  maxManagedOrgs: number
  maxManagedProcesses: number
  maxVotes: number
  maxSMS: number
  maxEmails: number
}

// Current usage counters (shared pools summed across the integrator's managed orgs).
export type IntegratorUsage = {
  managedOrgs: number
  managedProcesses: number
  sentVotes: number
  sentSMS: number
  sentEmails: number
}

// Response of GET /integrator. `limits` is only present when `enabled` is true.
export type IntegratorInfo = {
  enabled: boolean
  limits?: IntegratorLimits
  usage: IntegratorUsage
}

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

// Per-managed-org usage counters (backend SubscriptionUsage). Fields default to 0.
export type OrganizationCounters = {
  sentSMS: number
  sentEmails: number
  subOrgs: number
  users: number
  processes: number
}

// A single organization managed by the integrator. `meta.name` is the display name set at
// creation; the rest mirror the backend OrganizationInfo fields we surface.
export type ManagedOrganization = {
  address: string
  website: string
  createdAt: string
  type: string
  active: boolean
  meta?: { name?: string }
  counters?: OrganizationCounters
}

export type ManagedOrganizationsResponse = {
  pagination: {
    totalItems: number
    currentPage: number
    lastPage: number
    previousPage: number | null
    nextPage: number | null
  }
  organizations: ManagedOrganization[]
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
    queryFn: () =>
      bearedFetch<ManagedOrganizationsResponse>(`${ApiEndpoints.ManagedOrganizations}?page=${page}&limit=${limit}`),
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
 * `type: 'others'` and all other fields are defaults the user can edit later. On success the
 * profile is refreshed so the new org shows up.
 */
export const useProvisionIntegratorOrganization = () => {
  const { bearedFetch } = useAuth()
  const queryClient = useQueryClient()

  return useMutation<ProvisionedOrganization, Error>({
    mutationFn: () =>
      bearedFetch<ProvisionedOrganization>(ApiEndpoints.Organizations, {
        method: 'POST',
        body: { type: 'others', provisionAccount: true, integrator: true },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.profile })
    },
  })
}

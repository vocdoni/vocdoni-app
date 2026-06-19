import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { enforceHexPrefix, useOrganization } from '@vocdoni/react-components'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { useProfile } from '~queries/account'
import { useUrlPagination } from '~queries/members'
import { QueryKeys } from './keys'

// Mirrors the backend OrganizationInfo fields we display (saas-backend#525).
export type ManagedOrganization = {
  address: string
  website: string
  createdAt: string
  type: string
  size: string
  color: string
  subdomain: string
  country: string
  timezone: string
  active: boolean
  communications: boolean
}

export type IntegratorLimits = {
  maxManagedOrgs: number
  maxManagedProcesses: number
  maxManagedCensusSize: number
}

export type IntegratorUsage = {
  managedOrgs: number
  managedProcesses: number
  managedCensusSize: number
}

// GET /organizations/{address}/integrator. `limits` is present only when enabled.
export type IntegratorInfo = {
  enabled: boolean
  limits?: IntegratorLimits
  usage: IntegratorUsage
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

// Body of POST /organizations/{address}/managed. Only `type` is required.
export type CreateManagedOrganizationBody = {
  type: string
  website?: string
  size?: string
  color?: string
  subdomain?: string
  country?: string
  timezone?: string
  communications?: boolean
  ownerEmail?: string
}

/**
 * Fetches the integrator quota/usage for the current organization. A non-integrator org returns
 * `{ enabled: false }`; a 403/404 (e.g. the caller lacks the role) is also treated as "not an
 * integrator" so detection never throws the dashboard into an error state.
 */
export const useIntegratorInfo = () => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const address = organization?.address

  return useQuery<IntegratorInfo>({
    queryKey: QueryKeys.integrator.info(address),
    enabled: !!address,
    staleTime: 5 * 60 * 1000,
    retry: false,
    queryFn: () =>
      bearedFetch<IntegratorInfo>(ApiEndpoints.Integrator.replace('{address}', enforceHexPrefix(address))).catch(
        () => ({ enabled: false, usage: { managedOrgs: 0, managedProcesses: 0, managedCensusSize: 0 } })
      ),
  })
}

/**
 * Paginated list of organizations managed by the current integrator. Mirrors the drafts pagination
 * pattern: page comes from the route, limit from the `limit` query param (see `useUrlPagination`).
 */
export const usePaginatedManagedOrganizations = () => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const { page, limit } = useUrlPagination()
  const address = organization?.address

  const baseUrl = ApiEndpoints.ManagedOrganizations.replace('{address}', enforceHexPrefix(address))
  const fetchUrl = `${baseUrl}?page=${page}&limit=${limit}`

  return useQuery<ManagedOrganizationsResponse>({
    queryKey: [...QueryKeys.integrator.managed(address), page, limit],
    enabled: !!address,
    queryFn: () => bearedFetch<ManagedOrganizationsResponse>(fetchUrl),
  })
}

/**
 * Creates a new managed organization under the current integrator. Refreshes both the managed-org
 * list and the integrator quota on success.
 */
export const useCreateManagedOrganization = () => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const queryClient = useQueryClient()
  const address = organization?.address

  return useMutation<ManagedOrganization, Error, CreateManagedOrganizationBody>({
    mutationFn: (body: CreateManagedOrganizationBody) =>
      bearedFetch<ManagedOrganization>(
        ApiEndpoints.ManagedOrganizations.replace('{address}', enforceHexPrefix(address)),
        {
          method: 'POST',
          body,
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.integrator.managed(address) })
      queryClient.invalidateQueries({ queryKey: QueryKeys.integrator.info(address) })
    },
  })
}

const normalizeAddress = (address?: string) => (address ? address.toLowerCase().replace(/^0x/, '') : '')

/**
 * Returns the logged-in user's role string ('admin' | 'manager' | 'viewer') for the current
 * organization, or undefined if not a member.
 */
export const useCurrentOrgRole = (): string | undefined => {
  const { data: profile } = useProfile()
  const { organization } = useOrganization()
  const address = normalizeAddress(organization?.address)
  if (!profile || !address) return undefined
  return profile.organizations.find((o) => normalizeAddress(o.organization?.address) === address)?.role
}

// Creating a managed org is admin-only (the backend enforces this; the UI mirrors it).
export const useIsIntegratorAdmin = (): boolean => useCurrentOrgRole() === 'admin'

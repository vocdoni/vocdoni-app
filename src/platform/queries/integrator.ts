import { useQuery } from '@tanstack/react-query'
import { ApiEndpoints } from '~platform/api/endpoints'
import { useAuth } from '~platform/auth/AuthContext'
import { useOrg } from '~platform/auth/useOrg'
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

// GET /integrator. `limits` is present only when enabled.
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

/**
 * Integrator quota/usage for the active organization. A non-integrator org returns
 * `{ enabled: false }`; errors (e.g. lacking the role) are treated as "not an integrator" so
 * detection never throws the dashboard into an error state.
 */
export const useIntegratorInfo = () => {
  const { bearedFetch } = useAuth()
  const { address } = useOrg()

  return useQuery<IntegratorInfo>({
    queryKey: QueryKeys.integrator.info(address),
    enabled: !!address,
    staleTime: 5 * 60 * 1000,
    retry: false,
    queryFn: () =>
      bearedFetch<IntegratorInfo>(ApiEndpoints.Integrator).catch(() => ({
        enabled: false,
        usage: { managedOrgs: 0, managedProcesses: 0, managedCensusSize: 0 },
      })),
  })
}

/** Paginated list of organizations managed by the active integrator. */
export const usePaginatedManagedOrganizations = (page: number, limit: number) => {
  const { bearedFetch } = useAuth()
  const { address } = useOrg()

  return useQuery<ManagedOrganizationsResponse>({
    queryKey: [...QueryKeys.integrator.managed(address), page, limit],
    enabled: !!address,
    queryFn: () =>
      bearedFetch<ManagedOrganizationsResponse>(`${ApiEndpoints.ManagedOrganizations}?page=${page}&limit=${limit}`),
  })
}

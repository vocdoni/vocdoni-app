import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { useOrganization } from '@vocdoni/react-components'
import type { ElectionStatus } from '@vocdoni/api-types'
import type { VocdoniApiClient } from '@vocdoni/api-client'
import { useParams, useSearchParams } from 'react-router-dom'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { getPaginationParams } from '~utils/pagination'
import { QueryKeys } from './keys'

export enum OrganizationMetaKeys {
  dashboardTutorial = 'isDashboardTutorialClosed',
  sidebarTutorial = 'isSidebarTutorialClosed',
}

export type OrganizationMeta = {
  [OrganizationMetaKeys.dashboardTutorial]?: boolean
  [OrganizationMetaKeys.sidebarTutorial]?: boolean
}

export type OrganizationMetaResponse = {
  meta: OrganizationMeta
}

type PaginatedElectionsParams = {
  page?: number
  limit?: number
  status?: string
}

export type Role = {
  role: string
  name: string
  organizationWritePermission: boolean
  processWritePermission: boolean
}

type OrganizationType = {
  name: string
  type: string
}

type InviteData = {
  email: string
  role: string
}

// The dashboard "ended" tab filters by the legacy `RESULTS` status, which the SAAS status union
// no longer has (results now live on an `ENDED` election). Map it (and the other legacy names)
// onto the SAAS `ElectionStatus` before querying.
const LIST_STATUS_MAP: Record<string, ElectionStatus> = {
  ongoing: 'READY',
  ready: 'READY',
  results: 'ENDED',
  ended: 'ENDED',
  paused: 'PAUSED',
  canceled: 'CANCELED',
  upcoming: 'UPCOMING',
}

export const paginatedElectionsQuery = (
  address: string | undefined,
  client: VocdoniApiClient,
  params: PaginatedElectionsParams,
  queryClient?: QueryClient
) => ({
  enabled: !!address,
  queryKey: QueryKeys.organization.elections(address, params),
  queryFn: async () => {
    // `enabled` above only guards the query while it is mounted; a manual `refetch()`
    // ignores it. Keep the guard here too: without an address the SaaS rejects the call
    // with 400 "invalid URL parameter: missing orgAddress" and the failure would be
    // cached against a key no organization owns.
    if (!address) {
      throw new Error('Cannot list elections with no organization address selected')
    }
    const result = await client.elections.list({
      orgAddress: address,
      page: params.page ? Number(params.page) : 1,
      limit: params.limit,
      status: params.status ? LIST_STATUS_MAP[params.status.toLowerCase()] : undefined,
      // These lists are about published elections — drafts have their own tab and
      // their own query. Without this the API defaults a manager to every process
      // of the organization, drafts included.
      published: true,
    })
    // Pre-seed each process into the ElectionProvider query so per-row providers
    // (ProcessesTable, dashboard cards) render from cache instead of re-fetching.
    if (queryClient) {
      result.processes.forEach((process) => {
        queryClient.setQueryData(QueryKeys.election.process(process.id), process)
      })
    }
    return result
  },
})

/**
 * The dashboard elections list, keyed by the active organization address.
 *
 * This deliberately subscribes rather than reading the cache once through a route loader.
 * `currentAddress` resolves asynchronously (the auth/addresses query) and changes when the
 * user switches organization; a loader is a one-shot function baked into a route object and
 * cannot notice either, which is what forced the router to be recreated on every render
 * (#1746). As a query, `enabled` does the waiting and a changed address changes the key.
 */
export const usePaginatedElections = () => {
  const { currentAddress } = useAuth()
  const { client } = useApiClient()
  const queryClient = useQueryClient()
  const params = useParams()
  const [searchParams] = useSearchParams()

  // Same merge the route loaders did, and it reads `params` from the same route match, so
  // the resulting filters are unchanged: query string first, route params on top. An
  // optional segment that didn't match is simply absent from `params` (React Router
  // expands `:page?/:status?` into separate branches), so `?page=`/`?status=` still apply
  // when the path omits them. `limit` has no default — only `?limit=` sets it.
  const mergedParams = { ...getPaginationParams(searchParams), ...params }

  return useQuery({
    ...paginatedElectionsQuery(currentAddress, client, mergedParams, queryClient),
    // Keep the previous page on screen while the next one loads, matching what the
    // blocking loader used to do (it left the old list rendered until data arrived).
    placeholderData: keepPreviousData,
  })
}

export const useOrganizationMeta = () => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const queryClient = useQueryClient()
  const address = organization?.address
  const hasOrganization = Boolean(address)

  const query = useQuery<OrganizationMeta>({
    queryKey: QueryKeys.organization.meta(organization?.address),
    enabled: hasOrganization,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await bearedFetch<OrganizationMetaResponse>(
        ApiEndpoints.OrganizationMeta.replace('{address}', organization.address)
      )
      return response.meta
    },
  })

  const updateMeta = useMutation<void, Error, Partial<OrganizationMeta>>({
    mutationFn: async (partialMeta: Partial<OrganizationMeta>) => {
      const newMeta = {
        ...query.data,
        ...partialMeta,
      }
      await bearedFetch<OrganizationMetaResponse>(
        ApiEndpoints.OrganizationMeta.replace('{address}', organization.address),
        {
          method: 'PUT',
          body: { meta: newMeta },
        }
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.organization.meta(organization?.address),
      })
    },
  })

  const deleteMeta = useMutation<void, Error, string[]>({
    mutationFn: async (keys: string[]) => {
      await bearedFetch(ApiEndpoints.OrganizationMeta.replace('{address}', organization.address), {
        method: 'DELETE',
        body: {
          keys,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.organization.meta(organization.address),
      })
    },
  })

  return {
    meta: query.data,
    metaIsLoading: query.isLoading,
    metaIsError: query.isError,
    hasOrganization,
    // Update meta
    updateMeta: updateMeta.mutate,
    updateMetaAsync: updateMeta.mutateAsync,
    updateMetaIsLoading: updateMeta.isPending,
    // Delete meta
    deleteMeta: deleteMeta.mutate,
    deleteMetaAsync: deleteMeta.mutateAsync,
    deleteMetaIsLoading: deleteMeta.isPending,
  }
}

export const useTutorials = () => {
  const { meta, metaIsLoading, metaIsError, hasOrganization, updateMeta, deleteMeta } = useOrganizationMeta()

  const canUseMeta = hasOrganization && !metaIsLoading && !metaIsError && Boolean(meta)
  const shouldDefaultToClosed = !hasOrganization || metaIsLoading || metaIsError || !meta

  const isSidebarTutorialClosed = meta?.[OrganizationMetaKeys.sidebarTutorial] ?? shouldDefaultToClosed
  const isDashboardTutorialClosed = meta?.[OrganizationMetaKeys.dashboardTutorial] ?? shouldDefaultToClosed

  const closeSidebarTutorial = () => {
    if (!canUseMeta) return
    updateMeta({ [OrganizationMetaKeys.sidebarTutorial]: true })
  }

  const closeDashboardTutorial = () => {
    if (!canUseMeta) return
    updateMeta({ [OrganizationMetaKeys.dashboardTutorial]: true })
  }

  const resetTutorials = () => {
    if (!canUseMeta) return
    deleteMeta([OrganizationMetaKeys.sidebarTutorial, OrganizationMetaKeys.dashboardTutorial])
  }

  return {
    isLoading: metaIsLoading,
    isError: metaIsError,
    isSidebarTutorialClosed,
    isDashboardTutorialClosed,
    closeSidebarTutorial,
    closeDashboardTutorial,
    resetTutorials,
    canUseMeta,
  }
}

export const useRoles = () => {
  const { bearedFetch } = useAuth()

  return useQuery({
    queryKey: QueryKeys.organization.roles,
    queryFn: async () => {
      const response = await bearedFetch<{ roles: Role[] }>(ApiEndpoints.OrganizationsRoles)
      return response.roles
    },
    staleTime: 60 * 60 * 1000,
    select: (data) => data.sort((a, b) => a.name.localeCompare(b.name)),
  })
}

export const useOrganizationTypes = () => {
  const { bearedFetch } = useAuth()

  return useQuery({
    queryKey: QueryKeys.organization.types,
    queryFn: async () => {
      const response = await bearedFetch<{ types: OrganizationType[] }>(ApiEndpoints.OrganizationsTypes)
      return response.types
    },
    staleTime: 60 * 60 * 1000,
    select: (data) => data.sort((a, b) => a.name.localeCompare(b.name)),
  })
}

export const useInviteMemberMutation = () => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: InviteData) =>
      await bearedFetch(ApiEndpoints.OrganizationUsers.replace('{address}', organization.address), {
        method: 'POST',
        body,
      }),
    onSuccess: (_data, body) => {
      trackAnalyticsEvent({ name: AnalyticsEvents.TeamMemberInvited, props: { role: body?.role ?? 'unknown' } })
      // Invalidate queries to refresh member and pending member lists
      queryClient.invalidateQueries({ queryKey: QueryKeys.organization.users() })
    },
  })
}

export const useRemoveUserMutation = () => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) =>
      await bearedFetch(
        ApiEndpoints.OrganizationUser.replace('{address}', organization.address).replace('{userId}', String(id)),
        { method: 'DELETE' }
      ),
    onSuccess: () => {
      trackAnalyticsEvent({ name: AnalyticsEvents.TeamMemberRemoved })
      // Invalidate queries to refresh member and pending member lists
      queryClient.invalidateQueries({ queryKey: QueryKeys.organization.users() })
    },
  })
}

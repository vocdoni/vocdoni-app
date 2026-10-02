import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useOrganization } from '@vocdoni/react-components'
import { useCallback, useState } from 'react'
import { PaginationResponse } from '~src/queries/pagination'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { QueryKeys } from '~src/queries/keys'
import {
  type CollectProgress,
  collectMembers,
  MEMBERS_COLLECT_CAP,
  type MembersPageFetcher,
  type MembersResponse,
} from '~src/queries/members'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'

export type Group = {
  id: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
  censusIds: string[]
  membersCount: number
  isAutoGroup?: boolean
}

export type GroupsResponse = {
  groups: Group[]
} & PaginationResponse

export const getNextGroupsPageParam = (lastPage: GroupsResponse) => {
  const { currentPage, lastPage: lastPageNumber } = lastPage.pagination
  if (currentPage < lastPageNumber) return currentPage + 1
  return undefined
}

export type GroupData = {
  title: string
  description?: string
  memberIds?: string[]
  /** Stores a snapshot of every member's id instead of `memberIds` */
  includeAllMembers?: boolean
}

export type CreateGroupVariables = GroupData & {
  /** For analytics only, never sent: where the group was made */
  source?: 'selection'
  /** For analytics only: how many people it holds (with `includeAllMembers` the ids aren't sent) */
  size?: number
}

export type UpdateGroupData = {
  title?: string
  description?: string
  addMembers?: string[]
  removeMembers?: string[]
}

export const useGroups = (limit: number = 6) => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()

  return useInfiniteQuery<GroupsResponse, Error, Group[]>({
    // The page size is part of the key: callers asking for 6 and for 100 must not share pages
    queryKey: [...QueryKeys.organization.groups(organization?.address), 'paged', limit],
    enabled: !!organization?.address,
    refetchOnWindowFocus: false,
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      bearedFetch<GroupsResponse>(
        ApiEndpoints.OrganizationGroups.replace('{address}', organization?.address) +
          `?page=${pageParam}&limit=${limit}`
      ),
    getNextPageParam: (lastPage) => getNextGroupsPageParam(lastPage),
    select: (data) => data.pages.flatMap((page) => page.groups),
  })
}

/** How long the full groups list counts as fresh. */
export const ALL_GROUPS_STALE_TIME = 60 * 1000

/** The most groups `GET /groups` returns per page. */
const GROUPS_PAGE_MAX = 100

/**
 * Every group of the organization, all pages of them, for pickers that must offer each one (the
 * paged `useGroups` stops at its first page until asked for more). Shares the groups key, so any
 * group write refreshes it.
 */
export const useAllGroups = ({ enabled = true }: { enabled?: boolean } = {}) => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const address = organization?.address

  return useQuery<Group[], Error>({
    queryKey: [...QueryKeys.organization.groups(address), 'all'],
    enabled: enabled && !!address,
    // Every group with every member id: a minute fresh, so screens and drawers that mount it don't each
    // read it again. Group writes invalidate the key, so the app's own changes still show at once.
    staleTime: ALL_GROUPS_STALE_TIME,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const groups: Group[] = []
      let page = 1
      let lastPage = 1
      do {
        const response = await bearedFetch<GroupsResponse>(
          ApiEndpoints.OrganizationGroups.replace('{address}', address) + `?page=${page}&limit=${GROUPS_PAGE_MAX}`
        )
        groups.push(...(response.groups ?? []))
        lastPage = response.pagination?.lastPage ?? page
        page += 1
      } while (page <= lastPage)
      return groups
    },
  })
}

export const useCreateGroup = () => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const queryClient = useQueryClient()

  return useMutation({
    /** Resolves with the new group's id */
    mutationFn: async ({ source: _source, size: _size, ...body }: CreateGroupVariables) =>
      await bearedFetch<{ id?: string }>(ApiEndpoints.OrganizationGroups.replace('{address}', organization.address), {
        method: 'POST',
        body,
      }),
    onSuccess: (_data, { source, size, memberIds }) => {
      trackAnalyticsEvent({
        name: AnalyticsEvents.MemberGroupCreated,
        props: { group_size: size ?? memberIds?.length ?? 0, ...(source ? { source } : {}) },
      })
      queryClient.invalidateQueries({
        queryKey: QueryKeys.organization.groups(organization.address),
      })
    },
  })
}

export const useDeleteGroup = () => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (groupId: string) => {
      await bearedFetch<void>(
        ApiEndpoints.OrganizationGroup.replace('{address}', organization.address).replace('{groupId}', groupId),
        {
          method: 'DELETE',
        }
      )
    },
    onSuccess: () => {
      trackAnalyticsEvent({ name: AnalyticsEvents.MemberGroupDeleted })
      queryClient.invalidateQueries({
        queryKey: QueryKeys.organization.groups(organization.address),
        exact: false,
      })
    },
  })
}

export const useUpdateGroup = () => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ groupId, body }: { groupId: string; body: UpdateGroupData }) => {
      await bearedFetch(
        ApiEndpoints.OrganizationGroup.replace('{address}', organization.address).replace('{groupId}', groupId),
        {
          method: 'PUT',
          body,
        }
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.organization.groups(organization.address),
      })
    },
  })
}

/** One group as `GET /groups/{id}` returns it: with its member ids, except Everyone's (its count instead). */
export type GroupInfo = Group & { memberIds?: string[] }

/** How many people a group holds. */
export const groupSize = (group?: Pick<GroupInfo, 'isAutoGroup' | 'memberIds' | 'membersCount'>) => {
  if (!group) return 0
  if (group.isAutoGroup) return group.membersCount ?? 0
  return group.memberIds?.length ?? group.membersCount ?? 0
}

/** One group, with its member ids. Under the groups key, so any group write refreshes it. */
export const useGroup = (groupId?: string) => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const address = organization?.address

  return useQuery<GroupInfo, Error>({
    queryKey: [...QueryKeys.organization.groups(address), 'detail', groupId],
    enabled: !!address && !!groupId,
    refetchOnWindowFocus: false,
    queryFn: () =>
      bearedFetch<GroupInfo>(
        ApiEndpoints.OrganizationGroup.replace('{address}', address).replace('{groupId}', groupId!)
      ),
  })
}

/** Fetches one page of a group's members (the endpoint has no search: `search` is ignored). */
export const useGroupMembersFetcher = (groupId?: string): MembersPageFetcher => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const address = organization?.address

  return useCallback(
    ({ page, limit }) =>
      bearedFetch<MembersResponse>(
        ApiEndpoints.OrganizationGroupMembers.replace('{address}', address).replace('{groupId}', groupId ?? '') +
          `?page=${page}&limit=${limit}`
      ),
    [bearedFetch, address, groupId]
  )
}

const groupMembersKey = (address: string | undefined, groupId: string | undefined) => [
  ...QueryKeys.organization.groups(address),
  'members',
  groupId,
]

/** One page of a group's members, for groups too big to load whole. Keeps the last page while the next loads. */
export const useGroupMembersPage = (
  groupId: string | undefined,
  { page, limit, enabled = true }: { page: number; limit: number; enabled?: boolean }
) => {
  const { organization } = useOrganization()
  const fetchPage = useGroupMembersFetcher(groupId)

  return useQuery<MembersResponse, Error>({
    queryKey: [...groupMembersKey(organization?.address, groupId), 'page', page, limit],
    enabled: enabled && !!organization?.address && !!groupId,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    queryFn: () => fetchPage({ page, limit, search: '' }),
  })
}

/**
 * Every member of a group of up to 5,000, loaded 100 at a time, so the census can be searched on the
 * client (the endpoint has no search). Bigger groups get the first 5,000 and `capped`.
 */
export const useAllGroupMembers = (groupId: string | undefined, { enabled = true }: { enabled?: boolean } = {}) => {
  const { organization } = useOrganization()
  const fetchPage = useGroupMembersFetcher(groupId)
  const [progress, setProgress] = useState<CollectProgress | null>(null)

  const query = useQuery({
    queryKey: [...groupMembersKey(organization?.address, groupId), 'all'],
    enabled: enabled && !!organization?.address && !!groupId,
    refetchOnWindowFocus: false,
    retry: false,
    queryFn: ({ signal }) => collectMembers(fetchPage, { max: MEMBERS_COLLECT_CAP, signal, onProgress: setProgress }),
  })

  return { ...query, progress: query.isFetching ? progress : null }
}

/** What `PUT /groups/{id}` answers when it touched votes: resize jobs to wait for, and per-census problems. */
export type UpdateGroupResponse = { censusJobIds?: string[]; errors?: string[] } | string | undefined

/** `PUT /groups/{id}`, returning what it reports (the shared `useUpdateGroup` drops it). */
export const useUpdateGroupWithReport = () => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ groupId, body }: { groupId: string; body: UpdateGroupData }) =>
      bearedFetch<UpdateGroupResponse>(
        ApiEndpoints.OrganizationGroup.replace('{address}', organization.address).replace('{groupId}', groupId),
        { method: 'PUT', body }
      ),
    onSettled: () => queryClient.invalidateQueries({ queryKey: QueryKeys.organization.groups(organization?.address) }),
  })
}

/** The resize jobs a group update started (a bare "OK" started none). */
export const censusJobIdsOf = (response: UpdateGroupResponse) =>
  response && typeof response === 'object' ? (response.censusJobIds ?? []) : []

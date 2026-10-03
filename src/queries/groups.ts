import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useOrganization } from '@vocdoni/react-components'
import { PaginationResponse } from '~src/queries/pagination'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { QueryKeys } from '~src/queries/keys'
import { Member } from '~src/queries/members'
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

export type GroupMembers = {
  members: Partial<Member>[]
} & PaginationResponse

export type GroupMembersQueryData = GroupMembers

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
    queryKey: QueryKeys.organization.groups(organization?.address),
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

export const useGroupMembers = (groupId: string, page, isOpen: boolean = false) => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()

  const baseUrl = ApiEndpoints.OrganizationGroupMembers.replace('{address}', organization?.address).replace(
    '{groupId}',
    groupId
  )
  const fetchUrl = `${baseUrl}?page=${page}`

  return useQuery<GroupMembers, Error, GroupMembersQueryData>({
    enabled: !!organization?.address && !!groupId && isOpen,
    queryKey: [...QueryKeys.organization.groups(organization?.address), groupId, page],
    queryFn: () => bearedFetch<GroupMembers>(fetchUrl),
    refetchOnWindowFocus: false,
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

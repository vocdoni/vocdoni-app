import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { enforceHexPrefix, useOrganization } from '@vocdoni/react-components'
import { PaginationResponse } from '@vocdoni/sdk'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { QueryKeys } from '~src/queries/keys'
import { Member } from '~src/queries/members'

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
  memberIDs: string[]
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
        ApiEndpoints.OrganizationGroups.replace('{address}', enforceHexPrefix(organization?.address)) +
          `?page=${pageParam}&limit=${limit}`
      ),
    getNextPageParam: (lastPage) => getNextGroupsPageParam(lastPage),
    select: (data) => data.pages.flatMap((page) => page.groups),
  })
}

export const useCreateGroup = () => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: GroupData) => {
      await bearedFetch(ApiEndpoints.OrganizationGroups.replace('{address}', enforceHexPrefix(organization.address)), {
        method: 'POST',
        body,
      })
    },
    onSuccess: () => {
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
        ApiEndpoints.OrganizationGroup.replace('{address}', enforceHexPrefix(organization.address)).replace(
          '{groupId}',
          groupId
        ),
        {
          method: 'DELETE',
        }
      )
    },
    onSuccess: () => {
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

  const baseUrl = ApiEndpoints.OrganizationGroupMembers.replace(
    '{address}',
    enforceHexPrefix(organization?.address)
  ).replace('{groupId}', groupId)
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
        ApiEndpoints.OrganizationGroup.replace('{address}', enforceHexPrefix(organization.address)).replace(
          '{groupId}',
          groupId
        ),
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

import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { enforceHexPrefix, useClient } from '@vocdoni/react-components'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { QueryKeys } from './keys'

export type UserInfo = {
  id: number
  email: string
  firstName: string
  lastName: string
}

export type ActiveUser = {
  info: UserInfo
  role: string
  expiration?: string
}

export type PendingUser = {
  id: string
  email: string
  role: string
  expiration?: string
  info?: undefined
}

export type User = ActiveUser | PendingUser

export type UpdateRoleBody = {
  role: string
}

export type UpdateRoleParams = {
  id: string
  body: UpdateRoleBody
}

type UsersResponse = {
  users: User[]
}

type PendingUsersResponse = {
  pending: PendingUser[]
}

// Fetch hook for organization users
export const useUsers = ({
  options,
}: {
  options?: Omit<UseQueryOptions<UsersResponse>, 'queryKey' | 'queryFn'>
} = {}) => {
  const { bearedFetch } = useAuth()
  const { account } = useClient()
  return useQuery({
    queryKey: QueryKeys.organization.users(enforceHexPrefix(account?.address)),
    queryFn: () =>
      bearedFetch<UsersResponse>(
        ApiEndpoints.OrganizationUsers.replace('{address}', enforceHexPrefix(account?.address))
      ),
    ...options,
    select: (data) => data.users,
  })
}

// Fetch hook for pending users
export const usePendingUsers = ({
  options,
}: {
  options?: Omit<UseQueryOptions<PendingUsersResponse>, 'queryKey' | 'queryFn'>
} = {}) => {
  const { bearedFetch } = useAuth()
  const { account } = useClient()
  return useQuery({
    queryKey: QueryKeys.organization.pendingUsers(enforceHexPrefix(account?.address)),
    queryFn: () =>
      bearedFetch<PendingUsersResponse>(
        ApiEndpoints.OrganizationPendingUsers.replace('{address}', enforceHexPrefix(account?.address))
      ),
    ...options,
    select: (data) => data.pending,
  })
}

export const useAllUsers = () => {
  const { data: usersData, isLoading: usersLoading, isError: isUsersError, error: usersError } = useUsers()

  const {
    data: pendingData,
    isLoading: pendingLoading,
    isError: pendingError,
    error: pendingFetchError,
  } = usePendingUsers()

  return {
    users: [...(usersData || []), ...(pendingData || [])],
    isLoading: usersLoading || pendingLoading,
    isError: isUsersError || pendingError,
    error: usersError || pendingFetchError,
  }
}

export const useUpdateRole = () => {
  const { bearedFetch } = useAuth()
  const { account } = useClient()
  const client = useQueryClient()

  return useMutation<void, Error, UpdateRoleParams>({
    mutationFn: async ({ id, body }) =>
      await bearedFetch<void>(
        ApiEndpoints.OrganizationUser.replace('{address}', enforceHexPrefix(account?.address)).replace('{userId}', id),
        {
          method: 'PUT',
          body,
        }
      ),
    onSuccess: () => {
      client.invalidateQueries({
        queryKey: QueryKeys.organization.users(),
      })
    },
  })
}

export const useCancelInvitation = () => {
  const { bearedFetch } = useAuth()
  const { account } = useClient()
  const client = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) =>
      await bearedFetch<void>(
        ApiEndpoints.OrganizationPendingUser.replace('{address}', enforceHexPrefix(account?.address)).replace(
          '{inviteId}',
          id
        ),
        { method: 'DELETE' }
      ),
    onSuccess: () => {
      client.invalidateQueries({
        queryKey: QueryKeys.organization.pendingUsers(),
      })
    },
  })
}

export const useResendInvitationMutation = () => {
  const { bearedFetch } = useAuth()
  const { account } = useClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) =>
      await bearedFetch<void>(
        ApiEndpoints.OrganizationPendingUser.replace('{address}', enforceHexPrefix(account?.address)).replace(
          '{inviteId}',
          id
        ),
        {
          method: 'PUT',
        }
      ),
  })
}

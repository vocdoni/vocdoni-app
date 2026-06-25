import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiEndpoints } from '~platform/api/endpoints'
import { useAuth } from '~platform/auth/AuthContext'
import { useOrg } from '~platform/auth/useOrg'
import { QueryKeys } from './keys'

const ensure0x = (address: string) => (address.startsWith('0x') ? address : `0x${address}`)

// GET /organizations/{address}/users
export type OrganizationUser = {
  info: { id: number; email: string; firstName: string; lastName: string }
  role: string
}

// GET /organizations/{address}/users/pending
export type PendingInvite = {
  id: string
  email: string
  role: string
  expiration: string
}

/** Active members of the active organization (admin only). */
export const useOrgUsers = () => {
  const { bearedFetch } = useAuth()
  const { address } = useOrg()

  return useQuery<OrganizationUser[]>({
    queryKey: QueryKeys.organization.users(address),
    enabled: !!address,
    queryFn: () =>
      bearedFetch<{ users: OrganizationUser[] }>(
        ApiEndpoints.OrganizationUsers.replace('{address}', ensure0x(address!))
      ).then((d) => d.users ?? []),
  })
}

/** Pending invitations for the active organization (admin only). */
export const usePendingInvites = () => {
  const { bearedFetch } = useAuth()
  const { address } = useOrg()

  return useQuery<PendingInvite[]>({
    queryKey: QueryKeys.organization.pending(address),
    enabled: !!address,
    queryFn: () =>
      bearedFetch<{ pending: PendingInvite[] }>(
        ApiEndpoints.OrganizationPendingUsers.replace('{address}', ensure0x(address!))
      ).then((d) => d.pending ?? []),
  })
}

/** Shared invalidation: refresh both the members list and the pending invites. */
const useInvalidateTeam = () => {
  const queryClient = useQueryClient()
  const { address } = useOrg()
  return () => {
    queryClient.invalidateQueries({ queryKey: QueryKeys.organization.users(address) })
    queryClient.invalidateQueries({ queryKey: QueryKeys.organization.pending(address) })
  }
}

/** Invite a new member by email + role. */
export const useInviteMember = () => {
  const { bearedFetch } = useAuth()
  const { address } = useOrg()
  const invalidate = useInvalidateTeam()

  return useMutation<void, Error, { email: string; role: string }>({
    mutationFn: (body) =>
      bearedFetch<void>(ApiEndpoints.OrganizationUsers.replace('{address}', ensure0x(address!)), {
        method: 'POST',
        body,
      }),
    onSuccess: invalidate,
  })
}

/** Change an existing member's role. */
export const useUpdateUserRole = () => {
  const { bearedFetch } = useAuth()
  const { address } = useOrg()
  const invalidate = useInvalidateTeam()

  return useMutation<void, Error, { userId: number; role: string }>({
    mutationFn: ({ userId, role }) =>
      bearedFetch<void>(
        ApiEndpoints.OrganizationUser.replace('{address}', ensure0x(address!)).replace('{userid}', String(userId)),
        { method: 'PUT', body: { role } }
      ),
    onSuccess: invalidate,
  })
}

/** Remove a member from the organization. */
export const useRemoveUser = () => {
  const { bearedFetch } = useAuth()
  const { address } = useOrg()
  const invalidate = useInvalidateTeam()

  return useMutation<void, Error, { userId: number }>({
    mutationFn: ({ userId }) =>
      bearedFetch<void>(
        ApiEndpoints.OrganizationUser.replace('{address}', ensure0x(address!)).replace('{userid}', String(userId)),
        { method: 'DELETE' }
      ),
    onSuccess: invalidate,
  })
}

/** Cancel a pending invitation. */
export const useCancelInvite = () => {
  const { bearedFetch } = useAuth()
  const { address } = useOrg()
  const invalidate = useInvalidateTeam()

  return useMutation<void, Error, { invitationId: string }>({
    mutationFn: ({ invitationId }) =>
      bearedFetch<void>(
        ApiEndpoints.OrganizationPendingUser.replace('{address}', ensure0x(address!)).replace(
          '{invitationID}',
          invitationId
        ),
        { method: 'DELETE' }
      ),
    onSuccess: invalidate,
  })
}

/** Resend a pending invitation (regenerates the code and re-sends the email). */
export const useResendInvite = () => {
  const { bearedFetch } = useAuth()
  const { address } = useOrg()
  const invalidate = useInvalidateTeam()

  return useMutation<void, Error, { invitationId: string }>({
    mutationFn: ({ invitationId }) =>
      bearedFetch<void>(
        ApiEndpoints.OrganizationPendingUser.replace('{address}', ensure0x(address!)).replace(
          '{invitationID}',
          invitationId
        ),
        { method: 'PUT' }
      ),
    onSuccess: invalidate,
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiEndpoints } from '~platform/api/endpoints'
import { useAuth } from '~platform/auth/AuthContext'
import { useOrg } from '~platform/auth/OrgContext'
import { QueryKeys } from './keys'

const ensure0x = (address: string) => (address.startsWith('0x') ? address : `0x${address}`)

export type CreateOrganizationBody = {
  type: string
  website?: string
  size?: string
  color?: string
  subdomain?: string
  country?: string
  timezone?: string
  communications?: boolean
  // Ask the backend to provision the on-chain account eagerly so this self-serve portal
  // never needs a wallet/SDK signer step.
  provisionAccount: boolean
  // Subscribe the new org to the free integrator plan so it becomes an integrator
  // immediately, with no checkout (saas-backend#532).
  integrator: boolean
}

type CreatedOrganization = { address: string }

/**
 * Self-serve organization creation: the signed-in user becomes the org's admin. We always set
 * provisionAccount (on-chain account created server-side) and integrator (subscribe to the free
 * integrator tier), so a portal-created org is an integrator with no checkout. On success the
 * profile is refreshed so the new org shows up as an administrable organization.
 */
export const useCreateOrganization = () => {
  const { bearedFetch } = useAuth()
  const queryClient = useQueryClient()

  return useMutation<CreatedOrganization, Error, Omit<CreateOrganizationBody, 'provisionAccount' | 'integrator'>>({
    mutationFn: (body) =>
      bearedFetch<CreatedOrganization>(ApiEndpoints.Organizations, {
        method: 'POST',
        body: { ...body, provisionAccount: true, integrator: true } satisfies CreateOrganizationBody,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.profile })
    },
  })
}

// GET /organizations/{address} — full organization info (mirrors saas-backend OrganizationInfo).
export type OrganizationDetails = {
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

// Fields PUT /organizations/{address} accepts (only non-empty ones are applied; `type` is fixed
// at creation and cannot be updated).
export type UpdateOrganizationBody = {
  website?: string
  size?: string
  color?: string
  subdomain?: string
  country?: string
  timezone?: string
}

/** Organization details for the active org. */
export const useOrganization = () => {
  const { bearedFetch } = useAuth()
  const { selectedAddress } = useOrg()

  return useQuery<OrganizationDetails>({
    queryKey: QueryKeys.organization.info(selectedAddress),
    enabled: !!selectedAddress,
    queryFn: () =>
      bearedFetch<OrganizationDetails>(ApiEndpoints.Organization.replace('{address}', ensure0x(selectedAddress!))),
  })
}

/** Updates the active organization's details (admin only). Refreshes the org info + profile. */
export const useUpdateOrganization = () => {
  const { bearedFetch } = useAuth()
  const { selectedAddress } = useOrg()
  const queryClient = useQueryClient()

  return useMutation<void, Error, UpdateOrganizationBody>({
    mutationFn: (body) =>
      bearedFetch<void>(ApiEndpoints.Organization.replace('{address}', ensure0x(selectedAddress!)), {
        method: 'PUT',
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.organization.info(selectedAddress) })
      queryClient.invalidateQueries({ queryKey: QueryKeys.profile })
    },
  })
}

export type OrganizationType = { type: string; name: string }

/** Available organization types (public list). */
export const useOrganizationTypes = () => {
  const { bearedFetch } = useAuth()

  return useQuery<OrganizationType[]>({
    queryKey: QueryKeys.organization.types,
    staleTime: 60 * 60 * 1000,
    queryFn: () =>
      bearedFetch<{ types: OrganizationType[] }>(ApiEndpoints.OrganizationTypes).then((d) => d.types ?? []),
  })
}

export type OrganizationRole = {
  role: string
  name: string
  organizationWritePermission: boolean
  processWritePermission: boolean
}

/** Available organization user roles (public list), used for the team role selector. */
export const useOrganizationRoles = () => {
  const { bearedFetch } = useAuth()

  return useQuery<OrganizationRole[]>({
    queryKey: QueryKeys.organization.roles,
    staleTime: 60 * 60 * 1000,
    queryFn: () =>
      bearedFetch<{ roles: OrganizationRole[] }>(ApiEndpoints.OrganizationRoles).then((d) => d.roles ?? []),
  })
}

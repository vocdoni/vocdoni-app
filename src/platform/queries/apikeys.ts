import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiEndpoints } from '~platform/api/endpoints'
import { useAuth } from '~platform/auth/AuthContext'
import { useOrg } from '~platform/auth/useOrg'
import { QueryKeys } from './keys'

const ensure0x = (address: string) => (address.startsWith('0x') ? address : `0x${address}`)

// Assignable API key scopes (mirrors the backend; saas-backend#535).
export const API_KEY_SCOPES: { value: string; label: string; description: string }[] = [
  { value: 'quota:read', label: 'Read quota', description: 'Read integrator quota and usage' },
  { value: 'managed:read', label: 'List managed orgs', description: 'List managed organizations' },
  { value: 'managed:write', label: 'Create managed orgs', description: 'Create managed organizations' },
  { value: 'voting:write', label: 'Manage voting', description: 'Create and publish processes, censuses and bundles' },
  { value: 'members:write', label: 'Manage members', description: 'Manage members and groups' },
]

export type ApiKey = {
  id: string
  label: string
  prefix: string
  scopes: string[]
  createdBy: string
  createdAt: string
  lastUsedAt?: string
  expiresAt?: string
  revoked: boolean
}

export type CreateApiKeyBody = {
  label: string
  scopes: string[]
  expiresAt?: string
}

export type CreatedApiKey = ApiKey & { secret: string }

/** API keys owned by the active organization (admin only). */
export const useApiKeys = () => {
  const { bearedFetch } = useAuth()
  const { address } = useOrg()

  return useQuery<ApiKey[]>({
    queryKey: QueryKeys.organization.apikeys(address),
    enabled: !!address,
    queryFn: () =>
      bearedFetch<{ apiKeys: ApiKey[] }>(ApiEndpoints.APIKeys.replace('{orgAddress}', ensure0x(address!))).then(
        (d) => d.apiKeys ?? []
      ),
  })
}

/** Create an API key. The returned secret is shown only once. */
export const useCreateApiKey = () => {
  const { bearedFetch } = useAuth()
  const { address } = useOrg()
  const queryClient = useQueryClient()

  return useMutation<CreatedApiKey, Error, CreateApiKeyBody>({
    mutationFn: (body) =>
      bearedFetch<CreatedApiKey>(ApiEndpoints.APIKeys.replace('{orgAddress}', ensure0x(address!)), {
        method: 'POST',
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.organization.apikeys(address) })
    },
  })
}

/** Revoke (permanently disable) an API key. */
export const useRevokeApiKey = () => {
  const { bearedFetch } = useAuth()
  const { address } = useOrg()
  const queryClient = useQueryClient()

  return useMutation<void, Error, { id: string }>({
    mutationFn: ({ id }) =>
      bearedFetch<void>(ApiEndpoints.APIKey.replace('{orgAddress}', ensure0x(address!)).replace('{keyId}', id), {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.organization.apikeys(address) })
    },
  })
}

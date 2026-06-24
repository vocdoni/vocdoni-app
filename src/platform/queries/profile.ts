import { useQuery } from '@tanstack/react-query'
import { UnauthorizedApiError } from '~platform/api/client'
import { ApiEndpoints } from '~platform/api/endpoints'
import { useAuth } from '~platform/auth/AuthContext'
import { QueryKeys } from './keys'

export interface OrganizationSummary {
  address: string
  type?: string
  size?: number
  color?: string
  subdomain?: string
  timezone?: string
  active?: boolean
}

export interface UserOrganization {
  role: string
  organization: OrganizationSummary
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  organizations: UserOrganization[]
  verified?: boolean
}

export const useProfile = () => {
  const { bearedFetch, isAuthenticated } = useAuth()

  return useQuery<User>({
    queryKey: QueryKeys.profile,
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
    queryFn: () => bearedFetch<User>(ApiEndpoints.Me),
    retry: (failureCount, error) => {
      if (error instanceof UnauthorizedApiError) return false
      return failureCount < 2
    },
  })
}

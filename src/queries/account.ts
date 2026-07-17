import {
  QueryKey,
  UndefinedInitialDataOptions,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query'
import { useClient } from '@vocdoni/react-components'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { api, ApiEndpoints, ApiError, getApiErrorMessage, UnauthorizedApiError } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { useConnectionToast } from '~components/Layout/ConnectionToast'
import type { OrganizationData } from '~components/Organization/AccountTypes'
import { useToast } from '~components/Toast'
import { QueryKeys } from './keys'

export interface Organization {
  address: string
  type: string
  size: number
  color: string
  logo: string
  subdomain: string
  timezone: string
  active: boolean
  parent?: any
  // Integrator org that manages this one, when it was created through the integrator portal.
  // Present only for managed orgs (regular orgs omit it), so we can hide them from org pickers.
  managedBy?: string
  subscription?: Subscription
}

export interface Subscription {
  planId: string
  startDate: string
  renewalDate: string
  lastPaymentDate: string
  active: boolean
}

export interface UserRole {
  role: string
  // The integrator flag lives on the membership, not the organization: /users/me returns it at
  // organizations[].isIntegrator (alongside `role`), not on the nested organization object.
  isIntegrator?: boolean
  organization: Organization
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  organizations: Array<UserRole>
  providers: string[]
  hasPassword: boolean
}

export interface UpdateProfileParams {
  firstName: string
  lastName: string
}

export interface AuthResponse {
  token: string
  expirity: string
}

export const useProfile = (
  options?: Omit<UndefinedInitialDataOptions<User, Error, User, QueryKey>, 'queryKey' | 'queryFn'>
) => {
  const { bearedFetch } = useAuth()
  const { recordFailure, recordSuccess } = useConnectionToast()

  const query = useQuery<User, Error, User, QueryKey>({
    ...options,
    queryKey: QueryKeys.profile,
    refetchOnWindowFocus: false,
    queryFn: () => bearedFetch<User>(ApiEndpoints.Me),
    // Use default retry (3 attempts) so query can fail and enter error state
    retry: (_failureCount, error) => {
      // Don't retry auth errors - those won't fix themselves
      if (error instanceof UnauthorizedApiError) return false
      // Allow up to 3 retries for other errors, then fail
      return _failureCount < 3
    },
  })

  // Manual retry logic with connection status tracking
  const retryIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const isConnectionIssue = (error: unknown) => {
    if (error instanceof ApiError) {
      // Treat missing response as connectivity failure, otherwise only 404 counts
      return !error.response || error.response.status === 404
    }

    // Native fetch errors (TypeError) don't include a response when the network is down
    if (error instanceof Error && !(error as { response?: unknown }).response) {
      return true
    }

    return false
  }

  useEffect(() => {
    if (query.isError) {
      const connectionIssue = isConnectionIssue(query.error)

      if (connectionIssue) {
        recordFailure()

        // Start manual retry loop if not already running
        if (!retryIntervalRef.current) {
          retryIntervalRef.current = setInterval(() => {
            if (!query.isFetching) query.refetch()
          }, 5_000) // Retry every 5 seconds
        }
      } else {
        // Not a connection problem: mark connection as healthy and stop retrying
        recordSuccess()
        if (retryIntervalRef.current) {
          clearInterval(retryIntervalRef.current)
          retryIntervalRef.current = null
        }
      }
    } else if (query.isSuccess) {
      recordSuccess()

      // Stop manual retries when successful
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current)
        retryIntervalRef.current = null
      }
    }

    // Cleanup on unmount
    return () => {
      if (retryIntervalRef.current) {
        clearInterval(retryIntervalRef.current)
        retryIntervalRef.current = null
      }
    }
  }, [query.isError, query.isSuccess, query.error, query.refetch, recordFailure, recordSuccess])

  return query
}

export const useUpdateProfile = () => {
  const { bearedFetch } = useAuth()
  const queryClient = useQueryClient()

  return useMutation<AuthResponse, Error, UpdateProfileParams>({
    mutationFn: (body) =>
      bearedFetch<AuthResponse>(ApiEndpoints.Me, {
        method: 'PUT',
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.profile })
    },
  })
}

type InviteAcceptRequestBody = {
  code: string
  user: {
    firstName: string
    lastName: string
    password: string
  }
}

export const useSaasOrganization = ({
  options,
}: {
  options?: Omit<UseQueryOptions<OrganizationData>, 'queryKey' | 'queryFn'>
} = {}) => {
  const { bearedFetch } = useAuth()
  const { account } = useClient()

  return useQuery({
    queryKey: QueryKeys.organization.info(account?.address),
    refetchOnWindowFocus: false,
    queryFn: () => bearedFetch<OrganizationData>(ApiEndpoints.Organization.replace('{address}', account?.address)),
    enabled: !!account?.address,
    ...options,
  })
}

interface UpdatePasswordParams {
  oldPassword: string
  newPassword: string
}

export const useUpdatePassword = () => {
  const { bearedFetch } = useAuth()

  return useMutation<void, Error, UpdatePasswordParams>({
    mutationFn: (params) =>
      bearedFetch<void>(ApiEndpoints.Password, {
        method: 'PUT',
        body: params,
      }),
  })
}

export const useSignupFromInvite = (address: string) => {
  const toast = useToast()
  const { t } = useTranslation()

  return useMutation<AuthResponse, Error, InviteAcceptRequestBody>({
    mutationFn: (body) =>
      api<AuthResponse>(ApiEndpoints.InviteAccept.replace('{address}', address), {
        method: 'POST',
        body,
      }),
    // Surface invite-signup failures the same way the regular register mutation
    // does (see useAuthProvider); otherwise the error is silently swallowed.
    onError: (error) => {
      toast({
        type: 'error',
        title: t('registration_failed', { defaultValue: 'Registration failed' }),
        description: getApiErrorMessage(error),
      })
    },
  })
}

import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { useClient } from '@vocdoni/react-providers'
import { createContext, ReactNode, useCallback, useContext } from 'react'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { OrganizationData } from '~components/Organization/AccountTypes'
import { QueryKeys } from '~src/queries/keys'

const useSaasOrganization = ({
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

export const useSaasAccount = () => {
  const context = useContext(SaasAccountContext)
  if (!context) {
    throw new Error('useSaasAccount must be used within an SaasAccountProvider')
  }
  return context
}

const useSaasAccountProvider = (options?: Parameters<typeof useSaasOrganization>[0]) => {
  const {
    account: accountSDK,
    fetchAccount,
    errors: { fetch: sdkAccountError },
    loading: { fetch: sdkAccountLoading },
  } = useClient()
  const {
    data: saasData,
    refetch,
    isLoading: isSaasLoading,
    isError: isSaasError,
    error: saasError,
  } = useSaasOrganization(options)

  const refetchAccount = useCallback(() => {
    refetch()
    fetchAccount()
  }, [refetch, fetchAccount])

  const organization: OrganizationData = { ...accountSDK, ...saasData }

  const isLoading = isSaasLoading || sdkAccountLoading
  const isError = isSaasError || !!sdkAccountError
  const error = saasError || sdkAccountError

  return { organization, refetchAccount, isLoading, isError, error }
}

const SaasAccountContext = createContext<ReturnType<typeof useSaasAccountProvider> | undefined>(undefined)

export const SaasAccountProvider = ({ children }: { children: ReactNode }) => {
  const saasAcount = useSaasAccountProvider()
  return <SaasAccountContext.Provider value={saasAcount}>{children}</SaasAccountContext.Provider>
}

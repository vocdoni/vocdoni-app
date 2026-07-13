import { useClient } from '@vocdoni/react-components'
import { createContext, ReactNode, useCallback, useContext } from 'react'
import { OrganizationData } from '~components/Organization/AccountTypes'
import { useSaasOrganization } from '~src/queries/account'

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

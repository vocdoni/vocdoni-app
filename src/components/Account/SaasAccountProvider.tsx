import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import type { Organization } from '@vocdoni/api-types'
import { createContext, ReactNode, useCallback, useContext } from 'react'
import { useAuth } from '~components/Auth/useAuth'
import { OrganizationData } from '~components/Organization/AccountTypes'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { QueryKeys } from '~src/queries/keys'

const emptyMultilingual = { default: '' }

// Adapts the SAAS `OrganizationInfo` onto the `.account`-nested `OrganizationData` shape
// that the org display components (Header, Process/View, CreatedBy, LegalNotice) read.
// This is NOT old-SDK backwards-compat: those same components also render on the public
// `/organization/:address` and `/processes/:id` SSR pages, which still supply the nested
// shape from the vochain path (src/ssr/public-pages.ts `fetchAccountInfo`). Until that
// public/SSR org path is migrated to the SAAS flat shape (next step), this adapter keeps
// the shared components working in both contexts. Delete it together with that migration.
// (SAAS has no separate header/avatar — branding is `logo` + `color` — so `avatar` maps
// to `logo.default` and `header` is left empty here.)
export const toOrganizationData = (info: Organization | undefined, address: string | undefined): OrganizationData => ({
  ...info,
  address: info?.address ?? address,
  account: {
    name: info?.name ?? emptyMultilingual,
    description: info?.description ?? emptyMultilingual,
    avatar: info?.logo?.default ?? '',
    header: '',
  },
})

const useSaasOrganization = ({
  options,
}: {
  options?: Omit<UseQueryOptions<Organization>, 'queryKey' | 'queryFn'>
} = {}) => {
  const { currentAddress } = useAuth()
  const { client } = useApiClient()

  return useQuery({
    queryKey: QueryKeys.organization.info(currentAddress),
    refetchOnWindowFocus: false,
    // `enabled` already gates on the address, but keep the guard local so a manual
    // `refetch()` before the address resolves fails loudly instead of hitting the API
    // with "undefined" in the path.
    queryFn: () => {
      if (!currentAddress) {
        throw new Error('No organization address selected')
      }
      return client.organizations.get(currentAddress)
    },
    enabled: !!currentAddress,
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
  const { currentAddress } = useAuth()
  const { data: info, refetch, isLoading, isError, error } = useSaasOrganization(options)

  const refetchAccount = useCallback(() => {
    refetch()
  }, [refetch])

  const organization = toOrganizationData(info, currentAddress)

  return { organization, refetchAccount, isLoading, isError, error }
}

const SaasAccountContext = createContext<ReturnType<typeof useSaasAccountProvider> | undefined>(undefined)

export const SaasAccountProvider = ({ children }: { children: ReactNode }) => {
  const saasAcount = useSaasAccountProvider()
  return <SaasAccountContext.Provider value={saasAcount}>{children}</SaasAccountContext.Provider>
}

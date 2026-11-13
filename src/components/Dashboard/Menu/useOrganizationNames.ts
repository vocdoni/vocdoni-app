import { useQueries } from '@tanstack/react-query'
import { organizationQueryKeys } from '@vocdoni/react-providers'
import { useCallback } from 'react'
import { useApiClient } from '~src/providers/ApiClientProvider'

/**
 * Resolves display names for the given organization addresses from the SAAS API, falling back to
 * the raw address when a name can't be fetched. Shared by the sidebar OrganizationSwitcher and the
 * integrator switch-org modal.
 *
 * One query per address, under the key the rest of the app reads organizations through, so a name
 * reuses an organization that is already cached and a fetched one is reused in turn.
 */
export const useOrganizationNames = (addresses: string[]) => {
  const { client } = useApiClient()
  const signature = addresses.join(',')

  // Stable between renders for the same addresses, so `combine` is not re-run on every one of them
  // and the `names` object keeps its identity while nothing changed.
  const combine = useCallback(
    (results: { data?: { name?: { default?: string } }; isPending: boolean }[]) => {
      const names: Record<string, string> = {}
      results.forEach((result, index) => {
        if (!result.isPending) names[addresses[index]] = result.data?.name?.default || addresses[index]
      })
      return { data: names, isPending: results.some((result) => result.isPending) }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [signature]
  )

  return useQueries({
    queries: addresses.map((address) => ({
      queryKey: organizationQueryKeys.organization(address),
      queryFn: () => client.organizations.get(address),
      // A name only needs to exist: never refetch an organization the dashboard already holds from here
      staleTime: Infinity,
      // A name that can't be read falls back to the address, so don't hold the switcher on retries
      retry: false,
    })),
    combine,
  })
}

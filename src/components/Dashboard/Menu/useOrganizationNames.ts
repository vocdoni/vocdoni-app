import { useQuery } from '@tanstack/react-query'
import { useClient } from '@vocdoni/react-components'
import { QueryKeys } from '~src/queries/keys'

/**
 * Resolves on-chain display names for the given organization addresses, falling back to the raw
 * address when a name can't be fetched. Shared by the sidebar OrganizationSwitcher and the
 * integrator switch-org modal.
 */
export const useOrganizationNames = (addresses: string[]) => {
  const { client } = useClient()

  return useQuery({
    queryKey: [...QueryKeys.organization.names, ...addresses],
    queryFn: async () => {
      const names: Record<string, string> = {}
      for (const address of addresses) {
        try {
          const data = await client.fetchAccountInfo(address)
          names[address] = data?.account?.name?.default || address
        } catch (error) {
          console.error('Error fetching organization name:', error)
          names[address] = address
        }
      }
      return names
    },
    enabled: addresses.length > 0,
  })
}

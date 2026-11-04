import { useQuery } from '@tanstack/react-query'
import { useOrganization } from '@vocdoni/react-components'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import type { GroupMembers } from '~src/queries/groups'
import type { Member } from '~src/queries/members'
import { QueryKeys } from '~src/queries/keys'

/**
 * Fetches the full member records for a set of member IDs within a group, paging
 * through the backend 100 members at a time until every requested ID is found.
 * Enabled only when a bucket is opened or a CSV download is triggered.
 */
export const useBucketMembers = (groupId: string | undefined, ids: string[], enabled: boolean) => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const address = organization?.address

  return useQuery({
    enabled: enabled && !!address && !!groupId && ids.length > 0,
    queryKey: [...QueryKeys.organization.groups(address), groupId, 'certificate-bucket-members'],
    staleTime: 60_000,
    queryFn: async (): Promise<Map<string, Partial<Member>>> => {
      const result = new Map<string, Partial<Member>>()
      const baseUrl = ApiEndpoints.OrganizationGroupMembers.replace('{address}', address!).replace(
        '{groupId}',
        groupId!
      )
      const wanted = new Set(ids)
      let page = 1

      while (true) {
        const data = await bearedFetch<GroupMembers>(`${baseUrl}?page=${page}&limit=100`)
        for (const member of data.members) {
          if (member.id && wanted.has(member.id)) result.set(member.id, member)
        }
        const { currentPage, lastPage } = data.pagination
        const allFound = [...wanted].every((id) => result.has(id))
        if (currentPage >= lastPage || allFound) break
        page++
      }

      return result
    },
  })
}

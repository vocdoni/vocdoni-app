import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import type { VotingProcessListResponse, VotingProcessResponse } from '@vocdoni/api-types'
import { useOrganization } from '@vocdoni/react-components'
import { useAuth } from '~components/Auth/useAuth'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { QueryKeys } from './keys'
import { draftsQuery, paginatedElectionsQuery } from './organization'

/**
 * How many processes the list loads per request. The API has no search or sort, so the list
 * searches and sorts what it has loaded: one page covers almost every organization, and bigger
 * ones get a "load more".
 */
export const PROCESS_LIST_PAGE_SIZE = 100

const nextPage = (last: VotingProcessListResponse) => last.pagination?.nextPage ?? undefined

/** Every published process of the organization, loaded a page of 100 at a time. */
export const usePublishedProcesses = () => {
  const { currentAddress } = useAuth()
  const { client } = useApiClient()
  const queryClient = useQueryClient()

  return useInfiniteQuery({
    // Under the organization's elections key prefix, so invalidating its elections refreshes it
    queryKey: [...QueryKeys.organization.elections(currentAddress).slice(0, 3), 'list'],
    enabled: !!currentAddress,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      paginatedElectionsQuery(
        currentAddress,
        client,
        { page: pageParam, limit: PROCESS_LIST_PAGE_SIZE },
        queryClient
      ).queryFn(),
    getNextPageParam: nextPage,
  })
}

/**
 * The organization's drafts. Listing them needs a Manager/Admin session: a viewer's 401 is
 * reported through `isError`, and the list shows no drafts rather than an error.
 */
export const useDraftProcesses = () => {
  const { organization } = useOrganization()
  const { client } = useApiClient()

  return useInfiniteQuery({
    queryKey: [...QueryKeys.organization.drafts(organization?.address), 'list'],
    enabled: !!organization?.address,
    retry: false,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      draftsQuery(organization?.address, client, { page: pageParam, limit: PROCESS_LIST_PAGE_SIZE }).queryFn(),
    getNextPageParam: nextPage,
  })
}

export const flattenPages = (pages?: VotingProcessListResponse[]): VotingProcessResponse[] =>
  pages?.flatMap((page) => page.processes ?? []) ?? []

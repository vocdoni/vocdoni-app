import { useMutation, useQueries, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query'
import { VocdoniApiError } from '@vocdoni/api-client'
import type { VotingProcessResponse, VotingProcessResultsResponse } from '@vocdoni/api-types'
import { useOrganization } from '@vocdoni/react-components'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '~components/Auth/useAuth'
import { clearStoredDraftId } from '~components/Process/Create/draft-storage'
import { useToast } from '~components/Toast'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { sameAddress } from '~utils/address'
import { useProfile } from './account'
import { QueryKeys } from './keys'

// The API's page cap (saas-backend apicommon: default 10, max 100).
const VOTES_PAGE_LIMIT = 100
// 5,000 processes: past that the list needs server-side filters, not more round trips.
const VOTES_MAX_PAGES = 50
// An open list learns about a pause, an early end or a draft made elsewhere (window focus does not refetch).
const VOTES_REFRESH_MS = 60_000

/**
 * Every process of the organization, drafts included, in one cached array. The list API cannot filter by vote
 * state, count per state or sort, so the list derives all three on the client from the full set.
 * `published` is omitted on purpose: a manager then gets drafts too, which `published: false` + `status` cannot.
 */
export const useOrganizationVotes = () => {
  const { client } = useApiClient()
  const { organization } = useOrganization()
  const address = organization?.address

  return useQuery({
    queryKey: QueryKeys.organization.votes(address),
    enabled: !!address,
    // No stale time (the app default is 30 s): the list refetches on every visit, so a vote published or a draft saved
    // a moment ago shows at once. Filters are child routes of the same mounted page, so they never refetch.
    staleTime: 0,
    refetchInterval: VOTES_REFRESH_MS,
    queryFn: async ({ signal }) => {
      if (!address) throw new Error('Cannot list votes with no organization address selected')
      const processes: VotingProcessResponse[] = []
      let page: number | null = 1
      for (let count = 0; page && count < VOTES_MAX_PAGES; count++) {
        // The SDK's list takes no signal: stop between pages once the query is cancelled (another organization).
        signal.throwIfAborted()
        const response = await client.elections.list({ orgAddress: address, page, limit: VOTES_PAGE_LIMIT })
        processes.push(...response.processes)
        const next: number | null = response.pagination.nextPage
        page = next && next > page ? next : null
      }
      return processes
    },
  })
}

/**
 * Marks the votes list stale. Call it after anything that adds or changes a process behind the list's back: a
 * publish, a draft save and the header actions.
 */
export const useInvalidateVotes = () => {
  const queryClient = useQueryClient()
  return useCallback(() => queryClient.invalidateQueries({ queryKey: QueryKeys.organization.votesAll }), [queryClient])
}

/** Final tallies never change, so once every question's are final the read stays fresh for good. */
export const resultsStaleTime = (data: VotingProcessResultsResponse | null | undefined): number =>
  data?.questions.length && data.questions.every((question) => question.finalResults) ? Infinity : 30_000

/**
 * Results of the given processes, read through the same query the vote page's ElectionProvider observes (same key,
 * same 404-as-null). Callers pass only the rows on screen that show a figure.
 */
export const useVotesResults = (processIds: readonly string[]) => {
  const { client } = useApiClient()
  // Stable for a given id list, so the combined map keeps its identity between renders and memos below hold.
  const combine = useCallback(
    (queries: UseQueryResult<VotingProcessResultsResponse | null>[]) =>
      Object.fromEntries(queries.map((query, index) => [processIds[index], query.data])) as Record<
        string,
        VotingProcessResultsResponse | null | undefined
      >,
    [processIds]
  )

  return useQueries({
    queries: processIds.map((id) => ({
      queryKey: QueryKeys.election.results(id),
      queryFn: () =>
        client.elections.getResults(id).catch((error: unknown) => {
          if (error instanceof VocdoniApiError && error.status === 404) return null
          throw error
        }),
      staleTime: (query: { state: { data?: VotingProcessResultsResponse | null } }) =>
        resultsStaleTime(query.state.data),
    })),
    combine,
  })
}

/** Deletes a draft; moved here from the old drafts page. Refreshes the votes list. */
export const useDeleteDraft = () => {
  const { t } = useTranslation()
  const { client } = useApiClient()
  const { organization } = useOrganization()
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation<void, unknown, { draftId: string; silent?: boolean }>({
    mutationFn: ({ draftId }) => client.elections.delete(draftId),
    onSuccess: (_data, variables) => {
      // Only forget the resumable draft pointer once the server deleted it, and only when it points at this draft
      clearStoredDraftId(organization?.address, variables.draftId)
      if (!variables.silent) {
        toast({
          title: t('drafts.deleted_draft', { defaultValue: 'Draft deleted successfully' }),
          type: 'success',
          duration: 3000,
          closable: true,
        })
      }
      void queryClient.invalidateQueries({ queryKey: QueryKeys.organization.votesAll })
    },
    onError: (error, variables) => {
      if (variables.silent) return
      console.error('Draft deletion failed', error)
      toast({
        title: t('votes.list.delete_error', { defaultValue: 'The draft could not be deleted' }),
        description: t('votes.error.other', { defaultValue: 'Something went wrong. Reload the page and try again.' }),
        type: 'error',
        duration: 7000,
        closable: true,
      })
    },
  })
}

/**
 * Whether the current user may change a vote of the selected organization: admins and managers (the roles with
 * `processWritePermission`). Other roles see states without buttons. False until the profile loads.
 * Call it once per screen (the actions provider and the list page), never per button or row: every `useProfile`
 * instance runs its own connection-retry effect.
 */
export const useCanManageVotes = () => {
  const { currentAddress } = useAuth()
  const { data: profile } = useProfile()
  const membership = profile?.organizations.find((org) => sameAddress(org.organization.address, currentAddress))
  const role = membership?.role.toLowerCase()
  return role === 'admin' || role === 'manager'
}

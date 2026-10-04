import { useQuery } from '@tanstack/react-query'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { usePublicLanguage } from '~i18n/usePublicLanguage'
import { processTitle } from '~components/Process/List/organize'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { useAllGroups, useGroup } from '~src/queries/groups'
import { QueryKeys } from '~src/queries/keys'
import { useVoteGroupMarkers } from '~src/queries/voteGroups'
import { everyoneTitle } from './labels'
import { resolveCensus } from './model'
import { useAllVotes } from './useCensusIndex'

export type CensusDetailTarget = { kind: 'saved' | 'vote'; groupId?: string; processId?: string }

/** One process as `GET /processes/{id}` returns it, shared with the vote page's ElectionProvider cache. */
export const useProcess = (processId?: string) => {
  const { client } = useApiClient()
  return useQuery<VotingProcessResponse, Error>({
    queryKey: QueryKeys.election.process(processId),
    queryFn: () => client.elections.get(processId!),
    enabled: !!processId,
    refetchOnWindowFocus: false,
  })
}

/**
 * Everything a census page needs to know about the census it shows: which group backs it, which vote
 * owns it, how many people it has, and whether and how it can be edited.
 */
export const useResolvedCensus = ({ kind, groupId: savedGroupId, processId }: CensusDetailTarget) => {
  const { t } = useTranslation()
  const language = usePublicLanguage()
  const groups = useAllGroups()
  const { all: processes, complete: votesComplete } = useAllVotes()
  const { markers, ready: markersReady } = useVoteGroupMarkers()
  const process = useProcess(kind === 'vote' ? processId : undefined)

  const groupsById = useMemo(() => new Map((groups.data ?? []).map((group) => [group.id, group])), [groups.data])
  const everyoneId = groups.data?.find((group) => group.isAutoGroup)?.id

  // First without the group, to learn which group a vote's census lives in
  const preliminary = resolveCensus({
    kind,
    group: savedGroupId ? groupsById.get(savedGroupId) : undefined,
    process: process.data,
    everyoneId,
    markers,
    groupsById,
    processes,
  })
  const groupId = kind === 'saved' ? savedGroupId : preliminary.groupId
  const group = useGroup(groupId)

  const resolved = useMemo(
    () =>
      resolveCensus({
        kind,
        group: group.data ?? (groupId ? groupsById.get(groupId) : undefined),
        process: process.data,
        everyoneId,
        markers,
        groupsById,
        processes,
      }),
    [kind, group.data, groupId, groupsById, process.data, everyoneId, markers, processes]
  )

  const title =
    resolved.kind === 'everyone'
      ? everyoneTitle(t)
      : kind === 'vote'
        ? process.data
          ? processTitle(process.data, language)
          : ''
        : (group.data?.title ?? (groupId ? groupsById.get(groupId)?.title : '') ?? '')

  const waitingForGroup = !!groupId && group.isLoading
  return {
    ...resolved,
    title,
    group: group.data,
    marker: groupId ? markers.get(groupId) : undefined,
    markers,
    /** Every vote is loaded, so `sharedWith` is the full list of votes using it */
    votesComplete,
    isLoading: groups.isLoading || !markersReady || (kind === 'vote' ? process.isLoading : false) || waitingForGroup,
    error: (kind === 'vote' ? process.error : group.error) ?? groups.error,
  }
}

export type ResolvedCensusState = ReturnType<typeof useResolvedCensus>

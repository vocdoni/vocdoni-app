import { useQueryClient } from '@tanstack/react-query'
import { useOrganization } from '@vocdoni/react-components'
import { useCallback, useState } from 'react'
import { useAuth } from '~components/Auth/useAuth'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { CENSUS_REMOVAL_MAX, useRemoveCensusParticipants } from '~src/queries/census'
import { censusJobIdsOf, useUpdateGroupWithReport } from '~src/queries/groups'
import { QueryKeys } from '~src/queries/keys'
import { useInvalidateMembers } from '~src/queries/members'
import { ADD_CHUNK_SIZE, chunk, GROUP_REMOVE_CHUNK_SIZE, removeInChunks } from './censusEdits'
import type { ResolvedCensusState } from './useResolvedCensus'

/** How long to wait for a vote's on-chain voter limit to grow after adding people. */
const RESIZE_TIMEOUT = 5 * 60 * 1000

export type EditProgress = { done: number; total: number; phase: 'sending' | 'updating_vote' }

/**
 * Adds and removes people in a census, the way its kind requires: through its group (saved censuses,
 * a vote's own census, a shared saved census), or through the vote's census itself (a published vote
 * whose people were picked one by one). Batches big changes, and waits for the vote's voter limit to
 * grow after an addition so the new people can vote straight away.
 */
export const useCensusEditor = (census: Pick<ResolvedCensusState, 'edit' | 'groupId' | 'process'>) => {
  const { client } = useApiClient()
  const { currentAddress } = useAuth()
  const { organization } = useOrganization()
  const queryClient = useQueryClient()
  const updateGroup = useUpdateGroupWithReport()
  const removeParticipants = useRemoveCensusParticipants()
  const invalidateMembers = useInvalidateMembers()
  const [progress, setProgress] = useState<EditProgress | null>(null)
  const { edit, groupId } = census
  const processId = census.process?.id

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: QueryKeys.organization.groups(organization?.address) })
    if (processId) queryClient.invalidateQueries({ queryKey: QueryKeys.election.process(processId) })
    // The vote lists carry each census' size
    queryClient.invalidateQueries({ queryKey: QueryKeys.organization.elections(currentAddress).slice(0, 3) })
    queryClient.invalidateQueries({ queryKey: QueryKeys.organization.drafts(organization?.address) })
    invalidateMembers()
  }, [queryClient, organization?.address, processId, currentAddress, invalidateMembers])

  const waitForJobs = useCallback(
    async (jobIds: string[]) => {
      for (const jobId of jobIds) await client.jobs.waitFor(jobId, { timeoutMs: RESIZE_TIMEOUT })
    },
    [client]
  )

  /** Adds people; resolves with how many the census gained (people already in it are skipped). */
  const add = useCallback(
    async (ids: string[]) => {
      if (!ids.length) return 0
      let done = 0
      let added = 0
      const jobs: string[] = []
      setProgress({ done, total: ids.length, phase: 'sending' })
      try {
        for (const part of chunk(ids, ADD_CHUNK_SIZE)) {
          if (edit === 'group' && groupId) {
            jobs.push(...censusJobIdsOf(await updateGroup.mutateAsync({ groupId, body: { addMembers: part } })))
            added += part.length
          } else if (edit === 'process' && processId) {
            const response = await client.elections.addCensusMembers(processId, part)
            if (response.jobId) jobs.push(response.jobId)
            added += response.added
          } else throw new Error('This census is read-only')
          done += part.length
          setProgress({ done, total: ids.length, phase: 'sending' })
        }
        if (jobs.length) {
          setProgress({ done, total: ids.length, phase: 'updating_vote' })
          await waitForJobs(jobs)
        }
        return added
      } finally {
        setProgress(null)
        refresh()
      }
    },
    [edit, groupId, processId, updateGroup, client, waitForJobs, refresh]
  )

  /** Removes people, all or nothing per batch: see `removeInChunks`. */
  const remove = useCallback(
    async (ids: string[]) => {
      setProgress({ done: 0, total: ids.length, phase: 'sending' })
      try {
        if (edit === 'group' && groupId)
          return await removeInChunks(
            ids,
            async (part) => {
              await updateGroup.mutateAsync({ groupId, body: { removeMembers: part } })
              return part.length
            },
            GROUP_REMOVE_CHUNK_SIZE
          )
        if (edit === 'process' && processId)
          return await removeInChunks(
            ids,
            async (part) => (await removeParticipants.mutateAsync({ processId, memberIds: part }))?.removed ?? 0,
            CENSUS_REMOVAL_MAX
          )
        throw new Error('This census is read-only')
      } finally {
        setProgress(null)
        refresh()
      }
    },
    [edit, groupId, processId, updateGroup, removeParticipants, refresh]
  )

  return { add, remove, progress, busy: progress !== null }
}

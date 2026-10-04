import type { CreateVotingProcessRequest } from '@vocdoni/api-types'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { useAllGroups } from '~src/queries/groups'
import { useVoteGroupApi, voteGroupDescription } from '~src/queries/voteGroups'
import type { Process } from '../common'
import { buildCensusSpec, useFormToVotingProcessRequest } from '../request'
import { planPublishCensus, preparePublishCensus } from './freeze'
import { voteGroupTitle } from './useCensusAttach'
import { hasSignIn } from './useCensusFacts'
import { writeWithLatest } from './voteGroup'

type RunExclusive = <T>(write: () => Promise<T>) => Promise<T>

/**
 * The census step of publishing, run right before it: a draft that follows Everyone is frozen with
 * the people in it now, and one that follows a group it doesn't own gets its own copy. The draft is
 * repointed with a conditional write (its latest `updatedAt`), in the draft saver's queue. Resolves
 * with the group the draft follows afterwards, or `null` when nothing changed. Throws when the
 * census couldn't be prepared: then nothing is published.
 */
export const usePublishCensus = (
  runExclusive: RunExclusive,
  versions: {
    seenVersion: (processId: string) => Promise<string | undefined>
    learnVersion: (processId: string) => Promise<void>
  }
) => {
  const { t, i18n } = useTranslation()
  const api = useVoteGroupApi()
  const { client } = useApiClient()
  const groups = useAllGroups()
  const toRequest = useFormToVotingProcessRequest()

  return useCallback(
    async (processId: string, form: Process) => {
      if (!api) throw new Error('No organization')
      // Read fresh: a stale cache could take this vote's own census for someone else's
      const [markers, list, testVote] = await Promise.all([
        api.markers(),
        groups.data ? Promise.resolve(groups.data) : groups.refetch().then((result) => result.data ?? []),
        api.testVote(),
      ])
      // Test people never vote in a real vote: an Everyone census is frozen without them
      const leaveOut = testVote && !testVote.processIds.includes(processId) ? testVote.memberIds : []
      const everyoneId = list.find((group) => group.isAutoGroup)?.id
      const plan = planPublishCensus({
        processId,
        groupId: form.groupId,
        everyoneId,
        markers,
        groupTitle: list.find((group) => group.id === form.groupId)?.title,
      })
      if (plan.kind === 'keep') return null
      // Without a sign-in the group isn't sent at all (see `buildCensusSpec`): never freeze into nothing
      if (!hasSignIn(form.census)) throw new Error('Set up how members sign in first')

      const vote = form.title?.trim() || ''
      const repoint = (groupId: string) =>
        runExclusive(() =>
          writeWithLatest(
            () => versions.seenVersion(processId),
            async (updatedAt) => {
              const next = { ...form, groupId }
              const body = { ...toRequest(next, buildCensusSpec(next)), ...(updatedAt ? { updatedAt } : {}) }
              await client.elections.update(processId, body as CreateVotingProcessRequest)
              await versions.learnVersion(processId)
            }
          )
        )

      return preparePublishCensus(api, plan, {
        processId,
        title: voteGroupTitle(t, vote, i18n.resolvedLanguage),
        description: voteGroupDescription(t, vote),
        repoint,
        leaveOut,
      })
    },
    [api, groups, client, toRequest, runExclusive, versions, t, i18n.resolvedLanguage]
  )
}

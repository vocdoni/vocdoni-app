import type { VoteGroupApi, VoteGroupMarker } from '~src/queries/voteGroups'
import { attachCensus } from './attach'
import { createVoteGroup, type Repoint } from './voteGroup'

/** What has to happen to a draft's census right before it's published. */
export type PublishCensusPlan =
  /** It follows Everyone (or an earlier snapshot of it): freeze who's in now */
  | { kind: 'freeze'; replacing?: string }
  /** It follows a group it doesn't own (a saved census, an older draft): give it its own copy */
  | { kind: 'copy'; groupId: string; name: string }
  /** It has its own census already, or none to work on */
  | { kind: 'keep' }

/**
 * Decides what publishing does to the census. A snapshot this vote already owns means an earlier
 * publish froze Everyone and then failed: it's frozen again, fresh, and the old snapshot replaced.
 */
export const planPublishCensus = ({
  processId,
  groupId,
  everyoneId,
  markers,
  groupTitle,
}: {
  processId: string
  groupId?: string
  everyoneId?: string
  markers: Map<string, VoteGroupMarker>
  /** The name of the group, when it's a saved census */
  groupTitle?: string
}): PublishCensusPlan => {
  if (!groupId) return { kind: 'keep' }
  if (everyoneId && groupId === everyoneId) return { kind: 'freeze' }
  const marker = markers.get(groupId)
  if (marker?.processId === processId)
    return marker.kind === 'snapshot' ? { kind: 'freeze', replacing: groupId } : { kind: 'keep' }
  return { kind: 'copy', groupId, name: groupTitle ?? '' }
}

export type FreezeInput = {
  processId: string
  title: string
  description: string
  repoint: Repoint
  /** An earlier snapshot of this vote, deleted once the new one is in place */
  replacing?: string
  now?: () => Date
}

/**
 * Freezes an Everyone census: a group holding every member's id as of now (`includeAllMembers`),
 * marked as this vote's snapshot, which the draft then points at. Resolves with its id.
 */
export const freezeEveryone = (api: VoteGroupApi, input: FreezeInput) =>
  createVoteGroup(api, {
    processId: input.processId,
    kind: 'snapshot',
    group: { title: input.title, description: input.description, includeAllMembers: true },
    repoint: input.repoint,
    replacing: input.replacing,
    now: input.now,
  })

/**
 * Runs a publish plan. Resolves with the group the draft points at afterwards, or `null` when it was
 * left as it was.
 */
export const preparePublishCensus = async (
  api: VoteGroupApi,
  plan: PublishCensusPlan,
  input: Omit<FreezeInput, 'replacing'>
) => {
  if (plan.kind === 'freeze') return freezeEveryone(api, { ...input, replacing: plan.replacing })
  if (plan.kind === 'copy') {
    const { groupId } = await attachCensus(api, {
      ...input,
      source: { kind: 'saved', groupId: plan.groupId, name: plan.name },
    })
    return groupId
  }
  return null
}

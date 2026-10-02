import type { VotingProcessResponse } from '@vocdoni/api-types'
import { organizeProcesses, type ProcessGroups } from '~components/Process/List/organize'
import { getProcessState, type ProcessState } from '~components/Process/processState'
import { type AffectedVote, votesFollowingGroup } from '~src/queries/affectedVotes'
import type { Group } from '~src/queries/groups'
import type { VoteGroupMarker } from '~src/queries/voteGroups'

/** Where a vote is in its life, drafts included. */
export type VoteState = ProcessState | 'draft'

export const voteStateOf = (process: VotingProcessResponse): VoteState =>
  process.published ? getProcessState(process) : 'draft'

/** A vote that's over: its census can't change any more. */
export const isEnded = (state?: VoteState) => state === 'ended' || state === 'canceled'

/**
 * Where a vote's voters come from:
 * - `everyone`: the census follows every member (the auto group), as votes did before each vote had its own;
 * - `copy` / `snapshot` / `test`: a census of its own (a vote-owned group, see `voteGroups.ts`);
 * - `saved`: a saved census shared with whatever else uses it (votes before each vote had its own);
 * - `selected`: people picked one by one, with no group behind them.
 */
export type CensusSource =
  | { kind: 'everyone' }
  | { kind: 'copy'; from?: string; groupId: string }
  | { kind: 'snapshot'; groupId: string }
  | { kind: 'test'; groupId: string }
  | { kind: 'saved'; group: Group }
  | { kind: 'selected' }

type SourceContext = {
  everyoneId?: string
  markers: Map<string, VoteGroupMarker>
  groupsById: Map<string, Group>
}

export const censusSourceOf = (process: VotingProcessResponse, context: SourceContext): CensusSource => {
  const groupId = process.census?.groupId
  if (!groupId) return { kind: 'selected' }
  if (groupId === context.everyoneId) return { kind: 'everyone' }
  const marker = context.markers.get(groupId)
  if (marker?.kind === 'copy') return { kind: 'copy', from: marker.from, groupId }
  if (marker?.kind === 'snapshot') return { kind: 'snapshot', groupId }
  if (marker?.kind === 'test') return { kind: 'test', groupId }
  const group = context.groupsById.get(groupId)
  if (group?.isAutoGroup) return { kind: 'everyone' }
  // A group we can't find (deleted since) behaves like picked people: nothing to browse but the vote
  return group ? { kind: 'saved', group } : { kind: 'selected' }
}

/** Whether a census is edited through its group (`PUT /groups/{id}`), and which one. */
export const sourceGroupId = (source: CensusSource) => {
  switch (source.kind) {
    case 'copy':
    case 'snapshot':
    case 'test':
      return source.groupId
    case 'saved':
      return source.group.id
    default:
      return undefined
  }
}

export type SavedCensusRow = {
  group: Group
  /** The votes whose census is this saved census (shared, as before each vote had its own) */
  usedBy: AffectedVote[]
}

export type CensusIndex = {
  everyone?: Group
  votes: ProcessGroups
  saved: SavedCensusRow[]
  /** Saved censuses plus votes: the Censuses tab count */
  total: number
}

export const buildCensusIndex = ({
  groups,
  published,
  drafts,
  markers,
  language,
}: {
  groups: Group[]
  published: VotingProcessResponse[]
  drafts: VotingProcessResponse[]
  markers: Map<string, VoteGroupMarker>
  language: string
}): CensusIndex => {
  const everyone = groups.find((group) => group.isAutoGroup)
  const votes = organizeProcesses({ published, drafts, language })
  const all = [...published, ...drafts]
  const saved = groups
    .filter((group) => !group.isAutoGroup && !markers.has(group.id))
    .sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))
    .map((group) => ({ group, usedBy: votesFollowingGroup(all, group.id) }))
  const voteCount = votes.live.length + votes.scheduled.length + votes.drafts.length + votes.closed.length

  return { everyone, votes, saved, total: saved.length + voteCount }
}

/** Votes a saved census is used by that are already published (deleting it would empty them). */
export const publishedUsers = (usedBy: AffectedVote[]) => usedBy.filter((vote) => vote.state !== 'draft')

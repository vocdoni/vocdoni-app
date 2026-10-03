import type { VotingProcessResponse } from '@vocdoni/api-types'
import { organizeProcesses, type ProcessGroups } from '~components/Process/List/organize'
import { getProcessState, type ProcessState } from '~components/Process/processState'
import { type AffectedVote, votesFollowingGroup } from '~src/queries/affectedVotes'
import type { Group } from '~src/queries/groups'
import { copySourceName, type VoteGroupMarker, type VoteGroupSource } from '~src/queries/voteGroups'

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
  | { kind: 'copy'; from?: string; source?: VoteGroupSource; groupId: string }
  | { kind: 'snapshot'; groupId: string }
  | { kind: 'test'; groupId: string }
  | { kind: 'saved'; group: Group }
  | { kind: 'selected' }

type SourceContext = {
  everyoneId?: string
  markers: Map<string, VoteGroupMarker>
  groupsById: Map<string, Group>
  /** A vote's title, to name the vote a copy came from */
  voteTitle?: (processId: string) => string | undefined
}

export const censusSourceOf = (process: VotingProcessResponse, context: SourceContext): CensusSource => {
  const groupId = process.census?.groupId
  if (!groupId) return { kind: 'selected' }
  if (groupId === context.everyoneId) return { kind: 'everyone' }
  const marker = context.markers.get(groupId)
  if (marker?.kind === 'copy')
    return { kind: 'copy', from: copySourceName(marker, context), source: marker.source, groupId }
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

/** What a census page shows: a saved census, Everyone, or a vote's census. */
export type CensusKind = 'saved' | 'everyone' | 'vote'

/** Why people can't be added or removed here. */
export type ReadOnlyReason = 'everyone' | 'ended' | 'follows_everyone' | 'draft_selected' | 'draft_saved'

/**
 * How people are added and removed:
 * - `group`: through the census' group (`PUT /groups/{id}`);
 * - `process`: through the vote's census itself (`PUT`/`DELETE /processes/{id}/census`), for votes
 *   published before each vote had its own census: people picked one by one, Everyone, or a saved
 *   census shared with other votes (whose group is left alone);
 * - `none`: read-only (see `ReadOnlyReason`).
 */
export type EditPath = 'group' | 'process' | 'none'

export type ResolvedCensus = {
  kind: CensusKind
  /** The group behind the list and the edits, if any */
  groupId?: string
  process?: VotingProcessResponse
  state?: VoteState
  source?: CensusSource
  /** People, or the vote's voters */
  count: number
  /** The count is the on-chain number of voters of a closed vote */
  atClose: boolean
  /** Show the people as a list (a group), or only a point lookup (no list to read) */
  browse: 'group' | 'lookup'
  edit: EditPath
  readOnly?: ReadOnlyReason
  /** The votes that share this census' group: for a saved census, and for a vote using a saved one */
  sharedWith: AffectedVote[]
}

export const resolveCensus = ({
  kind,
  group,
  process,
  everyoneId,
  markers,
  groupsById,
  processes,
}: {
  kind: 'saved' | 'vote'
  /** The saved census, or the vote's group once known */
  group?: { id: string; isAutoGroup?: boolean; memberIds?: string[]; membersCount?: number }
  process?: VotingProcessResponse
  everyoneId?: string
  markers: Map<string, VoteGroupMarker>
  groupsById: Map<string, Group>
  /** Every vote, to find the ones sharing a group */
  processes: VotingProcessResponse[]
}): ResolvedCensus => {
  const size = (entry?: typeof group) =>
    entry ? (entry.isAutoGroup ? (entry.membersCount ?? 0) : (entry.memberIds?.length ?? entry.membersCount ?? 0)) : 0

  if (kind === 'saved') {
    if (group?.isAutoGroup)
      return {
        kind: 'everyone',
        groupId: group.id,
        count: size(group),
        atClose: false,
        browse: 'group',
        edit: 'none',
        readOnly: 'everyone',
        sharedWith: votesFollowingGroup(processes, group.id),
      }
    return {
      kind: 'saved',
      groupId: group?.id,
      count: size(group),
      atClose: false,
      browse: 'group',
      edit: 'group',
      sharedWith: votesFollowingGroup(processes, group?.id),
    }
  }

  const state = process ? voteStateOf(process) : undefined
  const source = process ? censusSourceOf(process, { everyoneId, markers, groupsById }) : undefined
  // Published before each vote had its own census, following Everyone or a saved census other votes
  // share: edited through the vote's own census, so a change here never reaches those other votes
  const legacy = !!process?.published && (source?.kind === 'everyone' || source?.kind === 'saved')
  const groupId = source && !legacy ? sourceGroupId(source) : undefined
  const maxVoters = process?.questions?.[0]?.results?.maxVoters
  const atClose = isEnded(state) && typeof maxVoters === 'number' && maxVoters > 0
  const count = atClose ? maxVoters! : (process?.census?.size ?? size(group))

  let edit: EditPath = 'none'
  let readOnly: ReadOnlyReason | undefined
  if (isEnded(state)) readOnly = 'ended'
  else if (legacy) edit = 'process'
  else if (source?.kind === 'everyone') readOnly = 'follows_everyone'
  // A draft still on a shared saved census (from before drafts got their own copy, or not copied
  // yet): editing its group would change the saved census for every vote using it. The editor
  // gives the draft its own copy when it opens.
  else if (source?.kind === 'saved') readOnly = 'draft_saved'
  else if (groupId) edit = 'group'
  else if (process?.published) edit = 'process'
  else readOnly = 'draft_selected'

  return {
    kind: 'vote',
    groupId,
    process,
    state,
    source,
    count,
    atClose,
    browse: groupId ? 'group' : 'lookup',
    edit,
    readOnly,
    sharedWith: source?.kind === 'saved' && groupId ? votesFollowingGroup(processes, groupId) : [],
  }
}

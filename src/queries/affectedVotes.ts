import type { VotingProcessResponse } from '@vocdoni/api-types'
import { getElectionTitle } from '@vocdoni/react-components'
import { useMemo } from 'react'
import { getProcessState } from '~components/Process/processState'
import { useAllGroups } from './groups'
import { flattenPages, useDraftProcesses, usePublishedProcesses } from './processes'
import type { VoteGroupMarker } from './voteGroups'

export type AffectedVoteState = 'live' | 'scheduled' | 'draft' | 'closed'

export type AffectedVote = {
  id: string
  /** Empty for an untitled draft */
  title: string
  state: AffectedVoteState
}

const STATE_ORDER: AffectedVoteState[] = ['live', 'scheduled', 'draft', 'closed']

const stateOf = (process: VotingProcessResponse): AffectedVoteState => {
  if (!process.published) return 'draft'
  const state = getProcessState(process)
  if (state === 'live' || state === 'paused') return 'live'
  if (state === 'scheduled') return 'scheduled'
  return 'closed'
}

/** The votes among `processes` whose census follows the given group, live ones first. */
export const votesFollowingGroup = (processes: VotingProcessResponse[], groupId?: string): AffectedVote[] => {
  if (!groupId) return []
  const seen = new Set<string>()
  return processes
    .filter((process) => {
      if (process.census?.groupId !== groupId || seen.has(process.id)) return false
      seen.add(process.id)
      return true
    })
    .map((process) => ({ id: process.id, title: getElectionTitle(process) ?? '', state: stateOf(process) }))
    .sort((a, b) => STATE_ORDER.indexOf(a.state) - STATE_ORDER.indexOf(b.state))
}

/** A vote that copied a saved census into a census of its own, and when. */
export type CopyingVote = AffectedVote & { copiedAt: string }

/**
 * The votes that copied the given saved census into one of their own (their marker's `fromId`), live
 * ones first. A copy its vote no longer follows (replaced since) isn't listed: that vote has moved on.
 */
export const votesCopying = (
  processes: VotingProcessResponse[],
  markers: Map<string, VoteGroupMarker>,
  groupId?: string
): CopyingVote[] => {
  if (!groupId) return []
  const byId = new Map(processes.map((process) => [process.id, process]))
  const copies: CopyingVote[] = []
  markers.forEach((marker, copyId) => {
    if (marker.kind !== 'copy' || marker.fromId !== groupId) return
    const process = byId.get(marker.processId)
    if (!process || process.census?.groupId !== copyId) return
    copies.push({
      id: process.id,
      title: getElectionTitle(process) ?? '',
      state: stateOf(process),
      copiedAt: marker.createdAt,
    })
  })
  return copies.sort((a, b) => STATE_ORDER.indexOf(a.state) - STATE_ORDER.indexOf(b.state))
}

/**
 * The votes a change to the whole member list reaches: those whose census follows "Everyone" (the
 * auto group), published and drafts, split by state. Deleting a member removes them from these
 * (and from any other census they're in), so the confirmations name them.
 */
export const useAffectedVotes = () => {
  // All pages: "Everyone" may not be on the first
  const groups = useAllGroups()
  const everyone = groups.data?.find((group) => group.isAutoGroup)
  const published = usePublishedProcesses()
  const drafts = useDraftProcesses()

  const votes = useMemo(
    () =>
      votesFollowingGroup([...flattenPages(published.data?.pages), ...flattenPages(drafts.data?.pages)], everyone?.id),
    [published.data, drafts.data, everyone?.id]
  )

  return {
    votes,
    everyoneGroupId: everyone?.id,
    /** A live or scheduled vote follows Everyone: member changes reach real voters */
    hasActive: votes.some((vote) => vote.state === 'live' || vote.state === 'scheduled'),
    hasLive: votes.some((vote) => vote.state === 'live'),
    isLoading: groups.isLoading || published.isLoading,
  }
}

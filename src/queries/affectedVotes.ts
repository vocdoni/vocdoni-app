import type { VotingProcessResponse } from '@vocdoni/api-types'
import { getElectionTitle } from '@vocdoni/react-components'
import { useMemo } from 'react'
import { getProcessState } from '~components/Process/processState'
import { useGroups } from './groups'
import { flattenPages, useDraftProcesses, usePublishedProcesses } from './processes'

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

/**
 * The votes a change to the whole member list reaches: those whose census follows "Everyone" (the
 * auto group), published and drafts, split by state. Deleting a member removes them from these
 * (and from any other census they're in), so the confirmations name them.
 */
export const useAffectedVotes = () => {
  const groups = useGroups()
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

import { useQueries } from '@tanstack/react-query'
import type { ProcessParticipantEntry, VotingProcessResponse } from '@vocdoni/api-types'
import { getElectionTitle, useOrganization } from '@vocdoni/react-components'
import { useMemo } from 'react'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { lookupFieldsOf } from '~components/Process/Dashboard/View/VoterLookup'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { type Group, type GroupInfo, useAllGroups } from '~src/queries/groups'
import { QueryKeys } from '~src/queries/keys'
import type { Member } from '~src/queries/members'
import type { ProcessParticipantLookupField } from '~src/queries/participants'
import { useVoteGroupMarkers, type VoteGroupMarker } from '~src/queries/voteGroups'
import { voteStateOf } from '../Censuses/model'
import { useAllVotes } from '../Censuses/useCensusIndex'

/** How long what a person is in stays cached: it's read when their drawer opens, never polled. */
const STALE_TIME = 5 * 60 * 1000

/**
 * Censuses above this many people aren't read to see whether someone is in them: `GET /groups/{id}`
 * returns every member id, so a few big ones would weigh tens of MB on every drawer open.
 */
export const PERSON_CENSUS_READ_MAX = 5000

export type PersonVoteState = 'live' | 'scheduled' | 'draft'

export type PersonCensus =
  | {
      kind: 'vote'
      id: string
      title: string
      state: PersonVoteState
      /** The member details the vote signs in with */
      signInFields: string[]
    }
  | { kind: 'saved'; id: string; title: string }

export type Lookup = { field: ProcessParticipantLookupField; value: string }

/**
 * How to find a member among a vote's voters: by a detail the vote signs in with and the member has
 * (exact; emails lowercase). Never by phone: only a hash of it is known. Null when there's none.
 */
export const participantLookupFor = (
  member: Partial<Pick<Member, 'email' | 'memberNumber' | 'nationalId'>>,
  census?: VotingProcessResponse['census']
): Lookup | null => {
  for (const field of lookupFieldsOf(census)) {
    if (field === 'phone') continue
    const value = member[field]?.trim()
    if (value) return { field, value: field === 'email' ? value.toLowerCase() : value }
  }
  return null
}

/** Has nothing to be looked up by but a phone (or nothing at all). */
export const isPhoneOnly = (member: Partial<Pick<Member, 'email' | 'memberNumber' | 'nationalId'>>) =>
  !member.email?.trim() && !member.memberNumber?.trim() && !member.nationalId?.trim()

const runningState = (process: VotingProcessResponse): PersonVoteState | null => {
  const state = voteStateOf(process)
  if (state === 'live' || state === 'paused') return 'live'
  if (state === 'scheduled') return 'scheduled'
  return null
}

const signInFieldsOf = (process: VotingProcessResponse) => [
  ...new Set([...(process.census?.authFields ?? []), ...(process.census?.twoFaFields ?? [])]),
]

const ORDER: Record<PersonVoteState, number> = { live: 0, scheduled: 1, draft: 2 }

/**
 * Where a person can vote, from what's been read:
 * - live and scheduled votes where a participants lookup found them;
 * - drafts that follow Everyone, or whose group holds them;
 * - saved censuses (groups no vote owns) that hold them.
 * Closed votes are left out.
 */
export const buildPersonCensuses = ({
  memberId,
  published,
  drafts,
  found,
  groups,
  members,
  everyoneId,
  markers,
}: {
  memberId: string
  published: VotingProcessResponse[]
  drafts: VotingProcessResponse[]
  /** Per live or scheduled vote id, what its lookup returned */
  found: Map<string, ProcessParticipantEntry[] | undefined>
  groups: Group[]
  /** Per group id, its member ids */
  members: Map<string, string[] | undefined>
  everyoneId?: string
  markers: Map<string, VoteGroupMarker>
}): PersonCensus[] => {
  const votes: PersonCensus[] = []
  published.forEach((process) => {
    const state = runningState(process)
    if (!state) return
    if (!found.get(process.id)?.some((participant) => participant.memberId === memberId)) return
    votes.push({
      kind: 'vote',
      id: process.id,
      title: getElectionTitle(process) ?? '',
      state,
      signInFields: signInFieldsOf(process),
    })
  })
  drafts.forEach((process) => {
    const groupId = process.census?.groupId
    if (!groupId) return
    if (groupId !== everyoneId && !members.get(groupId)?.includes(memberId)) return
    votes.push({
      kind: 'vote',
      id: process.id,
      title: getElectionTitle(process) ?? '',
      state: 'draft',
      signInFields: signInFieldsOf(process),
    })
  })
  votes.sort((a, b) => (a.kind === 'vote' && b.kind === 'vote' ? ORDER[a.state] - ORDER[b.state] : 0))

  const saved: PersonCensus[] = groups
    .filter((group) => !group.isAutoGroup && !markers.has(group.id) && members.get(group.id)?.includes(memberId))
    .map((group) => ({ kind: 'saved', id: group.id, title: group.title }))

  return [...votes, ...saved]
}

/**
 * The votes and saved censuses a person is in ("In censuses" in their drawer). Read once per person
 * and cached for a few minutes; nothing is polled.
 */
export const usePersonCensuses = (member?: Member & { id: string }) => {
  const { client } = useApiClient()
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const address = organization?.address
  const enabled = !!member
  const votes = useAllVotes({ enabled })
  const groups = useAllGroups({ enabled })
  const { markers, ready: markersReady } = useVoteGroupMarkers()
  const everyoneId = groups.data?.find((group) => group.isAutoGroup)?.id
  const phoneOnly = member ? isPhoneOnly(member) : false

  const running = useMemo(() => votes.published.filter((process) => runningState(process)), [votes.published])
  const checks = running.map((process) => ({
    process,
    lookup: member && !phoneOnly ? participantLookupFor(member, process.census) : null,
  }))

  const lookups = useQueries({
    queries: checks.map(({ process, lookup }) => ({
      queryKey: QueryKeys.process.participants(process.id, lookup?.field, lookup?.value),
      queryFn: async () => (await client.elections.participants(process.id, lookup!)).participants,
      enabled: !!lookup,
      retry: false,
      staleTime: STALE_TIME,
      refetchOnWindowFocus: false,
    })),
  })

  // The groups whose member ids tell: drafts' own (or saved) groups, and the saved censuses, except
  // the big ones, only counted
  const { groupIds, tooBig } = useMemo(() => {
    if (!member) return { groupIds: [], tooBig: 0 }
    const ids = new Set<string>()
    votes.drafts.forEach((process) => {
      const groupId = process.census?.groupId
      if (groupId && groupId !== everyoneId) ids.add(groupId)
    })
    ;(groups.data ?? []).forEach((group) => {
      if (!group.isAutoGroup && !markers.has(group.id)) ids.add(group.id)
    })
    const sizes = new Map((groups.data ?? []).map((group) => [group.id, group.membersCount ?? 0]))
    const all = [...ids]
    const small = all.filter((id) => (sizes.get(id) ?? 0) <= PERSON_CENSUS_READ_MAX)
    return { groupIds: small, tooBig: all.length - small.length }
  }, [member, votes.drafts, groups.data, everyoneId, markers])

  const groupReads = useQueries({
    queries: groupIds.map((groupId) => ({
      // The same key as `useGroup`, so a census page and the drawer share what they read
      queryKey: [...QueryKeys.organization.groups(address), 'detail', groupId],
      queryFn: () =>
        bearedFetch<GroupInfo>(
          ApiEndpoints.OrganizationGroup.replace('{address}', address!).replace('{groupId}', groupId)
        ),
      enabled: !!address,
      staleTime: STALE_TIME,
      refetchOnWindowFocus: false,
    })),
  })

  const found = new Map(checks.map(({ process }, index) => [process.id, lookups[index]?.data]))
  const members = new Map(groupIds.map((groupId, index) => [groupId, groupReads[index]?.data?.memberIds]))
  const items = member
    ? buildPersonCensuses({
        memberId: member.id,
        published: votes.published,
        drafts: votes.drafts,
        found,
        groups: groups.data ?? [],
        members,
        everyoneId,
        markers,
      })
    : []

  return {
    items,
    /** Live and scheduled votes they're in: where a change to them reaches voters right away */
    running: items.filter(
      (item): item is Extract<PersonCensus, { kind: 'vote' }> =>
        item.kind === 'vote' && (item.state === 'live' || item.state === 'scheduled')
    ),
    /** Nothing but a phone to look them up by, so live votes can't be checked */
    phoneOnly: phoneOnly && running.length > 0,
    /** Live votes that sign in with details they don't have (or we can't look up) */
    unchecked: phoneOnly ? [] : checks.filter((check) => !check.lookup).map((check) => check.process),
    /** Saved censuses and drafts too big to read here, so not checked */
    tooBig,
    isLoading:
      votes.isLoading ||
      groups.isLoading ||
      !markersReady ||
      lookups.some((lookup) => lookup.isLoading) ||
      groupReads.some((read) => read.isLoading),
  }
}

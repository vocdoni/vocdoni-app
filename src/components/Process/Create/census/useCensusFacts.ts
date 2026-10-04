import { useQuery } from '@tanstack/react-query'
import { useOrganization } from '@vocdoni/react-components'
import { useMemo } from 'react'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { type Group, groupSize, useAllGroups, useGroup } from '~src/queries/groups'
import { QueryKeys } from '~src/queries/keys'
import { type CodeChannel, membersMissing, READINESS_STALE_TIME, unreachableAcross } from '~src/queries/members'
import { useVoteGroupMarkers, type VoteGroupMarker } from '~src/queries/voteGroups'
import type { Census } from '../common'
import { getTwoFaFields } from '../VoterAuthentication/utils'

/**
 * Where the draft's voters come from, as Who can vote shows it:
 * - `everyone`: Everyone, live until publish (also an earlier snapshot of this vote, frozen afresh
 *   at the next publish);
 * - `owned`: a census of this vote's own (a copy, or the test vote's people);
 * - `pending`: a group this vote doesn't own (a saved census opened from the Censuses tab, an older
 *   draft): it gets its own copy as soon as the draft exists, and at publish at the latest;
 * - `missing`: a group that doesn't exist any more;
 * - `loading`: not known yet.
 */
export type CensusMode = 'loading' | 'everyone' | 'owned' | 'pending' | 'missing'

export type CensusFacts = {
  mode: CensusMode
  everyone?: Group
  everyoneId?: string
  /** The marker of the draft's group, when it's this vote's own */
  marker?: VoteGroupMarker
  /** The draft's group, from the groups list */
  group?: Group
  /** The member ids of the draft's group (not for Everyone) */
  memberIds?: string[]
  /** How many people can vote */
  total: number
  totalKnown: boolean
  groups: Group[]
  markers: Map<string, VoteGroupMarker>
  ready: boolean
}

const NO_GROUPS: Group[] = []

/** What the editor knows about the census a draft points at. */
export const useCensusFacts = (groupId: string | undefined, draftId: string | null): CensusFacts => {
  const groups = useAllGroups()
  const { markers, ready: markersReady } = useVoteGroupMarkers()
  const list = groups.data ?? NO_GROUPS
  const groupsById = useMemo(() => new Map(list.map((group) => [group.id, group])), [list])
  const everyone = list.find((group) => group.isAutoGroup)
  const ready = groups.isSuccess && markersReady
  const marker = groupId ? markers.get(groupId) : undefined
  const ownMarker = marker && draftId && marker.processId === draftId ? marker : undefined

  let mode: CensusMode = 'loading'
  if (!groupId || (everyone && groupId === everyone.id)) mode = everyone || groups.isError ? 'everyone' : 'loading'
  else if (ownMarker) mode = ownMarker.kind === 'snapshot' ? 'everyone' : 'owned'
  else if (!ready) mode = 'loading'
  else mode = groupsById.has(groupId) ? 'pending' : 'missing'

  const detail = useGroup(mode === 'owned' || mode === 'pending' ? groupId : undefined)
  const group = groupId ? groupsById.get(groupId) : undefined
  const total =
    mode === 'everyone'
      ? (everyone?.membersCount ?? 0)
      : detail.data
        ? groupSize(detail.data)
        : (group?.membersCount ?? 0)
  const totalKnown = mode === 'everyone' ? !!everyone : !!detail.data || !!group

  return {
    mode,
    everyone,
    everyoneId: everyone?.id,
    marker: ownMarker,
    group,
    memberIds: detail.data?.memberIds,
    total,
    totalKnown,
    groups: list,
    markers,
    ready,
  }
}

/** Whether members have a way to sign in: details to type, or a code. */
export const hasSignIn = (census?: Census | null) => !!(census?.credentials?.length || census?.use2FA)

/** Email codes and nothing else to type: what Who can vote sets up when nothing is set up yet. */
export const EMAIL_SIGN_IN: Census = { credentials: [], use2FA: true, use2FAMethod: 'email' }

/** The code channels a sign-in uses. */
export const codeChannelsOf = (census?: Census | null): CodeChannel[] =>
  census?.use2FA && census.use2FAMethod ? (getTwoFaFields(census.use2FAMethod) as CodeChannel[]) : []

export type CodeBreakdown = {
  /** Get their code by email */
  email: number
  /** Get it by SMS (with both channels: those without an email but with a mobile) */
  sms: number
  /** Can't get a code at all */
  unreachable: number
}

/** How a census' people get their codes, from who lacks each channel. */
export const breakdownCodes = (
  total: number,
  channels: CodeChannel[],
  missing: Partial<Record<CodeChannel, string[]>>
): CodeBreakdown => {
  const missingEmail = missing.email ?? []
  const missingPhone = missing.phone ?? []
  const lists = channels.map((channel) => missing[channel] ?? [])
  const unreachable = Math.min(unreachableAcross(lists).length, total)
  const email = channels.includes('email') ? Math.max(0, total - missingEmail.length) : 0
  const sms = !channels.includes('phone')
    ? 0
    : channels.includes('email')
      ? Math.max(0, total - email - unreachable)
      : Math.max(0, total - missingPhone.length)
  return { email, sms, unreachable }
}

/**
 * How the draft's voters get their codes: one validation call per channel the sign-in uses, scoped
 * to the census' group (the whole organization for Everyone). Shares the members key, so member
 * writes refresh it. `available` stays false when it can't be worked out.
 */
export const useCodeBreakdown = ({
  groupId,
  channels,
  total,
  enabled = true,
}: {
  /** Left out for Everyone */
  groupId?: string
  channels: CodeChannel[]
  total: number
  enabled?: boolean
}) => {
  const { organization } = useOrganization()
  const { client } = useApiClient()
  const address = organization?.address
  const fields = (['email', 'phone'] as CodeChannel[]).filter((field) => channels.includes(field))

  const query = useQuery({
    queryKey: [...QueryKeys.organization.members(address), 'readiness', groupId ?? 'all', 'by-channel', ...fields],
    enabled: enabled && !!address && fields.length > 0 && total > 0,
    staleTime: READINESS_STALE_TIME,
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const lists = await Promise.all(fields.map((field) => membersMissing(client, address!, field, groupId)))
      return Object.fromEntries(fields.map((field, index) => [field, lists[index]])) as Partial<
        Record<CodeChannel, string[]>
      >
    },
  })

  const fieldsKey = fields.join()
  const breakdown = useMemo(
    () => (query.data ? breakdownCodes(total, fieldsKey.split(',') as CodeChannel[], query.data) : null),
    [query.data, total, fieldsKey]
  )

  return { breakdown, available: !!breakdown && total > 0, isLoading: query.isLoading && query.fetchStatus !== 'idle' }
}

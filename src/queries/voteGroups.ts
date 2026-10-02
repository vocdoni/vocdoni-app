import { useQueryClient } from '@tanstack/react-query'
import { useOrganization } from '@vocdoni/react-components'
import type { TFunction } from 'i18next'
import { useCallback, useMemo } from 'react'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { QueryKeys } from './keys'
import { useOrganizationMeta } from './organization'

/**
 * A vote-owned group: the census of one vote, created by the app when the vote picks its voters
 * (a copy of a saved census or of a previous vote, a snapshot of Everyone at publish, or the test
 * vote's people). It's a normal group to the API, so the app marks it in the organization meta:
 * one top-level key per group, because `PUT /meta` merges top-level keys and two admins marking
 * different groups never overwrite each other.
 */
export type VoteGroupKind = 'copy' | 'snapshot' | 'test'

export type VoteGroupMarker = {
  processId: string
  kind: VoteGroupKind
  /** ISO date */
  createdAt: string
  /** For a copy: the name of what it was copied from, as it was then */
  from?: string
}

export const VOTE_GROUP_META_PREFIX = 'vg_'

export const voteGroupMetaKey = (groupId: string) => `${VOTE_GROUP_META_PREFIX}${groupId}`

const KINDS: VoteGroupKind[] = ['copy', 'snapshot', 'test']

const isMarker = (value: unknown): value is VoteGroupMarker => {
  if (!value || typeof value !== 'object') return false
  const marker = value as Partial<VoteGroupMarker>
  return typeof marker.processId === 'string' && !!marker.processId && KINDS.includes(marker.kind as VoteGroupKind)
}

/** The vote-owned groups recorded in an organization's meta, by group id. Malformed entries are skipped. */
export const parseVoteGroupMarkers = (meta?: Record<string, unknown> | null): Map<string, VoteGroupMarker> => {
  const markers = new Map<string, VoteGroupMarker>()
  Object.entries(meta ?? {}).forEach(([key, value]) => {
    if (!key.startsWith(VOTE_GROUP_META_PREFIX) || !isMarker(value)) return
    const groupId = key.slice(VOTE_GROUP_META_PREFIX.length)
    if (!groupId) return
    markers.set(groupId, {
      processId: value.processId,
      kind: value.kind,
      createdAt: typeof value.createdAt === 'string' ? value.createdAt : '',
      ...(typeof value.from === 'string' && value.from ? { from: value.from } : {}),
    })
  })
  return markers
}

/** Whether a group is the census of a vote, rather than a saved census or Everyone. */
export const isVoteOwned = (markers: Map<string, VoteGroupMarker>, groupId?: string | null) =>
  !!groupId && markers.has(groupId)

const EMPTY = new Map<string, VoteGroupMarker>()

/**
 * The organization's vote-owned groups. `ready` turns true once the meta has loaded (or failed:
 * then nothing is known to be vote-owned), so lists can wait for it instead of flashing a vote's
 * census among the saved ones.
 */
export const useVoteGroupMarkers = () => {
  const { meta, metaIsLoading } = useOrganizationMeta()
  const markers = useMemo(() => (meta ? parseVoteGroupMarkers(meta as Record<string, unknown>) : EMPTY), [meta])

  return {
    markers,
    isVoteOwned: useCallback((groupId?: string | null) => isVoteOwned(markers, groupId), [markers]),
    ready: !metaIsLoading,
  }
}

type MetaFetch = ReturnType<typeof useAuth>['bearedFetch']

/** Records that a group is a vote's census. Sends only its own key, which the API merges in. */
export const markVoteGroup = (fetch: MetaFetch, address: string, groupId: string, marker: VoteGroupMarker) =>
  fetch(ApiEndpoints.OrganizationMeta.replace('{address}', address), {
    method: 'PUT',
    body: { meta: { [voteGroupMetaKey(groupId)]: marker } },
  })

/** Forgets that a group was a vote's census (after the group is deleted, or the vote let go of it). */
export const unmarkVoteGroup = (fetch: MetaFetch, address: string, groupId: string) =>
  fetch(ApiEndpoints.OrganizationMeta.replace('{address}', address), {
    method: 'DELETE',
    body: { keys: [voteGroupMetaKey(groupId)] },
  })

/** `markVoteGroup` and `unmarkVoteGroup` for the current organization, refreshing the markers after each. */
export const useVoteGroupActions = () => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const queryClient = useQueryClient()
  const address = organization?.address

  return useMemo(() => {
    const refresh = () => queryClient.invalidateQueries({ queryKey: QueryKeys.organization.meta(address) })
    return {
      mark: async (groupId: string, marker: Omit<VoteGroupMarker, 'createdAt'> & { createdAt?: string }) => {
        if (!address) throw new Error('No organization')
        await markVoteGroup(bearedFetch, address, groupId, {
          ...marker,
          createdAt: marker.createdAt ?? new Date().toISOString(),
        })
        await refresh()
      },
      unmark: async (groupId: string) => {
        if (!address) throw new Error('No organization')
        await unmarkVoteGroup(bearedFetch, address, groupId)
        await refresh()
      },
    }
  }, [bearedFetch, address, queryClient])
}

/**
 * The description a vote-owned group is created with, so it explains itself wherever the API shows
 * it. Written in the admin's language at creation time.
 */
export const voteGroupDescription = (t: TFunction, vote: string) =>
  t('censuses.vote_group.description', {
    defaultValue: "Census of '{{vote}}'. Changing it changes who can vote.",
    vote,
  })

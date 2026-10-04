import { useQueryClient } from '@tanstack/react-query'
import { VocdoniApiError } from '@vocdoni/api-client'
import { useOrganization } from '@vocdoni/react-components'
import type { TFunction } from 'i18next'
import { useCallback, useMemo } from 'react'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { QueryKeys } from './keys'
import { useOrganizationMeta } from './organization'

/**
 * A vote-owned group: the census of one vote, created by the app when the vote picks its voters
 * (a copy of a saved census or of a previous vote, a snapshot of Everyone at publish, or the test
 * vote's people). It's a normal group to the API, so the app marks it in the organization meta:
 * one top-level key per group, because `PUT /meta` merges top-level keys and two admins marking
 * different groups never overwrite each other.
 *
 * The organization meta is public (`GET /organizations/{address}` needs no session), so a marker
 * holds ids and dates only, never a name: what a copy came from is looked up when it's shown.
 */
export type VoteGroupKind = 'copy' | 'snapshot' | 'test'

export type VoteGroupMarker = {
  processId: string
  kind: VoteGroupKind
  /** ISO date */
  createdAt: string
  /** For a copy: the group it was copied from (a saved census, or another vote's census) */
  fromId?: string
  /** For a copy: what kind of thing it was copied from (a hand-picked copy has no `fromId`) */
  source?: VoteGroupSource
}

/** What a vote's own copy was made from. */
export type VoteGroupSource = 'saved' | 'previous' | 'choose' | 'everyone'

const SOURCES: VoteGroupSource[] = ['saved', 'previous', 'choose', 'everyone']

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
      ...(typeof value.fromId === 'string' && value.fromId ? { fromId: value.fromId } : {}),
      ...(SOURCES.includes(value.source as VoteGroupSource) ? { source: value.source } : {}),
    })
  })
  return markers
}

/**
 * What a copy was copied from, by name, looked up now: a saved census's title, or the title of the
 * vote whose census it copied (when `voteTitle` knows it). Undefined when that's gone or unknown.
 */
export const copySourceName = (
  marker: VoteGroupMarker | undefined,
  {
    groupsById,
    markers,
    voteTitle,
  }: {
    groupsById: Map<string, { title?: string }>
    markers: Map<string, VoteGroupMarker>
    voteTitle?: (processId: string) => string | undefined
  }
) => {
  if (!marker?.fromId) return undefined
  const from = markers.get(marker.fromId)
  if (from) return voteTitle?.(from.processId) || undefined
  return groupsById.get(marker.fromId)?.title || undefined
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

/** What a new group is created with (`POST /groups`). */
export type NewGroup = {
  title: string
  description?: string
  memberIds?: string[]
  /** Stores a snapshot of every member's id instead of `memberIds` */
  includeAllMembers?: boolean
}

/**
 * The group and meta calls the vote-census steps are made of (copy-on-attach, freeze at publish,
 * cleanup), as plain functions so the steps can be tested against a fake.
 */
export type VoteGroupApi = {
  /** The member ids of a group (`GET /groups/{id}`); empty for Everyone, whose ids aren't listed */
  readMemberIds: (groupId: string) => Promise<string[]>
  /** A group as `GET /groups/{id}` returns it */
  readGroup: (groupId: string) => Promise<{ isAutoGroup?: boolean; memberIds?: string[]; title?: string }>
  /** Resolves with the new group's id */
  createGroup: (group: NewGroup) => Promise<string>
  deleteGroup: (groupId: string) => Promise<void>
  mark: (groupId: string, marker: VoteGroupMarker) => Promise<void>
  unmark: (groupId: string) => Promise<void>
  /** The markers as stored right now, read fresh (not from the cache) */
  markers: () => Promise<Map<string, VoteGroupMarker>>
  /** Takes people out of a group (`PUT /groups/{id}`), in batches the API takes */
  removeMembers: (groupId: string, memberIds: string[]) => Promise<void>
  /** The test vote's record as stored right now, read fresh */
  testVote: () => Promise<TestVote | null>
}

/** Ids per `removeMembers` request. */
const GROUP_REMOVE_BATCH = 500

export const voteGroupApi = (fetch: MetaFetch, address: string): VoteGroupApi => {
  const groupUrl = (groupId: string) =>
    ApiEndpoints.OrganizationGroup.replace('{address}', address).replace('{groupId}', groupId)
  const readGroup = async (groupId: string) =>
    (await fetch<{ isAutoGroup?: boolean; memberIds?: string[]; title?: string }>(groupUrl(groupId))) ?? {}
  return {
    readGroup,
    readMemberIds: async (groupId) => (await readGroup(groupId)).memberIds ?? [],
    createGroup: async (group) => {
      const created = await fetch<{ id?: string }>(ApiEndpoints.OrganizationGroups.replace('{address}', address), {
        method: 'POST',
        body: group,
      })
      if (!created?.id) throw new Error('The census was not created')
      return created.id
    },
    deleteGroup: async (groupId) => {
      await fetch<void>(groupUrl(groupId), { method: 'DELETE' })
    },
    mark: async (groupId, marker) => {
      await markVoteGroup(fetch, address, groupId, marker)
    },
    unmark: async (groupId) => {
      await unmarkVoteGroup(fetch, address, groupId)
    },
    markers: async () => {
      const response = await fetch<{ meta?: Record<string, unknown> }>(
        ApiEndpoints.OrganizationMeta.replace('{address}', address)
      )
      return parseVoteGroupMarkers(response?.meta)
    },
    removeMembers: async (groupId, memberIds) => {
      for (let start = 0; start < memberIds.length; start += GROUP_REMOVE_BATCH)
        await fetch<void>(groupUrl(groupId), {
          method: 'PUT',
          body: { removeMembers: memberIds.slice(start, start + GROUP_REMOVE_BATCH) },
        })
    },
    testVote: async () => {
      const response = await fetch<{ meta?: Record<string, unknown> }>(
        ApiEndpoints.OrganizationMeta.replace('{address}', address)
      )
      return parseTestVote(response?.meta)
    },
  }
}

/** `voteGroupApi` for the current organization; every write refreshes the groups and the markers. */
export const useVoteGroupApi = (): VoteGroupApi | null => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const queryClient = useQueryClient()
  const address = organization?.address

  return useMemo(() => {
    if (!address) return null
    const api = voteGroupApi(bearedFetch, address)
    const groups = () => queryClient.invalidateQueries({ queryKey: QueryKeys.organization.groups(address) })
    const meta = () => queryClient.invalidateQueries({ queryKey: QueryKeys.organization.meta(address) })
    return {
      ...api,
      createGroup: async (group) => {
        const id = await api.createGroup(group)
        void groups()
        return id
      },
      deleteGroup: async (groupId) => {
        await api.deleteGroup(groupId)
        void groups()
      },
      mark: async (groupId, marker) => {
        await api.mark(groupId, marker)
        void meta()
      },
      unmark: async (groupId) => {
        await api.unmark(groupId)
        void meta()
      },
    }
  }, [bearedFetch, address, queryClient])
}

/** Ignores a failed cleanup step: whatever is left behind still carries its marker, for the sweep. */
const quietly = async (step: () => Promise<unknown>) => {
  try {
    await step()
    return true
  } catch (error) {
    console.warn('Vote census cleanup step failed', error)
    return false
  }
}

/**
 * Deletes a vote-owned group, then its marker. The marker only goes once the group is gone, so a
 * group that couldn't be deleted is still known and the sweep tries again. Never throws.
 */
export const discardVoteGroup = async (api: Pick<VoteGroupApi, 'deleteGroup' | 'unmark'>, groupId: string) => {
  if (!(await quietly(() => api.deleteGroup(groupId)))) return false
  return quietly(() => api.unmark(groupId))
}

/**
 * Deletes every group a vote owns (after the vote itself was deleted). Only groups with a marker for
 * that vote are touched. Never throws; resolves with the ids it deleted.
 */
export const discardVoteGroupsOf = async (api: VoteGroupApi, processId: string) => {
  let markers: Map<string, VoteGroupMarker>
  try {
    markers = await api.markers()
  } catch (error) {
    console.warn('Could not read the vote census markers', error)
    return []
  }
  const deleted: string[] = []
  for (const [groupId, marker] of markers) {
    if (marker.processId !== processId) continue
    if (await discardVoteGroup(api, groupId)) deleted.push(groupId)
  }
  return deleted
}

/** The bit of a process the sweep reads: which group its census follows, if any. */
export type SweepProcess = { id: string; published?: boolean; census?: { groupId?: string } | null }

/** How old a marker must be before the sweep may delete its group: an attach may still be under way. */
export const SWEEP_MIN_AGE_MS = 10 * 60 * 1000

/**
 * Deletes the vote-owned groups nothing uses any more: those whose vote is gone, or whose vote's
 * census now follows another group. Deleting a group empties every census built on it, so it errs
 * towards keeping:
 * - only groups that carry a marker are ever deleted, never one younger than `minAgeMs` (it may be
 *   mid-attach);
 * - never one that any vote of the organization follows, whatever its marker says;
 * - never one whose vote can't be read for another reason than not existing;
 * - never one whose vote shows no group: a draft saved before sign-in was set up, or a census the API
 *   failed to read (it answers without one rather than failing).
 *
 * `listProcesses` resolves with every process of the organization, drafts included, or throws (then
 * nothing is swept). Markers of votes missing from it are read one by one with `readProcess`, which
 * resolves with `null` when the vote doesn't exist (404) and should throw on any other failure.
 * Resolves with the ids it deleted.
 */
export const sweepOrphanVoteGroups = async (
  api: VoteGroupApi,
  listProcesses: () => Promise<SweepProcess[]>,
  readProcess: (processId: string) => Promise<SweepProcess | null>,
  { now = Date.now(), minAgeMs = SWEEP_MIN_AGE_MS }: { now?: number; minAgeMs?: number } = {}
) => {
  const markers = await api.markers()
  const due = [...markers].filter(([, marker]) => {
    const created = Date.parse(marker.createdAt)
    return Number.isFinite(created) && now - created >= minAgeMs
  })
  if (!due.length) return []

  const listed = new Map((await listProcesses()).map((process) => [process.id, process]))
  const followed = new Set([...listed.values()].map((process) => process.census?.groupId).filter(Boolean))
  const unlisted = new Map<string, Promise<SweepProcess | null | undefined>>()
  const read = (processId: string) => {
    if (listed.has(processId)) return Promise.resolve(listed.get(processId))
    if (!unlisted.has(processId))
      unlisted.set(
        processId,
        readProcess(processId).catch(() => undefined) // unknown: leave its groups alone
      )
    return unlisted.get(processId)!
  }

  const deleted: string[] = []
  for (const [groupId, marker] of due) {
    if (followed.has(groupId)) continue
    const process = await read(marker.processId)
    if (process === undefined) continue
    const following = process?.census?.groupId
    const orphan = process === null || (!!following && following !== groupId)
    if (orphan && (await discardVoteGroup(api, groupId))) deleted.push(groupId)
  }
  return deleted
}

/** Processes per list request while sweeping (the API's maximum). */
const SWEEP_PAGE_SIZE = 100

const SWEEP_SESSION_KEY = 'vocdoni.voteGroupSweep'
const sweptThisSession = new Set<string>()

const alreadySwept = (address: string) => {
  if (sweptThisSession.has(address)) return true
  try {
    return sessionStorage.getItem(`${SWEEP_SESSION_KEY}.${address}`) === '1'
  } catch {
    return false
  }
}

const rememberSwept = (address: string) => {
  sweptThisSession.add(address)
  try {
    sessionStorage.setItem(`${SWEEP_SESSION_KEY}.${address}`, '1')
  } catch {
    // Private mode: the in-memory flag is enough for this page load
  }
}

/**
 * Runs `sweepOrphanVoteGroups` for the current organization. `{ throttle: true }` runs it at most once
 * per browser session (the Censuses tab); without it, it always runs (right after a publish). Never
 * throws: a sweep that fails is simply tried again another time.
 */
export const useSweepOrphanVoteGroups = () => {
  const api = useVoteGroupApi()
  const { client } = useApiClient()
  const { organization } = useOrganization()
  const address = organization?.address

  return useCallback(
    async ({ throttle = false }: { throttle?: boolean } = {}) => {
      if (!api || !address) return []
      if (throttle && alreadySwept(address)) return []
      rememberSwept(address)
      try {
        return await sweepOrphanVoteGroups(
          api,
          async () => {
            // With no `published` filter a manager gets every process, drafts included
            const processes: SweepProcess[] = []
            let page: number | null | undefined = 1
            while (page) {
              const result = await client.elections.list({ orgAddress: address, page, limit: SWEEP_PAGE_SIZE })
              processes.push(...((result.processes ?? []) as SweepProcess[]))
              page = result.pagination?.nextPage
            }
            return processes
          },
          async (processId) => {
            try {
              return (await client.elections.get(processId)) as SweepProcess
            } catch (error) {
              if (error instanceof VocdoniApiError && error.status === 404) return null
              throw error
            }
          }
        )
      } catch (error) {
        console.warn('Vote census sweep failed', error)
        return []
      }
    },
    [api, address, client]
  )
}

/**
 * The guarded test vote, recorded in the organization meta under `testVote` when it's created: its
 * draft, its group and the people it added to the members.
 *
 * - `memberIds` are the test people: the members the test vote created who aren't real members. The
 *   admin is one of them unless they ticked "I'm a member" (`adminIsMember`). Removing the test people
 *   empties it, but the record stays, so the test vote keeps being left out of the setup progress.
 * - `processIds` are every test vote run so far (the current one included), all left out of counts.
 */
export type TestVote = {
  processId: string
  groupId: string
  memberIds: string[]
  adminIsMember?: boolean
  processIds: string[]
}

export const TEST_VOTE_META_KEY = 'testVote'

/** The most people a test vote takes, the admin included. */
export const TEST_VOTE_MAX_PEOPLE = 10

const strings = (value: unknown) =>
  Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string' && !!id) : []

export const parseTestVote = (meta?: Record<string, unknown> | null): TestVote | null => {
  const value = meta?.[TEST_VOTE_META_KEY] as Partial<TestVote> | undefined
  if (!value || typeof value !== 'object') return null
  const processId = typeof value.processId === 'string' ? value.processId : ''
  const memberIds = strings(value.memberIds)
  if (!processId && !memberIds.length) return null
  return {
    processId,
    groupId: typeof value.groupId === 'string' ? value.groupId : '',
    memberIds,
    adminIsMember: value.adminIsMember === true,
    processIds: [...new Set([...strings(value.processIds), ...(processId ? [processId] : [])])],
  }
}

/** Records the test vote. Sends only its own key, which the API merges in. */
export const writeTestVote = (fetch: MetaFetch, address: string, testVote: TestVote) =>
  fetch(ApiEndpoints.OrganizationMeta.replace('{address}', address), {
    method: 'PUT',
    body: { meta: { [TEST_VOTE_META_KEY]: testVote } },
  })

/**
 * The test vote without the test people who were just deleted from the members, or `null` when none
 * of them were. Deleting everyone forgets them all. Keeps the real member count (members minus test
 * people) right after a test person is deleted by hand.
 */
export const pruneTestPeople = (testVote: TestVote | null, deleted: { ids?: string[]; all?: boolean }) => {
  if (!testVote?.memberIds.length) return null
  const gone = new Set(deleted.ids ?? [])
  const memberIds = deleted.all ? [] : testVote.memberIds.filter((id) => !gone.has(id))
  return memberIds.length < testVote.memberIds.length ? { ...testVote, memberIds } : null
}

/**
 * Forgets deleted members from the test vote's test people, reading the meta fresh. Never throws: a
 * failure leaves a stale id, which the real member count tolerates (it never goes below zero).
 */
export const forgetDeletedTestPeople = async (
  fetch: MetaFetch,
  address: string,
  deleted: { ids?: string[]; all?: boolean }
) => {
  try {
    const response = await fetch<{ meta?: Record<string, unknown> }>(
      ApiEndpoints.OrganizationMeta.replace('{address}', address)
    )
    const pruned = pruneTestPeople(parseTestVote(response?.meta), deleted)
    if (!pruned) return false
    await writeTestVote(fetch, address, pruned)
    return true
  } catch (error) {
    console.warn('Could not update the test people after deleting members', error)
    return false
  }
}

/** The organization's test vote, if it ever had one. */
export const useTestVote = () => {
  const { meta } = useOrganizationMeta()
  return useMemo(() => parseTestVote(meta as Record<string, unknown> | undefined), [meta])
}

/** `useTestVote`, plus whether the meta has been read (so the door neither flashes nor shows on a failed read). */
export const useTestVoteState = () => {
  const { meta, metaIsLoading, metaIsError } = useOrganizationMeta()
  const testVote = useMemo(() => parseTestVote(meta as Record<string, unknown> | undefined), [meta])
  // A failed read isn't "no test vote": offering another could record two
  return { testVote, ready: !metaIsLoading && !metaIsError }
}

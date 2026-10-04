import { VocdoniApiError } from '@vocdoni/api-client'
import { ApiError } from '~components/Auth/api'
import {
  discardVoteGroup,
  type NewGroup,
  type VoteGroupApi,
  type VoteGroupKind,
  type VoteGroupMarker,
  type VoteGroupSource,
} from '~src/queries/voteGroups'

/** Points the draft at a group. Throws when it couldn't. */
export type Repoint = (groupId: string) => Promise<void>

const statusOf = (error: unknown) =>
  error instanceof VocdoniApiError ? error.status : error instanceof ApiError ? error.response?.status : undefined

/**
 * Whether a failed write certainly changed nothing: the server answered and refused it (4xx). A
 * network failure or a 5xx may have landed halfway, so whatever it created is left for the sweep.
 */
export const isRefused = (error: unknown) => {
  const status = statusOf(error)
  return typeof status === 'number' && status >= 400 && status < 500
}

/** The draft changed since it was read (another tab, another admin): `PUT /processes/{id}` 409 40171. */
export const isStaleWrite = (error: unknown) =>
  error instanceof VocdoniApiError && error.status === 409 && error.code === 40171

/** A conditional write the server refused because the draft had changed since it was read. */
export class StaleDraftError extends Error {
  cause: unknown
  constructor(cause: unknown) {
    super('The draft changed while the census was being updated')
    this.name = 'StaleDraftError'
    this.cause = cause
  }
}

/**
 * Writes with the draft's latest `updatedAt`, so nothing written in between is overwritten unseen.
 * Stale throws `StaleDraftError` without retrying: writing these values again on top of the newer
 * draft would undo whatever changed it (another tab, another admin).
 */
export const writeWithLatest = async (
  readUpdatedAt: () => Promise<string | undefined>,
  write: (updatedAt?: string) => Promise<void>
) => {
  try {
    await write(await readUpdatedAt())
  } catch (error) {
    throw isStaleWrite(error) ? new StaleDraftError(error) : error
  }
}

export type CreateVoteGroupInput = {
  processId: string
  kind: VoteGroupKind
  /** For a copy: the group it was copied from */
  fromId?: string
  /** For a copy: what kind of thing it was copied from */
  source?: VoteGroupSource
  group: NewGroup
  repoint: Repoint
  /** The vote's current own group, deleted (with its marker) once the vote points at the new one */
  replacing?: string
  /** People taken out of the new group before the vote points at it (it backs no census yet) */
  leaveOut?: string[]
  now?: () => Date
}

/**
 * The one way a vote gets a census of its own:
 * 1. create the group;
 * 2. mark it as this vote's (if that fails, the unmarked group is deleted at once: nothing uses it);
 * 3. take `leaveOut` out of it (if that fails, the new group goes: nothing points at it yet);
 * 4. point the draft at it (if the server refuses, the new group goes; any other failure leaves it,
 *    marked, for the sweep, since the draft may already point at it);
 * 5. only then delete the group it replaces.
 * Resolves with the new group's id.
 */
export const createVoteGroup = async (
  api: VoteGroupApi,
  { processId, kind, fromId, source, group, repoint, replacing, leaveOut, now = () => new Date() }: CreateVoteGroupInput
) => {
  const groupId = await api.createGroup(group)

  const marker: VoteGroupMarker = {
    processId,
    kind,
    createdAt: now().toISOString(),
    ...(fromId ? { fromId } : {}),
    ...(source ? { source } : {}),
  }
  try {
    await api.mark(groupId, marker)
  } catch (error) {
    try {
      await api.deleteGroup(groupId)
    } catch {
      // Unmarked and unused: nothing points at it, at worst it shows among the saved censuses
    }
    throw error
  }

  if (leaveOut?.length)
    try {
      await api.removeMembers(groupId, leaveOut)
    } catch (error) {
      await discardVoteGroup(api, groupId)
      throw error
    }

  try {
    await repoint(groupId)
  } catch (error) {
    if (isRefused(error) || error instanceof StaleDraftError) await discardVoteGroup(api, groupId)
    throw error
  }

  if (replacing && replacing !== groupId) await discardVoteGroup(api, replacing)
  return groupId
}

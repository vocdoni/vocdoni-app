import type { VoteGroupApi } from '~src/queries/voteGroups'
import { createVoteGroup, type Repoint } from './voteGroup'

/** Where a vote's own census is copied from. */
export type AttachSource =
  /** A saved census */
  | { kind: 'saved'; groupId: string; name: string }
  /** Another vote's census */
  | { kind: 'previous'; groupId: string; name: string }
  /** People picked in the picker */
  | { kind: 'choose'; memberIds: string[] }
  /** Everyone, as it is now, minus some people (the test vote's) */
  | { kind: 'everyone'; memberIds: string[]; name: string }

export type AttachAnalyticsSource = AttachSource['kind']

/** The source has nobody in it: a census of nobody is never created. */
export class EmptyCensusError extends Error {
  constructor() {
    super('There is nobody to copy')
    this.name = 'EmptyCensusError'
  }
}

export type AttachInput = {
  processId: string
  source: AttachSource
  /** What the new group is called and says about itself */
  title: string
  description: string
  repoint: Repoint
  /** The vote's current own census, deleted once the vote points at the copy */
  replacing?: string
  now?: () => Date
}

/**
 * Copy-on-attach: gives a vote its own copy of the chosen people. Reads the source's member ids (a
 * group's, or the ones given), creates the vote's group with them, marks it, points the draft at it,
 * and only then deletes the census it replaces. See `createVoteGroup` for what happens on failure.
 */
export const attachCensus = async (api: VoteGroupApi, input: AttachInput) => {
  const { source } = input
  const ids = 'memberIds' in source ? source.memberIds : await api.readMemberIds(source.groupId)
  const memberIds = [...new Set(ids.filter(Boolean))]
  if (!memberIds.length) throw new EmptyCensusError()

  const groupId = await createVoteGroup(api, {
    processId: input.processId,
    kind: 'copy',
    from: 'name' in source ? source.name : undefined,
    source: source.kind,
    group: { title: input.title, description: input.description, memberIds },
    repoint: input.repoint,
    replacing: input.replacing,
    now: input.now,
  })
  return { groupId, count: memberIds.length }
}

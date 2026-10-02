import type { CreateVotingProcessRequest } from '@vocdoni/api-types'
import type { VoteGroupApi } from '~src/queries/voteGroups'

type CloneInput = {
  request: CreateVotingProcessRequest
  /** Creates the copy's draft; resolves with its id */
  create: (request: CreateVotingProcessRequest) => Promise<string>
  /** The source vote's name, for where the copy's census came from */
  name: string
  /** What the copy's census is called and says about itself */
  title: string
  description: string
  now?: () => Date
}

const withGroup = (request: CreateVotingProcessRequest, groupId?: string): CreateVotingProcessRequest => ({
  ...request,
  census: { ...request.census, groupId },
})

/**
 * Copies a vote into a new draft without ever sharing a census with it:
 * - Everyone stays Everyone (and a census frozen from Everyone at publish goes back to Everyone);
 * - any other group (the vote's own census, or a saved one it shared the old way) is copied into a
 *   census of the new draft's own: created first, then the draft pointing at it, then marked. If the
 *   draft can't be created the copy is deleted again.
 * A census with nobody in it isn't copied: the draft starts on Everyone, like a new vote.
 */
export const cloneWithOwnCensus = async (api: VoteGroupApi, input: CloneInput) => {
  const { request, create } = input
  const groupId = request.census?.groupId
  const signIn = !!(request.census?.authFields?.length || request.census?.twoFaFields?.length)
  if (!groupId || !signIn) return create(request)

  const markers = await api.markers()
  if (markers.get(groupId)?.kind === 'snapshot') return create(withGroup(request, undefined))
  const group = markers.has(groupId)
    ? { isAutoGroup: false, memberIds: await api.readMemberIds(groupId) }
    : await api.readGroup(groupId)
  if (group.isAutoGroup) return create(request)

  const memberIds = [...new Set((group.memberIds ?? []).filter(Boolean))]
  if (!memberIds.length) return create(withGroup(request, undefined))

  const copy = await api.createGroup({ title: input.title, description: input.description, memberIds })
  let processId: string
  try {
    processId = await create(withGroup(request, copy))
  } catch (error) {
    try {
      await api.deleteGroup(copy)
    } catch {
      // Unmarked and unused: at worst it shows among the saved censuses
    }
    throw error
  }

  const marker = {
    processId,
    kind: 'copy' as const,
    from: input.name,
    source: 'previous' as const,
    createdAt: (input.now ?? (() => new Date()))().toISOString(),
  }
  try {
    await api.mark(copy, marker)
  } catch {
    try {
      await api.mark(copy, marker)
    } catch (error) {
      // The draft has its census, just not labelled as its own: opening it gives it a marked copy
      console.warn('Could not mark the copied census', error)
    }
  }
  return processId
}

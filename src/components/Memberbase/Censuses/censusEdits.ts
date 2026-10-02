import type { VotingProcessQuestion } from '@vocdoni/api-types'
import { getSignedMemberIds, type Member, type MembersPageFetcher } from '~src/queries/members'
import { getLocalizedRawText, type LocalizedTextMap } from '~utils/localized-text'
import { memberMatchesValue } from '../People/pasteMatch'

/** Ids per request when adding to a census: the backend does about four queries for each. */
export const ADD_CHUNK_SIZE = 500

/** Ids per request when removing through a group (the process endpoint takes up to 1,000). */
export const GROUP_REMOVE_CHUNK_SIZE = 500

export const chunk = <T>(items: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size))

/** A removal that failed for another reason than someone having voted, after `removed` had gone. */
export class PartialRemovalError extends Error {
  removed: number
  cause: unknown
  constructor(cause: unknown, removed: number) {
    super(cause instanceof Error ? cause.message : 'Removal failed')
    this.name = 'PartialRemovalError'
    this.removed = removed
    this.cause = cause
  }
}

export type RemovalOutcome =
  | { status: 'done'; removed: number }
  /**
   * Refused (409): someone in a batch has already started voting in a vote that's running, so that
   * batch removed nobody. `remaining` is everyone not removed yet minus them, to offer again.
   */
  | { status: 'blocked'; removed: number; signed: string[]; remaining: string[] }

/**
 * Removes people batch by batch. `send` removes one batch and resolves with how many went. A 409 with
 * `signedMemberIds` stops it and says who blocked it; any other failure throws a
 * `PartialRemovalError` with how many had gone before.
 */
export const removeInChunks = async (
  ids: string[],
  send: (batch: string[]) => Promise<number>,
  size = GROUP_REMOVE_CHUNK_SIZE
): Promise<RemovalOutcome> => {
  let removed = 0
  const batches = chunk(ids, size)
  for (let index = 0; index < batches.length; index += 1) {
    try {
      removed += await send(batches[index])
    } catch (error) {
      const signed = getSignedMemberIds(error)
      if (signed === null) throw new PartialRemovalError(error, removed)
      const blocked = new Set(signed)
      const remaining = batches
        .slice(index)
        .flat()
        .filter((id) => !blocked.has(id))
      return { status: 'blocked', removed, signed, remaining }
    }
  }
  return { status: 'done', removed }
}

/**
 * The questions a removal would leave with nobody allowed to answer them: those restricted to some
 * members (`eligibleMemberIds`) who would all be removed. The API would then open the question to
 * everyone, so the app refuses first. Questions without a restriction never block.
 */
export const questionsEmptiedBy = (
  questions: Pick<VotingProcessQuestion, 'id' | 'title' | 'eligibleMemberIds'>[] | undefined,
  removing: string[],
  language = 'default'
) => {
  const removed = new Set(removing)
  return (questions ?? [])
    .filter((question) => {
      const eligible = question.eligibleMemberIds ?? []
      return eligible.length > 0 && eligible.every((id) => removed.has(id))
    })
    .map((question) => getLocalizedRawText(question.title as LocalizedTextMap | undefined, language) || question.id)
}

type NewPerson = Partial<Pick<Member, 'email' | 'memberNumber' | 'nationalId' | 'name' | 'surname'>>

const same = (a?: string, b?: string) => (a ?? '').trim().toLocaleLowerCase() === (b ?? '').trim().toLocaleLowerCase()

/**
 * Finds the member just created from a form, since `POST /members` doesn't return ids: by their email,
 * member number or national ID (exact), else by a name nobody else has. Null when it can't tell.
 */
export const findCreatedMember = async (fetchPage: MembersPageFetcher, person: NewPerson) => {
  const search = async (value: string) => (await fetchPage({ page: 1, limit: 100, search: value })).members ?? []

  for (const value of [person.email, person.memberNumber, person.nationalId]) {
    const key = value?.trim()
    if (!key) continue
    const found = (await search(key)).find((member) => member.id && memberMatchesValue(member, key))
    if (found?.id) return found as Member & { id: string }
  }

  const name = person.name?.trim() || person.surname?.trim()
  if (!name) return null
  const matches = (await search(name)).filter(
    (member) => member.id && same(member.name, person.name) && same(member.surname, person.surname)
  )
  return matches.length === 1 ? (matches[0] as Member & { id: string }) : null
}

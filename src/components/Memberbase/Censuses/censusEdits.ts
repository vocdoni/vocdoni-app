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
  | { status: 'done'; removed: number; removedIds: string[] | null }
  /**
   * Refused (409): someone in a batch has already started voting in a vote that's running, so that
   * batch removed nobody. `remaining` is everyone not removed yet minus them, to offer again.
   */
  | { status: 'blocked'; removed: number; removedIds: string[] | null; signed: string[]; remaining: string[] }

/**
 * Removes people batch by batch. `send` removes one batch and resolves with how many went. A 409 with
 * `signedMemberIds` stops it and says who blocked it; any other failure throws a
 * `PartialRemovalError` with how many had gone before. `removedIds` says exactly who went, or is null
 * when a batch removed fewer than it was sent (some weren't in the census) and that can't be told.
 */
export const removeInChunks = async (
  ids: string[],
  send: (batch: string[]) => Promise<number>,
  size = GROUP_REMOVE_CHUNK_SIZE
): Promise<RemovalOutcome> => {
  let removed = 0
  let removedIds: string[] | null = []
  const batches = chunk(ids, size)
  for (let index = 0; index < batches.length; index += 1) {
    try {
      const count = await send(batches[index])
      removed += count
      removedIds = removedIds && count === batches[index].length ? [...removedIds, ...batches[index]] : null
    } catch (error) {
      const signed = getSignedMemberIds(error)
      if (signed === null) throw new PartialRemovalError(error, removed)
      const blocked = new Set(signed)
      const remaining = batches
        .slice(index)
        .flat()
        .filter((id) => !blocked.has(id))
      return { status: 'blocked', removed, removedIds, signed, remaining }
    }
  }
  return { status: 'done', removed, removedIds }
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

const PERSON_FIELDS = ['email', 'memberNumber', 'nationalId', 'name', 'surname'] as const

/** Whether a member has every detail the new person was created with. */
const hasAllOf = (member: Partial<Member>, person: NewPerson) =>
  PERSON_FIELDS.every((field) => !person[field]?.trim() || same(member[field], person[field]))

/**
 * Finds the member just created from a form, since `POST /members` doesn't return ids: by their email,
 * member number or national ID (exact), else by their name, and always with every other detail they
 * were created with. An older member can share an email or a name: when more than one member fits,
 * it can't tell which is new, and is null, like when nobody fits.
 */
export const findCreatedMember = async (fetchPage: MembersPageFetcher, person: NewPerson) => {
  const search = async (value: string) => (await fetchPage({ page: 1, limit: 100, search: value })).members ?? []
  const only = (members: Partial<Member>[]) => {
    const ids = new Set(members.map((member) => member.id))
    return ids.size === 1 ? (members[0] as Member & { id: string }) : null
  }

  for (const value of [person.email, person.memberNumber, person.nationalId]) {
    const key = value?.trim()
    if (!key) continue
    const fits = (await search(key)).filter(
      (member) => member.id && memberMatchesValue(member, key) && hasAllOf(member, person)
    )
    if (fits.length) return only(fits)
  }

  const name = person.name?.trim() || person.surname?.trim()
  if (!name) return null
  return only(
    (await search(name)).filter(
      (member) =>
        member.id && same(member.name, person.name) && same(member.surname, person.surname) && hasAllOf(member, person)
    )
  )
}

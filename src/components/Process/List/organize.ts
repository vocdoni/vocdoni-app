import type { VotingProcessResponse } from '@vocdoni/api-types'
import { getLocalizedRawText, type LocalizedTextMap } from '~utils/localized-text'
import { filterOfState, getProcessState, type ProcessState } from '../processState'

export type ProcessSort = 'relevant' | 'newest' | 'title'

export const PROCESS_SORTS: ProcessSort[] = ['relevant', 'newest', 'title']

export type PublishedEntry = { kind: 'published'; process: VotingProcessResponse; state: ProcessState; title: string }
export type DraftEntry = { kind: 'draft'; process: VotingProcessResponse; title: string }
export type ProcessEntry = PublishedEntry | DraftEntry

export type ProcessGroups = {
  live: PublishedEntry[]
  scheduled: PublishedEntry[]
  drafts: DraftEntry[]
  closed: PublishedEntry[]
}

/**
 * When the process was last written. The API sends `updatedAt` (see the OpenAPI spec) but
 * @vocdoni/api-types 2.1.0 doesn't declare it yet.
 */
export const processUpdatedAt = (process: VotingProcessResponse): string | undefined =>
  (process as VotingProcessResponse & { updatedAt?: string }).updatedAt

export const processTitle = (process: Pick<VotingProcessResponse, 'title'>, language: string) =>
  getLocalizedRawText(process.title as LocalizedTextMap | undefined, language)

// Case- and accent-insensitive, so "votacio" finds "Votació"
const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase()

const time = (date?: string) => {
  const value = date ? new Date(date).getTime() : NaN
  return Number.isNaN(value) ? 0 : value
}

type Order = (a: ProcessEntry, b: ProcessEntry) => number

const byTitle =
  (language: string): Order =>
  (a, b) =>
    a.title.localeCompare(b.title, language, { sensitivity: 'base' })
const byStartDesc: Order = (a, b) => time(b.process.startDate) - time(a.process.startDate)
const byStartAsc: Order = (a, b) => time(a.process.startDate) - time(b.process.startDate)
const byEndAsc: Order = (a, b) => time(a.process.endDate) - time(b.process.endDate)
const byEndDesc: Order = (a, b) => time(b.process.endDate) - time(a.process.endDate)
const byEditedDesc: Order = (a, b) => time(processUpdatedAt(b.process)) - time(processUpdatedAt(a.process))

/**
 * "Most relevant" differs per group, because each group answers a different question: live votes
 * by what closes first, scheduled ones by what opens first, drafts and closed votes by the most
 * recent.
 */
const relevantOrder: Record<keyof ProcessGroups, Order> = {
  live: byEndAsc,
  scheduled: byStartAsc,
  drafts: byEditedDesc,
  closed: byEndDesc,
}

const orderFor = (group: keyof ProcessGroups, sort: ProcessSort, language: string): Order => {
  if (sort === 'title') return byTitle(language)
  if (sort === 'newest') return group === 'drafts' ? byEditedDesc : byStartDesc
  return relevantOrder[group]
}

/** Groups loaded processes by where they are in their life, keeps those matching the search, and sorts each group. */
export const organizeProcesses = ({
  published,
  drafts,
  query = '',
  sort = 'relevant',
  language,
}: {
  published: VotingProcessResponse[]
  drafts: VotingProcessResponse[]
  query?: string
  sort?: ProcessSort
  language: string
}): ProcessGroups => {
  const needle = fold(query.trim())
  const matches = (entry: ProcessEntry) => !needle || fold(entry.title).includes(needle)

  const groups: ProcessGroups = { live: [], scheduled: [], drafts: [], closed: [] }

  for (const process of published) {
    const state = getProcessState(process)
    const entry: PublishedEntry = { kind: 'published', process, state, title: processTitle(process, language) }
    if (matches(entry)) groups[filterOfState(state)].push(entry)
  }
  for (const process of drafts) {
    const entry: DraftEntry = { kind: 'draft', process, title: processTitle(process, language) }
    if (matches(entry)) groups.drafts.push(entry)
  }

  for (const key of Object.keys(groups) as (keyof ProcessGroups)[]) {
    groups[key].sort(orderFor(key, sort, language) as never)
  }

  return groups
}

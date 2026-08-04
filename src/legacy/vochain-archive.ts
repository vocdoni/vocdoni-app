/**
 * Read-only archive access to legacy (pre-SaaS-model) voting processes, straight from the
 * Vochain gateway REST API — no @vocdoni/sdk involved. Legacy processes are all finished,
 * so this module only covers what the public archive pages render: election metadata,
 * status/dates, census size, and decoded per-choice tallies.
 *
 * The gateway serves election and account metadata inline (no IPFS resolution needed),
 * verified against api.vocdoni.io on 2026-07-23.
 */
import { decodeResults, type DecodedQuestionResults } from '@vocdoni/ballot'

export type LocalizedText = Record<string, string | undefined>

/** Vochain gateway base URL per app environment — same defaults the legacy SDK used. */
export const getVochainGatewayUrl = (environment: string = 'dev') => {
  switch (environment.toLowerCase()) {
    case 'prod':
      return 'https://api.vocdoni.io/v2'
    case 'stg':
      return 'https://api-stg.vocdoni.net/v2'
    default:
      return 'https://api-dev.vocdoni.net/v2'
  }
}

/** Thrown for gateway 404s so page loaders can render a proper not-found. */
export class VochainNotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found on the vochain gateway`)
    this.name = 'VochainNotFoundError'
  }
}

export type LegacyElectionStatus =
  | 'UPCOMING'
  | 'ONGOING'
  | 'ENDED'
  | 'CANCELED'
  | 'PAUSED'
  | 'RESULTS'
  | 'PROCESS_UNKNOWN'

export type LegacyChoiceResult = {
  title: LocalizedText
  value: number
  /** Decoded tally; null while results are hidden or unavailable. */
  votes: number | null
  /** Share of the question total (0-100); null when not computable. */
  percentage: number | null
}

export type LegacyQuestionResult = {
  title: LocalizedText
  description?: LocalizedText
  choices: LegacyChoiceResult[]
}

export type LegacyElection = {
  id: string
  organizationId: string
  status: LegacyElectionStatus
  startDate: string
  endDate: string
  voteCount: number
  finalResults: boolean
  secretUntilTheEnd: boolean
  maxCensusSize: number
  chainId: string
  title: LocalizedText
  description?: LocalizedText
  header?: string
  questions: LegacyQuestionResult[]
  /** False while a secret election has not published final results (tallies hidden). */
  resultsAvailable: boolean
}

export type LegacyElectionListItem = Pick<
  LegacyElection,
  'id' | 'organizationId' | 'status' | 'startDate' | 'endDate' | 'voteCount' | 'finalResults' | 'title'
>

export type LegacyElectionsPage = {
  elections: LegacyElectionListItem[]
  pagination: {
    totalItems?: number
    previousPage?: number | null
    currentPage: number
    nextPage?: number | null
    lastPage: number
  }
}

export type LegacyOrganization = {
  address: string
  account?: {
    name?: LocalizedText
    description?: LocalizedText
    avatar?: string
  }
  electionCount?: number
}

/** Vochain 64-hex election ids (with or without 0x) vs 24-hex Mongo ObjectIDs of the SaaS model. */
export const isLegacyProcessId = (id?: string): id is string => !!id && /^(0x)?[0-9a-f]{64}$/i.test(id)

const strip0x = (id: string) => id.replace(/^0x/i, '').toLowerCase()

const gatewayFetch = async <T>(gateway: string, path: string, resource: string): Promise<T> => {
  const response = await fetch(`${gateway}${path}`)

  if (response.status === 404) throw new VochainNotFoundError(resource)
  if (!response.ok) throw new Error(`vochain gateway request failed (${response.status}) for ${path}`)

  return (await response.json()) as T
}

// ─── Raw gateway shapes (only the fields the archive reads) ─────────────────────

type RawQuestion = {
  title?: LocalizedText
  description?: LocalizedText
  choices?: Array<{ title?: LocalizedText; value?: number }>
}

type RawElection = {
  electionId: string
  organizationId: string
  status: string
  startDate: string
  endDate: string
  voteCount?: number
  finalResults?: boolean
  manuallyEnded?: boolean
  chainId?: string
  result?: string[][]
  census?: { maxCensusSize?: number }
  voteMode?: { encryptedVotes?: boolean; uniqueValues?: boolean; costFromWeight?: boolean }
  tallyMode?: {
    maxCount?: number
    maxValue?: number
    maxVoteOverwrites?: number
    maxTotalCost?: number
    costExponent?: number
  }
  metadata?: {
    title?: LocalizedText
    description?: LocalizedText
    media?: { header?: string }
    questions?: RawQuestion[]
  }
}

type RawAccount = {
  address: string
  electionIndex?: number
  metadata?: {
    name?: LocalizedText
    description?: LocalizedText
    media?: { avatar?: string }
  }
}

type RawElectionsPage = {
  elections?: Array<
    Pick<
      RawElection,
      'electionId' | 'organizationId' | 'status' | 'startDate' | 'endDate' | 'voteCount' | 'finalResults'
    >
  >
  pagination?: {
    totalItems?: number
    previousPage?: number | null
    currentPage?: number
    nextPage?: number | null
    lastPage?: number
  }
}

// ─── Mapping ────────────────────────────────────────────────────────────────────

const KNOWN_STATUSES: LegacyElectionStatus[] = ['UPCOMING', 'ONGOING', 'ENDED', 'CANCELED', 'PAUSED', 'RESULTS']

// The chain reports READY both before and during the voting period; split it by
// start date the way the legacy SDK did.
const normalizeRawStatus = (raw: RawElection): LegacyElectionStatus => {
  const status = (raw.status ?? '').toUpperCase()

  if (status === 'READY') {
    return new Date(raw.startDate).getTime() > Date.now() ? 'UPCOMING' : 'ONGOING'
  }

  if (KNOWN_STATUSES.includes(status as LegacyElectionStatus)) return status as LegacyElectionStatus

  return 'PROCESS_UNKNOWN'
}

const decodeLegacyResults = (raw: RawElection): DecodedQuestionResults[] | null => {
  const questions = raw.metadata?.questions
  if (!questions?.length || !raw.result?.length) return null

  try {
    return decodeResults({
      questions: questions.map((question) => ({
        title: { default: '' },
        choices: (question.choices ?? []).map((choice, index) => ({
          title: { default: '' },
          value: choice.value ?? index,
        })),
      })),
      voteType: {
        maxCount: raw.tallyMode?.maxCount ?? questions.length,
        maxValue: raw.tallyMode?.maxValue ?? 0,
        maxVoteOverwrites: raw.tallyMode?.maxVoteOverwrites ?? 0,
        costExponent: raw.tallyMode?.costExponent ?? 1,
        uniqueChoices: raw.voteMode?.uniqueValues ?? false,
        costFromWeight: raw.voteMode?.costFromWeight ?? false,
      },
      results: raw.result,
    })
  } catch {
    // Unknown/degenerate ballot configs: render the election without tallies rather than failing.
    return null
  }
}

const mapLegacyElection = (raw: RawElection): LegacyElection => {
  const status = normalizeRawStatus(raw)
  const secretUntilTheEnd = raw.voteMode?.encryptedVotes ?? false
  const resultsAvailable = !secretUntilTheEnd || status === 'RESULTS' || Boolean(raw.finalResults)
  const decoded = resultsAvailable ? decodeLegacyResults(raw) : null

  const questions: LegacyQuestionResult[] = (raw.metadata?.questions ?? []).map((question, questionIndex) => {
    const decodedQuestion = decoded?.[questionIndex]
    const decodedChoices = decodedQuestion?.filter((entry) => entry.choice !== 'abstain')

    return {
      title: question.title ?? {},
      description: question.description,
      choices: (question.choices ?? []).map((choice, choiceIndex) => ({
        title: choice.title ?? {},
        value: choice.value ?? choiceIndex,
        votes: decodedChoices?.[choiceIndex]?.votes ?? null,
        percentage: decodedChoices?.[choiceIndex]?.percentage ?? null,
      })),
    }
  })

  return {
    id: strip0x(raw.electionId),
    organizationId: raw.organizationId,
    status,
    startDate: raw.startDate,
    endDate: raw.endDate,
    voteCount: raw.voteCount ?? 0,
    finalResults: raw.finalResults ?? false,
    secretUntilTheEnd,
    maxCensusSize: raw.census?.maxCensusSize ?? 0,
    chainId: raw.chainId ?? '',
    title: raw.metadata?.title ?? {},
    description: raw.metadata?.description,
    header: raw.metadata?.media?.header,
    questions,
    resultsAvailable,
  }
}

const mapLegacyOrganization = (raw: RawAccount): LegacyOrganization => ({
  address: raw.address,
  account: {
    name: raw.metadata?.name,
    description: raw.metadata?.description,
    avatar: raw.metadata?.media?.avatar,
  },
  electionCount: raw.electionIndex,
})

// ─── Public fetchers ────────────────────────────────────────────────────────────

export const fetchLegacyElection = async (gateway: string, id: string): Promise<LegacyElection> => {
  if (!isLegacyProcessId(id)) throw new VochainNotFoundError(`election ${id}`)

  const raw = await gatewayFetch<RawElection>(gateway, `/elections/${strip0x(id)}`, `election ${id}`)

  return mapLegacyElection(raw)
}

export const fetchLegacyOrganization = async (gateway: string, address?: string): Promise<LegacyOrganization> => {
  const normalized = strip0x(address ?? '')
  if (!/^[0-9a-f]{40}$/.test(normalized)) throw new VochainNotFoundError(`account ${address}`)

  const raw = await gatewayFetch<RawAccount>(gateway, `/accounts/${normalized}`, `account ${address}`)

  return mapLegacyOrganization(raw)
}

export const fetchLegacyOrganizationElections = async (
  gateway: string,
  address: string,
  page: number = 0
): Promise<LegacyElectionsPage> => {
  const normalized = strip0x(address)
  const raw = await gatewayFetch<RawElectionsPage>(
    gateway,
    `/accounts/${normalized}/elections/page/${page}`,
    `account ${address} elections`
  )

  // List items carry no metadata; fetch each election's detail for its title.
  const elections = await Promise.all(
    (raw.elections ?? []).map(async (item): Promise<LegacyElectionListItem> => {
      const base = {
        id: strip0x(item.electionId),
        organizationId: item.organizationId,
        status: normalizeRawStatus(item as RawElection),
        startDate: item.startDate,
        endDate: item.endDate,
        voteCount: item.voteCount ?? 0,
        finalResults: item.finalResults ?? false,
      }

      try {
        const detail = await gatewayFetch<RawElection>(
          gateway,
          `/elections/${strip0x(item.electionId)}`,
          `election ${item.electionId}`
        )
        return { ...base, title: detail.metadata?.title ?? {} }
      } catch {
        return { ...base, title: {} }
      }
    })
  )

  const pagination = raw.pagination ?? {}

  return {
    elections,
    pagination: {
      totalItems: pagination.totalItems,
      previousPage: pagination.previousPage ?? null,
      currentPage: pagination.currentPage ?? page,
      nextPage: pagination.nextPage ?? null,
      lastPage: pagination.lastPage ?? pagination.currentPage ?? page,
    },
  }
}

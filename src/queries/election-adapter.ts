import type { Election as SaasElection, LocalizedInput, PaginatedElections } from '@vocdoni/api-types'
import { BallotType, decodeResults, inferBallotType, multichoiceReservesAbstain } from '@vocdoni/ballot'
import {
  type AllElectionStatus,
  CensusType,
  type Census,
  type ElectionListWithPagination,
  type ElectionResultsType,
  ElectionResultsTypeNames,
  ElectionStatus,
  type IChoice,
  type IElectionType,
  type IPublishedElectionParameters,
  type IQuestion,
  type IVoteType,
  type MultiLanguage,
  PublishedElection,
} from '@vocdoni/sdk'

/**
 * Adapts a SAAS `Election` (`@vocdoni/api-types`) into the legacy `PublishedElection`
 * (`@vocdoni/sdk`) that the current process/election components still consume.
 *
 * This is a temporary bridge (mirroring `SaasAccountProvider.toOrganizationData`) that lets us
 * remove client-side Vochain reads without rewriting the ~40 components that read
 * `PublishedElection`. It will be dropped once those components migrate to the new `Election`
 * type + `@vocdoni/react-providers` directly.
 */
export const toPublishedElection = (election: SaasElection): PublishedElection =>
  PublishedElection.build(toPublishedElectionParameters(election))

/**
 * Adapts a SAAS `PaginatedElections` page into the legacy `ElectionListWithPagination` shape the
 * dashboard votings list (and its `RoutedPaginationProvider`) consumes. Pages are 0-indexed, to
 * match the existing `page - 1` convention in the loaders.
 */
export const toLegacyElectionList = (page: PaginatedElections): ElectionListWithPagination => {
  const { elections, total, page: currentPage, pageSize } = page
  const lastPage = pageSize > 0 ? Math.max(0, Math.ceil(total / pageSize) - 1) : 0
  return {
    elections: elections.map(toPublishedElection),
    pagination: {
      totalItems: total,
      currentPage,
      lastPage,
      previousPage: currentPage > 0 ? currentPage - 1 : null,
      nextPage: currentPage < lastPage ? currentPage + 1 : null,
    },
  }
}

const BALLOT_TO_RESULTS_TYPE: Record<BallotType, ElectionResultsTypeNames> = {
  [BallotType.SingleChoice]: ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION,
  [BallotType.MultiChoice]: ElectionResultsTypeNames.MULTIPLE_CHOICE,
  [BallotType.Approval]: ElectionResultsTypeNames.APPROVAL,
  [BallotType.Budget]: ElectionResultsTypeNames.BUDGET,
  [BallotType.Quadratic]: ElectionResultsTypeNames.QUADRATIC,
}

const CENSUS_TYPE_MAP: Record<string, CensusType> = {
  csp: CensusType.CSP,
  weighted: CensusType.WEIGHTED,
  zkweighted: CensusType.ANONYMOUS,
  anonymous: CensusType.ANONYMOUS,
}

const toMultiLanguage = (value?: LocalizedInput): MultiLanguage<string> => {
  if (!value) return { default: '' }
  return typeof value === 'string' ? { default: value } : (value as MultiLanguage<string>)
}

/**
 * The SAAS status union has no `RESULTS`/`ONGOING`. `PublishedElection.getStatus` already maps
 * `READY` → `ONGOING`/`UPCOMING` by start date, but it never synthesises `RESULTS`, so an ended
 * election with published tallies would never show results. Reproduce the legacy state by
 * feeding `RESULTS` when the election is ended and its results are final.
 */
const toLegacyStatus = (election: SaasElection): AllElectionStatus => {
  if (election.status === 'ENDED' && election.finalResults) return ElectionStatus.RESULTS
  return election.status as AllElectionStatus
}

const toVoteType = (voteType: SaasElection['voteType']): IVoteType => ({
  maxCount: voteType.maxCount,
  maxValue: voteType.maxValue,
  maxVoteOverwrites: voteType.maxVoteOverwrites,
  costExponent: voteType.costExponent,
  uniqueChoices: voteType.uniqueChoices,
  costFromWeight: voteType.costFromWeight,
})

const toElectionType = (electionType: SaasElection['electionType']): IElectionType => ({
  interruptible: electionType.interruptible,
  dynamicCensus: electionType.dynamicCensus,
  secretUntilTheEnd: electionType.secretUntilTheEnd,
  anonymous: electionType.anonymous,
  metadata: electionType.metadata,
})

// The components only ever read `census.censusURI` / `.type` / `.size` off the election, never
// call census methods or check `instanceof`. The SDK's `PublishedCensus` would reject the SAAS
// census here (it invariants on a hex id + URL, neither of which SAAS census ids/URIs satisfy),
// so we hand back a plain census-shaped object carrying exactly what the components read.
const toCensus = (election: SaasElection): Census => {
  const info = election.census
  const type = info?.type
    ? (CENSUS_TYPE_MAP[info.type] ?? CensusType.CSP)
    : election.electionType?.anonymous
      ? CensusType.ANONYMOUS
      : info?.weighted
        ? CensusType.WEIGHTED
        : CensusType.CSP
  return {
    censusId: info?.id ?? null,
    censusURI: info?.uri ?? null,
    type,
    size: info?.size,
    weight: null,
  } as unknown as Census
}

const toResultsType = (election: SaasElection): ElectionResultsType => {
  const name = BALLOT_TO_RESULTS_TYPE[inferBallotType(election)]
  switch (name) {
    case ElectionResultsTypeNames.MULTIPLE_CHOICE:
      return {
        name,
        properties: {
          canAbstain: multichoiceReservesAbstain(election),
          abstainValues: [],
          repeatChoice: !election.voteType.uniqueChoices,
          numChoices: { min: 0, max: election.voteType.maxCount ?? 0 },
        },
      }
    case ElectionResultsTypeNames.APPROVAL:
      return { name, properties: { rejectValue: 0, acceptValue: 1 } }
    case ElectionResultsTypeNames.BUDGET:
      return {
        name,
        properties: {
          useCensusWeightAsBudget: election.voteType.costFromWeight ?? false,
          maxBudget: election.voteType.maxValue ?? 0,
          minStep: 0,
          forceFullBudget: false,
        },
      }
    case ElectionResultsTypeNames.QUADRATIC:
      return {
        name,
        properties: {
          useCensusWeightAsBudget: election.voteType.costFromWeight ?? false,
          maxBudget: election.voteType.maxValue ?? 0,
          minStep: 0,
          forceFullBudget: false,
          quadraticCost: election.voteType.costExponent ?? 2,
        },
      }
    default:
      return { name: ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION, properties: {} }
  }
}

// Decode the raw results histogram once so per-choice tallies (and the multichoice abstain
// bucket) can be projected onto the legacy `choice.results` / `question.numAbstains` fields.
// Returns an empty matrix when there are no results yet or decoding fails, matching the legacy
// "results not available" shape.
const safeDecodeResults = (election: SaasElection) => {
  if (!election.results?.length) return []
  try {
    return decodeResults(election)
  } catch {
    return []
  }
}

const toQuestions = (election: SaasElection): IQuestion[] => {
  const decoded = safeDecodeResults(election)

  return election.questions.map((question, questionIndex) => {
    const decodedQuestion = decoded[questionIndex] ?? []
    const abstain = decodedQuestion.find((entry) => entry.choice === 'abstain')

    const choices: IChoice[] = question.choices.map((choice) => {
      const match = decodedQuestion.find((entry) => entry.choice === choice.value)
      return {
        title: toMultiLanguage(choice.title),
        value: choice.value,
        results: match ? String(match.votes) : undefined,
      }
    })

    return {
      title: toMultiLanguage(question.title),
      description: question.description ? toMultiLanguage(question.description) : undefined,
      numAbstains: abstain ? String(abstain.votes) : undefined,
      choices,
    }
  })
}

const toPublishedElectionParameters = (election: SaasElection): IPublishedElectionParameters => ({
  id: election.id,
  organizationId: election.organizationId,
  status: toLegacyStatus(election),
  voteCount: election.voteCount ?? 0,
  finalResults: election.finalResults ?? false,
  results: election.results ?? [],
  manuallyEnded: false,
  chainId: election.chainId ?? '',
  creationTime: '',
  metadataURL: '',
  resultsType: toResultsType(election),
  raw: {},
  title: toMultiLanguage(election.title),
  description: election.description ? toMultiLanguage(election.description) : undefined,
  header: election.header,
  streamUri: undefined,
  meta: election.meta,
  startDate: election.startDate,
  endDate: election.endDate,
  census: toCensus(election),
  maxCensusSize: election.census?.size,
  voteType: toVoteType(election.voteType),
  electionType: toElectionType(election.electionType),
  questions: toQuestions(election),
})

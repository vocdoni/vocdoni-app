import { useElection } from '@vocdoni/react-components'
import {
  CensusType,
  dotobject,
  ElectionResultsTypeNames,
  ElectionStatus,
  formatUnits,
  type InvalidElection,
  PublishedElection,
} from '@vocdoni/sdk'
import { type TFunction } from 'i18next'

// SerializedElection (Record<string, any>) is an internal react-components type not exported;
// we define a compatible local alias so this component accepts ElectionLike from useElection().
type ElectionLike = PublishedElection | InvalidElection | Record<string, unknown>

type ReportCensusType = 'csp' | 'spreadsheet' | 'web3' | 'weighted' | 'anonymous' | 'unknown'

type CensusMetadata = {
  type?: string
  fields?: string[]
  salt?: string
}

type ElectionReportContext = {
  election: PublishedElection
  isWeighted?: boolean
  participation?: number
  turnout?: number
}

type CensusBundleData = {
  census: {
    published?: {
      uri?: string
      root?: string
    }
    authFields?: string[]
    twoFaFields?: string[]
    type?: string
    weighted?: boolean
  }
}

export type CertificateField = {
  label: string
  value: string
  kind?: 'link'
  helperText?: string
}

export type CertificateChoice = {
  name: string
  votes: string
  percentage: string
  numericVotes: number | null
  votingPower?: string
  castPowerPercentage?: string
  eligiblePowerPercentage?: string
  ballotCount?: string
}

export type CertificateQuestion = {
  question: string
  choices: CertificateChoice[]
  totalVotes: string
  votingMethod: string
  countingBasisLabel: string
  submittedBallots: string
  votingPowerUsed: string
  eligibleVotingPower: string
  isWeighted: boolean
}

export type CertificateData = {
  eventReference: string
  processId: string
  issueDate: string
  issueTime: string
  organizationName: string
  eventName: string
  blockchainNetwork: string
  notAvailableLabel: string
  introParagraphs: string[]
  generalInformation: CertificateField[]
  authentication: CertificateField[]
  votingSystemParagraphs: string[]
  votingSystemBullets: string[]
  censusParticipation: CertificateField[]
  censusParticipationLead: string
  votingProcessIntro: string
  votingProcessQuestions: CertificateQuestion[]
  isWeighted: boolean
  resultValueLabel: string
  questionTotalLabel: string
  resultsHiddenText?: string
  verification: CertificateField[]
  verificationProcedures: string[]
  issuer: CertificateField[]
  disclaimerParagraphs: string[]
  disclaimerBullets: string[]
}

const sanitizeFileName = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const downloadableElectionStatuses = new Set([ElectionStatus.RESULTS, ElectionStatus.ENDED, ElectionStatus.CANCELED])

const canDownloadVotingReport = (election?: ElectionLike | null) =>
  election instanceof PublishedElection && downloadableElectionStatuses.has(election.status)

export const notAvailable = (t: TFunction) => t('process_pdf.not_available', { defaultValue: 'Not available' })

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isLongDenseValue = (value: string) => value.length >= 40 && !/\s/.test(value)

export const shouldStackFieldValue = (value: string) => /^https?:\/\//i.test(value) || isLongDenseValue(value)
export const formatPdfFieldValue = (value: string) => value

const formatUtcDateTime = (date?: Date | null) =>
  date ? `${date.toISOString().slice(0, 16).replace('T', ' ')} UTC` : null

const formatUtcDate = (date?: Date | null) => (date ? date.toISOString().slice(0, 10) : null)

const formatUtcTime = (date?: Date | null) => (date ? `${date.toISOString().slice(11, 19)} UTC` : null)

const getIdentityFieldLabel = (field: string, t: TFunction) => {
  switch (field) {
    case 'name':
    case 'firstname':
      return t('members.fields.firstname', { defaultValue: 'First Name' })
    case 'surname':
      return t('members.fields.surname', { defaultValue: 'Last Name' })
    case 'email':
      return t('members.fields.email', { defaultValue: 'Email' })
    case 'phone':
      return t('members.fields.phone', { defaultValue: 'Phone' })
    case 'memberNumber':
    case 'member_number':
      return t('members.fields.member_number', { defaultValue: 'Member Number' })
    case 'nationalId':
    case 'national_id':
      return t('members.fields.national_id', { defaultValue: 'National ID' })
    case 'birthDate':
    case 'birth_date':
      return t('members.fields.birth_date', { defaultValue: 'Birth Date' })
    case 'weight':
      return t('members.fields.weight', { defaultValue: 'Voting power (Weight)' })
    default:
      return field
  }
}

const getNestedRecord = (source: unknown, path: string[]) => {
  const value = path.reduce<unknown>((current, key) => (isRecord(current) ? current[key] : undefined), source)
  return isRecord(value) ? value : undefined
}

const normalizeCensusMetadata = (value?: Record<string, unknown>): CensusMetadata | undefined => {
  if (!value) return undefined

  const rawFields = value.fields
  const hasFields = Array.isArray(rawFields)
  const fields = hasFields ? rawFields.filter((field): field is string => typeof field === 'string') : undefined
  const type = typeof value.type === 'string' ? value.type : undefined
  const salt = typeof value.salt === 'string' ? value.salt : undefined

  if (!type && !hasFields && !salt) return undefined

  return { type, fields, salt }
}

export const resolveCensusMetadata = (election: PublishedElection): CensusMetadata | undefined => {
  const wrappedMetadata = normalizeCensusMetadata(getNestedRecord(election, ['metadata', 'meta', 'census']))
  const normalizedMetadata = normalizeCensusMetadata(
    dotobject(election.meta || {}, 'census') as Record<string, unknown>
  )

  if (!wrappedMetadata) return normalizedMetadata
  if (!normalizedMetadata) return wrappedMetadata

  return {
    type: wrappedMetadata.type ?? normalizedMetadata.type,
    fields: typeof wrappedMetadata.fields === 'undefined' ? normalizedMetadata.fields : wrappedMetadata.fields,
    salt: wrappedMetadata.salt ?? normalizedMetadata.salt,
  }
}

const normalizeReportCensusType = (value?: string | null): ReportCensusType => {
  switch (value) {
    case 'csp':
      return 'csp'
    case 'spreadsheet':
      return 'spreadsheet'
    case 'web3':
      return 'web3'
    case CensusType.WEIGHTED:
      return 'weighted'
    case CensusType.ANONYMOUS:
      return 'anonymous'
    default:
      return 'unknown'
  }
}

export const resolveReportCensusType = (election: PublishedElection, censusMeta?: CensusMetadata): ReportCensusType => {
  if (censusMeta?.type) return normalizeReportCensusType(censusMeta.type)

  return normalizeReportCensusType(election.census?.type)
}

export const isCspReportCensus = (censusType: ReportCensusType) => censusType === 'csp'

const humanizeCensusType = (t: TFunction, censusType?: ReportCensusType | null) => {
  switch (censusType) {
    case 'csp':
      return t('process_pdf.census_type.csp', { defaultValue: 'Memberbase credentials census' })
    case 'spreadsheet':
      return t('process_pdf.census_type.spreadsheet', {
        defaultValue: 'Spreadsheet census provided by the organization',
      })
    case 'web3':
      return t('process_pdf.census_type.web3', {
        defaultValue: 'Web3 wallet census provided by the organization',
      })
    case 'weighted':
      return t('process_pdf.census_type.weighted', {
        defaultValue: 'Organization-provided weighted census',
      })
    case 'anonymous':
      return t('process_pdf.census_type.anonymous', {
        defaultValue: 'Anonymous organization-provided census',
      })
    default:
      return t('process_pdf.census_type.unknown', { defaultValue: 'Not available' })
  }
}

const getVoterAccessSourceDescription = (t: TFunction, censusType: ReportCensusType, fallback: string) => {
  switch (censusType) {
    case 'spreadsheet':
      return t('process_pdf.authentication.voter_access_source_spreadsheet', {
        defaultValue:
          'Voters access with credentials derived from the spreadsheet census uploaded by the organization.',
      })
    case 'web3':
      return t('process_pdf.authentication.voter_access_source_web3', {
        defaultValue: 'Voters access with the wallet address included in the Web3 census.',
      })
    case 'weighted':
    case 'anonymous':
      return t('process_pdf.authentication.voter_access_source_weighted', {
        defaultValue: 'Eligibility is checked against the organization-provided weighted census for this process.',
      })
    default:
      return fallback
  }
}

const formatMaybeString = (value?: string | number | null, fallback?: string) => {
  if (value === null || typeof value === 'undefined' || value === '') return fallback ?? ''
  return String(value)
}

const getNumericValue = (value: unknown) => {
  if (typeof value === 'bigint') return Number(value)

  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

const formatResultAmount = (value: unknown, decimals: number) => {
  const numericValue = getNumericValue(value)
  if (numericValue === null) return null

  if (!decimals) return numericValue

  try {
    const formattedValue = Number(formatUnits(BigInt(numericValue), decimals))
    return Number.isFinite(formattedValue) ? formattedValue : numericValue
  } catch {
    return numericValue
  }
}

const formatNumber = (value: unknown, fallback: string, decimals = 0) => {
  const numericValue = formatResultAmount(value, decimals)
  if (numericValue === null) return fallback

  return String(numericValue)
}

const getCensusSize = (election: PublishedElection) => Number(election.census?.size ?? election.maxCensusSize ?? 0)

const getElectionWeight = (election: PublishedElection) =>
  getNumericValue((election.census as unknown as Record<string, unknown> | undefined)?.weight)

const getFallbackIsWeighted = (election: PublishedElection) => {
  const weight = getElectionWeight(election)
  const size = getCensusSize(election)

  return weight !== null && Number.isFinite(size) && weight !== size
}

const resolveReportIsWeighted = (report: ElectionReportContext, censusBundle?: CensusBundleData | null) => {
  if (report.isWeighted === true) return true
  if (censusBundle?.census.weighted === true) return true

  return getFallbackIsWeighted(report.election)
}

const calculatePercentage = (numerator: number, denominator: number) =>
  denominator > 0 ? Math.round((numerator / denominator) * 10000) / 100 : 0

const formatPercentage = (numerator: number, denominator: number) =>
  denominator > 0 ? `${((numerator / denominator) * 100).toFixed(1)}%` : '0.0%'

const formatPercentageValue = (value: number) => `${value.toFixed(2)}%`

const getFallbackParticipation = (election: PublishedElection) =>
  calculatePercentage(Number(election.voteCount ?? 0), getCensusSize(election))

const getQuestionChoiceRawResult = (election: PublishedElection, questionIndex: number, choiceIndex: number) => {
  const question = election.questions[questionIndex]
  const choice = question?.choices[choiceIndex]

  return choice?.results ?? election.results?.[questionIndex]?.[choiceIndex] ?? 0
}

const shouldIncludeAbstainChoice = (election: PublishedElection) =>
  election.resultsType?.name === ElectionResultsTypeNames.MULTIPLE_CHOICE &&
  Boolean((election.resultsType.properties as { canAbstain?: boolean } | undefined)?.canAbstain)

const getQuestionRawResults = (election: PublishedElection, questionIndex: number) => {
  const question = election.questions[questionIndex]
  if (!question) return []

  const results = question.choices.map((choice, choiceIndex) => ({
    title: choice.title.default,
    result: getQuestionChoiceRawResult(election, questionIndex, choiceIndex),
  }))

  if (shouldIncludeAbstainChoice(election)) {
    results.push({
      title: 'abstain',
      result: 'numAbstains' in question ? question.numAbstains : 0,
    })
  }

  return results
}

const getQuestionRawTotal = (election: PublishedElection, questionIndex: number) =>
  getQuestionRawResults(election, questionIndex)
    .map(({ result }) => getNumericValue(result) ?? 0)
    .reduce((acc, vote) => acc + vote, 0)

const getQuestionResultsTotal = (election: PublishedElection, questionIndex: number, decimals: number) =>
  formatResultAmount(getQuestionRawTotal(election, questionIndex), decimals) ?? 0

const getQuestionResultTotals = (election: PublishedElection, decimals: number) =>
  election.questions.map((_, questionIndex) => getQuestionResultsTotal(election, questionIndex, decimals))

const formatNumberRange = (values: number[], fallback: string) => {
  const numericValues = values.filter((value) => Number.isFinite(value))
  if (!numericValues.length) return fallback

  const min = Math.min(...numericValues)
  const max = Math.max(...numericValues)
  return min === max ? String(min) : `${min} - ${max}`
}

const formatPercentageRange = (values: number[], fallback: string) => {
  const numericValues = values.filter((value) => Number.isFinite(value))
  if (!numericValues.length) return fallback

  const min = Math.min(...numericValues)
  const max = Math.max(...numericValues)
  return min === max ? formatPercentageValue(min) : `${formatPercentageValue(min)} - ${formatPercentageValue(max)}`
}

const getTotalEligibleVotingPower = (election: PublishedElection, decimals: number) =>
  formatResultAmount((election.census as unknown as Record<string, unknown> | undefined)?.weight, decimals)

const getQuestionChoices = (
  election: PublishedElection,
  questionIndex: number,
  notAvailableLabel: string,
  decimals: number,
  abstainLabel: string,
  isWeighted: boolean,
  totalEligibleVotingPower: number | null
) => {
  const question = election.questions[questionIndex]
  const totalForQuestion = getQuestionResultsTotal(election, questionIndex, decimals)

  const choiceResults = question.choices.map((choice, choiceIndex) => ({
    name: choice.title.default,
    rawVotes: getQuestionChoiceRawResult(election, questionIndex, choiceIndex),
  }))

  if (shouldIncludeAbstainChoice(election)) {
    choiceResults.push({
      name: abstainLabel,
      rawVotes: 'numAbstains' in question ? question.numAbstains : 0,
    })
  }

  const choices = choiceResults.map(({ name, rawVotes }) => {
    const numericVotes = formatResultAmount(rawVotes, decimals)
    const hasNumericVotes = Number.isFinite(numericVotes)
    const votes = hasNumericVotes
      ? String(numericVotes)
      : formatMaybeString(rawVotes as string | number | null, notAvailableLabel)
    const percentage =
      hasNumericVotes && totalForQuestion > 0
        ? formatPercentage(Number(numericVotes), totalForQuestion)
        : notAvailableLabel
    const eligiblePowerPercentage =
      isWeighted && hasNumericVotes && totalEligibleVotingPower
        ? formatPercentage(Number(numericVotes), totalEligibleVotingPower)
        : undefined

    return {
      name,
      votes,
      percentage,
      numericVotes: hasNumericVotes ? Number(numericVotes) : null,
      ...(isWeighted
        ? {
            votingPower: votes,
            castPowerPercentage: percentage,
            eligiblePowerPercentage,
          }
        : {}),
    }
  })

  return choices
}

const getVotingMethod = (election: PublishedElection, t: TFunction, isWeighted: boolean) => {
  const base =
    election.resultsType?.name === ElectionResultsTypeNames.MULTIPLE_CHOICE
      ? t('process.question_type.multiple', { defaultValue: 'Multiple choice' })
      : t('process.question_type.single', { defaultValue: 'Single choice' })

  return isWeighted
    ? t('process_pdf.voting_process.card.weighted_method', {
        defaultValue: '{{base}} with weighted voting',
        base,
      })
    : base
}

const getVoteOverwriteStatus = (election: PublishedElection, t: TFunction) => {
  const maxVoteOverwrites = election.voteType?.maxVoteOverwrites

  return typeof maxVoteOverwrites === 'number' && maxVoteOverwrites > 0
    ? t('process_pdf.vote_overwrite_enabled', {
        defaultValue: 'Enabled, up to {{votes}} vote overwrites per voter',
        votes: maxVoteOverwrites,
      })
    : t('process_pdf.vote_overwrite_disabled', { defaultValue: 'Disabled' })
}

const getCensusReference = (election: PublishedElection, censusBundle?: CensusBundleData | null) => {
  const census = election.census as unknown as Record<string, unknown> | undefined

  return (
    censusBundle?.census.published?.root ??
    (typeof census?.root === 'string' ? census.root : null) ??
    (typeof census?._root === 'string' ? census._root : null) ??
    (typeof census?.censusId === 'string' ? census.censusId : null) ??
    (typeof census?._censusId === 'string' ? census._censusId : null) ??
    (typeof census?.censusURI === 'string' ? census.censusURI : null) ??
    (typeof census?._censusURI === 'string' ? census._censusURI : null) ??
    null
  )
}

export const buildCertificateData = ({
  report,
  t,
  organizationName,
  explorerUrl,
  censusBundle,
  now,
}: {
  report: ElectionReportContext
  t: TFunction
  organizationName?: string
  explorerUrl?: string
  censusBundle?: CensusBundleData | null
  now: Date
}): CertificateData => {
  const { election } = report
  const notAvailableLabel = notAvailable(t)
  const eventReference = election.title.default?.trim() || election.id
  const issueDate = formatUtcDate(now) ?? notAvailableLabel
  const issueTime = formatUtcTime(now) ?? notAvailableLabel
  const startDatetime = formatUtcDateTime(election.startDate) ?? notAvailableLabel
  const endDatetime = formatUtcDateTime(election.endDate) ?? notAvailableLabel
  const verificationExplorerLink = explorerUrl ? `${explorerUrl}/process/${election.id}` : notAvailableLabel
  const count = election.voteCount ?? 0
  const resultDecimals = Number((election.meta as { token?: { decimals?: number } } | undefined)?.token?.decimals ?? 0)
  const censusMeta = resolveCensusMetadata(election)
  const censusType = resolveReportCensusType(election, censusMeta)
  const isWeighted = resolveReportIsWeighted(report, censusBundle)
  const censusFields = censusBundle?.census.authFields ?? censusMeta?.fields ?? []
  const twoFaFields = censusBundle?.census.twoFaFields ?? []
  const authenticationMethod = humanizeCensusType(t, censusType)
  const identitySource =
    censusFields.length > 0
      ? censusFields.map((field) => getIdentityFieldLabel(field, t)).join(', ')
      : notAvailableLabel
  const twoFaEnabledDisabled =
    censusBundle === null
      ? notAvailableLabel
      : twoFaFields.length > 0
        ? t('process_pdf.authentication.two_fa_enabled', {
            defaultValue: 'Enabled: voters confirm their identity with a one-time code sent to their personal devices.',
          })
        : t('process_pdf.authentication.two_fa_disabled', {
            defaultValue: 'Disabled: no additional identity check has been configured in this voting process',
          })
  const blockchainNetwork = election.chainId || notAvailableLabel
  const censusReference = getCensusReference(election, censusBundle) ?? notAvailableLabel
  const resultsVisibility = election.electionType?.secretUntilTheEnd
    ? t('results_state.hidden_until_end', { defaultValue: 'Hidden until the end' })
    : t('results_state.live_results', { defaultValue: 'Live results' })
  const eligibleVoters = getCensusSize(election)
  const totalEligibleParticipants = String(eligibleVoters)
  const participationPercentage = (report.participation ?? getFallbackParticipation(election)).toFixed(2)
  const hasHiddenResults = Boolean(
    election.electionType?.secretUntilTheEnd && election.status !== ElectionStatus.RESULTS
  )
  const hiddenResultFieldValue = t('process_pdf.results.hidden_field', {
    defaultValue: 'Hidden until final results',
  })
  const totalEligibleVotingPowerValue = getTotalEligibleVotingPower(election, resultDecimals)
  const totalEligibleVotingPower =
    totalEligibleVotingPowerValue === null ? notAvailableLabel : String(totalEligibleVotingPowerValue)
  const questionVotingPowerTotals = getQuestionResultTotals(election, resultDecimals)
  const votingPowerUsed = hasHiddenResults
    ? hiddenResultFieldValue
    : formatNumberRange(questionVotingPowerTotals, notAvailableLabel)
  const weightedParticipationValues =
    totalEligibleVotingPowerValue === null
      ? []
      : questionVotingPowerTotals.map((questionTotal) =>
          calculatePercentage(questionTotal, totalEligibleVotingPowerValue)
        )
  const weightedParticipation = hasHiddenResults
    ? hiddenResultFieldValue
    : formatPercentageRange(weightedParticipationValues, notAvailableLabel)
  const countingBasisLabel = isWeighted
    ? t('process_pdf.census.counting_basis_weighted', { defaultValue: 'Weighted voting' })
    : t('process_pdf.census.counting_basis_1p1v', { defaultValue: '1 person, 1 vote' })
  const resultValueLabel = isWeighted
    ? t('process_pdf.voting_process.card.voting_power', { defaultValue: 'Voting power' })
    : t('process_pdf.voting_process.card.votes', { defaultValue: 'Votes' })
  const questionTotalLabel = isWeighted
    ? t('process_pdf.voting_process.card.voting_power_used', { defaultValue: 'Voting power used' })
    : t('process_pdf.voting_process.card.item', { defaultValue: 'Total votes' })
  const authentication = [
    {
      label: t('process_pdf.authentication.method', { defaultValue: 'Authentication method' }),
      value: authenticationMethod,
    },
    ...(isCspReportCensus(censusType)
      ? [
          {
            label: t('process_pdf.authentication.identity_source', { defaultValue: 'Required voter credentials' }),
            value: identitySource,
          },
          {
            label: t('process_pdf.authentication.two_fa', { defaultValue: 'Additional identity check' }),
            value: twoFaEnabledDisabled,
          },
        ]
      : [
          {
            label: t('process_pdf.authentication.voter_access_source', { defaultValue: 'Voter access source' }),
            value: getVoterAccessSourceDescription(t, censusType, notAvailableLabel),
          },
        ]),
  ]

  return {
    eventReference,
    processId: election.id,
    issueDate,
    issueTime,
    organizationName: organizationName || election.organizationId || notAvailableLabel,
    eventName: eventReference,
    blockchainNetwork,
    notAvailableLabel,
    introParagraphs: [
      t('process_pdf.intro_paragraph_1', {
        defaultValue:
          'This document constitutes a formal technical certification of a digital voting process conducted using the Vocdoni Protocol. It establishes a structured, verifiable, and auditable record of the process configuration, eligible participant set (electoral census), turnout, and final results (tally). Its purpose is to enable independent auditors and authorized third parties to assess the integrity, consistency, and correct execution of the process.',
      }),
      t('process_pdf.intro_paragraph_2', {
        defaultValue:
          'All relevant data associated with this voting process has been recorded and anchored in publicly auditable records using the Vocdoni Protocol. These records ensure transparency, immutability, and end-to-end verifiability, while preserving voter anonymity and ballot confidentiality through cryptographic mechanisms.',
      }),
      t('process_pdf.intro_paragraph_3', {
        defaultValue:
          'This certification is issued exclusively by the technical service provider to attest to the correctness of the system execution and the integrity of the recorded data. It does not replace, supersede, or constitute any form of legal certification, nor does it assert compliance with jurisdiction-specific legal or regulatory requirements.',
      }),
    ],
    generalInformation: [
      {
        label: t('process_pdf.general.organization', { defaultValue: 'Organization' }),
        value: organizationName || notAvailableLabel,
      },
      { label: t('process_pdf.general.event_name', { defaultValue: 'Event name' }), value: eventReference },
      {
        label: t('process_pdf.general.voting_period_start', { defaultValue: 'Voting period (start)' }),
        value: startDatetime,
      },
      {
        label: t('process_pdf.general.voting_period_end', { defaultValue: 'Voting period (end)' }),
        value: endDatetime,
      },
      {
        label: t('process_pdf.general.results_visibility', { defaultValue: 'Results visibility' }),
        value: resultsVisibility,
      },
      {
        label: t('process_pdf.turnout.eligible', { defaultValue: 'Total number of eligible participants' }),
        value: totalEligibleParticipants,
      },
      {
        label: t('process_pdf.general.vote_overwrite', { defaultValue: 'Vote overwrite' }),
        value: getVoteOverwriteStatus(election, t),
      },
      {
        label: t('process_pdf.general.network', { defaultValue: 'Infrastructure' }),
        value: blockchainNetwork,
      },
      {
        label: t('process_pdf.general.process_id', { defaultValue: 'Process ID' }),
        value: election.id,
        helperText: t('process_pdf.general.process_id_helper', {
          defaultValue:
            'Unique public identifier of this voting process. It can be used to find and verify the process in the voting infrastructure.',
        }),
      },
      {
        label: t('process_pdf.general.census_reference', { defaultValue: 'Census reference' }),
        value: censusReference,
        helperText: t('process_pdf.general.census_reference_helper', {
          defaultValue:
            'Public reference that identifies the census used for this voting process. It does not include or reveal voters\u2019 personal data.',
        }),
      },
    ],
    authentication,
    votingSystemParagraphs: [
      t('process_pdf.voting_system.paragraph_1', {
        defaultValue:
          'The voting process was conducted using the Vocdoni Protocol, a digital voting protocol designed to create, execute, record, and verify voting processes with strong integrity guarantees.',
      }),
      t('process_pdf.voting_system.paragraph_2', {
        defaultValue:
          'When a voting process is created, its configuration is recorded on the blockchain before voting begins, creating a public and auditable record of how the process is intended to work. This includes the voting period, the voting method, the eligible participant set, the questions, and the rules that determine how results are counted. The census defines who is allowed to participate in the process, while preserving the privacy of individual voters.',
      }),
      t('process_pdf.voting_system.paragraph_3', {
        defaultValue:
          'During the voting period, eligible voters authenticate according to the configured method and submit their ballots through the voting system. The protocol is designed so that the process can be verified end to end.',
      }),
      t('process_pdf.voting_system.paragraph_4', {
        defaultValue:
          'Once the voting process is completed, the final results and the relevant process records are anchored in the blockchain. This makes the process auditable and helps ensure that the published report can be compared against public technical records.',
      }),
      t('process_pdf.voting_system.guarantee_lead', {
        defaultValue: 'The Vocdoni Protocol increases trust in the voting process by providing:',
      }),
    ],
    votingSystemBullets: [
      t('process_pdf.voting_system.bullet_1', {
        defaultValue: 'A public record of the voting process configuration',
      }),
      t('process_pdf.voting_system.bullet_2', {
        defaultValue:
          'A census reference that identifies the eligible voter list without revealing voters\u2019 personal data',
      }),
      t('process_pdf.voting_system.bullet_3', {
        defaultValue: 'Cryptographic mechanisms that protect ballot secrecy and voter privacy',
      }),
      t('process_pdf.voting_system.bullet_4', {
        defaultValue: 'Recorded participation and result data that can be independently checked',
      }),
      t('process_pdf.voting_system.bullet_5', {
        defaultValue: 'Tamper-resistant records anchored in blockchain-based infrastructure',
      }),
      t('process_pdf.voting_system.bullet_6', {
        defaultValue: 'Final results that can be compared with the public verification data',
      }),
    ],
    censusParticipation: [
      {
        label: t('process_pdf.census.source', { defaultValue: 'Census source' }),
        value: humanizeCensusType(t, censusType),
      },
      {
        label: t('process_pdf.census.eligible_voters', { defaultValue: 'Eligible voters' }),
        value: totalEligibleParticipants,
      },
      {
        label: t('process_pdf.turnout.submitted_ballots', { defaultValue: 'Submitted ballots' }),
        value: String(count),
      },
      {
        label: t('process_pdf.turnout.voter_participation', { defaultValue: 'Voter participation' }),
        value: `${participationPercentage}%`,
      },
      {
        label: t('process_pdf.census.counting_basis', { defaultValue: 'Counting basis' }),
        value: countingBasisLabel,
      },
      ...(isWeighted
        ? [
            {
              label: t('process_pdf.census.eligible_voting_power', { defaultValue: 'Total eligible voting power' }),
              value: totalEligibleVotingPower,
            },
            {
              label: t('process_pdf.census.voting_power_used', { defaultValue: 'Voting power used' }),
              value: votingPowerUsed,
            },
            {
              label: t('process_pdf.census.weighted_participation', { defaultValue: 'Weighted participation' }),
              value: weightedParticipation,
            },
          ]
        : []),
    ],
    censusParticipationLead: isWeighted
      ? t('process_pdf.turnout.weighted_participation', {
          defaultValue:
            'Submitted ballots count voters who participated. Weighted result totals count the voting power recorded for each answer.',
        })
      : t('process_pdf.turnout.participation', {
          defaultValue:
            'The number of votes cast reflects only those participants who effectively submitted a valid ballot during the defined voting period.',
        }),
    votingProcessIntro: t('process_pdf.voting_process.intro', {
      defaultValue: 'The voting process {{process_name}} consisted of {{count}} questions.',
      count: election.questions.length,
      process_name: eventReference,
    }),
    votingProcessQuestions: hasHiddenResults
      ? []
      : election.questions.map((question, questionIndex) => {
          const choices = getQuestionChoices(
            election,
            questionIndex,
            notAvailableLabel,
            resultDecimals,
            t('process_pdf.voting_process.card.abstain', { defaultValue: 'Abstain' }),
            isWeighted,
            totalEligibleVotingPowerValue
          )
          const questionTotal = getQuestionResultsTotal(election, questionIndex, resultDecimals)

          return {
            question: question.title.default || notAvailableLabel,
            choices,
            totalVotes: String(questionTotal),
            votingMethod: getVotingMethod(election, t, isWeighted),
            countingBasisLabel,
            submittedBallots: String(count),
            votingPowerUsed: String(questionTotal),
            eligibleVotingPower: totalEligibleVotingPower,
            isWeighted,
          }
        }),
    isWeighted,
    resultValueLabel,
    questionTotalLabel,
    resultsHiddenText: hasHiddenResults
      ? t('process_pdf.voting_process.results_hidden', {
          defaultValue: 'Results are hidden until the process reaches the final results stage.',
        })
      : undefined,
    verification: [
      {
        label: t('process_pdf.verification.explorer', { defaultValue: 'View in verification explorer' }),
        value: verificationExplorerLink,
        kind: 'link',
      },
    ],
    verificationProcedures: [
      t('process_pdf.verification.step_1', {
        defaultValue:
          'Open the verification explorer link. This page contains the public technical record of the voting process.',
      }),
      t('process_pdf.verification.step_2', {
        defaultValue:
          'Check that the Process ID in the explorer is identical to the Process ID in this report. This confirms that both documents refer to the same voting process.',
      }),
      t('process_pdf.verification.step_3', {
        defaultValue:
          'Check that the census reference shown in the explorer matches the reference in this report. This confirms that the eligible voter list linked to the process is the same.',
      }),
      t('process_pdf.verification.step_4', {
        defaultValue: 'Check that the number of recorded ballots matches the participation data shown in this report.',
      }),
      t('process_pdf.verification.step_5', {
        defaultValue: isWeighted
          ? 'Compare the final tally in the explorer with the weighted voting-power results shown in this report.'
          : 'Compare the final tally in the explorer with the ballot-count results shown in this report.',
      }),
      t('process_pdf.verification.step_6', {
        defaultValue:
          'For a deeper technical audit, an auditor may inspect the public records in more detail or recompute the tally to confirm that the recorded ballots and final results are consistent.',
      }),
    ],
    issuer: [
      { label: t('process_pdf.issuer.provider', { defaultValue: 'Provider' }), value: 'Vocdoni (Synergize SL)' },
      {
        label: t('process_pdf.issuer.issuing_date', { defaultValue: 'Issuing date' }),
        value:
          formatUtcDate(now) && formatUtcTime(now) ? `${formatUtcDate(now)} ${formatUtcTime(now)}` : notAvailableLabel,
      },
    ],
    disclaimerParagraphs: [
      t('process_pdf.disclaimer.paragraph_1', {
        defaultValue:
          'This document constitutes a technical certification derived from data recorded on the Vocdoni infrastructure.',
      }),
    ],
    disclaimerBullets: [
      t('process_pdf.disclaimer.bullet_1', {
        defaultValue: 'It does not constitute legal certification of the voting process.',
      }),
      t('process_pdf.disclaimer.bullet_2', {
        defaultValue: 'It does not replace official records, minutes, or regulatory filings.',
      }),
      t('process_pdf.disclaimer.bullet_3', {
        defaultValue: 'All data originates from cryptographic and blockchain-based logs.',
      }),
      t('process_pdf.disclaimer.bullet_4', {
        defaultValue: 'Ballot secrecy and voter anonymity are preserved by design.',
      }),
      t('process_pdf.disclaimer.paragraph_2', {
        defaultValue:
          'The technical service provider assumes no responsibility for organizer-provided input data, including census composition, voter weights, legal interpretation of results, or compliance with applicable legal or regulatory frameworks.',
      }),
      t('process_pdf.disclaimer.paragraph_3', {
        defaultValue:
          'Responsibility for legal interpretation and use of this certification rests solely with the requesting organization.',
      }),
    ],
  }
}

export const fetchCensusBundle = async (censusURI?: string | null) => {
  if (!censusURI) return null

  try {
    const response = await fetch(censusURI)
    if (!response.ok) return null
    return (await response.json()) as CensusBundleData
  } catch {
    return null
  }
}

export const useOptionalElectionContext = () => {
  try {
    return useElection()
  } catch {
    return null
  }
}

export const getReportContext = (
  electionContext: ReturnType<typeof useOptionalElectionContext>,
  fallbackElection?: ElectionLike | null
): ElectionReportContext | null => {
  const contextElection = electionContext?.election instanceof PublishedElection ? electionContext.election : undefined
  const election = contextElection ?? (fallbackElection instanceof PublishedElection ? fallbackElection : undefined)

  if (!election) return null

  return {
    election,
    // isWeighted, participation, and turnout are not available in ElectionContextValue v2;
    // resolveReportIsWeighted / getFallbackParticipation will be used as fallbacks.
    isWeighted: undefined,
    participation: undefined,
    turnout: undefined,
  }
}

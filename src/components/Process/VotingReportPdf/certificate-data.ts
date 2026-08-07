import { computeProcessStatus, isSecretUntilTheEnd, processVoteCount } from '@vocdoni/api-client'
import type {
  MultiLangString,
  PublishedVotingProcessResponse,
  QuestionStatus,
  VotingProcessQuestion,
  VotingProcessResponse,
  VotingProcessResultsResponse,
} from '@vocdoni/api-types'
import {
  BallotType,
  decodeQuestionResults,
  inferQuestionBallotType,
  questionReservesAbstain,
  type DecodedQuestionResults,
} from '@vocdoni/ballot'
import { useElection } from '@vocdoni/react-components'
import { type TFunction } from 'i18next'

/** Anything callers may hand us as an election: a typed process response or an untyped record. */
export type ElectionLike = VotingProcessResponse | Record<string, unknown> | null | undefined

/** Minimal client surface the report needs — matches `useApiClient().client.elections`. */
type ReportClientLike = {
  elections?: {
    get?: (id: string) => Promise<VotingProcessResponse>
    getResults?: (id: string) => Promise<VotingProcessResultsResponse>
  }
} | null

type ElectionReportContext = {
  election: PublishedVotingProcessResponse
  results: VotingProcessResultsResponse | null
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

export const notAvailable = (t: TFunction) => t('process_pdf.not_available', { defaultValue: 'Not available' })

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const isVotingProcess = (value: unknown): value is VotingProcessResponse =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.published === 'boolean' &&
  Array.isArray(value.questions)

const downloadableProcessStatuses = new Set<QuestionStatus>(['ENDED', 'CANCELED', 'RESULTS'])

/** The report only makes sense once the process is published and no longer accepting votes. */
export const canDownloadVotingReport = (election?: ElectionLike): election is PublishedVotingProcessResponse =>
  isVotingProcess(election) &&
  election.published &&
  downloadableProcessStatuses.has(computeProcessStatus(election.questions))

/** SaaS multilingual strings key by locale with `default` as the fallback; older data may miss it. */
export const getDefaultText = (value?: MultiLangString | string | null): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.default ?? Object.values(value).find((entry) => typeof entry === 'string' && entry) ?? ''
}

const isLongDenseValue = (value: string) => value.length >= 40 && !/\s/.test(value)

export const shouldStackFieldValue = (value: string) => /^https?:\/\//i.test(value) || isLongDenseValue(value)
export const formatPdfFieldValue = (value: string) => value

const parseDate = (value?: string | null) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

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

const calculatePercentage = (numerator: number, denominator: number) =>
  denominator > 0 ? Math.round((numerator / denominator) * 10000) / 100 : 0

const formatPercentageValue = (value: number) => `${value.toFixed(2)}%`

const formatDecodedPercentage = (percentage: number | null, fallback: string) =>
  percentage === null ? fallback : `${percentage.toFixed(1)}%`

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

/**
 * How many histogram columns one ballot contributes to. The decoded results have
 * one field per pick slot and every ballot fills all of them — slots the voter
 * left unused land in the abstain sentinel — so the column total is
 * `slots x cast voting power`, not the cast power itself. Single-choice
 * questions have exactly one slot, which is why the two only coincide there.
 */
const getBallotPickSlots = (question: VotingProcessQuestion): number => {
  if (inferQuestionBallotType(question) !== BallotType.MultiChoice) return 1
  const slots = question.typeSetup?.maxChoices ?? question.ballotProtocol?.maxCount
  return slots && slots > 0 ? slots : 1
}

/** Voting power actually cast on a question, recovered from its decoded histogram. */
const getCastVotingPower = (question: VotingProcessQuestion, decoded: DecodedQuestionResults | undefined) => {
  if (!decoded) return null
  const columnTotal = decoded.reduce((acc, entry) => acc + entry.votes, 0)
  return columnTotal / getBallotPickSlots(question)
}

const getVotingMethod = (question: VotingProcessQuestion, t: TFunction, isWeighted: boolean) => {
  const base =
    inferQuestionBallotType(question) === BallotType.MultiChoice
      ? t('process.question_type.multiple', { defaultValue: 'Multiple choice' })
      : t('process.question_type.single', { defaultValue: 'Single choice' })

  return isWeighted
    ? t('process_pdf.voting_process.card.weighted_method', {
        defaultValue: '{{base}} with weighted voting',
        base,
      })
    : base
}

const getVoteOverwriteStatus = (election: PublishedVotingProcessResponse, t: TFunction) => {
  const maxVoteOverwrites = election.questions.reduce(
    (max, question) => Math.max(max, question.ballotProtocol?.maxVoteOverwrites ?? 0),
    0
  )

  return maxVoteOverwrites > 0
    ? t('process_pdf.vote_overwrite_enabled', {
        defaultValue: 'Enabled, up to {{votes}} vote overwrites per voter',
        votes: maxVoteOverwrites,
      })
    : t('process_pdf.vote_overwrite_disabled', { defaultValue: 'Disabled' })
}

export const buildCertificateData = ({
  election,
  results,
  t,
  organizationName,
  explorerUrl,
  now,
}: {
  election: PublishedVotingProcessResponse
  results: VotingProcessResultsResponse | null
  t: TFunction
  organizationName?: string
  explorerUrl?: string
  now: Date
}): CertificateData => {
  const notAvailableLabel = notAvailable(t)
  const eventReference = getDefaultText(election.title).trim() || election.id
  const issueDate = formatUtcDate(now) ?? notAvailableLabel
  const issueTime = formatUtcTime(now) ?? notAvailableLabel
  const startDatetime = formatUtcDateTime(parseDate(election.startDate)) ?? notAvailableLabel
  const endDatetime = formatUtcDateTime(parseDate(election.endDate)) ?? notAvailableLabel

  // Ballots cast: per-question counts from the results endpoint; the process-level
  // figure is the max across questions (every voter votes every question).
  const questionsResults = new Map((results?.questions ?? []).map((entry) => [entry.questionId, entry]))
  const count = results ? processVoteCount(results) : null

  // Decode each question's on-chain histogram into per-choice tallies (plus the
  // unified abstain bucket for multichoice questions).
  const decodedByQuestionId = new Map<string, DecodedQuestionResults>()
  for (const question of election.questions) {
    const questionResults = questionsResults.get(question.id)
    if (questionResults?.results?.length) {
      decodedByQuestionId.set(question.id, decodeQuestionResults(question, questionResults.results))
    }
  }

  // Every new-model census is CSP-backed (Memberbase credentials); its identity
  // and 2FA requirements come inline on the process read.
  const censusAuthFields: string[] = election.census?.authFields ?? []
  const censusTwoFaFields: string[] = election.census?.twoFaFields ?? []
  const isWeighted = election.census?.weighted === true
  const eligibleVoters = election.census?.size ?? 0
  const authenticationMethod = t('process_pdf.census_type.csp', { defaultValue: 'Memberbase credentials census' })
  const identitySource =
    censusAuthFields.length > 0
      ? censusAuthFields.map((field) => getIdentityFieldLabel(field, t)).join(', ')
      : notAvailableLabel
  const twoFaEnabledDisabled =
    censusTwoFaFields.length > 0
      ? t('process_pdf.authentication.two_fa_enabled', {
          defaultValue: 'Enabled: voters confirm their identity with a one-time code sent to their personal devices.',
        })
      : t('process_pdf.authentication.two_fa_disabled', {
          defaultValue: 'Disabled: no additional identity check has been configured in this voting process',
        })
  const blockchainNetwork = election.chainId || notAvailableLabel
  const resultsVisibility = isSecretUntilTheEnd(election)
    ? t('results_state.hidden_until_end', { defaultValue: 'Hidden until the end' })
    : t('results_state.live_results', { defaultValue: 'Live results' })
  const totalEligibleParticipants = String(eligibleVoters)
  const participationPercentage = count === null ? null : calculatePercentage(count, eligibleVoters).toFixed(2)
  const hasHiddenResults = isSecretUntilTheEnd(election) && computeProcessStatus(election.questions) !== 'RESULTS'
  const hiddenResultFieldValue = t('process_pdf.results.hidden_field', {
    defaultValue: 'Hidden until final results',
  })
  // Whole-census total voting weight (Σ member weights, saas-backend#595). Response-only
  // and absent on aggregation failure or list reads — absent renders as "Not available"
  // rather than a wrong denominator (resolveReportElection re-fetches the detail for list rows).
  const totalEligibleVotingPowerValue = election.census?.totalWeight ?? null
  const totalEligibleVotingPower =
    totalEligibleVotingPowerValue === null ? notAvailableLabel : String(totalEligibleVotingPowerValue)
  const questionVotingPowerTotals = election.questions.map((question) =>
    getCastVotingPower(question, decodedByQuestionId.get(question.id))
  )
  const knownQuestionTotals = questionVotingPowerTotals.filter((value): value is number => value !== null)
  const votingPowerUsed = hasHiddenResults
    ? hiddenResultFieldValue
    : formatNumberRange(knownQuestionTotals, notAvailableLabel)
  const weightedParticipationValues =
    totalEligibleVotingPowerValue === null
      ? []
      : knownQuestionTotals.map((questionTotal) => calculatePercentage(questionTotal, totalEligibleVotingPowerValue))
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
    {
      label: t('process_pdf.authentication.identity_source', { defaultValue: 'Required voter credentials' }),
      value: identitySource,
    },
    {
      label: t('process_pdf.authentication.two_fa', { defaultValue: 'Additional identity check' }),
      value: twoFaEnabledDisabled,
    },
  ]

  // Each question is its own on-chain (Vochain) process; the explorer only knows
  // those ids, so verification links go per question.
  const questionExplorerLabel = t('process_pdf.verification.explorer', {
    defaultValue: 'View in verification explorer',
  })
  const questionsWithUpstreamId = election.questions.filter((question) => question.upstreamId)
  const verification: CertificateField[] =
    explorerUrl && questionsWithUpstreamId.length > 0
      ? questionsWithUpstreamId.map((question, index) => ({
          label:
            questionsWithUpstreamId.length > 1
              ? `${questionExplorerLabel} — ${t('process_pdf.verification.question_n', {
                  defaultValue: 'Question {{number}}',
                  number: index + 1,
                })}`
              : questionExplorerLabel,
          value: `${explorerUrl}/process/${question.upstreamId}`,
          kind: 'link' as const,
        }))
      : [{ label: questionExplorerLabel, value: notAvailableLabel, kind: 'link' as const }]

  return {
    eventReference,
    processId: election.id,
    issueDate,
    issueTime,
    organizationName: organizationName || election.orgAddress || notAvailableLabel,
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
          'A census reference that identifies the eligible voter list without revealing voters’ personal data',
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
        value: authenticationMethod,
      },
      {
        label: t('process_pdf.census.eligible_voters', { defaultValue: 'Eligible voters' }),
        value: totalEligibleParticipants,
      },
      {
        label: t('process_pdf.turnout.submitted_ballots', { defaultValue: 'Submitted ballots' }),
        value: count === null ? notAvailableLabel : String(count),
      },
      {
        label: t('process_pdf.turnout.voter_participation', { defaultValue: 'Voter participation' }),
        value: participationPercentage === null ? notAvailableLabel : `${participationPercentage}%`,
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
      : election.questions.map((question) => {
          const questionResults = questionsResults.get(question.id)
          const decoded = decodedByQuestionId.get(question.id)
          const decodedChoices = decoded?.filter((entry) => entry.choice !== 'abstain')
          // `decodeQuestionResults` always appends an abstain bucket for pick-slot
          // multichoice, even when the protocol reserves no sentinel headroom and the
          // count is therefore structurally stuck at zero. Mirror the rule
          // `<ElectionResults />` applies so the report and the UI agree on the row
          // count: keep the bucket only when abstaining is possible, or when the tally
          // says it actually happened.
          const decodedAbstain = decoded?.find((entry) => entry.choice === 'abstain')
          const abstainEntry =
            decodedAbstain && (questionReservesAbstain(question) || decodedAbstain.votes > 0)
              ? decodedAbstain
              : undefined
          const questionTotal = getCastVotingPower(question, decoded)

          const choiceRows = question.choices.map((choice, choiceIndex) => ({
            name: getDefaultText(choice.title) || notAvailableLabel,
            votes: decodedChoices?.[choiceIndex]?.votes ?? null,
            percentage: decodedChoices?.[choiceIndex]?.percentage ?? null,
          }))

          if (abstainEntry) {
            choiceRows.push({
              name: t('process_pdf.voting_process.card.abstain', { defaultValue: 'Abstain' }),
              votes: abstainEntry.votes,
              percentage: abstainEntry.percentage,
            })
          }

          const choices: CertificateChoice[] = choiceRows.map(({ name, votes, percentage }) => {
            const votesLabel = votes === null ? notAvailableLabel : String(votes)
            const percentageLabel = formatDecodedPercentage(percentage, notAvailableLabel)
            const eligiblePowerPercentage =
              isWeighted && votes !== null && totalEligibleVotingPowerValue
                ? `${calculatePercentage(votes, totalEligibleVotingPowerValue).toFixed(1)}%`
                : undefined

            return {
              name,
              votes: votesLabel,
              percentage: percentageLabel,
              numericVotes: votes,
              ...(isWeighted
                ? {
                    votingPower: votesLabel,
                    castPowerPercentage: percentageLabel,
                    eligiblePowerPercentage,
                  }
                : {}),
            }
          })

          return {
            question: getDefaultText(question.title) || notAvailableLabel,
            choices,
            totalVotes: questionTotal === null ? notAvailableLabel : String(questionTotal),
            votingMethod: getVotingMethod(question, t, isWeighted),
            countingBasisLabel,
            submittedBallots: questionResults ? String(questionResults.voteCount ?? 0) : notAvailableLabel,
            votingPowerUsed: questionTotal === null ? notAvailableLabel : String(questionTotal),
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
    verification,
    verificationProcedures: [
      t('process_pdf.verification.step_1', {
        defaultValue:
          'Open the verification explorer link of each question. Each page contains the public technical record of that part of the voting process.',
      }),
      t('process_pdf.verification.step_2', {
        defaultValue:
          'Check that each linked page shows the same question and choices as this report. This confirms that the report refers to the same on-chain voting processes.',
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

/** Fetch the per-question results; the route is public but 404s while there are no tallies. */
export const fetchProcessResults = async (
  client: ReportClientLike,
  processId: string
): Promise<VotingProcessResultsResponse | null> => {
  try {
    return (await client?.elections?.getResults?.(processId)) ?? null
  } catch {
    return null
  }
}

/**
 * List reads omit `census.totalWeight` (only `GET /processes/{id}` carries it), so a report
 * triggered from a list row would lose the weighted eligible-power values — re-fetch the
 * detail read for weighted censuses missing it. Falls back to the given election on failure.
 */
export const resolveReportElection = async (
  client: ReportClientLike,
  election: PublishedVotingProcessResponse
): Promise<PublishedVotingProcessResponse> => {
  if (!election.census?.weighted || typeof election.census.totalWeight === 'number') return election
  try {
    const fresh = await client?.elections?.get?.(election.id)
    return fresh && canDownloadVotingReport(fresh) ? fresh : election
  } catch {
    return election
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
  fallbackElection?: ElectionLike
): ElectionReportContext | null => {
  const contextElection = isVotingProcess(electionContext?.election) ? electionContext.election : undefined
  const election = contextElection ?? (isVotingProcess(fallbackElection) ? fallbackElection : undefined)

  if (!canDownloadVotingReport(election)) return null

  return {
    election,
    // Reuse the results the election context already fetched; without a context
    // (e.g. list rows) they are fetched at download time instead.
    results: (contextElection && electionContext?.results) || null,
  }
}

import { Button, HStack, Icon, Link, Menu, Spinner, Text } from '@chakra-ui/react'
import * as ReactPDF from '@react-pdf/renderer'
import { useClient, useOrganization } from '@vocdoni/react-components'
import {
  CensusType,
  dotobject,
  ElectionResultsTypeNames,
  ElectionStatus,
  InvalidElection,
  PublishedElection,
} from '@vocdoni/sdk'
import { type TFunction } from 'i18next'
import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuFileDown } from 'react-icons/lu'
import { useToast } from '~components/Toast'

import logoImport from '/assets/logo_vocdoni.png'
import iconImport from '/assets/vocdoni_icon.png'

const { pdf, Document, Font, Image, Link: PdfLink, Page, StyleSheet, Text: PdfText, View } = ReactPDF

const preventPdfHyphenation = (word: string) => [word]

Font.registerHyphenationCallback(preventPdfHyphenation)

// @react-pdf/renderer uses Node's fs to read images, so it needs real filesystem paths.
// In the test environment Vite resolves asset imports to URL strings (e.g. /assets/…)
// which Node cannot open; use process.cwd() to build the actual path instead.
const assetBase = import.meta.env.VITEST ? `${process.cwd()}/public` : ''
const vocdoniLogo = assetBase ? `${assetBase}/assets/logo_vocdoni.png` : logoImport
const vocdoniIcon = assetBase ? `${assetBase}/assets/vocdoni_icon.png` : iconImport

// SerializedElection (Record<string, any>) is an internal react-components type not exported;
// we define a compatible local alias so this component accepts ElectionLike from useElection().
type ElectionLike = PublishedElection | InvalidElection | Record<string, unknown>

type VotingReportPdfProps = {
  election?: ElectionLike | null
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
  }
}

type CertificateField = {
  label: string
  value: string
}

type CertificateChoice = {
  name: string
  votes: string
  percentage: string
  numericVotes: number | null
}

type CertificateQuestion = {
  question: string
  choices: CertificateChoice[]
  totalVotes: string
  votingMethod: string
}

type CertificateData = {
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
  turnout: CertificateField[]
  votingProcessIntro: string
  votingProcessQuestions: CertificateQuestion[]
  verification: CertificateField[]
  verificationProcedures: string[]
  scopeBullets: string[]
  issuer: CertificateField[]
  disclaimerParagraphs: string[]
  disclaimerBullets: string[]
}

type ReportSection = {
  title: string
  href: string
  page: string
}

type PdfDocumentProps = {
  data: CertificateData
  t: TFunction
}

const downloadableElectionStatuses = new Set([ElectionStatus.RESULTS, ElectionStatus.ENDED, ElectionStatus.CANCELED])

const canDownloadVotingReport = (election?: ElectionLike | null) =>
  election instanceof PublishedElection && downloadableElectionStatuses.has(election.status)

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 56,
    paddingTop: 36,
    paddingBottom: 56,
    fontFamily: 'Helvetica',
    fontSize: 9.25,
    lineHeight: 1.5,
    color: '#172033',
    backgroundColor: '#fbfcfe',
  },
  coverPage: {
    paddingHorizontal: 62,
    paddingTop: 52,
    paddingBottom: 52,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.5,
    color: '#172033',
    backgroundColor: '#fbfcfe',
  },
  coverAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 20,
    backgroundColor: '#111827',
  },
  coverHairline: {
    width: 52,
    height: 3,
    backgroundColor: '#18a3a8',
    marginBottom: 20,
  },
  header: {
    marginBottom: 28,
    alignItems: 'flex-start',
  },
  coverContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  runningHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 26,
    paddingBottom: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#dde3eb',
  },
  pageBrand: {
    alignItems: 'flex-start',
  },
  pageBrandIcon: {
    width: 18,
    height: 18,
    objectFit: 'contain',
  },
  logo: {
    width: 128,
    height: 28,
    objectFit: 'contain',
    marginBottom: 28,
  },
  titleBlock: {
    alignItems: 'flex-start',
    maxWidth: 420,
  },
  titlePrefix: {
    fontSize: 23,
    fontWeight: 700,
    lineHeight: 1.06,
    color: '#111827',
    textAlign: 'left',
  },
  titleProcess: {
    fontSize: 24,
    fontWeight: 700,
    color: '#18a3a8',
    textAlign: 'left',
    lineHeight: 1.12,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 8.5,
    color: '#697386',
    textAlign: 'left',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#d8dee8',
  },
  coverIntroPanel: {
    marginTop: 'auto',
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#d8dee8',
  },
  issuedLine: {
    marginTop: 10,
    fontSize: 8.5,
    color: '#4b5563',
  },
  section: {
    marginBottom: 18,
    paddingTop: 1,
  },
  sectionTitle: {
    fontSize: 12.5,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#18a3a8',
  },
  sectionLead: {
    marginTop: 8,
    marginBottom: 0,
    color: '#3f4b5f',
  },
  keyValueTable: {
    borderWidth: 1,
    borderColor: '#dfe5ee',
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 6.5,
    paddingHorizontal: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#edf1f6',
    alignItems: 'flex-start',
  },
  fieldRowStacked: {
    flexDirection: 'column',
    gap: 3,
    paddingVertical: 6.5,
    paddingHorizontal: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#edf1f6',
  },
  lastFieldRow: {
    borderBottomWidth: 0,
  },
  fieldLabel: {
    width: '37%',
    fontWeight: 700,
    color: '#4b5563',
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  fieldValue: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    width: '63%',
    color: '#172033',
    wordBreak: 'break-all',
  },
  fieldValueStacked: {
    width: '100%',
    color: '#172033',
  },
  paragraph: {
    marginBottom: 7.5,
    color: '#2f3a4c',
  },
  italicText: {
    fontStyle: 'italic',
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 4.5,
  },
  bulletMarker: {
    width: 10,
    flexShrink: 0,
    color: '#18a3a8',
    fontWeight: 700,
  },
  bulletText: {
    flex: 1,
    color: '#2f3a4c',
  },
  questionCard: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e1e7ef',
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  questionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 5,
  },
  questionMeta: {
    fontSize: 8.5,
    color: '#5f6b7a',
    marginBottom: 5,
  },
  questionResultsLabel: {
    fontSize: 8,
    color: '#697386',
    marginTop: 4,
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questionSummaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  questionSummaryPill: {
    paddingVertical: 4.5,
    paddingHorizontal: 7,
    backgroundColor: '#f3f6fa',
    borderRadius: 2,
  },
  questionSummaryVotesPill: {
    width: '30%',
  },
  questionSummaryOutcomePill: {
    width: '66%',
    flexShrink: 1,
    minWidth: 0,
  },
  questionSummaryLabel: {
    fontSize: 7.25,
    color: '#697386',
    textTransform: 'uppercase',
    letterSpacing: 0.35,
    marginBottom: 2,
  },
  questionSummaryValue: {
    fontSize: 8.75,
    color: '#172033',
    fontWeight: 700,
    lineHeight: 1.25,
  },
  questionOutcome: {
    fontSize: 8.5,
    color: '#172033',
    marginTop: 7,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#edf1f6',
  },
  indexIntro: {
    marginBottom: 14,
    color: '#4b5563',
  },
  indexRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    minHeight: 30,
    paddingVertical: 7,
  },
  indexLabel: {
    flexShrink: 0,
    paddingRight: 8,
    fontSize: 9.5,
    lineHeight: 1.25,
    color: '#172033',
  },
  indexLeader: {
    flexGrow: 1,
    flexShrink: 1,
    height: 1,
    marginRight: 8,
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomStyle: 'dotted',
    borderBottomColor: '#a8b3c2',
  },
  indexPage: {
    width: 20,
    textAlign: 'right',
    color: '#172033',
    fontSize: 9,
    fontWeight: 400,
  },
  indexLink: {
    color: '#172033',
    textDecoration: 'none',
  },
  resultTable: {
    borderTopWidth: 1,
    borderTopColor: '#e1e7ef',
  },
  resultHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e8edf4',
  },
  resultHeaderOption: {
    width: '64%',
    fontSize: 7.25,
    fontWeight: 700,
    color: '#697386',
    textTransform: 'uppercase',
    letterSpacing: 0.45,
  },
  resultHeaderVotes: {
    width: '13%',
    fontSize: 7.25,
    fontWeight: 700,
    textAlign: 'right',
    color: '#697386',
    textTransform: 'uppercase',
    letterSpacing: 0.45,
  },
  resultHeaderShare: {
    width: '17%',
    fontSize: 7.25,
    fontWeight: 700,
    textAlign: 'right',
    color: '#697386',
    textTransform: 'uppercase',
    letterSpacing: 0.45,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6.25,
    borderBottomWidth: 1,
    borderBottomColor: '#edf1f6',
  },
  resultOptionCell: {
    width: '64%',
  },
  resultValueCell: {
    width: '13%',
  },
  resultShareCell: {
    width: '17%',
  },
  resultChoiceName: {
    fontSize: 8.7,
    color: '#2f3a4c',
    marginBottom: 4,
  },
  resultChoiceNameWinner: {
    color: '#111827',
    fontWeight: 700,
  },
  resultValueText: {
    fontSize: 8.75,
    color: '#111827',
    textAlign: 'right',
    fontWeight: 700,
  },
  resultShareText: {
    fontSize: 8.5,
    color: '#3f4b5f',
    textAlign: 'right',
  },
  resultBarTrack: {
    height: 4,
    width: '100%',
    backgroundColor: '#edf2f7',
    borderRadius: 2,
  },
  resultBarFill: {
    height: 4,
    backgroundColor: '#9fb0c3',
    borderRadius: 2,
  },
  resultBarFillWinner: {
    backgroundColor: '#18a3a8',
  },
  legalNotice: {
    marginTop: 'auto',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#d8dee8',
  },
  pageFooter: {
    position: 'absolute',
    left: 56,
    right: 56,
    bottom: 39,
    borderTopWidth: 1,
    borderTopColor: '#c7d0dd',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 22,
    left: 56,
    right: 56,
    textAlign: 'right',
    color: '#111827',
    fontSize: 11,
    fontWeight: 700,
  },
  footerTitle: {
    fontSize: 8.5,
    fontWeight: 700,
    color: '#111827',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footerParagraph: {
    fontSize: 7.25,
    color: '#4b5563',
    marginBottom: 3,
    lineHeight: 1.25,
  },
  smallText: {
    fontSize: 9,
    color: '#697386',
  },
})

const sanitizeFileName = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const notAvailable = (t: TFunction) => t('process_pdf.not_available', { defaultValue: 'Not available' })

const isLongDenseValue = (value: string) => value.length >= 40 && !/\s/.test(value)

const shouldStackFieldValue = (value: string) => /^https?:\/\//i.test(value) || isLongDenseValue(value)
const formatPdfFieldValue = (value: string) => value

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

const humanizeCensusType = (t: TFunction, censusType?: string | null) => {
  switch (censusType) {
    case CensusType.CSP:
      return t('process_pdf.census_type.csp', { defaultValue: 'Authentication using voters credentials' })
    case CensusType.WEIGHTED:
      return t('process_pdf.census_type.weighted', {
        defaultValue: 'Census directly provided by the organization using a spreadsheet or Web3 wallets',
      })
    case CensusType.ANONYMOUS:
      return t('process_pdf.census_type.anonymous', {
        defaultValue: 'Authentication using voters credentials with enhanced voter anonymity',
      })
    default:
      return t('process_pdf.census_type.unknown', { defaultValue: 'Not available' })
  }
}

const formatMaybeString = (value?: string | number | null, fallback?: string) => {
  if (value === null || typeof value === 'undefined' || value === '') return fallback ?? ''
  return String(value)
}

const getQuestionVotes = (election: PublishedElection, questionIndex: number) => {
  const results = election.results?.[questionIndex] ?? []
  const numericVotes = results
    .map((vote) => Number(vote))
    .filter((vote) => Number.isFinite(vote))
    .reduce((acc, vote) => acc + vote, 0)

  return Number.isFinite(numericVotes) && numericVotes > 0 ? numericVotes : (election.voteCount ?? 0)
}

const getQuestionChoices = (election: PublishedElection, questionIndex: number, notAvailableLabel: string) => {
  const question = election.questions[questionIndex]
  const votesForQuestion = getQuestionVotes(election, questionIndex)
  const counts = election.results?.[questionIndex] ?? []

  const choices = question.choices.map((choice, choiceIndex) => {
    const rawVotes = counts[choiceIndex] ?? choice.results ?? choice.answer
    const numericVotes = Number(rawVotes)
    const hasNumericVotes = Number.isFinite(numericVotes)
    const votes = hasNumericVotes ? String(numericVotes) : formatMaybeString(rawVotes, notAvailableLabel)
    const percentage =
      hasNumericVotes && votesForQuestion > 0
        ? `${((numericVotes / votesForQuestion) * 100).toFixed(2)}%`
        : notAvailableLabel

    return {
      name: choice.title.default,
      votes,
      percentage,
      numericVotes: hasNumericVotes ? numericVotes : null,
    }
  })

  return choices
}

const getVotingMethod = (election: PublishedElection, t: TFunction) => {
  return election.resultsType?.name === ElectionResultsTypeNames.MULTIPLE_CHOICE
    ? t('process.question_type.multiple', { defaultValue: 'Multiple choice' })
    : t('process.question_type.single', { defaultValue: 'Single choice' })
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

export const buildCertificateData = ({
  election,
  t,
  organizationName,
  explorerUrl,
  censusBundle,
  now,
}: {
  election: PublishedElection
  t: TFunction
  organizationName?: string
  explorerUrl?: string
  censusBundle?: CensusBundleData | null
  now: Date
}): CertificateData => {
  const notAvailableLabel = notAvailable(t)
  const eventReference = election.title.default?.trim() || election.id
  const issueDate = formatUtcDate(now) ?? notAvailableLabel
  const issueTime = formatUtcTime(now) ?? notAvailableLabel
  const startDatetime = formatUtcDateTime(election.startDate) ?? notAvailableLabel
  const endDatetime = formatUtcDateTime(election.endDate) ?? notAvailableLabel
  const verificationExplorerLink = explorerUrl ? `${explorerUrl}/process/${election.id}` : notAvailableLabel
  const count = election.voteCount ?? 0
  const censusMeta = dotobject(election.meta || {}, 'census') as
    | { type?: string; fields?: string[]; salt?: string }
    | undefined
  const censusType = election.census.type
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
  const resultsVisibility = election.electionType?.secretUntilTheEnd
    ? t('results_state.hidden_until_end', { defaultValue: 'Hidden until the end' })
    : t('results_state.live_results', { defaultValue: 'Live results' })
  const totalEligibleParticipants = String(election.census?.size ?? election.maxCensusSize ?? 0)
  const turnoutPercentage =
    totalEligibleParticipants !== '0' ? ((count / Number(totalEligibleParticipants)) * 100).toFixed(2) : '0.00'

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
        label: t('process_pdf.general.network', { defaultValue: 'Network' }),
        value: blockchainNetwork,
      },
      {
        label: t('process_pdf.general.extended_process_details', { defaultValue: 'Extended process details' }),
        value: verificationExplorerLink,
      },
      {
        label: t('process_pdf.general.vote_overwrite', { defaultValue: 'Vote overwrite' }),
        value: getVoteOverwriteStatus(election, t),
      },
    ],
    authentication: [
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
    ],
    votingSystemParagraphs: [
      t('process_pdf.voting_system.paragraph', {
        defaultValue:
          'Voting and tallying operations were executed using Vocdoni, a digital voting protocol supported by:',
      }),
      t('process_pdf.voting_system.guarantee_lead', { defaultValue: 'The system guarantees:' }),
    ],
    votingSystemBullets: [
      t('process_pdf.voting_system.bullet_1', {
        defaultValue: 'Distributed ledger (blockchain) infrastructure',
      }),
      t('process_pdf.voting_system.bullet_2', {
        defaultValue: 'Cryptographic verification and integrity mechanisms',
      }),
      t('process_pdf.voting_system.guarantee_1', { defaultValue: 'Integrity of the voting process' }),
      t('process_pdf.voting_system.guarantee_2', { defaultValue: 'Immutability of recorded data' }),
      t('process_pdf.voting_system.guarantee_3', { defaultValue: 'Independent verifiability of results' }),
      t('process_pdf.voting_system.guarantee_4', { defaultValue: 'Confidentiality of individual ballots' }),
    ],
    turnout: [
      {
        label: t('process_pdf.turnout.eligible', { defaultValue: 'Total number of eligible participants' }),
        value: totalEligibleParticipants,
      },
      {
        label: t('process_pdf.turnout.votes_cast', { defaultValue: 'Total number of votes cast' }),
        value: String(count),
      },
      { label: t('process_pdf.turnout.rate', { defaultValue: 'Turnout rate' }), value: `${turnoutPercentage}%` },
    ],
    votingProcessIntro: t('process_pdf.voting_process.intro', {
      defaultValue: 'The voting process {{process_name}} consisted of {{count}} questions.',
      count: election.questions.length,
      process_name: eventReference,
    }),
    votingProcessQuestions: election.questions.map((question, questionIndex) => {
      const choices = getQuestionChoices(election, questionIndex, notAvailableLabel)

      return {
        question: question.title.default || notAvailableLabel,
        choices: choices.map(({ name, votes, percentage, numericVotes }) => ({
          name,
          votes,
          percentage,
          numericVotes,
        })),
        totalVotes: String(getQuestionVotes(election, questionIndex)),
        votingMethod: getVotingMethod(election, t),
      }
    }),
    verification: [
      {
        label: t('process_pdf.verification.explorer', { defaultValue: 'Verification explorer' }),
        value: verificationExplorerLink,
      },
    ],
    verificationProcedures: [
      t('process_pdf.verification.step_1', { defaultValue: 'Retrieve the process data via the explorer.' }),
      t('process_pdf.verification.step_2', {
        defaultValue: 'Validate the process root hash against the published value.',
      }),
      t('process_pdf.verification.step_3', {
        defaultValue: 'Confirm consistency of census reference and ballot records.',
      }),
      t('process_pdf.verification.step_4', {
        defaultValue: 'Recompute and verify tally results where applicable.',
      }),
    ],
    scopeBullets: [
      t('process_pdf.scope.configuration', { defaultValue: 'Configuration of the voting process' }),
      t('process_pdf.scope.census', { defaultValue: 'Definition of the electoral census' }),
      t('process_pdf.scope.period', { defaultValue: 'Voting period enforcement' }),
      t('process_pdf.scope.participation', { defaultValue: 'Recording of participation data' }),
      t('process_pdf.scope.tally', { defaultValue: 'Automated tallying mechanisms' }),
      t('process_pdf.scope.results', { defaultValue: 'Final computed results' }),
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
          'This document constitutes a technical certification derived from data recorded through the Vocdoni Protocol.',
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
          'The technical service provider assumes no responsibility for the accuracy of input data (e.g., census composition), legal interpretation of results, or compliance with applicable legal or regulatory frameworks.',
      }),
      t('process_pdf.disclaimer.paragraph_3', {
        defaultValue:
          'Responsibility for legal interpretation and use of this certification rests solely with the requesting organization.',
      }),
    ],
  }
}

const fetchCensusBundle = async (censusURI?: string | null) => {
  if (!censusURI) return null

  try {
    const response = await fetch(censusURI)
    if (!response.ok) return null
    return (await response.json()) as CensusBundleData
  } catch {
    return null
  }
}

const SectionTitle = ({ children }: { children: string }) => <PdfText style={styles.sectionTitle}>{children}</PdfText>

const ReportSectionBlock = ({ children }: { children: ReactNode }) => (
  <View wrap={false} style={styles.section}>
    {children}
  </View>
)

const KeyValueList = ({ items }: { items: CertificateField[] }) => (
  <View style={styles.keyValueTable}>
    {items.map((item, index) => {
      const isLast = index === items.length - 1
      const rowStyle = shouldStackFieldValue(item.value) ? styles.fieldRowStacked : styles.fieldRow

      return (
        <View key={item.label} style={[rowStyle, isLast ? styles.lastFieldRow : {}]}>
          <PdfText style={styles.fieldLabel}>{item.label}:</PdfText>
          <PdfText style={shouldStackFieldValue(item.value) ? styles.fieldValueStacked : styles.fieldValue}>
            {formatPdfFieldValue(item.value)}
          </PdfText>
        </View>
      )
    })}
  </View>
)

const BulletList = ({ items }: { items: string[] }) => (
  <View>
    {items.map((item, index) => (
      <View key={`${item}-${index}`} style={styles.bulletRow}>
        <PdfText style={styles.bulletMarker}>-</PdfText>
        <PdfText style={styles.bulletText}>{item}</PdfText>
      </View>
    ))}
  </View>
)

const NumberedList = ({ items }: { items: string[] }) => (
  <View>
    {items.map((item, index) => (
      <View key={`${item}-${index}`} style={styles.bulletRow}>
        <PdfText style={styles.bulletMarker}>{`${index + 1}.`}</PdfText>
        <PdfText style={styles.bulletText}>{item}</PdfText>
      </View>
    ))}
  </View>
)

const buildReportSections = (t: TFunction): ReportSection[] => [
  {
    title: t('process_pdf.document.sections.general_information', { defaultValue: '1. General Information' }),
    href: '#report-page-3',
    page: '1',
  },
  {
    title: t('process_pdf.document.sections.authentication', { defaultValue: '2. Authentication' }),
    href: '#report-page-3',
    page: '1',
  },
  {
    title: t('process_pdf.document.sections.voting_system', { defaultValue: '3. Voting System' }),
    href: '#report-page-3',
    page: '1',
  },
  {
    title: t('process_pdf.document.sections.turnout_participation', { defaultValue: '4. Turnout and Participation' }),
    href: '#report-page-3',
    page: '1',
  },
  {
    title: t('process_pdf.document.sections.voting_process', { defaultValue: '5. Voting Process' }),
    href: '#report-page-4',
    page: '2',
  },
  {
    title: t('process_pdf.document.sections.verification', { defaultValue: '6. Verification' }),
    href: '#report-page-4',
    page: '2',
  },
  {
    title: t('process_pdf.document.sections.certification_scope', { defaultValue: '7. Certification Scope' }),
    href: '#report-page-5',
    page: '3',
  },
  {
    title: t('process_pdf.document.sections.issuer', { defaultValue: '8. Issuer' }),
    href: '#report-page-5',
    page: '3',
  },
]

const Paragraphs = ({ items }: { items: string[] }) => (
  <View>
    {items.map((item, index) => (
      <PdfText key={`${item}-${index}`} style={styles.paragraph}>
        {item}
      </PdfText>
    ))}
  </View>
)

const getPercentageNumber = (percentage: string) => {
  const value = Number(percentage.replace('%', '').replace(',', '.'))
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, value))
}

const getResultBarWidth = (choice: CertificateChoice) => {
  const percentage = getPercentageNumber(choice.percentage)
  const hasVotes = (choice.numericVotes ?? 0) > 0
  if (!hasVotes && percentage <= 0) return '0%'

  return `${Math.max(percentage, 2)}%`
}

const getHighestChoiceVotes = (choices: CertificateChoice[]) => {
  const numericVotes = choices
    .map((choice) => choice.numericVotes)
    .filter((votes): votes is number => typeof votes === 'number' && Number.isFinite(votes))

  return numericVotes.length ? Math.max(...numericVotes) : null
}

const ResultBarRow = ({ choice, isWinner }: { choice: CertificateChoice; isWinner: boolean }) => (
  <View wrap={false} style={styles.resultRow}>
    <View style={styles.resultOptionCell}>
      <PdfText style={[styles.resultChoiceName, isWinner ? styles.resultChoiceNameWinner : {}]}>{choice.name}</PdfText>
      <View style={styles.resultBarTrack}>
        <View
          style={[
            styles.resultBarFill,
            isWinner ? styles.resultBarFillWinner : {},
            { width: getResultBarWidth(choice) },
          ]}
        />
      </View>
    </View>
    <View style={styles.resultValueCell}>
      <PdfText style={styles.resultValueText}>{choice.votes}</PdfText>
    </View>
    <View style={styles.resultShareCell}>
      <PdfText style={styles.resultShareText}>{choice.percentage}</PdfText>
    </View>
  </View>
)

const getReportPageNumber = (pageNumber: number) => pageNumber - 2

const PageFooterLine = () => <View fixed style={styles.pageFooter} />

const ReportPageNumber = ({ label }: { label: string }) => (
  <PdfText fixed style={styles.pageNumber} render={({ pageNumber }) => `${label} ${getReportPageNumber(pageNumber)}`} />
)

const RunningHeader = () => (
  <View fixed style={styles.runningHeader}>
    <View style={styles.pageBrand}>
      <Image src={vocdoniIcon} style={styles.pageBrandIcon} />
    </View>
  </View>
)

const VotingCertificateDocument = ({ data, t }: PdfDocumentProps) => {
  const reportSections = buildReportSections(t)
  const pageNumberLabel = t('process_pdf.document.page_number', { defaultValue: 'Page' })

  return (
    <Document>
      <Page
        size='A4'
        style={styles.coverPage}
        bookmark={t('process_pdf.document.bookmarks.index', { defaultValue: 'Index' })}
      >
        <View style={styles.coverAccent} />
        <View style={styles.coverContent}>
          <View style={styles.header}>
            <Image src={vocdoniLogo} style={styles.logo} />
            <View style={styles.coverHairline} />
            <View style={styles.titleBlock}>
              <PdfText style={styles.titlePrefix} hyphenationCallback={(word) => [word]}>
                {t('process_pdf.document.title_prefix', {
                  defaultValue: 'TECHNICAL CERTIFICATION OF THE DIGITAL VOTING PROCESS',
                })}
              </PdfText>
              <PdfText style={styles.titleProcess} hyphenationCallback={(word) => [word]}>
                {data.eventReference}
              </PdfText>
            </View>
            <PdfText style={styles.subtitle}>
              {t('process_pdf.document.process_id', {
                defaultValue: 'Process ID: {{process_id}}',
                process_id: data.processId,
              })}
            </PdfText>
          </View>

          <View style={styles.coverIntroPanel}>
            <Paragraphs items={data.introParagraphs} />
            <PdfText style={styles.issuedLine}>
              {t('process_pdf.document.issued_by', {
                defaultValue:
                  'Issued by Vocdoni (Synergize SL) on {{issue_date}} at {{issue_time}}, in its capacity as technical service provider.',
                issue_date: data.issueDate,
                issue_time: data.issueTime,
              })}
            </PdfText>
          </View>
        </View>
      </Page>

      <Page size='A4' style={styles.page}>
        <RunningHeader />

        <ReportSectionBlock>
          <SectionTitle>{t('process_pdf.document.index.title', { defaultValue: 'Index' })}</SectionTitle>
          <PdfText style={styles.indexIntro}>
            {t('process_pdf.document.index.intro', {
              defaultValue: 'This report is organized into the following sections:',
            })}
          </PdfText>
          <View>
            {reportSections.map((section) => (
              <PdfLink key={section.title} src={section.href} style={styles.indexLink}>
                <View wrap={false} style={styles.indexRow}>
                  <PdfText style={styles.indexLabel}>{section.title}</PdfText>
                  <View style={styles.indexLeader} />
                  <PdfText style={styles.indexPage}>{section.page}</PdfText>
                </View>
              </PdfLink>
            ))}
          </View>
        </ReportSectionBlock>
      </Page>

      <Page
        size='A4'
        style={styles.page}
        id='report-page-3'
        bookmark={t('process_pdf.document.bookmarks.general_information', { defaultValue: 'General Information' })}
      >
        <RunningHeader />
        <PageFooterLine />
        <ReportPageNumber label={pageNumberLabel} />

        <ReportSectionBlock>
          <SectionTitle>
            {t('process_pdf.document.sections.general_information', { defaultValue: '1. General Information' })}
          </SectionTitle>
          <KeyValueList items={data.generalInformation} />
        </ReportSectionBlock>

        <ReportSectionBlock>
          <SectionTitle>
            {t('process_pdf.document.sections.authentication', { defaultValue: '2. Authentication' })}
          </SectionTitle>
          <KeyValueList items={data.authentication} />
        </ReportSectionBlock>

        <ReportSectionBlock>
          <SectionTitle>
            {t('process_pdf.document.sections.voting_system', { defaultValue: '3. Voting System' })}
          </SectionTitle>
          <Paragraphs items={data.votingSystemParagraphs} />
          <BulletList items={data.votingSystemBullets} />
          <PdfText style={styles.paragraph}>
            {t('process_pdf.voting_system.executed_on', {
              defaultValue: 'The process was executed on the {{blockchain_network}} infrastructure.',
              blockchain_network: data.blockchainNetwork,
            })}
          </PdfText>
        </ReportSectionBlock>

        <ReportSectionBlock>
          <SectionTitle>
            {t('process_pdf.document.sections.turnout_participation', { defaultValue: '4. Turnout and Participation' })}
          </SectionTitle>
          <KeyValueList items={data.turnout} />
          <PdfText style={styles.sectionLead}>
            {t('process_pdf.turnout.participation', {
              defaultValue:
                'The number of votes cast reflects only those participants who effectively submitted a valid ballot during the defined voting period.',
            })}
          </PdfText>
        </ReportSectionBlock>
      </Page>

      <Page
        size='A4'
        style={styles.page}
        id='report-page-4'
        bookmark={t('process_pdf.document.bookmarks.voting_process', { defaultValue: 'Voting Process' })}
      >
        <RunningHeader />
        <PageFooterLine />
        <ReportPageNumber label={pageNumberLabel} />

        <ReportSectionBlock>
          <SectionTitle>
            {t('process_pdf.document.sections.voting_process', { defaultValue: '5. Voting Process' })}
          </SectionTitle>
          <PdfText style={styles.paragraph}>
            {data.votingProcessIntro.split(data.eventReference)[0]}
            <PdfText style={styles.italicText}>{data.eventReference}</PdfText>
            {data.votingProcessIntro.split(data.eventReference)[1]}
          </PdfText>
          {data.votingProcessQuestions.length > 0 ? (
            data.votingProcessQuestions.map((question, index) => {
              const highestVotes = getHighestChoiceVotes(question.choices)

              return (
                <View key={`${question.question}-${index}`} wrap={false} style={styles.questionCard}>
                  <PdfText style={styles.questionTitle}>{question.question}</PdfText>
                  <View style={styles.questionSummaryRow}>
                    <View style={[styles.questionSummaryPill, styles.questionSummaryVotesPill]}>
                      <PdfText style={styles.questionSummaryLabel}>
                        {t('process_pdf.voting_process.card.item', {
                          defaultValue: 'Total votes',
                          index: index + 1,
                        })}
                      </PdfText>
                      <PdfText style={styles.questionSummaryValue}>
                        {t('process_pdf.voting_process.card.participation_short', {
                          defaultValue: '{{votes}} votes',
                          votes: question.totalVotes,
                        })}
                      </PdfText>
                    </View>
                    <View style={[styles.questionSummaryPill, styles.questionSummaryOutcomePill]}>
                      <PdfText style={styles.questionSummaryLabel}>
                        {t('process_pdf.voting_process.card.outcome_label', { defaultValue: 'Voting method' })}
                      </PdfText>
                      <PdfText style={styles.questionSummaryValue}>{question.votingMethod}</PdfText>
                    </View>
                  </View>
                  <PdfText style={styles.questionResultsLabel}>
                    {t('process_pdf.voting_process.card.results', { defaultValue: 'Results:' })}
                  </PdfText>
                  {question.choices.length > 0 ? (
                    <View style={styles.resultTable}>
                      <View style={styles.resultHeaderRow}>
                        <PdfText style={styles.resultHeaderOption}>
                          {t('process_pdf.voting_process.card.option', { defaultValue: 'Option' })}
                        </PdfText>
                        <PdfText style={styles.resultHeaderVotes}>
                          {t('process_pdf.voting_process.card.votes', { defaultValue: 'Votes' })}
                        </PdfText>
                        <PdfText style={styles.resultHeaderShare}>
                          {t('process_pdf.voting_process.card.share', { defaultValue: 'Share' })}
                        </PdfText>
                      </View>
                      {question.choices.map((choice) => (
                        <ResultBarRow
                          key={`${choice.name}-${choice.votes}-result`}
                          choice={choice}
                          isWinner={highestVotes !== null && highestVotes > 0 && choice.numericVotes === highestVotes}
                        />
                      ))}
                    </View>
                  ) : (
                    <PdfText style={styles.smallText}>{data.notAvailableLabel}</PdfText>
                  )}
                </View>
              )
            })
          ) : (
            <PdfText style={styles.smallText}>{data.notAvailableLabel}</PdfText>
          )}
        </ReportSectionBlock>

        <ReportSectionBlock>
          <SectionTitle>
            {t('process_pdf.document.sections.verification', { defaultValue: '6. Verification' })}
          </SectionTitle>
          <PdfText style={styles.paragraph}>
            {t('process_pdf.verification.paragraph', {
              defaultValue:
                'All process data has been recorded on a blockchain-based infrastructure and may be independently verified through the following public explorer:',
            })}
          </PdfText>
          <KeyValueList items={data.verification} />
          <PdfText style={styles.paragraph}>
            {t('process_pdf.verification.procedure_title', { defaultValue: 'Verification Procedure' })}
          </PdfText>
          <NumberedList items={data.verificationProcedures} />
        </ReportSectionBlock>
      </Page>
      <Page
        size='A4'
        style={styles.page}
        wrap
        id='report-page-5'
        bookmark={t('process_pdf.document.bookmarks.issuer', { defaultValue: 'Issuer' })}
      >
        <RunningHeader />
        <PageFooterLine />
        <ReportPageNumber label={pageNumberLabel} />
        <ReportSectionBlock>
          <SectionTitle>
            {t('process_pdf.document.sections.certification_scope', { defaultValue: '7. Certification Scope' })}
          </SectionTitle>
          <PdfText style={styles.paragraph}>
            {t('process_pdf.scope.paragraph', {
              defaultValue: 'This certification covers exclusively the following technical aspects:',
            })}
          </PdfText>
          <BulletList items={data.scopeBullets} />
          <PdfText style={styles.paragraph}>
            {t('process_pdf.scope.exclusion', {
              defaultValue:
                'This certification does not cover governance rules, eligibility criteria correctness, or legal compliance.',
            })}
          </PdfText>
        </ReportSectionBlock>
        <ReportSectionBlock>
          <SectionTitle>{t('process_pdf.document.sections.issuer', { defaultValue: '8. Issuer' })}</SectionTitle>
          <KeyValueList items={data.issuer} />
          <PdfText style={styles.paragraph}>
            {t('process_pdf.issuer.paragraph', {
              defaultValue: 'Issued on behalf of the organizing entity in its role as technical service provider.',
            })}
          </PdfText>
        </ReportSectionBlock>

        <View wrap={false} style={styles.legalNotice}>
          <PdfText style={styles.footerTitle}>
            {t('process_pdf.disclaimer.title', { defaultValue: 'Disclaimer' })}
          </PdfText>
          <PdfText style={styles.footerParagraph}>
            {t('process_pdf.disclaimer.paragraph_1', {
              defaultValue:
                'This document constitutes a technical certification derived from data recorded through the Vocdoni Protocol.',
            })}
          </PdfText>
          <PdfText style={styles.footerParagraph}>
            {t('process_pdf.disclaimer.paragraph_2', {
              defaultValue:
                'The technical service provider assumes no responsibility for the accuracy of input data, the legal interpretation of results, or compliance with applicable legal or regulatory frameworks.',
            })}
          </PdfText>
          <PdfText style={styles.footerParagraph}>
            {t('process_pdf.disclaimer.paragraph_3', {
              defaultValue:
                'Responsibility for legal interpretation and use of this certification rests solely with the requesting organization.',
            })}
          </PdfText>
        </View>
      </Page>
    </Document>
  )
}

const useVotingReportPdfDownload = (election?: ElectionLike | null) => {
  const { t } = useTranslation()
  const toast = useToast()
  const { client } = useClient()
  const { organization } = useOrganization()
  const [isGenerating, setIsGenerating] = useState(false)

  const download = async () => {
    if (!(election instanceof PublishedElection) || isGenerating) return

    setIsGenerating(true)
    try {
      const censusBundle =
        election.census.type === CensusType.CSP ? await fetchCensusBundle(election.census.censusURI) : null
      const data = buildCertificateData({
        election,
        t,
        organizationName: organization?.account?.name?.default,
        explorerUrl: client?.explorerUrl,
        censusBundle,
        now: new Date(),
      })
      const blob = await pdf(<VotingCertificateDocument data={data} t={t} />).toBlob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${sanitizeFileName(election.title.default || 'voting-certificate')}-${sanitizeFileName(election.id)}.pdf`
      anchor.rel = 'noopener noreferrer'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      toast({
        title: t('process_pdf.download_error', { defaultValue: 'Could not generate the PDF report' }),
        type: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return { download, isGenerating }
}

export const VotingReportPdfButton = ({ election }: VotingReportPdfProps) => {
  const { t } = useTranslation()
  const { download, isGenerating } = useVotingReportPdfDownload(election)

  if (!canDownloadVotingReport(election)) return null

  return (
    <Button
      asChild
      variant='outline'
      colorPalette='gray'
      w='full'
      size='sm'
      justifyContent='start'
      loading={isGenerating}
      loadingText={t('process_pdf.downloading', { defaultValue: 'Generating PDF' })}
    >
      <Link as='button' variant='button' onClick={download}>
        <HStack gap={2}>
          <Icon as={LuFileDown} />
          <Text as='span'>{t('process_pdf.download', { defaultValue: 'Election report (PDF)' })}</Text>
        </HStack>
      </Link>
    </Button>
  )
}

export const VotingReportPdfMenuItem = ({ election }: VotingReportPdfProps) => {
  const { t } = useTranslation()
  const { download, isGenerating } = useVotingReportPdfDownload(election)

  if (!canDownloadVotingReport(election)) return null

  return (
    <Menu.Item value='download-pdf' onClick={download} disabled={isGenerating}>
      {isGenerating ? <Spinner size='xs' /> : <Icon as={LuFileDown} boxSize={4} />}
      {t('process_pdf.download', { defaultValue: 'Election report (PDF)' })}
    </Menu.Item>
  )
}

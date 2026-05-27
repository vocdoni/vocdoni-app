import { Button, HStack, Icon, Link, Menu, Spinner, Text } from '@chakra-ui/react'
import * as ReactPDF from '@react-pdf/renderer'
import { useClient, useElection, useOrganization } from '@vocdoni/react-components'
import {
  CensusType,
  dotobject,
  ElectionResultsTypeNames,
  ElectionStatus,
  formatUnits,
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

type ReportCensusType = 'csp' | 'spreadsheet' | 'web3' | 'weighted' | 'anonymous' | 'unknown'

type CensusMetadata = {
  type?: string
  fields?: string[]
  salt?: string
  weighted?: boolean
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

type CertificateField = {
  label: string
  value: string
  kind?: 'link'
  helperText?: string
}

type CertificateChoice = {
  name: string
  votes: string
  percentage: string
  numericVotes: number | null
  votingPower?: string
  castPowerPercentage?: string
  eligiblePowerPercentage?: string
  ballotCount?: string
}

type CertificateQuestion = {
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

type ReportSection = {
  title: string
  href: string
  page: string
  pageId: string
}

type PdfDocumentProps = {
  data: CertificateData
  t: TFunction
  capturedPages?: Record<string, number> // pageId -> absolute PDF page number
  onCapturePage?: (pageId: string, pageNumber: number) => void // called during pass-1 layout
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
    color: '#172033',
    backgroundColor: '#fbfcfe',
  },
  coverPage: {
    paddingHorizontal: 62,
    paddingTop: 52,
    paddingBottom: 52,
    fontFamily: 'Helvetica',
    fontSize: 10,
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
    marginBottom: 10,
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
  fieldHelperText: {
    marginTop: 3,
    fontSize: 7.6,
    lineHeight: 1.35,
    color: '#5f6b7a',
  },
  linkValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 1.5,
  },
  linkValueText: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    color: '#0f7f86',
    fontWeight: 700,
    wordBreak: 'break-all',
  },
  paragraph: {
    marginBottom: 7.5,
    color: '#2f3a4c',
  },
  afterBoxText: {
    marginTop: 1,
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
    marginBottom: 10,
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
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  questionSummaryPill: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 0,
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
  resultHeaderOptionWeighted: {
    width: '40%',
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
  resultHeaderVotesWeighted: {
    width: '16%',
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
  resultHeaderShareWeighted: {
    width: '18%',
  },
  resultHeaderEligibleShare: {
    width: '20%',
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
  resultOptionCellWeighted: {
    width: '40%',
  },
  resultValueCell: {
    width: '13%',
  },
  resultValueCellWeighted: {
    width: '16%',
  },
  resultShareCell: {
    width: '17%',
  },
  resultShareCellWeighted: {
    width: '18%',
  },
  resultEligibleShareCell: {
    width: '20%',
  },
  resultChoiceName: {
    fontSize: 8.7,
    color: '#2f3a4c',
    marginBottom: 4,
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
    backgroundColor: '#18a3a8',
    borderRadius: 2,
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
  },
  pageNumberText: {
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

// Preamble pages (cover + index) that carry no visible page number
const PREAMBLE_PAGE_COUNT = 2 as const

// Page IDs for content sections - maps logical section groups to PDF page IDs.
// These are arbitrary anchor labels; the numeric suffix is kept for legacy PDF bookmark compatibility.
const REPORT_PAGE_IDS = {
  sectionsA: 'report-page-3', // Sections 1-4
  sectionsB: 'report-page-4', // Sections 5-6
  sectionsC: 'report-page-5', // Section 7
} as const

// Ordered list of content page IDs: position (1-based) == report page number shown in the index.
// Adding or removing a content page only requires updating this array; REPORT_PAGE_NUMBERS re-derives automatically.
const REPORT_CONTENT_PAGE_ORDER = [
  REPORT_PAGE_IDS.sectionsA,
  REPORT_PAGE_IDS.sectionsB,
  REPORT_PAGE_IDS.sectionsC,
] as const

// Derived: maps each page ID to its 1-based report page number string.
// reportPageNumber = position in REPORT_CONTENT_PAGE_ORDER (= pdfPage - PREAMBLE_PAGE_COUNT)
const REPORT_PAGE_NUMBERS: Record<string, string> = Object.fromEntries(
  REPORT_CONTENT_PAGE_ORDER.map((id, i) => [id, String(i + 1)])
)

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

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
  const weighted = typeof value.weighted === 'boolean' ? value.weighted : undefined

  if (!type && !hasFields && !salt && typeof weighted === 'undefined') return undefined

  return { type, fields, salt, weighted }
}

const resolveCensusMetadata = (election: PublishedElection): CensusMetadata | undefined => {
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
    weighted: typeof wrappedMetadata.weighted === 'undefined' ? normalizedMetadata.weighted : wrappedMetadata.weighted,
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

const resolveReportCensusType = (election: PublishedElection, censusMeta?: CensusMetadata): ReportCensusType => {
  if (censusMeta?.type) return normalizeReportCensusType(censusMeta.type)

  return normalizeReportCensusType(election.census?.type)
}

const isCspReportCensus = (censusType: ReportCensusType) => censusType === 'csp'

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

const resolveReportIsWeighted = (
  report: ElectionReportContext,
  censusMeta?: CensusMetadata,
  censusBundle?: CensusBundleData | null
) => {
  if (report.isWeighted === true) return true
  if (censusMeta?.weighted === true) return true
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
  const isWeighted = resolveReportIsWeighted(report, censusMeta, censusBundle)
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
            'Public reference that identifies the census used for this voting process. It does not include or reveal voters’ personal data.',
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

const useOptionalElectionContext = () => {
  try {
    return useElection()
  } catch {
    return null
  }
}

const getReportContext = (
  electionContext: ReturnType<typeof useOptionalElectionContext>,
  fallbackElection?: ElectionLike | null
): ElectionReportContext | null => {
  const contextElection = electionContext?.election instanceof PublishedElection ? electionContext.election : undefined
  const election = contextElection ?? (fallbackElection instanceof PublishedElection ? fallbackElection : undefined)

  if (!election) return null

  return {
    election,
    isWeighted: contextElection ? electionContext?.isWeighted : undefined,
    participation: contextElection ? electionContext?.participation : undefined,
    turnout: contextElection ? electionContext?.turnout : undefined,
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
      const rowStyle = shouldStackFieldValue(item.value) || item.helperText ? styles.fieldRowStacked : styles.fieldRow

      return (
        <View key={item.label} style={[rowStyle, isLast ? styles.lastFieldRow : {}]}>
          <PdfText style={styles.fieldLabel}>{item.label}:</PdfText>
          {item.kind === 'link' ? (
            <View style={[styles.fieldValueStacked, styles.linkValueRow]}>
              <PdfText style={styles.linkValueText}>{formatPdfFieldValue(item.value)}</PdfText>
            </View>
          ) : (
            <View
              style={
                shouldStackFieldValue(item.value) || item.helperText ? styles.fieldValueStacked : styles.fieldValue
              }
            >
              <PdfText>{formatPdfFieldValue(item.value)}</PdfText>
              {item.helperText && <PdfText style={styles.fieldHelperText}>{item.helperText}</PdfText>}
            </View>
          )}
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
    title: t('process_pdf.document.sections.voting_system', { defaultValue: '1. Technical Framework' }),
    href: `#${REPORT_PAGE_IDS.sectionsA}`,
    page: REPORT_PAGE_NUMBERS[REPORT_PAGE_IDS.sectionsA],
    pageId: REPORT_PAGE_IDS.sectionsA,
  },
  {
    title: t('process_pdf.document.sections.general_information', { defaultValue: '2. General Information' }),
    href: `#${REPORT_PAGE_IDS.sectionsA}`,
    page: REPORT_PAGE_NUMBERS[REPORT_PAGE_IDS.sectionsA],
    pageId: REPORT_PAGE_IDS.sectionsA,
  },
  {
    title: t('process_pdf.document.sections.authentication', { defaultValue: '3. Authentication' }),
    href: `#${REPORT_PAGE_IDS.sectionsA}`,
    page: REPORT_PAGE_NUMBERS[REPORT_PAGE_IDS.sectionsA],
    pageId: REPORT_PAGE_IDS.sectionsA,
  },
  {
    title: t('process_pdf.document.sections.turnout_participation', { defaultValue: '4. Census and Participation' }),
    href: `#${REPORT_PAGE_IDS.sectionsA}`,
    page: REPORT_PAGE_NUMBERS[REPORT_PAGE_IDS.sectionsA],
    pageId: REPORT_PAGE_IDS.sectionsA,
  },
  {
    title: t('process_pdf.document.sections.voting_process', { defaultValue: '5. Questions and Results' }),
    href: `#${REPORT_PAGE_IDS.sectionsB}`,
    page: REPORT_PAGE_NUMBERS[REPORT_PAGE_IDS.sectionsB],
    pageId: REPORT_PAGE_IDS.sectionsB,
  },
  {
    title: t('process_pdf.document.sections.verification', { defaultValue: '6. Verification' }),
    href: `#${REPORT_PAGE_IDS.sectionsB}`,
    page: REPORT_PAGE_NUMBERS[REPORT_PAGE_IDS.sectionsB],
    pageId: REPORT_PAGE_IDS.sectionsB,
  },
  {
    title: t('process_pdf.document.sections.issuer', { defaultValue: '7. Issuer' }),
    href: `#${REPORT_PAGE_IDS.sectionsC}`,
    page: REPORT_PAGE_NUMBERS[REPORT_PAGE_IDS.sectionsC],
    pageId: REPORT_PAGE_IDS.sectionsC,
  },
]

const Paragraphs = ({ items }: { items: string[] }) => (
  <View>
    {items.map((item, index) => (
      <PdfText key={`${item}-${index}`} style={[styles.paragraph, { lineHeight: 1.5 }]}>
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

const ResultBarRow = ({
  choice,
  isWeighted,
  notAvailableLabel,
}: {
  choice: CertificateChoice
  isWeighted: boolean
  notAvailableLabel: string
}) => (
  <View wrap={false} style={styles.resultRow}>
    <View style={[styles.resultOptionCell, isWeighted ? styles.resultOptionCellWeighted : {}]}>
      <PdfText style={styles.resultChoiceName}>{choice.name}</PdfText>
      <View style={styles.resultBarTrack}>
        <View style={[styles.resultBarFill, { width: getResultBarWidth(choice) }]} />
      </View>
    </View>
    <View style={[styles.resultValueCell, isWeighted ? styles.resultValueCellWeighted : {}]}>
      <PdfText style={styles.resultValueText}>
        {isWeighted ? (choice.votingPower ?? choice.votes) : choice.votes}
      </PdfText>
    </View>
    <View style={[styles.resultShareCell, isWeighted ? styles.resultShareCellWeighted : {}]}>
      <PdfText style={styles.resultShareText}>
        {isWeighted ? (choice.castPowerPercentage ?? choice.percentage) : choice.percentage}
      </PdfText>
    </View>
    {isWeighted && (
      <View style={styles.resultEligibleShareCell}>
        <PdfText style={styles.resultShareText}>{choice.eligiblePowerPercentage ?? notAvailableLabel}</PdfText>
      </View>
    )}
  </View>
)

const getReportPageNumber = (pageNumber: number) => pageNumber - PREAMBLE_PAGE_COUNT

const PageFooterLine = () => <View fixed style={styles.pageFooter} />

// Probe component for pass-1 page number capture. Only renders when onCapturePage is provided.
const PageStartCapture = ({
  pageId,
  onCapturePage,
}: {
  pageId: string
  onCapturePage?: (id: string, n: number) => void
}) => {
  if (!onCapturePage) return null
  return (
    <PdfText
      style={{ fontSize: 0, height: 0, position: 'absolute' }}
      render={({ pageNumber, subPageNumber }) => {
        if (subPageNumber === 1) onCapturePage(pageId, pageNumber)
        return ''
      }}
    />
  )
}

const getIndexPageLabel = (pageId: string, capturedPages?: Record<string, number>): string => {
  if (capturedPages && capturedPages[pageId] !== undefined) {
    return String(capturedPages[pageId] - PREAMBLE_PAGE_COUNT)
  }
  return REPORT_PAGE_NUMBERS[pageId]
}

const ReportPageNumber = ({ label }: { label: string }) => (
  <View fixed style={styles.pageNumber}>
    <PdfText render={({ pageNumber }) => `${label} ${getReportPageNumber(pageNumber)}`} style={styles.pageNumberText} />
  </View>
)

const RunningHeader = () => (
  <View fixed style={styles.runningHeader}>
    <View style={styles.pageBrand}>
      <Image src={vocdoniIcon} style={styles.pageBrandIcon} />
    </View>
  </View>
)

const VotingCertificateDocument = ({ data, t, capturedPages, onCapturePage }: PdfDocumentProps) => {
  const reportSections = buildReportSections(t)
  const pageNumberLabel = t('process_pdf.document.page_number', { defaultValue: 'Page' })
  const formatVotingPowerShort = (power: string) =>
    power === data.notAvailableLabel
      ? data.notAvailableLabel
      : t('process_pdf.voting_process.card.voting_power_short', {
          defaultValue: '{{power}} voting power',
          power,
        })

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
            <PdfText style={[styles.subtitle, { lineHeight: 1.5 }]}>
              {t('process_pdf.document.process_id', {
                defaultValue: 'Process ID: {{process_id}}',
                process_id: data.processId,
              })}
            </PdfText>
          </View>

          <View style={styles.coverIntroPanel}>
            <Paragraphs items={data.introParagraphs} />
            <PdfText style={[styles.issuedLine, { lineHeight: 1.5 }]}>
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
          <PdfText style={[styles.indexIntro, { lineHeight: 1.5 }]}>
            {t('process_pdf.document.index.intro', {
              defaultValue: 'This report is organized into the following sections:',
            })}
          </PdfText>
          <View>
            {reportSections.map((section) => (
              <PdfLink key={section.title} src={section.href} style={styles.indexLink}>
                <View wrap={false} style={styles.indexRow}>
                  <PdfText style={[styles.indexLabel, { lineHeight: 1.5 }]}>{section.title}</PdfText>
                  <View style={styles.indexLeader} />
                  <PdfText style={[styles.indexPage, { lineHeight: 1.5 }]}>
                    {getIndexPageLabel(section.pageId, capturedPages)}
                  </PdfText>
                </View>
              </PdfLink>
            ))}
          </View>
        </ReportSectionBlock>
      </Page>

      <Page
        size='A4'
        style={styles.page}
        id={REPORT_PAGE_IDS.sectionsA}
        bookmark={t('process_pdf.document.bookmarks.general_information', {
          defaultValue: 'Technical Framework and General Information',
        })}
      >
        <RunningHeader />
        <PageFooterLine />
        <ReportPageNumber label={pageNumberLabel} />
        {onCapturePage && <PageStartCapture pageId={REPORT_PAGE_IDS.sectionsA} onCapturePage={onCapturePage} />}

        <ReportSectionBlock>
          <SectionTitle>
            {t('process_pdf.document.sections.voting_system', { defaultValue: '1. Technical Framework' })}
          </SectionTitle>
          <Paragraphs items={data.votingSystemParagraphs} />
          <BulletList items={data.votingSystemBullets} />
          <PdfText style={[styles.paragraph, { lineHeight: 1.5 }]}>
            {t('process_pdf.voting_system.executed_on', {
              defaultValue: 'The process {{voting_process}} was executed on the {{blockchain_network}} infrastructure.',
              voting_process: data.eventReference,
              blockchain_network: data.blockchainNetwork,
            })}
          </PdfText>
        </ReportSectionBlock>

        <ReportSectionBlock>
          <SectionTitle>
            {t('process_pdf.document.sections.general_information', { defaultValue: '2. General Information' })}
          </SectionTitle>
          <KeyValueList items={data.generalInformation} />
        </ReportSectionBlock>

        <ReportSectionBlock>
          <SectionTitle>
            {t('process_pdf.document.sections.authentication', { defaultValue: '3. Authentication' })}
          </SectionTitle>
          <KeyValueList items={data.authentication} />
        </ReportSectionBlock>

        <ReportSectionBlock>
          <SectionTitle>
            {t('process_pdf.document.sections.turnout_participation', { defaultValue: '4. Census and Participation' })}
          </SectionTitle>
          <KeyValueList items={data.censusParticipation} />
          <PdfText style={[styles.sectionLead, { lineHeight: 1.5 }]}>{data.censusParticipationLead}</PdfText>
        </ReportSectionBlock>
      </Page>

      <Page
        size='A4'
        style={styles.page}
        id={REPORT_PAGE_IDS.sectionsB}
        bookmark={t('process_pdf.document.bookmarks.voting_process', { defaultValue: 'Questions and Results' })}
      >
        <RunningHeader />
        <PageFooterLine />
        <ReportPageNumber label={pageNumberLabel} />
        {onCapturePage && <PageStartCapture pageId={REPORT_PAGE_IDS.sectionsB} onCapturePage={onCapturePage} />}

        <ReportSectionBlock>
          <SectionTitle>
            {t('process_pdf.document.sections.voting_process', { defaultValue: '5. Questions and Results' })}
          </SectionTitle>
          <PdfText style={styles.paragraph}>
            {data.votingProcessIntro.split(data.eventReference)[0]}
            <PdfText style={styles.italicText}>{data.eventReference}</PdfText>
            {data.votingProcessIntro.split(data.eventReference)[1]}
          </PdfText>
          {data.resultsHiddenText ? (
            <PdfText style={styles.smallText}>{data.resultsHiddenText}</PdfText>
          ) : data.votingProcessQuestions.length > 0 ? (
            data.votingProcessQuestions.map((question, index) => {
              const summaryFields = question.isWeighted
                ? [
                    {
                      label: data.questionTotalLabel,
                      value: formatVotingPowerShort(question.votingPowerUsed),
                    },
                    {
                      label: t('process_pdf.voting_process.card.outcome_label', { defaultValue: 'Voting method' }),
                      value: question.votingMethod,
                    },
                    {
                      label: t('process_pdf.census.counting_basis', { defaultValue: 'Counting basis' }),
                      value: question.countingBasisLabel,
                    },
                    {
                      label: t('process_pdf.turnout.submitted_ballots', { defaultValue: 'Submitted ballots' }),
                      value: t('process_pdf.voting_process.card.submitted_ballots_short', {
                        defaultValue: '{{ballots}} ballots',
                        ballots: question.submittedBallots,
                      }),
                    },
                    {
                      label: t('process_pdf.census.eligible_voting_power', {
                        defaultValue: 'Total eligible voting power',
                      }),
                      value: formatVotingPowerShort(question.eligibleVotingPower),
                    },
                  ]
                : [
                    {
                      label: data.questionTotalLabel,
                      value: t('process_pdf.voting_process.card.participation_short', {
                        defaultValue: '{{votes}} votes',
                        votes: question.totalVotes,
                      }),
                    },
                    {
                      label: t('process_pdf.voting_process.card.outcome_label', { defaultValue: 'Voting method' }),
                      value: question.votingMethod,
                    },
                    {
                      label: t('process_pdf.census.counting_basis', { defaultValue: 'Counting basis' }),
                      value: question.countingBasisLabel,
                    },
                  ]

              return (
                <View key={`${question.question}-${index}`} wrap={false} style={styles.questionCard}>
                  <PdfText style={styles.questionTitle}>{question.question}</PdfText>
                  <View style={styles.questionSummaryRow}>
                    {summaryFields.map((field) => (
                      <View key={`${question.question}-${field.label}`} style={styles.questionSummaryPill}>
                        <PdfText style={styles.questionSummaryLabel}>{field.label}</PdfText>
                        <PdfText style={styles.questionSummaryValue}>{field.value}</PdfText>
                      </View>
                    ))}
                  </View>
                  <PdfText style={styles.questionResultsLabel}>
                    {t('process_pdf.voting_process.card.results', { defaultValue: 'Results:' })}
                  </PdfText>
                  {question.choices.length > 0 ? (
                    <View style={styles.resultTable}>
                      <View style={styles.resultHeaderRow}>
                        <PdfText
                          style={[
                            styles.resultHeaderOption,
                            question.isWeighted ? styles.resultHeaderOptionWeighted : {},
                          ]}
                        >
                          {t('process_pdf.voting_process.card.option', { defaultValue: 'Option' })}
                        </PdfText>
                        <PdfText
                          style={[
                            styles.resultHeaderVotes,
                            question.isWeighted ? styles.resultHeaderVotesWeighted : {},
                          ]}
                        >
                          {data.resultValueLabel}
                        </PdfText>
                        <PdfText
                          style={[
                            styles.resultHeaderShare,
                            question.isWeighted ? styles.resultHeaderShareWeighted : {},
                          ]}
                        >
                          {question.isWeighted
                            ? t('process_pdf.voting_process.card.share_cast_power', {
                                defaultValue: 'Share of cast power',
                              })
                            : t('process_pdf.voting_process.card.share_votes', { defaultValue: 'Share of votes' })}
                        </PdfText>
                        {question.isWeighted && (
                          <PdfText style={styles.resultHeaderEligibleShare}>
                            {t('process_pdf.voting_process.card.share_eligible_power', {
                              defaultValue: 'Share of eligible power',
                            })}
                          </PdfText>
                        )}
                      </View>
                      {question.choices.map((choice) => (
                        <ResultBarRow
                          key={`${choice.name}-${choice.votes}-result`}
                          choice={choice}
                          isWeighted={question.isWeighted}
                          notAvailableLabel={data.notAvailableLabel}
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
          <PdfText style={[styles.paragraph, styles.afterBoxText]}>
            {t('process_pdf.verification.procedure_title', { defaultValue: 'Verification Procedure' })}
          </PdfText>
          <NumberedList items={data.verificationProcedures} />
        </ReportSectionBlock>
      </Page>
      <Page
        size='A4'
        style={styles.page}
        wrap
        id={REPORT_PAGE_IDS.sectionsC}
        bookmark={t('process_pdf.document.bookmarks.issuer', { defaultValue: 'Issuer' })}
      >
        <RunningHeader />
        <PageFooterLine />
        <ReportPageNumber label={pageNumberLabel} />
        {onCapturePage && <PageStartCapture pageId={REPORT_PAGE_IDS.sectionsC} onCapturePage={onCapturePage} />}
        <ReportSectionBlock>
          <SectionTitle>{t('process_pdf.document.sections.issuer', { defaultValue: '7. Issuer' })}</SectionTitle>
          <KeyValueList items={data.issuer} />
          <PdfText style={[styles.paragraph, styles.afterBoxText]}>
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
                'This document constitutes a technical certification derived from data recorded on the Vocdoni infrastructure.',
            })}
          </PdfText>
          <PdfText style={styles.footerParagraph}>
            {t('process_pdf.disclaimer.paragraph_2', {
              defaultValue:
                'The technical service provider assumes no responsibility for organizer-provided input data, including census composition, voter weights, legal interpretation of results, or compliance with applicable legal or regulatory frameworks.',
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
  const electionContext = useOptionalElectionContext()
  const report = getReportContext(electionContext, election)
  const [isGenerating, setIsGenerating] = useState(false)

  const download = async () => {
    if (!report || isGenerating) return

    setIsGenerating(true)
    try {
      const { election } = report
      const censusMeta = resolveCensusMetadata(election)
      const censusType = resolveReportCensusType(election, censusMeta)
      const censusBundle = isCspReportCensus(censusType) ? await fetchCensusBundle(election.census.censusURI) : null
      const data = buildCertificateData({
        report,
        t,
        organizationName: organization?.account?.name?.default,
        explorerUrl: client?.explorerUrl,
        censusBundle,
        now: new Date(),
      })

      // --- Pass 1: capture actual page starts ---
      const capturedPages: Record<string, number> = {}
      const captureDoc = (
        <VotingCertificateDocument
          data={data}
          t={t}
          onCapturePage={(id, n) => {
            capturedPages[id] = n
          }}
        />
      )
      await pdf(captureDoc).toBlob() // discard; only needed to run layout

      // --- Pass 2: final PDF with real page numbers ---
      const finalDoc = <VotingCertificateDocument data={data} t={t} capturedPages={capturedPages} />
      const blob = await pdf(finalDoc).toBlob()
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

  return { download, isGenerating, report }
}

export const VotingReportPdfButton = ({ election }: VotingReportPdfProps) => {
  const { t } = useTranslation()
  const { download, isGenerating, report } = useVotingReportPdfDownload(election)

  if (!canDownloadVotingReport(report?.election)) return null

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
  const { download, isGenerating, report } = useVotingReportPdfDownload(election)

  if (!canDownloadVotingReport(report?.election)) return null

  return (
    <Menu.Item value='download-pdf' onClick={download} disabled={isGenerating}>
      {isGenerating ? <Spinner size='xs' /> : <Icon as={LuFileDown} boxSize={4} />}
      {t('process_pdf.download', { defaultValue: 'Election report (PDF)' })}
    </Menu.Item>
  )
}

import * as ReactPDF from '@react-pdf/renderer'
import { type TFunction } from 'i18next'
import { type ReactNode } from 'react'

import logoImport from '/assets/logo_vocdoni.png'
import iconImport from '/assets/vocdoni_icon.png'

import {
  type CertificateChoice,
  type CertificateData,
  type CertificateField,
  type CertificateQuestion,
  formatPdfFieldValue,
  shouldStackFieldValue,
} from './certificate-data'
import { type CertificateMetadataAudit, type CertificateMetadataChange } from './metadata-audit-section'
import { styles } from './styles'

const { Document, Font, Image, Link: PdfLink, Page, Text: PdfText, View } = ReactPDF

const preventPdfHyphenation = (word: string) => [word]

Font.registerHyphenationCallback(preventPdfHyphenation)

// @react-pdf/renderer uses Node's fs to read images, so it needs real filesystem paths.
// In the test environment Vite resolves asset imports to URL strings (e.g. /assets/…)
// which Node cannot open; use process.cwd() to build the actual path instead.
const assetBase = import.meta.env.VITEST ? `${process.cwd()}/public` : ''
const vocdoniLogo = assetBase ? `${assetBase}/assets/logo_vocdoni.png` : logoImport
const vocdoniIcon = assetBase ? `${assetBase}/assets/vocdoni_icon.png` : iconImport

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

// Only the cover page is excluded from the visible page counter; the TOC is page 1.
const PREAMBLE_PAGE_COUNT = 1 as const

// Page IDs for content sections – used as PDF named destinations (href anchors) in the TOC.
// The numeric suffix is kept for legacy PDF bookmark compatibility.
const REPORT_PAGE_IDS = {
  sectionsA: 'report-page-3', // Sections 1-4
  sectionsB: 'report-page-4', // Sections 5-7
  sectionsC: 'report-page-5', // Section 8
} as const

// Per-section capture IDs – one per TOC entry.
// Each ReportSectionBlock uses its own ID so the two-pass capture records the actual PDF page
// where that section starts, regardless of how many PDF pages the parent <Page wrap> spans.
const SECTION_IDS = {
  s1: 'sec-1-framework',
  s2: 'sec-2-general',
  s3: 'sec-3-auth',
  s4: 'sec-4-census',
  s5: 'sec-5-results',
  s6: 'sec-6-verification',
  s7: 'sec-7-metadata',
  s8: 'sec-8-issuer',
} as const

// Static fallback page numbers (report-relative, i.e. pdfPage - PREAMBLE_PAGE_COUNT).
// Used when capturedPages has no entry for a section (e.g. during tests where PDF layout is mocked).
const SECTION_DEFAULT_PAGES: Record<string, string> = {
  [SECTION_IDS.s1]: '2',
  [SECTION_IDS.s2]: '2',
  [SECTION_IDS.s3]: '2',
  [SECTION_IDS.s4]: '2',
  [SECTION_IDS.s5]: '3',
  [SECTION_IDS.s6]: '3',
  [SECTION_IDS.s7]: '3',
  [SECTION_IDS.s8]: '4',
}

// A question card moves whole to the next page, unless its results are long enough that it could
// be taller than the space left: then it splits between result rows (each row stays whole).
// Result length is estimated in text lines of the option column, so long option names count more.
const MAX_UNSPLIT_QUESTION_LINES = 15
// Rough characters per line of the option column (Helvetica 8.7pt at 64% / 40% of the card width).
const OPTION_CHARS_PER_LINE = 65
const OPTION_CHARS_PER_LINE_WEIGHTED = 40
// Rough characters per line of the question title (Helvetica Bold 11pt across the card width).
// Every title line past the first counts as one more result line, so a long title can split the card.
const QUESTION_TITLE_CHARS_PER_LINE = 75
// A split card keeps its title, summary, table header and this many result rows together, so it
// never ends a page with a heading and no results.
const QUESTION_HEAD_RESULT_ROWS = 3
// Space (pt) a section heading needs below it, so it never ends a page on its own.
const SECTION_HEADING_MIN_PRESENCE_AHEAD = 60
// Section 6 lists one explorer link per question. It is kept whole up to this many (11 fit on a
// page, the rest is margin for long labels); beyond that it must flow across pages.
const MAX_UNSPLIT_VERIFICATION_ROWS = 8

// Explicit line breaks each start a new line, so every paragraph of the text is counted on its own.
const estimateTextLines = (text: string, charsPerLine: number) =>
  text.split('\n').reduce((total, paragraph) => total + Math.max(1, Math.ceil(paragraph.length / charsPerLine)), 0)

const canSplitQuestionCard = (question: CertificateQuestion) => {
  const charsPerLine = question.isWeighted ? OPTION_CHARS_PER_LINE_WEIGHTED : OPTION_CHARS_PER_LINE
  const extraTitleLines = estimateTextLines(question.question, QUESTION_TITLE_CHARS_PER_LINE) - 1
  const lines = question.choices.reduce(
    (total, choice) => total + estimateTextLines(choice.name, charsPerLine),
    extraTitleLines
  )
  return lines > MAX_UNSPLIT_QUESTION_LINES
}

const SectionTitle = ({ children }: { children: string }) => <PdfText style={styles.sectionTitle}>{children}</PdfText>

// Sections are kept whole by default. A section whose length grows with the number of questions
// (results, verification links) must pass `wrap`: a non-wrapping block taller than a page is
// squeezed onto a single page by react-pdf, which overlaps its contents.
// The TOC anchor, the page probe and the title move together as one heading, so the TOC points
// at the page where the title lands even when a wrapping section starts near a page bottom.
// react-pdf only honours `minPresenceAhead` on a node that has earlier siblings in its parent (it
// never breaks the first child), so a wrapping section lays its heading out next to its body
// instead of inside it. The split styles add up to `styles.section`, keeping the same layout.
const ReportSectionBlock = ({
  title,
  children,
  sectionId,
  onCapturePage,
  wrap = false,
}: {
  title: string
  children: ReactNode
  sectionId?: string
  onCapturePage?: (id: string, n: number) => void
  wrap?: boolean
}) => {
  const heading = (
    <View
      wrap={false}
      minPresenceAhead={SECTION_HEADING_MIN_PRESENCE_AHEAD}
      id={sectionId}
      style={wrap ? styles.sectionHeading : undefined}
    >
      {sectionId && onCapturePage && (
        <PdfText
          style={styles.captureProbe}
          render={({ pageNumber }) => {
            onCapturePage(sectionId, pageNumber)
            return null
          }}
        />
      )}
      <SectionTitle>{title}</SectionTitle>
    </View>
  )

  if (!wrap) {
    return (
      <View wrap={false} style={styles.section}>
        {heading}
        {children}
      </View>
    )
  }

  return (
    <>
      {heading}
      <View style={styles.sectionBody}>{children}</View>
    </>
  )
}

const KeyValueList = ({ items }: { items: CertificateField[] }) => (
  <View style={styles.keyValueTable}>
    {items.map((item, index) => {
      const isLast = index === items.length - 1
      const rowStyle = shouldStackFieldValue(item.value) || item.helperText ? styles.fieldRowStacked : styles.fieldRow

      return (
        <View key={item.label} wrap={false} style={[rowStyle, isLast ? styles.lastFieldRow : {}]}>
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
      <View key={`${item}-${index}`} wrap={false} style={styles.bulletRow}>
        <PdfText style={styles.bulletMarker}>{`${index + 1}.`}</PdfText>
        <PdfText style={styles.bulletText}>{item}</PdfText>
      </View>
    ))}
  </View>
)

export const buildReportSections = (t: TFunction): ReportSection[] => [
  {
    title: t('process_pdf.document.sections.voting_system', { defaultValue: '1. Technical Framework' }),
    href: `#${SECTION_IDS.s1}`,
    page: SECTION_DEFAULT_PAGES[SECTION_IDS.s1],
    pageId: SECTION_IDS.s1,
  },
  {
    title: t('process_pdf.document.sections.general_information', { defaultValue: '2. General Information' }),
    href: `#${SECTION_IDS.s2}`,
    page: SECTION_DEFAULT_PAGES[SECTION_IDS.s2],
    pageId: SECTION_IDS.s2,
  },
  {
    title: t('process_pdf.document.sections.authentication', { defaultValue: '3. Authentication' }),
    href: `#${SECTION_IDS.s3}`,
    page: SECTION_DEFAULT_PAGES[SECTION_IDS.s3],
    pageId: SECTION_IDS.s3,
  },
  {
    title: t('process_pdf.document.sections.turnout_participation', { defaultValue: '4. Census and Participation' }),
    href: `#${SECTION_IDS.s4}`,
    page: SECTION_DEFAULT_PAGES[SECTION_IDS.s4],
    pageId: SECTION_IDS.s4,
  },
  {
    title: t('process_pdf.document.sections.voting_process', { defaultValue: '5. Questions and Results' }),
    href: `#${SECTION_IDS.s5}`,
    page: SECTION_DEFAULT_PAGES[SECTION_IDS.s5],
    pageId: SECTION_IDS.s5,
  },
  {
    title: t('process_pdf.document.sections.verification', { defaultValue: '6. Verification' }),
    href: `#${SECTION_IDS.s6}`,
    page: SECTION_DEFAULT_PAGES[SECTION_IDS.s6],
    pageId: SECTION_IDS.s6,
  },
  {
    title: t('process_pdf.document.sections.metadata_audit', { defaultValue: '7. Metadata Changes' }),
    href: `#${SECTION_IDS.s7}`,
    page: SECTION_DEFAULT_PAGES[SECTION_IDS.s7],
    pageId: SECTION_IDS.s7,
  },
  {
    title: t('process_pdf.document.sections.issuer', { defaultValue: '8. Issuer' }),
    href: `#${SECTION_IDS.s8}`,
    page: SECTION_DEFAULT_PAGES[SECTION_IDS.s8],
    pageId: SECTION_IDS.s8,
  },
]

const Paragraphs = ({
  items,
  style = styles.paragraph,
}: {
  items: string[]
  style?: (typeof styles)[keyof typeof styles]
}) => (
  <View>
    {items.map((item, index) => (
      <PdfText key={`${item}-${index}`} style={style}>
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
    <View style={isWeighted ? [styles.resultOptionCell, styles.resultOptionCellWeighted] : styles.resultOptionCell}>
      <PdfText style={styles.resultChoiceName}>{choice.name}</PdfText>
      <View style={styles.resultBarTrack}>
        <View style={[styles.resultBarFill, { width: getResultBarWidth(choice) }]} />
      </View>
    </View>
    <View style={isWeighted ? [styles.resultValueCell, styles.resultValueCellWeighted] : styles.resultValueCell}>
      <PdfText style={styles.resultValueText}>
        {isWeighted ? (choice.votingPower ?? choice.votes) : choice.votes}
      </PdfText>
    </View>
    <View style={isWeighted ? [styles.resultShareCell, styles.resultShareCellWeighted] : styles.resultShareCell}>
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

const getDiffSegmentStyle = (type: 'same' | 'removed' | 'added') =>
  type === 'removed' ? styles.diffRemoved : type === 'added' ? styles.diffAdded : undefined

const MetadataChangeRow = ({ change }: { change: CertificateMetadataChange }) => (
  <View style={styles.metadataChange}>
    <PdfText minPresenceAhead={SECTION_HEADING_MIN_PRESENCE_AHEAD / 2} style={styles.metadataChangeLabel}>
      {change.label}
    </PdfText>
    {change.kind === 'inline' && (
      <PdfText style={styles.metadataChangeText}>
        {change.segments.map((segment, index) => (
          <PdfText key={`${segment.type}-${index}`} style={getDiffSegmentStyle(segment.type)}>
            {segment.text}
          </PdfText>
        ))}
      </PdfText>
    )}
    {change.kind === 'replace' && (
      <>
        {change.detail && <PdfText style={styles.metadataChangeDetail}>{change.detail}</PdfText>}
        <PdfText style={[styles.metadataChangeText, styles.diffRemoved]}>{change.before}</PdfText>
        <PdfText style={[styles.metadataChangeText, styles.diffAdded]}>{change.after}</PdfText>
      </>
    )}
    {change.kind === 'note' && <PdfText style={styles.metadataChangeText}>{change.text}</PdfText>}
  </View>
)

// Each question's history may run longer than a page (long descriptions, many changes), so its card
// flows across pages; only the headings and each version's identification table are kept whole.
const MetadataAuditBody = ({ audit }: { audit: CertificateMetadataAudit }) => (
  <View>
    <PdfText style={styles.paragraph}>{audit.intro}</PdfText>
    <PdfText style={styles.paragraph}>{audit.summary}</PdfText>
    {audit.integrityWarning && <PdfText style={styles.paragraph}>{audit.integrityWarning}</PdfText>}
    {audit.legend && <PdfText style={styles.smallText}>{audit.legend}</PdfText>}
    {audit.elections.map((election, electionIndex) => (
      <View key={`${election.title}-${electionIndex}`} style={styles.questionCard}>
        <View wrap={false} minPresenceAhead={SECTION_HEADING_MIN_PRESENCE_AHEAD}>
          <PdfText style={styles.questionTitle}>{election.title}</PdfText>
          <PdfText style={styles.questionMeta}>{election.summary}</PdfText>
        </View>
        {election.versions.map((version, versionIndex) => (
          <View key={`${version.heading}-${versionIndex}`} style={styles.metadataVersion}>
            <View wrap={false}>
              <PdfText style={styles.metadataVersionHeading}>{version.heading}</PdfText>
              <KeyValueList items={version.fields} />
            </View>
            {version.note && <PdfText style={styles.smallText}>{version.note}</PdfText>}
            {version.changes.map((change, changeIndex) => (
              <MetadataChangeRow key={`${change.label}-${changeIndex}`} change={change} />
            ))}
          </View>
        ))}
      </View>
    ))}
  </View>
)

const getReportPageNumber = (pageNumber: number) => pageNumber - PREAMBLE_PAGE_COUNT

const PageFooterLine = () => <View fixed style={styles.pageFooter} />

// react-pdf v4 constraint: PdfText nodes that use the `render` prop must NOT have `lineHeight` in
// their style — mixing `render` with `lineHeight` causes a layout crash in @react-pdf/renderer v4.
// Both PageStartCapture and ReportPageNumber intentionally omit `lineHeight` from their styles.

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
      style={styles.captureProbe}
      render={({ pageNumber }) => {
        onCapturePage(pageId, pageNumber)
        return null
      }}
    />
  )
}

const getIndexPageLabel = (pageId: string, capturedPages?: Record<string, number>): string => {
  if (capturedPages && capturedPages[pageId] !== undefined) {
    return String(capturedPages[pageId] - PREAMBLE_PAGE_COUNT)
  }
  return SECTION_DEFAULT_PAGES[pageId] ?? '?'
}

const ReportPageNumber = () => (
  <View fixed style={styles.pageNumber}>
    <PdfText render={({ pageNumber }) => `${getReportPageNumber(pageNumber)}`} style={styles.pageNumberText} />
  </View>
)

// Splits the results intro around the process name so the name can be set in italics. Slicing at
// the first match, unlike `split`, keeps the text after a repeated match (a process titled "The").
// Without a match the whole intro comes first and the name is appended.
const splitAroundReference = (text: string, reference: string): [string, string] => {
  const start = text.indexOf(reference)
  if (start === -1) return [text, '']
  return [text.slice(0, start), text.slice(start + reference.length)]
}

const RunningHeader = () => (
  <View fixed style={styles.runningHeader}>
    <View style={styles.pageBrand}>
      <Image src={vocdoniIcon} style={styles.pageBrandIcon} />
    </View>
  </View>
)

export const VotingCertificateDocument = ({ data, t, capturedPages, onCapturePage }: PdfDocumentProps) => {
  const reportSections = buildReportSections(t)
  const [votingProcessIntroBefore, votingProcessIntroAfter] = splitAroundReference(
    data.votingProcessIntro,
    data.eventReference
  )
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
            <Paragraphs items={data.introParagraphs} style={styles.coverParagraph} />
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
        <PageFooterLine />
        <ReportPageNumber />

        <ReportSectionBlock title={t('process_pdf.document.index.title', { defaultValue: 'Index' })}>
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
                  <PdfText style={styles.indexPage}>{getIndexPageLabel(section.pageId, capturedPages)}</PdfText>
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
        <ReportPageNumber />
        {onCapturePage && <PageStartCapture pageId={REPORT_PAGE_IDS.sectionsA} onCapturePage={onCapturePage} />}

        <ReportSectionBlock
          sectionId={SECTION_IDS.s1}
          onCapturePage={onCapturePage}
          title={t('process_pdf.document.sections.voting_system', { defaultValue: '1. Technical Framework' })}
        >
          <Paragraphs items={data.votingSystemParagraphs} />
          <BulletList items={data.votingSystemBullets} />
          <PdfText style={styles.paragraph}>
            {t('process_pdf.voting_system.executed_on', {
              defaultValue: 'The process {{voting_process}} was executed on the {{blockchain_network}} infrastructure.',
              voting_process: data.eventReference,
              blockchain_network: data.blockchainNetwork,
            })}
          </PdfText>
        </ReportSectionBlock>

        <ReportSectionBlock
          sectionId={SECTION_IDS.s2}
          onCapturePage={onCapturePage}
          title={t('process_pdf.document.sections.general_information', { defaultValue: '2. General Information' })}
        >
          <KeyValueList items={data.generalInformation} />
        </ReportSectionBlock>

        <ReportSectionBlock
          sectionId={SECTION_IDS.s3}
          onCapturePage={onCapturePage}
          title={t('process_pdf.document.sections.authentication', { defaultValue: '3. Authentication' })}
        >
          <KeyValueList items={data.authentication} />
        </ReportSectionBlock>

        <ReportSectionBlock
          sectionId={SECTION_IDS.s4}
          onCapturePage={onCapturePage}
          title={t('process_pdf.document.sections.turnout_participation', {
            defaultValue: '4. Census and Participation',
          })}
        >
          <KeyValueList items={data.censusParticipation} />
          <PdfText style={styles.sectionLead}>{data.censusParticipationLead}</PdfText>
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
        <ReportPageNumber />
        {onCapturePage && <PageStartCapture pageId={REPORT_PAGE_IDS.sectionsB} onCapturePage={onCapturePage} />}

        <ReportSectionBlock
          wrap
          sectionId={SECTION_IDS.s5}
          onCapturePage={onCapturePage}
          title={t('process_pdf.document.sections.voting_process', { defaultValue: '5. Questions and Results' })}
        >
          <PdfText style={styles.paragraph}>
            {votingProcessIntroBefore}
            <PdfText style={styles.italicText}>{data.eventReference}</PdfText>
            {votingProcessIntroAfter}
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

              const resultRows = question.choices.map((choice) => (
                <ResultBarRow
                  key={`${choice.name}-${choice.votes}-result`}
                  choice={choice}
                  isWeighted={question.isWeighted}
                  notAvailableLabel={data.notAvailableLabel}
                />
              ))

              return (
                <View
                  key={`${question.question}-${index}`}
                  wrap={canSplitQuestionCard(question)}
                  style={styles.questionCard}
                >
                  <View wrap={false}>
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
                            style={
                              question.isWeighted
                                ? [styles.resultHeaderOption, styles.resultHeaderOptionWeighted]
                                : styles.resultHeaderOption
                            }
                          >
                            {t('process_pdf.voting_process.card.option', { defaultValue: 'Option' })}
                          </PdfText>
                          <PdfText
                            style={
                              question.isWeighted
                                ? [styles.resultHeaderVotes, styles.resultHeaderVotesWeighted]
                                : styles.resultHeaderVotes
                            }
                          >
                            {data.resultValueLabel}
                          </PdfText>
                          <PdfText
                            style={
                              question.isWeighted
                                ? [styles.resultHeaderShare, styles.resultHeaderShareWeighted]
                                : styles.resultHeaderShare
                            }
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
                        {resultRows.slice(0, QUESTION_HEAD_RESULT_ROWS)}
                      </View>
                    ) : (
                      <PdfText style={styles.smallText}>{data.notAvailableLabel}</PdfText>
                    )}
                  </View>
                  {resultRows.slice(QUESTION_HEAD_RESULT_ROWS)}
                </View>
              )
            })
          ) : (
            <PdfText style={styles.smallText}>{data.notAvailableLabel}</PdfText>
          )}
        </ReportSectionBlock>

        <ReportSectionBlock
          wrap={data.verification.length > MAX_UNSPLIT_VERIFICATION_ROWS}
          sectionId={SECTION_IDS.s6}
          onCapturePage={onCapturePage}
          title={t('process_pdf.document.sections.verification', { defaultValue: '6. Verification' })}
        >
          <PdfText style={styles.paragraph}>
            {t('process_pdf.verification.paragraph', {
              defaultValue:
                'All process data has been recorded on a blockchain-based infrastructure and may be independently verified through the following public explorer:',
            })}
          </PdfText>
          <KeyValueList items={data.verification} />
          <PdfText
            minPresenceAhead={SECTION_HEADING_MIN_PRESENCE_AHEAD}
            style={[styles.paragraph, styles.afterBoxText]}
          >
            {t('process_pdf.verification.procedure_title', { defaultValue: 'Verification Procedure' })}
          </PdfText>
          <NumberedList items={data.verificationProcedures} />
        </ReportSectionBlock>

        <ReportSectionBlock
          wrap
          sectionId={SECTION_IDS.s7}
          onCapturePage={onCapturePage}
          title={t('process_pdf.document.sections.metadata_audit', { defaultValue: '7. Metadata Changes' })}
        >
          <MetadataAuditBody audit={data.metadataAudit} />
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
        <ReportPageNumber />
        {onCapturePage && <PageStartCapture pageId={REPORT_PAGE_IDS.sectionsC} onCapturePage={onCapturePage} />}
        <ReportSectionBlock
          sectionId={SECTION_IDS.s8}
          onCapturePage={onCapturePage}
          title={t('process_pdf.document.sections.issuer', { defaultValue: '8. Issuer' })}
        >
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

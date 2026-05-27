import * as ReactPDF from '@react-pdf/renderer'
import { type TFunction } from 'i18next'
import { type ReactNode } from 'react'

import logoImport from '/assets/logo_vocdoni.png'
import iconImport from '/assets/vocdoni_icon.png'

import { styles } from './styles'
import {
  type CertificateData,
  type CertificateChoice,
  type CertificateField,
  type CertificateQuestion,
  formatPdfFieldValue,
  notAvailable,
  shouldStackFieldValue,
} from './certificate-data'

const { pdf, Document, Font, Image, Link: PdfLink, Page, Text: PdfText, View } = ReactPDF

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

export const buildReportSections = (t: TFunction): ReportSection[] => [
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

export const VotingCertificateDocument = ({ data, t, capturedPages, onCapturePage }: PdfDocumentProps) => {
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

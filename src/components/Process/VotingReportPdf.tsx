import { Button, HStack, Icon, Menu, Spinner, Text } from '@chakra-ui/react'
import { useToast } from '~components/Toast'
import { pdf, Document, Page, StyleSheet, Text as PdfText, View } from '@react-pdf/renderer'
import { ElectionStatus, InvalidElection, PublishedElection } from '@vocdoni/sdk'
import { type TFunction } from 'i18next'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuFileDown } from 'react-icons/lu'
import { useDateFns } from '~i18n/use-date-fns'
import { useVotingMethodLabel } from './resultTypeLabels'

type VotingReportPdfProps = {
  election?: PublishedElection | InvalidElection | null
}

type PdfDocumentProps = {
  election: PublishedElection
  t: TFunction
  formatDate: (date: Date, formatString: string) => string
  votingMethodLabel: string
}

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#4b5563',
  },
  section: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e5e7eb',
    borderRadius: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 4,
  },
  summaryLabel: {
    width: '42%',
    fontWeight: 700,
  },
  summaryValue: {
    width: '58%',
    textAlign: 'right',
  },
  question: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#f3f4f6',
    borderRadius: 4,
  },
  questionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 4,
  },
  questionDescription: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 8,
  },
  choiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 4,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: '#f3f4f6',
  },
  choiceLabel: {
    width: '70%',
  },
  choiceValue: {
    width: '30%',
    textAlign: 'right',
  },
  emptyState: {
    fontSize: 10,
    color: '#6b7280',
  },
  footer: {
    marginTop: 16,
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'center',
  },
})

const sanitizeFileName = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const getStatusLabel = (t: TFunction, status: ElectionStatus) => {
  switch (status) {
    case ElectionStatus.UPCOMING:
      return t('process.date.starts', { defaultValue: 'Starts' })
    case ElectionStatus.ONGOING:
    case ElectionStatus.PAUSED:
      return t('process.date.ends', { defaultValue: 'Ends' })
    case ElectionStatus.RESULTS:
    case ElectionStatus.ENDED:
      return t('process.date.ended', { defaultValue: 'Ended' })
    case ElectionStatus.CANCELED:
      return t('process.status.canceled', { defaultValue: 'Canceled' })
    default:
      return t('process_pdf.not_available', { defaultValue: 'Not available' })
  }
}

const VotingReportDocument = ({ election, t, formatDate, votingMethodLabel }: PdfDocumentProps) => {
  const startDate = election.startDate
    ? formatDate(election.startDate, t('dashboard.process_view.date_format', 'MMMM do, y'))
    : null
  const endDate = election.endDate
    ? formatDate(election.endDate, t('dashboard.process_view.date_format', 'MMMM do, y'))
    : null
  const timeFormat = t('dashboard.process_view.time_format', 'p')

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        <View style={styles.header}>
          <PdfText style={styles.title}>{t('process_pdf.title', { defaultValue: 'Voting report' })}</PdfText>
          <PdfText style={styles.subtitle}>{election.title.default}</PdfText>
        </View>

        <View style={styles.section}>
          <PdfText style={styles.sectionTitle}>{t('process_pdf.summary', { defaultValue: 'Summary' })}</PdfText>

          <View style={styles.summaryRow}>
            <PdfText style={styles.summaryLabel}>{t('process_pdf.process_id', { defaultValue: 'Process ID' })}</PdfText>
            <PdfText style={styles.summaryValue}>{election.id}</PdfText>
          </View>
          <View style={styles.summaryRow}>
            <PdfText style={styles.summaryLabel}>{t('process_pdf.status', { defaultValue: 'Status' })}</PdfText>
            <PdfText style={styles.summaryValue}>{getStatusLabel(t, election.status)}</PdfText>
          </View>
          <View style={styles.summaryRow}>
            <PdfText style={styles.summaryLabel}>{t('process_pdf.start_date', { defaultValue: 'Start date' })}</PdfText>
            <PdfText style={styles.summaryValue}>
              {startDate
                ? `${startDate} ${formatDate(election.startDate, timeFormat)}`
                : t('process_pdf.not_available', { defaultValue: 'Not available' })}
            </PdfText>
          </View>
          <View style={styles.summaryRow}>
            <PdfText style={styles.summaryLabel}>{t('process_pdf.end_date', { defaultValue: 'End date' })}</PdfText>
            <PdfText style={styles.summaryValue}>
              {endDate
                ? `${endDate} ${formatDate(election.endDate, timeFormat)}`
                : t('process_pdf.not_available', { defaultValue: 'Not available' })}
            </PdfText>
          </View>
          <View style={styles.summaryRow}>
            <PdfText style={styles.summaryLabel}>
              {t('process_pdf.total_votes', { defaultValue: 'Total votes' })}
            </PdfText>
            <PdfText style={styles.summaryValue}>{String(election.voteCount ?? 0)}</PdfText>
          </View>
          <View style={styles.summaryRow}>
            <PdfText style={styles.summaryLabel}>
              {t('process_pdf.census_size', { defaultValue: 'Census size' })}
            </PdfText>
            <PdfText style={styles.summaryValue}>
              {String(election.census?.size ?? election.maxCensusSize ?? 0)}
            </PdfText>
          </View>
          <View style={styles.summaryRow}>
            <PdfText style={styles.summaryLabel}>
              {t('process_pdf.voting_method', { defaultValue: 'Voting method' })}
            </PdfText>
            <PdfText style={styles.summaryValue}>{votingMethodLabel}</PdfText>
          </View>
        </View>

        <View style={styles.section}>
          <PdfText style={styles.sectionTitle}>{t('process_pdf.questions', { defaultValue: 'Questions' })}</PdfText>
          {election.questions.length > 0 ? (
            election.questions.map((question, questionIndex) => (
              <View key={`${questionIndex}-${question.title.default}`} style={styles.question}>
                <PdfText style={styles.questionTitle}>
                  {t('process_pdf.question_label', {
                    defaultValue: 'Question {{index}}',
                    index: questionIndex + 1,
                  })}{' '}
                  - {question.title.default}
                </PdfText>
                {question.description?.default ? (
                  <PdfText style={styles.questionDescription}>{question.description.default}</PdfText>
                ) : null}
                {question.choices.length > 0 ? (
                  question.choices.map((choice) => (
                    <View key={`${choice.value}-${choice.title.default}`} style={styles.choiceRow}>
                      <PdfText style={styles.choiceLabel}>{choice.title.default}</PdfText>
                      <PdfText style={styles.choiceValue}>
                        {choice.results ?? t('process_pdf.not_available', { defaultValue: 'Not available' })}
                      </PdfText>
                    </View>
                  ))
                ) : (
                  <PdfText style={styles.emptyState}>
                    {t('process_pdf.no_choices', { defaultValue: 'No choices' })}
                  </PdfText>
                )}
              </View>
            ))
          ) : (
            <PdfText style={styles.emptyState}>
              {t('process_pdf.no_questions', { defaultValue: 'No questions available' })}
            </PdfText>
          )}
        </View>

        <PdfText style={styles.footer}>
          {t('process_pdf.generated_at', {
            defaultValue: 'Generated at {{date}}',
            date: formatDate(new Date(), `${t('dashboard.process_view.date_format', 'MMMM do, y')} ${timeFormat}`),
          })}
        </PdfText>
      </Page>
    </Document>
  )
}

const useVotingReportPdfDownload = (election?: PublishedElection | InvalidElection | null) => {
  const { t } = useTranslation()
  const toast = useToast()
  const { format } = useDateFns()
  const votingMethodLabel = useVotingMethodLabel(
    election instanceof PublishedElection ? election.resultsType?.name : undefined,
    {
      defaultValue: t('process_pdf.not_available', { defaultValue: 'Not available' }),
    }
  )
  const [isGenerating, setIsGenerating] = useState(false)

  const download = async () => {
    if (!(election instanceof PublishedElection) || isGenerating) return

    setIsGenerating(true)
    try {
      const blob = await pdf(
        <VotingReportDocument election={election} t={t} formatDate={format} votingMethodLabel={votingMethodLabel} />
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${sanitizeFileName(election.title.default || 'voting-report')}-${sanitizeFileName(election.id)}.pdf`
      anchor.rel = 'noopener noreferrer'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
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

  if (!(election instanceof PublishedElection)) return null

  return (
    <Button
      variant='outline'
      w='full'
      size='sm'
      justifyContent='start'
      onClick={download}
      loading={isGenerating}
      loadingText={t('process_pdf.downloading', { defaultValue: 'Generating PDF' })}
    >
      <HStack gap={2}>
        <Icon as={LuFileDown} />
        <Text as='span'>{t('process_pdf.download', { defaultValue: 'Download PDF' })}</Text>
      </HStack>
    </Button>
  )
}

export const VotingReportPdfMenuItem = ({ election }: VotingReportPdfProps) => {
  const { t } = useTranslation()
  const { download, isGenerating } = useVotingReportPdfDownload(election)

  if (!(election instanceof PublishedElection)) return null

  return (
    <Menu.Item value='download-pdf' onClick={download} disabled={isGenerating}>
      {isGenerating ? <Spinner size='xs' /> : <Icon as={LuFileDown} boxSize={4} />}
      {t('process_pdf.download', { defaultValue: 'Download PDF' })}
    </Menu.Item>
  )
}

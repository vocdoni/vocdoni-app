import { Box, Button, Card, Flex, Icon, Text } from '@chakra-ui/react'
import { useElection } from '@vocdoni/react-components'
import { useId, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  pendingResultsHint,
  useVotingReportPdfDownload,
} from '~components/Process/VotingReportPdf/VotingReportPdfButton'
import { useVoteText } from '~i18n/use-vote-text'
import { DownloadFileIcon } from '~theme/icons'
import { downloadTextFile, toCsv } from '~utils/csv'
import { csvReady, questionTallies, resultsCsvRows, resultsFileName } from './results-csv'
import { SummaryCardHeader } from './SummaryCardHeader'
import type { SummaryModel } from './use-summary-model'

type RowProps = { title: string; note: string; action: ReactNode }

const DownloadRow = ({ title, note, action }: RowProps) => (
  <Card.Body py='3'>
    <Flex align='center' gap='3'>
      <Box flex='1' minW='0'>
        <Text fontWeight='medium-plus'>{title}</Text>
        <Text textStyle='body-sm' color='fg.subtle'>
          {note}
        </Text>
      </Box>
      {action}
    </Flex>
  </Card.Body>
)

/**
 * "Download the results" on a closed vote (boards V4VoteManageAll, V4VoteOne): the tally as a CSV file and the final
 * report as a PDF. The board's "pay and download" has no backend yet, so the report downloads as it always has.
 */
export const SummaryDownloads = ({ model, desktop }: { model: SummaryModel; desktop: boolean }) => {
  const { t } = useTranslation()
  const { text } = useVoteText()
  const titleId = useId()
  const { results } = useElection()
  const { election, state } = model
  const pdf = useVotingReportPdfDownload(election)

  if (state !== 'closed') return null

  const ready = csvReady(questionTallies(election, results))

  const downloadCsv = () =>
    downloadTextFile(
      resultsFileName(text(election.title), election.id),
      toCsv(resultsCsvRows(election, results, t, text, model.canManage)),
      'text/csv'
    )

  return (
    <Card.Root variant='frame' as='section' aria-labelledby={titleId}>
      <SummaryCardHeader
        id={titleId}
        title={t('votes.downloads.title', { defaultValue: 'Download the results' })}
        desktop={desktop}
      />
      <DownloadRow
        title={t('votes.downloads.csv.title', { defaultValue: 'Results in CSV' })}
        note={
          ready
            ? t('votes.downloads.csv.note', { defaultValue: 'The result of each option, question by question.' })
            : pendingResultsHint(t)
        }
        action={
          <Button
            variant='outline'
            disabled={!ready}
            onClick={downloadCsv}
            aria-label={t('votes.downloads.csv.action', { defaultValue: 'Download the results in CSV' })}
          >
            <Icon as={DownloadFileIcon} />
            CSV
          </Button>
        }
      />
      <DownloadRow
        title={t('votes.downloads.pdf.title', { defaultValue: 'Final report in PDF' })}
        note={pdf.report ? t('votes.downloads.pdf.note', { defaultValue: 'For an audit.' }) : pendingResultsHint(t)}
        action={
          <Button
            variant='outline'
            disabled={!pdf.report}
            loading={pdf.isGenerating}
            onClick={() => void pdf.download()}
            aria-label={t('votes.downloads.pdf.action', { defaultValue: 'Download the final report in PDF' })}
          >
            <Icon as={DownloadFileIcon} />
            PDF
          </Button>
        }
      />
    </Card.Root>
  )
}

import { Box, Icon, Menu, Spinner } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { DownloadFileIcon } from '~theme/icons'

import { Tooltip } from '~components/ui/Tooltip'

import { type ElectionLike, pendingResultsHint, useVotingReportPdfDownload } from './VotingReportPdfButton'

type VotingReportPdfProps = {
  election?: ElectionLike
}

export const VotingReportPdfMenuItem = ({ election }: VotingReportPdfProps) => {
  const { t } = useTranslation()
  const { download, isGenerating, report, isPendingResults } = useVotingReportPdfDownload(election)

  if (!report) {
    if (!isPendingResults) return null

    return (
      <Tooltip content={pendingResultsHint(t)} showArrow>
        {/* The wrapper carries the hover: a disabled item fires no pointer events of its own, so a
            tooltip attached straight to it would never open. */}
        <Box>
          <Menu.Item value='download-pdf' disabled closeOnSelect={false}>
            <Icon as={DownloadFileIcon} />
            {t('process_pdf.download', { defaultValue: 'Election report (PDF)' })}
          </Menu.Item>
        </Box>
      </Tooltip>
    )
  }

  return (
    <Menu.Item value='download-pdf' onClick={download} disabled={isGenerating}>
      {isGenerating ? <Spinner size='xs' /> : <Icon as={DownloadFileIcon} />}
      {t('process_pdf.download', { defaultValue: 'Election report (PDF)' })}
    </Menu.Item>
  )
}

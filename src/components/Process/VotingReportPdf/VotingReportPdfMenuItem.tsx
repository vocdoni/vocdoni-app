import { Icon, Menu, MenuItem, Spinner } from '@chakra-ui/react'
import { LuFileDown } from 'react-icons/lu'
import { useTranslation } from 'react-i18next'

import {
  type ElectionLike,
  canDownloadVotingReport,
  useVotingReportPdfDownload,
  VotingReportPdfButton,
} from './VotingReportPdfButton'

type VotingReportPdfProps = {
  election?: ElectionLike | null
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

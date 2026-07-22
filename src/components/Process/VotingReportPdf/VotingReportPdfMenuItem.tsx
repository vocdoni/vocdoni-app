import { Icon, Menu, Spinner } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { LuFileDown } from 'react-icons/lu'

import { type ElectionLike, useVotingReportPdfDownload } from './VotingReportPdfButton'

type VotingReportPdfProps = {
  election?: ElectionLike
}

export const VotingReportPdfMenuItem = ({ election }: VotingReportPdfProps) => {
  const { t } = useTranslation()
  const { download, isGenerating, report } = useVotingReportPdfDownload(election)

  if (!report) return null

  return (
    <Menu.Item value='download-pdf' onClick={download} disabled={isGenerating}>
      {isGenerating ? <Spinner size='xs' /> : <Icon as={LuFileDown} boxSize={4} />}
      {t('process_pdf.download', { defaultValue: 'Election report (PDF)' })}
    </Menu.Item>
  )
}

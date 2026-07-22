import { Button, HStack, Icon, Link, Text } from '@chakra-ui/react'
import * as ReactPDF from '@react-pdf/renderer'
import { useOrganization } from '@vocdoni/react-components'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuFileDown } from 'react-icons/lu'

import { useToast } from '~components/Toast'
import { useAppEnv } from '~src/app-env'
import { getVocdoniClientConfig } from '~src/providers/vocdoni-client-config'
import { useApiClient } from '~src/providers/ApiClientProvider'

import {
  buildCertificateData,
  fetchProcessResults,
  getDefaultText,
  getReportContext,
  useOptionalElectionContext,
  type ElectionLike,
} from './certificate-data'
import { VotingCertificateDocument } from './pdf-document'

export { canDownloadVotingReport, type ElectionLike } from './certificate-data'

const { pdf } = ReactPDF

export type VotingReportPdfProps = {
  election?: ElectionLike
}

const sanitizeFileName = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const useVotingReportPdfDownload = (election?: ElectionLike) => {
  const { t } = useTranslation()
  const toast = useToast()
  const { organization } = useOrganization()
  const { client } = useApiClient()
  const { VOCDONI_ENVIRONMENT } = useAppEnv()
  const explorerUrl = getVocdoniClientConfig(VOCDONI_ENVIRONMENT).explorerUrl ?? 'https://explorer.vote'
  const electionContext = useOptionalElectionContext()
  const report = getReportContext(electionContext, election)
  const [isGenerating, setIsGenerating] = useState(false)

  const download = async () => {
    if (!report || isGenerating) return

    setIsGenerating(true)
    try {
      const { election } = report
      const results = report.results ?? (await fetchProcessResults(client, election.id))
      const data = buildCertificateData({
        election,
        results,
        t,
        organizationName: getDefaultText(organization?.name) || undefined,
        explorerUrl,
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
      anchor.download = `${sanitizeFileName(getDefaultText(election.title) || 'voting-certificate')}-${sanitizeFileName(election.id)}.pdf`
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

  if (!report) return null

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

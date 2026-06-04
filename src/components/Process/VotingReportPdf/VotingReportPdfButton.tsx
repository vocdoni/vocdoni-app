import { Button, HStack, Icon, Link, Text } from '@chakra-ui/react'
import * as ReactPDF from '@react-pdf/renderer'
import { useClient, useOrganization } from '@vocdoni/react-components'
import { ElectionStatus, PublishedElection, type InvalidElection } from '@vocdoni/sdk'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuFileDown } from 'react-icons/lu'

import { useToast } from '~components/Toast'

import {
  buildCertificateData,
  fetchCensusBundle,
  getReportContext,
  isCspReportCensus,
  resolveCensusMetadata,
  resolveReportCensusType,
  useOptionalElectionContext,
} from './certificate-data'
import { VotingCertificateDocument } from './pdf-document'

const { pdf } = ReactPDF

export type ElectionLike = PublishedElection | InvalidElection | Record<string, unknown>

export type VotingReportPdfProps = {
  election?: ElectionLike | null
}

const downloadableElectionStatuses = new Set([ElectionStatus.RESULTS, ElectionStatus.ENDED, ElectionStatus.CANCELED])

export const canDownloadVotingReport = (election?: ElectionLike | null) =>
  election instanceof PublishedElection && downloadableElectionStatuses.has(election.status)

const sanitizeFileName = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const useVotingReportPdfDownload = (election?: ElectionLike | null) => {
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

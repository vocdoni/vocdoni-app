import * as ReactPDF from '@react-pdf/renderer'
import { Buffer as BufferPolyfill } from 'buffer'
import type { TFunction } from 'i18next'

import type { CertificateData } from './certificate-data'
import { VotingCertificateDocument } from './pdf-document'

const { pdf } = ReactPDF

/**
 * Renders the report to a PDF blob. Kept apart from the button so `@react-pdf/renderer` (about 1.5 MB) is only
 * downloaded, through a dynamic import, when someone asks for a report.
 */
export const renderVotingReportPdf = async (data: CertificateData, t: TFunction): Promise<Blob> => {
  // @react-pdf/layout calls `Buffer.isBuffer` after loading each image. Browsers have no Buffer,
  // so that call throws (logged as "Buffer is not defined") before the image cache key is set,
  // and the running-header icon gets embedded again on every page. The global is installed only
  // when a report is generated, not when the dashboard loads. Node (tests) keeps its own Buffer.
  globalThis.Buffer ??= BufferPolyfill as unknown as typeof globalThis.Buffer

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
  return pdf(<VotingCertificateDocument data={data} t={t} capturedPages={capturedPages} />).toBlob()
}

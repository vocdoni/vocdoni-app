/**
 * Lays out real voting report PDFs (no @react-pdf/renderer mock) to catch blocks that cannot fit on
 * a page. react-pdf squeezes such a block onto one page, overlapping its contents, and only tells
 * us through a console warning.
 */
import * as ReactPDF from '@react-pdf/renderer'
import { describe, expect, it, vi } from 'vitest'
import { buildCertificateData } from './certificate-data'
import { VotingCertificateDocument } from './pdf-document'
import { createElection, createQuestion, createQuestionResults, createResults, translate } from './__fixtures__'

const { pdf } = ReactPDF

const UNAVAILABLE_SPACE_WARNING = "can't wrap between pages"
// Real PDF layout is slow when the whole suite runs in parallel.
const LAYOUT_TIMEOUT = 30000

const buildReportData = ({ questions, choices }: { questions: number; choices: number }) => {
  const processQuestions = Array.from({ length: questions }, (_, questionIndex) =>
    createQuestion({
      id: `question-${questionIndex + 1}`,
      title: { default: `Question ${questionIndex + 1}` },
      choices: Array.from({ length: choices }, (_, choiceIndex) => ({
        title: { default: `Option ${choiceIndex + 1}` },
        value: choiceIndex,
      })),
    })
  )

  return buildCertificateData({
    election: createElection({ questions: processQuestions }),
    results: createResults({
      questions: processQuestions.map((question) =>
        createQuestionResults({
          questionId: question.id,
          results: [Array.from({ length: choices }, (_, choiceIndex) => String(choiceIndex + 1))],
        })
      ),
    }),
    t: translate,
    explorerUrl: 'https://explorer.vote',
    now: new Date('2026-01-03T10:00:00Z'),
  })
}

const layOutReport = async (data: ReturnType<typeof buildCertificateData>) => {
  const capturedPages: Record<string, number> = {}
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

  try {
    await pdf(
      <VotingCertificateDocument
        data={data}
        t={translate}
        onCapturePage={(id, pageNumber) => {
          capturedPages[id] = pageNumber
        }}
      />
    ).toBuffer()

    const unavailableSpaceWarnings = warn.mock.calls.filter(([message]) =>
      String(message).includes(UNAVAILABLE_SPACE_WARNING)
    )
    return { capturedPages, unavailableSpaceWarnings }
  } finally {
    warn.mockRestore()
  }
}

describe('voting report PDF layout', () => {
  it.each([
    { questions: 6, choices: 2 },
    { questions: 3, choices: 6 },
    { questions: 1, choices: 30 },
    { questions: 12, choices: 3 },
  ])(
    'fits every block on a page with $questions questions of $choices options',
    async (size) => {
      const { unavailableSpaceWarnings } = await layOutReport(buildReportData(size))

      expect(unavailableSpaceWarnings).toEqual([])
    },
    LAYOUT_TIMEOUT
  )

  it(
    'lets the results and verification sections flow across pages for long processes',
    async () => {
      const { capturedPages } = await layOutReport(buildReportData({ questions: 12, choices: 3 }))

      expect(capturedPages['sec-6-verification'] - capturedPages['sec-5-results']).toBeGreaterThan(1)
      expect(capturedPages['sec-7-issuer'] - capturedPages['sec-6-verification']).toBeGreaterThan(1)
    },
    LAYOUT_TIMEOUT
  )
})

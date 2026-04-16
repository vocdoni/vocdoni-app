import { ElectionStatus, PublishedElection } from '@vocdoni/sdk'
import type { ReactNode } from 'react'
import { fireEvent, render, screen, waitFor } from '~src/test-utils'
import { VotingReportPdfButton, VotingReportPdfMenuItem } from './VotingReportPdf'

const pdfToBlob = vi.fn()
const toastSpy = vi.fn()
const realCreateElement = document.createElement.bind(document)

vi.mock('@react-pdf/renderer', () => ({
  pdf: vi.fn(() => ({ toBlob: pdfToBlob })),
  Document: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Page: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children: ReactNode }) => <span>{children}</span>,
  View: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  StyleSheet: { create: (styles: Record<string, unknown>) => styles },
}))

vi.mock('~components/Toast', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~components/Toast')>()

  return {
    ...actual,
    ToastProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
    useToast: () => toastSpy,
  }
})

vi.mock('@chakra-ui/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@chakra-ui/react')>()
  return {
    ...actual,
    Menu: {
      ...actual.Menu,
      Item: ({ children, ...props }: { children: ReactNode }) => <actual.Button {...props}>{children}</actual.Button>,
    },
  }
})

vi.mock('@vocdoni/sdk', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/sdk')>()

  class MockPublishedElection {}

  return {
    ...actual,
    PublishedElection: MockPublishedElection,
  }
})

const createElection = () =>
  Object.assign(new PublishedElection({} as never), {
    id: '0x1234',
    title: { default: 'Annual vote' },
    status: ElectionStatus.RESULTS,
    startDate: new Date('2026-01-01T10:00:00Z'),
    endDate: new Date('2026-01-02T10:00:00Z'),
    voteCount: 42,
    census: { size: 100 },
    maxCensusSize: 100,
    electionType: { secretUntilTheEnd: false },
    resultsType: undefined,
    questions: [],
  }) as PublishedElection

describe('VotingReportPdf', () => {
  beforeEach(() => {
    pdfToBlob.mockReset()
    toastSpy.mockReset()
  })

  it('downloads a pdf when the button is clicked', async () => {
    pdfToBlob.mockResolvedValue(new Blob(['pdf']))
    const election = createElection()
    const anchor = realCreateElement('a')
    const clickSpy = vi.spyOn(anchor, 'click').mockImplementation(() => undefined)
    const createObjectUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:report')
    const revokeObjectUrlSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockImplementation((tagName) => (tagName === 'a' ? anchor : realCreateElement(tagName)))

    render(<VotingReportPdfButton election={election} />)

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }))

    await waitFor(() => {
      expect(pdfToBlob).toHaveBeenCalled()
      expect(clickSpy).toHaveBeenCalled()
      expect(anchor.download).toBe('annual-vote-0x1234.pdf')
    })

    createElementSpy.mockRestore()
    createObjectUrlSpy.mockRestore()
    revokeObjectUrlSpy.mockRestore()
    clickSpy.mockRestore()
  })

  it('renders the download action in the menu', () => {
    render(<VotingReportPdfMenuItem election={createElection()} />)

    expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument()
  })
})

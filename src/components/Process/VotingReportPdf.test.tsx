import { ElectionStatus, PublishedElection } from '@vocdoni/sdk'
import type { ReactNode } from 'react'
import { fireEvent, render, screen, waitFor } from '~src/test-utils'
import { buildCertificateData, VotingReportPdfButton, VotingReportPdfMenuItem } from './VotingReportPdf'

const pdfToBlob = vi.fn()
const pdfSpy = vi.fn()
const toastSpy = vi.fn()
const realCreateElement = document.createElement.bind(document)

vi.mock('@react-pdf/renderer', () => ({
  pdf: vi.fn((document) => {
    pdfSpy(document)

    return { toBlob: pdfToBlob }
  }),
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
    pdfSpy.mockReset()
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

  it('formats voting period timestamps with a single UTC suffix', () => {
    const election = Object.assign(createElection(), {
      meta: {},
    })

    const data = buildCertificateData({
      election,
      t: ((key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key) as never,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    const values = data.generalInformation
      .filter((field) => field.label.includes('Voting period'))
      .map((field) => field.value)

    expect(values).toEqual(['2026-01-01 10:00 UTC', '2026-01-02 10:00 UTC'])
  })

  it('splits the certificate into separate pages around section 4 and the legal notice', async () => {
    pdfToBlob.mockResolvedValue(new Blob(['pdf']))
    const election = createElection()

    render(<VotingReportPdfButton election={election} />)

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }))

    await waitFor(() => {
      expect(pdfSpy).toHaveBeenCalled()
    })

    const [documentElement] = pdfSpy.mock.calls[0]
    const documentTree = (documentElement.type as (props: typeof documentElement.props) => ReactNode)(
      documentElement.props
    ) as { props: { children: ReactNode } }
    const pages = Array.isArray(documentTree.props.children)
      ? documentTree.props.children
      : [documentTree.props.children]

    expect(pages).toHaveLength(3)
  })

  it('uses the sdk census type for the authentication method', () => {
    const election = Object.assign(createElection(), {
      census: {
        size: 100,
        type: 'csp',
      },
      meta: {
        census: {
          type: 'spreadsheet',
        },
      },
    })

    const data = buildCertificateData({
      election,
      t: ((key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key) as never,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    const authMethod = data.authentication.find((field) => field.label === 'Authentication method')

    expect(authMethod?.value).toBe('CSP census')
  })

  it('fetches the census bundle for csp elections even when census metadata uses spreadsheet labels', async () => {
    pdfToBlob.mockResolvedValue(new Blob(['pdf']))
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          census: {
            published: { uri: 'https://example.test/census', root: 'root-hash' },
            authFields: ['email'],
            twoFaFields: [],
          },
        }),
        { status: 200 }
      ) as Response
    )

    const election = Object.assign(createElection(), {
      census: {
        size: 100,
        type: 'csp',
        censusURI: 'https://example.test/census-bundle',
      },
      meta: {
        census: {
          type: 'spreadsheet',
        },
      },
    })

    render(<VotingReportPdfButton election={election} />)

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }))

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('https://example.test/census-bundle')
    })

    fetchSpy.mockRestore()
  })
})

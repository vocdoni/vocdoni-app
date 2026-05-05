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
  Image: ({ src, alt }: { src?: string; alt?: string }) => (
    <img src={typeof src === 'string' ? src : undefined} alt={alt ?? 'image'} />
  ),
  Link: ({ children, ...props }: { children: ReactNode } & Record<string, unknown>) => <a {...props}>{children}</a>,
  Page: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Text: ({ children, ...props }: { children: ReactNode } & Record<string, unknown>) => (
    <span {...props}>{children}</span>
  ),
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
    chainId: 'vocdoni/LTS/1.2',
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

    fireEvent.click(screen.getByRole('button', { name: /election report \(pdf\)/i }))

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

    expect(screen.getByRole('button', { name: /election report \(pdf\)/i })).toBeInTheDocument()
  })

  it('hides the download action while the voting process is still ongoing', () => {
    const ongoingElection = Object.assign(createElection(), {
      status: ElectionStatus.ONGOING,
    })

    render(
      <>
        <VotingReportPdfButton election={ongoingElection} />
        <VotingReportPdfMenuItem election={ongoingElection} />
      </>
    )

    expect(screen.queryByRole('button', { name: /election report \(pdf\)/i })).toBeNull()
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

  it('includes the network, results visibility, and extended process details in general information', () => {
    const data = buildCertificateData({
      election: createElection(),
      explorerUrl: 'https://explorer.example',
      t: ((key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key) as never,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.generalInformation.find((field) => field.label === 'Extended process details')?.value).toBe(
      'https://explorer.example/process/0x1234'
    )
    expect(data.generalInformation.find((field) => field.label === 'Network')?.value).toBe('vocdoni/LTS/1.2')
    expect(data.generalInformation.find((field) => field.label === 'Results visibility')?.value).toBe('Live results')
  })

  it('uses the revised census and voting process copy', () => {
    const t = ((key: string, options?: { defaultValue?: string; count?: number; process_name?: string }) =>
      options?.defaultValue
        ?.replace('{{count}}', String(options.count ?? ''))
        .replace('{{process_name}}', options.process_name ?? '') ?? key) as never

    const data = buildCertificateData({
      election: createElection(),
      t,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.census).toEqual([
      {
        label: 'Census provider',
        value: 'The census is provided by the organization',
      },
      {
        label: 'Total census',
        value: '100',
      },
    ])
    expect(data.votingProcessIntro).toBe('The voting process Annual vote consisted of 0 questions.')
  })

  it('marks results visibility as hidden when the process is secret until the end', () => {
    const hiddenElection = Object.assign(createElection(), {
      electionType: { secretUntilTheEnd: true },
    })

    const data = buildCertificateData({
      election: hiddenElection,
      t: ((key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key) as never,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.generalInformation.find((field) => field.label === 'Results visibility')?.value).toBe(
      'Hidden until the end'
    )
  })

  it('splits the certificate into separate pages around section 4 and the legal notice', async () => {
    pdfToBlob.mockResolvedValue(new Blob(['pdf']))
    const election = createElection()

    render(<VotingReportPdfButton election={election} />)

    fireEvent.click(screen.getByRole('button', { name: /election report \(pdf\)/i }))

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

    expect(pages).toHaveLength(5)
  })

  it('renders the vocdoni logo, a larger title, an index page, and page numbers', async () => {
    pdfToBlob.mockResolvedValue(new Blob(['pdf']))
    const election = createElection()

    render(<VotingReportPdfButton election={election} />)

    fireEvent.click(screen.getByRole('button', { name: /election report \(pdf\)/i }))

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
    const firstPage = pages[0] as { props: { children: ReactNode } }
    const firstPageChildren = Array.isArray(firstPage.props.children)
      ? firstPage.props.children
      : [firstPage.props.children]
    const coverContent = firstPageChildren[0] as { props: { style?: Record<string, unknown>; children: ReactNode } }
    expect(coverContent.props.style).toMatchObject({
      justifyContent: 'center',
    })
    const coverContentChildren = Array.isArray(coverContent.props.children)
      ? coverContent.props.children
      : [coverContent.props.children]
    const header = coverContentChildren[0] as { props: { children: ReactNode } }
    const headerChildren = Array.isArray(header.props.children) ? header.props.children : [header.props.children]

    expect(headerChildren[0]).toMatchObject({
      props: {
        src: `${process.cwd()}/public/assets/logo_vocdoni.png`,
      },
    })

    const titleBlock = headerChildren[1] as { props: { children: ReactNode } }
    const titleBlockChildren = Array.isArray(titleBlock.props.children)
      ? titleBlock.props.children
      : [titleBlock.props.children]
    const titlePrefix = titleBlockChildren[0] as { props: { style?: Record<string, unknown>; children: ReactNode } }
    const processName = titleBlockChildren[1] as { props: { style?: Record<string, unknown>; children: ReactNode } }

    expect(titlePrefix.props.style).toMatchObject({
      fontSize: 26,
    })
    expect(processName.props.style).toMatchObject({
      fontSize: 30,
      fontStyle: 'italic',
    })
    expect(processName.props.children).toBe('Annual vote')

    const subtitle = headerChildren[2] as { props: { children: ReactNode } }
    expect(subtitle.props.children).toContain('Report issued on')
    expect(subtitle.props.children).toContain('Process ID: 0x1234')

    const secondPage = pages[1] as { props: { children: ReactNode } }
    const secondPageChildren = Array.isArray(secondPage.props.children)
      ? secondPage.props.children
      : [secondPage.props.children]
    const pageBrand = secondPageChildren[0] as { props: { children: ReactNode } }
    const pageBrandChildren = Array.isArray(pageBrand.props.children)
      ? pageBrand.props.children
      : [pageBrand.props.children]

    expect(pageBrandChildren[0]).toMatchObject({
      props: {
        src: `${process.cwd()}/public/assets/vocdoni_icon.png`,
      },
    })

    const indexSection = secondPageChildren[1] as { props: { children: ReactNode } }
    const indexSectionChildren = Array.isArray(indexSection.props.children)
      ? indexSection.props.children
      : [indexSection.props.children]
    const indexTitle = indexSectionChildren[0] as { props: { children: ReactNode } }
    const indexIntro = indexSectionChildren[1] as { props: { children: ReactNode } }
    const indexList = indexSectionChildren[2] as { props: { children: ReactNode } }
    const indexListChildren = Array.isArray(indexList.props.children)
      ? indexList.props.children
      : [indexList.props.children]

    expect(indexTitle.props.children).toBe('Index')
    expect(indexIntro.props.children).toContain('organized into the following sections')
    const indexFirstRow = indexListChildren[0] as {
      props: {
        src: '#report-page-3'
        children: ReactNode
      }
    }
    const indexFirstRowChildren = Array.isArray(indexFirstRow.props.children)
      ? indexFirstRow.props.children
      : [indexFirstRow.props.children]

    expect(indexFirstRow.props.src).toBe('#report-page-3')
    const indexFirstRowBlock = indexFirstRowChildren[0] as { props: { children: ReactNode } }
    const indexFirstRowBlockChildren = Array.isArray(indexFirstRowBlock.props.children)
      ? indexFirstRowBlock.props.children
      : [indexFirstRowBlock.props.children]
    expect((indexFirstRowBlockChildren[1] as { props: { children: ReactNode } }).props.children).toBe(1)

    const indexSecondRow = indexListChildren[5] as {
      props: {
        src: '#report-page-4'
        children: ReactNode
      }
    }
    const indexSecondRowChildren = Array.isArray(indexSecondRow.props.children)
      ? indexSecondRow.props.children
      : [indexSecondRow.props.children]

    expect(indexSecondRow.props.src).toBe('#report-page-4')
    const indexSecondRowBlock = indexSecondRowChildren[0] as { props: { children: ReactNode } }
    const indexSecondRowBlockChildren = Array.isArray(indexSecondRowBlock.props.children)
      ? indexSecondRowBlock.props.children
      : [indexSecondRowBlock.props.children]
    expect((indexSecondRowBlockChildren[1] as { props: { children: ReactNode } }).props.children).toBe(2)

    const firstSection = pages[2] as { props: { children: ReactNode } }
    const firstSectionChildren = Array.isArray(firstSection.props.children)
      ? firstSection.props.children
      : [firstSection.props.children]
    const firstSectionBlock = firstSectionChildren[1] as { props: { children: ReactNode } }
    const firstSectionBlockChildren = Array.isArray(firstSectionBlock.props.children)
      ? firstSectionBlock.props.children
      : [firstSectionBlock.props.children]
    const sectionTitle = firstSectionBlockChildren[0] as { props: { children: ReactNode } }

    expect(sectionTitle.props.children).toBe('1. General Information')

    const turnoutSection = firstSectionChildren[5] as { props: { children: ReactNode } }
    const turnoutSectionChildren = Array.isArray(turnoutSection.props.children)
      ? turnoutSection.props.children
      : [turnoutSection.props.children]
    const turnoutContact = turnoutSectionChildren[3] as { props: { children: ReactNode } }

    expect(turnoutContact.props.children).toContain('If you need more details about the census')

    const thirdPage = pages[2] as { props: { children: ReactNode } }
    const thirdPageChildren = Array.isArray(thirdPage.props.children)
      ? thirdPage.props.children
      : [thirdPage.props.children]
    const fourthPage = pages[3] as { props: { children: ReactNode } }
    const fourthPageChildren = Array.isArray(fourthPage.props.children)
      ? fourthPage.props.children
      : [fourthPage.props.children]
    const votingProcessSection = fourthPageChildren[1] as { props: { children: ReactNode } }
    const votingProcessSectionChildren = Array.isArray(votingProcessSection.props.children)
      ? votingProcessSection.props.children
      : [votingProcessSection.props.children]
    const votingProcessIntro = votingProcessSectionChildren[1] as { props: { children: ReactNode } }
    const votingProcessIntroChildren = Array.isArray(votingProcessIntro.props.children)
      ? votingProcessIntro.props.children
      : [votingProcessIntro.props.children]
    expect(votingProcessIntroChildren[0]).toContain('The voting process')
    expect(votingProcessIntroChildren[1]).toMatchObject({
      props: {
        style: expect.objectContaining({
          fontStyle: 'italic',
        }),
      },
    })
    expect(votingProcessIntroChildren[2]).toContain('consisted of 0 questions.')
    const fifthPage = pages[4] as { props: { children: ReactNode } }
    const fifthPageChildren = Array.isArray(fifthPage.props.children)
      ? fifthPage.props.children
      : [fifthPage.props.children]
    const legalFooter = fifthPageChildren[2] as { props: { style?: Record<string, unknown>; children: ReactNode } }
    expect(legalFooter.props.style).toMatchObject({
      paddingTop: 8,
    })
    const footerTitle = Array.isArray(legalFooter.props.children)
      ? legalFooter.props.children[0]
      : legalFooter.props.children
    expect((footerTitle as { props: { style?: Record<string, unknown> } }).props.style).toMatchObject({
      fontSize: 8,
    })
    const pageNumber = fifthPageChildren.find(
      (
        child
      ): child is {
        type: { name?: string }
        props: { children?: ReactNode }
      } =>
        Boolean(
          child &&
          typeof child === 'object' &&
          'type' in child &&
          'props' in child &&
          (child.type as { name?: string }).name === 'ReportPageNumber'
        )
    )

    const renderedPageNumber = pageNumber
      ? (pageNumber.type as (props: { children?: ReactNode }) => ReactNode)(pageNumber.props)
      : null
    expect(renderedPageNumber).toMatchObject({
      props: {
        style: {
          position: 'absolute',
          bottom: 30,
          left: 0,
          right: 0,
          textAlign: 'center',
          color: '#6b7280',
        },
      },
    })
    expect(
      (
        renderedPageNumber as { props: { render?: (args: { pageNumber: number; totalPages: number }) => string } }
      )?.props.render?.({ pageNumber: 5, totalPages: 5 })
    ).toBe('3')
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

    fireEvent.click(screen.getByRole('button', { name: /election report \(pdf\)/i }))

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('https://example.test/census-bundle')
    })

    fetchSpy.mockRestore()
  })
})

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
  Font: { registerHyphenationCallback: vi.fn() },
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

const createElectionWithResults = () =>
  Object.assign(createElection(), {
    voteCount: 10,
    questions: [
      {
        title: { default: 'Board continuity proposal' },
        choices: [{ title: { default: 'Approve' } }, { title: { default: 'Reject' } }],
      },
    ],
    results: [[7, 3]],
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

  it('preserves result counts and percentages for the executive result table', () => {
    const data = buildCertificateData({
      election: createElectionWithResults(),
      t: ((key: string, options?: { defaultValue?: string; count?: number; process_name?: string }) =>
        options?.defaultValue
          ?.replace('{{count}}', String(options.count ?? ''))
          .replace('{{process_name}}', options.process_name ?? '') ?? key) as never,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    expect(data.votingProcessQuestions[0]).toMatchObject({
      question: 'Board continuity proposal',
      totalVotes: '10',
      outcome: 'Approve',
      choices: [
        { name: 'Approve', votes: '7', percentage: '70.00%', numericVotes: 7 },
        { name: 'Reject', votes: '3', percentage: '30.00%', numericVotes: 3 },
      ],
    })
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
    const coverAccent = firstPageChildren[0] as { props: { style?: Record<string, unknown> } }
    expect(coverAccent.props.style).toMatchObject({
      backgroundColor: '#111827',
      width: 20,
    })

    const coverContent = firstPageChildren[1] as { props: { style?: Record<string, unknown>; children: ReactNode } }
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

    const coverHairline = headerChildren[1] as { props: { style?: Record<string, unknown> } }
    expect(coverHairline.props.style).toMatchObject({
      backgroundColor: '#18a3a8',
    })

    const titleBlock = headerChildren[2] as { props: { children: ReactNode } }
    const titleBlockChildren = Array.isArray(titleBlock.props.children)
      ? titleBlock.props.children
      : [titleBlock.props.children]
    const titlePrefix = titleBlockChildren[0] as { props: { style?: Record<string, unknown>; children: ReactNode } }
    const processName = titleBlockChildren[1] as { props: { style?: Record<string, unknown>; children: ReactNode } }

    expect(titlePrefix.props.style).toMatchObject({
      fontSize: 23,
    })
    expect(processName.props.style).toMatchObject({
      fontSize: 24,
      color: '#18a3a8',
    })
    expect(processName.props.children).toBe('Annual vote')

    const subtitle = headerChildren[3] as { props: { children: ReactNode } }
    expect(subtitle.props.children).toContain('Report issued on')
    expect(subtitle.props.children).toContain('Process ID: 0x1234')

    const secondPage = pages[1] as { props: { children: ReactNode } }
    const secondPageChildren = Array.isArray(secondPage.props.children)
      ? secondPage.props.children
      : [secondPage.props.children]
    const runningHeader = secondPageChildren[0] as {
      type: (props: Record<string, never>) => ReactNode
      props: Record<string, never>
    }
    const runningHeaderTree = runningHeader.type(runningHeader.props) as { props: { children: ReactNode } }
    const runningHeaderChildren = Array.isArray(runningHeaderTree.props.children)
      ? runningHeaderTree.props.children
      : [runningHeaderTree.props.children]
    expect(runningHeaderChildren).toHaveLength(1)
    const pageBrand = runningHeaderChildren[0] as { props: { children: ReactNode } }
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
    expect(indexFirstRowBlockChildren).toHaveLength(3)
    expect((indexFirstRowBlockChildren[2] as { props: { children: ReactNode } }).props.children).toBe('1')

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
    expect(indexSecondRowBlockChildren).toHaveLength(3)
    expect((indexSecondRowBlockChildren[2] as { props: { children: ReactNode } }).props.children).toBe('2')

    const indexCertificationScopeRow = indexListChildren[7] as {
      props: {
        src: '#report-page-5'
        children: ReactNode
      }
    }
    const indexCertificationScopeRowChildren = Array.isArray(indexCertificationScopeRow.props.children)
      ? indexCertificationScopeRow.props.children
      : [indexCertificationScopeRow.props.children]
    const indexCertificationScopeRowBlock = indexCertificationScopeRowChildren[0] as {
      props: { children: ReactNode }
    }
    const indexCertificationScopeRowBlockChildren = Array.isArray(indexCertificationScopeRowBlock.props.children)
      ? indexCertificationScopeRowBlock.props.children
      : [indexCertificationScopeRowBlock.props.children]
    expect(indexCertificationScopeRow.props.src).toBe('#report-page-5')
    expect((indexCertificationScopeRowBlockChildren[2] as { props: { children: ReactNode } }).props.children).toBe('3')

    const firstSection = pages[2] as { props: { children: ReactNode } }
    const firstSectionChildren = Array.isArray(firstSection.props.children)
      ? firstSection.props.children
      : [firstSection.props.children]
    const firstSectionBlock = firstSectionChildren[3] as { props: { children: ReactNode } }
    const firstSectionBlockChildren = Array.isArray(firstSectionBlock.props.children)
      ? firstSectionBlock.props.children
      : [firstSectionBlock.props.children]
    const sectionTitle = firstSectionBlockChildren[0] as { props: { children: ReactNode } }

    expect(sectionTitle.props.children).toBe('1. General Information')

    const turnoutSection = firstSectionChildren[7] as { props: { children: ReactNode } }
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
    const votingProcessSection = fourthPageChildren[3] as { props: { children: ReactNode } }
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
    const certificationScopeSection = fifthPageChildren[3] as { props: { children: ReactNode } }
    const certificationScopeSectionChildren = Array.isArray(certificationScopeSection.props.children)
      ? certificationScopeSection.props.children
      : [certificationScopeSection.props.children]
    const certificationScopeTitle = certificationScopeSectionChildren[0] as { props: { children: ReactNode } }
    const issuerSection = fifthPageChildren[4] as { props: { children: ReactNode } }
    const issuerSectionChildren = Array.isArray(issuerSection.props.children)
      ? issuerSection.props.children
      : [issuerSection.props.children]
    const issuerTitle = issuerSectionChildren[0] as { props: { children: ReactNode } }

    expect(certificationScopeTitle.props.children).toBe('8. Certification Scope')
    expect(issuerTitle.props.children).toBe('9. Issuer')

    const legalNotice = fifthPageChildren[5] as { props: { style?: Record<string, unknown>; children: ReactNode } }
    expect(legalNotice.props.style).toMatchObject({
      marginTop: 18,
      paddingTop: 12,
    })
    const footerTitle = Array.isArray(legalNotice.props.children)
      ? legalNotice.props.children[0]
      : legalNotice.props.children
    expect((footerTitle as { props: { style?: Record<string, unknown> } }).props.style).toMatchObject({
      fontSize: 8.5,
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
    const pageFooterLine = fifthPageChildren.find(
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
          (child.type as { name?: string }).name === 'PageFooterLine'
        )
    )

    const renderedPageNumber = pageNumber
      ? (pageNumber.type as (props: { children?: ReactNode }) => ReactNode)(pageNumber.props)
      : null
    const renderedPageFooterLine = pageFooterLine
      ? (pageFooterLine.type as (props: { children?: ReactNode }) => ReactNode)(pageFooterLine.props)
      : null
    expect(renderedPageFooterLine).toMatchObject({
      props: {
        style: {
          position: 'absolute',
          bottom: 39,
          left: 56,
          right: 56,
          borderTopWidth: 1,
        },
      },
    })
    expect(renderedPageNumber).toMatchObject({
      props: {
        style: {
          position: 'absolute',
          bottom: 22,
          left: 56,
          right: 56,
          fontSize: 11,
          fontWeight: 700,
          color: '#111827',
        },
      },
    })
    const pageNumberText = renderedPageNumber as {
      props: { render?: (args: { pageNumber: number; totalPages: number }) => string; style?: Record<string, unknown> }
    }
    expect(pageNumberText.props.style).toMatchObject({
      position: 'absolute',
      bottom: 22,
      left: 56,
      right: 56,
      fontSize: 11,
      fontWeight: 700,
      color: '#111827',
    })
    expect(pageNumberText.props.render?.({ pageNumber: 5, totalPages: 5 })).toBe('Page 3')
  })

  it('renders result rows with bars and highlights the highest-vote option', async () => {
    pdfToBlob.mockResolvedValue(new Blob(['pdf']))

    render(<VotingReportPdfButton election={createElectionWithResults()} />)

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
    const fourthPage = pages[3] as { props: { children: ReactNode } }
    const fourthPageChildren = Array.isArray(fourthPage.props.children)
      ? fourthPage.props.children
      : [fourthPage.props.children]
    const votingProcessSection = fourthPageChildren[3] as { props: { children: ReactNode } }
    const votingProcessSectionChildren = Array.isArray(votingProcessSection.props.children)
      ? votingProcessSection.props.children
      : [votingProcessSection.props.children]
    const flattenedVotingProcessChildren = votingProcessSectionChildren.flat()
    const questionCard = flattenedVotingProcessChildren[2] as { props: { children: ReactNode } }
    const questionCardChildren = Array.isArray(questionCard.props.children)
      ? questionCard.props.children
      : [questionCard.props.children]
    const questionTitle = questionCardChildren[0] as { props: { children: ReactNode } }
    const resultTable = questionCardChildren[3] as { props: { children: ReactNode } }
    const resultTableChildren = Array.isArray(resultTable.props.children)
      ? resultTable.props.children
      : [resultTable.props.children]
    const flattenedResultTableChildren = resultTableChildren.flat()
    const resultHeader = flattenedResultTableChildren[0] as { props: { children: ReactNode } }
    const resultHeaderChildren = Array.isArray(resultHeader.props.children)
      ? resultHeader.props.children
      : [resultHeader.props.children]
    const firstResultRow = flattenedResultTableChildren[1] as {
      type: (props: Record<string, unknown>) => ReactNode
      props: Record<string, unknown>
    }
    const renderedFirstResultRow = firstResultRow.type(firstResultRow.props) as { props: { children: ReactNode } }
    const renderedFirstResultRowChildren = Array.isArray(renderedFirstResultRow.props.children)
      ? renderedFirstResultRow.props.children
      : [renderedFirstResultRow.props.children]
    const optionCell = renderedFirstResultRowChildren[0] as { props: { children: ReactNode } }
    const optionCellChildren = Array.isArray(optionCell.props.children)
      ? optionCell.props.children
      : [optionCell.props.children]
    const optionLabel = optionCellChildren[0] as { props: { children: ReactNode; style: unknown[] } }
    const barTrack = optionCellChildren[1] as { props: { children: ReactNode } }
    const barFill = barTrack.props.children as { props: { style: Array<Record<string, unknown>> } }
    const votesCell = renderedFirstResultRowChildren[1] as { props: { children: ReactNode } }
    const votesText = Array.isArray(votesCell.props.children) ? votesCell.props.children[0] : votesCell.props.children
    const shareCell = renderedFirstResultRowChildren[2] as { props: { children: ReactNode } }
    const shareText = Array.isArray(shareCell.props.children) ? shareCell.props.children[0] : shareCell.props.children

    expect(questionTitle.props.children).toBe('Board continuity proposal')
    expect((resultHeaderChildren[0] as { props: { children: ReactNode } }).props.children).toBe('Option')
    expect((resultHeaderChildren[1] as { props: { children: ReactNode } }).props.children).toBe('Votes')
    expect((resultHeaderChildren[2] as { props: { children: ReactNode } }).props.children).toBe('Share')
    expect(optionLabel.props.children).toBe('Approve')
    expect(optionLabel.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ fontWeight: 700 })]))
    expect(barFill.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: '#18a3a8' }), { width: '70%' }])
    )
    expect((votesText as { props: { children: ReactNode } }).props.children).toBe('7')
    expect((shareText as { props: { children: ReactNode } }).props.children).toBe('70.00%')
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

  it('describes additional code verification in user-centric language', () => {
    const election = Object.assign(createElection(), {
      census: {
        size: 100,
        type: 'csp',
      },
    })

    const data = buildCertificateData({
      election,
      censusBundle: {
        census: {
          authFields: ['email'],
          twoFaFields: ['email'],
        },
      },
      t: ((key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key) as never,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    const additionalCodeVerification = data.authentication.find(
      (field) => field.label === 'Additional code verification'
    )

    expect(additionalCodeVerification?.value).toBe('Enabled: voters confirm their identity with a one-time code')
  })

  it('renders identity source fields with translated member labels', () => {
    const election = Object.assign(createElection(), {
      census: {
        size: 100,
        type: 'csp',
      },
      meta: {
        census: {
          fields: ['name', 'memberNumber', 'nationalId', 'customField'],
        },
      },
    })
    const translations: Record<string, string> = {
      'members.fields.firstname': 'Nom',
      'members.fields.member_number': 'Número de soci',
      'members.fields.national_id': "Document d'Identitat",
    }

    const data = buildCertificateData({
      election,
      t: ((key: string, options?: { defaultValue?: string }) =>
        translations[key] ?? options?.defaultValue ?? key) as never,
      now: new Date('2026-01-03T10:00:00Z'),
    })

    const identitySource = data.authentication.find((field) => field.label === 'Identity data source')

    expect(identitySource?.value).toBe("Nom, Número de soci, Document d'Identitat, customField")
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

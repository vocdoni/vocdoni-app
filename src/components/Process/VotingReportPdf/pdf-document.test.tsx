import { isValidElement, type ReactNode } from 'react'
import { fireEvent, render, screen, waitFor } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { VotingReportPdfButton } from './VotingReportPdfButton'
import { createElection, createElectionWithResults, createReport, collectTextContent } from './__fixtures__'

const mockModule = vi.hoisted(() => ({
  pdfSpy: vi.fn(),
}))

vi.mock('@react-pdf/renderer', () => ({
  pdf: (document) => {
    mockModule.pdfSpy(document)
    return { toBlob: vi.fn() }
  },
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
    useToast: () => vi.fn(),
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

describe('VotingCertificateDocument', () => {
  const { pdfSpy } = mockModule
  let toastSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    pdfSpy.mockReset()
    toastSpy = vi.fn()
  })

  afterEach(() => {
    pdfSpy.mockReset()
    toastSpy.mockReset()
  })

  it('splits the certificate into separate pages around section 4 and the legal notice', async () => {
    const election = createElection()

    render(<VotingReportPdfButton election={election} />)

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }))

    await waitFor(() => {
      expect(pdfSpy).toHaveBeenCalled()
    })

    const [documentElement] = pdfSpy.mock.calls[1]
    const documentTree = (documentElement.type as (props: typeof documentElement.props) => ReactNode)(
      documentElement.props
    ) as { props: { children: ReactNode } }
    const pages = Array.isArray(documentTree.props.children)
      ? documentTree.props.children
      : [documentTree.props.children]

    expect(pages).toHaveLength(5)
  })

  it('renders the vocdoni logo, a larger title, an index page, and page numbers', async () => {
    const election = createElection()

    render(<VotingReportPdfButton election={election} />)

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }))

    await waitFor(() => {
      expect(pdfSpy).toHaveBeenCalled()
    })

    const [documentElement] = pdfSpy.mock.calls[1]
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
      justifyContent: 'space-between',
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
    expect(subtitle.props.children).toBe('Process ID: 0x1234')
    expect(subtitle.props.children).not.toContain('Report issued on')
    const coverIntroPanel = coverContentChildren[1] as { props: { style?: Record<string, unknown> } }
    expect(coverIntroPanel.props.style).toMatchObject({
      marginTop: 'auto',
    })

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
    expect((indexFirstRowBlockChildren[1] as { props: { style?: Record<string, unknown> } }).props.style).toMatchObject(
      {
        borderBottomStyle: 'dotted',
      }
    )
    expect((indexFirstRowBlockChildren[2] as { props: { children: ReactNode } }).props.children).toBe('1')

    expect(indexListChildren).toHaveLength(7)

    const indexSecondRow = indexListChildren[4] as {
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
    expect(
      (indexSecondRowBlockChildren[1] as { props: { style?: Record<string, unknown> } }).props.style
    ).toMatchObject({
      borderBottomStyle: 'dotted',
    })
    expect((indexSecondRowBlockChildren[2] as { props: { children: ReactNode } }).props.children).toBe('2')

    const indexIssuerRow = indexListChildren[6] as {
      props: {
        src: '#report-page-5'
        children: ReactNode
      }
    }
    const indexIssuerRowChildren = Array.isArray(indexIssuerRow.props.children)
      ? indexIssuerRow.props.children
      : [indexIssuerRow.props.children]
    const indexIssuerRowBlock = indexIssuerRowChildren[0] as {
      props: { children: ReactNode }
    }
    const indexIssuerRowBlockChildren = Array.isArray(indexIssuerRowBlock.props.children)
      ? indexIssuerRowBlock.props.children
      : [indexIssuerRowBlock.props.children]
    expect(indexIssuerRow.props.src).toBe('#report-page-5')
    expect(
      (indexIssuerRowBlockChildren[1] as { props: { style?: Record<string, unknown> } }).props.style
    ).toMatchObject({
      borderBottomStyle: 'dotted',
    })
    expect((indexIssuerRowBlockChildren[2] as { props: { children: ReactNode } }).props.children).toBe('3')

    const firstSection = pages[2] as { props: { children: ReactNode } }
    const firstSectionChildren = Array.isArray(firstSection.props.children)
      ? firstSection.props.children
      : [firstSection.props.children]
    const firstSectionBlock = firstSectionChildren[4] as { props: { children: ReactNode } }
    const firstSectionBlockChildren = Array.isArray(firstSectionBlock.props.children)
      ? firstSectionBlock.props.children
      : [firstSectionBlock.props.children]
    const sectionTitle = firstSectionBlockChildren[0] as { props: { children: ReactNode } }

    expect(sectionTitle.props.children).toBe('1. Technical Framework')

    const turnoutSection = firstSectionChildren[7] as { props: { children: ReactNode } }
    const turnoutSectionChildren = Array.isArray(turnoutSection.props.children)
      ? turnoutSection.props.children
      : [turnoutSection.props.children]

    expect(turnoutSectionChildren).toHaveLength(3)

    const thirdPage = pages[2] as { props: { children: ReactNode } }
    const thirdPageChildren = Array.isArray(thirdPage.props.children)
      ? thirdPage.props.children
      : [thirdPage.props.children]
    const fourthPage = pages[3] as { props: { children: ReactNode } }
    const fourthPageChildren = Array.isArray(fourthPage.props.children)
      ? fourthPage.props.children
      : [fourthPage.props.children]
    const votingProcessSection = fourthPageChildren[4] as { props: { children: ReactNode } }
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
    const issuerSection = fifthPageChildren[4] as { props: { children: ReactNode } }
    const issuerSectionChildren = Array.isArray(issuerSection.props.children)
      ? issuerSection.props.children
      : [issuerSection.props.children]
    const issuerTitle = issuerSectionChildren[0] as { props: { children: ReactNode } }

    expect(issuerTitle.props.children).toBe('7. Issuer')

    const legalNotice = fifthPageChildren[5] as { props: { style?: Record<string, unknown>; children: ReactNode } }
    expect(legalNotice.props.style).toMatchObject({
      marginTop: 'auto',
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
    // The outer View carries the absolute positioning; the inner Text carries text styles + render prop.
    expect(renderedPageNumber).toMatchObject({
      props: {
        style: {
          position: 'absolute',
          bottom: 22,
          left: 56,
          right: 56,
        },
      },
    })
    const pageNumberView = renderedPageNumber as {
      props: { fixed?: boolean; style?: Record<string, unknown>; children?: ReactNode }
    }
    // The inner Text child carries text styles and the render prop.
    const innerText = pageNumberView.props.children as {
      props: { render?: (args: { pageNumber: number; totalPages: number }) => string; style?: Record<string, unknown> }
    }
    expect(innerText.props.style).toMatchObject({
      textAlign: 'right',
      color: '#111827',
      fontSize: 11,
      fontWeight: 700,
    })
    expect((innerText.props.style as Record<string, unknown>).lineHeight).toBeUndefined()
    expect(innerText.props.render?.({ pageNumber: 5, totalPages: 5 })).toBe('Page 3')
  })

  it('renders all result rows with colored bars', async () => {
    render(<VotingReportPdfButton election={createElectionWithResults()} />)

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }))

    await waitFor(() => {
      expect(pdfSpy).toHaveBeenCalled()
    })

    const [documentElement] = pdfSpy.mock.calls[1]
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
    const votingProcessSection = fourthPageChildren[4] as { props: { children: ReactNode } }
    const votingProcessSectionChildren = Array.isArray(votingProcessSection.props.children)
      ? votingProcessSection.props.children
      : [votingProcessSection.props.children]
    const flattenedVotingProcessChildren = votingProcessSectionChildren.flat()
    const questionCard = flattenedVotingProcessChildren[2] as { props: { children: ReactNode } }
    const questionCardChildren = Array.isArray(questionCard.props.children)
      ? questionCard.props.children
      : [questionCard.props.children]
    const questionTitle = questionCardChildren[0] as { props: { children: ReactNode } }
    const questionSummary = questionCardChildren[1] as { props: { children: ReactNode } }
    const questionSummaryChildren = Array.isArray(questionSummary.props.children)
      ? questionSummary.props.children
      : [questionSummary.props.children]
    const votesSummary = questionSummaryChildren[0] as { props: { children: ReactNode } }
    const methodSummary = questionSummaryChildren[1] as { props: { children: ReactNode } }
    const votesSummaryChildren = Array.isArray(votesSummary.props.children)
      ? votesSummary.props.children
      : [votesSummary.props.children]
    const methodSummaryChildren = Array.isArray(methodSummary.props.children)
      ? methodSummary.props.children
      : [methodSummary.props.children]
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
    const secondResultRow = flattenedResultTableChildren[2] as {
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
    const renderedSecondResultRow = secondResultRow.type(secondResultRow.props) as { props: { children: ReactNode } }
    const renderedSecondResultRowChildren = Array.isArray(renderedSecondResultRow.props.children)
      ? renderedSecondResultRow.props.children
      : [renderedSecondResultRow.props.children]
    const secondOptionCell = renderedSecondResultRowChildren[0] as { props: { children: ReactNode } }
    const secondOptionCellChildren = Array.isArray(secondOptionCell.props.children)
      ? secondOptionCell.props.children
      : [secondOptionCell.props.children]
    const secondBarTrack = secondOptionCellChildren[1] as { props: { children: ReactNode } }
    const secondBarFill = secondBarTrack.props.children as { props: { style: Array<Record<string, unknown>> } }
    const votesCell = renderedFirstResultRowChildren[1] as { props: { children: ReactNode } }
    const votesText = Array.isArray(votesCell.props.children) ? votesCell.props.children[0] : votesCell.props.children
    const shareCell = renderedFirstResultRowChildren[2] as { props: { children: ReactNode } }
    const shareText = Array.isArray(shareCell.props.children) ? shareCell.props.children[0] : shareCell.props.children

    expect(questionTitle.props.children).toBe('Board continuity proposal')
    expect((votesSummaryChildren[0] as { props: { children: ReactNode } }).props.children).toBe('Total votes')
    expect((votesSummaryChildren[1] as { props: { children: ReactNode } }).props.children).toBe('10 votes')
    expect((methodSummaryChildren[0] as { props: { children: ReactNode } }).props.children).toBe('Voting method')
    expect((methodSummaryChildren[1] as { props: { children: ReactNode } }).props.children).toBe('Single choice')
    expect((resultHeaderChildren[0] as { props: { children: ReactNode } }).props.children).toBe('Option')
    expect((resultHeaderChildren[1] as { props: { children: ReactNode } }).props.children).toBe('Votes')
    expect((resultHeaderChildren[2] as { props: { children: ReactNode } }).props.children).toBe('Share of votes')
    expect(optionLabel.props.children).toBe('Approve')
    expect(barFill.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: '#18a3a8' }), { width: '70%' }])
    )
    expect(secondBarFill.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: '#18a3a8' }), { width: '30%' }])
    )
    expect((votesText as { props: { children: ReactNode } }).props.children).toBe('7')
    expect((shareText as { props: { children: ReactNode } }).props.children).toBe('70.0%')
  })

  it('renders weighted question cards with voting-power result columns', async () => {
    const weightedElection = Object.assign(createElection(), {
      voteCount: 2,
      census: {
        size: 3,
        type: CensusType.WEIGHTED,
        weight: 2000,
      },
      meta: {
        token: {
          decimals: 2,
        },
      },
      questions: [
        {
          title: { default: 'Weighted board proposal' },
          choices: [
            { title: { default: 'Approve' }, results: 700 },
            { title: { default: 'Reject' }, results: 300 },
          ],
        },
      ],
    }) as PublishedElection

    render(<VotingReportPdfButton election={weightedElection} />)

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }))

    await waitFor(() => {
      expect(pdfSpy).toHaveBeenCalled()
    })

    const [documentElement] = pdfSpy.mock.calls[1]
    const documentText = collectTextContent(documentElement)

    expect(documentText.filter((text) => text === 'Counting basis').length).toBeGreaterThan(0)
    expect(documentText.filter((text) => text === 'Weighted voting').length).toBeGreaterThan(0)
    expect(documentText.filter((text) => text === 'Voting power used').length).toBeGreaterThan(0)
    expect(documentText).toContain('10 voting power')
    expect(documentText.filter((text) => text === 'Submitted ballots').length).toBeGreaterThan(0)
    expect(documentText).toContain('2 ballots')
    expect(documentText.filter((text) => text === 'Total eligible voting power').length).toBeGreaterThan(0)
    expect(documentText).toContain('20 voting power')
    expect(documentText.filter((text) => text === 'Voting power').length).toBeGreaterThan(0)
    expect(documentText).toContain('Share of cast power')
    expect(documentText).toContain('Share of eligible power')
    expect(documentText).not.toContain('Share of votes')
  })

  it('uses CSP weighted metadata during PDF download when election context reports unweighted', async () => {
    const cspWeightedElection = Object.assign(createElection(), {
      voteCount: 2,
      census: {
        size: 3,
        type: CensusType.CSP,
      },
      meta: {
        census: {
          type: 'csp',
          weighted: true,
        },
      },
      questions: [
        {
          title: { default: 'Weighted memberbase proposal' },
          choices: [
            { title: { default: 'Approve' }, results: 7 },
            { title: { default: 'Reject' }, results: 3 },
          ],
        },
      ],
    }) as PublishedElection

    setReactProvidersMock({
      useElection: () => ({
        election: cspWeightedElection,
        isWeighted: false,
        participation: 66.67,
        turnout: 333.33,
      }),
    })

    render(<VotingReportPdfButton election={cspWeightedElection} />)

    fireEvent.click(screen.getByRole('button', { name: /download pdf/i }))

    await waitFor(() => {
      expect(pdfSpy).toHaveBeenCalled()
    })

    const [documentElement] = pdfSpy.mock.calls[1]
    const documentText = collectTextContent(documentElement)

    expect(documentText.filter((text) => text === 'Weighted voting').length).toBeGreaterThan(0)
    expect(documentText.filter((text) => text === 'Voting power').length).toBeGreaterThan(0)
    expect(documentText).toContain('10 voting power')
    expect(documentText).not.toContain('1 person, 1 vote')
    expect(documentText).not.toContain('Share of votes')
  })
})

import { CensusType, ElectionStatus, PublishedElection } from '@vocdoni/sdk'

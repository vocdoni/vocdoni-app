import { fireEvent, render, screen, waitFor } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { VotingReportPdfButton } from './VotingReportPdfButton'
import { PROCESS_ID, createElection, createQuestion, createQuestionResults, createResults } from './__fixtures__'

const mockModule = vi.hoisted(() => ({
  pdfToBlob: vi.fn(),
  pdfSpy: vi.fn(),
  trackAnalyticsEvent: vi.fn(),
}))

// Partial mock: keep the real AnalyticsEvents taxonomy, intercept only the sink.
vi.mock('~utils/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~utils/analytics')>()),
  trackAnalyticsEvent: mockModule.trackAnalyticsEvent,
}))

vi.mock('@react-pdf/renderer', () => ({
  pdf: (document) => {
    mockModule.pdfSpy(document)
    return { toBlob: mockModule.pdfToBlob }
  },
  Document: ({ children }: { children: import('react').ReactNode }) => <div>{children}</div>,
  Image: ({ src, alt }: { src?: string; alt?: string }) => (
    <img src={typeof src === 'string' ? src : undefined} alt={alt ?? 'image'} />
  ),
  Link: ({ children, ...props }: { children: import('react').ReactNode } & Record<string, unknown>) => (
    <a {...props}>{children}</a>
  ),
  Page: ({ children }: { children: import('react').ReactNode }) => <div>{children}</div>,
  Text: ({ children, ...props }: { children: import('react').ReactNode } & Record<string, unknown>) => (
    <span {...props}>{children}</span>
  ),
  View: ({ children }: { children: import('react').ReactNode }) => <div>{children}</div>,
  StyleSheet: { create: (styles: Record<string, unknown>) => styles },
  Font: { registerHyphenationCallback: vi.fn() },
}))

vi.mock('~components/Toast', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~components/Toast')>()

  return {
    ...actual,
    ToastProvider: ({ children }: { children: unknown }) => <>{children}</>,
    useToast: () => vi.fn(),
  }
})

describe('VotingReportPdfButton', () => {
  const { pdfToBlob, pdfSpy } = mockModule
  const realCreateElement = document.createElement.bind(document)

  beforeEach(() => {
    pdfToBlob.mockReset()
    pdfSpy.mockReset()
    mockModule.trackAnalyticsEvent.mockReset()
  })

  it('downloads a pdf built from the fetched results when the button is clicked', async () => {
    pdfToBlob.mockResolvedValue(new Blob(['pdf']))
    const getResults = vi.fn().mockResolvedValue(createResults())
    setReactProvidersMock({
      useClient: () => ({ client: { elections: { getResults } } }),
    })
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
      expect(pdfSpy).toHaveBeenCalled()
      expect(clickSpy).toHaveBeenCalled()
      expect(anchor.download).toBe(`annual-vote-${PROCESS_ID}.pdf`)
    })
    expect(getResults).toHaveBeenCalledWith(PROCESS_ID)

    createElementSpy.mockRestore()
    createObjectUrlSpy.mockRestore()
    revokeObjectUrlSpy.mockRestore()
    clickSpy.mockRestore()
  })

  it('still generates the report when the results endpoint has nothing to return', async () => {
    pdfToBlob.mockResolvedValue(new Blob(['pdf']))
    const getResults = vi.fn().mockRejectedValue(new Error('no results yet'))
    setReactProvidersMock({
      useClient: () => ({ client: { elections: { getResults } } }),
    })
    const anchor = realCreateElement('a')
    const clickSpy = vi.spyOn(anchor, 'click').mockImplementation(() => undefined)
    const createObjectUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:report')
    const revokeObjectUrlSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockImplementation((tagName) => (tagName === 'a' ? anchor : realCreateElement(tagName)))

    render(<VotingReportPdfButton election={createElection()} />)

    fireEvent.click(screen.getByRole('button', { name: /election report \(pdf\)/i }))

    await waitFor(() => {
      expect(pdfSpy).toHaveBeenCalled()
      expect(clickSpy).toHaveBeenCalled()
    })

    createElementSpy.mockRestore()
    createObjectUrlSpy.mockRestore()
    revokeObjectUrlSpy.mockRestore()
    clickSpy.mockRestore()
  })

  it('tracks a report that could not be generated', async () => {
    pdfToBlob.mockRejectedValue(new TypeError('font failed to load'))
    setReactProvidersMock({
      useClient: () => ({ client: { elections: { getResults: vi.fn().mockResolvedValue(createResults()) } } }),
    })

    render(<VotingReportPdfButton election={createElection()} />)

    fireEvent.click(screen.getByRole('button', { name: /election report \(pdf\)/i }))

    await waitFor(() => {
      expect(mockModule.trackAnalyticsEvent).toHaveBeenCalledWith({
        name: 'pdf_report_failed',
        props: { election_id: PROCESS_ID, error_name: 'TypeError' },
      })
    })
    expect(mockModule.trackAnalyticsEvent).not.toHaveBeenCalledWith(
      expect.objectContaining({ name: 'pdf_report_downloaded' })
    )
  })

  it('re-reads the process and its tallies instead of certifying the election context copies', async () => {
    pdfToBlob.mockResolvedValue(new Blob(['pdf']))
    const election = createElection()
    // What the ElectionProvider fetched when the dashboard mounted: it never polls, so by
    // download time these tallies can be arbitrarily old.
    const staleResults = createResults({ questions: [createQuestionResults({ voteCount: 2, results: [['2', '0']] })] })
    const freshResults = createResults()
    const get = vi.fn().mockResolvedValue(election)
    const getResults = vi.fn().mockResolvedValue(freshResults)
    setReactProvidersMock({
      useClient: () => ({ client: { elections: { get, getResults } } }),
      useElection: () => ({ election, results: staleResults, connected: false, loading: {}, errors: {} }),
    })
    const anchor = realCreateElement('a')
    const clickSpy = vi.spyOn(anchor, 'click').mockImplementation(() => undefined)
    const createObjectUrlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:report')
    const revokeObjectUrlSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockImplementation((tagName) => (tagName === 'a' ? anchor : realCreateElement(tagName)))

    render(<VotingReportPdfButton />)

    fireEvent.click(screen.getByRole('button', { name: /election report \(pdf\)/i }))

    await waitFor(() => expect(clickSpy).toHaveBeenCalled())
    expect(get).toHaveBeenCalledWith(PROCESS_ID)
    expect(getResults).toHaveBeenCalledWith(PROCESS_ID)
    // The certificate reports the freshly read tallies (7 + 3), not the context's stale 2.
    expect(pdfSpy.mock.calls[0][0].props.data.votingProcessQuestions[0]).toMatchObject({
      submittedBallots: '10',
      choices: [expect.objectContaining({ votes: '7' }), expect.objectContaining({ votes: '3' })],
    })

    createElementSpy.mockRestore()
    createObjectUrlSpy.mockRestore()
    revokeObjectUrlSpy.mockRestore()
    clickSpy.mockRestore()
  })

  it('renders nothing while the voting process is still ongoing', () => {
    const ongoingElection = createElection({ questions: [createQuestion({ status: 'ONGOING' })] })

    render(<VotingReportPdfButton election={ongoingElection} />)

    expect(screen.queryByRole('button', { name: /election report \(pdf\)/i })).toBeNull()
  })

  it('announces the report as disabled while an ended process computes its results', () => {
    // The report is not generatable yet, but it will be — so it is shown disabled rather than
    // appearing out of nowhere once the tallies land.
    const endedElection = createElection({ questions: [createQuestion({ status: 'ENDED' })] })

    render(<VotingReportPdfButton election={endedElection} />)

    const button = screen.getByRole('button', { name: /election report \(pdf\)/i })

    expect(button).toBeDisabled()
    // The tooltip must hang off a wrapper, not the disabled button: a disabled element fires no
    // pointer events, so a trigger on it would never open the explanation.
    expect(button).not.toHaveAttribute('data-part', 'trigger')
  })

  it('renders nothing for a canceled process, which never produces a tally', () => {
    const canceledElection = createElection({ questions: [createQuestion({ status: 'CANCELED' })] })

    render(<VotingReportPdfButton election={canceledElection} />)

    expect(screen.queryByRole('button', { name: /election report \(pdf\)/i })).toBeNull()
  })
})

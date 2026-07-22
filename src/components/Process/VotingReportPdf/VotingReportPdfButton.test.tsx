import { fireEvent, render, screen, waitFor } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { VotingReportPdfButton } from './VotingReportPdfButton'
import { PROCESS_ID, createElection, createQuestion, createResults } from './__fixtures__'

const mockModule = vi.hoisted(() => ({
  pdfToBlob: vi.fn(),
  pdfSpy: vi.fn(),
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

  it('renders nothing while the voting process is still ongoing', () => {
    const ongoingElection = createElection({ questions: [createQuestion({ status: 'ONGOING' })] })

    render(<VotingReportPdfButton election={ongoingElection} />)

    expect(screen.queryByRole('button', { name: /election report \(pdf\)/i })).toBeNull()
  })
})

import { fireEvent, render, screen, waitFor } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { VotingReportPdfButton } from './VotingReportPdfButton'
import { createElection, createResults } from './__fixtures__'

const state = vi.hoisted(() => ({ rendererLoaded: false }))

vi.mock('@react-pdf/renderer', async () => {
  state.rendererLoaded = true
  const passthrough = ({ children }: { children?: import('react').ReactNode }) => <div>{children}</div>
  return {
    pdf: () => ({ toBlob: () => Promise.resolve(new Blob(['pdf'])) }),
    Document: passthrough,
    Image: () => null,
    Link: passthrough,
    Page: passthrough,
    Text: passthrough,
    View: passthrough,
    StyleSheet: { create: (styles: Record<string, unknown>) => styles },
    Font: { registerHyphenationCallback: vi.fn() },
  }
})

vi.mock('~components/Toast', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~components/Toast')>()
  return { ...actual, ToastProvider: ({ children }: { children: unknown }) => <>{children}</>, useToast: () => vi.fn() }
})

describe('VotingReportPdfButton loading', () => {
  it('keeps the PDF renderer out of the bundle until a report is requested', async () => {
    setReactProvidersMock({
      useClient: () => ({ client: { elections: { getResults: vi.fn().mockResolvedValue(createResults()) } } }),
    })
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:report')
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)

    render(<VotingReportPdfButton election={createElection()} />)

    expect(state.rendererLoaded).toBe(false)

    fireEvent.click(screen.getByRole('button', { name: /election report \(pdf\)/i }))

    await waitFor(() => expect(state.rendererLoaded).toBe(true))
  })
})

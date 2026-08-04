import { fireEvent, render, screen, waitFor } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { createElection, createResults } from './VotingReportPdf/__fixtures__'
import { VotingReportPdfButton } from './VotingReportPdf/VotingReportPdfButton'

const realCreateElement = document.createElement.bind(document)

describe('VotingReportPdf integration', () => {
  it('downloads a pdf without throwing when using the real renderer', async () => {
    setReactProvidersMock({
      useClient: () => ({ client: { elections: { getResults: vi.fn().mockResolvedValue(createResults()) } } }),
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

    await waitFor(
      () => {
        expect(clickSpy).toHaveBeenCalled()
      },
      { timeout: 10_000 }
    )

    createElementSpy.mockRestore()
    createObjectUrlSpy.mockRestore()
    revokeObjectUrlSpy.mockRestore()
    clickSpy.mockRestore()
  })
})

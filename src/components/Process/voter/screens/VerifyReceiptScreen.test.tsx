import { fireEvent, screen } from '@testing-library/react'
import { renderWithFlow, testFacts, testFlow } from '../test-flow'
import { VerifyReceiptScreen } from './VerifyReceiptScreen'

const CODE = '7f3a9c2e41d0b85e6a1f2c9d4b7e0a3f5c8d1e6b9a2f4c7d0e3b6a9f1c4d7e2a'

const field = () => screen.getByRole('textbox')
const submit = () => screen.getByRole('button', { name: 'voter.verify.submit' })

describe('VerifyReceiptScreen (boards 14 and 14b)', () => {
  let open: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    open = vi.spyOn(window, 'open').mockImplementation(() => null)
  })
  afterEach(() => open.mockRestore())

  it('has one titled field in the figure face, a hint, "Enrere" and the Explorer button, and no identification', () => {
    const flow = testFlow({ facts: testFacts({ status: 'ENDED', connected: false }), anonymous: true })
    renderWithFlow(<VerifyReceiptScreen />, flow)
    expect(screen.getByTestId('voter-screen')).toHaveAttribute('data-screen', 'verifyReceipt')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('voter.verify.title')
    expect(screen.getAllByRole('textbox')).toHaveLength(1)
    expect(screen.getByLabelText('voter.verify.field_label')).toBe(field())
    expect(field()).toHaveStyle({ fontFamily: 'var(--chakra-fonts-figure)' })
    expect(screen.getByText('voter.verify.hint')).toBeInTheDocument()
    // The vote is over: the closed line, not "open until".
    expect(screen.getByText('voter.results.closed_on')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'voter.back' }))
    expect(flow.verifyReceipt).toHaveBeenCalledWith(false)
  })

  it('says the vote is open until its end while it is live', () => {
    renderWithFlow(<VerifyReceiptScreen />, testFlow({ anonymous: true }))
    expect(screen.getByText('voter.status.open_until')).toBeInTheDocument()
  })

  it('opens the code on the Explorer in a new tab without an opener, normalised', () => {
    renderWithFlow(<VerifyReceiptScreen />, testFlow({ anonymous: true }))
    fireEvent.change(field(), { target: { value: `  0x${CODE.toUpperCase()} ` } })
    fireEvent.click(submit())
    expect(open).toHaveBeenCalledTimes(1)
    const [url, target, features] = open.mock.calls[0]
    expect(String(url)).toMatch(new RegExp(`^https://[^ ]+/verify/${CODE}$`))
    expect(target).toBe('_blank')
    expect(features).toBe('noopener')
    expect(field()).not.toHaveAttribute('aria-invalid', 'true')
  })

  it('names a shortened code, keeps the focus in the field and opens nothing (board 14b)', () => {
    renderWithFlow(<VerifyReceiptScreen />, testFlow({ anonymous: true }))
    fireEvent.change(field(), { target: { value: 'a3f1…9c2e' } })
    fireEvent.click(submit())
    expect(open).not.toHaveBeenCalled()
    expect(field()).toHaveAttribute('aria-invalid', 'true')
    expect(field()).toHaveFocus()
    expect(field()).toHaveAccessibleDescription('voter.verify.error_incomplete')
    // The error goes as soon as the voter edits the value.
    fireEvent.change(field(), { target: { value: CODE } })
    expect(field()).not.toHaveAttribute('aria-invalid', 'true')
    expect(screen.queryByText('voter.verify.error_incomplete')).toBeNull()
  })

  it('gives the generic format error for anything else, including an empty field', () => {
    renderWithFlow(<VerifyReceiptScreen />, testFlow({ anonymous: true }))
    fireEvent.click(submit())
    expect(field()).toHaveAccessibleDescription('voter.verify.error_format')
    fireEvent.change(field(), { target: { value: CODE.slice(2) } })
    fireEvent.submit(field().closest('form') as HTMLFormElement)
    expect(field()).toHaveAccessibleDescription('voter.verify.error_format')
    expect(open).not.toHaveBeenCalled()
  })
})

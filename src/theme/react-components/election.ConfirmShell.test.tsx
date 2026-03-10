import { render, screen } from '~src/test-utils'
import { electionComponents } from './election'

const ConfirmShell = electionComponents.ConfirmShell!

describe('electionComponents.ConfirmShell', () => {
  it('renders content when open', () => {
    const onClose = vi.fn()

    render(<ConfirmShell isOpen={true} onClose={onClose} content={<span>confirm body</span>} />)

    expect(screen.getByText('confirm body')).toBeInTheDocument()
  })
})

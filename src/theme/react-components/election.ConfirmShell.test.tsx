import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '~src/test-utils'
import { electionComponents } from './election'

const ConfirmShell = electionComponents.ConfirmShell!

describe('electionComponents.ConfirmShell', () => {
  it('renders content only while open', async () => {
    const { rerender } = render(<ConfirmShell isOpen={false} onClose={vi.fn()} content={<span>confirm body</span>} />)
    expect(screen.queryByText('confirm body')).not.toBeInTheDocument()

    rerender(<ConfirmShell isOpen={true} onClose={vi.fn()} content={<span>confirm body</span>} />)
    expect(await screen.findByText('confirm body')).toBeInTheDocument()
  })

  it('reports a user dismissal through onClose', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()

    render(<ConfirmShell isOpen={true} onClose={onClose} content={<span>confirm body</span>} />)
    await screen.findByText('confirm body')
    // The dialog registers its Escape listener asynchronously after mounting, and under load
    // a single early keypress lands before it exists, so keep pressing until it is heard.
    await waitFor(async () => {
      await user.keyboard('{Escape}')
      expect(onClose).toHaveBeenCalled()
    })
  })
})

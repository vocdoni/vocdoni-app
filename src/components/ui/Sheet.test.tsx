import userEvent from '@testing-library/user-event'
import { render, screen } from '~src/test-utils'
import { Sheet } from './Sheet'

describe('Sheet', () => {
  it('is a dialog named by its title, with header actions, body and footer', async () => {
    render(
      <Sheet
        open
        onOpenChange={vi.fn()}
        title='Jordi Serra'
        headerActions={<button>Save</button>}
        footer={<button>Delete</button>}
      >
        <p>Member details</p>
      </Sheet>
    )

    const dialog = await screen.findByRole('dialog', { name: 'Jordi Serra' })
    expect(dialog).toHaveTextContent('Member details')
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('asks to close from its close button', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <Sheet open onOpenChange={onOpenChange} title='Jordi Serra'>
        <p>Member details</p>
      </Sheet>
    )

    await user.click(await screen.findByRole('button', { name: 'Close' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('renders nothing while closed', () => {
    render(
      <Sheet open={false} onOpenChange={vi.fn()} title='Jordi Serra'>
        <p>Member details</p>
      </Sheet>
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

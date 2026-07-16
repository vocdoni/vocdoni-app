import { fireEvent, render, screen } from '~src/test-utils'
import { ConfirmDialog } from './ConfirmDialog'

describe('ConfirmDialog', () => {
  it('renders title, description and footer actions when open', () => {
    render(
      <ConfirmDialog
        open
        title='Remove member'
        description='This cannot be undone'
        confirmText='Remove'
        cancelText='Cancel'
        onConfirm={() => {}}
      />
    )

    expect(screen.getByText('Remove member')).toBeInTheDocument()
    expect(screen.getByText('This cannot be undone')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('fires onConfirm when the confirm button is clicked', () => {
    let confirmed = false
    render(<ConfirmDialog open title='Confirm' confirmText='Yes' onConfirm={() => (confirmed = true)} />)

    fireEvent.click(screen.getByRole('button', { name: 'Yes' }))
    expect(confirmed).toBe(true)
  })
})

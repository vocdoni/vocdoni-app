import userEvent from '@testing-library/user-event'
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

  it('closes through onOpenChange when Cancel is clicked', async () => {
    const onOpenChange = vi.fn()
    render(<ConfirmDialog open title='Confirm' cancelText='No' onConfirm={() => {}} onOpenChange={onOpenChange} />)

    await userEvent.click(screen.getByRole('button', { name: 'No' }))
    expect(onOpenChange).toHaveBeenCalledWith(expect.objectContaining({ open: false }))
  })

  it('calls onCancel instead of closing when it is given', async () => {
    const onOpenChange = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        open
        title='Confirm'
        cancelText='No'
        onConfirm={() => {}}
        onCancel={onCancel}
        onOpenChange={onOpenChange}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'No' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onOpenChange).not.toHaveBeenCalled()
  })
})

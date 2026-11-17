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

  it('draws a danger confirm by default and a primary one on request', () => {
    const { unmount } = render(<ConfirmDialog open title='Delete?' confirmText='Delete' onConfirm={() => {}} />)
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveAttribute('data-tone', 'danger')
    unmount()

    render(<ConfirmDialog open tone='primary' title='End now?' confirmText='End now' onConfirm={() => {}} />)
    expect(screen.getByRole('button', { name: 'End now' })).toHaveAttribute('data-tone', 'primary')
  })

  it('prints the warning line under the description', () => {
    render(
      <ConfirmDialog
        open
        title='End the vote now?'
        description='It closes with the votes cast.'
        warning='3 people have not voted yet.'
        onConfirm={() => {}}
      />
    )

    const description = screen.getByText('It closes with the votes cast.')
    const warning = screen.getByText('3 people have not voted yet.')
    expect(description.compareDocumentPosition(warning) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('describes the dialog with its description', async () => {
    render(
      <ConfirmDialog open title='Close question 3?' description='Its result becomes final.' onConfirm={() => {}} />
    )

    expect(await screen.findByRole('dialog', { description: 'Its result becomes final.' })).toBeInTheDocument()
  })

  it('has no warning line without a warning', () => {
    render(<ConfirmDialog open title='Confirm' description='Body' onConfirm={() => {}} />)

    expect(document.querySelector('[data-part="warning"]')).toBeNull()
  })
})

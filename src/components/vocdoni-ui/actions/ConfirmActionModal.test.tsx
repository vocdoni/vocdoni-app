import { Dialog } from '@chakra-ui/react'
import { render, screen } from '~src/test-utils'
import { ConfirmActionModal } from './ConfirmActionModal'

vi.mock('../confirm/useConfirm', () => ({
  useConfirm: () => ({
    cancel: vi.fn(),
    proceed: vi.fn(),
  }),
}))

describe('ConfirmActionModal', () => {
  it('renders title and description', () => {
    render(
      <Dialog.Root open>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <ConfirmActionModal title='Confirm title' description='Confirm description' />
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    )
    expect(screen.getByText('Confirm title')).toBeInTheDocument()
    expect(screen.getByText('Confirm description')).toBeInTheDocument()
  })
})

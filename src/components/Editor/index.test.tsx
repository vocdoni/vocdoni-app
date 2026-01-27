import userEvent from '@testing-library/user-event'
import { render, screen } from '~src/test-utils'
import Editor from './index'

describe('Editor', () => {
  it('renders a contenteditable textbox with placeholder', () => {
    render(<Editor placeholder='Add a description...' defaultValue='' />)

    const textbox = screen.getByRole('textbox')
    expect(textbox).toHaveAttribute('contenteditable')
    expect(screen.getByText('Add a description...')).toBeInTheDocument()
  })

  it('can focus the editor without errors', async () => {
    const user = userEvent.setup()

    render(<Editor placeholder='Add a description...' defaultValue='' />)

    const textbox = screen.getByRole('textbox')
    await user.click(textbox)
    expect(textbox).toHaveFocus()
  })
})

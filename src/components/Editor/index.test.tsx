import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '~src/test-utils'
import Editor from './index'

if (!Range.prototype.getBoundingClientRect) {
  Range.prototype.getBoundingClientRect = () =>
    ({
      x: 0,
      y: 0,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      width: 0,
      height: 0,
      toJSON: () => '',
    }) as DOMRect
}

describe('Editor', () => {
  it('renders a contenteditable textbox with placeholder', () => {
    render(<Editor placeholder='Add a description...' defaultValue='' />)

    const textbox = screen.getByRole('textbox')
    expect(textbox).toHaveAttribute('contenteditable')
    const placeholder = screen.getByText('Add a description...')
    expect(placeholder).toBeInTheDocument()
    expect(placeholder).toHaveAttribute('aria-hidden', 'true')
  })

  it('can focus the editor without errors', async () => {
    const user = userEvent.setup()

    render(<Editor placeholder='Add a description...' defaultValue='' />)

    const textbox = screen.getByRole('textbox')
    await user.click(textbox)
    expect(textbox).toHaveFocus()
  })

  it('renders and updates the editor with controlled markdown value', async () => {
    const { rerender } = render(<Editor value='Hello world' />)

    const textbox = screen.getByRole('textbox')
    await waitFor(() => expect(textbox).toHaveTextContent('Hello world'))

    rerender(<Editor value='Updated content' />)

    await waitFor(() => expect(textbox).toHaveTextContent('Updated content'))
  })
})

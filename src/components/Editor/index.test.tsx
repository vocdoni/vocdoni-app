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

  it('names the textbox after its label, falling back to the placeholder', () => {
    const { unmount } = render(<Editor ariaLabel='Description' placeholder='Add a description...' />)
    expect(screen.getByRole('textbox', { name: 'Description' })).toBeInTheDocument()
    unmount()

    render(<Editor placeholder='Add a description...' />)
    expect(screen.getByRole('textbox', { name: 'Add a description...' })).toBeInTheDocument()
  })

  // Each floating toolbar listens to every selection change in the document: with one per editor, a form with
  // many editors ran all of them on each caret move
  it('runs the floating toolbars only for the focused editor', async () => {
    const user = userEvent.setup()
    const listening = new Set<EventListenerOrEventListenerObject>()
    const { addEventListener, removeEventListener } = document
    const add = vi.spyOn(document, 'addEventListener').mockImplementation(function (this: Document, ...args) {
      if (args[0] === 'selectionchange') listening.add(args[1])
      return addEventListener.apply(this, args)
    })
    const remove = vi.spyOn(document, 'removeEventListener').mockImplementation(function (this: Document, ...args) {
      if (args[0] === 'selectionchange') listening.delete(args[1])
      return removeEventListener.apply(this, args)
    })

    try {
      render(
        <>
          <Editor placeholder='First' defaultValue='' />
          <Editor placeholder='Second' defaultValue='' />
          <Editor placeholder='Third' defaultValue='' />
          <input aria-label='Elsewhere' />
        </>
      )
      // Lexical itself listens once per document, whatever the number of editors
      const idle = listening.size

      const [first, second] = screen.getAllByRole('textbox')
      await user.click(first)
      expect(listening.size).toBe(idle + 1)

      await user.click(second)
      expect(listening.size).toBe(idle + 1)

      await user.click(screen.getByRole('textbox', { name: 'Elsewhere' }))
      expect(listening.size).toBe(idle)
    } finally {
      add.mockRestore()
      remove.mockRestore()
    }
  })

  it('shows the format toolbar for a selection in the focused editor', async () => {
    const user = userEvent.setup()
    render(<Editor placeholder='Add a description...' defaultValue='hello world' />)

    const textbox = screen.getByRole('textbox')
    await user.click(textbox)
    const text = textbox.querySelector('span')!.firstChild!
    const range = document.createRange()
    range.setStart(text, 0)
    range.setEnd(text, 5)
    window.getSelection()!.removeAllRanges()
    window.getSelection()!.addRange(range)
    document.dispatchEvent(new Event('selectionchange'))

    expect(await screen.findByRole('button', { name: 'Bold' })).toBeInTheDocument()
  })

  it('stops the floating toolbars when focus leaves through one of them', async () => {
    const user = userEvent.setup()
    const listening = new Set<EventListenerOrEventListenerObject>()
    const { addEventListener, removeEventListener } = document
    const add = vi.spyOn(document, 'addEventListener').mockImplementation(function (this: Document, ...args) {
      if (args[0] === 'selectionchange') listening.add(args[1])
      return addEventListener.apply(this, args)
    })
    const remove = vi.spyOn(document, 'removeEventListener').mockImplementation(function (this: Document, ...args) {
      if (args[0] === 'selectionchange') listening.delete(args[1])
      return removeEventListener.apply(this, args)
    })

    try {
      render(
        <>
          <Editor placeholder='Add a description...' defaultValue='hello world' />
          <input aria-label='Elsewhere' />
        </>
      )
      const idle = listening.size
      const textbox = screen.getAllByRole('textbox')[0]
      await user.click(textbox)
      const text = textbox.querySelector('span')!.firstChild!
      const range = document.createRange()
      range.setStart(text, 0)
      range.setEnd(text, 5)
      window.getSelection()!.removeAllRanges()
      window.getSelection()!.addRange(range)
      document.dispatchEvent(new Event('selectionchange'))

      // Focus moves into the toolbar, then on to another field
      await user.click(await screen.findByRole('button', { name: 'Bold' }))
      expect(listening.size).toBe(idle + 1)
      await user.click(screen.getByRole('textbox', { name: 'Elsewhere' }))

      expect(listening.size).toBe(idle)
    } finally {
      add.mockRestore()
      remove.mockRestore()
    }
  })
})

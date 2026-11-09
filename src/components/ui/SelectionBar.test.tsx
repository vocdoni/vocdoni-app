import { act, fireEvent, render, screen } from '~src/test-utils'
import { SupportChatControlsProvider, useSupportChatControls } from '~components/SupportChat/controls'
import { TOAST_BOTTOM_OFFSET_VAR } from '~components/Toast'
import { SELECTION_ANNOUNCE_DELAY, SelectionBar } from './SelectionBar'

const ChatState = () => {
  const controls = useSupportChatControls()
  return <span data-testid='chat'>{controls?.hidden ? 'hidden' : 'shown'}</span>
}

describe('SelectionBar', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the count, its actions and a labelled clear button', () => {
    const onClear = vi.fn()
    render(
      <SelectionBar count={1234} secondary='(2 not on this page)' onClear={onClear}>
        <button>Save as census</button>
      </SelectionBar>
    )

    expect(screen.getByText('1,234 selected')).toBeInTheDocument()
    expect(screen.getByText('(2 not on this page)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save as census' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }))
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('announces the count once it settles', () => {
    vi.useFakeTimers()
    const { rerender } = render(<SelectionBar count={1} onClear={vi.fn()} />)
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-live', 'polite')

    rerender(<SelectionBar count={2} onClear={vi.fn()} />)
    rerender(<SelectionBar count={3} onClear={vi.fn()} />)
    expect(status).toHaveTextContent('')

    act(() => {
      vi.advanceTimersByTime(SELECTION_ANNOUNCE_DELAY)
    })
    expect(status).toHaveTextContent('3 selected')
  })

  it('hides the support chat while it is showing', () => {
    const { rerender } = render(
      <SupportChatControlsProvider>
        <ChatState />
        <SelectionBar count={1} onClear={vi.fn()} />
      </SupportChatControlsProvider>
    )
    expect(screen.getByTestId('chat')).toHaveTextContent('hidden')

    rerender(
      <SupportChatControlsProvider>
        <ChatState />
      </SupportChatControlsProvider>
    )
    expect(screen.getByTestId('chat')).toHaveTextContent('shown')
  })

  it('lifts the toasts above itself while it is showing', () => {
    const { unmount } = render(<SelectionBar count={1} onClear={vi.fn()} />)
    expect(document.documentElement.style.getPropertyValue(TOAST_BOTTOM_OFFSET_VAR)).toMatch(/px$/)

    unmount()
    expect(document.documentElement.style.getPropertyValue(TOAST_BOTTOM_OFFSET_VAR)).toBe('')
  })
})

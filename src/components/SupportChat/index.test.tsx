import { act, fireEvent, render, screen, within } from '~src/test-utils'
import { getAuthMock, resetAuthMock, setAuthMock } from '~src/test-utils-react-providers-mock'
import SupportChat from './index'

const bearedFetchMock = vi.fn()
let profileMock: Record<string, unknown> | null = null

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => getAuthMock(),
}))

vi.mock('~src/queries/account', () => ({
  useProfile: () => ({ data: profileMock, isLoading: false }),
}))

vi.mock('@calcom/embed-react', () => ({
  default: () => <div>CalEmbed</div>,
  getCalApi: vi.fn(async () => vi.fn()),
}))

const advance = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })
}

// Presence mounts/unmounts through the zag state machine, so flush a tick after toggling
const flushPresence = async () => {
  await advance(50)
}

const openChat = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'Open support chat' }))
  await flushPresence()
}

const playGreeting = async () => {
  await advance(3_000)
}

const sendMessage = async (text: string) => {
  fireEvent.change(screen.getByPlaceholderText('Describe your request…'), { target: { value: text } })
  fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
  await advance(1_000)
}

const lastTicket = () => bearedFetchMock.mock.calls[bearedFetchMock.mock.calls.length - 1][1].body

describe('SupportChat', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    sessionStorage.clear()
    bearedFetchMock.mockReset().mockResolvedValue(undefined)
    resetAuthMock()
    profileMock = { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' }
    setAuthMock({ currentAddress: '0x123', bearedFetch: bearedFetchMock })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders nothing without an account', () => {
    setAuthMock({ currentAddress: undefined })
    render(<SupportChat />)
    expect(screen.queryByRole('button', { name: 'Open support chat' })).not.toBeInTheDocument()
  })

  it('renders the collapsed launcher without panel or teaser', () => {
    render(<SupportChat />)
    expect(screen.getByRole('button', { name: 'Open support chat' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByText('Do you need help?')).not.toBeInTheDocument()
  })

  it('shows the teaser after 30 seconds and dismisses it for the session', () => {
    render(<SupportChat />)
    act(() => {
      vi.advanceTimersByTime(29_999)
    })
    expect(screen.queryByText('Do you need help?')).not.toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(screen.getByText('Do you need help?')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(screen.queryByText('Do you need help?')).not.toBeInTheDocument()
    // Session-scoped, not permanent — so it comes back on the next visit
    expect(sessionStorage.getItem('support.chat.teaser.dismissed')).toBe('true')
    expect(localStorage.getItem('support.chat.teaser.dismissed')).toBeNull()
  })

  it('does not show the teaser again once dismissed this session', () => {
    sessionStorage.setItem('support.chat.teaser.dismissed', 'true')
    render(<SupportChat />)
    act(() => {
      vi.advanceTimersByTime(60_000)
    })
    expect(screen.queryByText('Do you need help?')).not.toBeInTheDocument()
  })

  it('cancels the teaser when the chat is opened first', async () => {
    render(<SupportChat />)
    await openChat()
    act(() => {
      vi.advanceTimersByTime(60_000)
    })
    expect(screen.queryByText('Do you need help?')).not.toBeInTheDocument()
    expect(sessionStorage.getItem('support.chat.teaser.dismissed')).toBe('true')
  })

  it('opens the panel and plays the scripted greeting', async () => {
    render(<SupportChat />)
    await openChat()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await playGreeting()
    expect(screen.getByText('Hi Jane, welcome to Vocdoni support!')).toBeInTheDocument()
    expect(screen.getByText(/If you need help with the platform/)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Describe your request…')).toHaveFocus()
  })

  it('offers a call booking and WhatsApp as part of the greeting', async () => {
    render(<SupportChat />, { appEnv: { CALCOM_EVENT_SLUG: 'team/vocdoni/30min' } })
    await openChat()
    await playGreeting()

    expect(screen.getByText(/Prefer to talk\?/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /book a call/i })).toBeInTheDocument()
    const whatsapp = screen.getByRole('link', { name: /whatsapp/i })
    expect(whatsapp).toHaveAttribute('href', expect.stringMatching(/^https:\/\/wa\.me\/\d+$/))
  })

  it('hides the call button when booking is not configured', async () => {
    render(<SupportChat />)
    await openChat()
    await playGreeting()

    expect(screen.getByText(/Prefer to talk\?/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /book a call/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /whatsapp/i })).toBeInTheDocument()
  })

  it('sends a single ticket and locks the input behind the sent state', async () => {
    render(<SupportChat />)
    await openChat()
    await playGreeting()
    await sendMessage('My census upload fails')

    expect(bearedFetchMock).toHaveBeenCalledTimes(1)
    expect(bearedFetchMock).toHaveBeenCalledWith('organizations/0x123/ticket', {
      method: 'POST',
      body: {
        title: '[Chat] My census upload fails',
        type: 'other',
        description: 'My census upload fails\n\n— Jane Doe',
      },
    })
    expect(screen.getByText(/Thanks, Jane! We've received your message/)).toBeInTheDocument()
    expect(screen.getByText(/jane@example\.com/)).toBeInTheDocument()

    // Input is replaced by the sent footer — no accidental second ticket
    expect(screen.queryByPlaceholderText('Describe your request…')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Send message' })).not.toBeInTheDocument()
    expect(screen.getByText(/Request sent — we'll reply by email/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start a new request' })).toBeInTheDocument()
  })

  it('does not send on plain Enter, only via Cmd/Ctrl+Enter or the send button', async () => {
    render(<SupportChat />)
    await openChat()
    await playGreeting()

    const input = screen.getByPlaceholderText('Describe your request…')
    fireEvent.change(input, { target: { value: 'Line one' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    await advance(1_000)
    expect(bearedFetchMock).not.toHaveBeenCalled()

    fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true })
    await advance(1_000)
    expect(bearedFetchMock).toHaveBeenCalledTimes(1)
    expect(lastTicket().title).toBe('[Chat] Line one')
  })

  it('hints how to send once the draft gains a newline, until the message is sent', async () => {
    render(<SupportChat />)
    await openChat()
    await playGreeting()

    const input = screen.getByPlaceholderText('Describe your request…')
    fireEvent.change(input, { target: { value: 'Line one' } })
    expect(screen.queryByText(/send with the send button/)).not.toBeInTheDocument()

    fireEvent.change(input, { target: { value: 'Line one\nline two' } })
    expect(screen.getByText("When you're done, send with the send button or Ctrl+Enter.")).toBeInTheDocument()

    fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true })
    await advance(1_000)
    expect(bearedFetchMock).toHaveBeenCalledTimes(1)
    expect(screen.queryByText(/send with the send button/)).not.toBeInTheDocument()
  })

  it('allows a deliberate follow-up through Start a new request', async () => {
    render(<SupportChat />)
    await openChat()
    await playGreeting()
    await sendMessage('First request')
    expect(bearedFetchMock).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Start a new request' }))
    expect(screen.getByText('What else can we help you with?')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Describe your request…')).toBeInTheDocument()

    await sendMessage('Second request')
    expect(bearedFetchMock).toHaveBeenCalledTimes(2)
    expect(lastTicket().title).toBe('[Chat] Second request')
    expect(lastTicket().description).toBe('Second request\n\n— Jane Doe')
  })

  it('falls back to a generic confirmation when the profile has no email', async () => {
    profileMock = { firstName: 'Jane', lastName: 'Doe' }
    render(<SupportChat />)
    await openChat()
    await playGreeting()
    await sendMessage('No email on file')

    expect(screen.getByText(/we'll reply by email as soon as possible/)).toBeInTheDocument()
    expect(screen.queryByText(/undefined/)).not.toBeInTheDocument()
  })

  it('truncates long multiline messages into the ticket title', async () => {
    const longLine = 'a'.repeat(100)
    render(<SupportChat />)
    await openChat()
    await playGreeting()
    await sendMessage(`${longLine}\nsecond line`)

    expect(lastTicket().title).toBe(`[Chat] ${'a'.repeat(79)}…`)
    expect(lastTicket().description).toBe(`${longLine}\nsecond line\n\n— Jane Doe`)
  })

  it('asks for a name when the profile has none and sends once it arrives', async () => {
    profileMock = { email: 'anon@example.com' }
    render(<SupportChat />)
    await openChat()
    await playGreeting()
    expect(screen.getByText('Hi there, welcome to Vocdoni support!')).toBeInTheDocument()

    await sendMessage('I need help with a vote')
    expect(bearedFetchMock).not.toHaveBeenCalled()
    expect(screen.getByText(/what's your name\?/)).toBeInTheDocument()

    await sendMessage('Ada')
    expect(bearedFetchMock).toHaveBeenCalledTimes(1)
    expect(lastTicket().title).toBe('[Chat] I need help with a vote')
    expect(lastTicket().description).toBe('I need help with a vote\n\n— Ada')
    expect(screen.getByText(/Thanks, Ada! We've received your message/)).toBeInTheDocument()
  })

  it('ignores extra sends while the name prompt is pending', async () => {
    profileMock = { email: 'anon@example.com' }
    render(<SupportChat />)
    await openChat()
    await playGreeting()

    const input = screen.getByPlaceholderText('Describe your request…')
    fireEvent.change(input, { target: { value: 'First attempt' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    // Try to send again before the name prompt appears
    fireEvent.change(input, { target: { value: 'Second attempt' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true })
    await advance(1_000)

    expect(screen.getAllByText(/what's your name\?/)).toHaveLength(1)
    // The blocked draft stays in the textarea but never becomes a message bubble
    const conversation = screen.getByLabelText('Support conversation')
    expect(within(conversation).queryByText('Second attempt')).not.toBeInTheDocument()

    await sendMessage('Ada')
    expect(lastTicket().description).toBe('First attempt\n\n— Ada')
  })

  it('skips the name prompt when the profile loads a name during the wait', async () => {
    profileMock = null
    const { rerender } = render(<SupportChat />)
    await openChat()
    await playGreeting()

    fireEvent.change(screen.getByPlaceholderText('Describe your request…'), { target: { value: 'Late profile' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    profileMock = { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com' }
    rerender(<SupportChat />)
    await advance(2_000)

    expect(screen.queryByText(/what's your name\?/)).not.toBeInTheDocument()
    expect(bearedFetchMock).toHaveBeenCalledTimes(1)
    expect(lastTicket().description).toBe('Late profile\n\n— Jane Doe')
    expect(screen.getByText(/Thanks, Jane! We've received your message/)).toBeInTheDocument()
  })

  it('shows an in-conversation error and retries the same ticket successfully', async () => {
    bearedFetchMock.mockRejectedValueOnce(new Error('boom'))
    render(<SupportChat />)
    await openChat()
    await playGreeting()
    await sendMessage('Something broke')

    expect(bearedFetchMock).toHaveBeenCalledTimes(1)
    expect(screen.getByText(/we couldn't send your message/)).toBeInTheDocument()
    // The failed send did not lock the conversation
    expect(screen.getByPlaceholderText('Describe your request…')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    await advance(1_000)

    expect(bearedFetchMock).toHaveBeenCalledTimes(2)
    expect(lastTicket().title).toBe('[Chat] Something broke')
    expect(lastTicket().description).toBe('Something broke\n\n— Jane Doe')
    expect(screen.getByText(/Thanks, Jane! We've received your message/)).toBeInTheDocument()
  })

  it('closes with Escape and returns focus to the launcher', async () => {
    render(<SupportChat />)
    await openChat()
    await playGreeting()

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    await flushPresence()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open support chat' })).toHaveFocus()
  })
})

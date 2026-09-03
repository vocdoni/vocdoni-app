import { act, renderHook } from '@testing-library/react'
import { useSupportChat } from './useSupportChat'

const sendTicketMock = vi.fn()

vi.mock('~src/queries/support', () => ({
  useSendSupportTicket: () => ({ mutateAsync: sendTicketMock }),
}))

vi.mock('~src/queries/account', () => ({
  useProfile: () => ({ data: { firstName: 'Jane' }, isLoading: false }),
}))

describe('useSupportChat message ids', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    sessionStorage.clear()
    sendTicketMock.mockReset().mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('gives every scripted greeting message a unique id', async () => {
    const { result } = renderHook(() => useSupportChat())

    act(() => {
      result.current.openChat()
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000)
    })

    const ids = result.current.messages.map((m) => m.id)
    expect(ids).toHaveLength(3)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps ids unique across a full send, including the pushes that share a batch', async () => {
    const { result } = renderHook(() => useSupportChat())

    act(() => {
      result.current.openChat()
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000)
    })
    act(() => {
      result.current.send('My census upload is stuck')
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000)
    })
    act(() => {
      result.current.startNewRequest()
    })

    const ids = result.current.messages.map((m) => m.id)
    expect(ids.length).toBeGreaterThan(3)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

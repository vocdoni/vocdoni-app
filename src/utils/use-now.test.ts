import { act, renderHook } from '@testing-library/react'
import { useNow } from './use-now'

describe('useNow', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T10:00:00Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('advances after the interval', () => {
    const { result } = renderHook(() => useNow(30_000))
    const first = result.current.getTime()

    act(() => {
      vi.advanceTimersByTime(30_000)
    })

    expect(result.current.getTime()).toBe(first + 30_000)
  })

  it('stays put before the interval elapses', () => {
    const { result } = renderHook(() => useNow(30_000))
    const first = result.current

    act(() => {
      vi.advanceTimersByTime(29_000)
    })

    expect(result.current).toBe(first)
  })

  it('clears its interval on unmount', () => {
    const { unmount } = renderHook(() => useNow(30_000))
    expect(vi.getTimerCount()).toBe(1)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})

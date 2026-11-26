import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { electionQueryKeys } from '@vocdoni/react-components'
import type { ReactNode } from 'react'
import { useVoterLive } from './use-voter-live'

const ID = 'p1'
const NOW = new Date('2026-11-25T10:00:00.000Z').getTime()
const dates = (endAt: number) => ({
  startDate: '2026-11-25T09:00:00.000Z',
  endDate: new Date(endAt).toISOString(),
})

describe('useVoterLive', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: NOW })
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  const setup = (endAt: number) => {
    const client = new QueryClient()
    client.setQueryData(electionQueryKeys.election(ID), dates(endAt))
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )
    const hook = renderHook(() => useVoterLive(ID, dates(endAt)), { wrapper })
    return { ...hook, client }
  }

  it('passes the end once the clock reaches the end the process holds', () => {
    const { result } = setup(NOW + 60_000)
    expect(result.current.endPassed).toBe(false)
    act(() => vi.advanceTimersByTime(60_000))
    expect(result.current.endPassed).toBe(true)
  })

  it('waits for an end the organiser moved later, and passes the new end at its own instant', () => {
    const { result, client } = setup(NOW + 60_000)
    act(() => vi.advanceTimersByTime(30_000))
    act(() => {
      client.setQueryData(electionQueryKeys.election(ID), dates(NOW + 180_000))
    })
    act(() => vi.advanceTimersByTime(60_000))
    expect(result.current.endPassed).toBe(false)
    act(() => vi.advanceTimersByTime(120_000))
    expect(result.current.endPassed).toBe(true)
  })

  it('keeps passing an end the timer fired at when the read is refetched with the same end', () => {
    const { result, client } = setup(NOW + 60_000)
    act(() => vi.advanceTimersByTime(60_000))
    act(() => {
      client.setQueryData(electionQueryKeys.election(ID), dates(NOW + 60_000))
    })
    expect(result.current.endPassed).toBe(true)
  })
})

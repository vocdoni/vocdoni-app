import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { electionQueryKeys } from '@vocdoni/react-components'
import type { ReactNode } from 'react'
import { VoterServerNow } from './VoterFlowProvider'
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
    vi.restoreAllMocks()
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

  // A device two hours behind the server reads the live room as not started, which would poll it every 30 s: the poll
  // reads the server's timeline instead (gate F4).
  it('polls a live question-by-question vote every 10 s by the server clock, not a device clock far off it', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    vi.setSystemTime(NOW - 2 * 60 * 60_000)
    const client = new QueryClient()
    const process = {
      id: ID,
      published: true,
      initialStatus: 'PAUSED',
      startDate: new Date(NOW - 60 * 60_000).toISOString(),
      endDate: new Date(NOW + 3 * 60 * 60_000).toISOString(),
      questions: [{ id: 'q1', status: 'ONGOING', results: { voteCount: 0, maxVoters: 1 } }],
    }
    client.setQueryData(electionQueryKeys.election(ID), process)
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>
        <VoterServerNow.Provider value={NOW}>{children}</VoterServerNow.Provider>
      </QueryClientProvider>
    )
    const { result } = renderHook(() => useVoterLive(ID, process), { wrapper })
    expect(result.current.queryOptions.refetchInterval({ state: { data: process } })).toBe(10_000)
  })

  // The same device clock, two hours behind: the end the server holds in half a minute passes on the server's timeline,
  // not two and a half hours later on the device's.
  it('passes an end on the server clock when the device clock is far off it', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    vi.setSystemTime(NOW - 2 * 60 * 60_000)
    const client = new QueryClient()
    const process = dates(NOW + 30_000)
    client.setQueryData(electionQueryKeys.election(ID), process)
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>
        <VoterServerNow.Provider value={NOW}>{children}</VoterServerNow.Provider>
      </QueryClientProvider>
    )
    const { result } = renderHook(() => useVoterLive(ID, process), { wrapper })
    act(() => vi.advanceTimersByTime(31_000))
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

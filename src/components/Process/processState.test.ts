import { filterOfState, getProcessState, isEndingSoon } from './processState'

const HOUR = 60 * 60 * 1000
const now = new Date('2026-09-28T12:00:00Z').getTime()

describe('isEndingSoon', () => {
  it('flags a vote closing within 48 hours', () => {
    expect(isEndingSoon(new Date(now + 20 * HOUR), now)).toBe(true)
    expect(isEndingSoon(new Date(now + 48 * HOUR), now)).toBe(true)
  })

  it('leaves votes with more time alone', () => {
    expect(isEndingSoon(new Date(now + 49 * HOUR), now)).toBe(false)
  })

  it('ignores votes that already closed or have no end date', () => {
    expect(isEndingSoon(new Date(now - HOUR), now)).toBe(false)
    expect(isEndingSoon(undefined, now)).toBe(false)
  })
})

describe('getProcessState', () => {
  const question = (status: string) => ({ status }) as never
  const future = new Date(Date.now() + 86_400_000).toISOString()
  const past = new Date(Date.now() - 86_400_000).toISOString()

  it.each([
    ['ONGOING', past, 'live'],
    ['ONGOING', future, 'scheduled'],
    ['UPCOMING', future, 'scheduled'],
    ['PAUSED', past, 'paused'],
    ['ENDED', past, 'ended'],
    ['RESULTS', past, 'ended'],
    ['CANCELED', past, 'canceled'],
  ])('maps %s (start %s) to %s', (status, startDate, state) => {
    expect(getProcessState({ questions: [question(status)], startDate })).toBe(state)
  })

  it('treats a vote with any question still open as live', () => {
    expect(getProcessState({ questions: [question('ENDED'), question('ONGOING')], startDate: past })).toBe('live')
  })

  it('files the live and paused states under Live, and canceled under Closed', () => {
    expect(filterOfState('live')).toBe('live')
    expect(filterOfState('paused')).toBe('live')
    expect(filterOfState('scheduled')).toBe('scheduled')
    expect(filterOfState('canceled')).toBe('closed')
  })
})

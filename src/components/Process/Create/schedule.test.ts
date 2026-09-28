import {
  endDateBounds,
  getScheduleIssues,
  parseMaxDays,
  scheduleEnd,
  scheduleStart,
  type ScheduleValues,
} from './schedule'

// Monday 28 September 2026, 10:00 local time
const now = new Date(2026, 8, 28, 10, 0)

const values = (overrides: Partial<ScheduleValues> = {}): ScheduleValues => ({
  autoStart: true,
  startDate: '',
  startTime: '',
  endDate: '2026-10-05',
  endTime: '20:00',
  ...overrides,
})

describe('parseMaxDays', () => {
  it.each([
    [30, 30],
    ['7', 7],
    ['0', undefined],
    [0, undefined],
    [undefined, undefined],
    ['unlimited', undefined],
  ])('reads %s as %s', (input, expected) => {
    expect(parseMaxDays(input)).toBe(expected)
  })
})

describe('scheduleStart and scheduleEnd', () => {
  it('opens now when the vote starts right away', () => {
    expect(scheduleStart(values(), now)).toBe(now)
  })

  it('opens at the chosen date and time otherwise', () => {
    expect(scheduleStart(values({ autoStart: false, startDate: '2026-10-01', startTime: '09:30' }), now)).toEqual(
      new Date(2026, 9, 1, 9, 30)
    )
  })

  it('has no start or end until both date and time are set', () => {
    expect(scheduleStart(values({ autoStart: false, startDate: '2026-10-01' }), now)).toBeUndefined()
    expect(scheduleEnd(values({ endTime: '' }))).toBeUndefined()
  })
})

describe('endDateBounds', () => {
  it('starts today and stops at the plan limit for a vote opening now', () => {
    expect(endDateBounds(values(), now, 30)).toEqual({ min: '2026-09-28', max: '2026-10-28' })
  })

  it('follows a scheduled start, even before its time is chosen', () => {
    expect(endDateBounds(values({ autoStart: false, startDate: '2026-10-10' }), now, 7)).toEqual({
      min: '2026-10-10',
      max: '2026-10-17',
    })
  })

  it('has no upper bound without a plan limit', () => {
    expect(endDateBounds(values(), now).max).toBeUndefined()
  })
})

describe('getScheduleIssues', () => {
  it('accepts a vote opening now and closing next week', () => {
    expect(getScheduleIssues(values(), now, 30)).toEqual([])
  })

  it('asks for the closing date and time, which have no default', () => {
    expect(getScheduleIssues(values({ endDate: '', endTime: '' }), now)).toEqual(['end_missing'])
  })

  it('asks for the opening date and time of a scheduled vote', () => {
    expect(getScheduleIssues(values({ autoStart: false }), now)).toEqual(['start_missing'])
  })

  it('flags an opening time that has already passed', () => {
    expect(getScheduleIssues(values({ autoStart: false, startDate: '2026-09-28', startTime: '09:00' }), now)).toEqual([
      'start_in_past',
    ])
  })

  it('flags a closing time in the past', () => {
    expect(getScheduleIssues(values({ endDate: '2026-09-28', endTime: '09:59' }), now)).toEqual(['end_in_past'])
  })

  it('flags a vote that closes before it opens', () => {
    expect(
      getScheduleIssues(
        values({ autoStart: false, startDate: '2026-10-10', startTime: '09:00', endDate: '2026-10-09' }),
        now
      )
    ).toEqual(['end_before_start'])
  })

  it('flags a vote longer than the plan allows, to the minute', () => {
    expect(getScheduleIssues(values({ endDate: '2026-10-05', endTime: '10:00' }), now, 7)).toEqual([])
    expect(getScheduleIssues(values({ endDate: '2026-10-05', endTime: '10:01' }), now, 7)).toEqual(['too_long'])
  })
})

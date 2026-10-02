import type { VotingProcessResponse } from '@vocdoni/api-types'
import {
  activitySearch,
  categoryOf,
  deriveImportEvents,
  deriveVoteEvents,
  formatChange,
  groupByDay,
  hasDatedJobs,
  sortEvents,
  type ActivityEvent,
  type DatedJob,
} from './activity'

const NOW = new Date('2026-10-02T12:00:00Z').getTime()

const vote = (id: string, extra: Record<string, unknown> = {}) =>
  ({
    id,
    published: true,
    title: { default: `Vote ${id}` },
    startDate: '2026-09-01T09:00:00Z',
    endDate: '2026-09-03T18:00:00Z',
    questions: [],
    census: {},
    orgAddress: 'abc',
    ...extra,
  }) as unknown as VotingProcessResponse

const job = (jobId: string, extra: Partial<DatedJob> = {}): DatedJob => ({
  jobId,
  type: 'org_members',
  status: 'completed',
  result: { added: 8, total: 10 },
  errors: ['row 3: ana@example.org is invalid', 'row 7: +34600000000 is invalid'],
  ...extra,
})

describe('deriveVoteEvents', () => {
  it('dates a past vote by its start and planned end', () => {
    const events = deriveVoteEvents([vote('p1')], { language: 'en', now: NOW })

    expect(events.map((event) => [event.type, event.at])).toEqual([
      ['process.started', '2026-09-01T09:00:00.000Z'],
      ['process.ended', '2026-09-03T18:00:00.000Z'],
    ])
    expect(events[0]).toMatchObject({
      source: 'derived',
      actor: null,
      live: false,
      subject: { type: 'process', id: 'p1', label: 'Vote p1' },
    })
  })

  it('uses the early end when the vote was ended before its date', () => {
    const events = deriveVoteEvents(
      [vote('p1', { endDate: '2026-12-01T00:00:00Z', endedAt: '2026-09-02T10:00:00Z' })],
      { language: 'en', now: NOW }
    )

    expect(events.find((event) => event.type === 'process.ended')?.at).toBe('2026-09-02T10:00:00.000Z')
  })

  it('shows a live vote as started only, and a scheduled one not at all', () => {
    const events = deriveVoteEvents(
      [
        vote('live', { endDate: '2026-12-01T00:00:00Z' }),
        vote('later', { startDate: '2026-11-01T00:00:00Z', endDate: '2026-11-02T00:00:00Z' }),
      ],
      { language: 'en', now: NOW }
    )

    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({ type: 'process.started', live: true, subject: { id: 'live' } })
  })

  it('skips drafts and flags test votes', () => {
    const events = deriveVoteEvents([vote('d', { published: false }), vote('t')], {
      language: 'en',
      now: NOW,
      testProcessIds: ['t'],
    })

    expect(events.every((event) => event.subject.id === 't' && event.test)).toBe(true)
  })

  it('ignores missing or broken dates', () => {
    expect(deriveVoteEvents([vote('p', { startDate: '', endDate: 'nope' })], { language: 'en', now: NOW })).toEqual([])
  })
})

describe('deriveImportEvents', () => {
  it('leaves an import undated while jobs carry no date', () => {
    const [event] = deriveImportEvents([job('j1')])

    expect(event).toMatchObject({
      type: 'import.completed',
      at: null,
      jobId: 'j1',
      import: { added: 8, total: 10, problems: 2, status: 'completed' },
    })
  })

  it('dates an import by when it finished, else when it started', () => {
    const events = deriveImportEvents([
      job('a', { createdAt: '2026-09-10T08:00:00Z', completedAt: '2026-09-10T08:01:00Z' }),
      job('b', { createdAt: '2026-09-11T08:00:00Z', status: 'pending' }),
    ])

    expect(events.map((event) => [event.type, event.at])).toEqual([
      ['import.completed', '2026-09-10T08:01:00.000Z'],
      ['import.started', '2026-09-11T08:00:00.000Z'],
    ])
  })

  it('counts row problems without copying them', () => {
    const [event] = deriveImportEvents([job('j1', { status: 'failed' })])

    expect(event.type).toBe('import.failed')
    expect(JSON.stringify(event)).not.toMatch(/example\.org|34600/)
  })

  it('keeps only member imports', () => {
    expect(deriveImportEvents([job('c', { type: 'census_participants' })])).toEqual([])
  })

  it('detects dated jobs one by one', () => {
    expect(hasDatedJobs([job('a')])).toBe(false)
    expect(hasDatedJobs([job('a'), job('b', { createdAt: '2026-09-10T08:00:00Z' })])).toBe(true)
  })
})

describe('sorting and grouping', () => {
  const event = (id: string, at: string | null): ActivityEvent => ({
    id,
    at,
    type: 'process.started',
    actor: null,
    source: 'derived',
    subject: { type: 'process', id, label: id },
  })

  it('puts the newest first and undated last', () => {
    const sorted = sortEvents([
      event('u', null),
      event('old', '2026-09-01T10:00:00Z'),
      event('new', '2026-09-05T10:00:00Z'),
    ])

    expect(sorted.map((item) => item.id)).toEqual(['new', 'old', 'u'])
  })

  it('groups dated events by day, newest day first', () => {
    const days = groupByDay([
      event('a', '2026-09-01T10:00:00'),
      event('b', '2026-09-01T15:00:00'),
      event('c', '2026-09-04T09:00:00'),
      event('u', null),
    ])

    expect(days.map((day) => [day.day, day.events.map((item) => item.id)])).toEqual([
      ['2026-09-04', ['c']],
      ['2026-09-01', ['b', 'a']],
    ])
  })
})

describe('formatChange', () => {
  it('masks emails', () => {
    expect(formatChange('email', 'laura@domain.org', 'lina@d.org')).toEqual({
      field: 'email',
      kind: 'values',
      before: 'l***a@d***.org',
      after: 'l***a@d***.org',
    })
  })

  it('keeps an already masked email as it is', () => {
    expect(formatChange('email', null, 'l***a@d***.org')).toMatchObject({ before: null, after: 'l***a@d***.org' })
  })

  it("shows a phone's last 2 digits, or only that it changed", () => {
    expect(formatChange('phone', '+34 600 11 22 33', '+34 600 99 88 77')).toMatchObject({
      before: '***33',
      after: '***77',
    })
    expect(formatChange('phone', '1', '+34600998877')).toEqual({ field: 'phone', kind: 'changed' })
  })

  it("shows a national ID's last 3", () => {
    expect(formatChange('nationalId', '12345678Z', null)).toMatchObject({ before: '***78Z', after: null })
  })

  it('only says birth dates, passwords, extra info and names changed', () => {
    for (const field of ['birthDate', 'password', 'other', 'name', 'surname', 'memberNumber'])
      expect(formatChange(field, 'secret before', 'secret after')).toEqual({ field, kind: 'changed' })
  })

  it('honours the redacted flag', () => {
    expect(formatChange('email', 'a@b.org', 'c@d.org', true)).toEqual({ field: 'email', kind: 'changed' })
  })

  it('shows voting power as it is', () => {
    expect(formatChange('weight', '1', '3')).toEqual({ field: 'weight', kind: 'values', before: '1', after: '3' })
  })
})

describe('query helpers', () => {
  it('maps the census category to census and group events', () => {
    expect(categoryOf('group.created')).toBe('census')
    expect(categoryOf('activity.exported')).toBe('other')
    expect(activitySearch({ category: 'census', page: 2, limit: 50 })).toBe('page=2&limit=50&type=census%2Cgroup')
    expect(activitySearch({ subjectType: 'member', subjectId: 'm1' })).toBe('subjectType=member&subjectId=m1')
  })
})

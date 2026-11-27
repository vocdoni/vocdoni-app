import type { QuestionState } from '~utils/vote-state'
import { ROOM_SCREENS, roomNextIndex, roomProgress, roomRail, roomRowOf, type RoomRailEntry } from './room'
import type { RoomCast, RoomFacts, RoomQuestion } from './voter-flow'

const q = (state: QuestionState, cast: RoomCast = 'none', id = 'q', showsResult = false): RoomQuestion => ({
  id,
  state,
  cast,
  endedAt: null,
  ...(showsResult ? { showsResult } : {}),
})
const room = (questions: RoomQuestion[]): RoomFacts => ({
  voteState: 'live',
  questions: questions.map((question, index) => ({ ...question, id: `q${index + 1}` })),
})
const FOUR = room([q('closed', 'recorded'), q('closed', 'recorded'), q('open'), q('toOpen')])
// The check leaves this voter out of the question: the SDK skips it, so it has no row and no place in the strip.
const leftOut = (facts: RoomFacts, id: string): RoomFacts => ({
  ...facts,
  questions: facts.questions.map((question) => (question.id === id ? { ...question, eligible: false } : question)),
})

describe('roomRowOf: each question in the rail (board V4VoterWideLive)', () => {
  it.each<[RoomQuestion, boolean, ReturnType<typeof roomRowOf>]>([
    [q('toOpen'), false, { state: 'pending', note: 'waiting' }],
    [q('open'), false, { state: 'now', note: 'open' }],
    [q('open'), true, { state: 'now', note: 'openSkipped' }],
    [q('open', 'recorded'), false, { state: 'done', note: 'openVoted' }],
    [q('closed', 'recorded'), false, { state: 'done', note: 'closed' }],
    [q('closed', 'authorised'), false, { state: 'done', note: 'closed' }],
    [q('closed', 'recorded', 'q', true), false, { state: 'done', note: 'closedVoted' }],
    // A vote the chain does not hold is never drawn as voted, nor as not voted (gate-3 F2, F3).
    [q('open', 'lost'), false, { state: 'now', note: 'openLost' }],
    [q('closed', 'lost'), false, { state: 'skipped', note: 'closedLost' }],
    [q('closed', 'lost', 'q', true), false, { state: 'skipped', note: 'closedLost' }],
    [q('closed', 'unknown'), false, { state: 'skipped', note: 'closedUnknown' }],
    [q('open', 'unknown'), false, { state: 'now', note: 'open' }],
    [q('closed', 'none', 'q', true), false, { state: 'skipped', note: 'closedMissed' }],
    [q('closed'), false, { state: 'skipped', note: 'closedMissed' }],
    [q('closed'), true, { state: 'skipped', note: 'closedMissed' }],
    [q('paused'), false, { state: 'now', note: 'paused' }],
    [q('canceled'), false, { state: 'pending', note: 'canceled' }],
    // A question the vote ended before it ever opened: reads as closed, not as "not yet open" (fix #1831).
    [q('notOpened'), false, { state: 'pending', note: 'closed' }],
  ])('%o skipped=%s', (question, skipped, row) => {
    expect(roomRowOf(question, skipped)).toEqual(row)
  })
})

describe('roomRail: folds a long agenda (board 1b, 20 questions)', () => {
  const twenty = room(
    Array.from({ length: 20 }, (_x, index) =>
      index < 12 ? q('closed', 'recorded') : index === 12 ? q('open') : q('toOpen')
    )
  )
  const kinds = (entries: RoomRailEntry[]) =>
    entries.map((entry) => (entry.kind === 'row' ? entry.index + 1 : `${entry.kind}:${entry.from}-${entry.to}`))

  it('keeps a short agenda whole', () => {
    expect(kinds(roomRail(FOUR, [], { closed: false, more: false }))).toEqual([1, 2, 3, 4])
  })

  it('folds the closed ones, shows the open one and the three next, folds the rest', () => {
    const entries = roomRail(twenty, [], { closed: false, more: false })
    expect(kinds(entries)).toEqual(['closed:1-12', 13, 14, 15, 16, 'more:17-20'])
    expect(entries.at(-1)).toEqual({ kind: 'more', from: 17, to: 20, count: 4 })
  })

  it('unfolds each group on its own', () => {
    expect(kinds(roomRail(twenty, [], { closed: true, more: false }))).toHaveLength(17)
    expect(kinds(roomRail(twenty, [], { closed: false, more: true }))).toEqual([
      'closed:1-12',
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
    ])
  })

  it('drops the rows of questions the voter may not vote, and keeps the agenda numbers of the others', () => {
    expect(kinds(roomRail(leftOut(FOUR, 'q2'), [], { closed: false, more: false }))).toEqual([1, 3, 4])
  })

  it('counts only the rows shown toward the fold, so a hidden question does not start one', () => {
    const nine = room([
      ...Array.from({ length: 4 }, () => q('closed', 'recorded')),
      ...Array.from({ length: 5 }, () => q('toOpen')),
    ])
    expect(kinds(roomRail(leftOut(nine, 'q9'), [], { closed: false, more: false }))).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('never anchors on a hidden open question: the next shown question is the anchor', () => {
    expect(kinds(roomRail(leftOut(twenty, 'q13'), [], { closed: false, more: false }))).toEqual([
      'closed:1-12',
      14,
      15,
      16,
      17,
      'more:18-20',
    ])
  })

  it('anchors on the next question to open when none is open, and never folds a single row', () => {
    const nine = room([
      ...Array.from({ length: 4 }, () => q('closed', 'recorded')),
      ...Array.from({ length: 5 }, () => q('toOpen')),
    ])
    expect(kinds(roomRail(nine, [], { closed: false, more: false }))).toEqual(['closed:1-4', 5, 6, 7, 8, 9])
  })
})

describe('roomProgress: the strip label and line (R6, R7)', () => {
  it('reads the frame on screen', () => {
    expect(roomProgress(FOUR, { kind: 'roomQuestion', index: 2, paused: false })).toEqual({
      kind: 'open',
      current: 3,
      closed: 2,
      total: 4,
      value: 3,
    })
    expect(roomProgress(FOUR, { kind: 'roomQuestion', index: 2, paused: true })?.kind).toBe('paused')
    // An open set on one screen: its place is the set's last question.
    const pair = room([q('closed', 'recorded'), q('open'), q('open')])
    expect(roomProgress(pair, { kind: 'roomSet', set: [1, 2], paused: false })).toEqual({
      kind: 'open',
      current: 3,
      closed: 1,
      total: 3,
      value: 3,
    })
    expect(roomProgress(pair, { kind: 'roomSet', set: [1, 2], paused: true })?.kind).toBe('paused')
    expect(roomProgress(FOUR, { kind: 'roomOpen', index: 2 })?.kind).toBe('open')
    expect(roomProgress(FOUR, { kind: 'roomVoted', index: 2, record: 'recorded' })?.kind).toBe('voted')
    // A lost vote never reads "ja has votat" (gate-3 F2).
    expect(roomProgress(FOUR, { kind: 'roomVoted', index: 2, record: 'lost' })?.kind).toBe('lost')
    // The strip counts the questions this voter may vote: question 3 is the second of three.
    expect(roomProgress(leftOut(FOUR, 'q2'), { kind: 'roomQuestion', index: 2, paused: false })).toEqual({
      kind: 'open',
      current: 2,
      closed: 1,
      total: 3,
      value: 2,
    })
    expect(roomProgress(FOUR, { kind: 'roomSkipped', index: 2 })?.kind).toBe('skipped')
    expect(roomProgress(FOUR, { kind: 'roomClosedVoted', index: 1 })).toEqual(roomProgress(FOUR, { kind: 'roomNone' }))
    expect(roomProgress(FOUR, { kind: 'roomNone' })).toEqual({
      kind: 'none',
      current: 0,
      closed: 2,
      total: 4,
      value: 2,
    })
    expect(roomProgress(FOUR, { kind: 'roomNotStarted' })).toMatchObject({ kind: 'notStarted', value: 0 })
    expect(roomProgress(FOUR, { kind: 'welcome' })).toBeNull()
  })
})

describe('room helpers', () => {
  it('finds the next question to open', () => {
    expect(roomNextIndex(FOUR)).toBe(3)
    expect(roomNextIndex(room([q('closed', 'recorded')]))).toBe(-1)
  })

  it('lists the room screens', () => {
    expect([...ROOM_SCREENS].sort()).toEqual(
      [
        'roomClosedVoted',
        'roomMissed',
        'roomNone',
        'roomNotStarted',
        'roomOpen',
        'roomQuestion',
        'roomSet',
        'roomSkipped',
        'roomVoted',
      ].sort()
    )
  })
})

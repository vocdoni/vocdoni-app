import type { QuestionStatus, VotingProcessQuestion, VotingProcessResponse } from '@vocdoni/api-types'
import {
  compareVoteRows,
  countByFilter,
  countQuestionStates,
  deriveQuestionState,
  deriveVoteState,
  draftWarning,
  matchesSearch,
  nonTerminalQuestionIds,
  normalizeSearch,
  percentOf,
  questionElectorate,
  timeLeft,
  toVoteRows,
  type VoteState,
} from './vote-state'

const NOW = new Date('2026-06-15T12:00:00Z')

const question = (
  status: QuestionStatus,
  index = 0,
  extra: Partial<VotingProcessQuestion> = {}
): VotingProcessQuestion =>
  ({
    id: `q${index}`,
    parentProcessId: 'p1',
    title: { default: `Question ${index + 1}` },
    choices: [],
    ballotProtocol: {} as VotingProcessQuestion['ballotProtocol'],
    type: 'singlechoice',
    secretUntilTheEnd: false,
    status,
    ...extra,
  }) as VotingProcessQuestion

const vote = (statuses: QuestionStatus[], extra: Record<string, unknown> = {}): VotingProcessResponse =>
  ({
    id: 'p1',
    orgAddress: 'org',
    title: { default: 'Annual assembly' },
    census: { size: 312 },
    published: true,
    startDate: '2026-06-01T08:00:00Z',
    endDate: '2026-07-01T20:00:00Z',
    questions: statuses.map((status, index) => question(status, index)),
    ...extra,
  }) as VotingProcessResponse

const byQuestion = { initialStatus: 'PAUSED' }

describe('deriveVoteState', () => {
  it.each<[string, VotingProcessResponse, VoteState]>([
    ['an unpublished process is a draft', vote(['UPCOMING'], { published: false }), 'draft'],
    [
      'a draft stays a draft even past its end date',
      vote([], { published: false, endDate: '2026-01-01T00:00:00Z' }),
      'draft',
    ],
    ['every question canceled is canceled', vote(['CANCELED', 'CANCELED']), 'canceled'],
    ['canceled mixed with ended is closed', vote(['CANCELED', 'ENDED']), 'closed'],
    ['every question terminal is closed', vote(['ENDED', 'RESULTS']), 'closed'],
    [
      'past its end it is closed whatever the stored status',
      vote(['ONGOING'], { endDate: '2026-06-10T00:00:00Z' }),
      'closed',
    ],
    ['ended early (endedAt) is closed', vote(['ENDED'], { endedAt: '2026-06-12T00:00:00Z' }), 'closed'],
    ['all at once, before its start, is ready', vote(['ONGOING'], { startDate: '2026-06-20T00:00:00Z' }), 'ready'],
    ['all at once, open, is live', vote(['ONGOING', 'ONGOING']), 'live'],
    ['all at once, every open question paused, is paused', vote(['PAUSED', 'PAUSED']), 'paused'],
    ['question by question with every question paused is ready', vote(['PAUSED', 'PAUSED'], byQuestion), 'ready'],
    [
      'question by question stays ready before its start',
      vote(['PAUSED'], { ...byQuestion, startDate: '2026-06-20T00:00:00Z' }),
      'ready',
    ],
    ['question by question with an open question is live', vote(['RESULTS', 'ONGOING', 'PAUSED'], byQuestion), 'live'],
    ['question by question with one closed and none open is live', vote(['ENDED', 'PAUSED'], byQuestion), 'live'],
    ['question by question with every question closed is closed', vote(['ENDED', 'CANCELED'], byQuestion), 'closed'],
  ])('%s', (_name, process, expected) => {
    expect(deriveVoteState(process, NOW)).toBe(expected)
  })
})

describe('deriveQuestionState', () => {
  const process = vote(['PAUSED'], byQuestion)
  it.each<[string, VotingProcessQuestion, string]>([
    ['canceled', question('CANCELED', 0, { endedAt: '2026-06-10T00:00:00Z' }), 'canceled'],
    ['ended', question('ENDED'), 'closed'],
    ['results', question('RESULTS'), 'closed'],
    ['endedAt wins over a stale status', question('ONGOING', 0, { endedAt: '2026-06-10T00:00:00Z' }), 'closed'],
    ['ongoing', question('ONGOING'), 'open'],
    ['paused with votes', question('PAUSED', 0, { results: { voteCount: 3 } }), 'paused'],
    ['paused with no votes', question('PAUSED', 0, { results: { voteCount: 0 } }), 'toOpen'],
    ['paused with no results read', question('PAUSED'), 'toOpen'],
  ])('%s', (_name, q, expected) => {
    expect(deriveQuestionState(q, process, NOW)).toBe(expected)
  })

  it('shows an open or voted question as closed once the vote has ended, and one never opened as not opened', () => {
    const ended = vote(['ONGOING'], { ...byQuestion, endDate: '2026-06-14T00:00:00Z' })
    expect(deriveQuestionState(question('ONGOING'), ended, NOW)).toBe('closed')
    expect(deriveQuestionState(question('PAUSED', 0, { results: { voteCount: 2 } }), ended, NOW)).toBe('closed')
    expect(deriveQuestionState(question('PAUSED'), ended, NOW)).toBe('notOpened')
  })

  it('reads the unvoted questions the end of the vote closed together as not opened', () => {
    const at = (time: string, votes: number) => ({ endedAt: time, results: { voteCount: votes } })
    const ended = {
      ...vote([], byQuestion),
      questions: [
        question('ENDED', 0, at('2026-06-14T10:00:00Z', 0)),
        question('ENDED', 1, at('2026-06-14T11:00:00Z', 12)),
        question('ENDED', 2, at('2026-06-14T11:00:01Z', 0)),
      ],
    } as VotingProcessResponse
    expect(ended.questions.map((q) => deriveQuestionState(q, ended, NOW))).toEqual(['closed', 'closed', 'notOpened'])
  })

  it('keeps an all-at-once question closed after the end', () => {
    const ended = vote(['PAUSED'], { endDate: '2026-06-14T00:00:00Z' })
    expect(deriveQuestionState(question('PAUSED'), ended, NOW)).toBe('closed')
  })
})

describe('question counts', () => {
  it('counts each state', () => {
    expect(countQuestionStates(['closed', 'closed', 'open', 'toOpen', 'notOpened'])).toEqual({
      toOpen: 1,
      open: 1,
      paused: 0,
      closed: 2,
      canceled: 0,
      notOpened: 1,
    })
  })
})

describe('participation', () => {
  it('rounds to an integer percent and has none without a census size', () => {
    expect(percentOf(184, 312)).toBe(59)
    expect(percentOf(5, 0)).toBeUndefined()
    expect(percentOf(5, undefined)).toBeUndefined()
  })

  it('divides a restricted question by its own electorate', () => {
    const process = vote(['ONGOING'])
    expect(questionElectorate(question('ONGOING', 0, { eligibleMemberIds: ['a', 'b'] }), process)).toBe(2)
    expect(questionElectorate(question('ONGOING'), process)).toBe(312)
  })
})

describe('nonTerminalQuestionIds', () => {
  it('never targets an ended, tallied or canceled question', () => {
    expect(nonTerminalQuestionIds(vote(['RESULTS', 'ONGOING', 'PAUSED', 'CANCELED', 'ENDED']))).toEqual(['q1', 'q2'])
    expect(nonTerminalQuestionIds(null)).toEqual([])
  })
})

describe('list rows', () => {
  const fixtures: VotingProcessResponse[] = [
    vote(['UPCOMING'], { id: 'draft', published: false }),
    vote(['ONGOING'], { id: 'scheduled', startDate: '2026-06-20T00:00:00Z' }),
    vote(['ONGOING'], { id: 'live' }),
    vote(['PAUSED'], { id: 'paused' }),
    vote(['PAUSED', 'PAUSED'], { id: 'qbq-ready', ...byQuestion }),
    vote(['ENDED', 'PAUSED'], { id: 'qbq-mid', ...byQuestion }),
    vote(['ENDED'], { id: 'ended', endDate: '2026-06-10T00:00:00Z' }),
    vote(['RESULTS'], { id: 'results', endDate: '2026-06-12T00:00:00Z' }),
    vote(['CANCELED'], { id: 'canceled', endDate: '2026-06-11T00:00:00Z' }),
  ]

  it('counts each chip so the four add up to all (audit F2)', () => {
    expect(countByFilter(toVoteRows(fixtures, NOW))).toEqual({ all: 9, live: 3, ready: 2, drafts: 1, closed: 3 })
  })

  it('sorts live first, then paused, ready by start, drafts, and closed by end, latest first', () => {
    const order = toVoteRows(fixtures, NOW).map(({ process }) => process.id)
    expect(order.slice(0, 3).sort()).toEqual(['live', 'paused', 'qbq-mid'].sort())
    expect(order.indexOf('qbq-ready')).toBeLessThan(order.indexOf('scheduled'))
    expect(order.slice(-3)).toEqual(['results', 'canceled', 'ended'])
    expect(
      compareVoteRows({ process: fixtures[2], state: 'live' }, { process: fixtures[3], state: 'paused' })
    ).toBeLessThan(0)
  })

  it('searches every language of the title, ignoring case and accents', () => {
    const process = vote([], { title: { default: 'Assemblea General', es: 'Asamblea Económica' } })
    expect(matchesSearch(process, normalizeSearch('ECONOMICA'))).toBe(true)
    expect(matchesSearch(process, normalizeSearch('assemblea'))).toBe(true)
    expect(matchesSearch(process, normalizeSearch('budget'))).toBe(false)
    expect(matchesSearch(process, '')).toBe(true)
  })

  it('warns about a draft with no end date or one already past', () => {
    expect(draftWarning(vote([], { published: false, endDate: undefined }), NOW)).toBe('missingEndDate')
    expect(draftWarning(vote([], { published: false, endDate: '2026-06-01T00:00:00Z' }), NOW)).toBe('endDatePassed')
    expect(draftWarning(vote([], { published: false }), NOW)).toBeNull()
  })
})

describe('timeLeft', () => {
  it('keeps the two largest units and nothing once the end has passed', () => {
    expect(timeLeft(new Date('2026-06-17T16:30:00Z'), NOW)).toEqual({ days: 2, hours: 4 })
    expect(timeLeft(new Date('2026-06-15T12:00:20Z'), NOW)).toEqual({ minutes: 1 })
    expect(timeLeft(new Date('2026-06-15T11:00:00Z'), NOW)).toBeNull()
    expect(timeLeft(undefined, NOW)).toBeNull()
  })
})

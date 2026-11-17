import type { QuestionStatus, VotingProcessQuestion, VotingProcessResponse } from '@vocdoni/api-types'
import {
  activeQuestionIds,
  canOpenQuestion,
  compareVoteRows,
  countByFilter,
  deriveQuestionState,
  deriveVoteState,
  draftWarning,
  isLastQuestionLeft,
  isSettledQuestion,
  matchesSearch,
  nonTerminalQuestionIds,
  normalizeSearch,
  openQuestionBlock,
  pausedHoldIds,
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
    ['a published process with no questions is ready', vote([]), 'ready'],
    [
      'a published process with no questions is closed past its end',
      vote([], { endDate: '2026-06-10T00:00:00Z' }),
      'closed',
    ],
  ])('%s', (_name, process, expected) => {
    expect(deriveVoteState(process, NOW)).toBe(expected)
  })

  describe('a question-by-question vote with nothing open', () => {
    const withVotes = (statuses: QuestionStatus[], votes: number[], extra: Record<string, unknown> = {}) => {
      const process = vote(statuses, { ...byQuestion, ...extra })
      process.questions.forEach((q, index) => (q.results = { voteCount: votes[index] ?? 0 }))
      return process
    }

    it('is paused when a question that had votes was paused on its own, on any device', () => {
      expect(deriveVoteState(withVotes(['PAUSED', 'PAUSED'], [12, 0]), NOW)).toBe('paused')
      expect(deriveVoteState(withVotes(['ENDED', 'PAUSED'], [9, 4]), NOW)).toBe('paused')
    })

    it('is paused when this browser remembers holding a question with no votes yet', () => {
      expect(deriveVoteState(withVotes(['PAUSED', 'PAUSED'], [0, 0]), NOW, new Set(['q1']))).toBe('paused')
    })

    it('stays ready before its start, and ready or live when no paused question was open', () => {
      const early = withVotes(['PAUSED'], [3], { startDate: '2026-06-20T00:00:00Z' })
      expect(deriveVoteState(early, NOW, new Set(['q0']))).toBe('ready')
      expect(deriveVoteState(withVotes(['PAUSED', 'PAUSED'], [0, 0]), NOW)).toBe('ready')
      expect(deriveVoteState(withVotes(['ENDED', 'PAUSED'], [9, 0]), NOW)).toBe('live')
      // A memory of a question that is open again or over says nothing.
      expect(deriveVoteState(withVotes(['ENDED', 'PAUSED'], [9, 0]), NOW, new Set(['q0']))).toBe('live')
    })
  })
})

describe('pausedHoldIds', () => {
  const process = () => {
    const p = vote(['PAUSED', 'PAUSED', 'PAUSED', 'ONGOING'], byQuestion)
    p.questions[0].results = { voteCount: 5 }
    return p
  }

  it('takes the remembered paused questions over the voted ones', () => {
    expect(pausedHoldIds(process(), new Set(['q1', 'q3']))).toEqual(['q1'])
  })

  it('falls back to every paused question with votes without a memory', () => {
    expect(pausedHoldIds(process())).toEqual(['q0'])
    expect(pausedHoldIds(vote(['PAUSED']), new Set(['q0']))).toEqual([])
  })
})

describe('one question open at a time (R29)', () => {
  const qbq = (statuses: QuestionStatus[], voted: number[] = []) => {
    const p = vote(statuses, byQuestion)
    voted.forEach((index) => (p.questions[index].results = { voteCount: 5 }))
    return p
  }
  const block = (p: VotingProcessResponse, index: number, now = NOW, remembered?: ReadonlySet<string>) =>
    openQuestionBlock(p, p.questions[index], now, remembered)

  it('blocks every other question while one is open, and the open one is not waiting', () => {
    const p = qbq(['RESULTS', 'ONGOING', 'PAUSED', 'PAUSED'], [0, 1])
    expect(activeQuestionIds(p, NOW)).toEqual(['q1'])
    expect(block(p, 2)).toBe('otherActive')
    expect(block(p, 3)).toBe('otherActive')
    expect(block(p, 1)).toBe('notWaiting')
    expect(canOpenQuestion(p, p.questions[2], NOW)).toBe(false)
  })

  it('counts a paused question as active: beside an open one it cannot resume, alone it pauses the vote', () => {
    const both = qbq(['ONGOING', 'PAUSED', 'PAUSED'], [0, 1])
    expect(activeQuestionIds(both, NOW)).toEqual(['q0', 'q1'])
    expect(block(both, 1)).toBe('otherActive')
    expect(block(both, 2)).toBe('otherActive')
    // Nothing open and a voted question paused: the vote reads paused, and only "Resume the vote" moves it.
    const alone = qbq(['RESULTS', 'PAUSED', 'PAUSED'], [0, 1])
    expect(activeQuestionIds(alone, NOW)).toEqual(['q1'])
    expect(block(alone, 1)).toBe('votePaused')
    expect(block(alone, 2)).toBe('votePaused')
  })

  it('lets any question to open open when none is active', () => {
    const p = qbq(['RESULTS', 'PAUSED', 'PAUSED'], [0])
    expect(activeQuestionIds(p, NOW)).toEqual([])
    expect(block(p, 1)).toBeNull()
    expect(canOpenQuestion(p, p.questions[2], NOW)).toBe(true)
  })

  it('holds every question while the whole vote is paused, even one this browser remembers with no votes', () => {
    const p = qbq(['PAUSED', 'PAUSED'])
    expect(block(p, 1)).toBeNull()
    expect(block(p, 1, NOW, new Set(['q0']))).toBe('votePaused')
  })

  it('opens nothing when every question is closed, before the start, nor in an all-at-once vote', () => {
    const closed = qbq(['RESULTS', 'ENDED'], [0, 1])
    expect(block(closed, 1)).toBe('over')
    const early = qbq(['PAUSED', 'PAUSED'])
    expect(block(early, 0, new Date('2026-05-01T12:00:00Z'))).toBe('beforeStart')
    const together = vote(['PAUSED'])
    expect(block(together, 0)).toBe('notByQuestion')
  })
})

describe('isLastQuestionLeft (R30)', () => {
  it('is true only when every other question is over', () => {
    const p = vote(['RESULTS', 'CANCELED', 'ONGOING'], byQuestion)
    expect(isLastQuestionLeft(p, 'q2')).toBe(true)
    const more = vote(['RESULTS', 'ONGOING', 'PAUSED'], byQuestion)
    expect(isLastQuestionLeft(more, 'q1')).toBe(false)
    expect(isLastQuestionLeft(more, 'missing')).toBe(false)
  })
})

describe('isSettledQuestion', () => {
  it('is settled on a final tally or a terminal status, never on the clock alone', () => {
    expect(isSettledQuestion(question('ENDED'))).toBe(true)
    expect(isSettledQuestion(question('RESULTS'))).toBe(true)
    expect(isSettledQuestion(question('ONGOING', 0, { results: { finalResults: true } }))).toBe(true)
    expect(isSettledQuestion(question('ONGOING'), { finalResults: true })).toBe(true)
    expect(isSettledQuestion(question('ONGOING'), { finalResults: false })).toBe(false)
    expect(isSettledQuestion(question('PAUSED'))).toBe(false)
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

describe('participation', () => {
  it('rounds to an integer percent and has none without a census size', () => {
    expect(percentOf(184, 312)).toBe(59)
    expect(percentOf(5, 0)).toBeUndefined()
    expect(percentOf(5, undefined)).toBeUndefined()
  })

  it('never rounds a partial share to 0% or 100%', () => {
    expect(percentOf(311, 312)).toBe(99)
    expect(percentOf(1, 400)).toBe(1)
    expect(percentOf(0, 400)).toBe(0)
    expect(percentOf(400, 400)).toBe(100)
  })

  it('divides a restricted question by its own electorate', () => {
    const process = vote(['ONGOING'])
    expect(questionElectorate(question('ONGOING', 0, { eligibleMemberIds: ['a', 'b'] }), process, true)).toBe(2)
    expect(questionElectorate(question('ONGOING'), process, true)).toBe(312)
  })

  it('knows no electorate for someone who cannot manage the vote (the API strips the restriction for them)', () => {
    expect(questionElectorate(question('ONGOING'), vote(['ONGOING']), false)).toBeUndefined()
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

  it('counts each chip so the four add up to all', () => {
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

  it('puts the live vote that ends soonest first', () => {
    const later = vote(['ONGOING'], { id: 'later', endDate: '2026-08-01T00:00:00Z' })
    const sooner = vote(['ONGOING'], { id: 'sooner', endDate: '2026-06-20T00:00:00Z' })
    expect(toVoteRows([later, sooner], NOW).map(({ process }) => process.id)).toEqual(['sooner', 'later'])
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

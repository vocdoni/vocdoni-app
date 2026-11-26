import type { VotingProcessResponse } from '@vocdoni/api-types'
import { calcRefetchInterval } from './view'

const NOW = new Date('2026-03-01T12:00:00Z')
const BEFORE = new Date('2026-01-01T12:00:00Z')
const AFTER = new Date('2026-05-01T12:00:00Z')

const question = (id: string, status: string) =>
  ({ id, title: { default: 'Q' }, choices: [], status, results: undefined }) as never

const process = (overrides: Partial<VotingProcessResponse>): VotingProcessResponse =>
  ({
    id: 'p1',
    published: true,
    startDate: '2026-02-01T10:00:00Z',
    endDate: '2026-04-01T10:00:00Z',
    questions: [],
    initialStatus: undefined,
    ...overrides,
  }) as unknown as VotingProcessResponse

describe('calcRefetchInterval', () => {
  it('returns 30 s when data is undefined', () => {
    expect(calcRefetchInterval(undefined)).toBe(30_000)
  })

  it('returns 30 s for an all-at-once vote regardless of its state', () => {
    const p = process({ questions: [question('q1', 'ONGOING')] })
    expect(calcRefetchInterval(p, NOW)).toBe(30_000)
  })

  it('returns 10 s for a question-by-question vote with an open question', () => {
    const p = process({
      initialStatus: 'PAUSED',
      questions: [question('q1', 'RESULTS'), question('q2', 'ONGOING')],
    } as never)
    expect(calcRefetchInterval(p, NOW)).toBe(10_000)
  })

  it('returns 10 s for a question-by-question vote with a paused question that has votes', () => {
    const paused = { id: 'q2', title: { default: 'Q' }, choices: [], status: 'PAUSED', results: { voteCount: 5 } }
    const p = process({
      initialStatus: 'PAUSED',
      questions: [question('q1', 'RESULTS'), paused as never],
    } as never)
    expect(calcRefetchInterval(p, NOW)).toBe(10_000)
  })

  it('returns 30 s for a question-by-question vote with no active question', () => {
    const p = process({
      initialStatus: 'PAUSED',
      questions: [question('q1', 'RESULTS'), question('q2', 'PAUSED')],
    } as never)
    // q2 is PAUSED with no votes — not counted as active (paused-held needs votes)
    expect(calcRefetchInterval(p, NOW)).toBe(30_000)
  })

  it('returns 30 s for a question-by-question vote whose questions are all waiting (before the first opens)', () => {
    // Before the vote starts, all questions are PAUSED with no votes: none is considered active.
    const p = process({
      initialStatus: 'PAUSED',
      questions: [question('q1', 'PAUSED'), question('q2', 'PAUSED')],
    } as never)
    expect(calcRefetchInterval(p, NOW)).toBe(30_000)
  })

  it('returns 30 s after the vote has ended by its schedule', () => {
    const p = process({
      initialStatus: 'PAUSED',
      questions: [question('q1', 'RESULTS'), question('q2', 'ENDED')],
    } as never)
    expect(calcRefetchInterval(p, AFTER)).toBe(30_000)
  })
})

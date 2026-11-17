import type { VotingProcessQuestion, VotingProcessResponse } from '@vocdoni/api-types'
import { createElection, createQuestion, createQuestionResults } from '../../VotingReportPdf/__fixtures__'
import { countRows, deriveRowState, isStepFor, nextManageStep, type RowState } from './row-state'

const LIVE = new Date('2026-01-01T12:00:00Z')
const AFTER = new Date('2026-01-03T12:00:00Z')
const none = new Set<string>()

const processWith = (question: VotingProcessQuestion) =>
  createElection({ questions: [question], initialStatus: 'PAUSED' } as never) as unknown as VotingProcessResponse

describe('deriveRowState', () => {
  it('keeps the question states while the vote runs', () => {
    const open = createQuestion({ status: 'ONGOING' })
    expect(deriveRowState(open, processWith(open), LIVE, none)).toBe('open')
    const toOpen = createQuestion({ status: 'PAUSED', results: undefined })
    expect(deriveRowState(toOpen, processWith(toOpen), LIVE, none)).toBe('toOpen')
    const closed = createQuestion({ status: 'RESULTS' })
    expect(deriveRowState(closed, processWith(closed), LIVE, none)).toBe('closed')
  })

  it('marks the questions held by a paused vote, never a closed one', () => {
    const held = createQuestion({ id: 'q1', status: 'PAUSED', results: createQuestionResults({ voteCount: 4 }) })
    expect(deriveRowState(held, processWith(held), LIVE, new Set(['q1']))).toBe('held')
    const closed = createQuestion({ id: 'q1', status: 'ENDED' })
    expect(deriveRowState(closed, processWith(closed), LIVE, new Set(['q1']))).toBe('closed')
  })

  it('reads a question nobody opened before the end as not opened, and an open one as closed', () => {
    const never = createQuestion({ status: 'PAUSED', results: undefined })
    expect(deriveRowState(never, processWith(never), AFTER, none)).toBe('notOpened')
    const open = createQuestion({ status: 'ONGOING', results: createQuestionResults({ voteCount: 3 }) })
    expect(deriveRowState(open, processWith(open), AFTER, none)).toBe('closed')
    const paused = createQuestion({ status: 'PAUSED', results: createQuestionResults({ voteCount: 3 }) })
    expect(deriveRowState(paused, processWith(paused), AFTER, none)).toBe('closed')
  })

  it('keeps a voided question voided', () => {
    const voided = createQuestion({ status: 'CANCELED' })
    expect(deriveRowState(voided, processWith(voided), AFTER, none)).toBe('canceled')
  })
})

describe('nextManageStep', () => {
  const step = (states: RowState[], held = false) => nextManageStep(states, held)

  it('closes every open question first', () => {
    expect(step(['closed', 'open', 'open', 'toOpen'])).toEqual({ action: 'close', numbers: [2, 3] })
  })

  it('then opens the first question to open, then resumes the first paused one', () => {
    expect(step(['closed', 'paused', 'toOpen', 'toOpen'])).toEqual({ action: 'open', numbers: [3] })
    expect(step(['closed', 'paused', 'paused'])).toEqual({ action: 'resume', numbers: [2] })
  })

  it('ends the vote once every question is closed, and resumes a held vote before anything else', () => {
    expect(step(['closed', 'canceled'])).toEqual({ action: 'endVote' })
    expect(step(['held', 'toOpen'], true)).toEqual({ action: 'resumeVote' })
    expect(step([])).toBeNull()
  })

  it('tells which row holds the next step', () => {
    const next = step(['closed', 'toOpen', 'toOpen'])
    expect(isStepFor(next, 'open', 2)).toBe(true)
    expect(isStepFor(next, 'open', 3)).toBe(false)
    expect(isStepFor(next, 'resume', 2)).toBe(false)
  })
})

it('counts the rows by state', () => {
  expect(countRows(['closed', 'closed', 'held', 'toOpen'])).toMatchObject({ closed: 2, held: 1, toOpen: 1, open: 0 })
})

import type { VotingProcessResponse } from '@vocdoni/api-types'
import { createElection, createQuestion } from '~components/Process/VotingReportPdf/__fixtures__'
import { getEarlyEndDate, getProcessEndDate, hasStoppedVoting } from './process-end-date'

// The fixture process is configured to end at 2026-01-02T10:00:00Z.
const withEndedAt = (endedAt?: string) => createElection({ endedAt } as never) as VotingProcessResponse

describe('getEarlyEndDate', () => {
  it('reports when a process stopped ahead of schedule', () => {
    expect(getEarlyEndDate(withEndedAt('2026-01-01T15:42:00Z'))?.toISOString()).toBe('2026-01-01T15:42:00.000Z')
  })

  it('reports nothing for a process that ran to its configured end', () => {
    expect(getEarlyEndDate(withEndedAt())).toBeNull()
  })

  it('ignores an unreadable endedAt', () => {
    expect(getEarlyEndDate(withEndedAt('not a date'))).toBeNull()
  })
})

describe('getProcessEndDate', () => {
  it('is the real end of a process stopped early', () => {
    expect(getProcessEndDate(withEndedAt('2026-01-01T15:42:00Z')).toISOString()).toBe('2026-01-01T15:42:00.000Z')
  })

  it('is the configured end otherwise', () => {
    expect(getProcessEndDate(withEndedAt()).toISOString()).toBe('2026-01-02T10:00:00.000Z')
  })
})

describe('hasStoppedVoting', () => {
  const withStatus = (status: string) =>
    createElection({ questions: [createQuestion({ status: status as never })] }) as VotingProcessResponse

  it('is true once the process stopped accepting votes, however it got there', () => {
    expect(hasStoppedVoting(withStatus('RESULTS'))).toBe(true)
    expect(hasStoppedVoting(withStatus('ENDED'))).toBe(true)
    expect(hasStoppedVoting(withStatus('CANCELED'))).toBe(true)
  })

  it('is false while the process can still receive votes', () => {
    expect(hasStoppedVoting(withStatus('ONGOING'))).toBe(false)
    expect(hasStoppedVoting(withStatus('PAUSED'))).toBe(false)
    expect(hasStoppedVoting(null)).toBe(false)
  })
})

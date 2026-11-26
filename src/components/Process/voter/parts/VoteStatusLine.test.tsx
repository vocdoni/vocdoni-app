import { screen } from '@testing-library/react'
import { renderWithFlow, testElection, testFacts, testFlow, testRoom } from '../test-flow'
import { VoteStatusLine } from './VoteStatusLine'

const qbq = (voteState: Parameters<typeof testRoom>[1], status: 'ONGOING' | 'PAUSED' | 'PROCESS_UNKNOWN') =>
  testFlow({
    election: testElection({ initialStatus: 'PAUSED', startDate: '2030-06-15T07:00:00.000Z' }),
    facts: testFacts({
      status,
      room: testRoom(['toOpen', 'toOpen'], voteState),
    }),
  })

describe('VoteStatusLine', () => {
  it('says a question-by-question vote with no question opened has not started, before its start date too', () => {
    renderWithFlow(<VoteStatusLine />, qbq('ready', 'PAUSED'))
    expect(screen.getByText('voter.room.not_started_line')).toBeInTheDocument()
    expect(screen.queryByText('voter.status.paused')).not.toBeInTheDocument()
    expect(screen.queryByText('voter.status.open_until')).not.toBeInTheDocument()
  })

  it('keeps the paused line for a question-by-question vote held after a question opened', () => {
    renderWithFlow(<VoteStatusLine />, qbq('paused', 'PAUSED'))
    expect(screen.getByText('voter.status.paused')).toBeInTheDocument()
  })

  // Once a question has closed the SDK reports PROCESS_UNKNOWN, not PAUSED: the held vote still reads paused.
  it('says a question-by-question vote held after a question closed is paused, not open until its end', () => {
    renderWithFlow(<VoteStatusLine />, qbq('paused', 'PROCESS_UNKNOWN'))
    expect(screen.getByText('voter.status.paused')).toBeInTheDocument()
    expect(screen.queryByText('voter.status.open_until')).not.toBeInTheDocument()
  })
})

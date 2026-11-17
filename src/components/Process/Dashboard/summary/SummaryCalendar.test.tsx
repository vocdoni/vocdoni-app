import type { VotingProcessResponse } from '@vocdoni/api-types'
import { render, screen } from '~src/test-utils'
import type { VoteState } from '~utils/vote-state'
import { SummaryCalendar } from './SummaryCalendar'
import type { SummaryModel } from './use-summary-model'

const NOW = new Date('2026-03-10T12:00:00Z')

const model = (state: VoteState, startDate = '2026-03-02T09:16:00Z') =>
  ({
    election: { startDate } as VotingProcessResponse,
    state,
    endDate: new Date('2026-03-12T20:00:00Z'),
    now: NOW,
  }) as SummaryModel

const steps = () => screen.getAllByRole('listitem').map((item) => item.textContent)

describe('SummaryCalendar', () => {
  it('lists the opening, today and the closing of a live vote, today as the current step', () => {
    render(<SummaryCalendar model={model('live')} />)

    expect(steps()).toEqual([
      expect.stringContaining('Vote opened'),
      expect.stringContaining('Today'),
      expect.stringContaining('Closing and results for everyone'),
    ])
    expect(screen.getByText('Today').closest('li')).toHaveAttribute('aria-current', 'step')
  })

  it('says today that a paused vote is paused', () => {
    render(<SummaryCalendar model={model('paused')} />)

    expect(screen.getByText('Today. Vote paused')).toBeInTheDocument()
    expect(screen.getByText('Nobody can vote until you resume it.')).toBeInTheDocument()
  })

  it('looks ahead for a vote that has not opened yet', () => {
    render(<SummaryCalendar model={model('ready', '2026-03-11T09:00:00Z')} />)

    expect(steps()).toEqual([expect.stringContaining('Vote opens'), expect.stringContaining('Closing')])
  })

  it('ends an ended vote at its end, and a canceled one with no closing', () => {
    const { unmount } = render(<SummaryCalendar model={model('closed')} />)
    expect(steps()).toEqual([expect.stringContaining('Vote opened'), expect.stringContaining('Vote ended')])
    unmount()

    render(<SummaryCalendar model={model('canceled')} />)
    expect(steps()).toEqual([expect.stringContaining('Vote opened')])
  })
})

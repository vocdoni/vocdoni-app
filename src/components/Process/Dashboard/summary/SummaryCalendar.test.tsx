import type { VotingProcessResponse } from '@vocdoni/api-types'
import { cleanup, render, screen } from '~src/test-utils'
import type { VoteState } from '~utils/vote-state'
import { SummaryCalendar } from './SummaryCalendar'
import type { SummaryModel } from './use-summary-model'

const NOW = new Date('2026-03-10T12:00:00Z')

const model = (state: VoteState, startDate = '2026-03-02T09:16:00Z', endedEarly = false) =>
  ({
    election: { startDate } as VotingProcessResponse,
    state,
    endDate: new Date('2026-03-12T20:00:00Z'),
    endedEarly,
    now: NOW,
  }) as SummaryModel

const steps = () => screen.getAllByRole('listitem').map((item) => item.textContent)

describe('SummaryCalendar', () => {
  it('lists the closing, today and the opening of a live vote, newest first, today as the current step', () => {
    render(<SummaryCalendar desktop model={model('live')} />)

    expect(steps()).toEqual([
      expect.stringContaining('Automatic closing and results for everyone'),
      expect.stringContaining('Today'),
      expect.stringContaining('Vote opened'),
    ])
    expect(screen.getByText('Today').closest('li')).toHaveAttribute('aria-current', 'step')
  })

  it('prints each date as day and month in figures, and joins the marks with a thread but for the last', () => {
    render(<SummaryCalendar desktop model={model('live')} />)

    const items = screen.getAllByRole('listitem')
    expect(items.map((item) => item.querySelector('span')?.textContent)).toEqual(['12/03', '10/03', '02/03'])
    // The mark column holds the dot and, under it, the thread.
    expect(items.map((item) => item.querySelector('[aria-hidden]')?.childElementCount)).toEqual([2, 2, 1])
  })

  it('says today that a paused vote is paused', () => {
    render(<SummaryCalendar desktop model={model('paused')} />)

    expect(screen.getByText('Today. Vote paused')).toBeInTheDocument()
    expect(screen.getByText('Nobody can vote until you resume it.')).toBeInTheDocument()
  })

  it('looks ahead for a vote that has not opened yet', () => {
    render(<SummaryCalendar desktop model={model('ready', '2026-03-11T09:00:00Z')} />)

    expect(steps()).toEqual([expect.stringContaining('Automatic closing'), expect.stringContaining('Vote opens')])
  })

  it('ends an ended vote at its end, and a canceled one with no closing', () => {
    const { unmount } = render(<SummaryCalendar desktop model={model('closed')} />)
    expect(steps()).toEqual([
      expect.stringContaining('Closed automatically at the deadline'),
      expect.stringContaining('Vote opened'),
    ])
    unmount()

    render(<SummaryCalendar desktop model={model('closed', undefined, true)} />)
    expect(steps()[0]).toContain('Ended manually')
    cleanup()

    render(<SummaryCalendar desktop model={model('canceled')} />)
    expect(steps()).toEqual([expect.stringContaining('Vote opened')])
  })
})

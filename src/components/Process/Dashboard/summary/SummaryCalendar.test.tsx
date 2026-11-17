import type { VotingProcessResponse } from '@vocdoni/api-types'
import { act } from '@testing-library/react'
import i18n from 'i18next'
import { cleanup, render, screen } from '~src/test-utils'
import type { VoteState } from '~utils/vote-state'
import { SummaryCalendar } from './SummaryCalendar'
import type { SummaryModel } from './use-summary-model'

// Local times, so the days printed are the same in every time zone the suite runs in.
const NOW = new Date(2026, 2, 10, 12, 0)
const local = (day: number, hour: number, minute = 0) => new Date(2026, 2, day, hour, minute).toISOString()

const model = (state: VoteState, startDate = local(2, 9, 16), endedEarly = false) =>
  ({
    election: { startDate } as VotingProcessResponse,
    state,
    endDate: new Date(2026, 2, 12, 20, 0),
    endedEarly,
    now: NOW,
  }) as SummaryModel

const steps = () => screen.getAllByRole('listitem').map((item) => item.textContent)

describe('SummaryCalendar', () => {
  afterEach(async () => {
    await act(() => i18n.changeLanguage('en'))
  })

  it('writes the day and month as the language does, and the British way in English', async () => {
    const days = () => screen.getAllByRole('listitem').map((item) => item.querySelector('span')?.textContent)
    const { unmount } = render(<SummaryCalendar desktop model={model('live')} />)
    // 12 March, never "03/12".
    expect(days()[0]).toBe('12/03')
    unmount()

    await act(() => i18n.changeLanguage('de'))
    render(<SummaryCalendar desktop model={model('live')} />)
    expect(days()[0]).toBe('12.03.')
  })

  it('lists the closing, today and the opening of a live vote, newest first, today as the current step', () => {
    render(<SummaryCalendar desktop model={model('live')} />)

    expect(steps()).toEqual([
      expect.stringContaining('Automatic closing and results for everyone'),
      expect.stringContaining('Today'),
      expect.stringContaining('Vote opened'),
    ])
    expect(screen.getByText('Today').closest('li')).toHaveAttribute('aria-current', 'step')
  })

  it('prints each date as day and month in figures', () => {
    render(<SummaryCalendar desktop model={model('live')} />)

    const items = screen.getAllByRole('listitem')
    expect(items.map((item) => item.querySelector('span')?.textContent)).toEqual(['12/03', '10/03', '02/03'])
  })

  it("says today that a paused vote is paused, once: what it means is the banner's to say", () => {
    render(<SummaryCalendar desktop model={model('paused')} />)

    expect(screen.getByText('Today. Vote paused')).toBeInTheDocument()
    expect(screen.queryByText(/Nobody can vote/)).not.toBeInTheDocument()
  })

  it('looks ahead for a vote that has not opened yet', () => {
    render(<SummaryCalendar desktop model={model('ready', local(11, 9))} />)

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

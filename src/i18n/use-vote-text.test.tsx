import { act, renderHook } from '@testing-library/react'
import i18n from 'i18next'
import type { ReactNode } from 'react'
import { AllProviders } from '~src/test-utils'
import { useVoteText } from './use-vote-text'

const wrapper = ({ children }: { children: ReactNode }) => <AllProviders>{children}</AllProviders>

const setup = () => renderHook(() => useVoteText(), { wrapper }).result.current

afterEach(async () => {
  await act(() => i18n.changeLanguage('en'))
})

describe('useVoteText', () => {
  describe('timeLeft', () => {
    const now = new Date('2026-01-10T10:00:00Z')

    it('names the two largest units left', () => {
      const end = new Date(now.getTime() + (2 * 24 + 4) * 3_600_000)
      expect(setup().timeLeft(end, now)).toBe('2 days and 4 hours left')
    })

    it('is null once the end has passed', () => {
      expect(setup().timeLeft(new Date(now.getTime() - 1000), now)).toBeNull()
      expect(setup().timeLeft(undefined, now)).toBeNull()
    })
  })

  describe('dates', () => {
    const date = new Date(2026, 3, 9, 20, 0)

    it('writes the long date with weekday and no year, in English', () => {
      expect(setup().longDate(date)).toMatch(/^Thursday, April 9.*20:00$/)
      expect(setup().shortDate(date)).toBe('April 9')
    })

    it('writes "d’abril" in Catalan, which no date-fns pattern can', async () => {
      await act(() => i18n.changeLanguage('ca'))
      expect(setup().longDate(date)).toContain('d’abril')
    })

    it('is empty for a missing or unreadable date', () => {
      expect(setup().longDate(undefined)).toBe('')
      expect(setup().longDate('')).toBe('')
      expect(setup().longDate('not a date')).toBe('')
      expect(setup().dateAt(undefined)).toBe('')
      expect(setup().day('not a date')).toBe('')
    })

    it("writes the boards' date and time from its parts", () => {
      const { dateAt, day, time } = setup()
      expect(dateAt(date)).toBe('Thursday, April 9 at 20:00')
      expect(day(date)).toBe('Thursday, April 9')
      expect(time(date)).toBe('20:00')
    })
  })

  describe('ago and duration', () => {
    const start = new Date('2026-01-10T10:00:00Z')
    const later = (minutes: number) => new Date(start.getTime() + minutes * 60_000)

    it('says how long ago in the largest whole unit, a minute at least', () => {
      const { ago } = setup()
      expect(ago(start, later(0))).toBe('1 minute ago')
      expect(ago(start, later(46))).toBe('46 minutes ago')
      expect(ago(start, later(150))).toBe('2 hours ago')
      expect(ago(start, later(3 * 24 * 60 + 5))).toBe('3 days ago')
    })

    it('names the two largest units between two moments', () => {
      expect(setup().duration(start, later(88))).toBe('1 hour and 28 minutes')
      expect(setup().duration(start, start)).toBe('1 minute')
    })
  })
})

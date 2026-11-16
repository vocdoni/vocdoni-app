import { act, renderHook } from '@testing-library/react'
import type { Choice } from '@vocdoni/api-types'
import i18n from 'i18next'
import type { ReactNode } from 'react'
import { AllProviders } from '~src/test-utils'
import { useVoteText } from './use-vote-text'

const wrapper = ({ children }: { children: ReactNode }) => <AllProviders>{children}</AllProviders>
const choice = (title: string, value = 0): Choice => ({ title: { default: title }, value })

const setup = () => renderHook(() => useVoteText(), { wrapper }).result.current

afterEach(async () => {
  await act(() => i18n.changeLanguage('en'))
})

describe('useVoteText', () => {
  describe('outcome', () => {
    it('words a pair as "winner, N to M"', () => {
      const { outcome } = setup()
      expect(outcome({ kind: 'pair', winner: choice('Yes'), winnerVotes: 198, otherVotes: 7 })).toBe('Yes, 198 to 7')
    })

    it('says tie', () => {
      expect(setup().outcome({ kind: 'tie' })).toBe('Tie')
    })

    it('pluralises the votes of a winner and speaks of weight on a weighted census', () => {
      const { outcome } = setup()
      expect(outcome({ kind: 'winner', winner: choice('Red'), votes: 1, weighted: false })).toBe('Red wins with 1 vote')
      expect(outcome({ kind: 'winner', winner: choice('Red'), votes: 12, weighted: false })).toBe(
        'Red wins with 12 votes'
      )
      expect(outcome({ kind: 'winner', winner: choice('Red'), votes: 12, weighted: true })).toBe(
        'Red wins with a weight of 12'
      )
    })

    it('names the most voted choice of a multiple choice', () => {
      expect(setup().outcome({ kind: 'top', choice: choice('Blue'), votes: 3, weighted: false })).toBe(
        'Most voted: Blue'
      )
    })

    it('has nothing to say without an outcome', () => {
      expect(setup().outcome(null)).toBeNull()
    })
  })

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
    })
  })
})

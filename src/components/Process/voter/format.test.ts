import type { VotingProcessQuestion } from '@vocdoni/api-types'
import { describeAnswer, formatVoteDay, formatVoteTime, maskContact, textOf, voterTurnout } from './format'

const question = (over: Partial<VotingProcessQuestion> = {}) =>
  ({
    id: 'q1',
    title: { default: 'Q' },
    choices: [
      { title: { default: 'Teulada' }, value: 0 },
      { title: { default: 'Calefacció' }, value: 1 },
      { title: { default: 'Rampa' }, value: 2 },
    ],
    type: 'singlechoice',
    ...over,
  }) as VotingProcessQuestion
const ranked = question({
  type: undefined,
  metadata: { type: { name: 'ranked' } },
  ballotProtocol: {
    maxCount: 3,
    maxValue: 2,
    maxVoteOverwrites: 0,
    costExponent: 1,
    uniqueValues: true,
    maxTotalCost: 0,
    costFromWeight: false,
  },
})
const words = { blank: 'Vot en blanc', ranked: (position: number, label: string) => `${position}. ${label}` }

describe('maskContact', () => {
  it('keeps the first letter and the domain of an email', () => {
    expect(maskContact('anna@exemple.cat')).toBe('a•••@exemple.cat')
    expect(maskContact('  anna@exemple.cat ')).toBe('a•••@exemple.cat')
  })

  it('keeps the last three digits of a phone, and hides anything shorter', () => {
    expect(maskContact('+34 600 123 678')).toBe('•••678')
    expect(maskContact('12')).toBe('•••')
    expect(maskContact(undefined)).toBe('•••')
  })
})

describe('dates', () => {
  const date = new Date(Date.UTC(2026, 2, 12, 19, 0))

  it('writes the day with or without the month, and the time with or without the zone', () => {
    expect(formatVoteDay(date, 'ca', { timeZone: 'UTC' })).toMatch(/^dijous,? 12 de març$/)
    expect(formatVoteDay(date, 'ca', { month: false, timeZone: 'UTC' })).toBe('dijous 12')
    expect(formatVoteTime(date, 'ca', { timeZone: 'UTC' })).toBe('19:00')
    expect(formatVoteTime(date, 'en', { zone: true, timeZone: 'UTC' })).toBe('19:00 UTC')
  })
})

describe('describeAnswer', () => {
  it('names a single choice, several choices and a blank vote', () => {
    expect(describeAnswer(question(), '1', words)).toBe('Calefacció')
    expect(describeAnswer(question({ type: 'multichoice' }), ['0', '2'], words)).toBe('Teulada, Rampa')
    expect(describeAnswer(question({ type: 'multichoice' }), [], words)).toBe('Vot en blanc')
    expect(describeAnswer(question(), undefined, words)).toBe('')
  })

  it('adds the ranks on review only', () => {
    expect(describeAnswer(ranked, ['0', '1', '2'], words)).toBe('Teulada, Calefacció, Rampa')
    expect(describeAnswer(ranked, ['0', '1', '2'], words, { positions: true })).toBe(
      '1. Teulada, 2. Calefacció, 3. Rampa'
    )
  })
})

describe('textOf', () => {
  it('reads a plain string or the default entry', () => {
    expect(textOf('A')).toBe('A')
    expect(textOf({ default: 'B', ca: 'C' })).toBe('B')
    expect(textOf({ ca: 'C' })).toBe('C')
    expect(textOf(undefined)).toBe('')
  })
})

describe('voterTurnout', () => {
  const election = {
    questions: [
      { id: 'q1', results: { voteCount: 184, maxVoters: 312 } },
      { id: 'q2', results: { voteCount: 180, maxVoters: 312 } },
    ],
  } as never

  it('counts the most voted question and takes the census from the read', () => {
    expect(voterTurnout(election, {})).toEqual({ count: 184, total: 312 })
  })

  it('omits the denominator when the read has none, and everything when the deployment hides counts', () => {
    expect(voterTurnout({ questions: [{ id: 'q1', results: { voteCount: 3 } }] } as never, {})).toEqual({ count: 3 })
    expect(voterTurnout(election, { HIDE_VOTER_COUNT: true })).toBeNull()
  })
})

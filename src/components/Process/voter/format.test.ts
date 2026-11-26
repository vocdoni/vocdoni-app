import type { VotingProcessQuestion } from '@vocdoni/api-types'
import {
  describeAnswer,
  formatVoteDay,
  formatVoteReturnDay,
  formatVoteTime,
  maskContact,
  resultKind,
  resultsFinal,
  sentenceStop,
  textOf,
  voterTurnout,
} from './format'

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

  it('writes the time with or without the zone', () => {
    expect(formatVoteTime(date, 'ca', { timeZone: 'UTC' })).toBe('19:00')
    expect(formatVoteTime(date, 'en', { zone: true, timeZone: 'UTC' })).toBe('19:00 UTC')
  })
})

describe('formatVoteDay', () => {
  const reference = new Date(Date.UTC(2026, 10, 10, 12, 0))
  const sameMonth = new Date(Date.UTC(2026, 10, 17, 19, 0))
  const otherMonth = new Date(Date.UTC(2026, 11, 17, 19, 0))
  const otherYear = new Date(Date.UTC(2027, 0, 18, 19, 0))
  const day = (date: Date, language: string) => formatVoteDay(date, language, { reference, timeZone: 'UTC' })

  // German keeps the comma after the weekday, as it reads mid-sentence too (gate F16).
  // ICU's wording varies between versions ("de" or "del" before the year in Catalan), so the patterns allow it; what
  // they pin is the order, the weekday, the day, the month name, whether the year is there, and no comma after the
  // weekday (the date sits mid-sentence).
  it('drops the month in the reference month and year', () => {
    expect(day(sameMonth, 'ca')).toMatch(/^dimarts 17$/)
    expect(day(sameMonth, 'es')).toMatch(/^martes 17$/)
    expect(day(sameMonth, 'de')).toMatch(/^Dienstag, 17\.?$/)
  })

  it('adds the month in another month of the same year', () => {
    expect(day(otherMonth, 'ca')).toMatch(/^dijous 17 de desembre$/)
    expect(day(otherMonth, 'es')).toMatch(/^jueves 17 de diciembre$/)
    expect(day(otherMonth, 'de')).toMatch(/^Donnerstag, 17\. Dezember$/)
  })

  it('adds the month and the year in another year', () => {
    expect(day(otherYear, 'ca')).toMatch(/^dilluns 18 de gener del? 2027$/)
    expect(day(otherYear, 'es')).toMatch(/^lunes 18 de enero del? 2027$/)
    expect(day(otherYear, 'de')).toMatch(/^Montag, 18\. Januar 2027$/)
    expect(day(otherYear, 'en')).toMatch(/^Monday 18 January 2027$/)
  })

  it('always gives English the month, in English order', () => {
    expect(day(sameMonth, 'en')).toMatch(/^Tuesday 17 November$/)
    expect(day(otherMonth, 'en')).toMatch(/^Thursday 17 December$/)
    expect(day(sameMonth, 'en-GB')).toMatch(/^Tuesday 17 November$/)
  })

  it('leaves no comma after the weekday and shows the year only in another year, in every locale', () => {
    // German keeps ICU's comma ("am Donnerstag, 17. Dezember", gate F16): pinned in the tests above.
    for (const language of ['ca', 'el', 'en', 'es', 'eu', 'fr', 'it', 'pt', 'pt-br']) {
      const weekday = (date: Date) =>
        new Intl.DateTimeFormat(language, { weekday: 'long', timeZone: 'UTC' }).format(date)
      for (const date of [sameMonth, otherMonth, otherYear]) {
        const text = day(date, language)
        expect(text).toContain(weekday(date))
        expect(text).not.toContain(`${weekday(date)},`)
        expect(text).toMatch(/18|17/)
      }
      expect(day(otherMonth, language)).not.toMatch(/2026/)
      expect(day(otherYear, language)).toMatch(/2027/)
    }
  })

  it('compares the month in the given time zone', () => {
    const lateNight = new Date(Date.UTC(2026, 10, 30, 23, 30))
    expect(formatVoteDay(lateNight, 'ca', { reference, timeZone: 'Europe/Madrid' })).toMatch(/de desembre$/)
    expect(formatVoteDay(lateNight, 'ca', { reference, timeZone: 'UTC' })).toMatch(/^dilluns 30$/)
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

  it('says "at least" question by question, where the count is the highest per-question one', () => {
    const byQuestion = { ...(election as object), initialStatus: 'PAUSED' } as never
    expect(voterTurnout(byQuestion, {})).toEqual({ count: 184, total: 312, atLeast: true })
    expect(
      voterTurnout({ initialStatus: 'PAUSED', questions: [{ id: 'q1', results: { voteCount: 0 } }] } as never, {})
    ).toEqual({ count: 0 })
  })

  it('omits the denominator when the read has none, and everything when the deployment hides counts', () => {
    expect(voterTurnout({ questions: [{ id: 'q1', results: { voteCount: 3 } }] } as never, {})).toEqual({ count: 3 })
    expect(voterTurnout(election, { HIDE_VOTER_COUNT: true })).toBeNull()
  })
})

const PROTOCOL = { maxVoteOverwrites: 0, costExponent: 1, maxTotalCost: 0, costFromWeight: false }

describe('resultKind', () => {
  it('names how each castable type is answered (boards M10, M11)', () => {
    expect(
      resultKind(
        question({
          type: 'singlechoice',
          ballotProtocol: { ...PROTOCOL, maxCount: 1, maxValue: 2, uniqueValues: false },
        })
      )
    ).toEqual({ key: 'single' })
    expect(
      resultKind(
        question({
          type: 'multichoice',
          typeSetup: { maxChoices: 2, minChoices: 0, uniqueChoices: false },
          ballotProtocol: { ...PROTOCOL, maxCount: 2, maxValue: 4, uniqueValues: true },
        })
      )
    ).toEqual({ key: 'multiple', count: 2 })
    expect(
      resultKind(
        question({
          type: undefined,
          metadata: { type: { name: 'approval' } },
          ballotProtocol: { ...PROTOCOL, maxCount: 3, maxValue: 1, uniqueValues: false },
        } as Partial<VotingProcessQuestion>)
      )
    ).toEqual({ key: 'approval' })
    expect(
      resultKind(
        question({
          metadata: { type: { name: 'ranked' } },
          ballotProtocol: { ...PROTOCOL, maxCount: 3, maxValue: 2, uniqueValues: true },
        } as Partial<VotingProcessQuestion>)
      )
    ).toEqual({ key: 'ranked' })
  })

  it('says nothing for a question whose type cannot be read (a legacy projection)', () => {
    expect(resultKind(question({ type: '' } as Partial<VotingProcessQuestion>))).toBeNull()
  })
})

describe('resultsFinal', () => {
  const withFinal = (...flags: (boolean | undefined)[]) =>
    ({
      questions: flags.map((finalResults) => ({ results: finalResults === undefined ? undefined : { finalResults } })),
    }) as never

  it('is final only when every question carries the chain final tally', () => {
    expect(resultsFinal(withFinal(true, true))).toBe(true)
    expect(resultsFinal(withFinal(true, false))).toBe(false)
    expect(resultsFinal(withFinal(true, undefined))).toBe(false)
  })

  it('leaves a canceled question out: a vote over with one ended and one canceled is final', () => {
    const election = {
      questions: [
        { id: 'q1', status: 'ENDED', results: { finalResults: true, voteCount: 3 } },
        { id: 'q2', status: 'CANCELED', results: { voteCount: 0 } },
      ],
    } as never
    expect(resultsFinal(election)).toBe(true)
  })

  it('is final when every question was canceled: nothing is left to count', () => {
    const election = {
      questions: [
        { id: 'q1', status: 'CANCELED', results: { voteCount: 0 } },
        { id: 'q2', status: 'CANCELED', results: { voteCount: 0 } },
      ],
    } as never
    expect(resultsFinal(election)).toBe(true)
  })

  it('is final when every question ended before it opened: nothing is left to count', () => {
    const endedAt = '2026-12-01T19:00:00.000Z'
    const election = {
      initialStatus: 'PAUSED',
      published: true,
      questions: [
        { id: 'q1', status: 'ENDED', endedAt, results: { voteCount: 0 } },
        { id: 'q2', status: 'ENDED', endedAt, results: { voteCount: 0 } },
      ],
    } as never
    expect(resultsFinal(election)).toBe(true)
  })

  it('leaves out a question the vote ended before it opened, which has no tally', () => {
    const endedAt = '2026-12-01T19:00:00.000Z'
    const election = {
      initialStatus: 'PAUSED',
      published: true,
      questions: [
        { id: 'q1', status: 'ENDED', endedAt, results: { finalResults: true, voteCount: 3 } },
        { id: 'q2', status: 'ENDED', endedAt, results: { voteCount: 0 } },
      ],
    } as never
    expect(resultsFinal(election)).toBe(true)
  })
})

describe('formatVoteReturnDay', () => {
  const reference = new Date(Date.UTC(2026, 10, 10, 12, 0))
  const at = (date: Date, language = 'ca') => formatVoteReturnDay(date, language, { reference, timeZone: 'UTC' })

  it('is the bare weekday when the date is within the next six days', () => {
    expect(at(new Date(Date.UTC(2026, 10, 12, 19, 0)))).toBe('dijous')
    expect(at(new Date(Date.UTC(2026, 10, 16, 19, 0)), 'en')).toBe('Monday')
    expect(at(reference)).toBe('dimarts')
  })

  it('keeps the full day from a week on, and for a date already past', () => {
    expect(at(new Date(Date.UTC(2026, 10, 17, 19, 0)))).toBe('dimarts 17')
    expect(at(new Date(Date.UTC(2026, 11, 17, 19, 0)))).toMatch(/de desembre$/)
    expect(at(new Date(Date.UTC(2026, 10, 9, 19, 0)))).toBe('dilluns 9')
  })
})

describe('sentenceStop', () => {
  it('adds a full stop to a plain title and none after punctuation', () => {
    expect(sentenceStop('Assemblea General')).toBe('.')
    for (const title of ['Vols aprovar?', 'Endavant!', 'Fi.', 'Etc\u2026', 'Vols aprovar? '])
      expect(sentenceStop(title)).toBe('')
  })
})

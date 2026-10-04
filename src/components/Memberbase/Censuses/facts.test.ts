import type { TFunction } from 'i18next'
import { describe, expect, it } from 'vitest'
import { censusSummary, signInFacts, sourceFacts } from './facts'

// Renders the English default, plurals and placeholders included
const t = ((_key: string, options: Record<string, unknown> = {}) => {
  const template = (
    options.count === undefined
      ? options.defaultValue
      : options.count === 1
        ? options.defaultValue_one
        : options.defaultValue_other
  ) as string
  return template.replace(/{{(\w+)}}/g, (_, name) => String(options[name]))
}) as unknown as TFunction

const context = { draft: false, editable: true, day: () => '12 Nov 2026' }

describe('signInFacts', () => {
  it('says what voters confirm, then whether a code follows', () => {
    expect(signInFacts(t, 'en', ['memberNumber', 'birthDate'], ['email'])).toEqual({
      value: 'They confirm their member number and date of birth',
      sub: 'Then a one-time code by email',
    })
    expect(signInFacts(t, 'en', ['name'], [])).toEqual({
      value: 'They confirm their first name',
      sub: 'Without a one-time code',
    })
    expect(signInFacts(t, 'en', [], ['email', 'phone'])).toEqual({ value: 'With a one-time code by email or SMS' })
  })
})

describe('sourceFacts', () => {
  it('names where each kind of list comes from', () => {
    const value = (source: Parameters<typeof sourceFacts>[1], extra = {}) =>
      sourceFacts(t, source, { ...context, ...extra })
    expect(value({ kind: 'everyone' }, { draft: true })).toMatchObject({
      value: 'All your members',
      sub: 'Members you add before publishing can vote too',
    })
    expect(value({ kind: 'snapshot', groupId: 'g', madeAt: '2026-11-12' })).toMatchObject({
      value: 'Your members on 12 Nov 2026',
      sub: 'Fixed when you published. Add late members here.',
    })
    expect(value({ kind: 'snapshot', groupId: 'g' }, { editable: false }).sub).toBe('Fixed when you published')
    expect(
      value({ kind: 'copy', groupId: 'g', source: 'saved', from: 'Board' }, { copiedOn: '2 Oct 2026' })
    ).toMatchObject({
      value: "From the saved census 'Board'",
      sub: 'Copied on 2 Oct 2026',
    })
    expect(value({ kind: 'copy', groupId: 'g', source: 'previous', from: 'AGM 2025' }).value).toBe(
      "From the vote 'AGM 2025'"
    )
    expect(value({ kind: 'copy', groupId: 'g', source: 'choose' }).value).toBe('People you picked one by one')
    expect(value({ kind: 'selected' }).value).toBe('People you picked one by one')
  })
})

describe('censusSummary', () => {
  it('says the census in sentences, with the time zone of the close', () => {
    expect(
      censusSummary(t, {
        count: 1184,
        formattedCount: '1,184',
        source: { kind: 'snapshot', groupId: 'g', madeAt: '2026-11-12' },
        draft: false,
        day: () => '12 Nov 2026',
        details: 'member number',
        channel: 'email',
        weighted: true,
        dates: {
          start: '12 Nov 2026',
          end: 'Thu 19 Nov 2026',
          time: '18:00',
          zone: 'CET',
          over: false,
          canceled: false,
        },
      })
    ).toBe(
      '1,184 members are on the voter list: your members as they were on 12 Nov 2026, when you published. ' +
        'They get in by confirming their member number and a one-time code sent by email. ' +
        'Votes count by voting power. ' +
        'Voting runs from 12 Nov 2026 to Thu 19 Nov 2026 and closes at 18:00 (CET).'
    )
  })
})

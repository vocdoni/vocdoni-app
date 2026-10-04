import type { TFunction } from 'i18next'
import { describe, expect, it } from 'vitest'
import { signInFacts, sourceFacts } from './facts'

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
    // No code, nothing said about one
    expect(signInFacts(t, 'en', ['name'], [])).toEqual({ value: 'They confirm their first name', sub: undefined })
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
      sub: 'You can still add and remove members in this census',
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

import type { VotingProcessQuestion } from '@vocdoni/api-types'
import i18n from 'i18next'
import { questionRule } from './question-rule'

const t = i18n.getFixedT('en')

const PROTOCOL = {
  maxCount: 1,
  maxValue: 2,
  maxVoteOverwrites: 0,
  costExponent: 1,
  uniqueValues: false,
  maxTotalCost: 0,
  costFromWeight: false,
}

const choices = (n: number) =>
  Array.from({ length: n }, (_, value) => ({ title: { default: `Option ${value}` }, value }))

const question = (overrides: Record<string, unknown>, n = 3) =>
  ({
    id: 'q1',
    title: { default: 'Question' },
    choices: choices(n),
    ballotProtocol: { ...PROTOCOL, maxValue: n - 1 },
    type: 'singlechoice',
    status: 'ONGOING',
    ...overrides,
  }) as unknown as VotingProcessQuestion

describe('questionRule', () => {
  it('draws a single choice as radios, one option', () => {
    expect(questionRule(t, question({}))).toEqual({
      mark: 'one',
      note: 'Pick one option. The one with the most votes wins.',
      tag: 'One option',
    })
  })

  it('writes a multiple choice from how many may be marked and how many options there are', () => {
    const rule = questionRule(
      t,
      question(
        {
          type: 'multichoice',
          typeSetup: { maxChoices: 2, minChoices: 0, uniqueChoices: false },
          ballotProtocol: { ...PROTOCOL, maxCount: 4, maxValue: 1, maxTotalCost: 2 },
        },
        4
      )
    )
    expect(rule).toEqual({
      mark: 'many',
      note: 'Up to 2 options can be marked. The 2 with the most votes are chosen.',
      tag: 'Up to 2 of 4',
    })
  })

  it('says how many must be marked when the count is fixed', () => {
    const rule = questionRule(
      t,
      question(
        {
          type: 'multichoice',
          typeSetup: { maxChoices: 2, minChoices: 2, uniqueChoices: false },
          ballotProtocol: { ...PROTOCOL, maxCount: 4, maxValue: 1, maxTotalCost: 2 },
        },
        4
      )
    )
    expect(rule?.note).toBe('Mark 2 options. The 2 with the most votes are chosen.')
    expect(rule?.tag).toBe('2 of 4')
  })

  it('draws a ranking as rank boxes over every option', () => {
    const rule = questionRule(
      t,
      question({
        type: undefined,
        metadata: { type: { name: 'ranked' } },
        ballotProtocol: { ...PROTOCOL, maxCount: 3, maxValue: 2, uniqueValues: true },
      })
    )
    expect(rule).toEqual({
      mark: 'rank',
      note: 'The 3 options are put in order, from the most wanted to the least.',
      tag: 'Ranked voting',
    })
  })

  it('prints the points of a budget', () => {
    const rule = questionRule(
      t,
      question({ type: 'budget-based', ballotProtocol: { ...PROTOCOL, maxCount: 4, maxValue: 0, maxTotalCost: 10 } }, 4)
    )
    expect(rule).toEqual({
      mark: 'points',
      note: 'Each person shares out 10 points among the 4 options, as they like.',
      tag: '10 points per person',
    })
  })

  it('prints the credits of a quadratic vote', () => {
    const rule = questionRule(
      t,
      question(
        {
          type: 'quadratic',
          ballotProtocol: { ...PROTOCOL, maxCount: 4, maxValue: 0, maxTotalCost: 16, costExponent: 2 },
        },
        4
      )
    )
    expect(rule?.mark).toBe('points')
    expect(rule?.note).toMatch(/^Each person spends 16 credits across the 4 options\./)
    expect(rule?.tag).toBe('16 credits per person')
  })

  it('draws approval as checkboxes', () => {
    const rule = questionRule(
      t,
      question({ type: 'approval', ballotProtocol: { ...PROTOCOL, maxCount: 3, maxValue: 1, maxTotalCost: 3 } })
    )
    expect(rule?.mark).toBe('many')
    expect(rule?.note).toBe('Any number of options can be approved. The one approved most wins.')
  })

  it('has no rule for a legacy question whose type cannot be read', () => {
    expect(questionRule(t, question({ type: '', ballotProtocol: undefined }))).toBeNull()
  })
})

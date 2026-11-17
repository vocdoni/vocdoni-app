import type { BallotProtocol, VotingProcessQuestion } from '@vocdoni/api-types'
import i18n from 'i18next'
import { questionKind } from './question-kind'

const t = i18n.getFixedT('en')

const protocol = (overrides: Partial<BallotProtocol> = {}): BallotProtocol => ({
  maxCount: 1,
  maxValue: 3,
  maxVoteOverwrites: 0,
  costExponent: 1,
  uniqueValues: false,
  maxTotalCost: 0,
  costFromWeight: false,
  ...overrides,
})

const question = (extra: Partial<VotingProcessQuestion>) =>
  ({
    choices: ['A', 'B', 'C', 'D'].map((title, value) => ({ title: { default: title }, value })),
    ballotProtocol: protocol(),
    type: 'singlechoice',
    secretUntilTheEnd: false,
    ...extra,
  }) as VotingProcessQuestion

describe('questionKind', () => {
  it('names a single choice by its method alone', () => {
    expect(questionKind(t, question({}))).toBe('Single choice')
  })

  it('names a multiple choice', () => {
    const multiple = question({
      type: 'multichoice',
      ballotProtocol: protocol({ maxCount: 4, maxValue: 1, maxTotalCost: 2 }),
      typeSetup: { maxChoices: 2, minChoices: 0, uniqueChoices: false },
    })
    expect(questionKind(t, multiple)).toBe('Multiple choice')
  })

  it('names a ranking', () => {
    // A ranked question is created with no `type` (the backend rejects 'ranked'), only the declared name.
    const ranked = question({
      type: undefined,
      metadata: { type: { name: 'ranked' } },
      ballotProtocol: protocol({ maxCount: 4, maxValue: 3, uniqueValues: true }),
    })
    expect(questionKind(t, ranked)).toBe('Ranked voting')
  })

  it('says nothing for a question whose ballot cannot be read', () => {
    expect(
      questionKind(t, { ...question({}), type: '', ballotProtocol: undefined } as unknown as VotingProcessQuestion)
    ).toBeNull()
  })
})

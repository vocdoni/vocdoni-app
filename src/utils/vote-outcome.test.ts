import type { BallotProtocol, Choice, QuestionResults, VotingProcessQuestion } from '@vocdoni/api-types'
import { questionOutcome } from './vote-outcome'

const single = (n: number): BallotProtocol => ({
  maxCount: 1,
  maxValue: n - 1,
  maxVoteOverwrites: 0,
  costExponent: 1,
  uniqueValues: false,
  maxTotalCost: 0,
  costFromWeight: false,
})
const choices = (...titles: string[]): Choice[] => titles.map((title, value) => ({ title: { default: title }, value }))

const singleChoice = (titles: string[], extra: Partial<VotingProcessQuestion> = {}) =>
  ({
    choices: choices(...titles),
    ballotProtocol: single(titles.length),
    type: 'singlechoice',
    secretUntilTheEnd: false,
    ...extra,
  }) as VotingProcessQuestion

const multiChoice = (titles: string[]) =>
  ({
    choices: choices(...titles),
    ballotProtocol: { ...single(2), maxCount: titles.length, maxValue: 1, maxTotalCost: titles.length },
    type: 'multichoice',
    typeSetup: { maxChoices: titles.length, minChoices: 0, uniqueChoices: false },
    secretUntilTheEnd: false,
  }) as VotingProcessQuestion

const tally = (rows: string[][], extra: Partial<QuestionResults> = {}): QuestionResults => ({
  voteCount: 10,
  finalResults: true,
  results: rows,
  ...extra,
})

describe('questionOutcome', () => {
  it('says nothing without a tally, without votes or while encrypted', () => {
    const question = singleChoice(['Yes', 'No'])
    expect(questionOutcome(question, undefined)).toBeNull()
    expect(questionOutcome(question, tally([]))).toBeNull()
    expect(questionOutcome(question, tally([['0', '0']], { voteCount: 0 }))).toBeNull()
    expect(
      questionOutcome(
        singleChoice(['Yes', 'No'], { secretUntilTheEnd: true }),
        tally([['6', '4']], { finalResults: false })
      )
    ).toBeNull()
  })

  it('reads two choices on a plain census as "A to B"', () => {
    expect(questionOutcome(singleChoice(['Yes', 'No']), tally([['198', '7']]))).toMatchObject({
      kind: 'pair',
      winner: { value: 0 },
      winnerVotes: 198,
      otherVotes: 7,
    })
  })

  it('names the winner of three choices, and of two on a weighted census', () => {
    expect(questionOutcome(singleChoice(['A', 'B', 'C']), tally([['2', '6', '1']]))).toMatchObject({
      kind: 'winner',
      winner: { value: 1 },
      votes: 6,
      weighted: false,
    })
    expect(questionOutcome(singleChoice(['Yes', 'No']), tally([['30', '7']]), { weighted: true })).toMatchObject({
      kind: 'winner',
      weighted: true,
    })
  })

  it('reports a tie instead of a winner', () => {
    expect(questionOutcome(singleChoice(['Yes', 'No', 'Abstain']), tally([['4', '4', '2']]))).toEqual({ kind: 'tie' })
  })

  it('names the most voted choice of a multiple-choice question', () => {
    const question = multiChoice(['Ana', 'Biel', 'Carla'])
    expect(
      questionOutcome(
        question,
        tally([
          ['4', '6'],
          ['7', '3'],
          ['5', '5'],
        ])
      )
    ).toMatchObject({
      kind: 'top',
      choice: { value: 0 },
      votes: 6,
    })
  })

  it('says nothing for a question whose ballot type cannot be inferred', () => {
    const legacy = { choices: choices('Yes', 'No'), secretUntilTheEnd: false } as unknown as VotingProcessQuestion
    expect(questionOutcome(legacy, tally([['6', '4']]))).toBeNull()
  })
})

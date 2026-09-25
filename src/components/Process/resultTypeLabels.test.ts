import { BallotType } from '@vocdoni/ballot'
import legacyProcesses from './Dashboard/__fixtures__/legacy-processes.json'
import { inferQuestionBallotTypeOrUndefined } from './resultTypeLabels'

describe('inferQuestionBallotTypeOrUndefined', () => {
  const [uninferable, singleChoice] = legacyProcesses.processes

  it('returns undefined instead of throwing for a question with neither a type nor a protocol', () => {
    // prod projection of a legacy multiple-choice election: type '', no ballotProtocol, no metadata
    expect(inferQuestionBallotTypeOrUndefined(uninferable.questions[0])).toBeUndefined()
  })

  it('returns the inferred type otherwise', () => {
    expect(inferQuestionBallotTypeOrUndefined(singleChoice.questions[0])).toBe(BallotType.SingleChoice)
  })
})

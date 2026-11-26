import { screen } from '@testing-library/react'
import { render } from '~src/test-utils'
import { VoterFlowContext } from './flow-context'
import { testElection, testFacts, testFlow, testRoom } from './test-flow'
import { VoterView } from './VoterView'
import type { VoterScreen } from './voter-flow'

const election = testElection({
  initialStatus: 'PAUSED',
  questions: [1, 2, 3].map((n) => ({
    id: `q${n}`,
    title: { default: `Question ${n}` },
    description: { default: '' },
    choices: [{ title: { default: 'Yes' }, value: 0 }],
    type: 'singlechoice',
    status: 'ENDED',
  })),
})
const room = testRoom(['closed', 'closed', 'toOpen'])
const view = (screenValue: VoterScreen) => (
  <VoterFlowContext.Provider
    value={testFlow({
      screen: screenValue,
      moved: true,
      election,
      facts: testFacts({ room }),
    })}
  >
    <VoterView />
  </VoterFlowContext.Provider>
)

describe('VoterView, question by question', () => {
  it.each<[VoterScreen, VoterScreen]>([
    [
      { kind: 'roomMissed', index: 0 },
      { kind: 'roomMissed', index: 1 },
    ],
    [
      { kind: 'roomVoted', index: 0, record: 'recorded' },
      { kind: 'roomVoted', index: 1, record: 'recorded' },
    ],
  ])('moves the focus to the new heading when %o turns to another question (gate-3 F9)', (from, to) => {
    const { rerender } = render(view(from))
    const first = screen.getByRole('heading', { level: 1 })
    expect(first).toHaveFocus()
    // The voter moved on (the rail, a link); then the same frame comes back for the next question.
    first.blur()
    rerender(view(to))
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus()
  })
})

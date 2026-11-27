import { screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { renderWithFlow, testElection, testFlow } from '../test-flow'
import { QuestionBody } from './QuestionBody'

// The SDK's fields are not under test: only the help line over them.
vi.mock('@vocdoni/react-components', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@vocdoni/react-components')>()),
  ElectionQuestion: () => null,
  useQuestionsForm: () => ({ fmethods: useForm() }),
}))

const protocol = { maxVoteOverwrites: 0, costExponent: 1, maxTotalCost: 0, costFromWeight: false }
// A multiple-choice question of three options, chosen between `min` and `max` (dense: one field per option).
const multiple = (min: number, max: number) => ({
  id: 'q1',
  title: { default: 'Question 1' },
  description: { default: '' },
  choices: [0, 1, 2].map((value) => ({ title: { default: `Option ${value}` }, value })),
  type: 'multichoice',
  typeSetup: { maxChoices: max, minChoices: min, uniqueChoices: false },
  ballotProtocol: { ...protocol, maxCount: 3, maxValue: 1, uniqueValues: false, maxTotalCost: max },
  status: 'ONGOING',
})
// A pick-slot multiple choice whose protocol reserves abstain values: choosing nothing is a valid (blank) vote.
const blankable = {
  ...multiple(0, 2),
  typeSetup: { maxChoices: 2, minChoices: 0, uniqueChoices: false },
  ballotProtocol: { ...protocol, maxCount: 2, maxValue: 4, uniqueValues: true },
}
const helpFor = (question: ReturnType<typeof multiple>) => {
  const view = renderWithFlow(
    <QuestionBody index={0} />,
    testFlow({ election: testElection({ questions: [question] }) })
  )
  const text = screen.getByText(/voter\.question\.help_/).textContent
  view.unmount()
  return text
}
const helpOf = (min: number, max: number) => helpFor(multiple(min, max))

describe('QuestionBody help line: a multiple choice states both ends (owner ruling 2026-11-24)', () => {
  it('from one up: the range, so the voter knows one is the least', () => {
    expect(helpOf(1, 3)).toBe('voter.question.help_range')
    expect(helpOf(2, 3)).toBe('voter.question.help_range')
  })

  it('"up to" only when nothing at all is a valid answer (a blank vote)', () => {
    expect(helpFor(blankable)).toBe('voter.question.help_multiple')
  })

  it('exactly this many when both ends meet', () => {
    expect(helpOf(2, 2)).toBe('voter.question.help_exact')
  })
})

describe('QuestionBody in a set of several questions', () => {
  it('titles the question as an h2 with its own id, not as the screen heading', () => {
    renderWithFlow(
      <QuestionBody index={0} inSet />,
      testFlow({ election: testElection({ questions: [multiple(1, 2)] }) })
    )
    const title = screen.getByRole('heading', { level: 2, name: 'Question 1' })
    expect(title).toHaveAttribute('id', 'voter-question-0-title')
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull()
  })
})

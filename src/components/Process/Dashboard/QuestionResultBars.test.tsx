import { render, screen } from '~src/test-utils'
import { createQuestion, createQuestionResults } from '../VotingReportPdf/__fixtures__'
import { QuestionResultBars } from './QuestionResultBars'

const threeChoices = createQuestion({
  ballotProtocol: { ...createQuestion().ballotProtocol, maxValue: 2 },
  choices: [
    { title: { default: 'For' }, value: 0 },
    { title: { default: 'Against' }, value: 1 },
    { title: { default: 'Abstention' }, value: 2 },
  ],
})
const tally = createQuestionResults({ voteCount: 20, results: [['14', '4', '2']] })

describe('QuestionResultBars', () => {
  it('lists every choice with its votes and its share of the question votes', () => {
    render(<QuestionResultBars question={threeChoices} results={tally} final />)
    expect(screen.getAllByRole('progressbar')).toHaveLength(3)
    expect(screen.getByText('For')).toBeInTheDocument()
    expect(screen.getByText('Abstention')).toBeInTheDocument()
    expect(screen.getByText('14')).toBeInTheDocument()
    expect(screen.getByText('70%')).toBeInTheDocument()
    expect(screen.getByText('10%')).toBeInTheDocument()
  })

  it('marks the winner of a final tally only', () => {
    const { rerender } = render(<QuestionResultBars question={threeChoices} results={tally} final />)
    expect(screen.getByRole('img', { name: 'Winning choice' })).toBeInTheDocument()
    expect(screen.getByText('Winner')).toBeInTheDocument()
    rerender(<QuestionResultBars question={threeChoices} results={{ ...tally, finalResults: false }} />)
    expect(screen.queryByRole('img', { name: 'Winning choice' })).not.toBeInTheDocument()
    expect(screen.queryByText('Winner')).not.toBeInTheDocument()
  })

  it('marks no winner on a tie', () => {
    render(
      <QuestionResultBars
        question={threeChoices}
        results={createQuestionResults({ voteCount: 10, results: [['5', '5', '0']] })}
        final
      />
    )
    expect(screen.queryByRole('img', { name: 'Winning choice' })).not.toBeInTheDocument()
  })

  it('renders nothing without a tally', () => {
    render(<QuestionResultBars question={threeChoices} results={undefined} final />)
    expect(screen.queryAllByRole('progressbar')).toHaveLength(0)
  })
})

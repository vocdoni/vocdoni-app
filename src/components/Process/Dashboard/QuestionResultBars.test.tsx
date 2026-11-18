import type { VotingProcessQuestion } from '@vocdoni/api-types'
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

// Borda points per option: 2 for a first place, 1 for a second (Roof 16, Heating 9, Ramp 5 of 30).
const ranked = createQuestion({
  type: undefined,
  metadata: { type: { name: 'ranked' } },
  ballotProtocol: { ...createQuestion().ballotProtocol, maxCount: 3, maxValue: 2, uniqueValues: true },
  choices: [
    { title: { default: 'Roof' }, value: 0 },
    { title: { default: 'Heating' }, value: 1 },
    { title: { default: 'Ramp' }, value: 2 },
  ],
} as Partial<VotingProcessQuestion>)
const rankedTally = createQuestionResults({
  voteCount: 10,
  results: [
    ['1', '2', '7'],
    ['3', '5', '2'],
    ['6', '3', '1'],
  ],
})

const ranges = () => Array.from(document.querySelectorAll('[data-part="range"]'))
// The winner's row of a final tally is marked, whatever the look sets it apart with.
const leads = (choice: string) => !!screen.getByText(choice).closest('[data-leading]')
const anyLeader = () => !!document.querySelector('[data-leading]')

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

  // Owner ruling 2026-11-18: three people picked up to two of three, five choices in all; shares are of the five.
  it('takes a multiple-choice share of all the choices made, so the shares add up to 100%', () => {
    const multiple = createQuestion({
      type: 'multichoice',
      ballotProtocol: { ...createQuestion().ballotProtocol, maxCount: 2, maxValue: 2, uniqueValues: true },
      choices: [
        { title: { default: 'Laia' }, value: 0 },
        { title: { default: 'Oriol' }, value: 1 },
        { title: { default: 'Núria' }, value: 2 },
      ],
    } as Partial<VotingProcessQuestion>)
    const results = createQuestionResults({
      voteCount: 3,
      results: [
        ['2', '1', '0'],
        ['0', '1', '1'],
      ],
    })
    render(<QuestionResultBars question={multiple} results={results} />)
    expect(screen.getAllByText('40%')).toHaveLength(2)
    expect(screen.getByText('20%')).toBeInTheDocument()
    // Beside each choice, the share of the three people who answered that picked it.
    expect(screen.getAllByText('67% of people')).toHaveLength(2)
    expect(screen.getByText('33% of people')).toBeInTheDocument()
  })

  it('gives no share of people where each person makes one choice', () => {
    render(<QuestionResultBars question={threeChoices} results={tally} final />)
    expect(screen.queryByText(/of people/)).not.toBeInTheDocument()
  })

  it('sets the winner of a final tally in bold (from `lg`) and dims the others, with no check and no tag', () => {
    const { rerender } = render(<QuestionResultBars question={threeChoices} results={tally} final />)
    expect(leads('For')).toBe(true)
    expect(leads('Against')).toBe(false)
    expect(ranges().map((range) => getComputedStyle(range).opacity.includes('outvoted'))).toEqual([false, true, true])
    expect(screen.queryByRole('img', { name: 'Winning choice' })).not.toBeInTheDocument()
    expect(screen.queryByText('Winner')).not.toBeInTheDocument()
    rerender(<QuestionResultBars question={threeChoices} results={tally} />)
    expect(anyLeader()).toBe(false)
  })

  it('marks no winner on a tie', () => {
    render(
      <QuestionResultBars
        question={threeChoices}
        results={createQuestionResults({ voteCount: 10, results: [['5', '5', '0']] })}
        final
      />
    )
    expect(anyLeader()).toBe(false)
  })

  it('renders nothing without a tally', () => {
    render(<QuestionResultBars question={threeChoices} results={undefined} final />)
    expect(screen.queryAllByRole('progressbar')).toHaveLength(0)
  })

  describe('the plain layout', () => {
    it('sets no choice apart on a tie, as the indented one', () => {
      render(
        <QuestionResultBars
          question={threeChoices}
          results={createQuestionResults({ voteCount: 10, results: [['5', '5', '0']] })}
          final
          layout='plain'
        />
      )
      expect(anyLeader()).toBe(false)
      expect(ranges().some((range) => getComputedStyle(range).opacity.includes('outvoted'))).toBe(false)
    })

    it('labels a weighted tally as weighted votes, as the CSV counts weight', () => {
      render(<QuestionResultBars question={threeChoices} results={tally} weighted layout='plain' />)
      expect(screen.getByRole('progressbar', { name: 'For, 14 weighted votes, 70%' })).toBeInTheDocument()
    })

    it('never rounds a partial share to 0%', () => {
      render(
        <QuestionResultBars
          question={threeChoices}
          results={createQuestionResults({ voteCount: 400, results: [['399', '1', '0']] })}
          layout='plain'
        />
      )
      expect(screen.getByRole('progressbar', { name: 'Against, 1 vote, 1%' })).toBeInTheDocument()
    })

    it('gives each count its unit and its share of the question votes, with no check and no tag', () => {
      render(<QuestionResultBars question={threeChoices} results={tally} final layout='plain' />)
      expect(screen.getByRole('progressbar', { name: 'For, 14 votes, 70%' })).toBeInTheDocument()
      expect(screen.getByRole('progressbar', { name: 'Against, 4 votes, 20%' })).toBeInTheDocument()
      expect(screen.queryByRole('img', { name: 'Winning choice' })).not.toBeInTheDocument()
      expect(screen.queryByText('Winner')).not.toBeInTheDocument()
    })

    it('counts points on a ranking, as a share of all the points', () => {
      render(<QuestionResultBars question={ranked} results={rankedTally} layout='plain' />)
      expect(screen.getByRole('progressbar', { name: 'Roof, 16 points, 53%' })).toBeInTheDocument()
      expect(screen.getByRole('progressbar', { name: 'Ramp, 5 points, 17%' })).toBeInTheDocument()
    })

    it('weighs the top choice of a final tally (from `lg`) and dims the other bars, and nothing while it runs', () => {
      const { rerender } = render(<QuestionResultBars question={threeChoices} results={tally} final layout='plain' />)
      expect(leads('For')).toBe(true)
      expect(leads('Against')).toBe(false)
      expect(ranges().map((range) => getComputedStyle(range).opacity.includes('outvoted'))).toEqual([false, true, true])

      rerender(<QuestionResultBars question={threeChoices} results={tally} layout='plain' />)
      expect(anyLeader()).toBe(false)
      expect(ranges().some((range) => getComputedStyle(range).opacity.includes('outvoted'))).toBe(false)
    })
  })
})

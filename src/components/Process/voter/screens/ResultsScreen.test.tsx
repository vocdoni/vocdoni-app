import { fireEvent, screen, within } from '@testing-library/react'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import { VoterFlowContext, type VoterFlow } from '../flow-context'
import { renderWithFlow, testElection, testFacts, testFlow } from '../test-flow'
import { initialVoterState, type ResultsState } from '../voter-flow'
import { ResultsScreen } from './ResultsScreen'

const PROTOCOL = {
  maxCount: 1,
  maxValue: 1,
  maxVoteOverwrites: 0,
  costExponent: 1,
  uniqueValues: false,
  maxTotalCost: 0,
  costFromWeight: false,
}

/** Two single-choice questions with a tally: 6 and 3 of 9 voters each, in a census of 12. */
const tallied = ({
  results = [['6', '3']],
  voteCount = 9,
  finalResults = false,
  secret = false,
}: { results?: string[][]; voteCount?: number; finalResults?: boolean; secret?: boolean } = {}) =>
  testElection({
    questions: [1, 2].map((n) => ({
      id: `q${n}`,
      title: { default: `Question ${n}` },
      description: { default: '' },
      choices: [
        { title: { default: `Yes ${n}` }, value: 0 },
        { title: { default: `No ${n}` }, value: 1 },
      ],
      type: 'singlechoice',
      typeSetup: { maxChoices: 1, minChoices: 1, uniqueChoices: false },
      ballotProtocol: PROTOCOL,
      secretUntilTheEnd: secret,
      status: 'ONGOING',
      results: { voteCount, maxVoters: 12, finalResults, results },
    })),
  }) as VotingProcessResponse

const show = (state: ResultsState, over: Partial<VoterFlow> = {}) => {
  const flow = testFlow({ screen: { kind: 'results', state }, ...over })
  renderWithFlow(<ResultsScreen state={state} />, flow)
  return flow
}
const title = () => screen.getByRole('heading', { level: 1 })
const leading = () => document.querySelector('[data-leading]')

describe('ResultsScreen', () => {
  it('provisional (board M10): the live line, the count, a bar per choice and nothing set apart', () => {
    const flow = show('provisional', { election: tallied(), facts: testFacts({ connected: false }) })
    expect(screen.getByTestId('voter-screen')).toHaveAttribute('data-screen', 'results')
    expect(title()).toHaveTextContent('voter.results.provisional_title')
    expect(screen.getByText('voter.status.open_until')).toBeInTheDocument()
    expect(screen.getByTestId('process-vote-count')).toHaveTextContent('voter.results.turnout')
    expect(screen.getByText(/voter\.results\.provisional_note/)).toBeInTheDocument()
    expect(screen.getAllByRole('progressbar')).toHaveLength(4)
    expect(leading()).toBeNull()
    expect(screen.queryByRole('button', { name: 'voter.results.check_vote' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'voter.back' }))
    expect(flow.showResults).toHaveBeenCalledWith(false)
  })

  it('final (board M11): the closed line, the share of the census, the leading choice set apart and never named', () => {
    show('final', { election: tallied({ finalResults: true }), facts: testFacts({ status: 'RESULTS' }) })
    expect(title()).toHaveTextContent('voter.results.final_title')
    expect(screen.getByText('voter.results.closed_on')).toBeInTheDocument()
    expect(screen.getByTestId('process-vote-count')).toHaveTextContent('voter.results.turnout_share')
    expect(screen.getByText('Yes 1').closest('[data-leading]')).not.toBeNull()
    expect(screen.getByText('No 1').closest('[data-leading]')).toBeNull()
    expect(screen.queryByText(/winner|guanya/i)).toBeNull()
    // A connected voter has identified already: no "Comprova el teu vot".
    expect(screen.queryByRole('button', { name: 'voter.results.check_vote' })).toBeNull()
  })

  it('final, for a visitor: "Comprova el teu vot" leads to identification', () => {
    const flow = show('final', {
      election: tallied({ finalResults: true }),
      facts: testFacts({ status: 'RESULTS', connected: false }),
    })
    fireEvent.click(screen.getByRole('button', { name: 'voter.results.check_vote' }))
    expect(flow.checkReceipt).toHaveBeenCalled()
  })

  it('counting, secret until the end (board 10c): the closed line, the help without "final", each question not counted', () => {
    show('final', {
      election: tallied({ secret: true, results: [] }),
      facts: testFacts({ status: 'ENDED', connected: false, secretUntilTheEnd: true }),
    })
    expect(title()).toHaveTextContent('voter.results.counting_title')
    expect(screen.getByText('voter.results.closed_on')).toBeInTheDocument()
    expect(screen.getByText(/voter\.results\.counting_help_secret/)).toBeInTheDocument()
    expect(screen.queryByText('voter.results.counting_last')).toBeNull()
    expect(screen.queryAllByRole('progressbar')).toHaveLength(0)
    expect(screen.queryByText('voter.results.kind_single')).toBeNull()
    for (const name of ['Question 1', 'Question 2']) {
      expect(within(screen.getByRole('region', { name })).getByText('voter.results.not_counted')).toBeInTheDocument()
    }
  })

  it('counting, public (board 10b): the final-results help, the "may still change" line, the last figures with nothing set apart', () => {
    show('final', { election: tallied(), facts: testFacts({ status: 'ENDED' }) })
    expect(screen.getByText('voter.results.closed_on')).toBeInTheDocument()
    expect(title()).toHaveTextContent('voter.results.counting_title')
    expect(screen.getByText('voter.results.counting_help')).toBeInTheDocument()
    expect(screen.getByText('voter.results.counting_last')).toBeInTheDocument()
    expect(screen.getAllByRole('progressbar')).toHaveLength(4)
    expect(leading()).toBeNull()
    expect(screen.queryByText('voter.results.not_counted')).toBeNull()
  })

  it('counting, public with no votes: "no votes yet", not the secret "not counted", and the public help', () => {
    show('final', { election: tallied({ voteCount: 0, results: [] }), facts: testFacts({ status: 'ENDED' }) })
    expect(screen.getAllByText('voter.results.no_votes')).toHaveLength(2)
    expect(screen.queryByText('voter.results.not_counted')).toBeNull()
    expect(screen.getByText('voter.results.counting_help')).toBeInTheDocument()
    expect(screen.getByText('voter.results.counting_last')).toBeInTheDocument()
    expect(screen.getAllByText('voter.results.kind_single')).toHaveLength(2)
  })

  it('says a question has no votes yet instead of drawing empty bars', () => {
    show('provisional', { election: tallied({ voteCount: 0, results: [] }) })
    expect(screen.getAllByText('voter.results.no_votes')).toHaveLength(2)
  })

  it('hides the count when the deployment hides counts', () => {
    const flow = testFlow({ screen: { kind: 'results', state: 'provisional' }, election: tallied() })
    renderWithFlow(<ResultsScreen state='provisional' />, flow, { appEnv: { HIDE_VOTER_COUNT: true } })
    expect(screen.queryByTestId('process-vote-count')).toBeNull()
  })

  it('hidden (board M9): when the results come, "Ja has votat" for a voter who voted, no figure and no count', () => {
    show('hidden', {
      election: tallied({ secret: true, results: [] }),
      facts: testFacts({ secretUntilTheEnd: true, hasVoted: true }),
    })
    expect(title()).toHaveTextContent('Assemblea General')
    expect(screen.getByText('voter.status.open_until')).toBeInTheDocument()
    expect(screen.getByText('voter.results.hidden_help')).toBeInTheDocument()
    expect(screen.getByText('voter.voted.title')).toBeInTheDocument()
    expect(screen.getByText('voter.results.hidden_card_body')).toBeInTheDocument()
    expect(screen.queryAllByRole('progressbar')).toHaveLength(0)
    expect(screen.queryByTestId('process-vote-count')).toBeNull()
  })

  it('hidden: a vote cast in this session counts as voted; a visitor who did not vote gets no card', () => {
    const election = tallied({ secret: true, results: [] })
    const { unmount } = renderWithFlow(
      <ResultsScreen state='hidden' />,
      testFlow({
        election,
        facts: testFacts({ secretUntilTheEnd: true }),
        state: { ...initialVoterState, castDone: true },
      })
    )
    expect(screen.getByText('voter.voted.title')).toBeInTheDocument()
    unmount()
    show('hidden', { election, facts: testFacts({ secretUntilTheEnd: true, connected: false }) })
    expect(screen.queryByText('voter.voted.title')).toBeNull()
  })

  it('keeps the headings in order and names how each question is answered', () => {
    show('provisional', { election: tallied() })
    expect(screen.getAllByRole('heading').map((heading) => heading.tagName)).toEqual(['H1', 'H2', 'H2'])
    expect(screen.getAllByText('voter.results.kind_single')).toHaveLength(2)
  })

  it('names each question block and gives each bar its share, as the organiser side does', () => {
    show('provisional', { election: tallied() })
    const block = screen.getByRole('region', { name: 'Question 1' })
    expect(within(block).getAllByRole('progressbar')[0]).toHaveAttribute('aria-valuenow', '67')
  })

  it('announces a change of state in place: one polite region whose text changes, with no remount', () => {
    const flow = testFlow({
      screen: { kind: 'results', state: 'provisional' },
      election: tallied(),
      facts: testFacts({ status: 'ONGOING' }),
    })
    // The flow and the state change under one stable tree: wrapping the rerender in another provider would remount.
    let current = { flow, state: 'provisional' as ResultsState }
    const Screen = () => (
      <VoterFlowContext.Provider value={current.flow}>
        <ResultsScreen state={current.state} />
      </VoterFlowContext.Provider>
    )
    const { rerender } = renderWithFlow(<Screen />, flow)
    const region = title().closest('[aria-live]') as HTMLElement
    expect(region).toHaveAttribute('aria-live', 'polite')
    const heading = title()
    expect(region).toHaveTextContent('voter.results.provisional_title')
    // The turnout changes on every poll: it stays out of the region.
    expect(region).not.toContainElement(screen.queryByTestId('process-vote-count'))
    const ended = testFlow({
      screen: { kind: 'results', state: 'final' },
      election: tallied(),
      facts: testFacts({ status: 'ENDED' }),
    })
    current = { flow: ended, state: 'final' }
    rerender(<Screen />)
    expect(title()).toBe(heading)
    expect(title().closest('[aria-live]')).toBe(region)
    expect(region).toHaveTextContent('voter.results.counting_title')
    expect(region).not.toHaveTextContent('voter.results.provisional_title')
  })
})

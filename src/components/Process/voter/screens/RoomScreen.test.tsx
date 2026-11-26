import { screen, within } from '@testing-library/react'
import type { QuestionStatus } from '@vocdoni/api-types'
import { render } from '~src/test-utils'
import { VoterFlowContext } from '../flow-context'
import { renderWithFlow, testElection, testFacts, testFlow } from '../test-flow'
import { RoomScreen } from './RoomScreen'

// A question-by-question vote: its questions in the given statuses, in order.
const qbq = (statuses: QuestionStatus[]) =>
  testElection({
    initialStatus: 'PAUSED',
    description: { default: 'The autumn assembly.' },
    questions: statuses.map((status, index) => ({
      id: `q${index + 1}`,
      title: { default: `Question ${index + 1}` },
      description: { default: '' },
      choices: [{ title: { default: 'Yes' }, value: 0 }],
      type: 'singlechoice',
      status,
      results: { voteCount: status === 'RESULTS' ? 20 : 0, maxVoters: 312 },
    })),
  })

const roomFlow = (statuses: QuestionStatus[]) =>
  testFlow({
    screen: { kind: 'room' },
    election: qbq(statuses),
    facts: testFacts({ questionByQuestion: true, connected: false, questionCount: statuses.length }),
  })

const rows = () => within(screen.getByRole('list', { name: 'voter.agenda' })).getAllByRole('listitem')

describe('room screen (a question-by-question vote, read only)', () => {
  it('none open: says so, that it updates by itself, and names the next question', () => {
    renderWithFlow(<RoomScreen />, roomFlow(['RESULTS', 'RESULTS', 'RESULTS', 'PAUSED']))
    expect(screen.getByTestId('voter-screen')).toHaveAttribute('data-screen', 'room')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Assemblea General')
    expect(screen.getByText('The autumn assembly.')).toBeInTheDocument()
    expect(screen.getByText('voter.room.live')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'voter.room.none_title' })).toBeInTheDocument()
    expect(screen.getByText('voter.room.none_body')).toBeInTheDocument()
    expect(rows().map((row) => row.textContent)).toEqual([
      '1Question 1voter.room.state.closed',
      '2Question 2voter.room.state.closed',
      '3Question 3voter.room.state.closed',
      '4Question 4voter.room.state.waiting',
    ])
    // "La següent": the first question still to open.
    const next = within(screen.getByRole('list', { name: 'voter.room.next' }))
    expect(next.getByText('Question 4')).toBeInTheDocument()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('none opened yet: every question reads not opened yet', () => {
    renderWithFlow(<RoomScreen />, roomFlow(['PAUSED', 'PAUSED']))
    expect(rows().map((row) => row.textContent)).toEqual([
      '1Question 1voter.room.state.waiting',
      '2Question 2voter.room.state.waiting',
    ])
    // The backend reports every unopened question as paused: the vote has not started, it is not paused.
    expect(screen.getByText('voter.room.not_started_line')).toBeInTheDocument()
    expect(screen.queryByText('voter.status.paused')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'voter.room.not_started_title' })).toBeInTheDocument()
    expect(screen.getByText('voter.room.not_started_body')).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'voter.room.next' })).not.toBeInTheDocument()
  })

  it('every question closed: no next question to name', () => {
    renderWithFlow(<RoomScreen />, roomFlow(['RESULTS', 'RESULTS']))
    expect(screen.getByText('voter.room.none_title')).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'voter.room.next' })).toBeNull()
  })

  it('one open: marks it, says it cannot be voted from here yet, and has no button', () => {
    renderWithFlow(<RoomScreen />, roomFlow(['RESULTS', 'RESULTS', 'ONGOING', 'PAUSED']))
    const card = screen.getByTestId('voter-room-open')
    expect(card).toHaveTextContent('voter.room.open_label')
    expect(card).toHaveTextContent('Question 3')
    expect(card).toHaveTextContent('voter.room.not_votable')
    expect(screen.queryByTestId('voter-room-none')).toBeNull()
    expect(screen.queryByRole('button')).toBeNull()
    expect(rows()[2]).toHaveTextContent('voter.room.state.open')
    expect(rows()[3]).toHaveTextContent('voter.room.state.waiting')
  })

  it('follows the process read: a question that opens, then closes, changes the room with no reload', () => {
    const inFlow = (statuses: QuestionStatus[]) => (
      <VoterFlowContext.Provider value={roomFlow(statuses)}>
        <RoomScreen />
      </VoterFlowContext.Provider>
    )
    const { rerender } = render(inFlow(['RESULTS', 'PAUSED', 'PAUSED']))
    expect(screen.getByTestId('voter-room-none')).toBeInTheDocument()
    expect(rows()[1]).toHaveTextContent('voter.room.state.waiting')

    rerender(inFlow(['RESULTS', 'ONGOING', 'PAUSED']))
    expect(screen.queryByTestId('voter-room-none')).toBeNull()
    expect(screen.getByTestId('voter-room-open')).toHaveTextContent('Question 2')
    expect(rows()[1]).toHaveTextContent('voter.room.state.open')

    rerender(inFlow(['RESULTS', 'RESULTS', 'PAUSED']))
    expect(screen.queryByTestId('voter-room-open')).toBeNull()
    expect(rows()[1]).toHaveTextContent('voter.room.state.closed')
    expect(within(screen.getByRole('list', { name: 'voter.room.next' })).getByText('Question 3')).toBeInTheDocument()
  })

  it('a paused vote says so instead of "live"', () => {
    // A question that was open (it holds votes) and is paused now: nobody can vote, so the vote is paused.
    const flow = roomFlow(['RESULTS', 'PAUSED'])
    const held = { ...flow.election.questions[1], results: { voteCount: 5, maxVoters: 312 } }
    const election = { ...flow.election, questions: [flow.election.questions[0], held] }
    renderWithFlow(<RoomScreen />, { ...flow, election, facts: { ...flow.facts, status: 'PAUSED' } })
    expect(screen.getByText('voter.status.paused')).toBeInTheDocument()
    expect(screen.queryByText('voter.room.live')).toBeNull()
  })
})

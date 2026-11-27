import { fireEvent, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { renderWithFlow, testElection, testFacts, testFlow, testRoom } from '../test-flow'
import { initialVoterState } from '../voter-flow'
import { RoomSetScreen } from './RoomSetScreen'

vi.mock('../parts/QuestionBody', () => ({
  QuestionBody: ({ index, kicker, helpId }: { index: number; kicker?: ReactNode; helpId?: string }) => (
    <div>
      {kicker}
      <h2>Question {index + 1}</h2>
      <div id={helpId}>voter.question.help_single</div>
    </div>
  ),
}))

const threeQuestions = testElection({
  questions: [1, 2, 3].map((n) => ({
    id: `q${n}`,
    title: { default: `Question ${n}` },
    description: { default: '' },
    choices: [
      { title: { default: `Yes ${n}` }, value: 0 },
      { title: { default: `No ${n}` }, value: 1 },
    ],
    type: 'singlechoice',
    status: 'ONGOING',
  })),
})

const flowWith = (over: Parameters<typeof testFlow>[0] = {}) =>
  testFlow({
    screen: { kind: 'roomSet', set: [1, 2], paused: false },
    election: threeQuestions,
    facts: testFacts({
      room: testRoom([['closed', 'recorded'], 'open', 'open']),
      answered: [true, true, true],
    }),
    ...over,
  })
const chosen = { ...initialVoterState, answers: { '1': '0', '2': '1' } }

describe('the open set on one screen (roomSet)', () => {
  it('shows every question of the set under one heading, with its place and the skip of the set', () => {
    renderWithFlow(<RoomSetScreen set={[1, 2]} paused={false} />, flowWith({ state: chosen }))
    expect(screen.getByTestId('voter-screen')).toHaveAttribute('data-screen', 'roomSet')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('voter.room.open_title_set')
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 2, name: 'Question 2' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Question 3' })).toBeInTheDocument()
    expect(screen.getAllByText('voter.room.open_label')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'voter.room.skip_set' })).toBeInTheDocument()
  })

  it('keeps the cast off until every question is answered, and points at the ones still to answer', () => {
    const flow = flowWith({
      state: { ...initialVoterState, answers: { '1': '0' } },
      facts: testFacts({
        room: testRoom([['closed', 'recorded'], 'open', 'open']),
        answered: [true, true, false],
      }),
    })
    renderWithFlow(<RoomSetScreen set={[1, 2]} paused={false} />, flow)
    const cast = screen.getByTestId('voter-cast')
    expect(cast).toHaveAttribute('aria-disabled', 'true')
    const described = document.getElementById(cast.getAttribute('aria-describedby') ?? '')
    expect(described?.textContent).toBe('voter.question.help_single')
    expect(cast.getAttribute('aria-describedby')).toMatch(/-help-2$/)
    fireEvent.click(cast)
    expect(flow.castQuestion).not.toHaveBeenCalled()
  })

  it('casts the whole set once, from its first question, after the arming moment', async () => {
    const flow = flowWith({ state: chosen })
    renderWithFlow(<RoomSetScreen set={[1, 2]} paused={false} />, flow)
    await waitFor(() => expect(screen.getByTestId('voter-cast')).not.toHaveAttribute('aria-disabled'))
    fireEvent.click(screen.getByTestId('voter-cast'))
    expect(flow.castQuestion).toHaveBeenCalledTimes(1)
    expect(flow.castQuestion).toHaveBeenCalledWith(1)
  })

  it('skips the set, and parks it back to the room', () => {
    const flow = flowWith({ state: chosen })
    renderWithFlow(<RoomSetScreen set={[1, 2]} paused={false} />, flow)
    fireEvent.click(screen.getByRole('button', { name: 'voter.room.skip_set' }))
    expect(flow.skip).toHaveBeenCalledWith(1)
    fireEvent.click(screen.getByRole('button', { name: 'voter.back' }))
    expect(flow.park).toHaveBeenCalledWith(1)
  })

  it('paused: the notice on top, the cast off, the note says so', () => {
    renderWithFlow(<RoomSetScreen set={[1, 2]} paused />, flowWith({ state: chosen }))
    expect(screen.getByRole('status')).toHaveTextContent('voter.paused.notice_title')
    expect(screen.getByTestId('voter-cast')).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByText('voter.status.paused')).toBeInTheDocument()
  })

  it('shows a failed cast of this set once, with "Torna-ho a provar"', () => {
    const failed = { ...chosen, castError: 'errors.vote_no_open_question', castQuestionId: 'q3' }
    const { unmount } = renderWithFlow(<RoomSetScreen set={[1, 2]} paused={false} />, flowWith({ state: failed }))
    expect(screen.getAllByRole('alert')).toHaveLength(1)
    expect(screen.getByRole('alert')).toHaveTextContent('errors.vote_no_open_question')
    expect(screen.getByTestId('voter-cast')).toHaveTextContent('voter.review.retry')
    unmount()
    renderWithFlow(
      <RoomSetScreen set={[1, 2]} paused={false} />,
      flowWith({ state: { ...failed, castQuestionId: 'q1' } })
    )
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('a cast whose outcome is unknown: the warning that it may have been recorded', () => {
    const unknown = { ...chosen, castError: 'errors.vote_unconfirmed', castQuestionId: 'q3', castUnconfirmed: true }
    renderWithFlow(<RoomSetScreen set={[1, 2]} paused={false} />, flowWith({ state: unknown }))
    expect(screen.getByRole('alert')).toHaveTextContent('voter.room.unconfirmed_title')
  })

  it('puts the weight in the note on a weighted census', () => {
    renderWithFlow(
      <RoomSetScreen set={[1, 2]} paused={false} />,
      flowWith({ weighted: true, weight: 3, state: chosen })
    )
    expect(screen.getByText('voter.room.note_weighted')).toBeInTheDocument()
  })

  it('offers no skip when every question of the set is locked', () => {
    const locked = flowWith({
      state: chosen,
      lockedNotice: (id) => (id === 'q2' || id === 'q3' ? 'vote.pending_resend' : undefined),
    })
    renderWithFlow(<RoomSetScreen set={[1, 2]} paused={false} />, locked)
    expect(screen.queryByRole('button', { name: 'voter.room.skip_set' })).toBeNull()
  })
})

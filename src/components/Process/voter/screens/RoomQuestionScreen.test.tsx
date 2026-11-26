import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { renderWithFlow, testElection, testFacts, testFlow, testRoom } from '../test-flow'
import { initialVoterState } from '../voter-flow'
import { RoomQuestionScreen } from './RoomQuestionScreen'

vi.mock('../parts/QuestionBody', () => ({
  QuestionBody: ({ index, kicker, helpId }: { index: number; kicker?: ReactNode; helpId?: string }) => (
    <div>
      {kicker}
      <h1>Question {index + 1}</h1>
      <div id={helpId}>voter.question.help_single</div>
    </div>
  ),
}))

const flowWith = (over: Parameters<typeof testFlow>[0] = {}) =>
  testFlow({
    screen: { kind: 'roomQuestion', index: 1, paused: false },
    election: testElection({ initialStatus: 'PAUSED' }),
    facts: testFacts({
      room: testRoom([['closed', 'recorded'], 'open']),
      answered: [true, false],
    }),
    ...over,
  })
const chosen = { ...initialVoterState, answers: { '1': '0' } }

describe('frame 2: voting the open question (board V4VoterWideLive 2)', () => {
  it('kicks with the question place, keeps the cast off until something is chosen, and offers the skip', () => {
    const flow = flowWith()
    renderWithFlow(<RoomQuestionScreen index={1} paused={false} />, flow)
    expect(screen.getByTestId('voter-screen')).toHaveAttribute('data-screen', 'roomQuestion')
    expect(screen.getByText('voter.room.open_label')).toBeInTheDocument()
    expect(screen.getByTestId('voter-cast')).toHaveAttribute('aria-disabled', 'true')
    expect(screen.queryByText(/voter\.room\.will_vote/)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'voter.room.skip' }))
    expect(flow.skip).toHaveBeenCalledWith(1)
    expect(flow.castQuestion).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'voter.back' }))
    expect(flow.park).toHaveBeenCalledWith(1)
    expect(screen.getByText('voter.review.note')).toBeInTheDocument()
  })

  it('says what will be sent and casts that question once, after the arming moment (gate F1)', async () => {
    const flow = flowWith({
      state: chosen,
      facts: testFacts({ room: testRoom([['closed', 'recorded'], 'open']), answered: [true, true] }),
    })
    renderWithFlow(<RoomQuestionScreen index={1} paused={false} />, flow)
    expect(screen.getByText(/voter\.room\.will_vote/)).toBeInTheDocument()
    // Until armed it is the unavailable look, never a third grey: the same `off` button, aria-disabled.
    expect(screen.getByTestId('voter-cast')).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(screen.getByTestId('voter-cast'))
    expect(flow.castQuestion).not.toHaveBeenCalled()
    await waitFor(() => expect(screen.getByTestId('voter-cast')).not.toHaveAttribute('aria-disabled'))
    fireEvent.click(screen.getByTestId('voter-cast'))
    expect(flow.castQuestion).toHaveBeenCalledWith(1)
  })

  it('puts the weight in the note on a weighted census (board V4VoterWideMore 6)', () => {
    renderWithFlow(<RoomQuestionScreen index={1} paused={false} />, flowWith({ weighted: true, weight: 3 }))
    expect(screen.getByText('voter.room.note_weighted')).toBeInTheDocument()
  })

  it('paused: the notice on top, the cast off, the note says so (board V4VoterWideMore 2)', () => {
    renderWithFlow(<RoomQuestionScreen index={1} paused />, flowWith({ state: chosen }))
    expect(screen.getByRole('status')).toHaveTextContent('voter.paused.notice_title')
    expect(screen.getByTestId('voter-cast')).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByText('voter.status.paused')).toBeInTheDocument()
  })

  it('shows a failed cast of this question only, with "Torna-ho a provar"', () => {
    const failed = { ...chosen, castError: 'errors.vote_no_open_question', castQuestionId: 'q2' }
    const { unmount } = renderWithFlow(<RoomQuestionScreen index={1} paused={false} />, flowWith({ state: failed }))
    expect(screen.getByRole('alert')).toHaveTextContent('errors.vote_no_open_question')
    expect(screen.getByTestId('voter-cast')).toHaveTextContent('voter.review.retry')
    unmount()
    renderWithFlow(
      <RoomQuestionScreen index={1} paused={false} />,
      flowWith({ state: { ...failed, castQuestionId: 'q1' } })
    )
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('a cast whose outcome is unknown: a warning that it may have been recorded, with the check and the retry', () => {
    const unknown = { ...chosen, castError: 'errors.vote_unconfirmed', castQuestionId: 'q2', castUnconfirmed: true }
    const flow = flowWith({ state: unknown })
    renderWithFlow(<RoomQuestionScreen index={1} paused={false} />, flow)
    expect(screen.getByRole('alert')).toHaveTextContent('voter.room.unconfirmed_title')
    expect(screen.getByRole('alert')).toHaveTextContent('voter.room.unconfirmed_help')
    fireEvent.click(screen.getByRole('button', { name: 'voter.results.check_vote' }))
    expect(flow.recheck).toHaveBeenCalled()
    expect(screen.getByTestId('voter-cast')).toHaveTextContent('voter.review.retry')
  })

  it('describes the off cast by its reason: how to answer, or the pause (gate-3 F8)', () => {
    const described = () => {
      const id = screen.getByTestId('voter-cast').getAttribute('aria-describedby')
      return id ? document.getElementById(id)?.textContent : null
    }
    const { unmount } = renderWithFlow(<RoomQuestionScreen index={1} paused={false} />, flowWith())
    expect(described()).toBe('voter.question.help_single')
    unmount()
    renderWithFlow(<RoomQuestionScreen index={1} paused />, flowWith({ state: chosen }))
    expect(described()).toBe('voter.status.paused')
  })

  it('a vote waiting to be re-sent: no hint and no skip; the button re-sends it', async () => {
    const flow = flowWith({ state: chosen, lockedNotice: (id) => (id === 'q2' ? 'vote.pending_resend' : undefined) })
    renderWithFlow(<RoomQuestionScreen index={1} paused={false} />, flow)
    expect(screen.queryByRole('button', { name: 'voter.room.skip' })).toBeNull()
    expect(screen.queryByText(/voter\.room\.will_vote/)).toBeNull()
    await waitFor(() => expect(screen.getByTestId('voter-cast')).toBeEnabled())
  })
})

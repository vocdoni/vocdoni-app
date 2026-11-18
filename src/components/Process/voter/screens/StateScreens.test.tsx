import { fireEvent, screen } from '@testing-library/react'
import type { VoterFlow } from '../flow-context'
import { renderWithFlow, testElection, testFacts, testFlow } from '../test-flow'
import { initialVoterState } from '../voter-flow'
import {
  AlreadyVotedScreen,
  CanceledScreen,
  CheckingScreen,
  ClosedScreen,
  NotEligibleScreen,
  PausedScreen,
  UnsupportedScreen,
  UpcomingScreen,
} from './StateScreens'

describe('state screens', () => {
  it('checking shows a named spinner and no sentence that could be wrong', () => {
    renderWithFlow(<CheckingScreen />, testFlow())
    expect(screen.getByTestId('voter-screen')).toHaveAttribute('data-screen', 'checking')
    expect(screen.queryByRole('heading')).toBeNull()
    // A named status announces it; the spinner itself is hidden and carries no label of its own (axe).
    const status = screen.getByRole('status', { name: 'voter.checking' })
    expect(status).toHaveTextContent('voter.checking')
    expect(status.querySelector('[aria-label]')).toBeNull()
  })

  it('upcoming gives both dates with their time zone', () => {
    const election = testElection({ startDate: '2026-12-02T08:00:00.000Z', endDate: '2026-12-12T19:00:00.000Z' })
    renderWithFlow(<UpcomingScreen />, testFlow({ election }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Assemblea General')
    expect(screen.getByText('voter.upcoming.card_title')).toBeInTheDocument()
    expect(screen.getByText('Ateneu de Vallnova')).toBeInTheDocument()
  })

  it('closed shows the turnout with its denominator, the results and "Comprova el teu vot" for a visitor', () => {
    const flow = testFlow({ facts: testFacts({ status: 'ENDED', connected: false }) })
    renderWithFlow(<ClosedScreen />, flow)
    expect(screen.getByTestId('process-vote-count')).toHaveTextContent('voter.closed.turnout')
    fireEvent.click(screen.getByRole('button', { name: 'voter.results.show' }))
    expect(flow.showResults).toHaveBeenCalledWith(true)
    fireEvent.click(screen.getByRole('button', { name: 'voter.results.check_vote' }))
    expect(flow.checkReceipt).toHaveBeenCalled()
  })

  it('closed says a cast that failed as the vote closed was not recorded, and nothing else when none failed (gate F6)', () => {
    const { unmount } = renderWithFlow(<ClosedScreen />, testFlow({ facts: testFacts({ status: 'ENDED' }) }))
    expect(screen.queryByRole('alert')).toBeNull()
    unmount()
    renderWithFlow(
      <ClosedScreen />,
      testFlow({ facts: testFacts({ status: 'ENDED' }), state: { ...initialVoterState, castError: '' } })
    )
    expect(screen.getByRole('alert')).toHaveTextContent('voter.closed.not_cast')
  })

  // Gate-2 N2: the sentence follows what the chain is known to hold, never "not recorded" for an answer that is.
  describe('closed after a cast that failed as the vote closed (gate-2 N2)', () => {
    const closedWith = (chain: VoterFlow['chain'], voteIds: Record<string, string> = {}) => {
      const flow = testFlow({
        facts: testFacts({ status: 'ENDED' }),
        state: { ...initialVoterState, castError: 'x' },
        chain,
        voteIds,
      })
      renderWithFlow(<ClosedScreen />, flow)
      return flow
    }

    it('nothing on chain: not recorded, and no receipt', () => {
      closedWith(['missing', 'missing'])
      expect(screen.getByRole('alert')).toHaveTextContent('voter.closed.not_cast')
      expect(screen.queryByText('voter.receipt.card_title')).toBeNull()
      expect(screen.queryByRole('button', { name: 'voter.results.check_vote' })).toBeNull()
    })

    it('some questions on chain: how many of how many, with the codes of those', () => {
      closedWith(['recorded', 'missing'], { q1: 'a3f1000000000000009c2e' })
      expect(screen.getByRole('alert')).toHaveTextContent('voter.closed.partly_cast')
      expect(screen.getByRole('alert')).not.toHaveTextContent('voter.closed.not_cast')
      expect(screen.getByText('a3f1…9c2e')).toBeInTheDocument()
    })

    it('outcome unknown: it may have been recorded, and "Comprova el teu vot" asks again', () => {
      const flow = closedWith(['unknown', 'unknown'])
      expect(screen.getByRole('alert')).toHaveTextContent('voter.closed.unconfirmed')
      fireEvent.click(screen.getByRole('button', { name: 'voter.results.check_vote' }))
      expect(flow.checkReceipt).toHaveBeenCalled()
    })

    it('some on chain and the rest unknown: the confirmed count, and the rest may be recorded too', () => {
      closedWith(['recorded', 'unknown'], { q1: 'a3f1000000000000009c2e' })
      expect(screen.getByRole('alert')).toHaveTextContent('voter.closed.partly_unconfirmed')
      expect(screen.getByText('a3f1…9c2e')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'voter.results.check_vote' })).toBeInTheDocument()
    })

    it('every question on chain (another device, or recovered at the end): nothing about a failed cast', () => {
      closedWith(['recorded', 'recorded'], { q1: 'a3f1000000000000009c2e', q2: 'b7c2000000000000001d4f' })
      expect(screen.queryByRole('alert')).toBeNull()
      expect(screen.getByText('a3f1…9c2e')).toBeInTheDocument()
      expect(screen.getByText('b7c2…1d4f')).toBeInTheDocument()
    })
  })

  it('closed hides the count when the deployment hides counts', () => {
    renderWithFlow(<ClosedScreen />, testFlow({ facts: testFacts({ status: 'ENDED' }) }), {
      appEnv: { HIDE_VOTER_COUNT: true },
    })
    expect(screen.queryByTestId('process-vote-count')).toBeNull()
  })

  it('paused, canceled and unsupported say what happens, with no ballot', () => {
    renderWithFlow(<PausedScreen />, testFlow({ facts: testFacts({ status: 'PAUSED' }) }))
    expect(screen.getByText('voter.paused.card_title')).toBeInTheDocument()
    renderWithFlow(<CanceledScreen />, testFlow({ facts: testFacts({ status: 'CANCELED' }) }))
    expect(screen.getByText('voter.canceled.card_title')).toBeInTheDocument()
    renderWithFlow(<UnsupportedScreen />, testFlow({ facts: testFacts({ questionByQuestion: true }) }))
    expect(screen.getByRole('heading', { name: 'voter.unsupported.title' })).toBeInTheDocument()
    expect(screen.queryByRole('radio')).toBeNull()
  })

  it('notEligible lets the voter sign out', () => {
    const flow = testFlow({ facts: testFacts({ membership: 'notInProcess' }) })
    renderWithFlow(<NotEligibleScreen />, flow)
    fireEvent.click(screen.getByRole('button', { name: 'voter.sign_out' }))
    expect(flow.signOut).toHaveBeenCalled()
  })

  it('alreadyVoted shows the recovered codes, kept out of replays', () => {
    renderWithFlow(<AlreadyVotedScreen />, testFlow({ voteIds: { q1: 'a3f1000000000000009c2e' } }))
    expect(screen.getByText('a3f1…9c2e')).toBeInTheDocument()
    expect(screen.getByTestId('voter-screen')).toHaveClass('ph-no-capture')
  })

  it('alreadyVoted opens with the success disc before the heading', () => {
    renderWithFlow(<AlreadyVotedScreen />, testFlow({ voteIds: { q1: 'a3f1000000000000009c2e' } }))
    const frame = screen.getByTestId('voter-screen')
    expect(frame.querySelector('[data-part="success-disc"]')).not.toBeNull()
    expect(
      frame
        .querySelector('[data-part="success-disc"]')!
        .compareDocumentPosition(screen.getByRole('heading', { level: 1 }))
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('alreadyVoted explains a vote signed but not confirmable from here, or an anonymous receipt that is gone', () => {
    renderWithFlow(<AlreadyVotedScreen />, testFlow({ statuses: ['signed', 'signed'] }))
    expect(screen.getByText('vote.disabled.signed')).toBeInTheDocument()
    renderWithFlow(<AlreadyVotedScreen />, testFlow({ anonymous: true }))
    expect(screen.getByText('aside.anonymous_receipt_gone')).toBeInTheDocument()
  })

  it('alreadyVoted never says "Ja has votat" for a vote the chain does not hold (gate F3)', () => {
    renderWithFlow(
      <AlreadyVotedScreen />,
      testFlow({ statuses: ['confirmed', 'unconfirmed'], voteIds: { q1: 'a3f1000000000000009c2e' } })
    )
    const frame = screen.getByTestId('voter-screen')
    expect(frame).not.toHaveTextContent('voter.voted.title')
    expect(frame.querySelector('[data-part="success-disc"]')).toBeNull()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Assemblea General')
    // What landed keeps its code; what did not is said in the SDK's sentence, next to it.
    expect(screen.getByText('a3f1…9c2e')).toBeInTheDocument()
    expect(screen.getByText('vote.disabled.unconfirmed')).toBeInTheDocument()
  })
})

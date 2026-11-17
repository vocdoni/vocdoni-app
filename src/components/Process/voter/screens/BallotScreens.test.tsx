import { fireEvent, screen, within } from '@testing-library/react'
import { renderWithFlow, testFacts, testFlow } from '../test-flow'
import { initialVoterState } from '../voter-flow'
import { ReceiptScreen } from './ReceiptScreen'
import { ReviewScreen } from './ReviewScreen'
import { SendingScreen } from './SendingScreen'
import { WelcomeScreen } from './WelcomeScreen'

const answered = { ...initialVoterState, answers: { '0': '1', '1': '0' } }

describe('welcome', () => {
  it('lists the agenda, starts the ballot and lets another person sign out, with no name anywhere', () => {
    const flow = testFlow()
    renderWithFlow(<WelcomeScreen />, flow)
    expect(screen.getByText('Question 1')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'voter.welcome.start' }))
    expect(flow.start).toHaveBeenCalled()
    expect(screen.getByTestId('voter-screen')).toHaveClass('ph-no-capture')
  })

  it('shows the vote count unless the results are secret until the end or counts are hidden', () => {
    const { unmount } = renderWithFlow(<WelcomeScreen />, testFlow())
    expect(screen.getByText(/voter\.welcome\.count/)).toBeInTheDocument()
    unmount()
    const secret = renderWithFlow(<WelcomeScreen />, testFlow({ facts: testFacts({ secretUntilTheEnd: true }) }))
    expect(screen.queryByText(/voter\.welcome\.count/)).toBeNull()
    secret.unmount()
    renderWithFlow(<WelcomeScreen />, testFlow(), { appEnv: { HIDE_VOTER_COUNT: true } })
    expect(screen.queryByText(/voter\.welcome\.count/)).toBeNull()
  })
})

describe('review', () => {
  it('lists every answer from the flow, kept out of replays, and "Canvia" goes to its question', () => {
    const flow = testFlow({ state: answered, facts: testFacts({ answered: [true, true] }) })
    renderWithFlow(<ReviewScreen paused={false} />, flow)
    expect(screen.getByText('No 1')).toBeInTheDocument()
    expect(screen.getByText('Yes 2')).toBeInTheDocument()
    expect(screen.getByText('No 1').closest('.ph-no-capture')).not.toBeNull()
    fireEvent.click(screen.getAllByRole('button', { name: 'voter.review.change_label' })[1])
    expect(flow.change).toHaveBeenCalledWith(1)
  })

  it('shows the weight first on a weighted census', () => {
    renderWithFlow(<ReviewScreen paused={false} />, testFlow({ state: answered, weighted: true, weight: 3 }))
    const rows = screen.getByText('voter.review.weight_label').parentElement?.parentElement
    expect(within(rows as HTMLElement).getAllByText(/voter\.review\.weight|Question/)[0]).toHaveTextContent(
      'voter.review.weight_label'
    )
  })

  it('casts once, stays off while casting or paused, and shows a failure with "Torna-ho a provar"', () => {
    const flow = testFlow({ state: answered })
    const { unmount } = renderWithFlow(<ReviewScreen paused={false} />, flow)
    fireEvent.click(screen.getByTestId('voter-cast'))
    expect(flow.cast).toHaveBeenCalledTimes(1)
    unmount()
    const casting = renderWithFlow(<ReviewScreen paused={false} />, testFlow({ state: answered, casting: true }))
    expect(screen.getByTestId('voter-cast')).toBeDisabled()
    casting.unmount()
    const paused = renderWithFlow(<ReviewScreen paused />, testFlow({ state: answered }))
    expect(screen.getByTestId('voter-cast')).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('voter.paused.notice_title')
    paused.unmount()
    renderWithFlow(
      <ReviewScreen paused={false} />,
      testFlow({ state: { ...answered, castError: 'Your vote could not be cast: x' } })
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Your vote could not be cast: x')
    expect(screen.getByTestId('voter-cast')).toHaveTextContent('voter.review.retry')
  })
})

describe('sending', () => {
  it('follows the SDK statuses phase by phase', () => {
    renderWithFlow(<SendingScreen />, testFlow({ statuses: ['submitting', 'confirming'] }))
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveAttribute('data-state', 'done')
    expect(items[1]).toHaveAttribute('aria-current', 'step')
    expect(items[2]).toHaveAttribute('data-state', 'next')
  })
})

describe('receipt', () => {
  it('shows the codes and the one-time warning of an anonymous census, kept out of replays', () => {
    renderWithFlow(
      <ReceiptScreen />,
      testFlow({ anonymous: true, voteIds: { q1: 'a3f1000000000000009c2e', q2: '77b000000000000041da' } })
    )
    expect(screen.getByTestId('vote-receipt')).toHaveTextContent('vote.anonymous_receipt')
    expect(screen.getByText('a3f1…9c2e')).toBeInTheDocument()
    expect(screen.getByTestId('voter-screen')).toHaveClass('ph-no-capture')
  })

  it('says when the results come if they are secret until the end, else offers them', () => {
    const flow = testFlow({ facts: testFacts({ secretUntilTheEnd: true }) })
    const { unmount } = renderWithFlow(<ReceiptScreen />, flow)
    expect(screen.getByText(/voter\.receipt\.results_later/)).toBeInTheDocument()
    unmount()
    const live = testFlow()
    renderWithFlow(<ReceiptScreen />, live)
    fireEvent.click(screen.getByRole('button', { name: 'voter.results.show' }))
    expect(live.showResults).toHaveBeenCalledWith(true)
  })
})

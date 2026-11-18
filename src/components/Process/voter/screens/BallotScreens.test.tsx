import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { createTestI18n } from '~src/test-utils'
import { renderWithFlow, testElection, testFacts, testFlow } from '../test-flow'
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

  it('shows neither the vote count nor the census size (ruling R23)', () => {
    const census = { authFields: ['memberNumber'], twoFaFields: [], weighted: false, anonymous: false, size: 312 }
    renderWithFlow(<WelcomeScreen />, testFlow({ election: testElection({ census }) }))
    const welcome = screen.getByTestId('voter-screen')
    expect(welcome).not.toHaveTextContent(/welcome\.count|people_in_census|votes_weight|184|312/)
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

  it('shows the weight first on a weighted census, on the light fill under the card top corners', () => {
    renderWithFlow(<ReviewScreen paused={false} />, testFlow({ state: answered, weighted: true, weight: 3 }))
    const row = screen.getByText('voter.review.weight_label').parentElement as HTMLElement
    const rows = row.parentElement
    expect(within(rows as HTMLElement).getAllByText(/voter\.review\.weight|Question/)[0]).toHaveTextContent(
      'voter.review.weight_label'
    )
    expect(row).toHaveStyle({
      background: 'var(--chakra-colors-bg-subtle)',
      borderTopLeftRadius: 'var(--chakra-radii-xl)',
      borderTopRightRadius: 'var(--chakra-radii-xl)',
    })
    // The question rows keep the card's plain panel.
    const question = screen.getByText('Question 1').parentElement
    expect(question).not.toHaveStyle({ background: 'var(--chakra-colors-bg-subtle)' })
  })

  it('casts once, stays off while casting or paused, and shows a failure with "Torna-ho a provar"', async () => {
    const flow = testFlow({ state: answered })
    const { unmount } = renderWithFlow(<ReviewScreen paused={false} />, flow)
    // Off for a moment after it appears, at the same size (gate F1): a tap then does nothing.
    expect(screen.getByTestId('voter-cast')).toBeDisabled()
    fireEvent.click(screen.getByTestId('voter-cast'))
    expect(flow.cast).not.toHaveBeenCalled()
    await waitFor(() => expect(screen.getByTestId('voter-cast')).toBeEnabled())
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

  it('links each code to its own verification, in one card with no Explorer sentence or list', () => {
    renderWithFlow(
      <ReceiptScreen />,
      testFlow({ voteIds: { q1: 'a3f1000000000000009c2e', q2: '77b000000000000041da' } })
    )
    const link = screen.getByRole('link', { name: 'a3f1…9c2e' })
    expect(link.getAttribute('href')).toMatch(/\/verify\/a3f1000000000000009c2e$/)
    expect(link).toHaveAttribute('target', '_blank')
    expect(screen.getAllByRole('link')).toHaveLength(2)
    expect(screen.queryByText(/voter\.receipt\.verify/)).not.toBeInTheDocument()
  })

  it('counts only the answers the chain confirmed, and says why another one is missing (gate F3)', async () => {
    const i18nInstance = await createTestI18n({
      resources: {
        en: { common: { voter: { receipt: { help_one: '{{count}} answer', help_other: '{{count}} answers' } } } },
      },
      useReactI18next: true,
    })
    renderWithFlow(
      <ReceiptScreen />,
      testFlow({ statuses: ['confirmed', 'unconfirmed'], voteIds: { q1: 'a3f1000000000000009c2e' } }),
      { i18nInstance }
    )
    expect(screen.getByText('1 answer')).toBeInTheDocument()
    expect(screen.getByText('vote.disabled.unconfirmed')).toBeInTheDocument()
  })

  it('offers the results, also for a vote that is secret until the end (the results screen says when they come)', () => {
    const flow = testFlow({ facts: testFacts({ secretUntilTheEnd: true }) })
    renderWithFlow(<ReceiptScreen />, flow)
    expect(screen.queryByText(/voter\.receipt\.results_later/)).toBeNull()
    // The screen's one button, in the action bar as its primary action.
    const bar = screen.getByRole('region', { name: 'voter.actions_label' })
    expect(within(bar).getAllByRole('button')).toHaveLength(1)
    fireEvent.click(within(bar).getByRole('button', { name: 'voter.results.show' }))
    expect(flow.showResults).toHaveBeenCalledWith(true)
  })
})

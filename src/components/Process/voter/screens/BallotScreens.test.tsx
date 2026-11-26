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

  it('shows the weight as the first row of a weighted census, before the questions', () => {
    renderWithFlow(<ReviewScreen paused={false} />, testFlow({ state: answered, weighted: true, weight: 3 }))
    const row = screen.getByText('voter.review.weight_label').parentElement as HTMLElement
    const rows = row.parentElement
    expect(within(rows as HTMLElement).getAllByText(/voter\.review\.weight|Question/)[0]).toHaveTextContent(
      'voter.review.weight_label'
    )
    expect(screen.getByText('Question 1')).toBeInTheDocument()
  })

  it('arms the cast after a moment, casts once on a tap, stays off while casting or paused, and shows a failure', async () => {
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

  // The first frame of a cast, before the SDK reports any status, used to count every question of the ballot.
  it('counts the one question being cast from the first frame, not the whole ballot', async () => {
    const i18nInstance = await createTestI18n({
      resources: {
        en: {
          common: {
            voter: { sending: { sending_one: 'Sending {{count}} answer', sending_other: 'Sending {{count}} answers' } },
          },
        },
      },
      useReactI18next: true,
    })
    renderWithFlow(
      <SendingScreen />,
      testFlow({ statuses: [], state: { ...initialVoterState, castQuestionId: 'q1' } }),
      { i18nInstance }
    )
    expect(screen.getByText('Sending 1 answer')).toBeInTheDocument()
    expect(screen.queryByText('Sending 2 answers')).toBeNull()
  })

  it('counts the whole ballot for an all-at-once cast before any status', async () => {
    const i18nInstance = await createTestI18n({
      resources: {
        en: {
          common: {
            voter: { sending: { sending_one: 'Sending {{count}} answer', sending_other: 'Sending {{count}} answers' } },
          },
        },
      },
      useReactI18next: true,
    })
    renderWithFlow(<SendingScreen />, testFlow({ statuses: [] }), { i18nInstance })
    expect(screen.getByText('Sending 2 answers')).toBeInTheDocument()
  })
})

describe('receipt', () => {
  const anonymousReceipt = () =>
    renderWithFlow(
      <ReceiptScreen />,
      testFlow({ anonymous: true, voteIds: { q1: 'a3f1000000000000009c2e', q2: '77b000000000000041da' } })
    )

  it('shows the codes and the one-time warning of an anonymous census, kept out of replays (board 12)', () => {
    anonymousReceipt()
    const receipt = screen.getByTestId('vote-receipt')
    expect(receipt).toHaveTextContent('voter.receipt.anonymous_warning')
    expect(screen.getAllByRole('status').some((node) => node.textContent === 'voter.receipt.anonymous_warning')).toBe(
      true
    )
    // The help no longer says the page can be closed, and the card note is the anonymous one.
    expect(receipt).toHaveTextContent('voter.receipt.help_anonymous')
    expect(receipt).not.toHaveTextContent(/voter\.receipt\.help(?!_anonymous)/)
    expect(receipt).toHaveTextContent('voter.receipt.card_note_anonymous')
    expect(screen.getByText('a3f1…9c2e')).toBeInTheDocument()
    expect(screen.getByTestId('voter-screen')).toHaveClass('ph-no-capture')
  })

  it('copies the codes with a brief confirmation announced politely', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    anonymousReceipt()
    fireEvent.click(screen.getByRole('button', { name: 'voter.receipt.copy' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'voter.receipt.copied' })).toBeInTheDocument())
    expect(writeText).toHaveBeenCalledWith('Question 1: a3f1000000000000009c2e\nQuestion 2: 77b000000000000041da')
    expect(screen.getAllByRole('status').some((node) => node.textContent === 'voter.receipt.copied_announce')).toBe(
      true
    )
  })

  it('says so when the codes cannot be copied, and offers the download instead', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    anonymousReceipt()
    fireEvent.click(screen.getByRole('button', { name: 'voter.receipt.copy' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'voter.receipt.copy_failed' })).toBeInTheDocument())
    expect(
      screen.getAllByRole('status').some((node) => node.textContent === 'voter.receipt.copy_failed_announce')
    ).toBe(true)
    expect(screen.queryByRole('button', { name: 'voter.receipt.copied' })).toBeNull()
  })

  it('downloads a text file with the vote title, then each question, its code and its verification URL', async () => {
    const createObjectURL = vi.fn(() => 'blob:receipt')
    const revokeObjectURL = vi.fn()
    Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, configurable: true })
    Object.defineProperty(URL, 'revokeObjectURL', { value: revokeObjectURL, configurable: true })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe('voter.receipt.file_name.txt')
    })
    anonymousReceipt()
    fireEvent.click(screen.getByRole('button', { name: 'voter.receipt.download' }))
    expect(click).toHaveBeenCalledTimes(1)
    const blob = (createObjectURL.mock.calls[0] as unknown as [Blob])[0]
    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.readAsText(blob)
    })
    expect(text).toMatch(
      /^Assemblea General\n\nQuestion 1\na3f1000000000000009c2e\nhttps:\/\/[^ ]+\/verify\/a3f1000000000000009c2e\n\nQuestion 2\n/
    )
    // The blob URL is revoked a moment later, so the browser can start the download.
    await waitFor(() => expect(revokeObjectURL).toHaveBeenCalledWith('blob:receipt'), { timeout: 2000 })
    click.mockRestore()
  })

  it('an unconfirmed vote wins over a signed one: its notice is shown, not the signed one (gate F3)', () => {
    renderWithFlow(
      <ReceiptScreen />,
      testFlow({ statuses: ['signed', 'unconfirmed'], voteIds: { q1: 'a3f1000000000000009c2e' } })
    )
    expect(screen.getByText('vote.disabled.unconfirmed')).toBeInTheDocument()
    expect(screen.queryByText('vote.disabled.signed')).toBeNull()
  })

  it('leaves a plain census exactly as it was: no warning, no copy or download', () => {
    renderWithFlow(<ReceiptScreen />, testFlow({ voteIds: { q1: 'a3f1000000000000009c2e' } }))
    const receipt = screen.getByTestId('vote-receipt')
    expect(receipt).toHaveTextContent('voter.receipt.help')
    expect(receipt).not.toHaveTextContent('anonymous')
    expect(screen.queryByRole('button', { name: 'voter.receipt.copy' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'voter.receipt.download' })).toBeNull()
  })

  it('links each code to its own verification, in one card with no Explorer sentence or list', () => {
    renderWithFlow(
      <ReceiptScreen />,
      testFlow({
        election: testElection({ chainId: 'vocdoni/LTS/1' }),
        voteIds: { q1: 'a3f1000000000000009c2e', q2: '77b000000000000041da' },
      })
    )
    const link = screen.getByRole('link', { name: 'a3f1…9c2e' })
    // The Explorer of the vote's own chain.
    expect(link).toHaveAttribute('href', 'https://explorer.vote/verify/a3f1000000000000009c2e')
    expect(link).toHaveAttribute('target', '_blank')
    expect(screen.getAllByRole('link')).toHaveLength(2)
    expect(screen.queryByText(/voter\.receipt\.verify/)).not.toBeInTheDocument()
  })

  it('leaves the codes unlinked on a chain with no Explorer', () => {
    renderWithFlow(
      <ReceiptScreen />,
      testFlow({ election: testElection({ chainId: 'vocdoni/TEST/1' }), voteIds: { q1: 'a3f1000000000000009c2e' } })
    )
    expect(screen.getByText('a3f1…9c2e')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
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

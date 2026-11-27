import { fireEvent, screen, within } from '@testing-library/react'
import i18n from 'i18next'
import enCommon from '~i18n/locales/en/common.json'
import { createTestI18n } from '~src/test-utils'
import type { VoterFlow } from '../flow-context'
import { formatVoteDay, formatVoteTime } from '../format'
import { renderWithFlow, testElection, testFacts, testFlow } from '../test-flow'
import { initialVoterState } from '../voter-flow'
import { VoteClosedLine, VoteStatusLine } from '../parts/VoteStatusLine'
import { PausedNotice } from '../parts/PausedNotice'
import {
  AlreadyVotedScreen,
  CanceledScreen,
  CheckingScreen,
  ClosedScreen,
  NotEligibleScreen,
  PausedScreen,
  UnavailableScreen,
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

  it('upcoming says it has not started over the vote, with the schedule sentence', () => {
    const election = testElection({ startDate: '2026-12-02T08:00:00.000Z', endDate: '2026-12-12T19:00:00.000Z' })
    renderWithFlow(<UpcomingScreen />, testFlow({ election, facts: testFacts({ status: 'UPCOMING' }) }))
    expect(screen.getByText('voter.room.not_started_line')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Assemblea General')
    expect(screen.getByText('voter.upcoming.card_title')).toBeInTheDocument()
    expect(screen.getByText('voter.upcoming.sentence')).toBeInTheDocument()
    // The organisation is in the top bar; the line over the title is the vote's status, as on every screen.
    expect(screen.queryByText('Ateneu de Vallnova')).toBeNull()
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

  it('closed hedges the count on a question-by-question vote: someone may have voted on another question', () => {
    const election = testElection({ initialStatus: 'PAUSED' })
    renderWithFlow(<ClosedScreen />, testFlow({ election, facts: testFacts({ status: 'ENDED', connected: false }) }))
    expect(screen.getByTestId('process-vote-count')).toHaveTextContent(/^voter\.closed\.turnout_any$/)
  })

  it('closed does not hedge an all-at-once count', () => {
    renderWithFlow(<ClosedScreen />, testFlow({ facts: testFacts({ status: 'ENDED', connected: false }) }))
    expect(screen.getByTestId('process-vote-count')).toHaveTextContent(/^voter\.closed\.turnout$/)
  })

  it('closed tells a signed-in member who checked their vote that none of theirs was found', () => {
    renderWithFlow(
      <ClosedScreen />,
      testFlow({ facts: testFacts({ status: 'ENDED' }), state: { ...initialVoterState, checkReceipt: true } })
    )
    expect(screen.getByRole('status')).toHaveTextContent('voter.closed.no_vote_found')
  })

  it('closed says nothing about a missing vote unless the member asked, and never on an anonymous census', () => {
    const { unmount } = renderWithFlow(<ClosedScreen />, testFlow({ facts: testFacts({ status: 'ENDED' }) }))
    expect(screen.queryByText('voter.closed.no_vote_found')).toBeNull()
    unmount()
    renderWithFlow(
      <ClosedScreen />,
      testFlow({
        anonymous: true,
        facts: testFacts({ status: 'ENDED' }),
        state: { ...initialVoterState, checkReceipt: true },
      })
    )
    expect(screen.queryByText('voter.closed.no_vote_found')).toBeNull()
  })

  // A question-by-question vote ended early: it closed days before its scheduled end, and says so.
  describe('a vote ended before its schedule', () => {
    const DAY = 24 * 60 * 60 * 1000
    const endedAt = new Date(Date.now() - 2 * DAY)
    const early = testElection({
      initialStatus: 'PAUSED',
      published: true,
      endDate: new Date(Date.now() + 10 * DAY).toISOString(),
      questions: testElection().questions.map((question) => ({
        ...question,
        status: 'ENDED',
        endedAt: endedAt.toISOString(),
      })),
    })
    const i18nInstance = () =>
      createTestI18n({
        resources: {
          en: {
            common: {
              'voter.results.closed_on': 'Closed on {{date}} at {{time}}',
            },
          },
        },
      })
    const when = `${formatVoteDay(endedAt, 'en')} at ${formatVoteTime(endedAt, 'en')}`

    it('the closed screen dates the close, not the schedule', async () => {
      renderWithFlow(<ClosedScreen />, testFlow({ election: early, facts: testFacts({ status: 'ENDED' }) }), {
        i18nInstance: await i18nInstance(),
      })
      expect(screen.getByText(`Closed on ${when}`)).toBeInTheDocument()
    })

    it('the results closed line dates the close, not the schedule', async () => {
      renderWithFlow(<VoteClosedLine />, testFlow({ election: early, facts: testFacts({ status: 'ENDED' }) }), {
        i18nInstance: await i18nInstance(),
      })
      expect(screen.getByText(`Closed on ${when}`)).toBeInTheDocument()
    })
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

    it('an anonymous census with an unknown outcome asks the chain again, not for the receipt code', () => {
      const flow = testFlow({
        anonymous: true,
        facts: testFacts({ status: 'ENDED' }),
        state: { ...initialVoterState, castError: 'x' },
        chain: ['unknown', 'unknown'],
      })
      renderWithFlow(<ClosedScreen />, flow)
      expect(screen.queryByTestId('voter-verify-receipt')).toBeNull()
      fireEvent.click(screen.getByTestId('voter-check-vote'))
      expect(flow.checkReceipt).toHaveBeenCalled()
      expect(flow.verifyReceipt).not.toHaveBeenCalled()
    })

    it('some on chain and the rest unknown: the confirmed count, and the rest may be recorded too', () => {
      closedWith(['recorded', 'unknown'], { q1: 'a3f1000000000000009c2e' })
      expect(screen.getByRole('alert')).toHaveTextContent('voter.closed.partly_unconfirmed')
      expect(screen.getByText('a3f1…9c2e')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'voter.results.check_vote' })).toBeInTheDocument()
    })

    // A question-by-question vote: the voter tried question 2 only, so question 3, never cast, is not one of the answers.
    it('counts only the questions this voter tried to cast, not every question of the vote', async () => {
      const [first, second] = testElection().questions
      const flow = testFlow({
        election: testElection({ initialStatus: 'PAUSED', questions: [first, second, { ...second, id: 'q3' }] }),
        facts: testFacts({ status: 'ENDED' }),
        state: { ...initialVoterState, castError: 'x', castQuestionId: 'q2' },
        chain: ['recorded', 'missing', 'missing'],
      })
      const i18nInstance = await createTestI18n({
        resources: {
          en: { common: { 'voter.closed.partly_cast': 'Only {{count}} of your {{total}} answers was recorded' } },
        },
      })
      renderWithFlow(<ClosedScreen />, flow, { i18nInstance })
      expect(screen.getByRole('alert')).toHaveTextContent('Only 1 of your 2 answers was recorded')
    })

    // The check forgets a question's ineligibility once the vote ends: the session's own record still keeps it out.
    it('does not count a question the voter was seen ineligible for as missing, even after the end', () => {
      const flow = testFlow({
        facts: testFacts({ status: 'ENDED' }),
        state: { ...initialVoterState, castError: 'x', ineligible: ['q2'] },
        chain: ['recorded', 'missing'],
      })
      renderWithFlow(<ClosedScreen />, flow)
      expect(screen.queryByRole('alert')).toBeNull()
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

  it('unavailable says to try again later only when a retry may help, not after a refused check', () => {
    const { unmount } = renderWithFlow(
      <UnavailableScreen />,
      testFlow({ facts: testFacts({ status: 'PROCESS_UNKNOWN' }) })
    )
    expect(screen.getByText('voter.unavailable.body')).toBeInTheDocument()
    unmount()
    renderWithFlow(<UnavailableScreen refused />, testFlow({ facts: testFacts({ membership: 'unavailable' }) }))
    expect(screen.getByText('voter.unavailable.refused_body')).toBeInTheDocument()
    expect(screen.queryByText('voter.unavailable.body')).toBeNull()
  })

  it('paused and canceled say what happens, with no ballot', () => {
    renderWithFlow(<PausedScreen />, testFlow({ facts: testFacts({ status: 'PAUSED' }) }))
    expect(screen.getByText('voter.paused.card_title')).toBeInTheDocument()
    renderWithFlow(<CanceledScreen />, testFlow({ facts: testFacts({ status: 'CANCELED' }) }))
    expect(screen.getByText('voter.canceled.card_title')).toBeInTheDocument()
  })

  it('VoteStatusLine shows paused indicator for context=head when the vote is paused, not the open-until line', () => {
    const { unmount } = renderWithFlow(
      <VoteStatusLine context='head' />,
      testFlow({ facts: testFacts({ status: 'PAUSED' }) })
    )
    expect(screen.getByText('voter.status.paused')).toBeInTheDocument()
    expect(screen.queryByText(/voter\.status\.open_until/)).toBeNull()
    unmount()
    // When not paused, the head still shows the open-until line.
    renderWithFlow(<VoteStatusLine context='head' />, testFlow({ facts: testFacts({ status: 'ONGOING' }) }))
    expect(screen.getByText(/voter\.status\.open_until/)).toBeInTheDocument()
  })

  it('PausedNotice says the voter can continue once, then when the vote closes', async () => {
    // The real English copy: the keys alone cannot show a sentence that repeats itself.
    const english = i18n.createInstance()
    await english.init({
      lng: 'en',
      defaultNS: 'common',
      resources: { en: { common: enCommon } },
      interpolation: { escapeValue: false },
    })
    const election = testElection({ endDate: '2026-12-01T19:00:00.000Z' })
    renderWithFlow(<PausedNotice />, testFlow({ facts: testFacts({ status: 'PAUSED' }), election }), {
      i18nInstance: english,
    })
    const notice = screen.getByRole('status')
    expect(notice).toHaveTextContent('The vote has been paused for now.')
    expect(notice).toHaveTextContent(
      /Don't close the page: you can continue when it resumes\. The vote closes on .+ at .+\./
    )
    expect(notice.textContent?.match(/You can continue/g)).toBeNull()
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

  it('offers no results when the creator hid them from voters', () => {
    const hidden = { resultsShown: false }
    const { unmount } = renderWithFlow(
      <ClosedScreen />,
      testFlow({ facts: testFacts({ ...hidden, status: 'ENDED', connected: false }) })
    )
    expect(screen.queryByRole('button', { name: 'voter.results.show' })).toBeNull()
    unmount()
    renderWithFlow(
      <AlreadyVotedScreen />,
      testFlow({ facts: testFacts(hidden), voteIds: { q1: 'a3f1000000000000009c2e' } })
    )
    expect(screen.queryByRole('button', { name: 'voter.results.show' })).toBeNull()
  })

  it('alreadyVoted: "Mostra els resultats" is the only button, in the action bar', () => {
    const flow = testFlow({ voteIds: { q1: 'a3f1000000000000009c2e' } })
    renderWithFlow(<AlreadyVotedScreen />, flow)
    const bar = screen.getByRole('region', { name: 'voter.actions_label' })
    expect(within(bar).getAllByRole('button')).toHaveLength(1)
    fireEvent.click(within(bar).getByRole('button', { name: 'voter.results.show' }))
    expect(flow.showResults).toHaveBeenCalledWith(true)
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

  // Board V4VoterWideMore 13.
  describe('alreadyVoted, anonymous census, signed with no codes held (board 13)', () => {
    it('says only what the platform knows: no tick, no "Ja has votat", and the way to verify a receipt', () => {
      const flow = testFlow({ anonymous: true, statuses: ['signed', 'signed'] })
      renderWithFlow(<AlreadyVotedScreen />, flow)
      const frame = screen.getByTestId('voter-screen')
      expect(frame.querySelector('[data-part="success-disc"]')).toBeNull()
      expect(frame).not.toHaveTextContent('voter.voted.title')
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('voter.voted.anonymous_title')
      expect(frame).toHaveTextContent('voter.voted.anonymous_help')
      expect(frame).toHaveTextContent('voter.receipt.card_title')
      expect(frame).toHaveTextContent('voter.voted.anonymous_card_note')
      expect(screen.queryByText('vote.disabled.signed')).toBeNull()
      fireEvent.click(screen.getByRole('button', { name: 'voter.verify.title' }))
      expect(flow.verifyReceipt).toHaveBeenCalledWith(true)
      fireEvent.click(screen.getByRole('button', { name: 'voter.results.show' }))
      expect(flow.showResults).toHaveBeenCalledWith(true)
    })

    it('offers no receipt check on a chain with no Explorer to check it on', () => {
      renderWithFlow(
        <AlreadyVotedScreen />,
        testFlow({
          anonymous: true,
          statuses: ['signed', 'signed'],
          election: testElection({ chainId: 'vocdoni/TEST/1' }),
        })
      )
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('voter.voted.anonymous_title')
      expect(screen.queryByRole('button', { name: 'voter.verify.title' })).toBeNull()
      // The card does not promise an Explorer check the chain cannot make.
      expect(screen.getByTestId('voter-screen')).toHaveTextContent('voter.voted.anonymous_card_note_no_explorer')
      expect(screen.queryByText('voter.voted.anonymous_card_note')).toBeNull()
    })

    it('keeps the current screen with its codes when this tab holds them', () => {
      renderWithFlow(
        <AlreadyVotedScreen />,
        testFlow({ anonymous: true, statuses: ['signed', 'signed'], voteIds: { q1: 'a3f1000000000000009c2e' } })
      )
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('voter.voted.title')
      expect(screen.getByText('a3f1…9c2e')).toBeInTheDocument()
    })

    it('does not apply to a plain census', () => {
      renderWithFlow(<AlreadyVotedScreen />, testFlow({ statuses: ['signed', 'signed'] }))
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('voter.voted.title')
      expect(screen.queryByText('voter.voted.anonymous_title')).toBeNull()
    })
  })

  it('closed, anonymous census: "Verifica el teu comprovant" replaces "Comprova el teu vot", for a member too (R8)', () => {
    const flow = testFlow({ anonymous: true, facts: testFacts({ status: 'ENDED', connected: true }) })
    renderWithFlow(<ClosedScreen />, flow)
    expect(screen.queryByTestId('voter-check-vote')).toBeNull()
    expect(screen.queryByRole('button', { name: 'voter.results.check_vote' })).toBeNull()
    fireEvent.click(screen.getByTestId('voter-verify-receipt'))
    expect(screen.getByTestId('voter-verify-receipt')).toHaveTextContent('voter.verify.title')
    expect(flow.verifyReceipt).toHaveBeenCalledWith(true)
    expect(flow.checkReceipt).not.toHaveBeenCalled()
  })

  it('closed, anonymous census on a chain with no Explorer: no receipt check is offered', () => {
    renderWithFlow(
      <ClosedScreen />,
      testFlow({
        anonymous: true,
        election: testElection({ chainId: 'vocdoni/TEST/1' }),
        facts: testFacts({ status: 'ENDED', connected: true }),
      })
    )
    expect(screen.queryByTestId('voter-verify-receipt')).toBeNull()
    expect(screen.queryByTestId('voter-check-vote')).toBeNull()
  })

  it('closed, plain census: still "Comprova el teu vot" with its own handle', () => {
    renderWithFlow(<ClosedScreen />, testFlow({ facts: testFacts({ status: 'ENDED', connected: false }) }))
    expect(screen.getByTestId('voter-check-vote')).toHaveTextContent('voter.results.check_vote')
    expect(screen.queryByTestId('voter-verify-receipt')).toBeNull()
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

describe('receipt codes on the closed and already voted screens', () => {
  const CODE = 'a3f1000000000000009c2e'

  it('an anonymous census gets the copy and download actions for the codes it holds (gate R8)', () => {
    renderWithFlow(
      <AlreadyVotedScreen />,
      testFlow({ anonymous: true, statuses: ['confirmed'], voteIds: { q1: CODE } })
    )
    expect(screen.getByRole('button', { name: 'voter.receipt.copy' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'voter.receipt.download' })).toBeInTheDocument()
  })

  it('a closed screen of an anonymous census gets the same actions for the codes it holds', () => {
    renderWithFlow(
      <ClosedScreen />,
      testFlow({
        anonymous: true,
        facts: testFacts({ status: 'ENDED' }),
        state: { ...initialVoterState, castError: 'x' },
        chain: ['recorded', 'recorded'],
        voteIds: { q1: CODE, q2: 'b7c2000000000000001d4f' },
      })
    )
    expect(screen.getByRole('button', { name: 'voter.receipt.copy' })).toBeInTheDocument()
  })

  it('a plain census gets no copy or download action', () => {
    renderWithFlow(<AlreadyVotedScreen />, testFlow({ statuses: ['confirmed'], voteIds: { q1: CODE } }))
    expect(screen.queryByRole('button', { name: 'voter.receipt.copy' })).toBeNull()
  })

  it('an anonymous vote the chain does not hold says so, even with another question signed (gate F3)', () => {
    renderWithFlow(<AlreadyVotedScreen />, testFlow({ anonymous: true, statuses: ['signed', 'unconfirmed'] }))
    expect(screen.getByText('vote.disabled.unconfirmed')).toBeInTheDocument()
    expect(screen.queryByText('voter.voted.anonymous_title')).toBeNull()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Assemblea General')
  })
})

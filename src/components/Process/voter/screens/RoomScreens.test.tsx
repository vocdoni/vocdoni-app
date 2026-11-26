import { fireEvent, screen, within } from '@testing-library/react'
import { renderWithFlow, testElection, testFacts, testFlow, testRoom } from '../test-flow'
import { initialVoterState, type RoomFacts, type VoterScreen } from '../voter-flow'
import {
  RoomClosedVotedScreen,
  RoomMissedScreen,
  RoomNoneScreen,
  RoomNotStartedScreen,
  RoomOpenScreen,
  RoomSkippedScreen,
  RoomVotedScreen,
} from './RoomScreens'

// Three questions, for the rooms that name the next one.
const election = testElection({
  initialStatus: 'PAUSED',
  description: { default: 'The autumn assembly.' },
  questions: [1, 2, 3].map((n) => ({
    id: `q${n}`,
    title: { default: `Question ${n}` },
    description: { default: '' },
    choices: [
      { title: { default: `Yes ${n}` }, value: 0 },
      { title: { default: `No ${n}` }, value: 1 },
    ],
    type: 'singlechoice',
    status: 'PAUSED',
  })),
})
const flowIn = (screenValue: VoterScreen, room: RoomFacts, over: Parameters<typeof testFlow>[0] = {}) =>
  testFlow({ screen: screenValue, election, facts: testFacts({ room }), ...over })
const OPEN = testRoom([['closed', 'recorded'], 'open'])

describe('frame 0: not started', () => {
  it('says so, shows the vote media, lists the questions below lg, and has no button', () => {
    renderWithFlow(
      <RoomNotStartedScreen />,
      flowIn({ kind: 'roomNotStarted' }, testRoom(['toOpen', 'toOpen', 'toOpen'], 'ready'))
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('voter.room.not_started_title')
    expect(screen.getByText('voter.room.not_started_body')).toBeInTheDocument()
    expect(screen.getByText('The autumn assembly.')).toBeInTheDocument()
    const list = screen.getByRole('list', { name: 'voter.room.questions' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(3)
    expect(screen.queryByRole('button')).toBeNull()
  })
})

describe('frame 1: a question is open', () => {
  it('names it in its card, and "Vota ara" goes back to its ballot', () => {
    const flow = flowIn({ kind: 'roomOpen', index: 1 }, OPEN)
    renderWithFlow(<RoomOpenScreen index={1} />, flow)
    expect(screen.getByText('voter.room.kicker')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('voter.room.open_title')
    expect(screen.getByText('voter.room.open_label')).toBeInTheDocument()
    expect(screen.getByText('Question 2')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'voter.room.vote_now' }))
    expect(flow.resume).toHaveBeenCalledWith(1)
  })
})

describe('frame 1: an open set', () => {
  it('speaks of the questions together and lists each one', () => {
    const flow = flowIn({ kind: 'roomOpen', index: 1 }, testRoom([['closed', 'recorded'], 'open', 'open']), {
      form: [1, 2],
    })
    renderWithFlow(<RoomOpenScreen index={1} />, flow)
    expect(screen.getByText('voter.room.kicker_set')).toBeInTheDocument()
    expect(screen.queryByText('voter.room.kicker')).toBeNull()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('voter.room.open_title_set')
    expect(screen.getAllByText('voter.room.open_label')).toHaveLength(2)
    expect(screen.getByText('Question 2')).toBeInTheDocument()
    expect(screen.getByText('Question 3')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'voter.room.vote_now' }))
    expect(flow.resume).toHaveBeenCalledWith(1)
  })
})

describe('frame 3: vote cast', () => {
  it('confirms with the tick and the title, never the answer, and says the next is being prepared', () => {
    const state = { ...initialVoterState, sent: { '1': '1' } }
    renderWithFlow(
      <RoomVotedScreen index={1} record='recorded' />,
      flowIn(
        { kind: 'roomVoted', index: 1, record: 'recorded' },
        testRoom([['closed', 'recorded'], ['open', 'recorded'], 'toOpen']),
        {
          state,
        }
      )
    )
    expect(document.querySelector('[data-part="success-disc"]')).not.toBeNull()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('voter.room.voted_title')
    // No room frame names the answer (gate-3 F1, owner ruling 2026-11-24).
    expect(screen.queryByText('voter.room.voted_help')).toBeNull()
    expect(screen.queryByText(/Yes 2|No 2/)).toBeNull()
    expect(screen.getByText('voter.room.preparing')).toBeInTheDocument()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('never names an answer whose cast did not land, even when the chain lists the question as voted (gate-3 F1)', () => {
    // Device B: "No" was sent while device A had voted "Yes"; the cast failed and the check now lists q2 as voted.
    renderWithFlow(
      <RoomVotedScreen index={1} record='recorded' />,
      flowIn(
        { kind: 'roomVoted', index: 1, record: 'recorded' },
        testRoom([['closed', 'recorded'], ['open', 'recorded'], 'toOpen']),
        { state: { ...initialVoterState, sent: { '1': '1' }, castQuestionId: 'q2', castError: 'x' } }
      )
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('voter.room.voted_title')
    expect(screen.queryByText('voter.room.voted_help')).toBeNull()
  })

  it('omits the answer it does not know and the hint when nothing is left to open', () => {
    renderWithFlow(
      <RoomVotedScreen index={1} record='recorded' />,
      flowIn(
        { kind: 'roomVoted', index: 1, record: 'recorded' },
        testRoom([
          ['closed', 'recorded'],
          ['open', 'recorded'],
        ])
      )
    )
    expect(screen.queryByText('voter.room.voted_help')).toBeNull()
    expect(screen.queryByText('voter.room.preparing')).toBeNull()
  })

  it('authorised from another tab (anonymous): only what the platform knows, no tick (board V4VoterWideMore 13)', () => {
    renderWithFlow(
      <RoomVotedScreen index={1} record='authorised' />,
      flowIn({ kind: 'roomVoted', index: 1, record: 'authorised' }, OPEN, { anonymous: true })
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('voter.voted.anonymous_title')
    expect(document.querySelector('[data-part="success-disc"]')).toBeNull()
  })

  it('lost (signed, not on chain): no tick, an error notice that is announced, no "Vot emès"', () => {
    renderWithFlow(
      <RoomVotedScreen index={1} record='lost' />,
      flowIn({ kind: 'roomVoted', index: 1, record: 'lost' }, OPEN)
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Question 2')
    expect(document.querySelector('[data-part="success-disc"]')).toBeNull()
    expect(screen.queryByText('voter.room.voted_title')).toBeNull()
    expect(screen.getByRole('alert')).toHaveTextContent('voter.room.lost_title')
    expect(screen.getByRole('alert')).toHaveTextContent('voter.room.lost_help')
  })

  it('anonymous census: the code to keep now, with copy and download (board V4VoterWideMore 12 in this mode)', () => {
    renderWithFlow(
      <RoomVotedScreen index={1} record='recorded' />,
      flowIn({ kind: 'roomVoted', index: 1, record: 'recorded' }, OPEN, {
        anonymous: true,
        voteIds: { q2: 'c81e'.padEnd(64, '0') },
      })
    )
    // The card's copy confirmation is a status region too: read the warning by its text.
    expect(screen.getByText(/voter\.receipt\.anonymous_warning/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /voter\.receipt\.copy/ })).toBeInTheDocument()
  })
})

describe('frame 3b: skipped', () => {
  it('says nothing was sent and offers to vote it while open', () => {
    const flow = flowIn({ kind: 'roomSkipped', index: 1 }, testRoom([['closed', 'recorded'], 'open', 'toOpen']))
    renderWithFlow(<RoomSkippedScreen index={1} />, flow)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('voter.room.skipped_title')
    expect(screen.getByText('voter.room.skipped_help')).toBeInTheDocument()
    expect(screen.getByText('voter.room.preparing')).toBeInTheDocument()
    expect(document.querySelector('[data-part="success-disc"]')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'voter.room.vote_question' }))
    expect(flow.resume).toHaveBeenCalledWith(1)
  })
})

describe('frame 3b: a skipped set', () => {
  it('speaks of the questions together and offers to vote them', () => {
    const flow = flowIn({ kind: 'roomSkipped', index: 1 }, testRoom([['closed', 'recorded'], 'open', 'open']), {
      form: [1, 2],
    })
    renderWithFlow(<RoomSkippedScreen index={1} />, flow)
    expect(screen.getByText('voter.room.open_label_set')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('voter.room.skipped_title_set')
    expect(screen.getByText('voter.room.skipped_help_set')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'voter.room.vote_question_set' }))
    expect(flow.resume).toHaveBeenCalledWith(1)
  })
})

describe('frame 3c: closed without voting', () => {
  it('says it closed and was not voted', () => {
    renderWithFlow(
      <RoomMissedScreen index={1} />,
      flowIn({ kind: 'roomMissed', index: 1 }, testRoom([['closed', 'recorded'], 'closed', 'toOpen']))
    )
    expect(screen.getByText('voter.room.closed_label')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('voter.room.missed_title')
    expect(screen.getByText('voter.room.missed_help')).toBeInTheDocument()
    expect(screen.getByText('voter.room.preparing')).toBeInTheDocument()
  })
})

describe('frame 3c: a cast the chain does not hold (gate-3 F2, F3)', () => {
  const room = testRoom([['closed', 'recorded'], ['closed', 'lost'], 'toOpen'])

  it('lost: an error notice, never "No l\'has votada"', () => {
    renderWithFlow(
      <RoomMissedScreen index={1} record='lost' />,
      flowIn({ kind: 'roomMissed', index: 1, record: 'lost' }, room)
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('voter.room.missed_title')
    expect(screen.getByRole('alert')).toHaveTextContent('voter.room.lost_title')
    expect(screen.getByRole('alert')).toHaveTextContent('voter.room.lost_help')
    expect(screen.queryByText('voter.room.missed_help')).toBeNull()
  })

  it('unknown: it may have been recorded, and "Comprova el teu vot" asks the check again', () => {
    const flow = flowIn({ kind: 'roomMissed', index: 1, record: 'unknown' }, room)
    renderWithFlow(<RoomMissedScreen index={1} record='unknown' />, flow)
    expect(screen.getByRole('alert')).toHaveTextContent('voter.room.unconfirmed_title')
    expect(screen.getByRole('alert')).toHaveTextContent('voter.room.unconfirmed_help')
    expect(screen.queryByText('voter.room.missed_help')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'voter.results.check_vote' }))
    expect(flow.recheck).toHaveBeenCalled()
  })

  it('unknown on an anonymous census: the code check on the Explorer instead', () => {
    const flow = flowIn({ kind: 'roomMissed', index: 1, record: 'unknown' }, room, { anonymous: true })
    renderWithFlow(<RoomMissedScreen index={1} record='unknown' />, flow)
    fireEvent.click(screen.getByRole('button', { name: 'voter.verify.title' }))
    expect(flow.verifyReceipt).toHaveBeenCalledWith(true)
  })

  it('late: an error notice, never "No l\'has votada", no check-vote link (the relay definitively refused)', () => {
    renderWithFlow(
      <RoomMissedScreen index={1} record='late' />,
      flowIn({ kind: 'roomMissed', index: 1, record: 'late' }, room)
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('voter.room.missed_title')
    expect(screen.getByRole('alert')).toHaveTextContent('voter.room.late_title')
    expect(screen.getByRole('alert')).toHaveTextContent('voter.room.late_help')
    expect(screen.queryByText('voter.room.missed_help')).toBeNull()
    // No "Comprova el teu vot" button: outcome is definitive, nothing to re-check.
    expect(screen.queryByRole('button', { name: 'voter.results.check_vote' })).toBeNull()
  })
})

describe('frame 4: none open', () => {
  it('kicks with the vote title and names the next question', () => {
    renderWithFlow(
      <RoomNoneScreen />,
      flowIn({ kind: 'roomNone' }, testRoom([['closed', 'recorded'], ['closed', 'recorded'], 'toOpen']))
    )
    expect(screen.getByText('Assemblea General')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('voter.room.none_title')
    const next = screen.getByRole('list', { name: 'voter.room.next' })
    expect(within(next).getByText('Question 3')).toBeInTheDocument()
  })

  it('names no next question when none is left', () => {
    renderWithFlow(
      <RoomNoneScreen />,
      flowIn(
        { kind: 'roomNone' },
        testRoom([
          ['closed', 'recorded'],
          ['closed', 'recorded'],
        ])
      )
    )
    expect(screen.queryByRole('list', { name: 'voter.room.next' })).toBeNull()
  })
})

// Question 2 has closed with a tally of 6 and 3 votes; the others have none.
const PROTOCOL = {
  maxCount: 1,
  maxValue: 1,
  maxVoteOverwrites: 0,
  costExponent: 1,
  uniqueValues: false,
  maxTotalCost: 0,
  costFromWeight: false,
}
type Tally = { secret?: boolean; finalResults?: boolean; results?: string[][]; voteCount?: number }
const withResults = (over: Tally = {}) =>
  testElection({
    questions: [1, 2, 3].map((n) => ({
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
      secretUntilTheEnd: over.secret ?? false,
      status: 'ONGOING',
      results:
        n === 2
          ? {
              voteCount: over.voteCount ?? 9,
              maxVoters: 12,
              finalResults: over.finalResults ?? false,
              results: over.results ?? [['6', '3']],
            }
          : { voteCount: 0, maxVoters: 12 },
    })),
  })
const AFTER = testRoom([['closed', 'recorded'], ['closed', 'none'], 'toOpen'])
const AFTER_VOTED = testRoom([['closed', 'recorded'], ['closed', 'recorded'], 'toOpen'])

describe('frame 3d: closed without voting, with the result', () => {
  it('shows the title and the result card alone, then the preparing line (owner ruling 2026-11-24)', () => {
    renderWithFlow(
      <RoomMissedScreen index={1} result />,
      flowIn({ kind: 'roomMissed', index: 1, result: true }, AFTER, { election: withResults() })
    )
    expect(screen.getByText('voter.room.closed_label')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('voter.room.missed_title')
    expect(screen.queryByText('voter.room.missed_help')).toBeNull()
    const card = screen.getByRole('region', { name: 'voter.room.result_title' })
    expect(within(card).getByRole('heading', { level: 2 })).toHaveTextContent('voter.room.result_title')
    expect(within(card).getByText('Yes 2')).toBeInTheDocument()
    expect(within(card).getAllByRole('progressbar')).toHaveLength(2)
    expect(screen.getByText('voter.room.preparing')).toBeInTheDocument()
    expect(screen.queryByText(/winner|guanya/i)).toBeNull()
  })

  it('sets a sole leader apart and never names a winner; a tie sets none apart', () => {
    const view = renderWithFlow(
      <RoomMissedScreen index={1} result />,
      flowIn({ kind: 'roomMissed', index: 1, result: true }, AFTER, { election: withResults() })
    )
    expect(screen.getByText('Yes 2').closest('[data-leading]')).not.toBeNull()
    expect(screen.getByText('No 2').closest('[data-leading]')).toBeNull()
    view.unmount()
    renderWithFlow(
      <RoomMissedScreen index={1} result />,
      flowIn({ kind: 'roomMissed', index: 1, result: true }, AFTER, {
        election: withResults({ results: [['5', '5']], voteCount: 10 }),
      })
    )
    expect(document.querySelector('[data-leading]')).toBeNull()
  })

  it('shows no card while the tally is not public (secret until the end, or no votes), with the plain words', () => {
    const view = renderWithFlow(
      <RoomMissedScreen index={1} result />,
      flowIn({ kind: 'roomMissed', index: 1, result: true }, AFTER, { election: withResults({ secret: true }) })
    )
    expect(screen.queryByRole('region', { name: 'voter.room.result_title' })).toBeNull()
    expect(screen.getByText('voter.room.missed_help')).toBeInTheDocument()
    view.unmount()
    renderWithFlow(
      <RoomMissedScreen index={1} result />,
      flowIn({ kind: 'roomMissed', index: 1, result: true }, AFTER, { election: withResults({ voteCount: 0 }) })
    )
    expect(screen.queryByRole('region', { name: 'voter.room.result_title' })).toBeNull()
  })

  it('without the key it is still frame 3c: no card, even with a public tally', () => {
    renderWithFlow(
      <RoomMissedScreen index={1} />,
      flowIn({ kind: 'roomMissed', index: 1 }, AFTER, { election: withResults() })
    )
    expect(screen.queryByRole('region', { name: 'voter.room.result_title' })).toBeNull()
    expect(screen.getByText('voter.room.missed_help')).toBeInTheDocument()
  })
})

describe('frame 3e: closed after voting, with the result', () => {
  it('shows the title and the result card alone, never the answer, then the preparing line', () => {
    renderWithFlow(
      <RoomClosedVotedScreen index={1} />,
      flowIn({ kind: 'roomClosedVoted', index: 1 }, AFTER_VOTED, {
        election: withResults(),
        state: { ...initialVoterState, sent: { '1': '0' } },
      })
    )
    expect(screen.getByTestId('voter-screen')).toHaveAttribute('data-screen', 'roomClosedVoted')
    expect(screen.getByText('voter.room.closed_label')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('voter.room.closed_title')
    expect(screen.queryByText('voter.room.closed_voted_help')).toBeNull()
    expect(screen.queryByText('voter.room.voted_help')).toBeNull()
    expect(
      within(screen.getByRole('region', { name: 'voter.room.result_title' })).getAllByRole('progressbar')
    ).toHaveLength(2)
    expect(screen.getByText('voter.room.preparing')).toBeInTheDocument()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('with no card while the tally is not public, a plain line keeps the screen from being empty', () => {
    renderWithFlow(
      <RoomClosedVotedScreen index={1} />,
      flowIn({ kind: 'roomClosedVoted', index: 1 }, AFTER_VOTED, { election: withResults({ secret: true }) })
    )
    expect(screen.queryByRole('region', { name: 'voter.room.result_title' })).toBeNull()
    expect(screen.getByText('voter.room.closed_voted_help')).toBeInTheDocument()
  })
})

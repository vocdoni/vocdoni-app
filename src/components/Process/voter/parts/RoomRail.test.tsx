import { fireEvent, screen, within } from '@testing-library/react'
import { renderWithFlow, testElection, testFacts, testFlow, testRoom } from '../test-flow'
import { RoomRail, RoomStepProgress } from './RoomRail'

const questions = (count: number) =>
  Array.from({ length: count }, (_x, index) => ({
    id: `q${index + 1}`,
    title: { default: `Question ${index + 1}` },
    description: { default: '' },
    choices: [{ title: { default: 'Yes' }, value: 0 }],
    type: 'singlechoice',
    status: 'PAUSED',
  }))

describe('RoomRail', () => {
  it('gives each question its state and note', () => {
    renderWithFlow(
      <RoomRail />,
      testFlow({
        screen: { kind: 'roomQuestion', index: 2, paused: false },
        election: testElection({ initialStatus: 'PAUSED', questions: questions(4) }),
        facts: testFacts({ room: testRoom([['closed', 'recorded'], 'closed', 'open', 'toOpen']) }),
      })
    )
    const rows = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(rows.map((row) => row.textContent)).toEqual([
      'Question 1voter.room.state.closed',
      '2Question 2voter.room.state.closed_missed',
      '3Question 3voter.room.state.open',
      '4Question 4voter.room.state.waiting',
    ])
    expect(rows[1].firstElementChild).toHaveAttribute('data-state', 'skipped')
  })

  it('draws no tick for a vote the chain does not hold, open or closed (gate-3 F2, F3)', () => {
    renderWithFlow(
      <RoomRail />,
      testFlow({
        screen: { kind: 'roomVoted', index: 2, record: 'lost' },
        election: testElection({ initialStatus: 'PAUSED', questions: questions(3) }),
        facts: testFacts({
          room: testRoom([
            ['closed', 'lost'],
            ['closed', 'unknown'],
            ['open', 'lost'],
          ]),
        }),
      })
    )
    const rows = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(rows.map((row) => row.textContent)).toEqual([
      '1Question 1voter.room.state.closed_lost',
      '2Question 2voter.room.state.closed_unknown',
      '3Question 3voter.room.state.open_lost',
    ])
    expect(rows.map((row) => row.firstElementChild?.getAttribute('data-state'))).toEqual(['skipped', 'skipped', 'now'])
  })

  it('folds a long agenda and unfolds each group (board 1b)', () => {
    const room = testRoom(
      Array.from({ length: 20 }, (_x, index) =>
        index < 12 ? (['closed', 'recorded'] as const) : index === 12 ? 'open' : 'toOpen'
      ) as Parameters<typeof testRoom>[0]
    )
    renderWithFlow(
      <RoomRail />,
      testFlow({
        screen: { kind: 'roomOpen', index: 12 },
        election: testElection({ initialStatus: 'PAUSED', questions: questions(20) }),
        facts: testFacts({ room }),
      })
    )
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(6)
    expect(screen.getByText('voter.room.fold_closed')).toBeInTheDocument()
    expect(screen.getByText('+4')).toBeInTheDocument()
    const [closedToggle, moreToggle] = screen.getAllByRole('button', { name: 'voter.room.show_them' })
    fireEvent.click(moreToggle)
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(9)
    fireEvent.click(closedToggle)
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(20)
  })
})

describe('RoomStepProgress', () => {
  it('says where the room is and fills the line to it', () => {
    renderWithFlow(
      <RoomStepProgress />,
      testFlow({
        screen: { kind: 'roomNone' },
        election: testElection({ initialStatus: 'PAUSED', questions: questions(4) }),
        facts: testFacts({
          room: testRoom([['closed', 'recorded'], ['closed', 'recorded'], ['closed', 'recorded'], 'toOpen']),
        }),
      })
    )
    expect(screen.getByText('voter.progress.room_none')).toBeInTheDocument()
  })

  it('never says "ja has votat" for a lost vote (gate-3 F2)', () => {
    renderWithFlow(
      <RoomStepProgress />,
      testFlow({
        screen: { kind: 'roomVoted', index: 1, record: 'lost' },
        election: testElection({ initialStatus: 'PAUSED', questions: questions(3) }),
        facts: testFacts({ room: testRoom([['closed', 'recorded'], ['open', 'lost'], 'toOpen']) }),
      })
    )
    expect(screen.getByText('voter.progress.room_lost')).toBeInTheDocument()
    expect(screen.queryByText('voter.progress.room_voted')).toBeNull()
  })
})

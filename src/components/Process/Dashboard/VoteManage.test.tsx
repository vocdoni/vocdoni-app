import userEvent from '@testing-library/user-event'
import type { VotingProcessQuestion, VotingProcessResponse } from '@vocdoni/api-types'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { mockUseElection, render, screen, within } from '~src/test-utils'
import { resetReactProvidersMock, setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { createElection, createQuestion, createQuestionResults } from '../VotingReportPdf/__fixtures__'
import { VoteManage } from './VoteManage'

const change = vi.fn()
let questionStatus: { pending?: { questionId: string; status: string }; isBusy: boolean } = { isBusy: false }
let canManage = true
let currentNow = new Date('2026-03-01T12:00:00Z')
let currentElection: VotingProcessResponse

vi.mock('~queries/question-status', () => ({
  useQuestionStatusAction: () => ({ change, ...questionStatus }),
}))
// The provider's values, with the real state derivation (no pause memory: what another device sees).
vi.mock('~components/Actions/ActionsContext', async () => {
  const { deriveVoteState, pausedHoldIds } = await import('~utils/vote-state')
  return {
    useActions: () => {
      const state = deriveVoteState(currentElection, currentNow)
      const isHeld = state === 'paused'
      return {
        disabled: false,
        canManage,
        now: currentNow,
        state,
        votePause: { isHeld, heldQuestionIds: isHeld ? pausedHoldIds(currentElection) : [], isPending: false },
      }
    },
  }
})
vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return { ...actual, ...getReactProvidersMock() }
})

const questions = () => [
  createQuestion({
    id: 'q1',
    title: { default: 'Budget' },
    status: 'RESULTS',
    results: createQuestionResults({ questionId: 'q1', voteCount: 10 }),
  }),
  createQuestion({
    id: 'q2',
    title: { default: 'Board' },
    status: 'ONGOING',
    secretUntilTheEnd: true,
    results: createQuestionResults({ questionId: 'q2', voteCount: 172, finalResults: false }),
  }),
  createQuestion({
    id: 'q3',
    title: { default: 'Statutes' },
    description: { default: 'Do we approve the new article 4?' },
    status: 'PAUSED',
    results: undefined,
  }),
]

const build = (overrides: Partial<VotingProcessResponse> = {}) =>
  ({
    ...createElection({
      id: '0x1',
      questions: questions(),
      startDate: '2026-02-01T10:00:00Z',
      endDate: '2026-04-01T10:00:00Z',
      census: { size: 200, authFields: [], twoFaFields: [] },
    }),
    initialStatus: 'PAUSED',
    ...overrides,
  }) as unknown as VotingProcessResponse

const withQuestions = (list: VotingProcessQuestion[]) => build({ questions: list })

const show = (election: VotingProcessResponse) => {
  currentElection = election
  setReactProvidersMock({
    ElectionProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
    useElection: () => mockUseElection({ election, results: null }),
  })
  return render(
    <MemoryRouter initialEntries={['/admin/process/0x1/manage']}>
      <Routes>
        <Route path='/admin/process/:id/manage' element={<VoteManage />} />
        <Route path='/admin/process/:id' element={<div>summary page</div>} />
      </Routes>
    </MemoryRouter>
  )
}

const questionsList = () => within(screen.getByRole('region', { name: 'Questions' }))

describe('VoteManage', () => {
  beforeEach(() => {
    change.mockReset()
    questionStatus = { isBusy: false }
    canManage = true
    currentNow = new Date('2026-03-01T12:00:00Z')
  })
  afterEach(() => resetReactProvidersMock())

  it('sends an all-at-once vote to the summary', () => {
    show(build({ initialStatus: undefined } as Partial<VotingProcessResponse>))
    expect(screen.getByText('summary page')).toBeInTheDocument()
  })

  it('counts the questions in the card and the band, and hints the next step', () => {
    show(build())
    expect(screen.getByText('1 closed · 1 open · 1 to open')).toBeInTheDocument()
    expect(screen.getByText('1 open, 1 closed, 1 to open')).toBeInTheDocument()
    expect(screen.getByText('Next step: close question 2')).toBeInTheDocument()
    expect(screen.getByText(/Questions still open will close then/)).toBeInTheDocument()
  })

  it('opens a closed question on its whole line: verdict, tally, turnout and final bars', async () => {
    show(build())
    const toggle = screen.getByRole('button', { name: /^Question 1: Budget.*Approve.*Show or hide the detail$/ })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveTextContent('7 to 3')
    expect(toggle).toHaveTextContent('5%')
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('10 of 200 voted')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Winning choice' })).toBeInTheDocument()
  })

  it('opens a question to open on its line to show the question', async () => {
    show(build())
    const toggle = screen.getByRole('button', { name: /^Question 3: Statutes.*To open.*Show or hide the detail$/ })
    expect(screen.queryByText('Do we approve the new article 4?')).not.toBeInTheDocument()
    await userEvent.click(toggle)
    expect(screen.getByText('Do we approve the new article 4?')).toBeInTheDocument()
  })

  it('opens and pauses questions, and closes only after a primary confirm', async () => {
    show(build())
    await userEvent.click(screen.getByRole('button', { name: 'Open' }))
    expect(change).toHaveBeenCalledWith({ questionId: 'q3', status: 'ready' })
    expect(screen.getByRole('button', { name: 'Open' })).toHaveAttribute('data-variant', 'outline')
    await userEvent.click(screen.getByRole('button', { name: 'Pause' }))
    expect(change).toHaveBeenCalledWith({ questionId: 'q2', status: 'paused' })
    expect(screen.getByRole('button', { name: 'Close' })).toHaveAttribute('data-variant', 'solid')
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(change).not.toHaveBeenCalledWith({ questionId: 'q2', status: 'ended' })
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Close question 2?')).toBeInTheDocument()
    expect(within(dialog).getByText(/“Board” will close with the 172 votes it has now/)).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'No, leave it open' })).toBeInTheDocument()
    const confirm = within(dialog).getByRole('button', { name: 'Close question 2' })
    expect(confirm).toHaveAttribute('data-tone', 'primary')
    await userEvent.click(confirm)
    expect(change).toHaveBeenCalledWith({ questionId: 'q2', status: 'ended' })
  })

  it('locks every status button while busy and shows progress on the pending one only', () => {
    questionStatus = { isBusy: true, pending: { questionId: 'q2', status: 'paused' } }
    show(build())
    // A loading Chakra button swaps its label for a spinner, so find the pending one by its state.
    const loading = document.querySelectorAll('[data-loading]')
    expect(loading).toHaveLength(1)
    expect(loading[0]).toBeDisabled()
    expect(loading[0]).toHaveTextContent('Pause')
    expect(screen.getByRole('button', { name: 'Close' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Close' })).not.toHaveAttribute('data-loading')
    expect(screen.getByRole('button', { name: 'Open' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Open' })).not.toHaveAttribute('data-loading')
  })

  it('before the start disables Open and says when it starts', () => {
    currentNow = new Date('2026-01-01T12:00:00Z')
    show(build())
    expect(screen.getByRole('button', { name: 'Open' })).toBeDisabled()
    expect(screen.getByText(/The vote starts/)).toBeInTheDocument()
    expect(screen.queryByText('1 closed · 1 open · 1 to open')).not.toBeInTheDocument()
  })

  it('after the end drops the buttons and reads a never-opened question as not opened', () => {
    currentNow = new Date('2026-05-01T12:00:00Z')
    show(build())
    expect(screen.queryByRole('button', { name: 'Open' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Pause' })).not.toBeInTheDocument()
    expect(screen.queryByText(/Next step/)).not.toBeInTheDocument()
    expect(questionsList().getAllByText('Closed')).toHaveLength(2)
    expect(questionsList().getByText('Not opened')).toBeInTheDocument()
  })

  it('names no winner for a question closed only by the clock, until the server says it is over', () => {
    currentNow = new Date('2026-05-01T12:00:00Z')
    const tally = createQuestionResults({ voteCount: 10, finalResults: false })
    show(
      withQuestions([
        createQuestion({ id: 'q1', title: { default: 'Settled' }, status: 'RESULTS', results: tally }),
        createQuestion({ id: 'q2', title: { default: 'Clock' }, status: 'ONGOING', results: tally }),
      ])
    )
    const [settled, clock] = questionsList().getAllByRole('listitem')
    expect(within(settled).getByText(/^Closed\. .+\.$/)).toBeInTheDocument()
    expect(within(clock).getByText('Closed.')).toBeInTheDocument()
  })

  it('shows no buttons and no next step to a viewer', () => {
    canManage = false
    show(build())
    expect(screen.queryByRole('button', { name: 'Open' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Pause' })).not.toBeInTheDocument()
    expect(screen.queryByText(/Next step/)).not.toBeInTheDocument()
  })

  it('shows the lock note and no bars for a secret open question', () => {
    show(withQuestions([questions()[1]]))
    expect(screen.getByText('Results will show when the question closes.')).toBeInTheDocument()
    expect(questionsList().queryByText('Approve')).not.toBeInTheDocument()
  })

  it('shows provisional bars, with no winner, while results are live', () => {
    show(
      withQuestions([
        createQuestion({
          id: 'q2',
          status: 'ONGOING',
          results: createQuestionResults({ voteCount: 10, finalResults: false }),
        }),
      ])
    )
    expect(screen.getByText('Provisional result.')).toBeInTheDocument()
    expect(questionsList().getByText('Approve')).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: 'Winning choice' })).not.toBeInTheDocument()
  })

  it('makes Open the primary only when it is the next step', () => {
    show(
      withQuestions([
        createQuestion({ id: 'q1', status: 'RESULTS', results: createQuestionResults({ voteCount: 4 }) }),
        createQuestion({ id: 'q2', title: { default: 'Second' }, status: 'PAUSED', results: undefined }),
        createQuestion({ id: 'q3', title: { default: 'Third' }, status: 'PAUSED', results: undefined }),
      ])
    )
    expect(screen.getByText('Next step: open question 2')).toBeInTheDocument()
    const [second, third] = screen.getAllByRole('button', { name: 'Open' })
    expect(second).toHaveAttribute('data-variant', 'solid')
    expect(third).toHaveAttribute('data-variant', 'outline')
  })

  it('offers Resume and Close on a paused question while another is open, and says nobody can vote on it', async () => {
    show(
      withQuestions([
        createQuestion({ id: 'q1', status: 'ONGOING', results: createQuestionResults({ voteCount: 4 }) }),
        createQuestion({ id: 'q2', status: 'PAUSED', results: createQuestionResults({ voteCount: 5 }) }),
      ])
    )
    expect(screen.getByText('Next step: close question 1')).toBeInTheDocument()
    expect(screen.getByText('No one can vote on it.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Resume' })).toHaveAttribute('data-variant', 'outline')
    await userEvent.click(screen.getByRole('button', { name: 'Resume' }))
    expect(change).toHaveBeenCalledWith({ questionId: 'q2', status: 'ready' })
  })

  it('holds every question while the whole vote is paused', () => {
    // A question with votes paused and none open: the vote is paused as a whole, on any device.
    show(
      withQuestions([
        createQuestion({ id: 'q1', status: 'RESULTS', results: createQuestionResults({ voteCount: 4 }) }),
        createQuestion({ id: 'q2', status: 'PAUSED', results: createQuestionResults({ voteCount: 5 }) }),
        createQuestion({ id: 'q3', status: 'PAUSED', results: undefined }),
      ])
    )
    expect(screen.getByText('Held by the pause of the vote.')).toBeInTheDocument()
    expect(screen.getByText('Next step: resume the vote')).toBeInTheDocument()
    expect(screen.getByText('1 closed · 1 paused · 1 to open')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Open' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Resume' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument()
  })

  it('reads a vote whose questions are all closed as closed, with no next step', () => {
    show(
      withQuestions([
        createQuestion({ id: 'q1', status: 'RESULTS', results: createQuestionResults({ voteCount: 4 }) }),
        createQuestion({ id: 'q2', status: 'ENDED', results: createQuestionResults({ voteCount: 6 }) }),
      ])
    )
    expect(screen.queryByText(/^Next step/)).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Vote status' })).toHaveTextContent('Closed')
  })
})

import userEvent from '@testing-library/user-event'
import type { VotingProcessQuestion, VotingProcessResponse } from '@vocdoni/api-types'
import type { ReactNode } from 'react'
import { mockUseElection, render, screen, within } from '~src/test-utils'
import { resetReactProvidersMock, setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { createElection, createQuestion, createQuestionResults } from '../../../VotingReportPdf/__fixtures__'
import { ByQuestionCard } from './ByQuestionCard'

const change = vi.fn()
let questionStatus: { pending?: { questionId: string; status: string }; isBusy: boolean } = { isBusy: false }
let canManage = true
let phone = false
let currentNow = new Date('2026-03-01T12:00:00Z')
let currentElection: VotingProcessResponse

vi.mock('~queries/question-status', () => ({
  useQuestionStatusAction: () => ({ change, ...questionStatus }),
}))
vi.mock('~components/ui/useIsMobile', () => ({ useIsMobile: () => phone, useIsDesktop: () => !phone }))
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

const show = (election: VotingProcessResponse, desktop = !phone) => {
  currentElection = election
  setReactProvidersMock({
    ElectionProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
    useElection: () => mockUseElection({ election, results: null }),
  })
  return render(<ByQuestionCard questions={election.questions} desktop={desktop} />)
}

const NOTE = '“Open” is disabled while another question is open, and before the start time.'

const questionsList = () => within(screen.getByRole('region', { name: 'Questions' }))
const dock = () => screen.queryByRole('region', { name: 'Vote controls' })
// The row and bar buttons are named by their label and then the question they act on.
const button = (label: string) => screen.getByRole('button', { name: new RegExp(`^${label}: `) })
const buttons = (label: string) => screen.getAllByRole('button', { name: new RegExp(`^${label}: `) })
const queryButton = (label: string) => screen.queryByRole('button', { name: new RegExp(`^${label}: `) })

describe('ByQuestionCard', () => {
  beforeEach(() => {
    change.mockReset()
    questionStatus = { isBusy: false }
    canManage = true
    phone = false
    currentNow = new Date('2026-03-01T12:00:00Z')
  })
  afterEach(() => resetReactProvidersMock())

  describe('on the desktop', () => {
    it('counts the questions in the header and hints the next step', () => {
      show(build())
      expect(screen.getByText('1 closed · 1 open · 1 to open')).toBeInTheDocument()
      expect(screen.getByText('Next step: close question 2')).toBeInTheDocument()
    })

    it('opens a closed question on its whole line: turnout only, then the tally in the detail', async () => {
      show(build())
      const toggle = screen.getByRole('button', { name: /^Question 1: Budget.*Show or hide the detail$/ })
      expect(toggle).toHaveAttribute('aria-expanded', 'false')
      expect(toggle).toHaveTextContent('5% turnout')
      expect(toggle).not.toHaveTextContent(/Approve|7 to 3/)
      await userEvent.click(toggle)
      expect(toggle).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByText('Turnout: 10 of 200')).toBeInTheDocument()
      expect(questionsList().getAllByRole('progressbar', { name: /^(Approve|Reject)/ })).toHaveLength(2)
      expect(screen.queryByRole('img', { name: 'Winning choice' })).not.toBeInTheDocument()
      await userEvent.click(toggle)
      expect(toggle).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByText('Turnout: 10 of 200')).not.toBeInTheDocument()
    })

    it('opens a question to open on its line to show the question and how it is answered', async () => {
      show(build())
      const toggle = screen.getByRole('button', { name: /^Question 3: Statutes.*To open.*Show or hide the detail$/ })
      expect(screen.queryByText(/Do we approve the new article 4\?/)).not.toBeInTheDocument()
      await userEvent.click(toggle)
      expect(screen.getByText(/^Do we approve the new article 4\? /)).toBeInTheDocument()
    })

    it('shows the open question with its turnout and its note, and no bars while results are secret', () => {
      show(build())
      const [, open] = questionsList().getAllByRole('listitem')
      expect(within(open).getByRole('heading', { name: 'Board' })).toBeInTheDocument()
      expect(within(open).getByText('Turnout: 172 of 200')).toBeInTheDocument()
      expect(within(open).getByText('Results will show when the question closes.')).toBeInTheDocument()
      expect(within(open).queryAllByRole('progressbar', { name: /^(Approve|Reject)/ })).toHaveLength(0)
    })

    it('draws Open off on the others while a question is open: focusable, described, and it does nothing', async () => {
      show(build())
      const open = button('Open')
      expect(open).toHaveAccessibleName('Open: question 3, Statutes')
      expect(open).toHaveAttribute('data-variant', 'off')
      expect(open).toHaveAttribute('aria-disabled', 'true')
      expect(open).not.toBeDisabled()
      expect(open).toHaveAccessibleDescription(NOTE)
      await userEvent.click(open)
      expect(change).not.toHaveBeenCalled()
    })

    it('has no pause of its own on a question (the header pauses the vote), and closes only after a primary confirm', async () => {
      show(build())
      expect(queryButton('Pause')).not.toBeInTheDocument()
      expect(queryButton('Resume')).not.toBeInTheDocument()
      expect(button('Close')).toHaveAccessibleName('Close: question 2, Board')
      expect(button('Close')).toHaveAttribute('data-variant', 'solid')
      await userEvent.click(button('Close'))
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
      questionStatus = { isBusy: true, pending: { questionId: 'q2', status: 'ended' } }
      show(build())
      // A loading Chakra button swaps its label for a spinner, so find the pending one by its state.
      const loading = document.querySelectorAll('[data-loading]')
      expect(loading).toHaveLength(1)
      expect(loading[0]).toBeDisabled()
      expect(loading[0]).toHaveTextContent('Close')
      // Open is off anyway while question 2 is open (R29).
      expect(button('Open')).toHaveAttribute('aria-disabled', 'true')
    })

    it('before the start says when it starts and counts nothing', () => {
      currentNow = new Date('2026-01-01T12:00:00Z')
      show(build())
      expect(button('Open')).toHaveAttribute('aria-disabled', 'true')
      expect(button('Open')).toHaveAccessibleDescription(NOTE)
      expect(screen.getByText(/The vote starts/)).toBeInTheDocument()
      expect(screen.queryByText('1 closed · 1 open · 1 to open')).not.toBeInTheDocument()
    })

    it('after the end drops the buttons and reads a never-opened question as not opened', () => {
      currentNow = new Date('2026-05-01T12:00:00Z')
      show(build())
      expect(queryButton('Open')).not.toBeInTheDocument()
      expect(queryButton('Pause')).not.toBeInTheDocument()
      expect(screen.queryByText(/Next step/)).not.toBeInTheDocument()
      expect(questionsList().getAllByText('Closed')).toHaveLength(2)
      expect(questionsList().getByText('Not opened')).toBeInTheDocument()
    })

    it('sets no winner in bold for a question closed only by the clock, until the server says it is over', async () => {
      currentNow = new Date('2026-05-01T12:00:00Z')
      const tally = createQuestionResults({ voteCount: 10, finalResults: false })
      show(
        withQuestions([
          createQuestion({ id: 'q1', title: { default: 'Settled' }, status: 'RESULTS', results: tally }),
          createQuestion({ id: 'q2', title: { default: 'Clock' }, status: 'ONGOING', results: tally }),
        ])
      )
      const [settled, clock] = questionsList().getAllByRole('listitem')
      await userEvent.click(within(settled).getByRole('button', { expanded: false }))
      await userEvent.click(within(clock).getByRole('button', { expanded: false }))
      expect(getComputedStyle(within(settled).getByText('Approve')).fontWeight).toContain('semibold')
      expect(getComputedStyle(within(clock).getByText('Approve')).fontWeight).not.toContain('semibold')
    })

    it('shows no buttons and no next step to a viewer', () => {
      canManage = false
      show(build())
      expect(queryButton('Open')).not.toBeInTheDocument()
      expect(queryButton('Pause')).not.toBeInTheDocument()
      expect(screen.queryByText(/Next step/)).not.toBeInTheDocument()
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
      expect(getComputedStyle(questionsList().getByText('Approve')).fontWeight).not.toContain('semibold')
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
      const [second, third] = buttons('Open')
      expect(second).toHaveAttribute('data-variant', 'solid')
      expect(third).toHaveAttribute('data-variant', 'outline')
      expect(third).not.toHaveAttribute('aria-disabled')
    })

    it('opens any question to open when none is active', async () => {
      show(
        withQuestions([
          createQuestion({ id: 'q1', status: 'RESULTS', results: createQuestionResults({ voteCount: 4 }) }),
          createQuestion({ id: 'q2', status: 'PAUSED', results: undefined }),
          createQuestion({ id: 'q3', status: 'PAUSED', results: undefined }),
        ])
      )
      await userEvent.click(buttons('Open')[1])
      expect(change).toHaveBeenCalledWith({ questionId: 'q3', status: 'ready' })
    })

    it('draws Open off on a paused question while another is open, and says nobody can vote on it', async () => {
      show(
        withQuestions([
          createQuestion({ id: 'q1', status: 'ONGOING', results: createQuestionResults({ voteCount: 4 }) }),
          createQuestion({ id: 'q2', status: 'PAUSED', results: createQuestionResults({ voteCount: 5 }) }),
        ])
      )
      expect(screen.getByText('Next step: close question 1')).toBeInTheDocument()
      expect(screen.getByText('No one can vote on it.')).toBeInTheDocument()
      expect(queryButton('Resume')).not.toBeInTheDocument()
      const reopen = button('Open')
      expect(reopen).toHaveAccessibleName(/^Open: question 2, /)
      expect(reopen).toHaveAttribute('data-variant', 'off')
      expect(reopen).toHaveAccessibleDescription(NOTE)
      await userEvent.click(reopen)
      expect(change).not.toHaveBeenCalled()
      expect(buttons('Close')[0]).toBeEnabled()
    })

    it('warns that closing the last question left closes the vote, and only then', async () => {
      show(
        withQuestions([
          createQuestion({ id: 'q1', status: 'RESULTS', results: createQuestionResults({ voteCount: 4 }) }),
          createQuestion({ id: 'q2', status: 'ONGOING', results: createQuestionResults({ voteCount: 6 }) }),
        ])
      )
      await userEvent.click(button('Close'))
      const dialog = await screen.findByRole('dialog')
      expect(within(dialog).getByText('This is the last question: closing it closes the vote too.')).toBeInTheDocument()
    })

    it('does not warn when other questions are left to close', async () => {
      show(build())
      await userEvent.click(button('Close'))
      const dialog = await screen.findByRole('dialog')
      expect(within(dialog).queryByText(/This is the last question/)).not.toBeInTheDocument()
    })

    it('holds every question while the whole vote is paused, and leaves Open out', () => {
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
      expect(queryButton('Resume')).not.toBeInTheDocument()
      expect(queryButton('Close')).not.toBeInTheDocument()
      // Off on the touch boards, left out from `lg`: the CSS hides it there.
      expect(button('Open')).toHaveAttribute('data-variant', 'off')
    })

    it('reads a vote whose questions are all closed as closed, with no next step and no buttons', () => {
      show(
        withQuestions([
          createQuestion({ id: 'q1', status: 'RESULTS', results: createQuestionResults({ voteCount: 4 }) }),
          createQuestion({ id: 'q2', status: 'ENDED', results: createQuestionResults({ voteCount: 6 }) }),
        ])
      )
      expect(screen.queryByText(/^Next step/)).not.toBeInTheDocument()
      expect(screen.getByText('2 closed')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /^(Open|Pause|Close|Resume):/ })).not.toBeInTheDocument()
    })

    it('voids every question of a canceled vote and counts nothing', () => {
      const voided = (id: string) => createQuestion({ id, status: 'CANCELED', results: undefined })
      show(withQuestions([voided('q1'), voided('q2')]))
      expect(questionsList().getAllByText('Voided')).toHaveLength(2)
      expect(screen.queryByText(/\d (closed|open|voided)/)).not.toBeInTheDocument()
    })

    it('has no bottom bar', () => {
      show(build())
      expect(dock()).not.toBeInTheDocument()
    })
  })

  describe('on a phone', () => {
    beforeEach(() => {
      phone = true
    })

    it('counts the questions with commas and has no next step', () => {
      show(build())
      expect(screen.getByText('1 closed, 1 open, 1 to open')).toBeInTheDocument()
      expect(screen.queryByText(/Next step/)).not.toBeInTheDocument()
    })

    it('says a closed question closed with its turnout, and opens it onto the turnout and the bars', async () => {
      show(build())
      const toggle = screen.getByRole('button', { name: /^Question 1: Budget/ })
      expect(within(toggle).getByText('Closed. 5% turnout.')).toBeInTheDocument()
      await userEvent.click(toggle)
      expect(toggle).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByText('Turnout: 10 of 200')).toBeInTheDocument()
      expect(screen.getByRole('progressbar', { name: /^Approve, 7 votes/ })).toBeInTheDocument()
    })

    it('docks the open question with Close, the same button as its row, and no pause', async () => {
      show(build())
      const bar = within(dock()!)
      expect(bar.getByText('2. Board')).toBeInTheDocument()
      expect(bar.getByText('Open, 172 votes')).toBeInTheDocument()
      expect(bar.queryByRole('button', { name: /^Pause/ })).not.toBeInTheDocument()
      expect(bar.getByRole('button', { name: 'Close: question 2, Board' })).toHaveAttribute('data-variant', 'solid')
      await userEvent.click(bar.getByRole('button', { name: 'Close: question 2, Board' }))
      expect(await screen.findByRole('dialog')).toHaveTextContent('Close question 2?')
    })

    it('docks the next question to open, as the primary, when none is active', async () => {
      show(
        withQuestions([
          createQuestion({ id: 'q1', status: 'RESULTS', results: createQuestionResults({ voteCount: 4 }) }),
          createQuestion({ id: 'q2', title: { default: 'Second' }, status: 'PAUSED', results: undefined }),
        ])
      )
      const bar = within(dock()!)
      expect(bar.getByText('2. Second')).toBeInTheDocument()
      expect(bar.getByText('To open')).toBeInTheDocument()
      const open = bar.getByRole('button', { name: 'Open: question 2, Second' })
      expect(open).toHaveAttribute('data-variant', 'solid')
      await userEvent.click(open)
      expect(change).toHaveBeenCalledWith({ questionId: 'q2', status: 'ready' })
    })

    it('has no bar while the vote is paused (the header resumes it), and shows the held question tinted with its line', () => {
      show(
        withQuestions([
          createQuestion({ id: 'q1', status: 'RESULTS', results: createQuestionResults({ voteCount: 4 }) }),
          createQuestion({ id: 'q2', status: 'PAUSED', results: createQuestionResults({ voteCount: 5 }) }),
          createQuestion({ id: 'q3', status: 'PAUSED', results: undefined }),
        ])
      )
      expect(dock()).not.toBeInTheDocument()
      expect(screen.getByText(/^Held with the vote\./)).toBeInTheDocument()
      expect(button('Open')).toHaveAttribute('aria-disabled', 'true')
    })

    it('has no bar before the start (the API cannot start a vote early), after the end, or for a viewer', () => {
      currentNow = new Date('2026-01-01T12:00:00Z')
      const { unmount } = show(build())
      expect(dock()).not.toBeInTheDocument()
      expect(screen.getByText('none open')).toBeInTheDocument()
      unmount()

      currentNow = new Date('2026-05-01T12:00:00Z')
      show(build()).unmount()
      expect(dock()).not.toBeInTheDocument()

      currentNow = new Date('2026-03-01T12:00:00Z')
      canManage = false
      show(build())
      expect(dock()).not.toBeInTheDocument()
    })

    it('has no bar on a canceled vote, whose questions read voided with no results', () => {
      const voided = (id: string) => createQuestion({ id, status: 'CANCELED', results: undefined })
      show(withQuestions([voided('q1'), voided('q2')]))
      expect(dock()).not.toBeInTheDocument()
      expect(screen.getByText('no results')).toBeInTheDocument()
      expect(questionsList().getAllByText('Voided.')).toHaveLength(2)
    })

    it('has no bar on a tablet either', () => {
      phone = false
      show(build(), false)
      expect(dock()).not.toBeInTheDocument()
      expect(button('Close')).toBeInTheDocument()
    })
  })
})

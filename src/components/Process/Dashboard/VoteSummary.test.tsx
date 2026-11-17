import type { VotingProcessResponse } from '@vocdoni/api-types'
import { fireEvent, render, screen, TestMemoryRouter } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { VoteSummary } from './VoteSummary'

let desktop = true
let canManage = true
let currentElection: VotingProcessResponse
const cloneAsDraft = vi.fn()

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return { ...actual, ...getReactProvidersMock() }
})
vi.mock('~queries/process-end-date', () => ({ useProcessEarlyEndDate: () => ({ data: null }) }))
vi.mock('~components/ui/useIsMobile', () => ({ useIsDesktop: () => desktop, useIsMobile: () => !desktop }))
// The provider's values, with the real state derivation (no pause memory: what another device sees).
vi.mock('~components/Actions/ActionsContext', async () => {
  const { deriveVoteState, pausedHoldIds } = await import('~utils/vote-state')
  return {
    useActions: () => {
      const now = new Date()
      const state = deriveVoteState(currentElection, now)
      const heldQuestionIds = state === 'paused' ? pausedHoldIds(currentElection) : []
      return { canManage, now, state, votePause: { isHeld: heldQuestionIds.length > 0, heldQuestionIds } }
    },
  }
})
vi.mock('./use-clone-as-draft', () => ({ useCloneAsDraft: () => ({ cloneAsDraft, isCloning: false }) }))
vi.mock('./CensusSearch', () => ({ CensusSearch: () => <div>CensusSearch</div> }))

const PROTOCOL = {
  maxCount: 1,
  maxValue: 1,
  maxVoteOverwrites: 0,
  costExponent: 1,
  uniqueValues: false,
  maxTotalCost: 0,
  costFromWeight: false,
}

const question = (id: string, status: string, voteCount = 0, tally?: string[]) => ({
  id,
  title: { default: `Question ${id}` },
  choices: [
    { title: { default: 'Yes' }, value: 0 },
    { title: { default: 'No' }, value: 1 },
  ],
  ballotProtocol: PROTOCOL,
  type: 'singlechoice',
  secretUntilTheEnd: false,
  status,
  results: { voteCount, ...(tally ? { results: [tally], finalResults: status === 'ENDED' } : {}) },
})

const createProcess = (overrides: Record<string, unknown> = {}) =>
  ({
    id: '0xabc',
    orgAddress: '0xorg',
    title: { default: 'Board election' },
    startDate: '2026-01-01T10:00:00Z',
    endDate: '2099-01-02T10:00:00Z',
    published: true,
    census: { size: 312, anonymous: true, authFields: ['memberNumber'] },
    questions: [question('q1', 'ONGOING', 184)],
    ...overrides,
  }) as unknown as VotingProcessResponse

const byQuestion = (questions: unknown[]) => createProcess({ initialStatus: 'PAUSED', questions })

const renderSummary = (election: VotingProcessResponse, voteCount?: number) => {
  currentElection = election
  setReactProvidersMock({
    useElection: () => ({
      election,
      results: voteCount === undefined ? null : { questions: [{ questionId: 'q1', voteCount }] },
    }),
  })
  return render(
    <TestMemoryRouter>
      <VoteSummary />
    </TestMemoryRouter>
  )
}

const textContent = (text: string) => (_: string, element: Element | null) =>
  element?.textContent === text && Array.from(element.children).every((child) => child.textContent !== text)

beforeEach(() => {
  desktop = true
  canManage = true
  cloneAsDraft.mockClear()
})

describe('VoteSummary', () => {
  describe('an all-at-once vote', () => {
    it('shows the turnout, how many voted and the four desktop facts', () => {
      renderSummary(createProcess(), 184)

      expect(screen.getByText('59')).toBeInTheDocument()
      expect(screen.getByText('184 of 312 voted')).toBeInTheDocument()
      for (const label of ['Census', 'Questions', 'Closes', 'Results']) {
        expect(screen.getByText(label)).toBeInTheDocument()
      }
      expect(screen.queryByText('Vote change')).toBeNull()
      expect(screen.getByText('1, all at once')).toBeInTheDocument()
      expect(screen.getByText('live, during the vote')).toBeInTheDocument()
    })

    it('words the results fact for a secret vote as the board does', () => {
      renderSummary(createProcess({ questions: [{ ...question('q1', 'ONGOING', 184), secretUntilTheEnd: true }] }), 184)

      expect(screen.getByText('when the vote closes')).toBeInTheDocument()
      expect(screen.getByText('The results will show when the vote closes.')).toBeInTheDocument()
    })

    it('says when it closes under the ruler', () => {
      renderSummary(createProcess(), 184)

      expect(screen.getByText(/^Closes .+ left$/)).toBeInTheDocument()
    })

    it('shows how many answered each question, how many left it blank and how it is answered', () => {
      renderSummary(createProcess({ questions: [question('q1', 'ONGOING', 181)] }), 184)

      expect(screen.getByText('Turnout: 181 of 312')).toBeInTheDocument()
      expect(screen.getByText('3 of the 184 voters left it blank.')).toBeInTheDocument()
      expect(screen.getByText('One choice, simple majority')).toBeInTheDocument()
      expect(screen.getByText('All open at once')).toBeInTheDocument()
    })

    it('shows the result of each question last, once results are public', () => {
      renderSummary(createProcess({ questions: [question('q1', 'ONGOING', 181, ['150', '31'])] }), 184)

      // One bar per choice with its votes, after the turnout and the blank note; no winner sentence, no label.
      const bar = screen.getByRole('progressbar', { name: 'Yes, 150 votes, 83%' })
      expect(screen.getByRole('progressbar', { name: 'No, 31 votes, 17%' })).toBeInTheDocument()
      const blank = screen.getByText('3 of the 184 voters left it blank.')
      expect(blank.compareDocumentPosition(bar) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      expect(screen.queryByText(/wins with|150 to 31/)).not.toBeInTheDocument()
      expect(screen.queryByText('Provisional result')).not.toBeInTheDocument()
      expect(screen.queryByRole('img', { name: 'Winning choice' })).not.toBeInTheDocument()
    })

    it('links the ballot from the questions card', () => {
      renderSummary(createProcess(), 184)

      expect(screen.getByRole('link', { name: 'Ballot' })).toHaveAttribute('href', '/admin/process/0xabc/ballot')
    })

    it('lists who has not voted yet and the calendar on the desktop', () => {
      renderSummary(createProcess(), 184)

      expect(screen.getByText(textContent('128 have not voted yet'))).toBeInTheDocument()
      expect(screen.getByText('Vote opened')).toBeInTheDocument()
      expect(screen.getByText('Today')).toBeInTheDocument()
      expect(screen.getByText('Automatic closing and results for everyone')).toBeInTheDocument()
    })

    it('shows seven facts and one quiet line per question on a phone, without the desktop cards', () => {
      desktop = false
      renderSummary(createProcess(), 184)

      for (const label of ['Census', 'Questions', 'Closes', 'Results', 'Type', 'Anonymity', 'Vote change']) {
        expect(screen.getByText(label)).toBeInTheDocument()
      }
      expect(screen.getByText('Anonymous').closest('[data-part="trigger"]')).not.toBeNull()
      expect(screen.getByText('Cannot be changed')).toBeInTheDocument()
      expect(screen.getByText('184 votes')).toBeInTheDocument()
      expect(screen.queryByText('Calendar')).toBeNull()
      expect(screen.queryByRole('link', { name: 'Ballot' })).toBeNull()
    })

    it('says a paused vote is paused under the ruler and in the calendar', () => {
      renderSummary(createProcess({ questions: [question('q1', 'PAUSED', 184)] }), 184)

      expect(screen.getByText('Paused. Turnout will not move until you resume it.')).toBeInTheDocument()
      expect(screen.getByText('Today. Vote paused')).toBeInTheDocument()
    })

    it('shows the idle card instead of the hero before it opens', () => {
      renderSummary(createProcess({ startDate: '2099-01-01T10:00:00Z' }), 0)

      expect(screen.getByRole('heading', { name: /^Opens by itself / })).toBeInTheDocument()
      expect(screen.getByText('312 people in the census and 1 question, all open at once.')).toBeInTheDocument()
      expect(screen.queryByText('%')).toBeNull()
    })

    it('leads an ended vote to its results', () => {
      renderSummary(createProcess({ questions: [question('q1', 'ENDED', 184)] }), 184)

      expect(screen.getByRole('heading', { name: 'Vote ended with 184 votes' })).toBeInTheDocument()
      expect(
        screen.getByText('59% of the census voted. The results are final and voters can already see them.')
      ).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Show the results' })).toHaveAttribute(
        'href',
        '/admin/process/0xabc/results'
      )
      expect(screen.getByText('The results are public now.')).toBeInTheDocument()
    })

    it('offers to duplicate a canceled vote to whoever can manage it', () => {
      renderSummary(createProcess({ questions: [question('q1', 'CANCELED', 10)] }), 10)

      expect(screen.getByRole('heading', { name: 'Vote canceled' })).toBeInTheDocument()
      expect(screen.getByText('There will be no results.')).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Duplicate it' }))
      expect(cloneAsDraft).toHaveBeenCalledWith(expect.objectContaining({ id: '0xabc' }))
    })

    it('does not offer the duplicate to a viewer', () => {
      canManage = false
      renderSummary(createProcess({ questions: [question('q1', 'CANCELED', 10)] }), 10)

      expect(screen.queryByRole('button', { name: 'Duplicate it' })).toBeNull()
    })

    it('shows no figure without a census size', () => {
      renderSummary(createProcess({ census: {} }), 10)

      expect(screen.queryByText('%')).toBeNull()
      expect(screen.queryByText(/voted$/)).toBeNull()
    })
  })

  describe('a question-by-question vote', () => {
    const questions = [
      question('q1', 'ENDED', 200, ['150', '50']),
      question('q2', 'ONGOING', 120),
      question('q3', 'PAUSED'),
    ]

    it('heads the desktop hero with the state and words the count as a floor', () => {
      renderSummary(byQuestion(questions), 200)

      expect(screen.getByRole('region', { name: 'Vote summary' })).toBeInTheDocument()
      expect(screen.getByText('At least 200 of 312 voted on a question')).toBeInTheDocument()
      for (const label of ['Census', 'Start', 'Results']) {
        expect(screen.getByText(label)).toBeInTheDocument()
      }
      expect(screen.getByText('live, during the vote')).toBeInTheDocument()
    })

    it('shows each question on one line with its result, votes and state, and the counts in the header', () => {
      renderSummary(byQuestion(questions), 200)

      expect(screen.getByText('1 closed · 1 open · 1 to open')).toBeInTheDocument()
      expect(screen.getByText('150 to 50')).toBeInTheDocument()
      expect(screen.getByText('200 · 64%')).toBeInTheDocument()
      expect(screen.getByText('120 · 38%')).toBeInTheDocument()
      expect(screen.getByText('Closed')).toBeInTheDocument()
      expect(screen.getByText('To open')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Manage questions' })).toHaveAttribute(
        'href',
        '/admin/process/0xabc/manage'
      )
    })

    it('draws a bar per choice under each opened question with a public tally, the top one in bold once final', () => {
      renderSummary(
        byQuestion([
          question('q1', 'ENDED', 200, ['150', '50']),
          question('q2', 'ONGOING', 120, ['70', '50']),
          { ...question('q3', 'ONGOING', 30, ['20', '10']), secretUntilTheEnd: true },
          question('q4', 'PAUSED', 40, ['30', '10']),
          question('q5', 'PAUSED', 0, ['0', '0']),
        ]),
        200
      )
      const bars = (name: string) => screen.queryAllByRole('progressbar', { name })

      expect(bars('Yes, 150 votes, 75%')).toHaveLength(1)
      expect(bars('No, 50 votes, 25%')).toHaveLength(1)
      expect(bars('Yes, 70 votes, 58%')).toHaveLength(1)
      expect(bars('Yes, 30 votes, 75%')).toHaveLength(1)
      // A secret tally stays hidden while open; a question still to open has nothing to draw.
      expect(bars('Yes, 20 votes, 67%')).toHaveLength(0)
      expect(bars('Yes, 0 votes, 0%')).toHaveLength(0)
      // The plain layout: no check column; only the closed question's losing bar is dimmed.
      expect(screen.queryByRole('img', { name: 'Winning choice' })).not.toBeInTheDocument()
      const dimmed = (name: string) =>
        getComputedStyle(bars(name)[0].querySelector('[data-part="range"]')!).opacity.includes('outvoted')
      expect(dimmed('No, 50 votes, 25%')).toBe(true)
      expect(dimmed('Yes, 150 votes, 75%')).toBe(false)
      expect(dimmed('No, 50 votes, 42%')).toBe(false)
      expect(screen.getByText('150 to 50')).toBeInTheDocument()
    })

    it('says the state and its detail in one line per question on a phone', () => {
      desktop = false
      renderSummary(byQuestion(questions), 200)

      expect(screen.getByText('Turnout')).toBeInTheDocument()
      expect(screen.getByText('Closed. Yes, 150 to 50.')).toBeInTheDocument()
      expect(screen.getByText('Open. 120 votes.')).toBeInTheDocument()
      expect(screen.getByText('To open.')).toBeInTheDocument()
      expect(screen.getByText('3, question by question')).toBeInTheDocument()
    })

    it('shows a vote paused as a whole, with the held questions paused', () => {
      renderSummary(byQuestion([questions[0], question('q2', 'PAUSED', 120), questions[2]]), 200)

      expect(screen.getByText('1 closed · 1 paused · 1 to open')).toBeInTheDocument()
    })
  })

  it('says what the voting link is for', () => {
    renderSummary(createProcess({ census: { size: 312, authFields: ['memberNumber'], twoFaFields: ['email'] } }))

    expect(screen.getByText('Link to the digital ballot box. Share it with the eligible voters.')).toBeInTheDocument()
    expect(screen.getByLabelText('Voting Link')).toHaveAttribute('readonly')
  })

  it('renders the voter lookup when the census has a field to search by', () => {
    renderSummary(createProcess())

    expect(screen.getByText('CensusSearch')).toBeInTheDocument()
  })

  it('leaves the voter lookup out when the census has no such field', () => {
    renderSummary(createProcess({ census: { size: 312 } }))

    expect(screen.queryByText('CensusSearch')).toBeNull()
  })
})

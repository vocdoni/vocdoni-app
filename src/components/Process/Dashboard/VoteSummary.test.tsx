import type { VotingProcessResponse } from '@vocdoni/api-types'
import { fireEvent, render, screen, TestMemoryRouter } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { VoteSummary } from './VoteSummary'

let desktop = true
let canManage = true
let currentElection: VotingProcessResponse
const cloneAsDraft = vi.fn()

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  // The package's own results, kept for legacy questions Resum cannot decode.
  return { ...actual, ...getReactProvidersMock(), ElectionResults: () => <div>ElectionResults</div> }
})
vi.mock('~utils/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~utils/analytics')>()),
  trackAnalyticsEvent: vi.fn(),
}))
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
vi.mock('~queries/question-status', () => ({
  useQuestionStatusAction: () => ({ change: vi.fn(), isBusy: false }),
}))

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
const byQuestionReady = () =>
  createProcess({
    initialStatus: 'PAUSED',
    startDate: '2099-01-01T10:00:00Z',
    questions: [question('q1', 'PAUSED'), question('q2', 'PAUSED'), question('q3', 'PAUSED')],
  })

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
  vi.mocked(trackAnalyticsEvent).mockClear()
})

const resultsViewed = () =>
  vi.mocked(trackAnalyticsEvent).mock.calls.filter(([event]) => event.name === AnalyticsEvents.ProcessResultsViewed)

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
      expect(screen.getByText('Single choice')).toBeInTheDocument()
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

    it('says how voters authenticate: factors joined by plus, a code with its channels joined by or', () => {
      renderSummary(
        createProcess({ census: { size: 312, authFields: ['memberNumber'], twoFaFields: ['email', 'phone'] } }),
        184
      )

      expect(screen.getByText('Authentication method')).toBeInTheDocument()
      expect(screen.getByText(textContent('Member Number plus one-time code, by email or SMS.'))).toBeInTheDocument()
    })

    it('names a single channel without a comma, and fields alone when no code is sent', () => {
      const { unmount } = renderSummary(
        createProcess({ census: { size: 312, authFields: ['name', 'nationalId'], twoFaFields: ['phone'] } }),
        184
      )
      expect(
        screen.getByText(textContent('First Name plus National ID plus one-time code by SMS.'))
      ).toBeInTheDocument()
      unmount()

      renderSummary(createProcess(), 184)
      expect(screen.getByText(textContent('Member Number.'))).toBeInTheDocument()
    })

    it('shows seven facts and the turnout of each question on a phone, with the calendar and without the voting data', () => {
      desktop = false
      renderSummary(createProcess(), 184)

      for (const label of ['Census', 'Questions', 'Closes', 'Results', 'Type', 'Anonymity', 'Vote change']) {
        expect(screen.getByText(label)).toBeInTheDocument()
      }
      expect(screen.getByText('Anonymous').closest('[data-part="trigger"]')).not.toBeNull()
      expect(screen.getByText('Cannot be changed')).toBeInTheDocument()
      expect(screen.getAllByText('Turnout: 184 of 312').length).toBeGreaterThan(0)
      expect(screen.getByText('Calendar')).toBeInTheDocument()
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

    it('reads an ended vote on Summary itself, with no way to a results page', () => {
      renderSummary(createProcess({ questions: [question('q1', 'ENDED', 184)] }), 184)

      expect(screen.getByRole('heading', { name: 'Vote ended with 184 votes' })).toBeInTheDocument()
      expect(
        screen.getByText('59% of the census voted. The results are final and voters can already see them.')
      ).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'Show the results' })).not.toBeInTheDocument()
      expect(screen.queryByText(/results page/)).not.toBeInTheDocument()
    })

    it('says a closed vote is being counted while its tally is not served yet', () => {
      renderSummary(createProcess({ questions: [question('q1', 'ENDED', 184)] }), 184)

      expect(
        screen.getByText('The vote is closed. The results are being counted and will show here shortly.')
      ).toBeInTheDocument()
      expect(resultsViewed()).toHaveLength(0)
    })

    it('shows the final tally of a vote whose results are out, and no counting message', () => {
      renderSummary(createProcess({ questions: [question('q1', 'RESULTS', 181, ['150', '31'])] }), 181)

      expect(screen.getByRole('progressbar', { name: 'Yes, 150 votes, 83%' })).toBeInTheDocument()
      expect(screen.queryByText(/being counted/)).not.toBeInTheDocument()
    })

    it('draws the same bars under each question on a phone once results are public', () => {
      desktop = false
      renderSummary(createProcess({ questions: [question('q1', 'ONGOING', 181, ['150', '31'])] }), 184)

      expect(screen.getByRole('progressbar', { name: 'Yes, 150 votes, 83%' })).toBeInTheDocument()
      expect(screen.getByRole('progressbar', { name: 'No, 31 votes, 17%' })).toBeInTheDocument()
    })

    it('draws no bars on a phone while a secret tally is hidden', () => {
      desktop = false
      renderSummary(
        createProcess({ questions: [{ ...question('q1', 'ONGOING', 181, ['150', '31']), secretUntilTheEnd: true }] }),
        184
      )

      expect(screen.queryAllByRole('progressbar', { name: /votes/ })).toHaveLength(0)
      expect(resultsViewed()).toHaveLength(0)
    })

    it('reports the results viewed once per vote, with the old Results tab props', () => {
      const election = createProcess({ questions: [question('q1', 'ONGOING', 181, ['150', '31'])] })
      const { rerender } = renderSummary(election, 184)
      rerender(
        <TestMemoryRouter>
          <VoteSummary />
        </TestMemoryRouter>
      )

      expect(resultsViewed()).toEqual([
        [
          {
            name: AnalyticsEvents.ProcessResultsViewed,
            props: { election_id: '0xabc', status: 'unknown', vote_count: 184, census_size: 312, turnout_pct: 59 },
          },
        ],
      ])
    })

    it("lists a legacy vote's undecodable questions through the package's results instead of guessing", () => {
      const untyped = { ...question('q1', 'RESULTS', 5, ['3', '2']), type: '', ballotProtocol: undefined }
      renderSummary(createProcess({ legacy: true, questions: [untyped] }), 5)

      expect(screen.getByText('ElectionResults')).toBeInTheDocument()
      expect(screen.queryAllByRole('progressbar', { name: /votes/ })).toHaveLength(0)
    })

    it('decodes the tally of a legacy vote whose questions carry a ballot type', () => {
      renderSummary(createProcess({ legacy: true, questions: [question('q1', 'RESULTS', 181, ['150', '31'])] }), 181)

      expect(screen.queryByText('ElectionResults')).not.toBeInTheDocument()
      expect(screen.getByRole('progressbar', { name: 'Yes, 150 votes, 83%' })).toBeInTheDocument()
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

    it('runs the questions from Summary: counts, next step and the open question with its buttons', () => {
      renderSummary(byQuestion(questions), 200)

      expect(screen.getByText('1 closed · 1 open · 1 to open')).toBeInTheDocument()
      expect(screen.getByText('Next step: close question 2')).toBeInTheDocument()
      // The closed line says its turnout, never a verdict.
      expect(screen.getByText(textContent('64% turnout'))).toBeInTheDocument()
      expect(screen.queryByText(/150 to 50/)).not.toBeInTheDocument()
      expect(screen.getByText('Turnout: 120 of 312')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Pause: question 2, Question q2' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Close: question 2, Question q2' })).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'Manage questions' })).not.toBeInTheDocument()
      expect(screen.queryByRole('region', { name: 'Vote controls' })).not.toBeInTheDocument()
    })

    it('draws the bars of an open question with a public tally, and of a closed one once opened', () => {
      renderSummary(
        byQuestion([
          question('q1', 'ENDED', 200, ['150', '50']),
          question('q2', 'ONGOING', 120, ['70', '50']),
          question('q3', 'PAUSED', 0, ['0', '0']),
        ]),
        200
      )
      const bars = (name: string) => screen.queryAllByRole('progressbar', { name })

      expect(bars('Yes, 70, 58%')).toHaveLength(1)
      expect(bars('Yes, 150, 75%')).toHaveLength(0)
      fireEvent.click(screen.getByRole('button', { name: /^Question 1: Question q1/ }))
      expect(bars('Yes, 150, 75%')).toHaveLength(1)
      expect(bars('Yes, 0, 0%')).toHaveLength(0)
    })

    it('says where it stands in place of the figure on a phone before it starts, with no bottom bar', () => {
      desktop = false
      renderSummary(byQuestionReady(), 0)

      expect(screen.getByRole('heading', { name: 'It has not started yet' })).toBeInTheDocument()
      expect(screen.queryByText('Turnout')).not.toBeInTheDocument()
      expect(screen.getByText('none open')).toBeInTheDocument()
      expect(screen.getByText('3, question by question')).toBeInTheDocument()
      expect(screen.queryByRole('region', { name: 'Vote controls' })).not.toBeInTheDocument()
    })

    it('docks the open question at the bottom of a phone, with the turnout hero above', () => {
      desktop = false
      renderSummary(byQuestion(questions), 200)

      expect(screen.getByText('Turnout')).toBeInTheDocument()
      expect(screen.getByText('Closed. 64% turnout.')).toBeInTheDocument()
      expect(screen.getByText('1 closed, 1 open, 1 to open')).toBeInTheDocument()
      expect(screen.getByRole('region', { name: 'Vote controls' })).toHaveTextContent('2. Question q2')
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

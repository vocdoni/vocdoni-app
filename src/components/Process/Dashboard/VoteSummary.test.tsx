import type { VotingProcessResponse } from '@vocdoni/api-types'
import { QueryKeys } from '~queries/keys'
import { createTestQueryClient, fireEvent, render, screen, TestMemoryRouter, within } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { VoteSummary } from './VoteSummary'

let phone = false
let canManage = true
let currentElection: VotingProcessResponse
const cloneAsDraft = vi.fn()

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  // The package's own results, kept for legacy questions Gestió cannot decode.
  return { ...actual, ...getReactProvidersMock(), ElectionResults: () => <div>ElectionResults</div> }
})
vi.mock('~utils/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~utils/analytics')>()),
  trackAnalyticsEvent: vi.fn(),
}))
vi.mock('~queries/process-end-date', () => ({ useProcessEarlyEndDate: () => ({ data: null }) }))
// Gestió is one tree at every width but for the phone's bottom bar and, held for the owner, the voting data card.
vi.mock('~components/ui/useIsMobile', () => ({ useIsMobile: () => phone, useIsDesktop: () => !phone }))
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

const renderSummary = (election: VotingProcessResponse, voteCount?: number, queryClient = createTestQueryClient()) => {
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
    </TestMemoryRouter>,
    { queryClient }
  )
}

const textContent = (text: string) => (_: string, element: Element | null) =>
  element?.textContent === text && Array.from(element.children).every((child) => child.textContent !== text)
// The innermost element whose text, its children's included, matches.
const textMatching = (pattern: RegExp) => (_: string, element: Element | null) =>
  !!element?.textContent?.match(pattern) &&
  Array.from(element.children).every((child) => !child.textContent?.match(pattern))

beforeEach(() => {
  phone = false
  canManage = true
  cloneAsDraft.mockClear()
  vi.mocked(trackAnalyticsEvent).mockClear()
})

const resultsViewed = () =>
  vi.mocked(trackAnalyticsEvent).mock.calls.filter(([event]) => event.name === AnalyticsEvents.ProcessResultsViewed)

describe('VoteSummary', () => {
  describe('an all-at-once vote', () => {
    it('says in a sentence how many voted, how long is left and draws the bar from 0 to the census', () => {
      renderSummary(createProcess(), 184)

      const card = within(screen.getByRole('region', { name: '184 of 312 people have voted, 59%.' }))
      expect(card.getByText(textMatching(/^.+ left to vote\.$/))).toBeInTheDocument()
      expect(card.getByRole('progressbar', { name: '184 of 312 people voted, 59%' })).toBeInTheDocument()
      expect(card.getByText('0')).toBeInTheDocument()
      expect(card.getByText('312')).toBeInTheDocument()
      // Text first: no big figure, no label, no facts in the card (R34).
      expect(screen.queryByText('59')).toBeNull()
      expect(screen.queryByText('Turnout')).toBeNull()
      expect(card.queryAllByRole('term')).toHaveLength(0)
      expect(screen.queryByText('All open at once')).not.toBeInTheDocument()
    })

    it('says the vote is paused under the headline of a paused vote', () => {
      renderSummary(createProcess({ questions: [question('q1', 'PAUSED', 184)] }), 184)

      expect(screen.getByRole('heading', { name: '184 of 312 people have voted, 59%.' })).toBeInTheDocument()
      expect(screen.getByText(textContent('The vote is paused.'))).toBeInTheDocument()
    })

    it('lists the voting data in order: census, authentication, closing and results', () => {
      renderSummary(createProcess(), 184)

      const card = screen.getByRole('region', { name: 'Voting data' })
      const titles = within(card)
        .getAllByText(/^(Census|Authentication method|Closing|Closed|Results)$/)
        .map((title) => title.textContent)
      expect(titles).toEqual(['Census', 'Authentication method', 'Closing', 'Results'])
      expect(within(card).getByText(textContent('312 people with the right to vote.'))).toBeInTheDocument()
      expect(within(card).getByText(textContent('Member number.'))).toBeInTheDocument()
      expect(within(card).getByText(/^Friday, January 2(, 2099)? at \d\d:00\.$/)).toBeInTheDocument()
      expect(within(card).getByText('They show live, during the vote.')).toBeInTheDocument()
      // No quorum and no count of who has not voted (R34); anonymity, type and vote overwrite are not facts here.
      expect(screen.queryByText(/have not voted yet/)).toBeNull()
      expect(screen.queryByText(/quorum/i)).toBeNull()
      for (const label of ['Anonymity', 'Type', 'Vote overwrite', 'Questions']) {
        expect(within(card).queryByText(label)).toBeNull()
      }
    })

    it('words the results row and line for a secret vote as the board does', () => {
      renderSummary(createProcess({ questions: [{ ...question('q1', 'ONGOING', 184), secretUntilTheEnd: true }] }), 184)

      expect(screen.getByText('They will show when the vote closes.')).toBeInTheDocument()
      expect(screen.getByText('The results will show when the vote closes.')).toBeInTheDocument()
    })

    it('puts the voting link first in the column beside the questions', () => {
      renderSummary(createProcess({ questions: [question('q1', 'RESULTS', 181, ['150', '31'])] }), 181)

      const order = ['To share', 'Download the results', 'Voting data', 'Calendar'].map((name) =>
        screen.getByRole('heading', { name })
      )
      order.reduce((previous, next) => {
        expect(previous.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
        return next
      })
    })

    it('adds no deadline under the ruler of a live vote: the header says it', () => {
      renderSummary(createProcess(), 184)

      expect(screen.queryByText(/^Closes .+ left/)).not.toBeInTheDocument()
    })

    it('shows how many answered each question, how many left it blank and how it is answered', () => {
      renderSummary(createProcess({ questions: [question('q1', 'ONGOING', 181), question('q2', 'ONGOING', 184)] }), 184)

      expect(screen.getByText('Turnout: 181 of 312')).toBeInTheDocument()
      expect(screen.getByText('3 of the 184 voters left it blank.')).toBeInTheDocument()
      const card = within(screen.getByRole('region', { name: 'Questions' }))
      expect(card.getAllByText('Single choice')).toHaveLength(2)
      expect(screen.getByText('All open at once')).toBeInTheDocument()
    })

    it('shows the result of each question last, once results are public', () => {
      renderSummary(
        createProcess({ questions: [question('q1', 'ONGOING', 181, ['150', '31']), question('q2', 'ONGOING', 184)] }),
        184
      )

      // One bar per choice with its votes, after the turnout and the blank note; no winner sentence, no label.
      const bar = screen.getByRole('progressbar', { name: 'Yes, 150 votes, 83%' })
      expect(screen.getByRole('progressbar', { name: 'No, 31 votes, 17%' })).toBeInTheDocument()
      const blank = screen.getByText('3 of the 184 voters left it blank.')
      expect(blank.compareDocumentPosition(bar) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      expect(screen.queryByText(/wins with|150 to 31/)).not.toBeInTheDocument()
      expect(screen.queryByText('Provisional result')).not.toBeInTheDocument()
      expect(screen.queryByRole('img', { name: 'Winning choice' })).not.toBeInTheDocument()
    })

    it('draws the tally of a ranked question, which names no leader, once it is public', () => {
      const ranked = {
        ...question('q1', 'RESULTS', 10),
        type: undefined,
        metadata: { type: { name: 'ranked' } },
        ballotProtocol: { ...PROTOCOL, maxCount: 3, maxValue: 2, uniqueValues: true },
        choices: [
          { title: { default: 'Roof' }, value: 0 },
          { title: { default: 'Heating' }, value: 1 },
          { title: { default: 'Ramp' }, value: 2 },
        ],
        results: {
          voteCount: 10,
          finalResults: true,
          results: [
            ['1', '2', '7'],
            ['3', '5', '2'],
            ['6', '3', '1'],
          ],
        },
      }
      renderSummary(createProcess({ questions: [ranked] }), 10)

      expect(screen.getByRole('progressbar', { name: 'Roof, 16 points, 53%' })).toBeInTheDocument()
      expect(screen.queryByText(/being counted/)).not.toBeInTheDocument()
      expect(resultsViewed()).toHaveLength(1)
    })

    it('says nobody left a question blank when everyone answered it', () => {
      renderSummary(createProcess({ questions: [question('q1', 'ONGOING', 184)] }), 184)

      expect(screen.getByText('Nobody left it blank.')).toBeInTheDocument()
    })

    it('counts blank votes from the process read alone, so a newer results read cannot make someone blank', () => {
      renderSummary(createProcess({ questions: [question('q1', 'ONGOING', 184)] }), 186)

      expect(screen.getByText('Nobody left it blank.')).toBeInTheDocument()
    })

    it('keeps the vote count of the process read over the served tally, which still draws the bars', () => {
      const election = createProcess({ questions: [question('q1', 'ONGOING', 190, ['150', '31'])] })
      currentElection = election
      setReactProvidersMock({
        useElection: () => ({
          election,
          results: { questions: [{ questionId: 'q1', voteCount: 180, results: [['160', '20']] }] },
        }),
      })
      render(
        <TestMemoryRouter>
          <VoteSummary />
        </TestMemoryRouter>,
        { queryClient: createTestQueryClient() }
      )

      expect(screen.getByText('Turnout: 190 of 312')).toBeInTheDocument()
      expect(screen.getByRole('progressbar', { name: 'Yes, 160 votes, 89%' })).toBeInTheDocument()
    })

    it('says nothing about blank votes on a question with its own electorate, and divides it by that electorate', () => {
      const restricted = { ...question('q2', 'ONGOING', 40), eligibleMemberIds: Array.from({ length: 50 }, String) }
      renderSummary(createProcess({ questions: [question('q1', 'ONGOING', 200), restricted] }), 200)

      expect(screen.getByText('Turnout: 40 of 50')).toBeInTheDocument()
      expect(screen.queryByText(/of the 200 voters left it blank/)).not.toBeInTheDocument()
    })

    it('shows a question count without a share to someone who cannot manage the vote', () => {
      canManage = false
      renderSummary(createProcess({ questions: [question('q1', 'ONGOING', 181)] }), 184)

      expect(screen.getByText('181 votes')).toBeInTheDocument()
      expect(screen.queryByText('Turnout: 181 of 312')).not.toBeInTheDocument()
      expect(screen.queryByText(/left it blank/)).not.toBeInTheDocument()
    })

    it('links the ballot from the questions card', () => {
      renderSummary(createProcess(), 184)

      expect(screen.getByRole('link', { name: 'Ballot' })).toHaveAttribute('href', '/admin/process/0xabc/ballot')
    })

    it('shows the calendar', () => {
      renderSummary(createProcess(), 184)

      expect(screen.getByText('Vote opened')).toBeInTheDocument()
      expect(screen.getByText('Today')).toBeInTheDocument()
      expect(screen.getByText('Automatic closing and results for everyone')).toBeInTheDocument()
    })

    it('says how voters authenticate in one sentence: the fields as a list, then the code and its channels', () => {
      renderSummary(
        createProcess({ census: { size: 312, authFields: ['memberNumber'], twoFaFields: ['email', 'phone'] } }),
        184
      )

      expect(screen.getByText('Authentication method')).toBeInTheDocument()
      expect(
        screen.getByText(textContent('Member number, plus a one-time code sent by email or SMS.'))
      ).toBeInTheDocument()
    })

    it('lists several fields in the page language, a single channel, and fields alone when no code is sent', () => {
      const { unmount } = renderSummary(
        createProcess({ census: { size: 312, authFields: ['name', 'surname', 'nationalId'], twoFaFields: ['phone'] } }),
        184
      )
      expect(
        screen.getByText(textContent('Name, Surname, and National ID, plus a one-time code sent by SMS.'))
      ).toBeInTheDocument()
      unmount()

      renderSummary(createProcess(), 184)
      expect(screen.getByText(textContent('Member number.'))).toBeInTheDocument()
    })

    it('leaves the ballot type and vote overwrite out when the questions do not share them', () => {
      const multiple = {
        ...question('q2', 'ONGOING', 100),
        type: 'multichoice',
        ballotProtocol: { ...PROTOCOL, maxCount: 2, maxVoteOverwrites: 3 },
      }
      renderSummary(createProcess({ questions: [question('q1', 'ONGOING', 184), multiple] }), 184)

      expect(screen.queryByText('Type')).toBeNull()
      expect(screen.queryByText('Vote overwrite')).toBeNull()
      expect(screen.getByText('Census')).toBeInTheDocument()
    })

    it('says a paused vote is paused in the calendar, and leaves what it means to the banner', () => {
      renderSummary(createProcess({ questions: [question('q1', 'PAUSED', 184)] }), 184)

      expect(screen.queryByText(/Turnout will not move/)).not.toBeInTheDocument()
      expect(screen.getByText('Today. Vote paused')).toBeInTheDocument()
    })

    it('shows the idle card instead of the hero before it opens', () => {
      renderSummary(createProcess({ startDate: '2099-01-01T10:00:00Z' }), 0)

      expect(screen.getByRole('heading', { name: /^Opens by itself / })).toBeInTheDocument()
      expect(screen.getByText('312 people in the census and 1 question.')).toBeInTheDocument()
      expect(screen.queryByText('%')).toBeNull()
    })

    it('reads an ended vote on Summary itself, with no way to a results page', () => {
      renderSummary(createProcess({ questions: [question('q1', 'ENDED', 184)] }), 184)

      // The same turnout card as a live vote, worded for a closed one.
      expect(screen.getByRole('heading', { name: '184 of 312 people have voted, 59%.' })).toBeInTheDocument()
      expect(screen.getByText('The results are final and voters can already see them.')).toBeInTheDocument()
      const data = within(screen.getByRole('region', { name: 'Voting data' }))
      expect(data.getByText('Closed')).toBeInTheDocument()
      expect(data.getByText('Public now.')).toBeInTheDocument()
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

    it('offers the results in CSV and the final report on a closed vote only', () => {
      const { unmount } = renderSummary(
        createProcess({ questions: [question('q1', 'RESULTS', 181, ['150', '31'])] }),
        181
      )

      expect(screen.getByRole('region', { name: 'Download the results' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Download the results in CSV' })).toBeEnabled()
      expect(screen.getByRole('button', { name: 'Download the final report in PDF' })).toBeInTheDocument()
      unmount()

      renderSummary(createProcess(), 184)
      expect(screen.queryByRole('region', { name: 'Download the results' })).not.toBeInTheDocument()
    })

    it('keeps the CSV off while a closed vote has no tally yet', () => {
      renderSummary(createProcess({ questions: [question('q1', 'ENDED', 184)] }), 184)

      expect(screen.getByRole('button', { name: 'Download the results in CSV' })).toBeDisabled()
    })

    it('drops the counting message once the tally of an ended vote is on screen', () => {
      // The dev backend serves the tally of a vote ended by hand while its questions still read ENDED.
      renderSummary(createProcess({ questions: [question('q1', 'ENDED', 181, ['150', '31'])] }), 181)

      expect(screen.getByRole('progressbar', { name: 'Yes, 150 votes, 83%' })).toBeInTheDocument()
      expect(screen.queryByText(/being counted/)).not.toBeInTheDocument()
    })

    it('draws no bars while a secret tally is hidden', () => {
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

    it('shows the count without a share, a ruler or a census fact when the census size is unknown', () => {
      renderSummary(createProcess({ census: {}, questions: [question('q1', 'ONGOING', 10)] }), 10)

      expect(screen.getByRole('heading', { name: '10 people have voted.' })).toBeInTheDocument()
      expect(screen.queryByRole('progressbar', { name: /people voted/ })).toBeNull()
      expect(screen.queryByText(/of \d+ people/)).toBeNull()
      expect(screen.queryByText('Census')).toBeNull()
      expect(screen.queryByText(/^0 people/)).toBeNull()
    })

    it('puts the verb in the singular for one voter, whatever the census', () => {
      renderSummary(createProcess({ questions: [question('q1', 'ONGOING', 1)] }), 1)

      expect(screen.getByRole('heading', { name: '1 of 312 people has voted, 1%.' })).toBeInTheDocument()
    })

    it('falls back to the counts the process read carries when the results are not served', () => {
      renderSummary(createProcess({ questions: [question('q1', 'ENDED', 181)] }))

      expect(screen.getByRole('heading', { name: '181 of 312 people have voted, 58%.' })).toBeInTheDocument()
      expect(screen.queryByText(/^0 of 312/)).toBeNull()
    })

    it('says the turnout could not be loaded when the results fail and the process carries no count', () => {
      const queryClient = createTestQueryClient()
      queryClient
        .getQueryCache()
        .build(queryClient, { queryKey: QueryKeys.election.results('0xabc') })
        .setState({ status: 'error', error: new Error('500') })
      const uncounted = { ...question('q1', 'ENDED'), results: undefined }
      renderSummary(createProcess({ questions: [uncounted] }), undefined, queryClient)

      expect(screen.getByText('The turnout could not be loaded.')).toBeInTheDocument()
      expect(screen.queryByText(/^0 of 312/)).toBeNull()
      expect(screen.queryByText('%')).toBeNull()
    })

    it('says nobody has voted yet rather than a zero count', () => {
      renderSummary(createProcess({ questions: [question('q1', 'ONGOING', 0)] }), 0)

      expect(screen.getByText('Nobody has voted yet.')).toBeInTheDocument()
    })
  })

  describe('a question-by-question vote', () => {
    const questions = [
      question('q1', 'ENDED', 200, ['150', '50']),
      question('q2', 'ONGOING', 120),
      question('q3', 'PAUSED'),
    ]

    it('words the count as a floor, and lists the same voting data as an all-at-once vote', () => {
      renderSummary(byQuestion(questions), 200)

      expect(
        screen.getByRole('heading', { name: 'At least 200 of 312 people have voted on a question, 64%.' })
      ).toBeInTheDocument()
      expect(screen.getByText(textMatching(/^.+ left to vote\.$/))).toBeInTheDocument()
      const card = within(screen.getByRole('region', { name: 'Voting data' }))
      expect(card.getByText('Closing')).toBeInTheDocument()
      expect(card.getByText('They show live, during the vote.')).toBeInTheDocument()
    })

    it('says nobody has voted yet on a started vote with no votes, and when each question shows its results', () => {
      const secret = (id: string, status: string) => ({ ...question(id, status, 0), secretUntilTheEnd: true })
      renderSummary(byQuestion([secret('q1', 'ONGOING'), secret('q2', 'PAUSED')]), 0)

      expect(screen.getByRole('heading', { name: 'Nobody has voted yet.' })).toBeInTheDocument()
      expect(screen.getByText('They show when each question closes.')).toBeInTheDocument()
    })

    it('words the floor without a share or a bar when the census size is unknown', () => {
      renderSummary(
        createProcess({ initialStatus: 'PAUSED', census: {}, questions: [question('q1', 'ONGOING', 10)] }),
        10
      )

      expect(screen.getByRole('heading', { name: 'At least 10 people have voted on a question.' })).toBeInTheDocument()
      expect(screen.queryByRole('progressbar', { name: /voted on a question/ })).toBeNull()
    })

    it('says where it stands in place of the figure once canceled', () => {
      const voided = (id: string) => ({ ...question(id, 'CANCELED', 10), endedAt: '2026-03-01T10:20:00Z' })
      renderSummary(byQuestion([voided('q1'), voided('q2')]), 10)

      expect(screen.getByRole('heading', { name: 'Vote canceled' })).toBeInTheDocument()
      expect(screen.getByText('The votes cast were discarded. There are no results.')).toBeInTheDocument()
      expect(screen.queryByText('Turnout')).not.toBeInTheDocument()
      expect(screen.getByText('no results')).toBeInTheDocument()
      // The same card as an all-at-once vote, with the same way out.
      fireEvent.click(screen.getByRole('button', { name: 'Duplicate it' }))
      expect(cloneAsDraft).toHaveBeenCalledWith(expect.objectContaining({ id: '0xabc' }))
    })

    it('reads a closed vote as closed: when its last question closed, and public results', () => {
      const ended = (id: string, endedAt: string) => ({
        ...question(id, 'RESULTS', 200, ['150', '50']),
        endedAt,
      })
      renderSummary(byQuestion([ended('q1', '2026-03-01T10:20:00Z'), ended('q2', '2026-03-01T10:42:00Z')]), 200)

      const data = within(screen.getByRole('region', { name: 'Voting data' }))
      expect(data.getByText('Closed')).toBeInTheDocument()
      expect(data.getByText(/^Sunday, March 1(, 2026)? at \d\d:42\.$/)).toBeInTheDocument()
      expect(data.getByText('Public now.')).toBeInTheDocument()
      expect(screen.getByText('The results are final and voters can already see them.')).toBeInTheDocument()
    })

    it('runs the questions from Summary: counts, next step and the open question with its buttons', () => {
      renderSummary(byQuestion(questions), 200)

      expect(screen.getByText('1 closed, 1 open, 1 to open')).toBeInTheDocument()
      expect(screen.getByText('Next step: close question 2')).toBeInTheDocument()
      // The closed line says its turnout, never a verdict.
      expect(screen.getByText(textContent('64% turnout'))).toBeInTheDocument()
      expect(screen.queryByText(/150 to 50/)).not.toBeInTheDocument()
      expect(screen.getByText('Turnout: 120 of 312')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /^Pause: / })).not.toBeInTheDocument()
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

    it('says where it stands in place of the figure before it starts, with no bottom bar on a phone', () => {
      phone = true
      renderSummary(byQuestionReady(), 0)

      expect(screen.getByRole('heading', { name: 'It has not started yet' })).toBeInTheDocument()
      expect(screen.queryByRole('progressbar', { name: /people voted/ })).toBeNull()
      expect(screen.queryByRole('region', { name: 'Voting data' })).toBeNull()
      expect(screen.getByText('none open')).toBeInTheDocument()
      expect(screen.queryByRole('region', { name: 'Vote controls' })).not.toBeInTheDocument()
    })

    it('asks for the first question once the start has passed and none is open, never "not started"', () => {
      renderSummary(byQuestion([question('q1', 'PAUSED'), question('q2', 'PAUSED')]), 0)

      expect(screen.getByRole('heading', { name: 'No question is open yet' })).toBeInTheDocument()
      expect(screen.getByText('Open the first question to start the vote.')).toBeInTheDocument()
      expect(screen.queryByText('It has not started yet')).not.toBeInTheDocument()
    })

    it('tells someone who cannot manage the vote who opens the questions, without asking them to', () => {
      canManage = false
      renderSummary(byQuestion([question('q1', 'PAUSED'), question('q2', 'PAUSED')]), 0)

      expect(screen.getByRole('heading', { name: 'No question is open yet' })).toBeInTheDocument()
      expect(screen.getByText('The organizer opens the questions one at a time.')).toBeInTheDocument()
      expect(screen.queryByText('Open the first question to start the vote.')).not.toBeInTheDocument()
    })

    it('docks the open question at the bottom of a phone, with the turnout hero above', () => {
      phone = true
      renderSummary(byQuestion(questions), 200)

      expect(screen.getByRole('heading', { name: /^At least 200 of 312/ })).toBeInTheDocument()
      expect(screen.getByText(textContent('64% turnout'))).toBeInTheDocument()
      expect(screen.getByText('1 closed, 1 open, 1 to open')).toBeInTheDocument()
      expect(screen.getByRole('region', { name: 'Vote controls' })).toHaveTextContent('2. Question q2')
    })

    it('shows a vote paused as a whole, with the held questions paused', () => {
      renderSummary(byQuestion([questions[0], question('q2', 'PAUSED', 120), questions[2]]), 200)

      expect(screen.getByText('1 closed, 1 paused, 1 to open')).toBeInTheDocument()
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

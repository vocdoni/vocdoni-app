import type { VotingProcessResponse } from '@vocdoni/api-types'
import { fireEvent, render, screen, TestMemoryRouter, within } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { VoteBallot } from './VoteBallot'

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
vi.mock('~components/Actions/ActionsContext', async () => {
  const { deriveVoteState } = await import('~utils/vote-state')
  return {
    useActions: () => {
      const now = new Date()
      return {
        canManage,
        now,
        state: deriveVoteState(currentElection, now),
        votePause: { isHeld: false, heldQuestionIds: [] },
      }
    },
  }
})
vi.mock('./use-clone-as-draft', () => ({ useCloneAsDraft: () => ({ cloneAsDraft, isCloning: false }) }))

const PROTOCOL = {
  maxCount: 1,
  maxValue: 2,
  maxVoteOverwrites: 0,
  costExponent: 1,
  uniqueValues: false,
  maxTotalCost: 0,
  costFromWeight: false,
}

const choices = (...labels: string[]) => labels.map((label, value) => ({ title: { default: label }, value }))

const QUESTIONS = [
  {
    id: 'q1',
    title: { default: 'Do you approve the accounts?' },
    choices: choices('Yes', 'No', 'Abstain'),
    ballotProtocol: PROTOCOL,
    type: 'singlechoice',
    status: 'ONGOING',
  },
  {
    id: 'q2',
    title: { default: 'Share 10 points' },
    choices: choices('Culture', 'Sports'),
    ballotProtocol: { ...PROTOCOL, maxCount: 2, maxValue: 0, maxTotalCost: 10 },
    type: 'budget-based',
    status: 'ONGOING',
  },
]

const createProcess = (overrides: Record<string, unknown> = {}) =>
  ({
    id: '0xabc',
    orgAddress: '0xorg',
    title: { default: 'General assembly' },
    description: { default: 'We vote on the four items of the agenda.' },
    startDate: '2026-01-01T10:00:00Z',
    endDate: '2099-01-02T10:00:00Z',
    published: true,
    census: { size: 312, anonymous: false },
    questions: QUESTIONS,
    ...overrides,
  }) as unknown as VotingProcessResponse

const renderBallot = (election: VotingProcessResponse) => {
  currentElection = election
  setReactProvidersMock({ useElection: () => ({ election, results: null }) })
  return render(
    <TestMemoryRouter>
      <VoteBallot />
    </TestMemoryRouter>
  )
}

beforeEach(() => {
  desktop = true
  canManage = true
  cloneAsDraft.mockClear()
})

describe('VoteBallot', () => {
  it('shows the intro text and each question with its rule and options', () => {
    renderBallot(createProcess())

    expect(screen.getByRole('heading', { name: 'What voters see' })).toBeInTheDocument()
    expect(screen.getByText('2 questions, all at once')).toBeInTheDocument()
    expect(screen.getByText('We vote on the four items of the agenda.')).toBeInTheDocument()

    const first = screen.getByRole('list', { name: 'Options of question 1' })
    expect(
      within(first)
        .getAllByRole('listitem')
        .map((item) => item.textContent)
    ).toEqual(['Yes', 'No', 'Abstain'])
    expect(screen.getByText('Pick one option.')).toBeInTheDocument()
    expect(screen.getByText('One option')).toBeInTheDocument()

    // A points box shows its empty amount before each option.
    const second = screen.getByRole('list', { name: 'Options of question 2' })
    expect(
      within(second)
        .getAllByRole('listitem')
        .map((item) => item.textContent)
    ).toEqual(['0Culture', '0Sports'])
    expect(screen.getByText('10 points per person')).toBeInTheDocument()
  })

  it("renders a question's own text under its title as markdown, as voters read it", () => {
    const described = {
      ...QUESTIONS[0],
      description: { default: 'See **article 4** of the [statutes](https://example.org).' },
    }
    renderBallot(createProcess({ questions: [described] }))

    expect(screen.getByText('article 4').tagName).toBe('STRONG')
    expect(screen.getByRole('link', { name: 'statutes' })).toHaveAttribute('href', 'https://example.org')
    expect(screen.queryByText(/\*\*/)).not.toBeInTheDocument()
  })

  it('opens the public page as a voter', () => {
    renderBallot(createProcess())

    expect(screen.getByRole('link', { name: /Show as voter/ })).toHaveAttribute('target', '_blank')
  })

  it('leaves the intro out when there is no description', () => {
    renderBallot(createProcess({ description: { default: '' } }))

    expect(screen.queryByRole('heading', { name: 'Intro text' })).not.toBeInTheDocument()
  })

  it('says how voting works: questions, how they are voted, vote overwrite and results', () => {
    renderBallot(createProcess())

    const facts = screen.getByRole('region', { name: 'How voting works' })
    const labels = within(facts)
      .getAllByRole('term')
      .map((term) => term.textContent)
    expect(labels).toEqual(['Questions', 'How they are voted', 'Vote overwrite', 'Results'])
    expect(within(facts).getByText('2')).toBeInTheDocument()
    expect(within(facts).getByText('All at once, on a single ballot')).toBeInTheDocument()
    expect(within(facts).getByText('Disabled')).toBeInTheDocument()
  })

  it('names the question-by-question mode', () => {
    renderBallot(createProcess({ initialStatus: 'PAUSED' }))

    expect(screen.getByText('2 questions, question by question')).toBeInTheDocument()
    expect(screen.getByText('Question by question, as they open')).toBeInTheDocument()
  })

  it('says the ballot is fixed and lets a manager cancel and duplicate a live vote', () => {
    renderBallot(createProcess())

    expect(screen.getByText('The ballot can no longer be changed')).toBeInTheDocument()
    expect(screen.getByText(/^Since the vote opened/)).toBeInTheDocument()
    expect(screen.getByText('Cancel the vote and duplicate it to correct it.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Duplicate' }))
    expect(cloneAsDraft).toHaveBeenCalledWith(expect.objectContaining({ id: '0xabc' }))
  })

  it('shortens the fix line on a phone', () => {
    desktop = false
    renderBallot(createProcess())

    expect(screen.getByText('Cancel the vote and duplicate it.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /As a voter/ })).toBeInTheDocument()
  })

  it('says it is fixed since it was published before the start', () => {
    renderBallot(createProcess({ startDate: '2099-01-01T10:00:00Z' }))

    expect(screen.getByText(/^Since the vote was published/)).toBeInTheDocument()
  })

  it('offers only to duplicate a vote that can no longer be canceled', () => {
    renderBallot(createProcess({ questions: QUESTIONS.map((question) => ({ ...question, status: 'RESULTS' })) }))

    expect(screen.getByText('Duplicate it to correct it in a new vote.')).toBeInTheDocument()
    expect(screen.queryByText(/^Cancel the vote/)).not.toBeInTheDocument()
  })

  it('shows no fix to someone who cannot manage the vote', () => {
    canManage = false
    renderBallot(createProcess())

    expect(screen.queryByText('Spotted a mistake?')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Duplicate' })).not.toBeInTheDocument()
  })

  it('lists a legacy question with no ballot type as plain options, without a rule', () => {
    renderBallot(
      createProcess({
        questions: [
          { id: 'q1', title: { default: 'Old question' }, choices: choices('A', 'B'), type: '', status: 'RESULTS' },
        ],
      })
    )

    expect(screen.getByRole('heading', { name: 'Old question' })).toBeInTheDocument()
    const options = screen.getByRole('list', { name: 'Options of question 1' })
    expect(
      within(options)
        .getAllByRole('listitem')
        .map((item) => item.textContent)
    ).toEqual(['A', 'B'])
    expect(screen.queryByText('One option')).not.toBeInTheDocument()
  })
})

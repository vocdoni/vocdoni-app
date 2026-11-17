import type { VotingProcessResponse } from '@vocdoni/api-types'
import type { ReactNode } from 'react'
import { fireEvent, render, screen, TestMemoryRouter, within } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { VoteHeader } from './VoteHeader'

const NOW = new Date('2026-03-10T12:00:00Z')
let canManage = true
let isDesktop = true
let currentElection: VotingProcessResponse
let earlyEndDate: Date | null = null

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return { ...actual, ...getReactProvidersMock() }
})

vi.mock('~components/Actions', () => {
  const ActionButton = ({ children, variant }: { children: ReactNode; variant?: string }) => (
    <button data-variant={variant}>{children}</button>
  )
  return {
    ActionPause: ActionButton,
    ActionContinue: ActionButton,
    ActionEnd: ActionButton,
    CancelVoteDialog: ({ open }: { open: boolean }) => (open ? <div role='dialog'>Cancel dialog</div> : null),
  }
})
// The provider's values, with the real state derivation (no pause memory: what another device sees).
vi.mock('~components/Actions/ActionsContext', async () => {
  const { deriveVoteState } = await import('~utils/vote-state')
  return {
    useActions: () => {
      const now = new Date()
      const state = deriveVoteState(currentElection, now)
      return { canManage, disabled: false, now, state, votePause: { isHeld: state === 'paused', heldQuestionIds: [] } }
    },
  }
})
vi.mock('~components/ui/useIsMobile', () => ({ useIsDesktop: () => isDesktop, useIsMobile: () => !isDesktop }))
vi.mock('./use-clone-as-draft', () => ({ useCloneAsDraft: () => ({ cloneAsDraft: vi.fn(), isCloning: false }) }))
vi.mock('~queries/process-end-date', () => ({ useProcessEarlyEndDate: () => ({ data: earlyEndDate }) }))
vi.mock('../VotingReportPdf/VotingReportPdfButton', () => ({
  useVotingReportPdfDownload: () => ({ report: {}, isPendingResults: false, isGenerating: false, download: vi.fn() }),
}))
vi.mock('~components/ui/ResponsiveMenu', () => ({
  ResponsiveMenu: ({
    label,
    items,
  }: {
    label: string
    items: { value: string; label: string; onSelect?: () => void }[]
  }) => (
    <ul aria-label={label}>
      {items.map((item) => (
        <li key={item.value}>
          <button onClick={item.onSelect}>{item.label}</button>
        </li>
      ))}
    </ul>
  ),
}))

type Question = { id: string; status: string; endedAt?: string; results?: { voteCount: number } }

const question = (id: string, status: string, extra: Partial<Question> = {}): Question => ({
  id,
  status,
  ...extra,
})

const createProcess = (overrides: Record<string, unknown> = {}, status = 'ONGOING', upstreamId?: string) =>
  ({
    id: '0xabc',
    orgAddress: '0xorg',
    title: { default: 'Board election' },
    startDate: '2026-03-01T10:00:00Z',
    endDate: '2026-03-12T12:00:00Z',
    published: true,
    census: {},
    questions: [{ id: 'q1', title: { default: 'Q' }, choices: [], status, upstreamId }],
    ...overrides,
  }) as unknown as VotingProcessResponse

const byQuestion = (questions: Question[], overrides: Record<string, unknown> = {}) =>
  createProcess({ initialStatus: 'PAUSED', questions, ...overrides })

const renderHeader = (election: VotingProcessResponse) => {
  currentElection = election
  setReactProvidersMock({ useElection: () => ({ election, status: election.questions[0].status }) })
  return render(
    <TestMemoryRouter>
      <VoteHeader />
    </TestMemoryRouter>
  )
}

/** The header's action buttons, in order, without the "More" menu. */
const actions = () =>
  screen
    .getAllByRole('button')
    .filter((button) => !button.closest('ul'))
    .map((button) => button.textContent)

const menu = () => screen.getByRole('list', { name: 'More actions' })

describe('VoteHeader', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] })
    vi.setSystemTime(NOW)
    canManage = true
    isDesktop = true
    earlyEndDate = null
  })
  afterEach(() => vi.useRealTimers())

  describe('all at once', () => {
    it('offers Pause and End now on a live vote, and says when it closes and how long is left', () => {
      renderHeader(createProcess())

      expect(actions()).toEqual(['Pause', 'End now'])
      expect(screen.getByText(/^Closes .+\. 2 days left\.$/)).toBeInTheDocument()
    })

    it('offers Resume, then End now, on a paused vote, and says the deadline does not stop', () => {
      renderHeader(createProcess({}, 'PAUSED'))

      expect(actions()).toEqual(['Resume', 'End now'])
      expect(screen.getByText(/^Closes .+\. The deadline does not stop\.$/)).toBeInTheDocument()
    })

    it('offers only More on a ready vote, and says when it opens and closes', () => {
      renderHeader(createProcess({ startDate: '2026-03-20T10:00:00Z', endDate: '2026-03-25T10:00:00Z' }, 'PAUSED'))

      expect(actions()).toEqual([])
      expect(screen.getByText(/^Opens .+ and closes .+\.$/)).toBeInTheDocument()
    })

    it('says an ended vote ended today', () => {
      earlyEndDate = new Date('2026-03-10T09:42:00Z')
      renderHeader(createProcess({}, 'RESULTS'))

      expect(actions()).toEqual([])
      expect(screen.getByText(/^Ended today, Tuesday, March 10, at \d\d:\d\d\.$/)).toBeInTheDocument()
    })

    it('says when an ended vote ended on another day', () => {
      earlyEndDate = new Date('2026-03-05T09:00:00Z')
      renderHeader(createProcess({}, 'RESULTS'))

      expect(screen.getByText(/^Ended Thursday, March 5 at \d\d:\d\d\.$/)).toBeInTheDocument()
    })

    it('says when a canceled vote was canceled and that the votes were discarded', () => {
      renderHeader(createProcess({ endedAt: '2026-03-10T09:42:00Z' }, 'CANCELED'))

      expect(screen.getByText(/^Today, Tuesday, March 10, at \d\d:\d\d\. The votes were discarded\.$/)).toBeVisible()
    })

    it('says the votes were discarded when the cancel time is unknown', () => {
      renderHeader(createProcess({}, 'CANCELED'))

      expect(screen.getByText('The votes were discarded.')).toBeInTheDocument()
    })
  })

  it('drops a sentence whose date the process lacks instead of printing it empty or as now', () => {
    const { unmount } = renderHeader(createProcess({ startDate: undefined, endDate: undefined }))
    expect(screen.queryByText(/Closes|Opens|Started/)).not.toBeInTheDocument()
    unmount()

    renderHeader(createProcess({ startDate: '2026-03-20T10:00:00Z', endDate: undefined }, 'PAUSED'))
    expect(screen.getByText(/^Starts Friday, March 20 at \d\d:\d\d\.$/)).toBeInTheDocument()
  })

  describe('question by question', () => {
    it('offers Pause the vote and End the vote, secondary, while a question is open', () => {
      renderHeader(byQuestion([question('q1', 'ENDED'), question('q2', 'ONGOING')]))

      expect(actions()).toEqual(['Pause the vote', 'End the vote'])
      expect(screen.getByRole('button', { name: 'End the vote' })).toHaveAttribute('data-variant', 'outline')
      expect(
        screen.getByText(
          /^Question by question\. Started Sunday, March 1 at \d\d:\d\d, 9 days ago\. Closes Thursday, March 12 at \d\d:\d\d\.$/
        )
      ).toBeVisible()
    })

    it('has nothing to pause when no question is open', () => {
      renderHeader(byQuestion([question('q1', 'ENDED'), question('q2', 'PAUSED')]))

      expect(actions()).toEqual(['End the vote'])
    })

    it('reads a vote whose questions are all closed as closed, with no action but its menu', () => {
      renderHeader(
        byQuestion([question('q1', 'ENDED'), question('q2', 'ONGOING', { endedAt: '2026-03-10T11:00:00Z' })])
      )

      expect(screen.queryByRole('button', { name: 'End the vote' })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'Show the results' })).not.toBeInTheDocument()
      expect(actions()).toEqual([])
      expect(screen.getByText('Closed')).toBeInTheDocument()
    })

    it('offers Pause and End now on a phone, and says when it started and when it closes', () => {
      isDesktop = false
      renderHeader(byQuestion([question('q1', 'ONGOING')]))

      expect(actions()).toEqual(['Pause', 'End now'])
      expect(
        screen.getByText(/^Started Sunday, March 1 at \d\d:\d\d\. Closes Thursday, March 12 at \d\d:\d\d\.$/)
      ).toBeInTheDocument()
    })

    it('offers Resume and End now on a phone while the vote is paused', () => {
      isDesktop = false
      renderHeader(byQuestion([question('q1', 'PAUSED', { results: { voteCount: 3 } })]))

      expect(actions()).toEqual(['Resume', 'End now'])
    })

    it('says when it starts on a phone, with no button: the API cannot start it early', () => {
      isDesktop = false
      renderHeader(byQuestion([question('q1', 'PAUSED')], { startDate: '2026-03-14T17:30:00Z' }))

      expect(actions()).toEqual([])
      expect(screen.getByText(/^Starts Saturday, March 14 at \d\d:\d\d\.$/)).toBeInTheDocument()
    })

    it('offers Duplicate it on a phone once the vote is canceled, and keeps it in More on the desktop', () => {
      isDesktop = false
      const canceled = byQuestion([question('q1', 'CANCELED', { endedAt: '2026-03-02T09:00:00Z' })])
      const { unmount } = renderHeader(canceled)
      expect(actions()).toEqual(['Duplicate it'])
      unmount()

      isDesktop = true
      renderHeader(canceled)
      expect(actions()).toEqual([])
    })

    it('shows a vote paused as a whole as paused, with Resume the vote first', () => {
      renderHeader(byQuestion([question('q1', 'PAUSED', { results: { voteCount: 3 } })]))

      expect(actions()).toEqual(['Resume the vote', 'End the vote'])
      expect(screen.getByText('Paused')).toBeInTheDocument()
      // The deadline a pause does not move, on the desktop too.
      expect(
        screen.getByText(
          /^Question by question\. Started Sunday, March 1 at \d\d:\d\d\. Closes Thursday, March 12 at \d\d:\d\d\. The deadline does not stop\.$/
        )
      ).toBeVisible()
    })

    it('offers only More before the first question opens, with the start date', () => {
      renderHeader(byQuestion([question('q1', 'PAUSED')], { startDate: '2026-03-14T17:30:00Z' }))

      expect(actions()).toEqual([])
      expect(
        screen.getByText(
          /^Saturday, March 14 at \d\d:\d\d\. Question by question\. Closes Thursday, March 12 at \d\d:\d\d\.$/
        )
      ).toBeVisible()
    })

    it('keeps only the menu on an ended vote and says when it ended and after how long', () => {
      earlyEndDate = new Date('2026-03-01T11:28:00Z')
      renderHeader(byQuestion([question('q1', 'ENDED'), question('q2', 'RESULTS')]))

      expect(screen.queryByRole('link', { name: 'Show the results' })).not.toBeInTheDocument()
      expect(actions()).toEqual([])
      expect(screen.getByText(/^On March 1 at \d\d:\d\d, after 1 hour and 28 minutes\.$/)).toBeVisible()
    })

    it("says a vote closed with its last question at that question's close, not at the schedule", () => {
      renderHeader(
        byQuestion([
          question('q1', 'ENDED', { endedAt: '2026-03-01T10:20:00Z' }),
          question('q2', 'RESULTS', { endedAt: '2026-03-01T10:42:00Z' }),
        ])
      )

      expect(screen.getByText(/^On March 1 at \d\d:\d\d, after 42 minutes\.$/)).toBeVisible()
    })

    it('says when a canceled vote was canceled', () => {
      renderHeader(byQuestion([question('q1', 'CANCELED', { endedAt: '2026-03-02T09:00:00Z' })]))

      expect(screen.getByText(/^On March 2 at \d\d:\d\d\. The votes were discarded\.$/)).toBeVisible()
    })
  })

  describe('More', () => {
    it('lists the voter page, duplicate, explorer and cancel', () => {
      renderHeader(createProcess({}, 'ONGOING', '0xchain'))

      expect(
        within(menu())
          .getAllByRole('button')
          .map((item) => item.textContent)
      ).toEqual(['Show as voter', 'Duplicate the vote', 'View in explorer', 'Cancel the vote'])
    })

    it('says Duplicate in the phone sheet', () => {
      isDesktop = false
      renderHeader(createProcess())

      expect(within(menu()).getByRole('button', { name: 'Duplicate' })).toBeInTheDocument()
    })

    it('asks before cancelling', () => {
      renderHeader(createProcess())

      expect(screen.queryByRole('dialog')).toBeNull()
      fireEvent.click(within(menu()).getByRole('button', { name: 'Cancel the vote' }))
      expect(screen.getByRole('dialog')).toHaveTextContent('Cancel dialog')
    })

    it('drops Cancel once a question is closed', () => {
      renderHeader(byQuestion([question('q1', 'ENDED'), question('q2', 'ONGOING')]))

      expect(menu()).not.toHaveTextContent('Cancel the vote')
    })

    it('leaves Duplicate and Cancel to those who can manage the vote', () => {
      canManage = false
      renderHeader(createProcess())

      expect(menu()).toHaveTextContent('Show as voter')
      expect(menu()).not.toHaveTextContent('Duplicate')
      expect(menu()).not.toHaveTextContent('Cancel the vote')
    })
  })
})

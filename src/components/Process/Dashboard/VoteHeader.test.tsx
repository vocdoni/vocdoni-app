import type { VotingProcessResponse } from '@vocdoni/api-types'
import type { ReactNode } from 'react'
import { render, screen, TestMemoryRouter } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { VoteHeader } from './VoteHeader'

const NOW = new Date('2026-03-10T12:00:00Z')
let canManage = true
let earlyEndDate: Date | null = null

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return { ...actual, ...getReactProvidersMock(), useConfirm: () => ({ confirm: vi.fn() }) }
})

vi.mock('~components/Actions', () => ({
  ActionPause: ({ children }: { children: ReactNode }) => <button>{children}</button>,
  ActionContinue: ({ children }: { children: ReactNode }) => <button>{children}</button>,
  ActionEnd: ({ children }: { children: ReactNode }) => <button>{children}</button>,
}))
vi.mock('~components/Actions/ActionsContext', () => ({
  useActions: () => ({ canManage, cancel: vi.fn(), disabled: false }),
}))
vi.mock('./use-clone-as-draft', () => ({ useCloneAsDraft: () => ({ cloneAsDraft: vi.fn(), isCloning: false }) }))
vi.mock('~queries/process-end-date', () => ({ useProcessEarlyEndDate: () => ({ data: earlyEndDate }) }))
vi.mock('../VotingReportPdf/VotingReportPdfButton', () => ({
  useVotingReportPdfDownload: () => ({ report: {}, isPendingResults: false, isGenerating: false, download: vi.fn() }),
}))
vi.mock('~components/ui/ResponsiveMenu', () => ({
  ResponsiveMenu: ({ items }: { items: { value: string; label: string }[] }) => (
    <ul aria-label='More'>
      {items.map((item) => (
        <li key={item.value}>{item.label}</li>
      ))}
    </ul>
  ),
}))

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

const renderHeader = (election: VotingProcessResponse) => {
  setReactProvidersMock({ useElection: () => ({ election, status: election.questions[0].status }) })
  return render(
    <TestMemoryRouter>
      <VoteHeader />
    </TestMemoryRouter>
  )
}

describe('VoteHeader', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] })
    vi.setSystemTime(NOW)
    canManage = true
    earlyEndDate = null
  })
  afterEach(() => vi.useRealTimers())

  it('offers Pause and End now on a live all-at-once vote', () => {
    renderHeader(createProcess())

    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'End now' })).toBeInTheDocument()
    expect(screen.getByText(/^Closes .*2 days left$/)).toBeInTheDocument()
  })

  it('offers Resume on a paused vote', () => {
    renderHeader(createProcess({}, 'PAUSED'))

    expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Pause' })).toBeNull()
  })

  it('offers End vote, and no Pause or Resume, on a question-by-question vote', () => {
    renderHeader(createProcess({ initialStatus: 'PAUSED' }, 'ONGOING'))

    expect(screen.getByRole('button', { name: 'End vote' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Pause' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Resume' })).toBeNull()
  })

  it('says no question is open on a live question-by-question vote with none ongoing', () => {
    renderHeader(
      createProcess({
        initialStatus: 'PAUSED',
        questions: [
          { id: 'q1', title: { default: 'Q' }, choices: [], status: 'ENDED' },
          { id: 'q2', title: { default: 'Q' }, choices: [], status: 'PAUSED' },
        ],
      })
    )

    expect(screen.getByText(/No question open\.$/)).toBeInTheDocument()
  })

  it('says when a ready vote starts', () => {
    renderHeader(createProcess({ startDate: '2026-03-20T10:00:00Z', endDate: '2026-03-25T10:00:00Z' }, 'PAUSED'))

    expect(screen.getByText(/^Starts /)).toBeInTheDocument()
  })

  it('reports the early end of a closed vote', () => {
    earlyEndDate = new Date('2026-03-05T09:00:00Z')
    renderHeader(createProcess({}, 'RESULTS'))

    expect(screen.getByText(/^Closed on .*March 5/)).toBeInTheDocument()
  })

  it('says the votes were discarded on a canceled vote', () => {
    renderHeader(createProcess({}, 'CANCELED'))

    expect(screen.getByText('The votes were discarded.')).toBeInTheDocument()
  })

  it('lists the voter page, duplicate, report and cancel in More', () => {
    renderHeader(createProcess({}, 'ONGOING', '0xchain'))

    const more = screen.getByRole('list', { name: 'More' })
    expect(more).toHaveTextContent('Show as voter')
    expect(more).toHaveTextContent('Duplicate')
    expect(more).toHaveTextContent('Election report (PDF)')
    expect(more).toHaveTextContent('View in explorer')
    expect(more).toHaveTextContent('Cancel vote')
  })

  it('drops Cancel once a question is closed', () => {
    renderHeader(
      createProcess({
        initialStatus: 'PAUSED',
        questions: [
          { id: 'q1', title: { default: 'Q' }, choices: [], status: 'ENDED' },
          { id: 'q2', title: { default: 'Q' }, choices: [], status: 'ONGOING' },
        ],
      })
    )

    expect(screen.getByRole('list', { name: 'More' })).not.toHaveTextContent('Cancel vote')
  })

  it('leaves Duplicate and Cancel to those who can manage the vote', () => {
    canManage = false
    renderHeader(createProcess())

    const more = screen.getByRole('list', { name: 'More' })
    expect(more).toHaveTextContent('Show as voter')
    expect(more).not.toHaveTextContent('Duplicate')
    expect(more).not.toHaveTextContent('Cancel vote')
  })
})

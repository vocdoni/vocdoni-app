import userEvent from '@testing-library/user-event'
import type { VotingProcessResponse } from '@vocdoni/api-types'
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

vi.mock('~queries/question-status', () => ({
  useQuestionStatusAction: () => ({ change, ...questionStatus }),
}))
vi.mock('~queries/votes', () => ({ useCanManageVotes: () => canManage }))
vi.mock('~components/Actions/ActionsContext', () => ({ useActions: () => ({ disabled: false }) }))
vi.mock('~utils/use-now', () => ({ useNow: () => currentNow }))
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
    results: createQuestionResults({ questionId: 'q2', voteCount: 172, finalResults: false }),
  }),
  createQuestion({ id: 'q3', title: { default: 'Statutes' }, status: 'PAUSED', results: undefined }),
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
  }) as VotingProcessResponse

const show = (election: VotingProcessResponse) => {
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

  it('counts the questions, hints the next step and toggles a closed result', async () => {
    show(build())
    expect(screen.getByText(/1 closed · 1 open · 1 to open · Next: close question 2/)).toBeInTheDocument()
    const toggle = screen.getByRole('button', { name: 'Show the result of question 1' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getAllByRole('progressbar').length).toBeGreaterThan(0)
  })

  it('opens and pauses questions, and closes only after confirming', async () => {
    show(build())
    await userEvent.click(screen.getByRole('button', { name: 'Open' }))
    expect(change).toHaveBeenCalledWith({ questionId: 'q3', status: 'ready' })
    await userEvent.click(screen.getByRole('button', { name: 'Pause' }))
    expect(change).toHaveBeenCalledWith({ questionId: 'q2', status: 'paused' })
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(change).not.toHaveBeenCalledWith({ questionId: 'q2', status: 'ended' })
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Close question 2' }))
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

  it('disables Open before the start and drops the buttons after the end', () => {
    currentNow = new Date('2026-01-01T12:00:00Z')
    const { unmount } = show(build())
    expect(screen.getByRole('button', { name: 'Open' })).toBeDisabled()
    expect(screen.getByText(/The vote starts/)).toBeInTheDocument()
    unmount()
    currentNow = new Date('2026-05-01T12:00:00Z')
    show(build())
    expect(screen.queryByRole('button', { name: 'Open' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Pause' })).not.toBeInTheDocument()
    // The vote's own state reads Closed too, so count inside the questions list.
    expect(within(screen.getByRole('region', { name: 'Questions' })).getAllByText('Closed')).toHaveLength(3)
  })

  it('shows no buttons to a viewer', () => {
    canManage = false
    show(build())
    expect(screen.queryByRole('button', { name: 'Open' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Pause' })).not.toBeInTheDocument()
  })

  it('shows the lock note and no bars for a secret open question', () => {
    show(
      build({
        questions: [
          createQuestion({
            id: 'q2',
            status: 'ONGOING',
            secretUntilTheEnd: true,
            results: createQuestionResults({ voteCount: 5, finalResults: false }),
          }),
        ],
      })
    )
    expect(screen.getByText('Results show when the question closes.')).toBeInTheDocument()
    expect(screen.queryByText(/Approve/)).not.toBeInTheDocument()
  })
})

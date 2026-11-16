import userEvent from '@testing-library/user-event'
import type { VotingProcessResponse, VotingProcessResultsResponse } from '@vocdoni/api-types'
import type { ReactNode } from 'react'
import { deriveVoteState } from '~utils/vote-state'
import { render, screen, TestMemoryRouter } from '~src/test-utils'
import { VoteListRow, type VoteListRowProps } from './VoteListRow'

const cloneAsDraft = vi.fn()
const deleteDraft = vi.fn()

vi.mock('~components/Process/Dashboard/use-clone-as-draft', () => ({
  useCloneAsDraft: () => ({ cloneAsDraft, isCloning: false }),
}))
vi.mock('~queries/votes', () => ({
  useDeleteDraft: () => ({ mutate: deleteDraft, isPending: false }),
}))
// The real menu is a dropdown or a bottom sheet by breakpoint; here its items are plain buttons.
vi.mock('~components/ui/ResponsiveMenu', () => ({
  ResponsiveMenu: ({
    items,
    trigger,
  }: {
    items: { value: string; label: string; onSelect?: () => void }[]
    trigger?: ReactNode
  }) => (
    <div>
      {trigger}
      {items.map((item) => (
        <button key={item.value} onClick={item.onSelect}>
          {item.label}
        </button>
      ))}
    </div>
  ),
}))

const DAY = 86_400_000
const now = new Date()
const iso = (offsetDays: number) => new Date(now.getTime() + offsetDays * DAY).toISOString()

const question = (status: string, over: Record<string, unknown> = {}) => ({
  id: 'q1',
  title: { default: 'Approve?' },
  choices: [
    { title: { default: 'Yes' }, value: 0 },
    { title: { default: 'No' }, value: 1 },
  ],
  type: 'singlechoice',
  status,
  ...over,
})

const make = (over: Record<string, unknown> = {}) =>
  ({
    id: 'p1',
    orgAddress: '0xorg',
    published: true,
    title: { default: 'Autumn assembly' },
    census: { size: 312 },
    startDate: iso(-1),
    endDate: iso(5),
    questions: [question('ONGOING')],
    ...over,
  }) as unknown as VotingProcessResponse

const renderRow = (process: VotingProcessResponse, props: Partial<VoteListRowProps> = {}) =>
  render(
    <TestMemoryRouter>
      <VoteListRow row={{ process, state: deriveVoteState(process, now) }} canManage now={now} {...props} />
    </TestMemoryRouter>
  )

const href = (name: string) => screen.getByRole('link', { name }).getAttribute('href')

beforeEach(() => vi.clearAllMocks())

describe('VoteListRow actions', () => {
  it('sends a ready question-by-question vote to its manage page', () => {
    renderRow(make({ initialStatus: 'PAUSED', startDate: iso(2), questions: [question('PAUSED')] }))
    expect(href('Manage vote')).toBe('/admin/process/p1/manage')
  })

  it('sends a ready all-at-once vote to its page', () => {
    renderRow(make({ startDate: iso(2) }))
    expect(href('Manage vote')).toBe('/admin/process/p1')
  })

  it('follows a live all-at-once vote on its index', () => {
    renderRow(make())
    expect(href('Follow')).toBe('/admin/process/p1')
  })

  it('opens the result of a closed vote', () => {
    renderRow(make({ questions: [question('ENDED')] }))
    expect(href('Result')).toBe('/admin/process/p1/results')
  })

  it('opens a canceled vote on its summary', () => {
    renderRow(make({ questions: [question('CANCELED')] }))
    expect(href('View')).toBe('/admin/process/p1')
  })

  it('continues a draft in the create form', () => {
    renderRow(make({ id: 'd1', published: false, endDate: undefined }))
    expect(href('Continue')).toBe('/admin/processes/create?draftId=d1')
  })
})

describe('VoteListRow content', () => {
  it('warns about a draft with no closing date', () => {
    renderRow(make({ published: false, endDate: undefined }))
    expect(screen.getByText('No closing date yet.')).toBeInTheDocument()
  })

  it('shows the outcome and the turnout of a closed single-question vote', () => {
    const results = {
      id: 'p1',
      questions: [{ questionId: 'q1', finalResults: true, voteCount: 205, results: [[198], [7]] }],
    } as unknown as VotingProcessResultsResponse
    renderRow(make({ census: { size: 312 }, questions: [question('ENDED')] }), { results })
    expect(screen.getByText(/Yes, 198 to 7/)).toBeInTheDocument()
    expect(screen.getByText(/66% turnout\./)).toBeInTheDocument()
  })

  it('shows the turnout of the promoted vote as a progress bar', () => {
    const results = {
      id: 'p1',
      questions: [{ questionId: 'q1', finalResults: false, voteCount: 184, results: [[100], [84]] }],
    } as unknown as VotingProcessResultsResponse
    renderRow(make(), { promoted: true, results })
    expect(screen.getByRole('progressbar', { name: '184 of 312 people voted, 59%' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Follow' })).toBeInTheDocument()
  })
})

describe('VoteListRow permissions', () => {
  it('duplicates a vote', async () => {
    const process = make()
    renderRow(process)
    await userEvent.click(screen.getByRole('button', { name: 'Duplicate this vote' }))
    expect(cloneAsDraft).toHaveBeenCalledWith(process)
  })

  it('has only the result and no duplicate for a legacy vote', () => {
    renderRow(make({ legacy: true, questions: [question('ONGOING')] }))
    expect(href('Result')).toBe('/admin/process/p1/results')
    expect(screen.queryByRole('button', { name: /duplicate/i })).not.toBeInTheDocument()
  })

  it('gives a viewer no duplicate and no draft menu', () => {
    renderRow(make({ published: false, endDate: undefined }), { canManage: false })
    expect(screen.queryByRole('button', { name: /duplicate/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Draft actions' })).not.toBeInTheDocument()
  })

  it('asks before deleting a draft and then deletes it', async () => {
    renderRow(make({ id: 'd1', published: false, endDate: undefined }))
    await userEvent.click(screen.getByRole('button', { name: 'Delete draft' }))
    expect(deleteDraft).not.toHaveBeenCalled()
    expect(await screen.findByText('Delete this draft?')).toBeInTheDocument()
    await userEvent.click(screen.getAllByRole('button', { name: 'Delete draft' }).at(-1)!)
    expect(deleteDraft).toHaveBeenCalledWith({ draftId: 'd1' }, expect.anything())
  })
})

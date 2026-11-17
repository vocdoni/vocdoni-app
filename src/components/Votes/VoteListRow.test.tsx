import { Card } from '@chakra-ui/react'
import userEvent from '@testing-library/user-event'
import type { VotingProcessResponse, VotingProcessResultsResponse } from '@vocdoni/api-types'
import type { ReactNode } from 'react'
import { deriveVoteState } from '~utils/vote-state'
import { render, screen, TestMemoryRouter, within } from '~src/test-utils'
import { VoteListRow, type VoteListRowProps } from './VoteListRow'

const cloneAsDraft = vi.fn()
const deleteDraft = vi.fn()

vi.mock('~components/Process/Dashboard/use-clone-as-draft', () => ({
  useCloneAsDraft: () => ({ cloneAsDraft, isCloning: false }),
}))
vi.mock('~queries/votes', () => ({
  useDeleteDraft: () => ({ mutate: deleteDraft, isPending: false }),
}))
// The real menu is a dropdown or a bottom sheet by breakpoint; here its items are plain buttons under its sheet
// title and subtitle.
vi.mock('~components/ui/ResponsiveMenu', () => ({
  ResponsiveMenu: ({
    items,
    trigger,
    title,
    subtitle,
  }: {
    items: { value: string; label: string; onSelect?: () => void; danger?: boolean }[]
    trigger?: ReactNode
    title?: string
    subtitle?: string
  }) => (
    <div role='group' aria-label={`${title} menu`}>
      {trigger}
      <p data-testid='menu-subtitle'>{subtitle}</p>
      {items.map((item) => (
        <button key={item.value} onClick={item.onSelect} data-danger={item.danger ? 'true' : undefined}>
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
  ballotProtocol: {
    maxCount: 1,
    maxValue: 1,
    maxVoteOverwrites: 0,
    costExponent: 1,
    uniqueValues: false,
    maxTotalCost: 0,
    costFromWeight: false,
  },
  secretUntilTheEnd: false,
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

const renderRow = (process: VotingProcessResponse, props: Partial<VoteListRowProps> = {}) => {
  const at = props.now ?? now
  return render(
    <TestMemoryRouter>
      <Card.Root variant='frame'>
        <VoteListRow row={{ process, state: deriveVoteState(process, at) }} canManage now={at} {...props} />
      </Card.Root>
    </TestMemoryRouter>
  )
}

const href = (name: string) => screen.getByRole('link', { name }).getAttribute('href')

beforeEach(() => vi.clearAllMocks())

describe('VoteListRow actions', () => {
  it('sends a question-by-question vote to its summary, where it is run', () => {
    renderRow(make({ initialStatus: 'PAUSED', startDate: iso(2), questions: [question('PAUSED')] }))
    expect(href('Manage vote')).toBe('/admin/process/p1')
  })

  it('follows a live question-by-question vote on its summary', () => {
    renderRow(make({ initialStatus: 'PAUSED', questions: [question('ONGOING')] }))
    expect(href('Follow')).toBe('/admin/process/p1')
  })

  it('sends a ready all-at-once vote to its page', () => {
    renderRow(make({ startDate: iso(2) }))
    expect(href('Manage vote')).toBe('/admin/process/p1')
  })

  it('follows a live all-at-once vote on its index', () => {
    renderRow(make())
    expect(href('Follow')).toBe('/admin/process/p1')
  })

  it('opens the result of a closed vote on its summary, where the results are read', () => {
    renderRow(make({ questions: [question('ENDED')] }))
    expect(href('Result')).toBe('/admin/process/p1')
  })

  it('opens a canceled vote on its summary', () => {
    renderRow(make({ questions: [question('CANCELED')] }))
    expect(href('View')).toBe('/admin/process/p1')
  })

  it('continues a draft in the create form', () => {
    renderRow(make({ id: 'd1', published: false, endDate: undefined }))
    expect(href('Edit')).toBe('/admin/processes/create?draftId=d1')
  })
})

describe('VoteListRow content', () => {
  it('warns about a draft with no closing date', () => {
    renderRow(make({ published: false, endDate: undefined }))
    expect(screen.getByText('No closing date yet.')).toBeInTheDocument()
  })

  it('gives the turnout of a closed vote and says nothing about who won', () => {
    const results = {
      id: 'p1',
      questions: [{ questionId: 'q1', finalResults: true, voteCount: 205, results: [['198', '7']] }],
    } as unknown as VotingProcessResultsResponse
    renderRow(make({ census: { size: 312 }, questions: [question('ENDED')] }), { results })
    expect(screen.getByRole('article')).toHaveTextContent('1 question, 312 voters. 66% turnout.')
    expect(screen.getByRole('article')).not.toHaveTextContent(/Yes|198|wins/)
  })

  it('tells a live vote by when it closes, without the month in the current month', () => {
    const march10 = new Date(2026, 2, 10, 12)
    const closes = new Date(2026, 2, 12, 20).toISOString()
    renderRow(make({ startDate: new Date(2026, 2, 1).toISOString(), endDate: closes }), { now: march10 })
    expect(screen.getByText('1 question, 312 voters. Closes Thursday 12 at 20:00.')).toBeInTheDocument()
  })

  it('reads a ready question-by-question vote as live on its day, with the month when it is not this one', () => {
    const march10 = new Date(2026, 2, 10, 12)
    renderRow(
      make({
        initialStatus: 'PAUSED',
        startDate: new Date(2026, 10, 14, 18, 30).toISOString(),
        endDate: new Date(2026, 10, 14, 21).toISOString(),
        questions: [question('PAUSED')],
      }),
      { now: march10 }
    )
    expect(screen.getByText('Live, Saturday November 14 at 18:30.')).toBeInTheDocument()
  })

  it('shows a live vote like every other row: a text link and no turnout bar', () => {
    renderRow(make())
    expect(screen.getByRole('link', { name: 'Follow' })).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Follow' })).not.toBeInTheDocument()
  })
})

describe('VoteListRow menu', () => {
  it('titles the phone sheet with the vote and its state', () => {
    renderRow(make({ published: false, endDate: undefined }))
    const menu = screen.getByRole('group', { name: 'Autumn assembly menu' })
    expect(within(menu).getByTestId('menu-subtitle')).toHaveTextContent('Draft')
    expect(within(menu).getByRole('button', { name: 'More actions' })).toBeInTheDocument()
  })

  it('puts delete last, as a destructive item, only on a draft', () => {
    renderRow(make({ published: false, endDate: undefined }))
    const labels = screen.getAllByRole('button').map((button) => button.textContent)
    expect(labels.slice(-2)).toEqual(['Duplicate', 'Delete'])
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveAttribute('data-danger', 'true')
  })

  it('offers no delete on a published vote', () => {
    renderRow(make())
    expect(screen.getByRole('button', { name: 'Duplicate' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })
})

describe('VoteListRow permissions', () => {
  it('duplicates a vote', async () => {
    const process = make()
    renderRow(process)
    await userEvent.click(screen.getByRole('button', { name: 'Duplicate' }))
    expect(cloneAsDraft).toHaveBeenCalledWith(process)
  })

  it('has only the result and no duplicate for a legacy vote', () => {
    renderRow(make({ legacy: true, questions: [question('ONGOING')] }))
    expect(href('Result')).toBe('/admin/process/p1')
    expect(screen.queryByRole('button', { name: /duplicate/i })).not.toBeInTheDocument()
  })

  it('gives a viewer no duplicate and no draft menu', () => {
    renderRow(make({ published: false, endDate: undefined }), { canManage: false })
    expect(screen.queryByRole('button', { name: /duplicate/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'More actions' })).not.toBeInTheDocument()
  })

  it('asks before deleting a draft and then deletes it', async () => {
    renderRow(make({ id: 'd1', published: false, endDate: undefined }))
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(deleteDraft).not.toHaveBeenCalled()
    expect(await screen.findByText('Delete this draft?')).toBeInTheDocument()
    const confirm = screen.getByRole('button', { name: 'Delete draft' })
    // The guide's destructive confirm: the danger outline, never a filled red.
    expect(confirm).toHaveAttribute('data-tone', 'danger')
    await userEvent.click(confirm)
    expect(deleteDraft).toHaveBeenCalledWith({ draftId: 'd1' }, expect.anything())
  })
})

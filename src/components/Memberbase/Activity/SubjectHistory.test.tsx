import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { render, screen } from '~src/test-utils'
import type { ResolvedCensusState } from '../Censuses/useResolvedCensus'
import { CensusHistory, PersonHistory } from './SubjectHistory'

const data = vi.hoisted(() => ({ fetch: vi.fn() }))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ currentAddress: '0xabc', bearer: 'token', bearedFetch: data.fetch }),
}))

// Only the organization-wide view derives events; a subject's history never reads votes
vi.mock('~components/Memberbase/Censuses/useCensusIndex', () => ({
  useAllVotes: () => ({ published: [], drafts: [], all: [], isLoading: false, isError: false }),
}))

const actor = { type: 'user', label: 'Marta' }

const voteCensus = (extra: Record<string, unknown> = {}) =>
  ({
    kind: 'vote',
    groupId: 'g1',
    process: {
      id: 'p1',
      title: { default: 'Board election' },
      published: true,
      startDate: '2026-09-01T09:00:00Z',
      endDate: '2026-09-02T18:00:00Z',
      questions: [],
      census: { groupId: 'g1' },
    },
    marker: { processId: 'p1', kind: 'snapshot', createdAt: '2026-08-30T12:00:00Z' },
    source: { kind: 'snapshot', groupId: 'g1' },
    copiedInto: [],
    ...extra,
  }) as unknown as ResolvedCensusState

const renderHistory = (census: ResolvedCensusState, appEnv: { ACTIVITY_LOG?: boolean } = {}) =>
  render(
    <MemoryRouter>
      <CensusHistory census={census} />
    </MemoryRouter>,
    { appEnv }
  )

describe('CensusHistory', () => {
  beforeEach(() => data.fetch.mockReset())

  it("shows what's known today on a rail, and links to the census' activity", () => {
    renderHistory(voteCensus())

    const entries = screen.getAllByRole('listitem')
    expect(entries.map((entry) => entry.textContent)).toEqual([
      expect.stringContaining('Voting closed'),
      expect.stringContaining('Voting opened'),
      expect.stringContaining('Census created'),
    ])
    expect(entries[2]).toHaveTextContent('Copy of all your members when you published')
    expect(screen.getByText('While voting was open')).toBeInTheDocument()
    expect(screen.getByText('Edits to its people, with who made them, will show here soon.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /See in Activity/ })).toHaveAttribute(
      'href',
      '/admin/memberbase/activity?census=vote%3Ap1'
    )
    expect(data.fetch).not.toHaveBeenCalled()
  })

  it('lists a saved census being created and copied into votes', () => {
    renderHistory({
      kind: 'saved',
      groupId: 's1',
      group: { createdAt: '2026-08-01T10:00:00Z' },
      copiedInto: [{ id: 'p1', title: 'Board election', state: 'live', copiedAt: '2026-08-20T10:00:00Z' }],
    } as unknown as ResolvedCensusState)

    const entries = screen.getAllByRole('listitem')
    expect(entries[0]).toHaveTextContent("Copied into 'Board election'")
    expect(entries[1]).toHaveTextContent('Saved census created')
    expect(screen.getByRole('link', { name: /See in Activity/ })).toHaveAttribute(
      'href',
      '/admin/memberbase/activity?census=saved%3As1'
    )
  })

  it('adds the logged changes, with who made them, once the activity log is on', async () => {
    data.fetch.mockResolvedValue({
      events: [
        {
          id: 'e1',
          type: 'census.members_removed',
          at: '2026-09-01T10:00:00Z',
          actor,
          source: 'app',
          subject: { type: 'census', id: 'g1', label: 'Board' },
          count: 3,
          live: true,
        },
        {
          id: 'e2',
          type: 'process.started',
          at: '2026-09-01T09:00:00Z',
          actor: { type: 'system' },
          source: 'system',
          subject: { type: 'process', id: 'p1', label: 'Board election' },
        },
      ],
    })
    renderHistory(voteCensus(), { ACTIVITY_LOG: true })

    expect(await screen.findByText('3 people removed')).toBeInTheDocument()
    expect(screen.getByText('Marta')).toBeInTheDocument()
    // The log has the opening: it isn't worked out a second time
    expect(screen.getAllByText('Voting opened')).toHaveLength(1)
    expect(screen.getByText('Vocdoni')).toBeInTheDocument()
    expect(screen.queryByText(/will show here soon/)).not.toBeInTheDocument()
    expect(data.fetch).toHaveBeenCalledWith('organizations/0xabc/activity?limit=20&processId=p1')
  })
})

describe('PersonHistory', () => {
  beforeEach(() => data.fetch.mockReset())

  it('renders nothing while the activity log is off', () => {
    render(<PersonHistory memberId='m1' />)

    expect(screen.queryByText('History')).not.toBeInTheDocument()
    expect(data.fetch).not.toHaveBeenCalled()
  })

  it("lists a person's edits, masked, with the activity log on", async () => {
    data.fetch.mockResolvedValue({
      events: [
        {
          id: 'e1',
          type: 'member.updated',
          at: '2026-09-20T10:00:00Z',
          actor,
          source: 'app',
          subject: { type: 'member', id: 'm1', label: 'Joan' },
          changes: [
            { field: 'phone', before: '+34 600 11 22 33', after: '+34 600 99 88 77' },
            { field: 'nationalId', before: '12345678Z', after: '87654321X' },
            { field: 'other', before: 'paid', after: 'unpaid' },
          ],
        },
      ],
    })
    render(<PersonHistory memberId='m1' />, { appEnv: { ACTIVITY_LOG: true } })

    await userEvent.click(await screen.findByRole('button', { name: /Show 3 changes/ }))

    expect(screen.getByText('***77')).toBeInTheDocument()
    expect(screen.getByText('***33')).toBeInTheDocument()
    expect(screen.getByText('***21X')).toBeInTheDocument()
    expect(screen.getByText('Extra info')).toBeInTheDocument()
    expect(screen.getAllByText('Changed, hidden for privacy')).toHaveLength(1)
    expect(screen.queryByText(/unpaid|12345678Z/)).not.toBeInTheDocument()
    expect(data.fetch).toHaveBeenCalledWith('organizations/0xabc/activity?limit=20&subjectType=member&subjectId=m1')
  })

  it('says when there is no history yet', async () => {
    data.fetch.mockResolvedValue({ events: [] })
    render(<PersonHistory memberId='m1' />, { appEnv: { ACTIVITY_LOG: true } })

    expect(await screen.findByText('No changes recorded yet.')).toBeInTheDocument()
  })
})

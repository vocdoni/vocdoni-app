import userEvent from '@testing-library/user-event'
import { render, screen } from '~src/test-utils'
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

describe('CensusHistory and PersonHistory', () => {
  beforeEach(() => data.fetch.mockReset())

  it('render nothing while the activity log is off', () => {
    render(
      <>
        <CensusHistory groupId='g1' processId='p1' />
        <PersonHistory memberId='m1' />
      </>
    )

    expect(screen.queryByText('History')).not.toBeInTheDocument()
    expect(data.fetch).not.toHaveBeenCalled()
  })

  it("lists a census's changes with the activity log on", async () => {
    data.fetch.mockResolvedValue({
      events: [
        {
          id: 'e1',
          type: 'census.members_removed',
          at: '2026-09-20T10:00:00Z',
          actor,
          source: 'app',
          subject: { type: 'census', id: 'g1', label: 'Board' },
          count: 3,
        },
        {
          id: 'e2',
          type: 'census.members_added',
          at: '2026-09-21T10:00:00Z',
          actor: { type: 'api_key' },
          source: 'api',
          subject: { type: 'census', id: 'g1', label: 'Board' },
          count: 1,
        },
      ],
    })
    render(<CensusHistory groupId='g1' processId='p1' />, { appEnv: { ACTIVITY_LOG: true } })

    expect(await screen.findByText("3 people removed from 'Board'")).toBeInTheDocument()
    const rows = screen.getAllByRole('listitem')
    expect(rows[0]).toHaveTextContent("1 person added to 'Board'")
    expect(rows[0]).toHaveTextContent('by API key')
    expect(data.fetch).toHaveBeenCalledWith(
      'organizations/0xabc/activity?limit=20&subjectType=census&subjectId=g1&processId=p1'
    )
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

    await userEvent.click(await screen.findByRole('button', { name: /3 changes/ }))

    expect(screen.getByText('Phone: ***33 → ***77')).toBeInTheDocument()
    expect(screen.getByText('National ID: ***78Z → ***21X')).toBeInTheDocument()
    expect(screen.getByText('Extra info changed')).toBeInTheDocument()
    expect(screen.queryByText(/unpaid|12345678Z/)).not.toBeInTheDocument()
    expect(data.fetch).toHaveBeenCalledWith('organizations/0xabc/activity?limit=20&subjectType=member&subjectId=m1')
  })

  it('says when there is no history yet', async () => {
    data.fetch.mockResolvedValue({ events: [] })
    render(<PersonHistory memberId='m1' />, { appEnv: { ACTIVITY_LOG: true } })

    expect(await screen.findByText('No changes recorded yet.')).toBeInTheDocument()
  })
})

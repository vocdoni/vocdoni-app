import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { render, screen, within } from '~src/test-utils'
import { CensusesIndex } from './CensusesIndex'

const past = new Date(Date.now() - 86_400_000).toISOString()
const future = new Date(Date.now() + 86_400_000).toISOString()

const vote = (
  id: string,
  title: string,
  census: { groupId?: string; size?: number; twoFaFields?: string[] },
  status: string,
  { published = true, startDate = past } = {}
) => ({
  id,
  title: { default: title },
  census,
  questions: [{ status }],
  published,
  startDate,
  endDate: future,
})

const data = vi.hoisted(() => ({
  groups: [] as Record<string, unknown>[],
  published: [] as unknown[],
  drafts: [] as unknown[],
  markers: new Map<string, unknown>(),
  track: vi.fn(),
}))

vi.mock('~src/queries/groups', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/queries/groups')>()),
  useAllGroups: () => ({ data: data.groups, isLoading: false, isError: false }),
}))

vi.mock('~src/queries/processes', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/queries/processes')>()),
  usePublishedProcesses: () => ({
    data: { pages: [{ processes: data.published }] },
    isLoading: false,
    isError: false,
    hasNextPage: false,
  }),
  useDraftProcesses: () => ({ data: { pages: [{ processes: data.drafts }] }, isLoading: false, hasNextPage: false }),
}))

vi.mock('~src/queries/voteGroups', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/queries/voteGroups')>()),
  useVoteGroupMarkers: () => ({
    markers: data.markers,
    ready: true,
    isVoteOwned: (id: string) => data.markers.has(id),
  }),
}))

vi.mock('~src/queries/members', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/queries/members')>()),
  useMembersCount: () => ({ count: 1742, known: true, isLoading: false }),
}))

vi.mock('~utils/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~utils/analytics')>()),
  trackAnalyticsEvent: data.track,
}))

const renderIndex = () =>
  render(
    <MemoryRouter>
      <CensusesIndex />
    </MemoryRouter>
  )

const group = (id: string, title: string, membersCount: number, extra: Record<string, unknown> = {}) => ({
  id,
  title,
  description: '',
  membersCount,
  censusIds: [],
  createdAt: past,
  updatedAt: past,
  ...extra,
})

describe('CensusesIndex', () => {
  beforeEach(() => {
    data.groups = [
      group('everyone', 'All members', 1742, { isAutoGroup: true }),
      group('quota', 'Quota pagada', 1512),
      group('junta', 'Junta', 9),
      group('owned', 'Census of Assemblea', 1700),
    ]
    data.published = [
      vote('live', 'Assemblea General 2026', { groupId: 'owned', size: 1700, twoFaFields: ['email'] }, 'ONGOING'),
      vote('old', 'Eleccions Junta 2025', { groupId: 'quota', size: 1490, twoFaFields: ['phone'] }, 'RESULTS'),
      vote('soon', 'Pressupost', { groupId: 'everyone', size: 1742, twoFaFields: ['email', 'phone'] }, 'UPCOMING', {
        startDate: future,
      }),
    ]
    data.drafts = [vote('draft', 'Comitè', { size: 3 }, 'UPCOMING', { published: false })]
    data.markers = new Map([['owned', { processId: 'live', kind: 'copy', createdAt: past, fromId: 'quota' }]])
    data.track.mockReset()
  })

  it('pins Everyone, groups the votes by state and lists the saved censuses', () => {
    renderIndex()

    const lists = screen.getAllByRole('listitem')
    expect(within(lists[0]).getByRole('link', { name: 'Everyone' })).toBeInTheDocument()
    expect(lists[0]).toHaveTextContent('All your members, including people you add later.')
    expect(lists[0]).toHaveTextContent('1,742')

    const votes = screen.getByRole('region', { name: 'In votes' })
    expect(
      within(votes)
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent)
    ).toEqual(['Live', 'Scheduled', 'Drafts', 'Closed'])
    expect(
      within(votes)
        .getAllByRole('link')
        .map((link) => link.textContent)
    ).toEqual(['Assemblea General 2026', 'Pressupost', 'Comitè', 'Eleccions Junta 2025'])

    expect(screen.getByRole('link', { name: 'Assemblea General 2026' })).toHaveAttribute(
      'href',
      '/admin/memberbase/censuses/vote/live'
    )
  })

  it('says where each vote’s voters come from and how they sign in', () => {
    renderIndex()
    const row = (name: string) => screen.getByRole('link', { name }).closest('li') as HTMLElement

    expect(row('Assemblea General 2026')).toHaveTextContent("Code by email·Copied from 'Quota pagada'")
    expect(row('Pressupost')).toHaveTextContent('Code by email or SMS·Everyone')
    expect(row('Eleccions Junta 2025')).toHaveTextContent("Code by SMS·Saved census 'Quota pagada'")
    expect(row('Comitè')).toHaveTextContent('Details only·Selected people')
    expect(row('Assemblea General 2026')).toHaveTextContent('1,700voters')
  })

  it('hides a vote’s own census from the saved ones and counts the votes using each', () => {
    renderIndex()

    const saved = screen.getByRole('region', { name: 'Saved' })
    expect(
      within(saved)
        .getAllByRole('link')
        .map((link) => link.textContent)
    ).toEqual(['Quota pagada', 'Junta'])
    expect(within(saved).getByRole('link', { name: 'Quota pagada' }).closest('li')).toHaveTextContent('Used by 1 vote')
    expect(within(saved).getByRole('link', { name: 'Junta' }).closest('li')).toHaveTextContent('Not used by any vote')
    expect(screen.queryByText('Census of Assemblea')).toBeNull()
    expect(data.track).toHaveBeenCalledWith({ name: 'censuses_viewed' })
  })

  it('shows filter pills only past eight censuses', async () => {
    renderIndex()
    expect(screen.queryByRole('group', { name: 'Filter censuses' })).toBeNull()
  })

  it('filters a long list by state', async () => {
    data.groups.push(...Array.from({ length: 6 }, (_, index) => group(`s${index}`, `Saved ${index}`, 2)))
    const user = userEvent.setup()
    renderIndex()

    const pills = screen.getByRole('group', { name: 'Filter censuses' })
    await user.click(within(pills).getByRole('button', { name: /Saved/ }))

    expect(screen.queryByRole('region', { name: 'In votes' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Everyone' })).toBeNull()
    expect(within(screen.getByRole('region', { name: 'Saved' })).getAllByRole('link')).toHaveLength(8)
  })

  it('explains where censuses come from when there are none yet', () => {
    data.groups = [group('everyone', 'All', 0, { isAutoGroup: true })]
    data.published = []
    data.drafts = []
    renderIndex()

    expect(screen.getByText('Your first census is created with your first vote.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'New vote' })).toHaveAttribute('href', '/admin/processes/create')
  })
})

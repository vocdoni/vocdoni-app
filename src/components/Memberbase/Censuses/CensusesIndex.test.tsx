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
  unreachable: 0,
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
  useCensusReadiness: ({ total, enabled }: { total: number; enabled?: boolean }) => ({
    available: !!enabled && total > 0,
    total,
    ready: total - data.unreachable,
    unreachable: data.unreachable,
    isLoading: false,
  }),
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
    data.unreachable = 0
  })

  it('groups the votes in a card per state, with closed ones folded away, and no row for Everyone', async () => {
    const user = userEvent.setup()
    renderIndex()

    // Everyone is a way to choose who votes, not a census: its people are the People tab
    expect(screen.queryByRole('link', { name: 'Everyone' })).toBeNull()

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
    ).toEqual(['Assemblea General 2026', 'Pressupost', 'Comitè'])
    expect(screen.getByRole('link', { name: 'Assemblea General 2026' })).toHaveAttribute(
      'href',
      '/admin/memberbase/censuses/vote/live'
    )

    // Closed votes pile up: one line until opened
    await user.click(within(votes).getByRole('button', { name: /Closed.*1 vote/ }))
    expect(await within(votes).findByRole('link', { name: 'Eleccions Junta 2025' })).toBeInTheDocument()
  })

  it('says where each vote’s voters come from, when it runs and how they sign in', () => {
    renderIndex()
    const row = (name: string) => screen.getByRole('link', { name }).closest('li') as HTMLElement

    expect(row('Assemblea General 2026')).toHaveTextContent("Copied from 'Quota pagada'")
    expect(row('Assemblea General 2026')).toHaveTextContent(/Closes \w+ \d+ \w+/)
    expect(row('Assemblea General 2026')).toHaveTextContent('Code by email')
    expect(row('Assemblea General 2026')).toHaveTextContent('1,700 voters')
    expect(row('Pressupost')).toHaveTextContent('Everyone')
    expect(row('Pressupost')).toHaveTextContent(/Opens \w+ \d+ \w+/)
    expect(row('Pressupost')).toHaveTextContent('Code by email or SMS')
    expect(row('Comitè')).toHaveTextContent('Selected people')
    expect(row('Comitè')).toHaveTextContent('No dates yet')
  })

  it('says on the row how many in a running vote can’t get a code', () => {
    data.unreachable = 92
    renderIndex()
    const row = (name: string) => screen.getByRole('link', { name }).closest('li') as HTMLElement

    expect(row('Assemblea General 2026')).toHaveTextContent("92 can't get a code")
    // Drafts aren't checked: nobody signs in to them yet
    expect(row('Comitè')).not.toHaveTextContent("can't get a code")
  })

  it('labels the censuses votes own: copied, chosen by hand, all members when published', async () => {
    const user = userEvent.setup()
    data.published.push(
      vote('chosen', 'Junta 2026', { groupId: 'hand', size: 9, twoFaFields: ['email'] }, 'ONGOING'),
      vote('frozen', 'Assemblea 2025', { groupId: 'snap', size: 1700, twoFaFields: ['email'] }, 'RESULTS')
    )
    data.markers.set('hand', { processId: 'chosen', kind: 'copy', createdAt: past, source: 'choose' })
    data.markers.set('snap', { processId: 'frozen', kind: 'snapshot', createdAt: past })
    renderIndex()
    const row = (name: string) => screen.getByRole('link', { name }).closest('li') as HTMLElement

    expect(row('Assemblea General 2026')).toHaveTextContent("Copied from 'Quota pagada'")
    expect(row('Junta 2026')).toHaveTextContent('Chosen by hand')
    await user.click(screen.getByRole('button', { name: /Closed/ }))
    const frozen = await screen.findByRole('link', { name: 'Assemblea 2025' })
    expect(frozen.closest('li')).toHaveTextContent(/Copy of all your members on \d+ \w+ \d{4}/)
  })

  it('shows saved censuses as cards: which vote they went into, a way to use them, and a way to make one', () => {
    renderIndex()

    const saved = screen.getByRole('region', { name: 'Saved' })
    const card = (name: string) => within(saved).getByRole('link', { name }).closest('li') as HTMLElement
    expect(card('Quota pagada')).toHaveTextContent("Copied into 'Assemblea General 2026'")
    expect(within(card('Quota pagada')).getByRole('button', { name: 'Use in a vote' })).toBeInTheDocument()
    expect(card('Junta')).toHaveTextContent('Not used in a vote yet')
    // A vote's own census is never a saved one
    expect(screen.queryByText('Census of Assemblea')).toBeNull()

    const create = within(saved).getAllByRole('link', { name: 'New saved census' })
    expect(create.length).toBeGreaterThan(0)
    create.forEach((link) => expect(link).toHaveAttribute('href', '/admin/memberbase/members/1'))
    expect(data.track).toHaveBeenCalledWith({ name: 'censuses_viewed' })
  })

  it('shows search and filter pills only past eight censuses', async () => {
    renderIndex()
    expect(screen.queryByRole('group', { name: 'Filter censuses' })).toBeNull()
    expect(screen.queryByRole('textbox', { name: 'Search censuses' })).toBeNull()
  })

  it('filters a long list by state, and searches it by name', async () => {
    data.groups.push(...Array.from({ length: 6 }, (_, index) => group(`s${index}`, `Saved ${index}`, 2)))
    const user = userEvent.setup()
    renderIndex()

    const pills = screen.getByRole('group', { name: 'Filter censuses' })
    await user.click(within(pills).getByRole('button', { name: /Saved/ }))
    expect(screen.queryByRole('region', { name: 'In votes' })).toBeNull()
    expect(
      within(screen.getByRole('region', { name: 'Saved' })).getAllByRole('button', { name: 'Use in a vote' })
    ).toHaveLength(8)

    await user.click(within(pills).getByRole('button', { name: /All/ }))
    await user.type(screen.getByRole('textbox', { name: 'Search censuses' }), 'assemblea')
    expect(screen.getByRole('link', { name: 'Assemblea General 2026' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Pressupost' })).toBeNull()
    expect(screen.queryByRole('region', { name: 'Saved' })).toBeNull()
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

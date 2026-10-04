import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { render, screen, waitFor, within } from '~src/test-utils'
import { ActivityTab } from './index'

const data = vi.hoisted(() => ({
  published: [] as unknown[],
  jobs: [] as Record<string, unknown>[],
  jobsError: false,
  fetch: vi.fn(),
  track: vi.fn(),
  download: vi.fn(),
}))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ currentAddress: '0xabc', bearer: 'token', bearedFetch: data.fetch }),
}))

vi.mock('~src/providers/ApiClientProvider', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/providers/ApiClientProvider')>()),
  useApiClient: () => ({
    client: {
      jobs: {
        list: vi.fn(async () => {
          if (data.jobsError) throw new Error('forbidden')
          return { jobs: data.jobs }
        }),
      },
    },
  }),
}))

vi.mock('~components/Memberbase/Censuses/useCensusIndex', async () => {
  const { buildCensusIndex } = await import('~components/Memberbase/Censuses/model')
  return {
    useAllVotes: () => ({
      published: data.published,
      drafts: [],
      all: data.published,
      isLoading: false,
      isError: false,
    }),
    useCensusIndex: () => ({
      index: buildCensusIndex({
        groups: [],
        published: data.published as never[],
        drafts: [],
        markers: new Map(),
        language: 'en',
      }),
      markers: new Map(),
      isLoading: false,
    }),
  }
})

vi.mock('~utils/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~utils/analytics')>()),
  trackAnalyticsEvent: data.track,
}))

vi.mock('~utils/download', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~utils/download')>()),
  downloadBlob: data.download,
}))

const vote = (id: string, title: string, startDate: string, endDate: string) => ({
  id,
  title: { default: title },
  published: true,
  startDate,
  endDate,
  questions: [],
  census: {},
})

const job = (jobId: string, extra: Record<string, unknown> = {}) => ({
  jobId,
  type: 'org_members',
  status: 'completed',
  result: { added: 98, total: 100 },
  errors: ['row 4: someone@example.org', 'row 9: +34600112233'],
  ...extra,
})

const renderTab = (appEnv: { ACTIVITY_LOG?: boolean } = {}, path = '/admin/memberbase/activity') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path='/admin/memberbase/activity' element={<ActivityTab />} />
        <Route path='/admin/memberbase/members/:page' element={<h1>People page</h1>} />
      </Routes>
    </MemoryRouter>,
    { appEnv }
  )

const SOON = 'For now this shows votes and imports. Edits to people and censuses, with who made them, are coming.'

describe('ActivityTab', () => {
  beforeEach(() => {
    data.published = []
    data.jobs = []
    data.jobsError = false
    data.fetch.mockReset()
    data.track.mockReset()
    data.download.mockReset()
  })

  it('tags each vote event with its census, and puts imports without a date last', async () => {
    data.jobs = [job('j1')]
    data.published = [vote('p1', 'Annual assembly', '2026-09-01T09:00:00', '2026-09-01T18:00:00')]
    renderTab()

    const undated = await screen.findByRole('region', { name: 'Date not recorded yet' })
    expect(within(undated).getByText('98 of 100 members imported')).toBeInTheDocument()
    expect(within(undated).getByText('Members list only')).toBeInTheDocument()
    expect(within(undated).getByText('Imports get a date soon')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Annual assembly' })).toHaveLength(2)
    expect(screen.getByText(SOON)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Export CSV/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'People page' })).toBeNull()
  })

  it('stays on the tab when the jobs can not be read', async () => {
    data.jobsError = true
    renderTab()

    expect(await screen.findByText(SOON)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'People page' })).toBeNull()
  })

  it('shows votes and imports by day, with one Soon tag and only the filters that have something', async () => {
    data.jobs = [job('j1', { completedAt: '2026-09-20T10:00:00Z' }), job('j2', { status: 'failed', errors: [] })]
    data.published = [
      vote('p1', 'Annual assembly', '2026-09-01T09:00:00', '2026-09-01T18:00:00'),
      vote('p2', 'Board election', '2026-09-05T09:00:00', '2026-09-06T18:00:00'),
    ]
    renderTab()

    const days = await screen.findAllByRole('heading', { level: 3 })
    expect(days).toHaveLength(5)
    const election = screen.getByRole('region', { name: days[1].textContent! })
    expect(within(election).getByText('Voting closed')).toBeInTheDocument()
    expect(within(election).getByRole('button', { name: 'Board election' })).toBeInTheDocument()
    const assembly = screen.getByRole('region', { name: days[3].textContent! })
    expect(within(assembly).getAllByRole('listitem')).toHaveLength(2)

    expect(screen.getAllByText('98 of 100 members imported')).toHaveLength(2)
    expect(screen.getByText(/2 rows had problems/)).toBeInTheDocument()
    expect(screen.getByText('Failed')).toBeInTheDocument()
    expect(screen.queryByText(/example\.org|34600/)).not.toBeInTheDocument()

    expect(screen.getAllByText('Soon')).toHaveLength(1)
    const filters = screen.getByRole('group', { name: 'Filter activity' })
    expect(
      within(filters)
        .getAllByRole('button')
        .map((button) => button.textContent)
    ).toEqual(['Everything', 'Votes', 'Imports'])
    expect(data.track).toHaveBeenCalledWith({ name: 'activity_viewed', props: { source: 'derived' } })

    await userEvent.click(within(filters).getByRole('button', { name: 'Imports' }))
    expect(screen.queryByText('Voting closed')).not.toBeInTheDocument()
    expect(screen.getAllByText('98 of 100 members imported')).toHaveLength(2)
  })

  it("filters to one census from a row's chip, and from the URL", async () => {
    data.published = [
      vote('p1', 'Annual assembly', '2026-09-01T09:00:00', '2026-09-01T18:00:00'),
      vote('p2', 'Board election', '2026-09-05T09:00:00', '2026-09-06T18:00:00'),
    ]
    const { unmount } = renderTab()

    await userEvent.click((await screen.findAllByRole('button', { name: 'Board election' }))[0])
    expect(screen.queryByRole('button', { name: 'Annual assembly' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Board election' })).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Census: Board election' })).toBeInTheDocument()
    unmount()

    renderTab({}, '/admin/memberbase/activity?census=vote%3Ap1')
    expect(await screen.findAllByRole('button', { name: 'Annual assembly' })).toHaveLength(2)
    expect(screen.queryByRole('button', { name: 'Board election' })).not.toBeInTheDocument()
  })

  it('says when there is nothing yet', async () => {
    data.jobs = [job('j1', { createdAt: '2026-09-20T10:00:00Z', type: 'census_participants' })]
    renderTab()

    expect(await screen.findByText('Nothing here yet. Imports and votes appear as they happen.')).toBeInTheDocument()
  })

  describe('with the activity log on', () => {
    const event = (id: string, type: string, at: string, extra: Record<string, unknown> = {}) => ({
      id,
      type,
      at,
      actor: { type: 'user', label: 'Marta' },
      source: 'app',
      subject: { type: 'member', id: 'm1', label: 'Joan Puig' },
      ...extra,
    })

    beforeEach(() => {
      data.published = [
        vote('p1', 'Annual assembly', '2026-09-01T09:00:00', '2026-09-01T18:00:00'),
        vote('p2', 'Board election', '2026-09-05T09:00:00', '2026-09-06T18:00:00'),
      ]
      data.fetch.mockResolvedValue({
        events: [
          event('e1', 'member.updated', '2026-09-20T10:00:00Z', {
            processIds: ['p1', 'p2'],
            live: true,
            changes: [
              { field: 'email', before: 'joan@puig.cat', after: 'jp@mail.org' },
              { field: 'birthDate', before: '1980-01-01', after: '1981-01-01' },
            ],
          }),
        ],
      })
    })

    it('lists events with their censuses, the During voting flag, and masked changes', async () => {
      renderTab({ ACTIVITY_LOG: true })

      expect(await screen.findByText('Joan Puig')).toBeInTheDocument()
      expect(screen.getByText('Marta')).toBeInTheDocument()
      expect(screen.getByText('During voting')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '2 censuses' })).toBeInTheDocument()
      expect(screen.queryByText('Soon')).not.toBeInTheDocument()
      expect(data.fetch).toHaveBeenCalledWith('organizations/0xabc/activity?page=1&limit=50')

      await userEvent.click(screen.getByRole('button', { name: /Show 2 changes/ }))
      expect(screen.getByText('j***n@p***.cat')).toBeInTheDocument()
      expect(screen.getByText('j***p@m***.org')).toBeInTheDocument()
      expect(screen.getByText('Changed, hidden for privacy')).toBeInTheDocument()
      expect(screen.queryByText(/1980/)).not.toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: 'Census changes' }))
      await waitFor(() =>
        expect(data.fetch).toHaveBeenLastCalledWith('organizations/0xabc/activity?page=1&limit=50&type=census%2Cgroup')
      )
    })

    it("asks the log for one census' events when filtered by it", async () => {
      renderTab({ ACTIVITY_LOG: true })

      await userEvent.click(await screen.findByRole('button', { name: 'Census: All censuses' }))
      await userEvent.click(await screen.findByRole('option', { name: 'Board election' }))

      await waitFor(() =>
        expect(data.fetch).toHaveBeenLastCalledWith('organizations/0xabc/activity?page=1&limit=50&processId=p2')
      )
      expect(await screen.findByText('Joan Puig')).toBeInTheDocument()
    })

    it('exports the activity as CSV', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(new Response('id;type\n', { status: 200, headers: { 'Content-Type': 'text/csv' } }))
      renderTab({ ACTIVITY_LOG: true })

      await userEvent.click(await screen.findByRole('button', { name: /Export CSV/ }))

      await waitFor(() => expect(data.download).toHaveBeenCalledWith(expect.any(Blob), 'activity.csv'))
      const [url, init] = fetchSpy.mock.calls[0]
      expect(String(url)).toMatch(/\/organizations\/0xabc\/activity\/export\?format=csv$/)
      expect(init).toMatchObject({ headers: { Authorization: 'Bearer token' } })
      expect(data.track).toHaveBeenCalledWith({ name: 'activity_exported', props: { filter: 'all' } })
      fetchSpy.mockRestore()
    })
  })
})

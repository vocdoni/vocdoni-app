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

vi.mock('~components/Memberbase/Censuses/useCensusIndex', () => ({
  useAllVotes: () => ({ published: data.published, drafts: [], all: data.published, isLoading: false, isError: false }),
}))

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

const renderTab = (appEnv: { ACTIVITY_LOG?: boolean } = {}) =>
  render(
    <MemoryRouter initialEntries={['/admin/memberbase/activity']}>
      <Routes>
        <Route path='/admin/memberbase/activity' element={<ActivityTab />} />
        <Route path='/admin/memberbase/members/:page' element={<h1>People page</h1>} />
      </Routes>
    </MemoryRouter>,
    { appEnv }
  )

describe('ActivityTab', () => {
  beforeEach(() => {
    data.published = []
    data.jobs = []
    data.jobsError = false
    data.fetch.mockReset()
    data.track.mockReset()
    data.download.mockReset()
  })

  it('shows imports without a date as such while jobs carry none, and the votes it has', async () => {
    data.jobs = [job('j1')]
    data.published = [vote('p1', 'Annual assembly', '2026-09-01T09:00:00', '2026-09-01T18:00:00')]
    renderTab()

    expect(await screen.findByText('Recent imports')).toBeInTheDocument()
    expect(screen.getByText('Date not shown yet')).toBeInTheDocument()
    expect(screen.getAllByText(/Annual assembly/).length).toBeGreaterThan(0)
    expect(
      screen.getByText("Changes to people and censuses don't show here yet. Votes and imports do.")
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'People page' })).toBeNull()
  })

  it('stays on the tab when the jobs can not be read', async () => {
    data.jobsError = true
    renderTab()

    expect(
      await screen.findByText("Changes to people and censuses don't show here yet. Votes and imports do.")
    ).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'People page' })).toBeNull()
  })

  it('shows vote history by day, recent imports and a single Soon card once jobs are dated', async () => {
    data.jobs = [job('j1', { completedAt: '2026-09-20T10:00:00Z' }), job('j2', { status: 'failed', errors: [] })]
    data.published = [
      vote('p1', 'Annual assembly', '2026-09-01T09:00:00', '2026-09-01T18:00:00'),
      vote('p2', 'Board election', '2026-09-05T09:00:00', '2026-09-06T18:00:00'),
    ]
    renderTab()

    const days = await screen.findAllByRole('heading', { level: 3 })
    expect(days).toHaveLength(3)
    const first = screen.getByRole('region', { name: days[0].textContent! })
    expect(within(first).getByText(/Board election/)).toBeInTheDocument()
    const assembly = screen.getByRole('region', { name: days[2].textContent! })
    expect(within(assembly).getAllByRole('listitem')).toHaveLength(2)
    expect(within(assembly).getByText('started')).toBeInTheDocument()

    expect(screen.getByText('Recent imports')).toBeInTheDocument()
    expect(screen.getAllByText('98 of 100 members imported')).toHaveLength(2)
    expect(screen.getByText(/2 rows had problems/)).toBeInTheDocument()
    expect(screen.getByText('Failed')).toBeInTheDocument()
    expect(screen.queryByText(/example\.org|34600/)).not.toBeInTheDocument()

    expect(screen.getAllByText('Soon')).toHaveLength(1)
    expect(screen.getByText('Soon: every change, with who and when')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Export CSV/ })).not.toBeInTheDocument()
    expect(data.track).toHaveBeenCalledWith({ name: 'activity_viewed', props: { source: 'derived' } })
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
      data.fetch.mockResolvedValue({
        events: [
          event('e1', 'member.updated', '2026-09-20T10:00:00Z', {
            changes: [
              { field: 'email', before: 'joan@puig.cat', after: 'jp@mail.org' },
              { field: 'birthDate', before: '1980-01-01', after: '1981-01-01' },
            ],
          }),
        ],
      })
    })

    it('lists events with filters, no Soon card, and masked changes', async () => {
      renderTab({ ACTIVITY_LOG: true })

      expect(await screen.findByText('Joan Puig')).toBeInTheDocument()
      expect(screen.getByText(/by Marta/)).toBeInTheDocument()
      expect(screen.queryByText('Soon')).not.toBeInTheDocument()
      expect(data.fetch).toHaveBeenCalledWith('organizations/0xabc/activity?page=1&limit=50')

      await userEvent.click(screen.getByRole('button', { name: /2 changes/ }))
      expect(screen.getByText('Email: j***n@p***.cat → j***p@m***.org')).toBeInTheDocument()
      expect(screen.getByText('Birth Date changed')).toBeInTheDocument()
      expect(screen.queryByText(/1980/)).not.toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: 'Censuses' }))
      await waitFor(() =>
        expect(data.fetch).toHaveBeenLastCalledWith('organizations/0xabc/activity?page=1&limit=50&type=census%2Cgroup')
      )
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

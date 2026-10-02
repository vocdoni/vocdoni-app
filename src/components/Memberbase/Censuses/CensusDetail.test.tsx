import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { mockUseOrganization, render, screen, waitFor, within } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { CensusDetail } from './CensusDetail'
import { CensusPage } from './CensusPage'

const past = new Date(Date.now() - 86_400_000).toISOString()
const future = new Date(Date.now() + 86_400_000).toISOString()

const person = (index: number) => ({
  id: `m${index}`,
  name: `Person${String(index).padStart(2, '0')}`,
  surname: index === 7 ? 'Núñez' : 'Vila',
  email: `p${index}@example.org`,
  memberNumber: String(1000 + index),
  nationalId: `${10000000 + index}Z`,
  phone: 'hash-of-phone',
})

const state = vi.hoisted(() => ({
  groups: [] as Record<string, unknown>[],
  members: {} as Record<string, unknown[]>,
  published: [] as unknown[],
  drafts: [] as unknown[],
  meta: {} as Record<string, unknown>,
  process: null as unknown,
  fetch: vi.fn(),
  download: vi.fn(),
  track: vi.fn(),
}))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ bearedFetch: state.fetch, currentAddress: '0xorg' }),
}))

vi.mock('~src/providers/ApiClientProvider', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/providers/ApiClientProvider')>()),
  useApiClient: () => ({
    client: {
      elections: {
        get: async () => state.process,
        // Everyone can get a code: a 200
        validateCensus: async () => 'OK',
      },
      jobs: { waitFor: async () => ({}) },
    },
  }),
}))

vi.mock('~src/queries/processes', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/queries/processes')>()),
  usePublishedProcesses: () => ({ data: { pages: [{ processes: state.published }] }, isLoading: false }),
  useDraftProcesses: () => ({ data: { pages: [{ processes: state.drafts }] }, isLoading: false }),
}))

vi.mock('~utils/download', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~utils/download')>()),
  downloadBlob: state.download,
}))

vi.mock('~utils/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~utils/analytics')>()),
  trackAnalyticsEvent: state.track,
}))

const route = (url: string, options?: { method?: string }) => {
  const [path, query] = url.split('?')
  const params = new URLSearchParams(query)
  if (path.endsWith('/meta')) return { meta: state.meta }
  const members = path.match(/groups\/([^/]+)\/members$/)
  if (members) {
    const list = state.members[members[1]] ?? []
    const page = Number(params.get('page') ?? 1)
    const limit = Number(params.get('limit') ?? 10)
    return {
      members: list.slice((page - 1) * limit, page * limit),
      pagination: { totalItems: list.length, currentPage: page, lastPage: Math.max(1, Math.ceil(list.length / limit)) },
    }
  }
  const single = path.match(/groups\/([^/]+)$/)
  if (single) {
    if (options?.method === 'DELETE') return 'OK'
    const group = state.groups.find((entry) => entry.id === single[1])
    return { ...group, memberIds: (state.members[single[1]] ?? []).map((member) => (member as { id: string }).id) }
  }
  if (path.endsWith('/groups'))
    return { groups: state.groups, pagination: { currentPage: 1, lastPage: 1, totalItems: state.groups.length } }
  return {}
}

const vote = (id: string, title: string, census: Record<string, unknown>, status: string, published = true) => ({
  id,
  title: { default: title },
  census,
  questions: [{ status, results: { maxVoters: 31 } }],
  published,
  startDate: past,
  endDate: future,
})

const group = (id: string, title: string, extra: Record<string, unknown> = {}) => ({
  id,
  title,
  description: '',
  membersCount: (state.members[id] ?? []).length,
  censusIds: [],
  createdAt: past,
  updatedAt: past,
  ...extra,
})

const renderDetail = (props: Parameters<typeof CensusDetail>[0]) =>
  render(
    <MemoryRouter>
      <CensusDetail {...props} />
    </MemoryRouter>
  )

describe('CensusDetail', () => {
  beforeEach(() => {
    state.members = { quota: Array.from({ length: 30 }, (_, index) => person(index)), everyone: [person(1)] }
    state.groups = [
      group('everyone', 'All members', { isAutoGroup: true, membersCount: 1742 }),
      group('quota', 'Quota pagada'),
    ]
    state.published = [vote('p1', 'Assemblea General 2026', { groupId: 'quota', size: 30 }, 'ONGOING')]
    state.drafts = []
    state.meta = {}
    state.process = null
    state.fetch.mockReset()
    state.fetch.mockImplementation(async (url: string, options?: { method?: string }) => route(url, options))
    state.download.mockReset()
    state.track.mockReset()
    setReactProvidersMock({ useOrganization: () => mockUseOrganization({ organization: { address: '0xorg' } }) })
  })

  it('lists a saved census page by page and searches it in the browser', async () => {
    const user = userEvent.setup()
    renderDetail({ kind: 'saved', groupId: 'quota' })

    const table = await screen.findByRole('table')
    expect(within(table).getAllByRole('row')).toHaveLength(26)
    expect(screen.getByText('1–25 of 30')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(screen.getByText('26–30 of 30')).toBeInTheDocument()
    expect(screen.getByText('Person29 Vila')).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: 'Search by name, email or number' }), 'nunez')
    expect(within(screen.getByRole('table')).getAllByRole('row')).toHaveLength(2)
    expect(screen.getByText('Person07 Núñez')).toBeInTheDocument()

    // Read the whole census once, 100 at a time, rather than a request per page
    const memberCalls = state.fetch.mock.calls.filter(([url]) => String(url).includes('/members'))
    expect(memberCalls.map(([url]) => url)).toEqual(['organizations/0xorg/groups/quota/members?page=1&limit=100'])
    expect(state.track).toHaveBeenCalledWith({ name: 'census_opened', props: { kind: 'saved', state: 'saved' } })
  })

  it('pages a census too big to search from the server', async () => {
    const user = userEvent.setup()
    state.members.big = Array.from({ length: 6000 }, (_, index) => person(index))
    state.groups.push(group('big', 'Col·legiats'))
    renderDetail({ kind: 'saved', groupId: 'big' })

    expect(await screen.findByText(/Search works in censuses of up to 5,000 people/)).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Search by name, email or number' })).toBeNull()
    expect(await screen.findByText('Page 1 of 240')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next page' }))
    expect(await screen.findByText('Page 2 of 240')).toBeInTheDocument()

    const memberCalls = state.fetch.mock.calls.map(([url]) => String(url)).filter((url) => url.includes('/members'))
    expect(memberCalls).toEqual([
      'organizations/0xorg/groups/big/members?page=1&limit=25',
      'organizations/0xorg/groups/big/members?page=2&limit=25',
    ])
  })

  it('names the votes sharing a saved census and keeps it while a published vote uses it', async () => {
    renderDetail({ kind: 'saved', groupId: 'quota' })

    expect(
      await screen.findByText(
        "Shared with 'Assemblea General 2026' (live). Changing it changes who can vote in all of them, even closed ones."
      )
    ).toBeInTheDocument()
    const usedBy = screen.getByRole('heading', { name: 'Used by' }).parentElement!.parentElement!
    expect(within(usedBy).getByRole('link', { name: 'Assemblea General 2026' })).toHaveAttribute(
      'href',
      '/admin/memberbase/censuses/vote/p1'
    )
    expect(screen.getByRole('button', { name: 'Delete saved census' })).toBeDisabled()
    expect(screen.getAllByText('A published vote uses it, so it stays.').length).toBeGreaterThan(0)
  })

  it('deletes a saved census only drafts use, naming the drafts it empties', async () => {
    const user = userEvent.setup()
    state.published = []
    state.drafts = [vote('d1', 'Comitè', { groupId: 'quota' }, 'UPCOMING', false)]
    renderDetail({ kind: 'saved', groupId: 'quota' })

    await user.click(await screen.findByRole('button', { name: 'Delete saved census' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText("This also changes who can vote in 'Comitè' (draft).")).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Delete census' }))

    await waitFor(() =>
      expect(state.fetch).toHaveBeenCalledWith('organizations/0xorg/groups/quota', { method: 'DELETE' })
    )
  })

  it('downloads the census as a CSV without phones and with national IDs masked', async () => {
    const user = userEvent.setup()
    renderDetail({ kind: 'saved', groupId: 'quota' })

    await user.click(await screen.findByRole('button', { name: 'Download census (CSV)' }))

    await waitFor(() => expect(state.download).toHaveBeenCalled())
    const [blob, fileName] = state.download.mock.calls[0]
    expect(fileName).toMatch(/^census-quota-pagada-\d{4}-\d{2}-\d{2}\.csv$/)
    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.readAsText(blob as Blob)
    })
    expect(text).toContain('First Name;Last Name;Member Number;Email;National ID')
    expect(text).toContain('Person00;Vila;1000;p0@example.org;•••00Z')
    expect(text).not.toContain('hash-of-phone')
    expect(text).not.toContain('10000000Z')
    expect(state.track).toHaveBeenCalledWith({ name: 'census_exported', props: { kind: 'saved', count: 30 } })
  })

  it('shows Everyone read-only', async () => {
    renderDetail({ kind: 'saved', groupId: 'everyone' })

    expect(
      await screen.findByText('Everyone always holds all your members. Add or remove people in People.')
    ).toBeInTheDocument()
    expect(screen.getByText('Everyone: members you add later can vote too.')).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Delete saved census' })).toBeNull()
  })

  it('locks the census of a vote that has ended and counts its voters at close', async () => {
    state.meta = { vg_owned: { processId: 'p9', kind: 'copy', createdAt: past } }
    state.members.owned = [person(1), person(2)]
    state.groups.push(group('owned', 'Census of Junta'))
    state.process = vote('p9', 'Eleccions Junta 2025', { groupId: 'owned', size: 2, twoFaFields: ['email'] }, 'RESULTS')
    renderDetail({ kind: 'vote', processId: 'p9' })

    expect(await screen.findByText("This vote has ended, so its census can't change.")).toBeInTheDocument()
    expect(screen.getByText('voters at close')).toBeInTheDocument()
    expect(screen.getByText('31')).toBeInTheDocument()
    expect(
      screen.getByText("This vote's own census. Editing it doesn't change your members or other votes.")
    ).toBeInTheDocument()
    expect(screen.getByText('Members sign in with their details and a one-time code by email.')).toBeInTheDocument()
    // Nobody signs in to a vote that's over: no readiness
    expect(screen.queryByText(/can get a code/)).toBeNull()
  })

  it('sends a vote’s own group to that vote’s census page', async () => {
    state.meta = { vg_owned: { processId: 'p9', kind: 'copy', createdAt: past } }
    state.groups.push(group('owned', 'Census of Junta'))
    render(
      <MemoryRouter initialEntries={['/admin/memberbase/censuses/owned']}>
        <Routes>
          <Route path='/admin/memberbase/censuses/:groupId' element={<CensusPage kind='saved' />} />
          <Route path='/admin/memberbase/censuses/vote/:processId' element={<h1>Vote census</h1>} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByRole('heading', { name: 'Vote census' })).toBeInTheDocument()
  })
})

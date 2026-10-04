import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { VocdoniApiError } from '@vocdoni/api-client'
import { ApiError } from '~components/Auth/api'
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
  /** More draft pages are still to load */
  moreDrafts: false,
  meta: {} as Record<string, unknown>,
  process: null as unknown,
  orgMembers: [] as Record<string, unknown>[],
  conflicts: [] as string[][],
  /** Who the validation says can't get a code */
  missing: [] as string[],
  /** What the next group PUTs report in `errors` */
  putErrors: [] as string[],
  fetch: vi.fn(),
  addCensus: vi.fn(),
  waitFor: vi.fn(),
  participants: vi.fn(),
  download: vi.fn(),
  track: vi.fn(),
  toast: vi.fn(),
}))

vi.mock('~components/Toast', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~components/Toast')>()),
  useToast: () => state.toast,
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
        // Everyone can get a code (a 200), unless the test names who can't
        validateCensus: async () => {
          if (!state.missing.length) return 'OK'
          throw new VocdoniApiError(400, { data: { missingData: state.missing } }, 'missing data', 40000)
        },
        addCensusMembers: state.addCensus,
        participants: state.participants,
      },
      jobs: { waitFor: state.waitFor },
    },
  }),
}))

vi.mock('~src/queries/processes', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/queries/processes')>()),
  usePublishedProcesses: () => ({ data: { pages: [{ processes: state.published }] }, isLoading: false }),
  useDraftProcesses: () => ({
    data: { pages: [{ processes: state.drafts }] },
    isLoading: false,
    hasNextPage: state.moreDrafts,
    isFetchingNextPage: state.moreDrafts,
    fetchNextPage: vi.fn(),
  }),
}))

vi.mock('~utils/download', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~utils/download')>()),
  downloadBlob: state.download,
}))

vi.mock('~utils/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~utils/analytics')>()),
  trackAnalyticsEvent: state.track,
}))

const conflict = (signedMemberIds: string[]) =>
  new ApiError(
    { error: 'member already signed', data: { signedMemberIds } } as never,
    new Response(null, { status: 409 })
  )

const route = (url: string, options?: { method?: string; body?: Record<string, unknown> }) => {
  const [path, query] = url.split('?')
  const params = new URLSearchParams(query)
  if (path.endsWith('/meta')) return { meta: state.meta }
  if (path.endsWith('/census') && options?.method === 'DELETE')
    return { removed: (options.body?.memberIds as string[]).length }
  if (path.endsWith('/members') && !path.includes('/groups/')) {
    if (options?.method === 'POST') {
      const created = (options.body?.members as Record<string, unknown>[]).map((member, index) => ({
        ...member,
        id: `new${index}`,
      }))
      state.orgMembers.push(...created)
      return { added: created.length }
    }
    const search = (params.get('search') ?? '').toLowerCase()
    const list = state.orgMembers.filter(
      (member) => !search || `${member.name} ${member.surname} ${member.email}`.toLowerCase().includes(search)
    )
    return {
      members: list.slice(0, Number(params.get('limit') ?? 10)),
      pagination: { totalItems: list.length, lastPage: 1, currentPage: 1 },
    }
  }
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
    if (options?.method === 'PUT') {
      const removing = (options.body?.removeMembers as string[] | undefined) ?? []
      const signed = state.conflicts.shift()
      if (signed && removing.some((id) => signed.includes(id))) throw conflict(signed)
      if (state.putErrors.length) return { censusJobIds: [], errors: state.putErrors.splice(0) }
      return 'OK'
    }
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
    state.moreDrafts = false
    state.meta = {}
    state.process = null
    state.fetch.mockReset()
    state.fetch.mockImplementation(async (url: string, options?: { method?: string }) => route(url, options))
    state.download.mockReset()
    state.track.mockReset()
    state.toast.mockReset()
    state.orgMembers = Array.from({ length: 3 }, (_, index) => person(index))
    state.conflicts = []
    state.missing = []
    state.putErrors = []
    state.addCensus.mockReset().mockImplementation(async (_id: string, ids: string[]) => ({
      added: ids.length,
      jobId: `job-${ids[0]}`,
    }))
    state.waitFor.mockReset().mockResolvedValue({})
    state.participants.mockReset().mockImplementation(async (_id: string, { value }: { value: string }) => ({
      participants: value.startsWith('p0@')
        ? [{ memberId: 'm0', name: 'Person00', surname: 'Vila', questions: [] }]
        : value.startsWith('p1@')
          ? [{ memberId: 'm1', name: 'Person01', surname: 'Vila', questions: [] }]
          : value.startsWith('home@')
            ? [
                { memberId: 'm3', name: 'Person03', surname: 'Vila', questions: [] },
                { memberId: 'm4', name: 'Person04', surname: 'Vila', questions: [] },
              ]
            : [],
    }))
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
    const user = userEvent.setup()
    renderDetail({ kind: 'saved', groupId: 'quota' })

    expect(
      await screen.findByText(
        "Shared with 'Assemblea General 2026' (live). Changing it changes who can vote in all of them, even closed ones."
      )
    ).toBeInTheDocument()
    // The facts strip names the vote that uses it
    expect(screen.getByText('Used by')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Assemblea General 2026' })).toHaveAttribute(
      'href',
      '/admin/memberbase/censuses/vote/p1'
    )
    // Delete is in the "…" menu, refused with its reason
    await user.click(screen.getByRole('button', { name: 'More actions' }))
    const remove = await screen.findByRole('menuitem', { name: /Delete saved census/ })
    expect(remove).toHaveAttribute('aria-disabled', 'true')
    expect(remove).toHaveTextContent('A published vote uses it, so it stays.')
  })

  it('deletes a saved census only drafts use, naming the drafts it empties', async () => {
    const user = userEvent.setup()
    state.published = []
    state.drafts = [vote('d1', 'Comitè', { groupId: 'quota' }, 'UPCOMING', false)]
    renderDetail({ kind: 'saved', groupId: 'quota' })

    await user.click(await screen.findByRole('button', { name: 'More actions' }))
    await user.click(await screen.findByRole('menuitem', { name: /Delete saved census/ }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText("This also changes who can vote in 'Comitè' (draft).")).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Delete census' }))

    await waitFor(() =>
      expect(state.fetch).toHaveBeenCalledWith('organizations/0xorg/groups/quota', { method: 'DELETE' })
    )
  })

  it('names the votes that copied a saved census, and says calmly that changes here don’t reach them', async () => {
    state.groups.push(group('own-p2', 'Census of Assemblea'), group('own-d2', 'Census of Junta'))
    state.meta = {
      'vg_own-p2': {
        processId: 'p2',
        kind: 'copy',
        createdAt: '2026-09-30T10:00:00Z',
        fromId: 'quota',
        source: 'saved',
      },
      'vg_own-d2': {
        processId: 'd2',
        kind: 'copy',
        createdAt: '2026-10-02T10:00:00Z',
        fromId: 'quota',
        source: 'saved',
      },
      // Replaced since: its vote follows another census now
      'vg_own-old': { processId: 'd2', kind: 'copy', createdAt: '2026-09-01T10:00:00Z', fromId: 'quota' },
    }
    state.published = [vote('p2', 'Assemblea General 2026', { groupId: 'own-p2', size: 30 }, 'ONGOING')]
    state.drafts = [vote('d2', 'Junta 2027', { groupId: 'own-d2' }, 'UPCOMING', false)]
    renderDetail({ kind: 'saved', groupId: 'quota' })

    expect(await screen.findByText('Copied into')).toBeInTheDocument()
    // The live one first, then how many more
    expect(screen.getByRole('link', { name: 'Assemblea General 2026' })).toHaveAttribute(
      'href',
      '/admin/memberbase/censuses/vote/p2'
    )
    expect(screen.getByText('And 1 more vote')).toBeInTheDocument()
    expect(
      screen.getByText(
        "The 2 votes that copied this census have their own copies, so changes here don't change who votes there."
      )
    ).toBeInTheDocument()
    // Nothing shares it: no "Used by"
    expect(screen.queryByText('Used by')).toBeNull()
  })

  it('shows who can’t get a code, with a way to add what they’re missing', async () => {
    const user = userEvent.setup()
    state.missing = ['m3', 'm7']
    renderDetail({ kind: 'saved', groupId: 'quota' })

    expect(await screen.findByText(/^2 can't get a code/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Show them' }))

    expect(screen.getByRole('button', { name: "Can't get a code · 2" })).toHaveAttribute('aria-pressed', 'true')
    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1)
    expect(rows.map((row) => within(row).getByText(/^Person\d+/).textContent)).toEqual([
      'Person03 Vila',
      'Person07 Núñez',
    ])
    expect(within(rows[0]).getByText('No email or mobile')).toBeInTheDocument()
    expect(within(rows[0]).getByRole('link', { name: 'Add one' })).toHaveAttribute(
      'href',
      '/admin/memberbase/members/1?member=m3'
    )
  })

  it('waits for every vote to load before a saved census can be deleted', async () => {
    const user = userEvent.setup()
    state.published = []
    state.moreDrafts = true
    renderDetail({ kind: 'saved', groupId: 'quota' })

    await user.click(await screen.findByRole('button', { name: 'More actions' }))
    const remove = await screen.findByRole('menuitem', { name: /Delete saved census/ })
    expect(remove).toHaveAttribute('aria-disabled', 'true')
    expect(remove).toHaveTextContent(
      'Deleting waits until all your votes are checked, so none still using it is missed.'
    )
  })

  it('downloads the census as a CSV without phones and with national IDs masked', async () => {
    const user = userEvent.setup()
    renderDetail({ kind: 'saved', groupId: 'quota' })

    await user.click(await screen.findByRole('button', { name: 'Download CSV' }))

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

  it('keeps a draft still on a shared saved census read-only, sending the admin to the editor', async () => {
    state.process = vote('d1', 'Comitè', { groupId: 'quota', size: 30 }, 'UPCOMING', false)
    state.drafts = [state.process]
    renderDetail({ kind: 'vote', processId: 'd1' })

    expect(await screen.findByText(/This draft still uses a saved census other votes share/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open in editor' })).toHaveAttribute(
      'href',
      expect.stringContaining('draftId=d1')
    )
    expect(screen.queryByRole('button', { name: 'Add people' })).toBeNull()
    expect(screen.queryByRole('checkbox')).toBeNull()
  })

  it('locks the census of a vote that has ended and counts its voters at close', async () => {
    state.meta = { vg_owned: { processId: 'p9', kind: 'copy', createdAt: past } }
    state.members.owned = [person(1), person(2)]
    state.groups.push(group('owned', 'Census of Junta'))
    state.process = vote(
      'p9',
      'Eleccions Junta 2025',
      { groupId: 'owned', size: 2, authFields: ['memberNumber', 'nationalId'], twoFaFields: ['email'] },
      'RESULTS'
    )
    renderDetail({ kind: 'vote', processId: 'p9' })

    expect(await screen.findByText("This vote has ended, so its census can't change.")).toBeInTheDocument()
    expect(screen.getByText('members at close')).toBeInTheDocument()
    expect(screen.getByText('31')).toBeInTheDocument()
    // No sentence restating what the facts already say
    expect(screen.queryByText(/This vote's own census/)).toBeNull()
    expect(screen.getByText(/^Census created on \d+ \w+ \d{4} at \d{2}:\d{2}$/)).toBeInTheDocument()
    // The facts: how they signed in, exactly, and where the people came from
    expect(screen.getByRole('heading', { name: 'Eleccions Junta 2025' })).toBeInTheDocument()
    expect(screen.getByText('They confirm their member number and national ID')).toBeInTheDocument()
    expect(screen.getByText('Then a one-time code by email')).toBeInTheDocument()
    expect(screen.getAllByText(/^Copied from|^Chosen by hand/).length).toBeGreaterThan(0)
    // Nobody signs in to a vote that's over: no readiness
    expect(screen.queryByText(/can get the code|can't get the code/)).toBeNull()
  })

  it('explains a census made from every member at publish can still change', async () => {
    state.meta = { vg_snap: { processId: 'p8', kind: 'snapshot', createdAt: past } }
    state.members.snap = [person(1), person(2)]
    state.groups.push(group('snap', 'Census of Assemblea'))
    state.process = vote('p8', 'Assemblea 2026', { groupId: 'snap', size: 2, twoFaFields: ['email'] }, 'ONGOING')
    renderDetail({ kind: 'vote', processId: 'p8' })

    expect(await screen.findByText(/^Your members on \d+ \w+ \d{4}$/)).toBeInTheDocument()
    expect(screen.getByText('You can still add and remove members in this census')).toBeInTheDocument()
    // The note sits under the facts, once
    expect(
      screen.getByText(
        /^This census was created from your members list as it was on \d+ \w+ \d{4}, when you published the vote\. You can still add or remove people here\. Fixing someone's details also changes them in your members list\.$/
      )
    ).toBeInTheDocument()
  })

  it('sends an old link to the Everyone census to People', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/memberbase/censuses/everyone']}>
        <Routes>
          <Route path='/admin/memberbase/censuses/:groupId' element={<CensusPage kind='saved' />} />
          <Route path='/admin/memberbase/members/:page' element={<h1>People page</h1>} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByRole('heading', { name: 'People page' })).toBeInTheDocument()
  })

  it('never puts an id that walks the API path into a request', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/memberbase/censuses/..%2F..%2F0xother%2Fgroups%2Fg1']}>
        <Routes>
          <Route path='/admin/memberbase/censuses/:groupId' element={<CensusPage kind='saved' />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByText("We couldn't find this census.")).toBeInTheDocument()
    expect(state.fetch.mock.calls.map(([url]) => String(url)).filter((url) => url.includes('0xother'))).toEqual([])
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

  describe('editing', () => {
    const liveOwnCensus = (questions?: unknown[]) => {
      state.meta = { vg_owned: { processId: 'p5', kind: 'copy', createdAt: past } }
      state.members.owned = [person(1), person(2), person(3)]
      state.groups.push(group('owned', 'Census of Assemblea'))
      state.process = {
        ...vote('p5', 'Assemblea General 2026', { groupId: 'owned', size: 3, twoFaFields: ['email'] }, 'ONGOING'),
        ...(questions ? { questions } : {}),
      }
    }

    const putCalls = () =>
      state.fetch.mock.calls
        .filter(([, options]) => options?.method === 'PUT')
        .map(([url, options]) => ({ url, body: options.body }))

    const select = async (user: ReturnType<typeof userEvent.setup>, ...names: string[]) => {
      for (const name of names) await user.click(await screen.findByRole('checkbox', { name: `Select ${name}` }))
    }

    it('removes people from a live vote’s own census and shows the new size', async () => {
      const user = userEvent.setup()
      liveOwnCensus()
      renderDetail({ kind: 'vote', processId: 'p5' })

      await select(user, 'Person01 Vila', 'Person02 Vila')
      await user.click(screen.getByRole('button', { name: 'Remove…' }))

      const dialog = await screen.findByRole('dialog')
      expect(within(dialog).getByText("Remove 2 voters from 'Assemblea General 2026'?")).toBeInTheDocument()
      expect(dialog).toHaveTextContent("They can't vote in this vote anymore. They stay in your members.")
      await user.click(within(dialog).getByRole('button', { name: 'Remove 2 voters' }))

      await waitFor(() => expect(state.toast).toHaveBeenCalledWith(expect.objectContaining({ title: '3 → 1 voters' })))
      expect(putCalls()).toEqual([{ url: 'organizations/0xorg/groups/owned', body: { removeMembers: ['m1', 'm2'] } }])
      expect(state.track).toHaveBeenCalledWith({
        name: 'voters_removed',
        props: { requested: 2, removed: 2, blocked: 0 },
      })
    })

    it('says who already started voting when nobody was removed, and removes the others on request', async () => {
      const user = userEvent.setup()
      liveOwnCensus()
      state.conflicts = [['m1']]
      renderDetail({ kind: 'vote', processId: 'p5' })

      await select(user, 'Person01 Vila', 'Person02 Vila', 'Person03 Vila')
      await user.click(screen.getByRole('button', { name: 'Remove…' }))
      await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Remove 3 voters' }))

      const retry = await screen.findByRole('dialog', { name: 'Nobody was removed' })
      expect(retry).toHaveTextContent('Person01 Vila has already started voting. Remove the other 2?')
      await user.click(within(retry).getByRole('button', { name: 'Remove the other 2' }))

      await waitFor(() => expect(state.toast).toHaveBeenCalledWith(expect.objectContaining({ title: '3 → 1 voters' })))
      expect(putCalls().map((call) => call.body)).toEqual([
        { removeMembers: ['m1', 'm2', 'm3'] },
        { removeMembers: ['m2', 'm3'] },
      ])
      expect(state.track).toHaveBeenCalledWith({
        name: 'voters_removed',
        props: { requested: 3, removed: 2, blocked: 1 },
      })
    })

    it('refuses a removal that would leave a question with nobody allowed to answer it', async () => {
      const user = userEvent.setup()
      liveOwnCensus([
        { id: 'q1', title: { default: 'Treasurer' }, status: 'ONGOING', eligibleMemberIds: ['m1', 'm2'] },
        { id: 'q2', title: { default: 'Budget' }, status: 'ONGOING' },
      ])
      renderDetail({ kind: 'vote', processId: 'p5' })

      await select(user, 'Person01 Vila', 'Person02 Vila')
      await user.click(screen.getByRole('button', { name: 'Remove…' }))

      const dialog = await screen.findByRole('dialog')
      expect(dialog).toHaveTextContent("This would leave nobody allowed to answer 'Treasurer'.")
      expect(within(dialog).getByRole('button', { name: 'Remove 2 voters' })).toBeDisabled()
    })

    it('adds members picked from the member list, with those already in it locked', async () => {
      const user = userEvent.setup()
      liveOwnCensus()
      renderDetail({ kind: 'vote', processId: 'p5' })

      await user.click(await screen.findByRole('button', { name: 'Add people' }))
      const sheet = await screen.findByRole('dialog', { name: 'Add people' })
      expect(await within(sheet).findByRole('checkbox', { name: /Person01 Vila/ })).toBeDisabled()
      await user.click(within(sheet).getByRole('checkbox', { name: /Person00 Vila/ }))
      await user.click(within(sheet).getByRole('button', { name: 'Add 1 person' }))

      await waitFor(() => expect(state.toast).toHaveBeenCalledWith(expect.objectContaining({ title: '3 → 4 voters' })))
      expect(putCalls()).toEqual([{ url: 'organizations/0xorg/groups/owned', body: { addMembers: ['m0'] } }])
    })

    it('counts only the people the vote took, and says who it left out for lacking sign-in details', async () => {
      const user = userEvent.setup()
      liveOwnCensus()
      state.putErrors = ['m0: missing required auth data']
      renderDetail({ kind: 'vote', processId: 'p5' })

      await user.click(await screen.findByRole('button', { name: 'Add people' }))
      const sheet = await screen.findByRole('dialog', { name: 'Add people' })
      await user.click(await within(sheet).findByRole('checkbox', { name: /Person00 Vila/ }))
      await user.click(within(sheet).getByRole('button', { name: 'Add 1 person' }))

      await waitFor(() =>
        expect(state.toast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: '3 → 3 voters',
            description: "1 person wasn't added: they don't have the details this vote signs in with.",
            type: 'warning',
          })
        )
      )
    })

    it('creates a new person and adds them to the census at once', async () => {
      const user = userEvent.setup()
      liveOwnCensus()
      renderDetail({ kind: 'vote', processId: 'p5' })

      await user.click(await screen.findByRole('button', { name: 'Add people' }))
      const sheet = await screen.findByRole('dialog', { name: 'Add people' })
      await user.click(within(sheet).getByRole('tab', { name: 'New person' }))
      expect(within(sheet).getByText("They'll be added to your members and to this census.")).toBeInTheDocument()
      await user.type(within(sheet).getByRole('textbox', { name: 'First Name' }), 'Laia')
      await user.type(within(sheet).getByRole('textbox', { name: 'Email' }), 'laia@example.org')
      await user.click(within(sheet).getByRole('button', { name: 'Add person' }))

      await waitFor(() =>
        expect(putCalls()).toEqual([{ url: 'organizations/0xorg/groups/owned', body: { addMembers: ['new0'] } }])
      )
      expect(state.fetch).toHaveBeenCalledWith(expect.stringContaining('/members?async=false'), {
        body: { members: [{ name: 'Laia', email: 'laia@example.org' }] },
        method: 'POST',
      })
    })

    it('finds people in a vote without a list by what they sign in with, and removes them through its census', async () => {
      const user = userEvent.setup()
      state.process = vote('p7', 'Junta', { size: 5, twoFaFields: ['email'] }, 'ONGOING')
      renderDetail({ kind: 'vote', processId: 'p7' })

      expect(await screen.findByText(/isn't kept as a list we can show/)).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Remove people…' }))
      const sheet = await screen.findByRole('dialog', { name: 'Remove people' })
      expect(within(sheet).getByRole('tab', { name: 'Find in this vote', selected: true })).toBeInTheDocument()
      await user.type(within(sheet).getByRole('textbox', { name: 'Email to look up' }), 'p0@example.org, nobody@x.org')
      await user.click(within(sheet).getByRole('button', { name: 'Find' }))

      // Found people come ticked; values not in the vote say so
      expect(await within(sheet).findByRole('checkbox', { name: /Person00 Vila/ })).toBeChecked()
      expect(within(sheet).getByText('Not in this vote')).toBeInTheDocument()
      expect(state.participants).toHaveBeenCalledWith('p7', { field: 'email', value: 'p0@example.org' })
      await user.click(within(sheet).getByRole('button', { name: 'Remove 1 person…' }))
      await user.click(
        within(await screen.findByRole('dialog', { name: "Remove 1 voter from 'Junta'?" })).getByRole('button', {
          name: 'Remove 1 voter',
        })
      )

      await waitFor(() => expect(state.toast).toHaveBeenCalledWith(expect.objectContaining({ title: '5 → 4 voters' })))
      expect(state.fetch).toHaveBeenCalledWith('processes/p7/census', { method: 'DELETE', body: { memberIds: ['m0'] } })
    })

    it('ticks nobody for a value several people share, leaving the choice to the admin', async () => {
      const user = userEvent.setup()
      state.process = vote('p7', 'Junta', { size: 5, twoFaFields: ['email'] }, 'ONGOING')
      renderDetail({ kind: 'vote', processId: 'p7' })

      await user.click(await screen.findByRole('button', { name: 'Remove people…' }))
      const sheet = await screen.findByRole('dialog', { name: 'Remove people' })
      await user.type(within(sheet).getByRole('textbox', { name: 'Email to look up' }), 'home@example.org')
      await user.click(within(sheet).getByRole('button', { name: 'Find' }))

      expect(await within(sheet).findByRole('checkbox', { name: /Person03 Vila/ })).not.toBeChecked()
      expect(within(sheet).getByRole('checkbox', { name: /Person04 Vila/ })).not.toBeChecked()
      expect(within(sheet).getByText('2 people match home@example.org. Tick who to take out.')).toBeInTheDocument()
    })

    it('can still pick from the member list, with no way back for people who may not have been in the vote', async () => {
      const user = userEvent.setup()
      state.fetch.mockImplementation(
        async (url: string, options?: { method?: string; body?: Record<string, unknown> }) =>
          url.endsWith('/census') && options?.method === 'DELETE' ? { removed: 0 } : route(url, options)
      )
      state.process = vote('p7', 'Junta', { size: 5, twoFaFields: ['email'] }, 'ONGOING')
      renderDetail({ kind: 'vote', processId: 'p7' })

      await user.click(await screen.findByRole('button', { name: 'Remove people…' }))
      const sheet = await screen.findByRole('dialog', { name: 'Remove people' })
      await user.click(within(sheet).getByRole('tab', { name: 'From members' }))
      await user.click(await within(sheet).findByRole('checkbox', { name: /Person02 Vila/ }))
      await user.click(within(sheet).getByRole('button', { name: 'Remove 1 person…' }))
      await user.click(
        within(await screen.findByRole('dialog', { name: /Remove 1 voter/ })).getByRole('button', {
          name: 'Remove 1 voter',
        })
      )

      await waitFor(() =>
        expect(state.track).toHaveBeenCalledWith({
          name: 'voters_removed',
          props: { requested: 1, removed: 0, blocked: 0 },
        })
      )
      expect(state.toast).not.toHaveBeenCalled()
    })

    it('offers to add removed voters back, through the same path they went out', async () => {
      const user = userEvent.setup()
      liveOwnCensus()
      renderDetail({ kind: 'vote', processId: 'p5' })

      await select(user, 'Person01 Vila', 'Person02 Vila')
      await user.click(screen.getByRole('button', { name: 'Remove…' }))
      await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Remove 2 voters' }))

      await waitFor(() => expect(state.toast).toHaveBeenCalledWith(expect.objectContaining({ title: '3 → 1 voters' })))
      const removedToast = state.toast.mock.calls.find(([options]) => options.title === '3 → 1 voters')![0]
      expect(removedToast).toMatchObject({ duration: 8000, action: { label: 'Add them back' } })

      await removedToast.action.onClick()

      await waitFor(() => expect(state.toast).toHaveBeenCalledWith(expect.objectContaining({ title: '1 → 3 voters' })))
      expect(putCalls().map((call) => call.body)).toEqual([
        { removeMembers: ['m1', 'm2'] },
        { addMembers: ['m1', 'm2'] },
      ])
      expect(state.track).toHaveBeenCalledWith({ name: 'voters_added', props: { count: 2, surface: 'undo_remove' } })
    })

    it('offers no way back when the vote limits who answers a question, as that list would stay short', async () => {
      const user = userEvent.setup()
      liveOwnCensus([
        { id: 'q1', title: { default: 'Treasurer' }, status: 'ONGOING', eligibleMemberIds: ['m1', 'm2', 'm3'] },
      ])
      renderDetail({ kind: 'vote', processId: 'p5' })

      await select(user, 'Person01 Vila')
      await user.click(screen.getByRole('button', { name: 'Remove…' }))
      await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Remove 1 voter' }))

      await waitFor(() => expect(state.toast).toHaveBeenCalledWith(expect.objectContaining({ title: '3 → 2 voters' })))
      const removedToast = state.toast.mock.calls.find(([options]) => options.title === '3 → 2 voters')![0]
      expect(removedToast.action).toBeUndefined()
    })

    it('adds back only who actually went after someone blocked the first try', async () => {
      const user = userEvent.setup()
      liveOwnCensus()
      state.conflicts = [['m1']]
      renderDetail({ kind: 'vote', processId: 'p5' })

      await select(user, 'Person01 Vila', 'Person02 Vila', 'Person03 Vila')
      await user.click(screen.getByRole('button', { name: 'Remove…' }))
      await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Remove 3 voters' }))
      await user.click(
        within(await screen.findByRole('dialog', { name: 'Nobody was removed' })).getByRole('button', {
          name: 'Remove the other 2',
        })
      )

      await waitFor(() => expect(state.toast).toHaveBeenCalledWith(expect.objectContaining({ title: '3 → 1 voters' })))
      const removedToast = state.toast.mock.calls.find(([options]) => options.title === '3 → 1 voters')![0]
      await removedToast.action.onClick()

      await waitFor(() => expect(putCalls().at(-1)?.body).toEqual({ addMembers: ['m2', 'm3'] }))
    })

    it('adds to a live vote on a shared saved census through the vote, waiting for it to grow', async () => {
      const user = userEvent.setup()
      state.process = vote('p1', 'Assemblea General 2026', { groupId: 'quota', size: 30 }, 'ONGOING')
      renderDetail({ kind: 'vote', processId: 'p1', surface: 'vote_voters_tab' })

      expect(
        await screen.findByText(
          "This vote follows the saved census 'Quota pagada', so changes to it reach this vote too. Changes made here only affect this vote."
        )
      ).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Add people' }))
      const sheet = await screen.findByRole('dialog', { name: 'Add people' })
      await user.click(await within(sheet).findByRole('checkbox', { name: /Person00 Vila/ }))
      await user.click(within(sheet).getByRole('button', { name: 'Add 1 person' }))

      await waitFor(() =>
        expect(state.toast).toHaveBeenCalledWith(expect.objectContaining({ title: '30 → 31 voters' }))
      )
      expect(state.addCensus).toHaveBeenCalledWith('p1', ['m0'])
      expect(state.waitFor).toHaveBeenCalledWith('job-m0', expect.anything())
      // The saved census and the other votes on it are left alone
      expect(putCalls()).toEqual([])
      expect(state.track).toHaveBeenCalledWith({
        name: 'voters_added',
        props: { count: 1, surface: 'vote_voters_tab' },
      })
    })

    it('lets a live vote following Everyone lose people, but not gain them: everyone is in already', async () => {
      state.process = vote('p2', 'Assemblea', { groupId: 'everyone', size: 1742, twoFaFields: ['email'] }, 'ONGOING')
      renderDetail({ kind: 'vote', processId: 'p2' })

      expect(await screen.findByRole('button', { name: 'Remove people…' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Add people' })).toBeNull()
      expect(screen.getByText(/Removing someone here only takes them out of this vote/)).toBeInTheDocument()
    })

    it('says nothing about codes for a vote that sends none, and that members added later join', async () => {
      state.process = vote(
        'p3',
        'Assemblea 2027',
        { groupId: 'everyone', size: 1742, authFields: ['name'], twoFaFields: [] },
        'READY',
        false
      )
      renderDetail({ kind: 'vote', processId: 'p3' })

      expect(await screen.findByText('They confirm their first name')).toBeInTheDocument()
      // No code is sent: nothing is said about one
      expect(screen.queryByText(/code/)).toBeNull()
      expect(screen.getByText('All your members')).toBeInTheDocument()
      expect(screen.getByText('Members you add before publishing can vote too')).toBeInTheDocument()
      expect(screen.getByText('Not scheduled yet')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /copy/i })).toBeNull()
    })

    it('offers no edits on a closed vote, nor on Everyone', async () => {
      state.meta = { vg_owned: { processId: 'p9', kind: 'copy', createdAt: past } }
      state.members.owned = [person(1)]
      state.groups.push(group('owned', 'Census of Junta'))
      state.process = vote('p9', 'Eleccions Junta 2025', { groupId: 'owned', size: 1 }, 'RESULTS')
      renderDetail({ kind: 'vote', processId: 'p9' })

      expect(await screen.findByText("This vote has ended, so its census can't change.")).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Add people' })).toBeNull()
      expect(screen.queryByRole('checkbox')).toBeNull()
    })
  })

  describe('deleting a vote’s census', () => {
    const own = (id: string, status: string, published = true) => {
      state.meta = { vg_owned: { processId: id, kind: 'copy', createdAt: past } }
      state.members.owned = [person(1)]
      state.groups.push(group('owned', 'Census of Junta'))
      state.process = vote(id, 'Junta', { groupId: 'owned', size: 1, twoFaFields: ['email'] }, status, published)
    }
    const deletes = () =>
      state.fetch.mock.calls.filter(([url, options]) => options?.method === 'DELETE' && url.endsWith('/groups/owned'))

    it('deletes a draft’s census after one confirmation', async () => {
      const user = userEvent.setup()
      own('p4', 'READY', false)
      renderDetail({ kind: 'vote', processId: 'p4' })

      await user.click(await screen.findByRole('button', { name: 'More actions' }))
      await user.click(await screen.findByRole('menuitem', { name: /Delete census/ }))
      const dialog = await screen.findByRole('dialog')
      expect(
        within(dialog).getByText('The draft stays. Before you publish it, choose who can vote again.')
      ).toBeInTheDocument()
      await user.click(within(dialog).getByRole('button', { name: 'Delete census' }))

      await waitFor(() => expect(deletes()).toHaveLength(1))
    })

    it('asks an ended vote to confirm twice, since its record of who could vote goes', async () => {
      const user = userEvent.setup()
      own('p9', 'RESULTS')
      renderDetail({ kind: 'vote', processId: 'p9' })

      await user.click(await screen.findByRole('button', { name: 'More actions' }))
      await user.click(await screen.findByRole('menuitem', { name: /Delete census/ }))
      const dialog = await screen.findByRole('dialog')
      const confirm = within(dialog).getByRole('button', { name: 'Delete census' })
      expect(confirm).toBeDisabled()
      await user.click(
        within(dialog).getByRole('checkbox', {
          name: 'I understand the record of who could vote in this vote will be deleted',
        })
      )
      await user.click(confirm)

      await waitFor(() => expect(deletes()).toHaveLength(1))
    })

    it('keeps the census of a vote that is live', async () => {
      const user = userEvent.setup()
      own('p5', 'ONGOING')
      renderDetail({ kind: 'vote', processId: 'p5' })

      await user.click(await screen.findByRole('button', { name: 'More actions' }))
      const item = await screen.findByRole('menuitem', { name: /Delete census/ })
      expect(item).toHaveAttribute('data-disabled')
      expect(
        screen.getByText("This vote is published and not over yet, so its census can't be deleted.")
      ).toBeInTheDocument()
      expect(deletes()).toHaveLength(0)
    })

    it('offers no delete for a vote that follows Everyone', async () => {
      state.process = vote('p2', 'Assemblea', { groupId: 'everyone', size: 1742 }, 'READY', false)
      renderDetail({ kind: 'vote', processId: 'p2' })

      expect(await screen.findByText('All your members')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'More actions' })).toBeNull()
    })
  })
})

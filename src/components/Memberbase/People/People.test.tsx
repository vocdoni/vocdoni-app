import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { mockUseOrganization, render, screen, waitFor, within } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { People } from './index'
import { columnsStorageKey } from './useColumnVisibility'

const state = vi.hoisted(() => ({
  members: [] as Record<string, string>[],
  total: 0,
  count: 0,
  listArgs: [] as Record<string, unknown>[],
  readiness: { available: false, total: 0, ready: 0, unreachable: 0, isLoading: false },
}))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ bearedFetch: vi.fn().mockResolvedValue({}), currentAddress: '0xorg' }),
}))

vi.mock('~src/queries/members', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~src/queries/members')>()
  return {
    ...actual,
    usePaginatedMembers: (args: Record<string, unknown>) => {
      state.listArgs.push(args)
      return {
        data: {
          members: state.members,
          pagination: {
            totalItems: state.total,
            lastPage: Math.max(1, Math.ceil(state.total / 25)),
            currentPage: 1,
            previousPage: null,
            nextPage: null,
          },
        },
        isLoading: false,
        isError: false,
        isPlaceholderData: false,
        refetch: vi.fn(),
      }
    },
    useMembersCount: () => ({ count: state.count, isLoading: false, known: true }),
    useSignInReadiness: () => state.readiness,
    useImportJobProgress: () => ({ data: undefined, isError: false }),
    useDeleteMembers: () => ({ mutateAsync: vi.fn(), isPending: false }),
  }
})

vi.mock('~src/queries/affectedVotes', () => ({
  useAffectedVotes: () => ({ votes: [], hasActive: false, hasLive: false, isLoading: false }),
}))

vi.mock('~src/queries/groups', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~src/queries/groups')>()
  return {
    ...actual,
    useGroups: () => ({ data: [], isLoading: false }),
    useCreateGroup: () => ({ mutate: vi.fn(), isPending: false }),
    useUpdateGroup: () => ({ mutate: vi.fn(), isPending: false }),
  }
})

const anna = {
  id: 'a1',
  name: 'Anna',
  surname: 'Vila Puig',
  email: 'anna@example.test',
  phone: 'hash-1',
  memberNumber: '0042',
  nationalId: '12345678Z',
  birthDate: '1990-01-01',
}
const jordi = { id: 'j2', name: 'Jordi', surname: 'Serra Mas', email: 'jordi@example.test', memberNumber: '0043' }

const LocationProbe = () => {
  const location = useLocation()
  return <output data-testid='location'>{`${location.pathname}${location.search}`}</output>
}

const renderPeople = (url = '/admin/memberbase/members/1') =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route
          path='/admin/memberbase/members/:page?'
          element={
            <>
              <People />
              <LocationProbe />
            </>
          }
        />
      </Routes>
    </MemoryRouter>
  )

const currentUrl = () => screen.getByTestId('location').textContent ?? ''

describe('People', () => {
  beforeEach(() => {
    state.members = [anna, jordi]
    state.total = 2
    state.count = 2
    state.listArgs = []
    state.readiness = { available: false, total: 0, ready: 0, unreachable: 0, isLoading: false }
    localStorage.clear()
    setReactProvidersMock({
      useOrganization: () => mockUseOrganization({ organization: { address: '0xorg' } }),
    })
  })

  it('lists members in a table with one name link each, phone "On file" and the national ID hidden', () => {
    renderPeople()
    const table = screen.getByRole('table')

    expect(within(table).getByRole('link', { name: 'Anna Vila Puig' })).toBeInTheDocument()
    expect(within(table).getByRole('link', { name: 'Jordi Serra Mas' })).toBeInTheDocument()
    expect(within(table).getByRole('cell', { name: 'On file' })).toBeInTheDocument()
    expect(within(table).queryByRole('columnheader', { name: /National ID/ })).not.toBeInTheDocument()
    expect(within(table).getByText('Members, sorted by First Name, A to Z, page 1 of 1')).toBeInTheDocument()
  })

  it('names the list by surname first when sorted by surname, and sends the sort to the server', () => {
    renderPeople('/admin/memberbase/members/1?sort=surname&order=desc')
    const table = screen.getByRole('table')

    expect(within(table).getByRole('link', { name: 'Vila Puig, Anna' })).toBeInTheDocument()
    expect(state.listArgs.at(-1)).toMatchObject({ sortBy: 'surname', sortOrder: 'desc', page: 1, limit: 25 })
  })

  it('toggles the sort from the column headers and marks it with aria-sort', async () => {
    const user = userEvent.setup()
    renderPeople('/admin/memberbase/members/3')
    const table = screen.getByRole('table')
    const nameHeader = within(table).getByRole('columnheader', { name: /Name/ })
    expect(nameHeader).toHaveAttribute('aria-sort', 'ascending')

    await user.click(within(nameHeader).getByRole('button'))
    expect(currentUrl()).toBe('/admin/memberbase/members/1?sort=name&order=desc')

    await user.click(within(table).getByRole('button', { name: /Email/ }))
    expect(currentUrl()).toBe('/admin/memberbase/members/1?sort=email')
    expect(within(screen.getByRole('table')).getByRole('columnheader', { name: /Email/ })).toHaveAttribute(
      'aria-sort',
      'ascending'
    )
  })

  it('puts the search in the URL, encoded, and goes back to page 1', async () => {
    const user = userEvent.setup()
    renderPeople('/admin/memberbase/members/4?size=50')

    await user.type(screen.getByRole('searchbox', { name: 'Search members' }), 'a+b@x.org')
    await waitFor(() => expect(currentUrl()).toBe('/admin/memberbase/members/1?size=50&q=a%2Bb%40x.org'))
    expect(state.listArgs.at(-1)).toMatchObject({ search: 'a+b@x.org', page: 1, limit: 50 })
  })

  it('searches at once on Enter and keeps the search after a reload', async () => {
    const user = userEvent.setup()
    const { unmount } = renderPeople()

    await user.type(screen.getByRole('searchbox', { name: 'Search members' }), 'serra{Enter}')
    expect(currentUrl()).toBe('/admin/memberbase/members/1?q=serra')
    unmount()

    renderPeople('/admin/memberbase/members/1?q=serra')
    expect(screen.getByRole('searchbox', { name: 'Search members' })).toHaveValue('serra')
  })

  it('remembers the columns per organization', async () => {
    const user = userEvent.setup()
    const { unmount } = renderPeople()

    await user.click(screen.getByRole('button', { name: 'Columns' }))
    await user.click(await screen.findByRole('checkbox', { name: 'National ID' }))
    expect(JSON.parse(localStorage.getItem(columnsStorageKey('0xorg')) ?? '[]')).toContain('nationalId')
    unmount()

    const second = renderPeople()
    const table = screen.getByRole('table')
    expect(within(table).getByRole('columnheader', { name: 'National ID' })).toBeInTheDocument()
    // Masked: only the last 3 characters are shown
    expect(within(table).getByText('National ID ending in 78Z')).toBeInTheDocument()
    second.unmount()

    setReactProvidersMock({
      useOrganization: () => mockUseOrganization({ organization: { address: '0xother' } }),
    })
    renderPeople()
    expect(within(screen.getByRole('table')).queryByRole('columnheader', { name: 'National ID' })).toBeNull()
  })

  it('keeps every member value out of session replays, in the table and the cards', () => {
    renderPeople()
    const table = screen.getByRole('table')
    for (const value of ['Anna Vila Puig', 'anna@example.test', '0042', 'On file']) {
      expect(within(table).getAllByText(value)[0].closest('.ph-no-capture')).not.toBeNull()
    }
    const cards = screen.getByRole('list', { name: 'Members' })
    expect(within(cards).getByText('Anna Vila Puig').closest('.ph-no-capture')).not.toBeNull()
    expect(
      within(cards)
        .getByText(/anna@example.test/)
        .closest('.ph-no-capture')
    ).not.toBeNull()
    // Field names are not member data
    expect(within(table).getByRole('columnheader', { name: /Email/ }).closest('.ph-no-capture')).toBeNull()
  })

  it('renders cards for phones that show checkboxes only in select mode', async () => {
    const user = userEvent.setup()
    renderPeople()
    const cards = screen.getByRole('list', { name: 'Members' })

    expect(within(cards).getAllByRole('listitem')).toHaveLength(2)
    expect(within(cards).queryByRole('checkbox')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Select' }))
    expect(within(cards).getByRole('checkbox', { name: 'Select Anna Vila Puig' })).toBeInTheDocument()
  })

  it('selects with labelled checkboxes, shows the page message, and a row menu never clears the selection', async () => {
    const user = userEvent.setup()
    renderPeople()
    const table = screen.getByRole('table')

    await user.click(within(table).getByRole('checkbox', { name: 'Select Anna Vila Puig' }))
    expect(screen.getByText('1 selected')).toBeInTheDocument()
    expect(screen.getByText('1 of 2 on this page selected')).toBeInTheDocument()
    expect(within(table).getByRole('checkbox', { name: 'Select everyone on this page' })).toBePartiallyChecked()

    await user.click(within(table).getByRole('button', { name: 'Actions for Jordi Serra Mas' }))
    await user.click(await screen.findByRole('menuitem', { name: 'Add to Group' }))
    expect(screen.getByText('1 selected')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Add 1 member' })).toBeInTheDocument()
  })

  it('selects the whole page from the header checkbox', async () => {
    const user = userEvent.setup()
    renderPeople()

    await user.click(within(screen.getByRole('table')).getByRole('checkbox', { name: 'Select everyone on this page' }))
    expect(screen.getByText('2 selected')).toBeInTheDocument()
    expect(screen.getByText('All 2 on this page selected')).toBeInTheDocument()
  })

  it('opens a member from their name', async () => {
    const user = userEvent.setup()
    state.total = 30
    renderPeople('/admin/memberbase/members/2?q=vila')

    await user.click(within(screen.getByRole('table')).getByRole('link', { name: 'Anna Vila Puig' }))
    expect(currentUrl()).toBe('/admin/memberbase/members/2?q=vila&member=a1')
  })

  it('offers to clear a search that finds nobody', async () => {
    const user = userEvent.setup()
    state.members = []
    state.total = 0
    renderPeople('/admin/memberbase/members/1?q=zzz')

    expect(screen.getAllByText('Nobody matches your search')[0]).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: 'Clear search' })[0])
    expect(currentUrl()).toBe('/admin/memberbase/members/1')
  })

  it("opens the drawer from ?member= with the person's details, and closing it drops the param", async () => {
    const user = userEvent.setup()
    renderPeople('/admin/memberbase/members/1?member=a1')

    const drawer = await screen.findByRole('dialog')
    expect(within(drawer).getByText('Anna Vila Puig')).toBeInTheDocument()
    expect(within(drawer).getByText('No. 0042')).toBeInTheDocument()
    expect(within(drawer).getByText('On file')).toBeInTheDocument()
    expect(within(drawer).getByText('National ID ending in 78Z')).toBeInTheDocument()
    expect(within(drawer).getByText('anna@example.test').closest('.ph-no-capture')).not.toBeNull()

    await user.click(within(drawer).getByRole('button', { name: 'Edit' }))
    expect(within(drawer).getByRole('textbox', { name: 'Email' })).toHaveValue('anna@example.test')

    await user.click(within(drawer).getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(currentUrl()).toBe('/admin/memberbase/members/1'))
  })

  it('says how many can get a voting code, with a labelled warning for the rest', () => {
    state.readiness = { available: true, total: 1742, ready: 1719, unreachable: 23, isLoading: false }
    renderPeople()

    expect(screen.getByText('1,719 of 1,742 can get a voting code')).toBeInTheDocument()
    expect(screen.getByText('23 have no email or mobile')).toBeInTheDocument()
    expect(screen.getByText('Warning:')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Show them/ })).toBeInTheDocument()
  })

  it('swaps readiness for the page message while rows are selected', async () => {
    const user = userEvent.setup()
    state.readiness = { available: true, total: 2, ready: 2, unreachable: 0, isLoading: false }
    renderPeople()

    expect(screen.getByText('All 2 can get a voting code')).toBeInTheDocument()
    await user.click(within(screen.getByRole('table')).getByRole('checkbox', { name: 'Select Anna Vila Puig' }))
    expect(screen.queryByText('All 2 can get a voting code')).toBeNull()
  })
})

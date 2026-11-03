import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen, TestMemoryRouter, waitFor, within } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { TableProvider } from '../TableProvider'
import MembersTable from './index'

const outletContext = vi.hoisted(() => ({ debouncedSearch: '' }))

// MembersTable mounts filters, drawers and the delete modal that hit member/group
// queries on render; stub them so the test stays focused on the breakpoint swap.
vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ bearedFetch: vi.fn().mockResolvedValue(undefined) }),
}))

vi.mock('~src/queries/members', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~src/queries/members')>()
  return {
    ...actual,
    usePaginatedMembers: () => ({ data: { members: [], pagination: {} }, isLoading: false, isFetching: false }),
    useDeleteMembers: () => ({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false }),
  }
})

// The page buttons read react-components' own pagination context, which the shared provider
// mocks don't feed; the range summary under test only needs `useRoutedPagination`.
vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return { ...actual, ...getReactProvidersMock(), RoutedPagination: () => null }
})

vi.mock('~src/queries/groups', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~src/queries/groups')>()
  return {
    ...actual,
    useGroups: () => ({ data: [], isLoading: false, isFetched: true, error: null }),
    useCreateGroup: () => ({ mutate: vi.fn(), isPending: false }),
    useUpdateGroup: () => ({ mutate: vi.fn(), isPending: false }),
  }
})

// The import UI and add-member manager are orthogonal to the list layout.
vi.mock('./Import', () => ({
  ImportMembers: () => null,
  ImportProgress: () => null,
}))
vi.mock('./Manager', () => ({
  MemberManager: () => null,
}))

const navigateMock = vi.hoisted(() => vi.fn())

const originalMatchMedia = window.matchMedia

// jsdom has no layout: this decides whether useBreakpointValue resolves the desktop table or the
// mobile cards. The global stub matches nothing, which is the mobile layout.
const setDesktop = (matches: boolean) =>
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    }),
  })

afterEach(() => {
  Object.defineProperty(window, 'matchMedia', { writable: true, value: originalMatchMedia })
})

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useOutletContext: () => ({
      search: '',
      setSearch: vi.fn(),
      submitSearch: vi.fn(),
      debouncedSearch: outletContext.debouncedSearch,
      jobId: null,
      setJobId: vi.fn(),
    }),
  }
})

const members = [
  { id: '1', name: 'Ada', surname: 'Lovelace', email: 'ada@example.test', phone: '600000000' },
  { id: '2', name: 'Alan', surname: 'Turing', email: 'alan@example.test', phone: '600000001' },
] as any

const columns = [
  { id: 'name', label: 'First Name', visible: true },
  { id: 'surname', label: 'Last Name', visible: true },
  { id: 'email', label: 'Email', visible: true },
  { id: 'phone', label: 'Phone', visible: true },
  { id: 'memberNumber', label: 'Member Number', visible: true },
  { id: 'weight', label: 'Voting power (Weight)', visible: true },
]

type TableState = { isFetching?: boolean; isPlaceholderData?: boolean }

const hideColumn = (id: string) => columns.map((column) => (column.id === id ? { ...column, visible: false } : column))

const renderMembers = (
  url = '/admin/memberbase/members/1',
  state: TableState = {},
  rows: any[] = members,
  tableColumns = columns
) =>
  render(
    <TestMemoryRouter initialEntries={[url]}>
      <TableProvider data={rows} initialColumns={tableColumns} {...state}>
        <MembersTable />
      </TableProvider>
    </TestMemoryRouter>
  )

describe('MembersTable layout', () => {
  // The global matchMedia stub matches nothing, so useBreakpointValue resolves the `base`
  // value and the list renders stacked member cards instead of the desktop table.
  it('renders stacked member cards without a table on mobile', () => {
    renderMembers()

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    // The mobile header exposes a labelled select-all checkbox (the desktop header does not).
    expect(screen.getByText('Select all')).toBeInTheDocument()
    // Cards show the member alias (name + surname combined).
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('Alan Turing')).toBeInTheDocument()
  })

  it('renders the table with column headers on desktop widths', () => {
    setDesktop(true)
    renderMembers()

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'First Name' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Email' })).toBeInTheDocument()
    // The labelled "Select all" checkbox is specific to the mobile header.
    expect(screen.queryByText('Select all')).not.toBeInTheDocument()
  })
})

// Session replay must never record memberbase PII: rrweb skips any subtree
// carrying `ph-no-capture`, so every element rendering a member field has to sit
// inside one. See docs/analytics.md.
describe('MembersTable session replay exclusion', () => {
  it('keeps member cards out of replays on mobile', () => {
    renderMembers()

    expect(screen.getByText('Ada Lovelace').closest('.ph-no-capture')).not.toBeNull()
    expect(screen.getByText('ada@example.test', { exact: false }).closest('.ph-no-capture')).not.toBeNull()
  })

  it('keeps member table cells out of replays on desktop', () => {
    setDesktop(true)
    renderMembers()

    for (const value of ['Ada', 'Lovelace', 'ada@example.test', 'Alan', 'Turing', 'alan@example.test']) {
      expect(screen.getByRole('cell', { name: value }).closest('.ph-no-capture')).not.toBeNull()
    }
    // Column headers are field names, not member data — they stay visible.
    expect(screen.getByRole('columnheader', { name: 'Email' }).closest('.ph-no-capture')).toBeNull()
  })
})

describe('MembersTable range summary', () => {
  const mockPagination = (page: number, totalItems: number) =>
    setReactProvidersMock({
      useRoutedPagination: () => ({ page, pagination: { lastPage: Math.ceil(totalItems / 10), totalItems } }),
    })

  const renderWithRouter = (url: string, state: TableState = {}) =>
    render(
      <TableProvider data={members} initialColumns={columns} {...state}>
        <MembersTable />
      </TableProvider>,
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
        ),
      }
    )

  afterEach(() => {
    outletContext.debouncedSearch = ''
  })

  it('shows the rows on screen out of the whole memberbase, locale formatted', () => {
    mockPagination(1, 1234)
    renderWithRouter('/admin/memberbase/members/1')

    expect(screen.getByText('Showing 1–2 of 1,234 members')).toBeInTheDocument()
  })

  it('offsets the range by the current page and rows per page', () => {
    mockPagination(3, 42)
    renderWithRouter('/admin/memberbase/members/3?limit=20')

    expect(screen.getByText('Showing 41–42 of 42 members')).toBeInTheDocument()
  })

  it('counts search results instead of members while searching', () => {
    outletContext.debouncedSearch = 'a'
    mockPagination(1, 2)
    renderWithRouter('/admin/memberbase/members/1')

    expect(screen.getByText('Showing 1–2 of 2 results')).toBeInTheDocument()
    expect(screen.queryByText(/of 2 members/)).not.toBeInTheDocument()
  })

  it('shows no range while the rows on screen are the previous page', () => {
    mockPagination(2, 43)
    renderWithRouter('/admin/memberbase/members/2', { isFetching: true, isPlaceholderData: true })

    expect(screen.queryByText(/^Showing/)).not.toBeInTheDocument()
  })
})

describe('MembersTable manage columns', () => {
  it('does not offer the password column, which the API never returns', async () => {
    const user = userEvent.setup()
    render(
      <TestMemoryRouter initialEntries={['/admin/memberbase/members/1']}>
        <TableProvider
          data={members}
          initialColumns={[...columns, { id: 'password', label: 'Password', visible: false }]}
        >
          <MembersTable />
        </TableProvider>
      </TestMemoryRouter>
    )

    await user.click(screen.getByRole('button', { name: 'Manage Columns' }))

    expect(await screen.findByRole('checkbox', { name: /Toggle column Email/ })).toBeInTheDocument()
    expect(screen.queryByText('Password')).not.toBeInTheDocument()
  })
})

describe('MembersTable column sorting', () => {
  beforeEach(() => {
    navigateMock.mockClear()
    setDesktop(true)
  })

  const sortButton = (label: string) => screen.queryByRole('button', { name: label })

  it('only makes first name, last name, email and member number sortable', () => {
    renderMembers()

    for (const label of ['First Name', 'Last Name', 'Email', 'Member Number']) {
      expect(sortButton(label)).toBeInTheDocument()
    }
    for (const label of ['Phone', 'Voting power (Weight)']) {
      expect(screen.getByRole('columnheader', { name: label })).toBeInTheDocument()
      expect(sortButton(label)).not.toBeInTheDocument()
    }
  })

  it('shows first name ascending as the active sort when the URL has none', () => {
    renderMembers()

    expect(screen.getByRole('columnheader', { name: 'First Name' })).toHaveAttribute('aria-sort', 'ascending')
    for (const label of ['Last Name', 'Email', 'Member Number']) {
      expect(screen.getByRole('columnheader', { name: label })).not.toHaveAttribute('aria-sort')
    }
  })

  it('makes the default first name sort descending on click, then clears it', () => {
    const { unmount } = renderMembers('/admin/memberbase/members/1')

    fireEvent.click(sortButton('First Name'))
    expect(navigateMock).toHaveBeenLastCalledWith('/admin/memberbase/members/1?sortBy=name&sortOrder=desc')
    unmount()

    renderMembers('/admin/memberbase/members/1?sortBy=name&sortOrder=desc')
    fireEvent.click(sortButton('First Name'))
    expect(navigateMock).toHaveBeenLastCalledWith('/admin/memberbase/members/1')
  })

  it('sorts another column ascending from the default, back on page 1 and keeping other params', () => {
    renderMembers('/admin/memberbase/members/3?limit=20')

    fireEvent.click(sortButton('Last Name'))

    expect(navigateMock).toHaveBeenCalledWith('/admin/memberbase/members/1?limit=20&sortBy=surname&sortOrder=asc')
  })

  it('marks the active column and cycles it asc -> desc -> unsorted', () => {
    const { unmount } = renderMembers('/admin/memberbase/members/2?sortBy=email&sortOrder=asc')

    expect(screen.getByRole('columnheader', { name: 'Email' })).toHaveAttribute('aria-sort', 'ascending')
    fireEvent.click(sortButton('Email'))
    expect(navigateMock).toHaveBeenLastCalledWith('/admin/memberbase/members/1?sortBy=email&sortOrder=desc')
    unmount()

    renderMembers('/admin/memberbase/members/2?limit=30&sortBy=email&sortOrder=desc')
    expect(screen.getByRole('columnheader', { name: 'Email' })).toHaveAttribute('aria-sort', 'descending')
    fireEvent.click(sortButton('Email'))
    expect(navigateMock).toHaveBeenLastCalledWith('/admin/memberbase/members/1?limit=30')
  })

  it('keeps the current rows in place, marked busy and locked, while a new sort loads', () => {
    renderMembers('/admin/memberbase/members/1?sortBy=name&sortOrder=asc', {
      isFetching: true,
      isPlaceholderData: true,
    })

    // The rows stay in place: no spinner row pushes the table around, only the rows are marked busy.
    expect(document.querySelector('.chakra-spinner')).toBeNull()
    const rowsBody = screen.getByRole('cell', { name: 'Ada' }).closest('tbody')
    expect(rowsBody).toHaveAttribute('aria-busy', 'true')
    expect(rowsBody).toHaveAttribute('inert')
  })

  it('switches to another column ascending (single-column sort)', () => {
    renderMembers('/admin/memberbase/members/1?sortBy=name&sortOrder=desc')

    fireEvent.click(sortButton('Member Number'))

    expect(navigateMock).toHaveBeenCalledWith('/admin/memberbase/members/1?sortBy=memberNumber&sortOrder=asc')
  })
})

describe('MembersTable sort indicator', () => {
  beforeEach(() => {
    navigateMock.mockClear()
  })

  it('stays hidden while the sorted column header is on screen', () => {
    setDesktop(true)
    renderMembers('/admin/memberbase/members/1?sortBy=email&sortOrder=desc')

    expect(screen.queryByText(/^Sorted by/)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Clear sort' })).not.toBeInTheDocument()
  })

  it('stays hidden for the default sort, which the URL does not carry', () => {
    setDesktop(false)
    renderMembers('/admin/memberbase/members/1')

    expect(screen.queryByText(/^Sorted by/)).not.toBeInTheDocument()
  })

  it('shows the sort on mobile, where no sort headers exist, and clears it', async () => {
    setDesktop(false)
    const user = userEvent.setup()
    renderMembers('/admin/memberbase/members/2?limit=20&sortBy=name&sortOrder=asc')

    expect(screen.getByText('Sorted by First Name, ascending')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear sort' }))

    expect(navigateMock).toHaveBeenCalledWith('/admin/memberbase/members/1?limit=20')
  })

  it('shows the sort when its column is hidden on desktop, with the descending wording', async () => {
    setDesktop(true)
    const user = userEvent.setup()
    renderMembers('/admin/memberbase/members/1?sortBy=email&sortOrder=desc', {}, members, hideColumn('email'))

    expect(screen.getByText('Sorted by Email, descending')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear sort' }))

    expect(navigateMock).toHaveBeenCalledWith('/admin/memberbase/members/1')
  })
})

describe('MembersTable loading', () => {
  it('shows the spinner instead of a blank table while the first rows load', () => {
    setDesktop(true)
    renderMembers('/admin/memberbase/members/1', { isFetching: true }, [])

    expect(document.querySelector('.chakra-spinner')).not.toBeNull()
    expect(screen.queryByText('No members found')).not.toBeInTheDocument()
  })

  it('shows the spinner on mobile too', () => {
    setDesktop(false)
    renderMembers('/admin/memberbase/members/1', { isFetching: true }, [])

    expect(document.querySelector('.chakra-spinner')).not.toBeNull()
  })

  it('shows the empty message once nothing is fetching', () => {
    setDesktop(true)
    renderMembers('/admin/memberbase/members/1', {}, [])

    expect(document.querySelector('.chakra-spinner')).toBeNull()
    expect(screen.getByText('No members found')).toBeInTheDocument()
  })
})

describe('MembersTable deleting', () => {
  it('goes back to page 1 keeping the page size and sort', async () => {
    setDesktop(true)
    navigateMock.mockClear()
    const user = userEvent.setup()
    renderMembers('/admin/memberbase/members/3?limit=20&sortBy=email&sortOrder=desc')

    await user.click(screen.getAllByRole('button', { name: 'Actions' })[0])
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }))
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith('/admin/memberbase/members/1?limit=20&sortBy=email&sortOrder=desc')
    )
  })
})

// Placeholder rows are the previous page or sort, kept on screen while the requested one loads.
// Selecting or acting on them would target members the user is no longer looking at.
describe('MembersTable placeholder rows', () => {
  const placeholder = { isFetching: true, isPlaceholderData: true }

  const expectRowsLocked = (locked: boolean) => {
    const [selectAll, ...rowCheckboxes] = screen.getAllByRole('checkbox')
    const actions = screen.getAllByRole('button', { name: 'Actions' })
    expect(rowCheckboxes).toHaveLength(members.length)
    expect(actions).toHaveLength(members.length)
    // Row controls sit in a container that is inert while locked, so they can't be focused or clicked.
    for (const control of [...rowCheckboxes, ...actions]) {
      expect(control.closest('[inert]') !== null).toBe(locked)
    }
    // The select-all headers sit outside that container, so they are disabled instead.
    if (locked) expect(selectAll).toBeDisabled()
    else expect(selectAll).toBeEnabled()
  }

  it('locks selection and row actions in the table while the requested rows load', () => {
    setDesktop(true)
    renderMembers('/admin/memberbase/members/2', placeholder)

    expectRowsLocked(true)
  })

  it('locks selection and row actions in the mobile cards too', () => {
    setDesktop(false)
    renderMembers('/admin/memberbase/members/2', placeholder)

    expectRowsLocked(true)
  })

  it('locks the rows while a refetch replaces them, not only for placeholder data', () => {
    setDesktop(true)
    renderMembers('/admin/memberbase/members/2', { isFetching: true })

    expectRowsLocked(true)
    expect(screen.getByRole('cell', { name: 'Ada' }).closest('tbody')).toHaveAttribute('aria-busy', 'true')
  })

  it('frees them again once the rows are the requested ones', () => {
    setDesktop(true)
    renderMembers('/admin/memberbase/members/2')

    expectRowsLocked(false)
    expect(screen.getByRole('cell', { name: 'Ada' }).closest('tbody')).not.toHaveAttribute('aria-busy')
  })
})

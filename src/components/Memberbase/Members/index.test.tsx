import { render, screen } from '~src/test-utils'
import { TableProvider } from '../TableProvider'
import MembersTable from './index'

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

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useOutletContext: () => ({
      search: '',
      setSearch: vi.fn(),
      submitSearch: vi.fn(),
      debouncedSearch: '',
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
]

const renderMembers = () =>
  render(
    <TableProvider data={members} initialColumns={columns}>
      <MembersTable />
    </TableProvider>
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
    // Pretend every media query matches (jsdom has no layout), so useBreakpointValue resolves
    // the `md` value and the table branch renders instead of the mobile cards.
    const original = window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }),
    })

    try {
      renderMembers()

      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'First Name' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'Email' })).toBeInTheDocument()
      // The labelled "Select all" checkbox is specific to the mobile header.
      expect(screen.queryByText('Select all')).not.toBeInTheDocument()
    } finally {
      Object.defineProperty(window, 'matchMedia', { writable: true, value: original })
    }
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
    const original = window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }),
    })

    try {
      renderMembers()

      for (const value of ['Ada', 'Lovelace', 'ada@example.test', 'Alan', 'Turing', 'alan@example.test']) {
        expect(screen.getByRole('cell', { name: value }).closest('.ph-no-capture')).not.toBeNull()
      }
      // Column headers are field names, not member data — they stay visible.
      expect(screen.getByRole('columnheader', { name: 'Email' }).closest('.ph-no-capture')).toBeNull()
    } finally {
      Object.defineProperty(window, 'matchMedia', { writable: true, value: original })
    }
  })
})

import { MemoryRouter } from 'react-router'
import { render } from '~src/test-utils'
import Members, { useMemberColumns } from './members'

const table = vi.hoisted(() => ({ columns: [] as { id: string }[] }))

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useOutletContext: () => ({ debouncedSearch: '' }),
}))

vi.mock('~src/queries/members', () => ({
  usePaginatedMembers: () => ({ data: undefined, isLoading: false, isFetching: false, error: null }),
}))

vi.mock('~components/Memberbase/TableProvider', () => ({
  TableProvider: ({ initialColumns, children }: { initialColumns: { id: string }[]; children: React.ReactNode }) => {
    table.columns = initialColumns
    return <>{children}</>
  },
}))

vi.mock('~components/Memberbase/Members', () => ({ default: () => null }))

describe('members table columns', () => {
  it('does not offer the password, which the API never returns', () => {
    render(
      <MemoryRouter>
        <Members />
      </MemoryRouter>
    )

    expect(table.columns.length).toBeGreaterThan(0)
    expect(table.columns.map((column) => column.id)).not.toContain('password')
  })

  it('keeps the password in the shared column list used by the member form', () => {
    let ids: string[] = []
    const Probe = () => {
      ids = useMemberColumns().map((column) => column.id)
      return null
    }
    render(<Probe />)

    expect(ids).toContain('password')
  })
})

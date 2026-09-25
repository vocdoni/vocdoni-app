import { MemoryRouter } from 'react-router'
import { render, screen } from '~src/test-utils'
import { MemberbaseTabs } from './index'

const membersQuery = vi.hoisted(() => ({ data: undefined as unknown }))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ currentAddress: '0xabc' }),
}))

vi.mock('~src/queries/members', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~src/queries/members')>()
  return {
    ...actual,
    usePaginatedMembers: () => ({ data: membersQuery.data }),
  }
})

const renderTabs = () =>
  render(
    <MemoryRouter initialEntries={['/admin/memberbase/members/1']}>
      <MemberbaseTabs />
    </MemoryRouter>
  )

// The Chakra tabs settle their own state right after mounting; querying with findBy*
// waits inside act() for that, instead of asserting before it and leaking the update.
describe('MemberbaseTabs member count', () => {
  afterEach(() => {
    membersQuery.data = undefined
  })

  it('shows the exact, locale formatted memberbase size on the Members tab', async () => {
    membersQuery.data = { members: [], pagination: { totalItems: 1234, lastPage: 124, currentPage: 1 } }
    renderTabs()

    expect(await screen.findByRole('tab', { name: /Members/ })).toHaveTextContent('Members1,234')
  })

  it('shows an empty memberbase as zero', async () => {
    membersQuery.data = { members: [], pagination: { totalItems: 0, lastPage: 1, currentPage: 1 } }
    renderTabs()

    expect(await screen.findByRole('tab', { name: /Members/ })).toHaveTextContent('Members0')
  })

  it('shows no count until the total is known', async () => {
    renderTabs()

    expect(await screen.findByRole('tab', { name: /Members/ })).toHaveTextContent(/^Members$/)
  })
})

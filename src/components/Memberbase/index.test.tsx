import { MemoryRouter } from 'react-router'
import { render, screen } from '~src/test-utils'
import { MemberbaseTabs } from './index'

const membersCount = vi.hoisted(() => ({ value: undefined as number | undefined }))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ currentAddress: '0xabc' }),
}))

vi.mock('~src/queries/members', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~src/queries/members')>()
  return {
    ...actual,
    useMembersCount: () => ({
      count: membersCount.value ?? 0,
      isLoading: membersCount.value === undefined,
      known: membersCount.value !== undefined,
    }),
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
    membersCount.value = undefined
  })

  it('shows the exact, locale formatted memberbase size on the Members tab', async () => {
    membersCount.value = 1234
    renderTabs()

    expect(await screen.findByRole('tab', { name: /Members/ })).toHaveTextContent('Members1,234')
  })

  it('shows an empty memberbase as zero', async () => {
    membersCount.value = 0
    renderTabs()

    expect(await screen.findByRole('tab', { name: /Members/ })).toHaveTextContent('Members0')
  })

  it('shows no count until the total is known', async () => {
    renderTabs()

    expect(await screen.findByRole('tab', { name: /Members/ })).toHaveTextContent(/^Members$/)
  })
})

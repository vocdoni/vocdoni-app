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

// The header's import drawer and add-person sheet aren't under test here
vi.mock('./Members/Import', () => ({ ImportMembers: () => <button data-testid='members-import-open'>Import</button> }))
vi.mock('./People/AddPersonSheet', () => ({ AddPersonSheet: () => null }))

const renderTabs = () =>
  render(
    <MemoryRouter initialEntries={['/admin/memberbase/members/1']}>
      <MemberbaseTabs />
    </MemoryRouter>
  )

// The Chakra tabs settle their own state right after mounting; querying with findBy*
// waits inside act() for that, instead of asserting before it and leaking the update.
describe('MemberbaseTabs', () => {
  afterEach(() => {
    membersCount.value = undefined
  })

  it('shows the section header with its two actions', async () => {
    renderTabs()

    expect(await screen.findByRole('heading', { level: 1, name: 'Members' })).toBeInTheDocument()
    expect(await screen.findByTestId('members-import-open')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Add person' })).toBeInTheDocument()
  })

  it('shows the exact, locale formatted member count on the People tab', async () => {
    membersCount.value = 1234
    renderTabs()

    expect(await screen.findByRole('tab', { name: /People/ })).toHaveTextContent('People1,234')
  })

  it('hides the count when there are no members', async () => {
    membersCount.value = 0
    renderTabs()

    expect(await screen.findByRole('tab', { name: /People/ })).toHaveTextContent(/^People$/)
  })

  it('shows no count until the total is known', async () => {
    renderTabs()

    expect(await screen.findByRole('tab', { name: /People/ })).toHaveTextContent(/^People$/)
  })
})

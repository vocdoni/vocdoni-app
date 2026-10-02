import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
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

const censuses = vi.hoisted(() => ({ total: 0, isLoading: true }))

vi.mock('./Censuses/useCensusIndex', () => ({
  useCensusIndex: () => ({ index: { total: censuses.total }, isLoading: censuses.isLoading }),
}))

// The header's add-person sheet isn't under test here
vi.mock('./People/AddPersonSheet', () => ({ AddPersonSheet: () => null }))

const renderTabs = () =>
  render(
    <MemoryRouter initialEntries={['/admin/memberbase/members/1']}>
      <Routes>
        <Route path='/admin/memberbase/members/:page' element={<MemberbaseTabs />} />
        <Route path='/admin/memberbase/import' element={<h1>Import page</h1>} />
      </Routes>
    </MemoryRouter>
  )

// The Chakra tabs settle their own state right after mounting; querying with findBy*
// waits inside act() for that, instead of asserting before it and leaking the update.
describe('MemberbaseTabs', () => {
  afterEach(() => {
    membersCount.value = undefined
    censuses.isLoading = true
  })

  it('counts saved censuses and votes on the Censuses tab', () => {
    censuses.total = 7
    censuses.isLoading = false
    renderTabs()

    expect(screen.getByRole('tab', { name: /Censuses/ })).toHaveTextContent('Censuses7')
  })

  it('shows the section header with its two actions', async () => {
    renderTabs()

    expect(await screen.findByRole('heading', { level: 1, name: 'Members' })).toBeInTheDocument()
    expect(await screen.findByTestId('members-import-open')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Add person' })).toBeInTheDocument()
  })

  it('goes to the import page from the Import button', async () => {
    renderTabs()

    await userEvent.click(screen.getByTestId('members-import-open'))

    expect(await screen.findByRole('heading', { name: 'Import page' })).toBeInTheDocument()
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

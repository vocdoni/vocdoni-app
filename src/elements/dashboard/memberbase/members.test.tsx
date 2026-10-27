import { screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { MemberManager } from '~components/Memberbase/Members/Manager'
import { render } from '~src/test-utils'
import Members from './members'

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useOutletContext: () => ({ debouncedSearch: '' }),
}))

vi.mock('~src/queries/members', () => ({
  usePaginatedMembers: () => ({ data: undefined, isLoading: false, isFetching: false, error: null }),
  useAddMembers: () => ({ mutate: vi.fn(), isPending: false }),
  useEditMember: () => ({ mutate: vi.fn(), isPending: false }),
}))

// The table itself is not under test: stand in for it with the member form, which reads its fields
// from the REAL TableProvider the page mounts.
vi.mock('~components/Memberbase/Members', () => ({ default: () => <MemberManager open /> }))

describe('members page', () => {
  it('gives the member form a password input', async () => {
    render(
      <MemoryRouter>
        <Members />
      </MemoryRouter>
    )

    const input = await screen.findByLabelText('Password')
    expect(input).toHaveAttribute('name', 'password')
    expect(input).toHaveAttribute('type', 'password')
  })
})

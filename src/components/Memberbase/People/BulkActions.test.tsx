import userEvent from '@testing-library/user-event'
import { render, screen } from '~src/test-utils'
import { AddToGroupSheet } from './BulkActions'
import type { SelectedMember } from './useSelection'

const mocks = vi.hoisted(() => ({
  groups: [] as { id: string; title: string; membersCount: number; isAutoGroup?: boolean }[],
  updateGroup: vi.fn(),
}))

vi.mock('~src/queries/groups', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/queries/groups')>()),
  useAllGroups: () => ({ data: mocks.groups, isLoading: false }),
  useUpdateGroup: () => ({ mutate: mocks.updateGroup, mutateAsync: mocks.updateGroup, isPending: false }),
}))

const anna = { id: 'a1', name: 'Anna', surname: 'Vila' } as SelectedMember

describe('AddToGroupSheet', () => {
  beforeEach(() => {
    // Seven saved censuses: more than the first page the old picker loaded
    mocks.groups = [
      { id: 'all', title: 'Everyone', membersCount: 9, isAutoGroup: true },
      ...Array.from({ length: 7 }, (_, index) => ({ id: `g${index}`, title: `Census ${index + 1}`, membersCount: 1 })),
    ]
    mocks.updateGroup.mockReset()
  })

  it('offers every saved census, never "Everyone"', async () => {
    const user = userEvent.setup()
    render(<AddToGroupSheet open onOpenChange={vi.fn()} members={[anna]} />)

    await user.click(screen.getByRole('combobox'))
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(
      Array.from({ length: 7 }, (_, index) => `Census ${index + 1}1`)
    )
    expect(screen.queryByRole('option', { name: /Everyone/ })).toBeNull()
  })
})

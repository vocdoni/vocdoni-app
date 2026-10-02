import '@testing-library/jest-dom'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '~src/test-utils'
import { MemberManager } from './Manager'

const editMutate = vi.hoisted(() => vi.fn())

vi.mock('~src/queries/members', () => ({
  useAddMembers: () => ({ mutate: vi.fn(), isPending: false }),
  useEditMember: () => ({ mutate: editMutate, isPending: false }),
}))

vi.mock('../TableProvider', () => ({
  useTable: () => ({
    columns: [
      { id: 'name', label: 'Name' },
      { id: 'surname', label: 'Surname' },
      { id: 'email', label: 'Email' },
      { id: 'phone', label: 'Phone' },
    ],
  }),
}))

const member = {
  id: 'member-1',
  name: 'Ada',
  surname: 'Lovelace',
  email: 'ada@example.com',
  phone: '+34*****001',
}

describe('MemberManager edit', () => {
  beforeEach(() => editMutate.mockClear())

  it('sends only the fields the user changed, an emptied one as an empty string', async () => {
    const user = userEvent.setup()
    render(<MemberManager member={member} open />)

    await user.clear(await screen.findByLabelText('Email'))
    await user.clear(screen.getByLabelText('Name'))
    await user.type(screen.getByLabelText('Name'), 'Augusta')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    // surname and the hidden phone were not touched, so they are left out and kept
    expect(editMutate).toHaveBeenCalledTimes(1)
    expect(editMutate.mock.calls[0][0]).toEqual({ id: 'member-1', name: 'Augusta', email: '' })
  })

  it('sends an emptied phone so the stored one is cleared', async () => {
    const user = userEvent.setup()
    render(<MemberManager member={member} open />)

    const phone = await screen.findByLabelText('Phone')
    await user.type(phone, '123')
    await user.clear(phone)
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(editMutate.mock.calls[0][0]).toEqual({ id: 'member-1', phone: '' })
  })

  it('does not call the API when nothing changed', async () => {
    const user = userEvent.setup()
    render(<MemberManager member={member} open />)

    await user.click(await screen.findByRole('button', { name: 'Save changes' }))

    expect(editMutate).not.toHaveBeenCalled()
  })

  it('keeps what the user typed when the same member is refetched', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<MemberManager member={member} open />)

    await user.type(await screen.findByLabelText('Name'), 'X')
    rerender(<MemberManager member={{ ...member, surname: 'Byron' }} open />)

    expect(screen.getByLabelText('Name')).toHaveValue('AdaX')
  })

  it('discards edits abandoned with Cancel when the drawer is reopened', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<MemberManager member={member} open />)

    await user.type(await screen.findByLabelText('Name'), 'X')
    rerender(<MemberManager member={member} open={false} />)
    rerender(<MemberManager member={member} open />)

    expect(await screen.findByLabelText('Name')).toHaveValue('Ada')
  })

  it('shows fresh data for untouched fields when the member is refetched while open', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<MemberManager member={member} open />)

    await user.type(await screen.findByLabelText('Name'), 'X')
    rerender(<MemberManager member={{ ...member, surname: 'Byron' }} open />)

    expect(screen.getByLabelText('Surname')).toHaveValue('Byron')
  })
})

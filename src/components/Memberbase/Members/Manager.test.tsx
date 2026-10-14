import '@testing-library/jest-dom'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { MemberManager } from './Manager'

const editMutate = vi.hoisted(() => vi.fn())
const addMutate = vi.hoisted(() => vi.fn())

vi.mock('~src/queries/members', () => ({
  useAddMembers: () => ({ mutate: addMutate, isPending: false }),
  useEditMember: () => ({ mutate: editMutate, isPending: false }),
}))

vi.mock('../TableProvider', () => ({
  useTable: () => ({
    columns: [
      { id: 'name', label: 'Name' },
      { id: 'surname', label: 'Surname' },
      { id: 'email', label: 'Email' },
      { id: 'phone', label: 'Phone' },
      { id: 'weight', label: 'Weight' },
      { id: 'password', label: 'Password' },
    ],
  }),
}))

const member = {
  id: 'member-1',
  name: 'Ada',
  surname: 'Lovelace',
  email: 'ada@example.com',
  phone: '+34*****001',
  weight: '5',
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

  it('warns that the stored phone will be removed once the field is emptied', async () => {
    const user = userEvent.setup()
    render(<MemberManager member={member} open />)

    const phone = await screen.findByLabelText('Phone')
    expect(screen.queryByText(/will be removed/)).not.toBeInTheDocument()

    await user.type(phone, '1')
    expect(screen.queryByText(/will be removed/)).not.toBeInTheDocument()

    await user.clear(phone)
    expect(screen.getByText(/will be removed/)).toBeInTheDocument()
  })

  it('does not call the API when nothing changed', async () => {
    const user = userEvent.setup()
    render(<MemberManager member={member} open />)

    await user.click(await screen.findByRole('button', { name: 'Save changes' }))

    expect(editMutate).not.toHaveBeenCalled()
  })

  it('keeps typed values but refreshes untouched fields when the same member is refetched', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<MemberManager member={member} open />)

    await user.type(await screen.findByLabelText('Name'), 'X')
    rerender(<MemberManager member={{ ...member, surname: 'Byron' }} open />)

    expect(screen.getByLabelText('Name')).toHaveValue('AdaX')
    expect(screen.getByLabelText('Surname')).toHaveValue('Byron')
  })

  it('blanks a field the refetched member no longer has', async () => {
    const { rerender } = render(<MemberManager member={member} open />)

    expect(await screen.findByLabelText('Surname')).toHaveValue('Lovelace')
    const { surname: _surname, ...withoutSurname } = member
    rerender(<MemberManager member={withoutSurname} open />)

    expect(screen.getByLabelText('Surname')).toHaveValue('')
  })

  it('discards edits abandoned with Cancel when the drawer is reopened', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<MemberManager member={member} open />)

    await user.type(await screen.findByLabelText('Name'), 'X')
    rerender(<MemberManager member={member} open={false} />)
    rerender(<MemberManager member={member} open />)

    expect(await screen.findByLabelText('Name')).toHaveValue('Ada')
  })

  it('drops the error of an untouched field once a refetch replaces its value', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<MemberManager member={{ ...member, email: 'not-an-email' }} open />)

    await user.type(await screen.findByLabelText('Name'), 'X')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument()

    rerender(<MemberManager member={{ ...member, email: 'ada@example.com' }} open />)

    expect(screen.getByLabelText('Email')).toHaveValue('ada@example.com')
    expect(screen.queryByText(/invalid email/i)).not.toBeInTheDocument()
  })

  it('still sends the phone removal after a refetch of the same member', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<MemberManager member={member} open />)

    const phone = await screen.findByLabelText('Phone')
    await user.type(phone, '1')
    await user.clear(phone)
    rerender(<MemberManager member={{ ...member, surname: 'Byron' }} open />)
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(editMutate.mock.calls[0][0]).toEqual({ id: 'member-1', phone: '' })
  })

  it('stops treating an edit as a change once a refetch brings the same value', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<MemberManager member={member} open />)

    const name = await screen.findByLabelText('Name')
    await user.clear(name)
    await user.type(name, 'Augusta')
    rerender(<MemberManager member={{ ...member, name: 'Augusta' }} open />)
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(editMutate).not.toHaveBeenCalled()
  })
})

describe('MemberManager password', () => {
  // hashMemberPassword(ORG, 's3cret'), the shared test vector
  const ORG = '0x00000000000000000000000000000000000000AA'
  const S3CRET_HASH = '2f7e83a0b19a82fa9a5dc6ecc6ff44ec82679ea87012a7187bd3313366bf277e'
  const withPassword = { ...member, hasPassword: true }

  beforeEach(() => {
    editMutate.mockClear()
    addMutate.mockClear()
    setReactProvidersMock({ useOrganization: () => ({ organization: { address: ORG } }) })
  })

  it('masks the password input and leaves it blank', async () => {
    render(<MemberManager member={withPassword} open />)

    const password = await screen.findByLabelText('Password')
    expect(password).toHaveAttribute('type', 'password')
    expect(password).toHaveValue('')
    expect(screen.getByText(/a password is set/i)).toBeInTheDocument()
  })

  it('sends the hash of a typed password, never the plaintext', async () => {
    const user = userEvent.setup()
    render(<MemberManager member={member} open />)

    await user.type(await screen.findByLabelText('Password'), '  s3cret ')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expect(editMutate).toHaveBeenCalledTimes(1))
    expect(editMutate.mock.calls[0][0]).toEqual({ id: 'member-1', password: S3CRET_HASH })
    expect(JSON.stringify(editMutate.mock.calls)).not.toContain('s3cret')
  })

  it('rejects a typed password that does not meet the requirements, without calling the API', async () => {
    const user = userEvent.setup()
    render(<MemberManager member={member} open />)

    await user.type(await screen.findByLabelText('Password'), 'abc')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByText('Use at least 6 characters, including a letter and a number.')).toBeInTheDocument()
    expect(editMutate).not.toHaveBeenCalled()
  })

  it('sends the hash of a password that meets the requirements', async () => {
    const user = userEvent.setup()
    render(<MemberManager member={member} open />)

    await user.type(await screen.findByLabelText('Password'), 'abc123')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expect(editMutate).toHaveBeenCalledTimes(1))
    expect(editMutate.mock.calls[0][0]).toEqual({ id: 'member-1', password: expect.stringMatching(/^[0-9a-f]{64}$/) })
  })

  it('keeps a stored password the user did not touch', async () => {
    const user = userEvent.setup()
    render(<MemberManager member={withPassword} open />)

    await user.type(await screen.findByLabelText('Name'), 'X')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(editMutate.mock.calls[0][0]).toEqual({ id: 'member-1', name: 'AdaX' })
  })

  it('clears a stored password once the field is emptied, after warning', async () => {
    const user = userEvent.setup()
    render(<MemberManager member={withPassword} open />)

    const password = await screen.findByLabelText('Password')
    await user.type(password, 'x')
    await user.clear(password)
    expect(screen.getByText(/stored password will be removed/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expect(editMutate).toHaveBeenCalledTimes(1))
    expect(editMutate.mock.calls[0][0]).toEqual({ id: 'member-1', password: '' })
  })

  it('hashes the password of a new member', async () => {
    const user = userEvent.setup()
    render(<MemberManager open />)

    await user.type(await screen.findByLabelText('Name'), 'Ada')
    await user.type(screen.getByLabelText('Password'), 's3cret')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expect(addMutate).toHaveBeenCalledTimes(1))
    expect(addMutate.mock.calls[0][0]).toEqual([expect.objectContaining({ name: 'Ada', password: S3CRET_HASH })])
    expect(JSON.stringify(addMutate.mock.calls)).not.toContain('s3cret')
  })
})

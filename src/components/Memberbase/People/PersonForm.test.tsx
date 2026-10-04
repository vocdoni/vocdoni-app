import userEvent from '@testing-library/user-event'
import { render, screen } from '~src/test-utils'
import { changedFields, editPayload, PersonForm } from './PersonForm'
import type { SelectedMember } from './useSelection'

const mocks = vi.hoisted(() => ({ edit: vi.fn(), add: vi.fn(), track: vi.fn() }))

vi.mock('~src/queries/members', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~src/queries/members')>()
  return {
    ...actual,
    useEditMember: () => ({ mutateAsync: mocks.edit, isPending: false }),
    useAddMembers: () => ({ mutateAsync: mocks.add, isPending: false }),
  }
})

vi.mock('~utils/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~utils/analytics')>()
  return { ...actual, trackAnalyticsEvent: mocks.track }
})

const anna = {
  id: 'a1',
  name: 'Anna',
  surname: 'Vila Puig',
  email: 'anna@example.test',
  phone: 'hash-of-the-phone',
  memberNumber: '0042',
  nationalId: '',
  birthDate: '',
  password: '',
} as SelectedMember

const Harness = ({ member, onSaved = vi.fn() }: { member?: SelectedMember; onSaved?: () => void }) => (
  <>
    <PersonForm formId='f' member={member} onSaved={onSaved} inLiveVote />
    <button type='submit' form='f'>
      Save
    </button>
  </>
)

describe('changedFields', () => {
  it('keeps only what changed, skips emptied fields and the untouched phone', () => {
    const values = {
      name: 'Anna',
      surname: 'Vila i Puig',
      email: '',
      phone: '',
      memberNumber: '0042',
      nationalId: '',
      birthDate: '',
      weight: '',
    }
    expect(changedFields(anna, values)).toEqual({ surname: 'Vila i Puig' })
  })
})

describe('editPayload', () => {
  it('keeps the current voting power, which the API would otherwise reset to 1', () => {
    expect(editPayload({ ...anna, weight: '5' }, { surname: 'Vila i Puig' })).toEqual({
      surname: 'Vila i Puig',
      weight: '5',
    })
    expect(editPayload({ ...anna, weight: '5' }, { weight: '3' })).toEqual({ weight: '3' })
    expect(editPayload(anna, { surname: 'Vila i Puig' })).toEqual({ surname: 'Vila i Puig' })
  })
})

describe('PersonForm', () => {
  beforeEach(() => {
    mocks.edit.mockReset().mockResolvedValue(undefined)
    mocks.add.mockReset().mockResolvedValue({ count: 1 })
    mocks.track.mockReset()
  })

  it('starts the phone empty, says one is on file, and sends only the changed fields', async () => {
    const user = userEvent.setup()
    const onSaved = vi.fn()
    render(<Harness member={anna} onSaved={onSaved} />)

    const phone = screen.getByRole('textbox', { name: 'Phone' })
    expect(phone).toHaveValue('')
    expect(
      screen.getByText('A number is saved but hidden for privacy. Type a new one to replace it.')
    ).toBeInTheDocument()

    const email = screen.getByRole('textbox', { name: 'Email' })
    await user.clear(email)
    await user.type(email, 'anna.vila@example.test')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(mocks.edit).toHaveBeenCalledWith({ id: 'a1', email: 'anna.vila@example.test' })
    expect(mocks.track).toHaveBeenCalledWith({ name: 'member_updated', props: { in_live_vote: true } })
    expect(onSaved).toHaveBeenCalled()
  })

  it('sends a phone only when a new one is typed', async () => {
    const user = userEvent.setup()
    render(<Harness member={anna} />)

    await user.type(screen.getByRole('textbox', { name: 'Phone' }), '+34 600 000 000')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(mocks.edit).toHaveBeenCalledWith({ id: 'a1', phone: '+34600000000' })
  })

  it('sends the current voting power with any edit', async () => {
    const user = userEvent.setup()
    render(<Harness member={{ ...anna, weight: '5' }} />)

    await user.type(screen.getByRole('textbox', { name: 'Last Name' }), ' i Serra')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(mocks.edit).toHaveBeenCalledWith({ id: 'a1', surname: 'Vila Puig i Serra', weight: '5' })
  })

  it('saves nothing when nothing changed', async () => {
    const user = userEvent.setup()
    const onSaved = vi.fn()
    render(<Harness member={anna} onSaved={onSaved} />)

    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(mocks.edit).not.toHaveBeenCalled()
    expect(onSaved).toHaveBeenCalled()
  })

  it('rejects a bad email, a short phone and a birth date in the future', async () => {
    const user = userEvent.setup()
    render(<Harness member={anna} />)

    const email = screen.getByRole('textbox', { name: 'Email' })
    await user.clear(email)
    await user.type(email, 'not-an-email')
    await user.type(screen.getByRole('textbox', { name: 'Phone' }), '12345')
    const birth = screen.getByLabelText('Birth Date')
    await user.type(birth, '2999-01-01')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(await screen.findByText('Invalid email address')).toBeInTheDocument()
    expect(screen.getByText('Use the full number with its country code, like +34 600 000 000')).toBeInTheDocument()
    expect(screen.getByText('Birth date cannot be in the future')).toBeInTheDocument()
    expect(mocks.edit).not.toHaveBeenCalled()
  })

  it('needs a name and a way to reach a new person', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.type(screen.getByRole('textbox', { name: 'Member Number' }), '7')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('Add a first name or a last name')).toBeInTheDocument()
    expect(screen.getByText('Add an email or a mobile number, so they can get a voting code')).toBeInTheDocument()
    expect(mocks.add).not.toHaveBeenCalled()

    await user.type(screen.getByRole('textbox', { name: 'Last Name' }), 'Serra')
    await user.type(screen.getByRole('textbox', { name: 'Phone' }), '+34600000001')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(mocks.add).toHaveBeenCalledWith([{ surname: 'Serra', phone: '+34600000001', memberNumber: '7' }])
    expect(mocks.track).toHaveBeenCalledWith({ name: 'member_added', props: { source: 'form' } })
  })
})

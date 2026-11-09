import userEvent from '@testing-library/user-event'
import { ApiErrorCode } from '@vocdoni/api-client'
import { ApiError } from '~components/Auth/api'
import { render, screen } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { changedFields, PersonForm } from './PersonForm'
import type { SelectedMember } from './useSelection'

const mocks = vi.hoisted(() => ({ edit: vi.fn(), add: vi.fn(), track: vi.fn(), buyRoomAction: vi.fn() }))

// The toast action needs the router and the signed-in account, which this test does not set up
vi.mock('~components/Pricing/useBuyRoomAction', () => ({
  useBuyRoomAction: () => mocks.buyRoomAction,
}))

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
  const values = {
    name: 'Anna',
    surname: 'Vila i Puig',
    email: '',
    phone: '',
    memberNumber: '0042',
    nationalId: '',
    birthDate: '',
    weight: '',
    password: '',
  }

  it('keeps only what changed, an emptied field as an empty string, and skips the untouched phone', () => {
    expect(changedFields(anna, values)).toEqual({ surname: 'Vila i Puig', email: '' })
  })

  it('clears the stored phone once its field was emptied on purpose', () => {
    expect(changedFields(anna, values, { phoneEdited: true })).toEqual({ surname: 'Vila i Puig', email: '', phone: '' })
  })
})

// The hash of 's3cret' for this organization: see utils/member-password
const ORG = '0x00000000000000000000000000000000000000AA'
const S3CRET_HASH = '2f7e83a0b19a82fa9a5dc6ecc6ff44ec82679ea87012a7187bd3313366bf277e'

describe('PersonForm', () => {
  beforeEach(() => {
    mocks.edit.mockReset().mockResolvedValue(undefined)
    mocks.add.mockReset().mockResolvedValue({ count: 1 })
    mocks.track.mockReset()
    mocks.buyRoomAction.mockReset().mockReturnValue(undefined)
    setReactProvidersMock({ useOrganization: () => ({ organization: { address: ORG } }) })
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

  it('leaves the voting power out unless it changed, so the API keeps it', async () => {
    const user = userEvent.setup()
    render(<Harness member={{ ...anna, weight: '5' }} />)

    await user.type(screen.getByRole('textbox', { name: 'Last Name' }), ' i Serra')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(mocks.edit).toHaveBeenCalledWith({ id: 'a1', surname: 'Vila Puig i Serra' })
  })

  it('sends an emptied field as an empty string, so the stored value is cleared', async () => {
    const user = userEvent.setup()
    render(<Harness member={anna} />)

    await user.clear(screen.getByRole('textbox', { name: 'Member Number' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(mocks.edit).toHaveBeenCalledWith({ id: 'a1', memberNumber: '' })
  })

  it('warns, then clears the stored phone once its field is emptied', async () => {
    const user = userEvent.setup()
    render(<Harness member={anna} />)

    const phone = screen.getByRole('textbox', { name: 'Phone' })
    await user.type(phone, '6')
    await user.clear(phone)
    expect(screen.getByText('The stored phone number will be removed when you save.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(mocks.edit).toHaveBeenCalledWith({ id: 'a1', phone: '' })
  })

  it('offers Add voter places when the edit is refused for lack of voter places', async () => {
    const user = userEvent.setup()
    const onBuyRoom = vi.fn()
    const refusal = new ApiError(
      {
        error: 'payment required',
        code: ApiErrorCode.PaymentRequired,
        data: { processId: '6650f0c0c0c0c0c0c0c0c0c0', censusSize: 700, dueCents: 2000, totalCents: 31000 },
      },
      new Response(null, { status: 402 })
    )
    mocks.buyRoomAction.mockReturnValue({ label: 'Add voter places', onClick: onBuyRoom })
    mocks.edit.mockRejectedValue(refusal)
    render(<Harness member={anna} />)

    await user.type(screen.getByRole('textbox', { name: 'Last Name' }), ' i Serra')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    await user.click(await screen.findByRole('button', { name: 'Add voter places' }))

    expect(mocks.buyRoomAction).toHaveBeenCalledWith(refusal)
    expect(onBuyRoom).toHaveBeenCalledTimes(1)
  })

  describe('password', () => {
    it('is a masked, blank input that says when one is set', () => {
      render(<Harness member={{ ...anna, hasPassword: true }} />)

      const password = screen.getByLabelText('Password')
      expect(password).toHaveAttribute('type', 'password')
      expect(password).toHaveValue('')
      expect(screen.getByText('A password is set. Type a new one to replace it.')).toBeInTheDocument()
    })

    it('sends the hash of a typed password, never the plaintext', async () => {
      const user = userEvent.setup()
      render(<Harness member={anna} />)

      await user.type(screen.getByLabelText('Password'), '  s3cret ')
      await user.click(screen.getByRole('button', { name: 'Save' }))

      expect(mocks.edit).toHaveBeenCalledWith({ id: 'a1', password: S3CRET_HASH })
      expect(JSON.stringify(mocks.edit.mock.calls)).not.toContain('s3cret')
    })

    it('rejects a password that does not meet the requirements, without calling the API', async () => {
      const user = userEvent.setup()
      render(<Harness member={anna} />)

      await user.type(screen.getByLabelText('Password'), 'abc')
      await user.click(screen.getByRole('button', { name: 'Save' }))

      expect(await screen.findByText('Use at least 6 characters, including a letter and a number.')).toBeInTheDocument()
      expect(mocks.edit).not.toHaveBeenCalled()
    })

    it('keeps a stored password the user did not touch', async () => {
      const user = userEvent.setup()
      render(<Harness member={{ ...anna, hasPassword: true }} />)

      await user.type(screen.getByRole('textbox', { name: 'Last Name' }), ' i Serra')
      await user.click(screen.getByRole('button', { name: 'Save' }))

      expect(mocks.edit).toHaveBeenCalledWith({ id: 'a1', surname: 'Vila Puig i Serra' })
    })

    it('clears a stored password once the field is emptied, after warning', async () => {
      const user = userEvent.setup()
      render(<Harness member={{ ...anna, hasPassword: true }} />)

      const password = screen.getByLabelText('Password')
      await user.type(password, 'x')
      await user.clear(password)
      expect(screen.getByText('The stored password will be removed when you save.')).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Save' }))

      expect(mocks.edit).toHaveBeenCalledWith({ id: 'a1', password: '' })
    })

    it('hashes the password of a new person', async () => {
      const user = userEvent.setup()
      render(<Harness />)

      await user.type(screen.getByRole('textbox', { name: 'First Name' }), 'Ada')
      await user.type(screen.getByRole('textbox', { name: 'Email' }), 'ada@example.test')
      await user.type(screen.getByLabelText('Password'), 's3cret')
      await user.click(screen.getByRole('button', { name: 'Save' }))

      expect(mocks.add).toHaveBeenCalledWith([{ name: 'Ada', email: 'ada@example.test', password: S3CRET_HASH }])
      expect(JSON.stringify(mocks.add.mock.calls)).not.toContain('s3cret')
    })
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

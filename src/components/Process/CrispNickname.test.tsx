import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { cspAuthComponents } from '~theme/react-components/csp'
import { render, screen } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { CrispNicknameObserver } from './CrispNickname'

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@vocdoni/react-components')
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return { ...actual, ...getReactProvidersMock() }
})

const IdentifySlot = cspAuthComponents.CspAuthIdentifyForm!

const auth = { connected: false, challengePending: false, owner: null as string | null }
const setAuth = (next: Partial<typeof auth>) => {
  Object.assign(auth, next)
  setReactProvidersMock({ useElectionAuth: () => ({ ...auth, authToken: null, weight: null }) })
}

// The identify form as CspAuthIdentifyStep binds it, with the name, password and contact fields of a 2FA census.
const IdentifyHarness = () => {
  const { register, handleSubmit } = useForm<Record<string, unknown>>()
  return (
    <IdentifySlot
      fields={[
        { name: 'name', label: 'First Name', type: 'text', required: true, inputProps: register('name') },
        { name: 'password', label: 'Password', type: 'password', required: true, inputProps: register('password') },
        { name: 'contact', label: 'Email', type: 'email', required: true, inputProps: register('contact') },
      ]}
      loading={false}
      submitLabel='Receive Code'
      onSubmit={handleSubmit(vi.fn())}
    />
  )
}

// A census that only asks for the contact, as the identify form renders it.
const ContactOnlyHarness = ({ type }: { type: string }) => {
  const { register, handleSubmit } = useForm<Record<string, unknown>>()
  return (
    <IdentifySlot
      fields={[{ name: 'contact', label: 'Contact', type, required: true, inputProps: register('contact') }]}
      loading={false}
      submitLabel='Receive Code'
      onSubmit={handleSubmit(vi.fn())}
    />
  )
}

const tree = () => (
  <>
    <IdentifyHarness />
    <CrispNicknameObserver />
  </>
)

const submitIdentity = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText('First Name'), ' Ada ')
  await user.type(screen.getByLabelText('Password'), 'hunter2')
  await user.type(screen.getByLabelText('Email'), 'ada@example.com')
  await user.click(screen.getByRole('button', { name: 'Receive Code' }))
}

describe('Crisp nickname', () => {
  let queue: CrispCommand[]

  beforeEach(() => {
    queue = []
    window.$crisp = queue
    setAuth({ connected: false, challengePending: false, owner: null })
  })

  afterEach(() => {
    delete window.$crisp
  })

  it('sets the nickname to the first typed field once the one-time code is sent', async () => {
    const user = userEvent.setup()
    const { rerender } = render(tree(), { appEnv: { CRISP_WEBSITE_ID: 'site-1' } })
    await submitIdentity(user)
    expect(queue).toEqual([])

    setAuth({ challengePending: true, owner: 'owner-1' })
    rerender(tree())

    expect(queue).toEqual([['set', 'user:nickname', ['name Ada']]])
  })

  it('sets the nickname once an auth-only voter connects, and not again when the code step connects', async () => {
    const user = userEvent.setup()
    const { rerender } = render(tree(), { appEnv: { CRISP_WEBSITE_ID: 'site-1' } })
    await submitIdentity(user)

    setAuth({ connected: true, owner: 'owner-1' })
    rerender(tree())
    expect(queue).toHaveLength(1)

    setAuth({ challengePending: false, connected: true })
    rerender(tree())
    expect(queue).toHaveLength(1)
  })

  it('never sends the password', async () => {
    const user = userEvent.setup()
    const { rerender } = render(tree(), { appEnv: { CRISP_WEBSITE_ID: 'site-1' } })
    await submitIdentity(user)

    setAuth({ connected: true, owner: 'owner-1' })
    rerender(tree())

    expect(JSON.stringify(queue)).not.toContain('hunter2')
    expect(queue).toEqual([['set', 'user:nickname', ['name Ada']]])
  })

  it.each([
    ['email', 'ada@example.com', 'email ada@example.com'],
    ['tel', '600123123', 'phone 600123123'],
    ['text', 'ada@example.com', 'email ada@example.com'],
    ['text', '600123123', 'phone 600123123'],
  ])('sets the contact as the nickname for a contact-only %s census (%s)', async (type, contact, expected) => {
    const user = userEvent.setup()
    const contactOnly = () => (
      <>
        <ContactOnlyHarness type={type} />
        <CrispNicknameObserver />
      </>
    )
    const { rerender } = render(contactOnly(), { appEnv: { CRISP_WEBSITE_ID: 'site-1' } })
    await user.type(screen.getByLabelText('Contact'), contact)
    await user.click(screen.getByRole('button', { name: 'Receive Code' }))

    setAuth({ challengePending: true, owner: 'owner-1' })
    rerender(contactOnly())

    expect(queue).toEqual([['set', 'user:nickname', [expected]]])
  })

  it('sets the nickname again when a start-over identifies with another contact on the same owner', async () => {
    const user = userEvent.setup()
    const { rerender } = render(tree(), { appEnv: { CRISP_WEBSITE_ID: 'site-1' } })
    await submitIdentity(user)
    setAuth({ challengePending: true, owner: 'owner-1' })
    rerender(tree())

    // The owner is the voter's stable voterRef, and a start over keeps the challenge pending: nothing in the auth
    // state changes, so the second submit is what has to trigger the push.
    await user.clear(screen.getByLabelText('First Name'))
    await user.type(screen.getByLabelText('First Name'), 'Grace')
    await user.click(screen.getByRole('button', { name: 'Receive Code' }))

    expect(queue).toEqual([
      ['set', 'user:nickname', ['name Ada']],
      ['set', 'user:nickname', ['name Grace']],
    ])

    setAuth({ connected: true })
    rerender(tree())
    expect(queue).toHaveLength(2)
  })

  it('sets the nickname when the voter has no owner, as without a voterRef or Web Crypto', async () => {
    const user = userEvent.setup()
    const { rerender } = render(tree(), { appEnv: { CRISP_WEBSITE_ID: 'site-1' } })
    await submitIdentity(user)

    setAuth({ challengePending: true, owner: null })
    rerender(tree())

    expect(queue).toEqual([['set', 'user:nickname', ['name Ada']]])
  })

  it('does not push without CRISP_WEBSITE_ID', async () => {
    const user = userEvent.setup()
    const { rerender } = render(tree())
    await submitIdentity(user)

    setAuth({ connected: true, owner: 'owner-1' })
    rerender(tree())

    expect(queue).toEqual([])
  })

  it('does not push without a Crisp widget on the page', async () => {
    delete window.$crisp
    const user = userEvent.setup()
    const { rerender } = render(tree(), { appEnv: { CRISP_WEBSITE_ID: 'site-1' } })
    await submitIdentity(user)

    setAuth({ connected: true, owner: 'owner-1' })
    rerender(tree())

    expect(queue).toEqual([])
  })
})

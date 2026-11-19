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

const auth = { connected: false, challengePending: false }
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
    setAuth({ connected: false, challengePending: false })
  })

  afterEach(() => {
    delete window.$crisp
  })

  it('sets the nickname to the first typed field once the one-time code is sent', async () => {
    const user = userEvent.setup()
    const { rerender } = render(tree(), { appEnv: { CRISP_WEBSITE_ID: 'site-1' } })
    await submitIdentity(user)
    expect(queue).toEqual([])

    setAuth({ challengePending: true })
    rerender(tree())

    expect(queue).toEqual([['set', 'user:nickname', ['name Ada']]])
  })

  it('sets the nickname once an auth-only voter connects, and not again when the code step connects', async () => {
    const user = userEvent.setup()
    const { rerender } = render(tree(), { appEnv: { CRISP_WEBSITE_ID: 'site-1' } })
    await submitIdentity(user)

    setAuth({ connected: true })
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

    setAuth({ connected: true })
    rerender(tree())

    expect(JSON.stringify(queue)).not.toContain('hunter2')
    expect(queue).toEqual([['set', 'user:nickname', ['name Ada']]])
  })

  it('does not push without CRISP_WEBSITE_ID', async () => {
    const user = userEvent.setup()
    const { rerender } = render(tree())
    await submitIdentity(user)

    setAuth({ connected: true })
    rerender(tree())

    expect(queue).toEqual([])
  })

  it('does not push without a Crisp widget on the page', async () => {
    delete window.$crisp
    const user = userEvent.setup()
    const { rerender } = render(tree(), { appEnv: { CRISP_WEBSITE_ID: 'site-1' } })
    await submitIdentity(user)

    setAuth({ connected: true })
    rerender(tree())

    expect(queue).toEqual([])
  })
})

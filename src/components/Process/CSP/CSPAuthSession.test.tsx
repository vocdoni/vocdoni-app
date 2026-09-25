import userEvent from '@testing-library/user-event'
import { render, screen, waitFor, within } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { CspAuth, CspAuthSession } from './CSPAuthModal'
import { useCspAuthContext } from './CSPStepsProvider'

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@vocdoni/react-components')
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return { ...actual, ...getReactProvidersMock() }
})

// Step 0 stands in for a successful auth0 that sent an OTP: it only advances the step.
vi.mock('./Step0', () => ({
  Step0Base: () => {
    const { setCurrentStep } = useCspAuthContext()
    return <button onClick={() => setCurrentStep(1)}>send code</button>
  },
}))

vi.mock('./Step1', () => ({
  Step1Base: () => <div>Step 1</div>,
}))

const election = { id: 'p1', census: { authFields: ['memberNumber'], twoFaFields: ['email'] } }

const setConnected = (connected: boolean) =>
  setReactProvidersMock({
    useElection: () => ({ election, connected }),
    useElectionAuth: () => ({ connected, authToken: null, weight: null }),
  })

// Request the OTP from the first Identify button, then close the modal without entering it.
const requestCodeAndClose = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getAllByRole('button', { name: /login/i })[0])
  await user.click(screen.getByRole('button', { name: 'send code' }))
  expect(screen.getByText('Step 1')).toBeInTheDocument()
  await user.keyboard('{Escape}')
  await waitFor(() => expect(screen.queryByText('Step 1')).not.toBeInTheDocument())
}

const TwoButtons = () => (
  <>
    <div data-testid='floating'>
      <CspAuth />
    </div>
    <div data-testid='aside'>
      <CspAuth />
    </div>
  </>
)

describe('CspAuthSession', () => {
  beforeEach(() => setConnected(false))

  it('resumes the pending OTP step from any Identify button on the page', async () => {
    const user = userEvent.setup()

    render(
      <CspAuthSession>
        <TwoButtons />
      </CspAuthSession>
    )

    await requestCodeAndClose(user)

    await user.click(within(screen.getByTestId('aside')).getByRole('button', { name: /login/i }))
    expect(screen.getByText('Step 1')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'send code' })).not.toBeInTheDocument()
  })

  it('starts the next flow from scratch once the voter is connected', async () => {
    const user = userEvent.setup()

    const { rerender } = render(
      <CspAuthSession>
        <TwoButtons />
      </CspAuthSession>
    )

    await requestCodeAndClose(user)

    // auth1 succeeds (connected), then the voter logs out.
    setConnected(true)
    rerender(
      <CspAuthSession>
        <TwoButtons />
      </CspAuthSession>
    )
    setConnected(false)
    rerender(
      <CspAuthSession>
        <TwoButtons />
      </CspAuthSession>
    )

    await user.click(screen.getAllByRole('button', { name: /login/i })[0])
    expect(screen.getByRole('button', { name: 'send code' })).toBeInTheDocument()
    expect(screen.queryByText('Step 1')).not.toBeInTheDocument()
  })
})

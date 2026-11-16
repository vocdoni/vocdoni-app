import userEvent from '@testing-library/user-event'
import { act, render, screen, waitFor } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { certAuthStorageKey, RETRYABLE_CERT_ERRORS, STICKY_CERT_ERRORS } from './cert-auth'
import { CertAuthError } from './CertAuth'
import { CspAuth, CspAuthSession } from './CSPAuthModal'

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@vocdoni/react-components')
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return { ...actual, ...getReactProvidersMock() }
})

vi.mock('./Step1', async () => {
  const { useCspAuthContext } = await import('./CSPStepsProvider')
  return {
    Step1Base: () => {
      const { resetFlow } = useCspAuthContext()
      return (
        <>
          <div>Step 1</div>
          <button onClick={resetFlow}>Start over</button>
        </>
      )
    },
  }
})

const PID = '0123456789abcdef01234567'
const STATE = 's'.repeat(22)
const VERIFIER = 'v'.repeat(43)
const CODE = 'c'.repeat(43)
const GATEWAY = 'https://cert.test:15140'
const appEnv = { CERT_GATEWAY_URL: GATEWAY, CRISP_WEBSITE_ID: 'crisp' }

const auth0 = vi.fn()
const crispPush = vi.fn()

const useCensus = (twoFaFields: string[]) =>
  setReactProvidersMock({
    useElection: () => ({ election: { id: PID, census: { authFields: ['nationalId'], twoFaFields, certAuth: true } } }),
    useElectionAuth: () => ({ connected: false, authToken: null, weight: null, auth0 }),
  })

/** Lands on the voting page as the gateway sends the voter back. */
const landWith = (fragment: string, stored: object | null = { state: STATE, codeVerifier: VERIFIER }) => {
  if (stored) sessionStorage.setItem(certAuthStorageKey(PID), JSON.stringify(stored))
  window.history.replaceState(null, '', `/en/processes/${PID}#${fragment}`)
  render(
    <CspAuthSession>
      <CspAuth />
    </CspAuthSession>,
    { appEnv }
  )
}

describe('certificate voter flow', () => {
  beforeEach(() => {
    sessionStorage.clear()
    auth0.mockReset().mockResolvedValue(undefined)
    crispPush.mockReset()
    ;(window as any).$crisp = { push: crispPush }
    window.history.replaceState(null, '', `/en/processes/${PID}`)
  })

  it('requires the terms, then sends the voter to the gateway, storing only state and verifier', async () => {
    useCensus([])
    const navigate = vi.fn()
    const user = userEvent.setup()
    const { CertAuthStart } = await import('./CertAuth')
    render(<CertAuthStart navigate={navigate} />, { appEnv })

    const start = screen.getByRole('button', { name: 'Sign in with a digital certificate' })
    expect(start).toBeDisabled()
    expect(screen.getByText(/try again from another network, such as mobile data/)).toBeInTheDocument()
    await user.click(screen.getByRole('checkbox'))
    await user.click(start)

    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1))
    const target = new URL(navigate.mock.calls[0][0])
    expect(target.origin + target.pathname).toBe(`${GATEWAY}/v1/auth`)
    expect(target.searchParams.get('processId')).toBe(PID)
    expect(target.searchParams.get('returnUrl')).toBe(`${window.location.origin}/en/processes/${PID}`)
    expect(target.searchParams.get('lang')).toBe('en')
    expect(Object.keys(sessionStorage)).toEqual([certAuthStorageKey(PID)])
    expect(Object.keys(JSON.parse(sessionStorage.getItem(certAuthStorageKey(PID))!)).sort()).toEqual([
      'codeVerifier',
      'state',
    ])
  })

  it('the certificate button recovers when the start fails', async () => {
    useCensus([])
    const navigate = vi.fn(() => {
      throw new Error('blocked')
    })
    const user = userEvent.setup()
    const { CertAuthStart } = await import('./CertAuth')
    render(<CertAuthStart navigate={navigate} />, { appEnv })

    await user.click(screen.getByRole('checkbox'))
    const start = screen.getByRole('button', { name: 'Sign in with a digital certificate' })
    await user.click(start)

    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(start).not.toHaveAttribute('data-loading'))
    expect(start).toBeEnabled()
  })

  it('the certificate button recovers when the page comes back from the back/forward cache', async () => {
    useCensus([])
    const navigate = vi.fn()
    const user = userEvent.setup()
    const { CertAuthStart } = await import('./CertAuth')
    render(<CertAuthStart navigate={navigate} />, { appEnv })

    await user.click(screen.getByRole('checkbox'))
    const start = screen.getByRole('button', { name: 'Sign in with a digital certificate' })
    await user.click(start)
    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1))
    expect(start).toHaveAttribute('data-loading')

    act(() => {
      window.dispatchEvent(new Event('pageshow'))
    })
    await waitFor(() => expect(start).not.toHaveAttribute('data-loading'))
  })

  it('shows the certificate button instead of the login fields', async () => {
    useCensus([])
    const user = userEvent.setup()
    render(
      <CspAuthSession>
        <CspAuth />
      </CspAuthSession>,
      { appEnv }
    )
    await user.click(screen.getByRole('button', { name: /login/i }))
    expect(await screen.findByRole('button', { name: 'Sign in with a digital certificate' })).toBeInTheDocument()
    expect(document.querySelector('input[name="nationalId"]')).toBeNull()
  })

  it('auth-only: redeems the code once, strips the fragment and forgets the flow', async () => {
    useCensus([])
    landWith(`certCode=${CODE}&state=${STATE}`)

    await waitFor(() => expect(auth0).toHaveBeenCalledWith({ certCode: CODE, codeVerifier: VERIFIER }))
    expect(auth0).toHaveBeenCalledTimes(1)
    expect(window.location.hash).toBe('')
    expect(sessionStorage.getItem(certAuthStorageKey(PID))).toBeNull()
    expect(crispPush).not.toHaveBeenCalled()
  })

  it('with 2FA: asks for the contact, sends it with the code, then the code step', async () => {
    useCensus(['email'])
    const user = userEvent.setup()
    landWith(`certCode=${CODE}&state=${STATE}`)

    await user.type(await screen.findByRole('textbox'), ' voter@example.com ')
    await user.click(screen.getByRole('button', { name: 'Receive Code' }))

    await waitFor(() =>
      expect(auth0).toHaveBeenCalledWith({ certCode: CODE, codeVerifier: VERIFIER, email: 'voter@example.com' })
    )
    expect(await screen.findByText('Step 1')).toBeInTheDocument()
    expect(crispPush).not.toHaveBeenCalled()
  })

  it('with 2FA: "Start over" after the code is spent offers the certificate again, never resending it', async () => {
    useCensus(['email'])
    const user = userEvent.setup()
    landWith(`certCode=${CODE}&state=${STATE}`)

    await user.type(await screen.findByRole('textbox'), 'voter@example.com')
    await user.click(screen.getByRole('button', { name: 'Receive Code' }))
    await user.click(await screen.findByRole('button', { name: 'Start over' }))

    expect(await screen.findByRole('button', { name: 'Sign in with a digital certificate' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Receive Code' })).not.toBeInTheDocument()
    expect(auth0).toHaveBeenCalledTimes(1)
  })

  it('with 2FA: a click outside the dialog keeps the unspent code', async () => {
    useCensus(['email'])
    // the open dialog makes the page inert to pointers; jsdom applies no stylesheet to tell the backdrop apart
    const user = userEvent.setup({ pointerEventsCheck: 0 })
    landWith(`certCode=${CODE}&state=${STATE}`)

    await screen.findByRole('textbox')
    // the dialog listens for outside interactions only once it has settled, and closes asynchronously
    await new Promise((resolve) => setTimeout(resolve, 50))
    await user.click(document.querySelector('[data-part="positioner"]')!)
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(screen.queryByRole('textbox')).toBeInTheDocument()
  })

  it.each([
    ['auth-only', []],
    ['with 2FA', ['email']],
  ])('%s: a failed step 0 offers the certificate again', async (_, twoFaFields) => {
    useCensus(twoFaFields)
    auth0.mockRejectedValue(new Error('step 0 failed'))
    const user = userEvent.setup()
    landWith(`certCode=${CODE}&state=${STATE}`)
    if (twoFaFields.length) {
      await user.type(await screen.findByRole('textbox'), 'voter@example.com')
      await user.click(screen.getByRole('button', { name: 'Receive Code' }))
    }

    expect(await screen.findByText('step 0 failed')).toBeInTheDocument()
    expect(sessionStorage.getItem(certAuthStorageKey(PID))).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Sign in with a digital certificate' }))
    // a new flow is stored right before the navigation to the gateway
    await waitFor(() => expect(JSON.parse(sessionStorage.getItem(certAuthStorageKey(PID))!).state).not.toBe(STATE))
  })

  it.each([
    ['a state that is not the stored one', { state: 'x'.repeat(22), codeVerifier: VERIFIER }],
    ['nothing stored', null],
  ])('%s: strips the fragment, shows the generic error and calls nothing', async (_, stored) => {
    useCensus([])
    landWith(`certCode=${CODE}&state=${STATE}`, stored)

    expect(await screen.findByText("We couldn't sign you in with your certificate.")).toBeInTheDocument()
    expect(window.location.hash).toBe('')
    expect(auth0).not.toHaveBeenCalled()
  })

  it('shows a gateway error from the fragment', async () => {
    useCensus([])
    landWith(`certError=not_in_census&state=${STATE}`)
    expect(
      await screen.findByText("The DNI/NIE of this certificate isn't in the census of this vote.")
    ).toBeInTheDocument()
    expect(auth0).not.toHaveBeenCalled()
  })

  it.each(STICKY_CERT_ERRORS)('%s: tells the voter to restart the browser, with no retry', (code) => {
    useCensus([])
    render(<CertAuthError code={code} />, { appEnv })
    expect(screen.getByText(/close every window of the browser and open the voting link again/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument()
  })

  it.each(RETRYABLE_CERT_ERRORS)('%s: offers a retry', async (code) => {
    useCensus([])
    const navigate = vi.fn()
    const user = userEvent.setup()
    render(<CertAuthError code={code} navigate={navigate} />, { appEnv })
    expect(screen.queryByText(/close every window of the browser/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    await waitFor(() => expect(navigate).toHaveBeenCalledWith(expect.stringContaining(`${GATEWAY}/v1/auth?`)))
  })
})

import { fireEvent, screen, waitFor } from '@testing-library/react'
import { VocdoniApiError } from '@vocdoni/api-client'
import { renderToString } from 'react-dom/server'
import { certAuthStorageKey, type CertReturn } from '~components/Process/CertAuth/cert-auth'
import { AllProviders, mockUseElection } from '~src/test-utils'
import { resetReactProvidersMock, setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { VoterFlowContext } from '../flow-context'
import { renderWithFlow, testElection, testFacts, testFlow } from '../test-flow'
import { initialVoterState } from '../voter-flow'
import { CertIdentifyScreen } from './CertIdentifyScreen'

const csp = vi.hoisted(() => ({
  context: {
    authFields: ['nationalId'] as string[],
    twoFaFields: [] as string[],
    setAuthData: vi.fn(),
    setCurrentStep: vi.fn(),
    certReturn: null as CertReturn | null,
    clearCertReturn: vi.fn(),
  },
}))
vi.mock('~components/Process/voter/csp/CspStepsProvider', () => ({
  useCspAuthContext: () => csp.context,
  useOptionalCspAuthContext: () => csp.context,
}))

const auth0 = vi.hoisted(() => vi.fn())

const PID = 'p1'
const GATEWAY = 'https://cert.test:15140'
const appEnv = { CERT_GATEWAY_URL: GATEWAY }
const CODE = 'c'.repeat(43)
const VERIFIER = 'v'.repeat(43)
const INSTAGRAM_IOS =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0'
const WHATSAPP_ANDROID =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.6723.102 Mobile Safari/537.36'

const certElection = () =>
  testElection({ census: { authFields: ['nationalId'], twoFaFields: [], certAuth: true, weighted: false } })

const flowFor = (over: Parameters<typeof testFlow>[0] = {}) =>
  testFlow({
    election: certElection(),
    facts: testFacts({ connected: false }),
    ...over,
  })

/** Renders the identify screen of a certificate census; `navigate` stands for the top-level visit to the gateway. */
const renderScreen = ({
  navigate = vi.fn(),
  notice,
  flow = flowFor(),
  env = appEnv,
}: {
  navigate?: (url: string) => void
  notice?: 'sessionExpired'
  flow?: ReturnType<typeof flowFor>
  env?: object
} = {}) => renderWithFlow(<CertIdentifyScreen notice={notice} navigate={navigate} />, flow, { appEnv: env })

const asBrowser = (ua: string) => vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(ua)

const refused = (code: number) => new VocdoniApiError(401, { error: 'auth failed', code }, 'auth failed', code)

beforeEach(() => {
  sessionStorage.clear()
  window.history.replaceState(null, '', `/en/processes/${PID}`)
  csp.context.twoFaFields = []
  csp.context.certReturn = null
  csp.context.setAuthData.mockReset()
  csp.context.setCurrentStep.mockReset()
  csp.context.clearCertReturn.mockReset()
  auth0.mockReset().mockResolvedValue(undefined)
  setReactProvidersMock({
    useElection: () =>
      mockUseElection({ election: { id: PID, census: { certAuth: true, authFields: ['nationalId'] } } }),
    useElectionAuth: () => ({ connected: false, authToken: null, weight: null, auth0 }),
  })
})
afterEach(() => {
  vi.restoreAllMocks()
  resetReactProvidersMock()
})

describe('certificate identify screen', () => {
  it('asks for no National ID: the terms and the certificate button only', () => {
    renderScreen()

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(document.querySelector('input[name="nationalId"]')).toBeNull()
    expect(screen.getByRole('button', { name: 'csp.cert.start' })).toBeEnabled()
    expect(screen.getByRole('checkbox', { hidden: true })).toBeInTheDocument()
  })

  it('needs the terms before the gateway: without them it names the requirement, with them it sends the voter there', async () => {
    const navigate = vi.fn()
    renderScreen({ navigate })

    fireEvent.click(screen.getByRole('button', { name: 'csp.cert.start' }))
    expect(await screen.findByText('voter.identify.terms_required')).toBeInTheDocument()
    expect(navigate).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('checkbox', { hidden: true }))
    fireEvent.click(screen.getByRole('button', { name: 'csp.cert.start' }))
    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1))
    const target = new URL(navigate.mock.calls[0][0])
    expect(target.searchParams.get('processId')).toBe(PID)
    expect(target.host).toMatch(/^[a-z2-7]{26}\.cert\.test:15140$/)
    expect(JSON.parse(sessionStorage.getItem(certAuthStorageKey(PID))!)).toHaveProperty('codeVerifier')
  })

  it('is unavailable, with no button, when the gateway is not configured', () => {
    renderScreen({ env: { CERT_GATEWAY_URL: undefined } })

    expect(screen.getByRole('alert')).toHaveTextContent('csp.cert.unavailable')
    expect(screen.queryByRole('button', { name: 'csp.cert.start' })).not.toBeInTheDocument()
  })

  it('in an in-app browser: explains why, offers the link and no certificate button', () => {
    asBrowser(INSTAGRAM_IOS)
    renderScreen()

    expect(screen.getByText('csp.cert.in_app.explanation')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'csp.cert.start' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'csp.cert.in_app.open' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'csp.cert.copy_link' })).toBeInTheDocument()
  })

  it('in an Android in-app browser: also offers the intent link to the browser', () => {
    asBrowser(WHATSAPP_ANDROID)
    renderScreen()

    expect(screen.getByRole('link', { name: 'csp.cert.in_app.open' })).toHaveAttribute(
      'href',
      `intent://${window.location.host}${window.location.pathname}#Intent;scheme=https;end`
    )
  })

  it('after a login that never came back: says the certificate page did not load, once', () => {
    sessionStorage.setItem(
      certAuthStorageKey(PID),
      JSON.stringify({
        state: 's'.repeat(22),
        codeVerifier: VERIFIER,
        startedAt: Date.now() - 30_000,
        loadId: 'earlier',
      })
    )
    const { unmount } = renderScreen()
    expect(screen.getByText('csp.cert.not_loaded')).toBeInTheDocument()
    unmount()

    renderScreen()
    expect(screen.queryByText('csp.cert.not_loaded')).not.toBeInTheDocument()
  })

  it('keeps the start available when the gateway could not be reached, and says so', async () => {
    const navigate = vi.fn(() => {
      throw new Error('blocked')
    })
    renderScreen({ navigate, flow: flowFor() })
    fireEvent.click(screen.getByRole('checkbox', { hidden: true }))
    await waitFor(() => expect(screen.getByRole('checkbox', { hidden: true })).toBeChecked())
    const start = screen.getByRole('button', { name: 'csp.cert.start' })
    fireEvent.click(start)

    expect(await screen.findByText("We couldn't sign you in with your certificate.")).toBeInTheDocument()
    await waitFor(() => expect(start).toBeEnabled())
  })

  it('a sticky code: the message, a new start and the restart hint', () => {
    csp.context.certReturn = { kind: 'error', code: 'expired' }
    renderScreen()

    expect(screen.getByRole('alert')).toHaveTextContent('This certificate has expired.')
    expect(screen.getByRole('button', { name: 'csp.cert.retry' })).toBeInTheDocument()
    expect(screen.getByText('csp.cert.restart_browser')).toBeInTheDocument()
  })

  it('a process-level code offers no retry, since another certificate cannot help', () => {
    csp.context.certReturn = { kind: 'error', code: 'process_not_open' }
    renderScreen()

    expect(screen.getByRole('alert')).toHaveTextContent("This vote can't be accessed with a certificate right now.")
    expect(screen.queryByRole('button', { name: 'csp.cert.retry' })).not.toBeInTheDocument()
    expect(screen.queryByText('csp.cert.restart_browser')).not.toBeInTheDocument()
  })

  it('a retryable code offers a retry that starts the login again', async () => {
    const navigate = vi.fn()
    csp.context.certReturn = { kind: 'error', code: 'internal' }
    renderScreen({ navigate })

    fireEvent.click(screen.getByRole('button', { name: 'csp.cert.retry' }))
    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1))
    expect(navigate.mock.calls[0][0]).toMatch(/^https:\/\/[a-z2-7]{26}\.cert\.test:15140\/v1\/auth\?/)
  })

  it('no_certificate in a normal browser: asks for the link on another device, and offers a new start too', () => {
    csp.context.certReturn = { kind: 'error', code: 'no_certificate' }
    renderScreen()

    expect(screen.getByText('csp.cert.other_device')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'csp.cert.copy_link' })).toBeInTheDocument()
    expect(screen.getByText('csp.cert.restart_browser')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'csp.cert.retry' })).toBeInTheDocument()
  })

  it('no_certificate in an in-app browser: says to open the link in the browser, not to restart it', () => {
    asBrowser(INSTAGRAM_IOS)
    csp.context.certReturn = { kind: 'error', code: 'no_certificate' }
    renderScreen()

    expect(screen.getByText('csp.cert.in_app.explanation')).toBeInTheDocument()
    expect(screen.queryByText('csp.cert.restart_browser')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'csp.cert.retry' })).not.toBeInTheDocument()
  })

  it('a mismatch brings the start back, with the terms', () => {
    csp.context.certReturn = { kind: 'mismatch' }
    renderScreen()

    expect(screen.getByRole('alert')).toHaveTextContent("Your certificate sign-in didn't finish in this tab.")
    expect(screen.getByRole('checkbox', { hidden: true })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'csp.cert.start' })).toBeInTheDocument()
  })

  it('an error ends with the organisation to contact and the support reference', () => {
    const reference = '0123456789abcdef0123456789abcdef'
    csp.context.certReturn = { kind: 'error', code: 'revoked', ref: reference }
    renderScreen()

    // the support reference is interpolated by the translation; the test catalogue has keys only
    expect(screen.getByText(/csp\.cert\.contact_organization/)).toHaveTextContent('csp.cert.reference')
  })

  it('an auth-only code is redeemed once while the sign-in is announced', async () => {
    csp.context.certReturn = { kind: 'code', certCode: CODE, codeVerifier: VERIFIER }
    auth0.mockReturnValue(new Promise(() => {}))
    renderScreen()

    expect(await screen.findByRole('status')).toHaveTextContent('csp.cert.signing_in')
    await waitFor(() => expect(auth0).toHaveBeenCalledWith({ certCode: CODE, codeVerifier: VERIFIER }))
    expect(auth0).toHaveBeenCalledTimes(1)
  })

  it('a refused auth-only code asks to sign in again, never "not in the census"', async () => {
    csp.context.certReturn = { kind: 'code', certCode: CODE, codeVerifier: VERIFIER }
    auth0.mockRejectedValue(refused(40802))
    renderScreen()

    expect(await screen.findByRole('alert')).toHaveTextContent('csp.cert.errors.code_refused')
    expect(screen.queryByText(/not listed in the census/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'csp.cert.start' })).toBeInTheDocument()
    expect(auth0).toHaveBeenCalledTimes(1)
  })

  it('with 2FA the contact goes with the code, then the code step is due', async () => {
    csp.context.twoFaFields = ['email']
    csp.context.certReturn = { kind: 'code', certCode: CODE, codeVerifier: VERIFIER }
    renderScreen({ flow: flowFor({ facts: testFacts({ connected: false }) }) })

    expect(auth0).not.toHaveBeenCalled()
    fireEvent.change(screen.getByRole('textbox', { name: /Email/ }), { target: { value: ' voter@example.com ' } })
    fireEvent.click(screen.getByRole('button', { name: 'voter.continue' }))

    await waitFor(() =>
      expect(auth0).toHaveBeenCalledWith({ certCode: CODE, codeVerifier: VERIFIER, email: 'voter@example.com' })
    )
    expect(csp.context.setAuthData).toHaveBeenCalledWith({ email: 'voter@example.com', phone: undefined })
    expect(csp.context.setCurrentStep).toHaveBeenCalledWith(1)
    expect(csp.context.clearCertReturn).toHaveBeenCalled()
  })

  it('with 2FA a refused code names the contact and offers a new sign-in, keeping no code step', async () => {
    csp.context.twoFaFields = ['email']
    csp.context.certReturn = { kind: 'code', certCode: CODE, codeVerifier: VERIFIER }
    auth0.mockRejectedValue(refused(40029))
    renderScreen()

    fireEvent.change(screen.getByRole('textbox', { name: /Email/ }), { target: { value: 'voter@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'voter.continue' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('csp.cert.errors.code_refused_contact')
    expect(screen.getByRole('button', { name: 'csp.cert.start' })).toBeInTheDocument()
    expect(csp.context.setCurrentStep).not.toHaveBeenCalled()
    expect(csp.context.clearCertReturn).not.toHaveBeenCalled()
  })

  it('shows the live count link on a vote that shows its results, and not on a secret one until it ends', () => {
    const open = renderScreen()
    expect(screen.getByTestId('voter-show-results')).toBeInTheDocument()
    open.unmount()

    const secret = renderScreen({ flow: flowFor({ facts: testFacts({ connected: false, secretUntilTheEnd: true }) }) })
    expect(screen.queryByTestId('voter-show-results')).not.toBeInTheDocument()
    secret.unmount()

    renderScreen({ flow: flowFor({ facts: testFacts({ connected: false, resultsShown: false }) }) })
    expect(screen.queryByTestId('voter-show-results')).not.toBeInTheDocument()
  })

  it('says the session expired when the voter is sent back to identify', () => {
    renderScreen({ notice: 'sessionExpired' })
    expect(screen.getByText('voter.identify.session_expired')).toBeInTheDocument()
  })

  it('on a checked receipt it asks the voter to check the vote, with a way back', () => {
    const flow = flowFor({ state: { ...initialVoterState, checkReceipt: true } })
    renderScreen({ flow })
    expect(screen.getByText('voter.results.check_vote')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'voter.back' }))
    expect(flow.leaveReceipt).toHaveBeenCalled()
  })

  it('server-renders the start button off, and reads no browser state until hydration', () => {
    const userAgent = vi.spyOn(navigator, 'userAgent', 'get')
    const getItem = vi.spyOn(Storage.prototype, 'getItem')
    const html = renderToString(
      <AllProviders appEnv={appEnv}>
        <VoterFlowContext.Provider value={flowFor()}>
          <CertIdentifyScreen navigate={vi.fn()} />
        </VoterFlowContext.Provider>
      </AllProviders>
    )
    expect(html).toMatch(/<button[^>]*type="submit"[^>]*disabled/)
    expect(userAgent).not.toHaveBeenCalled()
    expect(getItem).not.toHaveBeenCalled()
  })
})

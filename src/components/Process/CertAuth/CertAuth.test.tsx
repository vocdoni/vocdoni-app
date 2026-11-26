import userEvent from '@testing-library/user-event'
import { VocdoniApiError } from '@vocdoni/api-client'
import {
  CspAuthSession,
  reactComponentsNamespace,
  reactComponentsResources,
  useCspAuthSession,
} from '@vocdoni/react-components'
import { useEffect } from 'react'
import i18n from 'i18next'
import { act, render, screen, waitFor } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { certAuthStorageKey, PROCESS_CERT_ERRORS, RETRYABLE_CERT_ERRORS, STICKY_CERT_ERRORS } from './cert-auth'
import { CertAuthConnect, CertAuthError, CertAuthReturn, CertCodeStep } from './CertAuth'

// The packaged CspAuthSession reads react-providers directly, out of reach of the app's mocks: a
// stand-in keeps the same step, contact and notice state the certificate flow shares through it.
vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@vocdoni/react-components')
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  const { createContext, createElement, useContext, useState } = await import('react')
  const Session = createContext<any>(undefined)
  const mocks = getReactProvidersMock()
  return {
    ...actual,
    ...mocks,
    CspAuthSession: ({ children }: { children: any }) => {
      const [currentStep, setCurrentStep] = useState(0)
      const [contact, setContact] = useState({})
      const [pendingNotice, setPendingNotice] = useState<string>()
      const twoFaFields = mocks.useElection().election?.census?.twoFaFields ?? []
      const value = {
        currentStep,
        setCurrentStep,
        contact,
        setContact,
        pendingNotice,
        setPendingNotice,
        twoFaFields,
        resetFlow: () => setCurrentStep(0),
      }
      return createElement(Session.Provider, { value }, children)
    },
    useCspAuthSession: () => useContext(Session),
  }
})

const PID = '0123456789abcdef01234567'
const STATE = 's'.repeat(22)
const VERIFIER = 'v'.repeat(43)
const CODE = 'c'.repeat(43)
const GATEWAY = 'https://cert.test:15140'
const appEnv = { CERT_GATEWAY_URL: GATEWAY, CRISP_WEBSITE_ID: 'crisp' }

const auth0 = vi.fn()
const auth1 = vi.fn()
const resend = vi.fn()
const crispPush = vi.fn()

const useCensus = (twoFaFields: string[]) =>
  setReactProvidersMock({
    useElection: () => ({ election: { id: PID, census: { authFields: ['nationalId'], twoFaFields, certAuth: true } } }),
    useElectionAuth: () => ({ connected: false, authToken: null, weight: null, auth0, auth1, resend }),
    useOrganization: () => ({ organization: { name: { default: 'Club Example' } } }),
  })

const INSTAGRAM_IOS =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0'
const WHATSAPP_ANDROID =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.6723.102 Mobile Safari/537.36'
const asBrowser = (ua: string) => vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(ua)
const spentCode = () => new VocdoniApiError(401, { error: 'auth failed', code: 40802 }, 'auth failed', 40802)

/** Lands on the voting page as the gateway sends the voter back. */
const landWith = (fragment: string, stored: object | null = { state: STATE, codeVerifier: VERIFIER }) => {
  if (stored) sessionStorage.setItem(certAuthStorageKey(PID), JSON.stringify(stored))
  window.history.replaceState(null, '', `/en/processes/${PID}#${fragment}`)
  renderPage()
}

/** The voting page: its identify button and, once per page, the handler of the gateway's answer. */
const renderPage = () =>
  render(
    <CspAuthSession>
      <CertAuthConnect />
      <CertAuthReturn />
    </CspAuthSession>,
    { appEnv }
  )

describe('certificate voter flow', () => {
  beforeAll(() => {
    i18n.addResourceBundle('en', reactComponentsNamespace, reactComponentsResources.en[reactComponentsNamespace])
  })
  beforeEach(() => {
    sessionStorage.clear()
    auth0.mockReset().mockResolvedValue(undefined)
    auth1.mockReset().mockResolvedValue(undefined)
    resend.mockReset().mockResolvedValue(undefined)
    crispPush.mockReset()
    ;(window as any).$crisp = { push: crispPush }
    window.history.replaceState(null, '', `/en/processes/${PID}`)
  })
  afterEach(() => vi.restoreAllMocks())

  it('requires the terms, then sends the voter to the gateway, storing only state, verifier and start time', async () => {
    useCensus([])
    const navigate = vi.fn()
    const user = userEvent.setup()
    const { CertAuthStart } = await import('./CertAuth')
    render(<CertAuthStart navigate={navigate} />, { appEnv })

    const start = screen.getByRole('button', { name: 'Sign in with a digital certificate' })
    expect(start).toBeDisabled()
    expect(screen.queryByText(/another network, such as mobile data/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('checkbox'))
    await user.click(start)

    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1))
    const target = new URL(navigate.mock.calls[0][0])
    expect(`${target.protocol}//${target.host.replace(/^[a-z2-7]{26}\./, '')}${target.pathname}`).toBe(
      `${GATEWAY}/v1/auth`
    )
    expect(target.searchParams.get('processId')).toBe(PID)
    expect(target.searchParams.get('returnUrl')).toBe(`${window.location.origin}/en/processes/${PID}`)
    expect(target.searchParams.get('lang')).toBe('en')
    expect(Object.keys(sessionStorage)).toEqual([certAuthStorageKey(PID)])
    expect(Object.keys(JSON.parse(sessionStorage.getItem(certAuthStorageKey(PID))!)).sort()).toEqual([
      'codeVerifier',
      'startedAt',
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
    renderPage()
    await user.click(screen.getByRole('button', { name: 'Identify' }))
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
    expect(await screen.findByText('Enter the verification code')).toBeInTheDocument()
    expect(screen.getByText('Verification code sent')).toBeInTheDocument()
    expect(crispPush).not.toHaveBeenCalled()
  })

  it('with 2FA: the code step comes back from Identify once the dialog is closed', async () => {
    useCensus(['email'])
    const user = userEvent.setup()
    landWith(`certCode=${CODE}&state=${STATE}`)

    await user.type(await screen.findByRole('textbox'), 'voter@example.com')
    await user.click(screen.getByRole('button', { name: 'Receive Code' }))
    expect(await screen.findByText('Enter the verification code')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /close/i }))
    await waitFor(() => expect(screen.queryByText('Enter the verification code')).not.toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Identify' }))
    expect(await screen.findByText('Enter the verification code')).toBeInTheDocument()
    expect(auth0).toHaveBeenCalledTimes(1)
  })

  it('the code step confirms the code and resends it to the stored contact', async () => {
    useCensus(['email'])
    const user = userEvent.setup()
    // Zag finds its inputs with an unquoted escaped id that jsdom's selector engine misses (see csp.CspAuth.test.tsx)
    vi.spyOn(CSS, 'escape').mockImplementation((value) => `"${value}"`)
    const Harness = () => {
      const { setContact, setCurrentStep, currentStep } = useCspAuthSession()
      useEffect(() => {
        setContact({ email: 'voter@example.com' })
        setCurrentStep(1)
      }, [setContact, setCurrentStep])
      return currentStep === 1 ? <CertCodeStep /> : null
    }
    render(
      <CspAuthSession>
        <Harness />
      </CspAuthSession>,
      { appEnv }
    )

    await user.type(screen.getAllByRole('textbox')[0], '123456')
    await waitFor(() => expect(auth1).toHaveBeenCalledWith('123456'))
    expect(auth1).toHaveBeenCalledTimes(1)
    await user.click(screen.getByRole('button', { name: 'Resend code' }))
    expect(resend).toHaveBeenCalledWith({ email: 'voter@example.com' })
    expect(await screen.findByText('Code resent successfully')).toBeInTheDocument()
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
  ])('%s: strips the fragment, calls nothing and offers the start again', async (_, stored) => {
    useCensus([])
    landWith(`certCode=${CODE}&state=${STATE}`, stored)

    expect(await screen.findByText(/didn't finish in this tab/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in with a digital certificate' })).toBeInTheDocument()
    expect(screen.queryByText(/another network/)).not.toBeInTheDocument()
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

  it.each(PROCESS_CERT_ERRORS)('%s: offers no retry, since another certificate cannot help', (code) => {
    useCensus([])
    render(<CertAuthError code={code} navigate={vi.fn()} />, { appEnv })
    expect(screen.getByText("This vote can't be accessed with a certificate right now.")).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument()
    expect(screen.queryByText(/close every window of the browser/)).not.toBeInTheDocument()
  })

  it.each(STICKY_CERT_ERRORS.filter((code) => !(PROCESS_CERT_ERRORS as readonly string[]).includes(code)))(
    '%s: offers "Try again" on a new host, with restarting the browser only as a hint',
    async (code) => {
      useCensus([])
      const navigate = vi.fn()
      const user = userEvent.setup()
      render(<CertAuthError code={code} navigate={navigate} />, { appEnv })
      expect(screen.getByText(/close every window of the browser and open the voting link again/)).toBeInTheDocument()
      const retry = screen.getByRole('button', { name: 'Try again' })
      await user.click(retry)
      await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1))
      // back from the gateway: the page comes back from the back/forward cache
      act(() => {
        window.dispatchEvent(new Event('pageshow'))
      })
      await user.click(retry)
      await waitFor(() => expect(navigate).toHaveBeenCalledTimes(2))
      const [a, b] = navigate.mock.calls.map(([url]) => new URL(url))
      expect(a.host).not.toBe(b.host)
      for (const u of [a, b]) expect(u.host).toMatch(/^[a-z2-7]{26}\.cert\.test:15140$/)
    }
  )

  it.each(RETRYABLE_CERT_ERRORS)('%s: offers a retry', async (code) => {
    useCensus([])
    const navigate = vi.fn()
    const user = userEvent.setup()
    render(<CertAuthError code={code} navigate={navigate} />, { appEnv })
    expect(screen.queryByText(/close every window of the browser/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith(
        expect.stringMatching(/^https:\/\/[a-z2-7]{26}\.cert\.test:15140\/v1\/auth\?/)
      )
    )
  })

  it.each([
    ['auth-only', [], /^Your certificate sign-in expired\. Sign in again\.$/],
    ['with 2FA', ['email'], /expired, or the email or phone doesn't match/],
  ])(
    '%s: a code the backend refuses (40802) asks to sign in again, never "not in the census"',
    async (_, twoFaFields, message) => {
      useCensus(twoFaFields)
      auth0.mockRejectedValue(spentCode())
      const user = userEvent.setup()
      landWith(`certCode=${CODE}&state=${STATE}`)
      if (twoFaFields.length) {
        await user.type(await screen.findByRole('textbox'), 'voter@example.com')
        await user.click(screen.getByRole('button', { name: 'Receive Code' }))
      }

      expect(await screen.findByText(message)).toBeInTheDocument()
      expect(screen.queryByText(/not listed in the census/)).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sign in with a digital certificate' })).toBeInTheDocument()
    }
  )

  it('"Try again" loads while the login starts', async () => {
    useCensus([])
    const navigate = vi.fn()
    const user = userEvent.setup()
    render(<CertAuthError code='internal' navigate={navigate} />, { appEnv })

    const retry = screen.getByRole('button', { name: 'Try again' })
    await user.click(retry)

    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1))
    expect(retry).toHaveAttribute('data-loading')
  })

  it('"Try again" recovers and says so when the login cannot start', async () => {
    useCensus([])
    const navigate = vi.fn(() => {
      throw new Error('blocked')
    })
    const user = userEvent.setup()
    render(<CertAuthError code='internal' navigate={navigate} />, { appEnv })

    const retry = screen.getByRole('button', { name: 'Try again' })
    await user.click(retry)

    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(retry).not.toHaveAttribute('data-loading'))
    expect(retry).toBeEnabled()
    expect(screen.getByText("We couldn't sign you in with your certificate.")).toBeInTheDocument()
  })

  it('signing in again after a refused code recovers and says so when the login cannot start', async () => {
    useCensus([])
    auth0.mockRejectedValue(spentCode())
    const user = userEvent.setup()
    landWith(`certCode=${CODE}&state=${STATE}`)
    const again = await screen.findByRole('button', { name: 'Sign in with a digital certificate' })
    vi.spyOn(crypto.subtle, 'digest').mockRejectedValue(new Error('no crypto'))

    await user.click(again)

    expect(await screen.findByText("We couldn't sign you in with your certificate.")).toBeInTheDocument()
    expect(again).not.toHaveAttribute('data-loading')
  })

  it('announces the sign-in in progress', async () => {
    useCensus([])
    auth0.mockReturnValue(new Promise(() => {}))
    landWith(`certCode=${CODE}&state=${STATE}`)
    expect(await screen.findByRole('status')).toHaveTextContent('Signing you in…')
  })

  it('guides the choice of certificate, naming the accepted issuers', async () => {
    useCensus([])
    const { CertAuthStart } = await import('./CertAuth')
    render(<CertAuthStart />, { appEnv })
    expect(screen.getByText(/choose the one with your name/)).toHaveTextContent(
      /FNMT, idCAT, ACCV, DIGITEL, Bewor (and|or) Sectigo/
    )
    expect(screen.getByText(/idCAT Mòbil and Cl@ve are not certificates/)).toBeInTheDocument()
  })

  it('back on the page from a gateway that never answered: suggests another network, once', async () => {
    useCensus([])
    sessionStorage.setItem(
      certAuthStorageKey(PID),
      JSON.stringify({ state: STATE, codeVerifier: VERIFIER, startedAt: Date.now() - 30_000 })
    )
    const { CertAuthStart } = await import('./CertAuth')
    const { unmount } = render(<CertAuthStart />, { appEnv })
    expect(
      screen.getByText(/certificate page didn't load\? Try another network, such as mobile data/)
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument()

    unmount()
    render(<CertAuthStart />, { appEnv })
    expect(screen.queryByText(/certificate page didn't load/)).not.toBeInTheDocument()
  })

  it('no "page didn\'t load" hint long after the login started', async () => {
    useCensus([])
    sessionStorage.setItem(
      certAuthStorageKey(PID),
      JSON.stringify({ state: STATE, codeVerifier: VERIFIER, startedAt: Date.now() - 3 * 60_000 })
    )
    const { CertAuthStart } = await import('./CertAuth')
    render(<CertAuthStart />, { appEnv })
    expect(screen.queryByText(/certificate page didn't load/)).not.toBeInTheDocument()
  })

  it('the "page didn\'t load" hint after going back from the browser\'s error page', async () => {
    useCensus([])
    vi.spyOn(performance, 'getEntriesByType').mockReturnValue([{ type: 'back_forward' } as unknown as PerformanceEntry])
    sessionStorage.setItem(
      certAuthStorageKey(PID),
      JSON.stringify({ state: STATE, codeVerifier: VERIFIER, startedAt: Date.now() - 10_000 })
    )
    const { CertAuthStart } = await import('./CertAuth')
    render(<CertAuthStart />, { appEnv })
    expect(screen.getByText(/certificate page didn't load/)).toBeInTheDocument()
    vi.restoreAllMocks()
  })

  it('the "page didn\'t load" hint when the page is restored from the back/forward cache', async () => {
    useCensus([])
    const navigate = vi.fn()
    const user = userEvent.setup()
    const { CertAuthStart } = await import('./CertAuth')
    render(<CertAuthStart navigate={navigate} />, { appEnv })
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Sign in with a digital certificate' }))
    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1))

    act(() => {
      window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }))
    })
    expect(screen.getByText(/certificate page didn't load/)).toBeInTheDocument()
    expect(sessionStorage.getItem(certAuthStorageKey(PID))).toBeNull()
  })

  it('in an in-app browser: explains why, offers the link and no certificate button', async () => {
    useCensus([])
    asBrowser(INSTAGRAM_IOS)
    const user = userEvent.setup()
    const { CertAuthStart } = await import('./CertAuth')
    render(<CertAuthStart />, { appEnv })

    expect(screen.getByText(/opened this link inside an app/)).toBeInTheDocument()
    expect(screen.getByText(/open this link in your browser/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sign in with a digital certificate' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /open in your browser/i })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /copy link/i }))
    expect(await navigator.clipboard.readText()).toBe(`${window.location.origin}/en/processes/${PID}`)
    expect(await screen.findByText('Link copied')).toBeInTheDocument()
  })

  it('in an Android in-app browser: also offers an intent link to the browser', async () => {
    useCensus([])
    asBrowser(WHATSAPP_ANDROID)
    const { CertAuthStart } = await import('./CertAuth')
    render(<CertAuthStart />, { appEnv })
    expect(screen.getByRole('link', { name: /open in your browser/i })).toHaveAttribute(
      'href',
      `intent://${window.location.host}/en/processes/${PID}#Intent;scheme=https;end`
    )
  })

  it('no_certificate in an in-app browser: says to open the link in the browser, not to restart it', () => {
    useCensus([])
    asBrowser(INSTAGRAM_IOS)
    render(<CertAuthError code='no_certificate' />, { appEnv })
    expect(screen.getByText(/opened this link inside an app/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument()
    expect(screen.queryByText(/close every window of the browser/)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument()
  })

  it('no_certificate in a normal browser: also offers the link for another device', () => {
    useCensus([])
    render(<CertAuthError code='no_certificate' />, { appEnv })
    expect(screen.getByText(/close every window of the browser/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument()
  })

  it.each(STICKY_CERT_ERRORS)('%s: has its own message, not the generic one', (code) => {
    useCensus([])
    render(<CertAuthError code={code} />, { appEnv })
    expect(screen.queryByText("We couldn't sign you in with your certificate.")).not.toBeInTheDocument()
  })

  it('tells an expired certificate from one not valid yet', () => {
    useCensus([])
    const { unmount } = render(<CertAuthError code='expired' />, { appEnv })
    expect(screen.getByText(/has expired/)).toBeInTheDocument()
    unmount()
    render(<CertAuthError code='not_yet_valid' />, { appEnv })
    expect(screen.getByText(/isn't active yet/)).toBeInTheDocument()
  })

  it('ends with the organisation to contact and the support reference', async () => {
    useCensus([])
    const ref = '0123456789abcdef0123456789abcdef'
    landWith(`certError=revoked&ref=${ref}&state=${STATE}`)
    expect(await screen.findByText(/If you keep having problems, contact Club Example/)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(ref))).toBeInTheDocument()
  })
})

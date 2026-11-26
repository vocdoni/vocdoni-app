import userEvent from '@testing-library/user-event'
import { CspAuthSession, reactComponentsNamespace, reactComponentsResources } from '@vocdoni/react-components'
import i18n from 'i18next'
import { act, render, screen, waitFor } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { certAuthStorageKey } from './cert-auth'
import { CertAuthConnect } from './CertAuth'

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

/** The Home and shared-census pages: the identify button, which starts the certificate login. */
const renderPage = () =>
  render(
    <CspAuthSession>
      <CertAuthConnect />
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

  it('requires the terms, then sends the voter to the gateway, storing only state, verifier, start time and page load', async () => {
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
      'loadId',
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

  it('guides the choice of certificate, naming the accepted issuers', async () => {
    useCensus([])
    const { CertAuthStart } = await import('./CertAuth')
    render(<CertAuthStart />, { appEnv })
    expect(screen.getByText(/choose the one with your name/)).toHaveTextContent(
      /FNMT, idCAT, ACCV, DIGITEL, Bewor (and|or) Sectigo/
    )
    expect(screen.getByText(/idCAT Mòbil and Cl@ve are not certificates/)).toBeInTheDocument()
  })

  it('back on the page from a gateway that never answered: suggests another network, once, and a late answer still signs in', async () => {
    useCensus([])
    const flow = {
      state: STATE,
      codeVerifier: VERIFIER,
      startedAt: Date.now() - 30_000,
      loadId: 'an earlier page load',
    }
    sessionStorage.setItem(certAuthStorageKey(PID), JSON.stringify(flow))
    const { CertAuthStart } = await import('./CertAuth')
    const { unmount } = render(<CertAuthStart />, { appEnv })
    expect(
      screen.getByText(/certificate page didn't load\? Try another network, such as mobile data/)
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument()

    unmount()
    const again = render(<CertAuthStart />, { appEnv })
    expect(screen.queryByText(/certificate page didn't load/)).not.toBeInTheDocument()
    again.unmount()
  })

  it('closing and reopening the dialog while the gateway connects: no hint, and its answer still signs in', async () => {
    useCensus([])
    const navigate = vi.fn()
    const user = userEvent.setup()
    const { CertAuthStart } = await import('./CertAuth')
    const { unmount } = render(<CertAuthStart navigate={navigate} />, { appEnv })
    await user.click(screen.getByRole('checkbox'))
    await user.click(screen.getByRole('button', { name: 'Sign in with a digital certificate' }))
    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1))
    const flow = sessionStorage.getItem(certAuthStorageKey(PID))!

    unmount()
    const reopened = render(<CertAuthStart navigate={navigate} />, { appEnv })
    expect(screen.queryByText(/certificate page didn't load/)).not.toBeInTheDocument()
    expect(sessionStorage.getItem(certAuthStorageKey(PID))).toBe(flow)
    reopened.unmount()
  })

  it('no "page didn\'t load" hint long after the login started', async () => {
    useCensus([])
    sessionStorage.setItem(
      certAuthStorageKey(PID),
      JSON.stringify({ state: STATE, codeVerifier: VERIFIER, startedAt: Date.now() - 16 * 60_000 })
    )
    const { CertAuthStart } = await import('./CertAuth')
    render(<CertAuthStart />, { appEnv })
    expect(screen.queryByText(/certificate page didn't load/)).not.toBeInTheDocument()
  })

  it('the "page didn\'t load" hint on a new page load after going back from the browser\'s error page', async () => {
    useCensus([])
    // the error page of a dropped port shows after the TCP connect timeout, and the voter may linger on it
    sessionStorage.setItem(
      certAuthStorageKey(PID),
      JSON.stringify({
        state: STATE,
        codeVerifier: VERIFIER,
        startedAt: Date.now() - 5 * 60_000,
        loadId: 'the page that left',
      })
    )
    const { CertAuthStart } = await import('./CertAuth')
    render(<CertAuthStart />, { appEnv })
    expect(screen.getByText(/certificate page didn't load/)).toBeInTheDocument()
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
    expect(JSON.parse(sessionStorage.getItem(certAuthStorageKey(PID))!)).toMatchObject({ hinted: true })
    expect(JSON.parse(sessionStorage.getItem(certAuthStorageKey(PID))!).codeVerifier).toBeTruthy()
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
})

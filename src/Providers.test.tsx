import { act, fireEvent, render, screen } from '@testing-library/react'
import { useContext, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageRoutingContext } from '~i18n/LanguageRoutingContext'

// The language-switch test needs a RoutesProvider it can drive, but `mounts without
// crashing` below is the only place the *real* route tree gets smoke-tested (see #1746:
// a broken router/route module only shows up when it is actually mounted). So the mock
// forwards to the real provider unless a test opts into the probe.
let routesProviderStub: (() => ReactNode) | null = null

vi.mock('./router/Router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./router/Router')>()
  return {
    ...actual,
    RoutesProvider: (props: { basename?: string }) => {
      const Stub = routesProviderStub
      return Stub ? <Stub /> : <actual.RoutesProvider {...props} />
    },
  }
})

const LanguageProbe = () => {
  const routing = useContext(LanguageRoutingContext)
  const { i18n } = useTranslation()
  return (
    <>
      <output aria-label='Active language'>{i18n.resolvedLanguage}</output>
      <button onClick={() => routing?.setLanguage('ca')}>Switch language</button>
    </>
  )
}

// What Vike hands the client: the runtime env resolved on the server (see
// +onCreateGlobalContext.server.ts). Without it AppProviders falls back to defaults
// and warns that the passToClient wiring is broken.
vi.mock('vike-react/usePageContext', async () => {
  const { buildAppEnv } = await import('./app-env-build')
  const pageContext = { globalContext: { appEnv: buildAppEnv({}) } }
  return { usePageContext: () => pageContext }
})

vi.mock('wagmi', () => ({
  WagmiProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useAccount: () => ({ address: undefined }),
  useWalletClient: () => ({ data: null }),
  useDisconnect: () => ({ disconnect: vi.fn() }),
}))

vi.mock('./constants/wagmi', () => ({
  wagmiConfig: {},
}))

vi.mock('~components/Layout/ConnectionToast', () => ({
  ConnectionToastProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock('~components/Auth/AuthContext', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
  }),
}))

vi.mock('~components/Auth/Subscription', () => ({
  SubscriptionProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock('~components/Account/SaasAccountProvider', () => ({
  SaasAccountProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock('~components/AnalyticsProvider', () => ({
  AnalyticsProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

vi.mock('~components/Cookies/CookieConsent', () => ({
  CookieConsent: () => null,
}))

describe('Providers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Mounting this pulls in the whole provider graph (wagmi, chakra,
  // every locale bundle), which on a loaded machine takes well over the default
  // timeout. Timing out here used to cascade into the test below: the abandoned
  // render kept settling and its language detection landed mid-assertion.
  it('mounts without crashing', async () => {
    const { Providers } = await import('./Providers')
    expect(() => render(<Providers />)).not.toThrow()
  }, 30000)

  it('does not overwrite the persisted preferred language when rendering a public page in english', async () => {
    // Import before seeding the preference: `~i18n` builds its detector-backed
    // singleton at import time, and that detection caches a language. Seeding
    // afterwards keeps this test independent of whether an earlier test already
    // paid for the import.
    const { AppProviders } = await import('./Providers')

    window.localStorage.setItem('i18nextLng', 'ca')

    render(
      <AppProviders language='en'>
        <div>public-page</div>
      </AppProviders>
    )

    expect(window.localStorage.getItem('i18nextLng')).toBe('ca')
  })

  it('keeps the HTML language and native translations in sync across language switches and history', async () => {
    const { Providers } = await import('./Providers')
    const previousLanguage = document.documentElement.lang
    const previousUrl = window.location.href
    const previousPreference = window.localStorage.getItem('i18nextLng')
    // Everything that mutates shared state (the stub, the <html> lang, the URL) has to
    // happen inside the try: a throw before it would leak into every later test in the
    // file, and the abandoned render would keep settling mid-assertion (see above).
    let unmount: (() => void) | undefined
    try {
      routesProviderStub = LanguageProbe
      document.documentElement.lang = 'en'
      window.history.replaceState(null, '', '/pt/admin/processes/create')
      ;({ unmount } = render(<Providers language='pt' />))

      expect(document.documentElement.lang).toBe('pt')
      // Exact match: `toHaveTextContent('pt')` also passes for `pt-br`, which is the
      // very confusion this guards against.
      expect(screen.getByLabelText('Active language')).toHaveTextContent(/^pt$/)

      fireEvent.click(screen.getByRole('button', { name: 'Switch language' }))
      expect(document.documentElement.lang).toBe('ca')
      expect(screen.getByLabelText('Active language')).toHaveTextContent(/^ca$/)
      expect(window.location.pathname).toBe('/ca/admin/processes/create')

      act(() => {
        window.history.replaceState(null, '', '/pt/admin/processes/create')
        window.dispatchEvent(new PopStateEvent('popstate'))
      })
      expect(document.documentElement.lang).toBe('pt')
      expect(screen.getByLabelText('Active language')).toHaveTextContent(/^pt$/)
    } finally {
      unmount?.()
      routesProviderStub = null
      document.documentElement.lang = previousLanguage
      window.history.replaceState(null, '', previousUrl)
      if (previousPreference === null) window.localStorage.removeItem('i18nextLng')
      else window.localStorage.setItem('i18nextLng', previousPreference)
    }
  })
})

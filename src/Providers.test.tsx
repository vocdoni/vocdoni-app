import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useContext, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { MockInstance } from 'vitest'
import { LanguageRoutingContext } from '~i18n/LanguageRoutingContext'
import { loadLanguages } from './i18n'

// Where persistPublicLanguagePreferenceClient stores the choice (see ~i18n/public-language).
const PUBLIC_LANGUAGE_STORAGE_KEY = 'i18nextLng'

// The language-switch test needs a RoutesProvider it can drive, but `mounts without
// crashing` below is the only place the *real* route tree gets smoke-tested (see #1746:
// a broken router/route module only shows up when it is actually mounted). So the mock
// forwards to the real provider unless a test opts into the probe.
let routesProviderStub: ((props: { basename?: string }) => ReactNode) | null = null

vi.mock('./router/Router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./router/Router')>()
  return {
    ...actual,
    RoutesProvider: (props: { basename?: string }) => {
      const Stub = routesProviderStub
      return Stub ? <Stub basename={props.basename} /> : <actual.RoutesProvider {...props} />
    },
  }
})

// Hands out each loadLanguages call to the test, so it can hold a switch while its
// translations are still loading. Unheld calls use the real loader.
vi.mock('./i18n', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./i18n')>()
  return { ...actual, loadLanguages: vi.fn(actual.loadLanguages) }
})

const LanguageProbe = ({ basename }: { basename?: string }) => {
  const routing = useContext(LanguageRoutingContext)
  const { i18n } = useTranslation()
  return (
    <>
      <output aria-label='Active language'>{i18n.resolvedLanguage}</output>
      <output aria-label='Router basename'>{basename}</output>
      <button onClick={() => routing?.setLanguage('ca')}>Switch language</button>
      <button onClick={() => routing?.setLanguage('fr')}>Switch to fr</button>
      <button onClick={() => routing?.setLanguage('es')}>Switch to es</button>
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

  // Mounting this pulls in the whole provider graph (chakra and
  // the rest), which on a loaded machine takes well over the default
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
    const { AppProviders } = await import('./AppProviders')

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
    // What +onBeforeRenderClient does before Vike renders a localized page.
    const { loadLanguages } = await import('./i18n')
    await loadLanguages(['pt'])
    const previousLanguage = document.documentElement.lang
    const previousUrl = window.location.href
    const previousPreference = window.localStorage.getItem('i18nextLng')
    // Everything that mutates shared state (the stub, the <html> lang, the URL) has to
    // happen inside the try: a throw before it would leak into every later test in the
    // file, and the abandoned render would keep settling mid-assertion (see above).
    let unmount: (() => void) | undefined
    try {
      routesProviderStub = (props) => <LanguageProbe basename={props.basename} />
      document.documentElement.lang = 'en'
      window.history.replaceState(null, '', '/pt/admin/processes/create')
      ;({ unmount } = render(<Providers language='pt' />))

      expect(document.documentElement.lang).toBe('pt')
      // Exact match: `toHaveTextContent('pt')` also passes for `pt-br`, which is the
      // very confusion this guards against.
      expect(screen.getByLabelText('Active language')).toHaveTextContent(/^pt$/)

      // The URL, basename and language change together, once the translations are fetched.
      fireEvent.click(screen.getByRole('button', { name: 'Switch language' }))
      await waitFor(() => expect(screen.getByLabelText('Active language')).toHaveTextContent(/^ca$/), {
        timeout: 10000,
      })
      expect(window.location.pathname).toBe('/ca/admin/processes/create')
      expect(screen.getByLabelText('Router basename')).toHaveTextContent('/ca')
      expect(document.documentElement.lang).toBe('ca')

      act(() => {
        window.history.replaceState(null, '', '/pt/admin/processes/create')
        window.dispatchEvent(new PopStateEvent('popstate'))
      })
      await waitFor(() => expect(screen.getByLabelText('Active language')).toHaveTextContent(/^pt$/))
      expect(document.documentElement.lang).toBe('pt')
    } finally {
      unmount?.()
      routesProviderStub = null
      document.documentElement.lang = previousLanguage
      window.history.replaceState(null, '', previousUrl)
      if (previousPreference === null) window.localStorage.removeItem('i18nextLng')
      else window.localStorage.setItem('i18nextLng', previousPreference)
    }
  })
  describe('switching language while translations load', () => {
    // Holds the next loadLanguages call until the returned release is called.
    const holdNextLoad = async () => {
      const actual = await vi.importActual<typeof import('./i18n')>('./i18n')
      let release: () => void = () => {}
      const gate = new Promise<void>((resolve) => {
        release = resolve
      })
      vi.mocked(loadLanguages).mockImplementationOnce(async (languages) => {
        await gate
        return actual.loadLanguages(languages)
      })
      return () => release()
    }

    let unmount: (() => void) | undefined
    let pushState: MockInstance<History['pushState']>
    let previousUrl: string
    beforeEach(async () => {
      await loadLanguages(['es', 'ca', 'fr'])
      previousUrl = window.location.href
      document.documentElement.lang = 'en'
      window.history.replaceState(null, '', '/es/admin/processes/create')
      pushState = vi.spyOn(window.history, 'pushState')
    })
    afterEach(() => {
      unmount?.()
      unmount = undefined
      pushState.mockRestore()
      routesProviderStub = null
      window.history.replaceState(null, '', previousUrl)
      window.localStorage.removeItem(PUBLIC_LANGUAGE_STORAGE_KEY)
    })

    it('keeps the URL until the language is loaded, then changes URL, basename and copy together', async () => {
      const { Providers } = await import('./Providers')
      routesProviderStub = (props) => <LanguageProbe basename={props.basename} />
      const releaseCa = await holdNextLoad()
      ;({ unmount } = render(<Providers language='es' />))
      expect(screen.getByLabelText('Router basename')).toHaveTextContent('/es')

      fireEvent.click(screen.getByRole('button', { name: 'Switch language' }))
      // Still the old router and URL: an in-app link clicked during the load lands on /es.
      expect(window.location.pathname).toBe('/es/admin/processes/create')
      expect(pushState).not.toHaveBeenCalled()
      expect(screen.getByLabelText('Active language')).toHaveTextContent(/^es$/)

      await act(async () => releaseCa())
      await waitFor(() => expect(screen.getByLabelText('Active language')).toHaveTextContent(/^ca$/))
      expect(window.location.pathname).toBe('/ca/admin/processes/create')
      expect(screen.getByLabelText('Router basename')).toHaveTextContent('/ca')
      expect(document.documentElement.lang).toBe('ca')
      expect(window.localStorage.getItem(PUBLIC_LANGUAGE_STORAGE_KEY)).toBe('ca')
      expect(pushState).toHaveBeenCalledTimes(1)
    })

    it('never pushes the URL of a switch that a later switch superseded', async () => {
      const { Providers } = await import('./Providers')
      routesProviderStub = (props) => <LanguageProbe basename={props.basename} />
      const releaseCa = await holdNextLoad()
      const releaseFr = await holdNextLoad()
      ;({ unmount } = render(<Providers language='es' />))

      fireEvent.click(screen.getByRole('button', { name: 'Switch language' }))
      fireEvent.click(screen.getByRole('button', { name: 'Switch to fr' }))
      expect(pushState).not.toHaveBeenCalled()

      await act(async () => releaseFr())
      await waitFor(() => expect(screen.getByLabelText('Active language')).toHaveTextContent(/^fr$/))
      await act(async () => releaseCa())

      expect(window.location.pathname).toBe('/fr/admin/processes/create')
      expect(pushState).toHaveBeenCalledTimes(1)
      expect(pushState.mock.calls[0][2]).toBe('/fr/admin/processes/create')
      expect(screen.getByLabelText('Router basename')).toHaveTextContent('/fr')
      expect(window.localStorage.getItem(PUBLIC_LANGUAGE_STORAGE_KEY)).toBe('fr')
    })

    it('cancels a pending switch when the current URL language is selected again', async () => {
      const { Providers } = await import('./Providers')
      routesProviderStub = (props) => <LanguageProbe basename={props.basename} />
      const releaseCa = await holdNextLoad()
      ;({ unmount } = render(<Providers language='es' />))

      fireEvent.click(screen.getByRole('button', { name: 'Switch language' }))
      fireEvent.click(screen.getByRole('button', { name: 'Switch to es' }))
      await act(async () => releaseCa())
      await act(async () => {})

      expect(pushState).not.toHaveBeenCalled()
      expect(window.location.pathname).toBe('/es/admin/processes/create')
      expect(screen.getByLabelText('Active language')).toHaveTextContent(/^es$/)
      expect(screen.getByLabelText('Router basename')).toHaveTextContent('/es')
    })

    it('lets a popstate supersede a pending switch without pushing its URL', async () => {
      const { Providers } = await import('./Providers')
      routesProviderStub = (props) => <LanguageProbe basename={props.basename} />
      const releaseCa = await holdNextLoad()
      ;({ unmount } = render(<Providers language='es' />))

      fireEvent.click(screen.getByRole('button', { name: 'Switch language' }))
      // Back/forward moves the URL first, then fires popstate.
      act(() => {
        window.history.replaceState(null, '', '/fr/admin/processes/create')
        window.dispatchEvent(new PopStateEvent('popstate'))
      })
      await waitFor(() => expect(screen.getByLabelText('Active language')).toHaveTextContent(/^fr$/))

      await act(async () => releaseCa())
      await act(async () => {})

      expect(pushState).not.toHaveBeenCalled()
      expect(window.location.pathname).toBe('/fr/admin/processes/create')
      expect(screen.getByLabelText('Active language')).toHaveTextContent(/^fr$/)
      expect(screen.getByLabelText('Router basename')).toHaveTextContent('/fr')
    })
  })
})

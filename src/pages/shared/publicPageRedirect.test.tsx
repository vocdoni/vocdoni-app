import { render, waitFor } from '@testing-library/react'

import { PUBLIC_LANGUAGE_STORAGE_KEY, persistPublicLanguagePreferenceClient } from '~i18n/public-language'
import {
  useLegacyPublicPathRedirect,
  usePreferredPublicLanguageRedirect,
  useRootLanguageRedirect,
} from './publicPageRedirect'

// The redirect hooks read runtime languages from Vike's globalContext (they run
// outside the AppEnvProvider), so stub usePageContext rather than the env hooks.
vi.mock('vike-react/usePageContext', () => ({
  usePageContext: () => ({
    globalContext: {
      appEnv: {
        LANGUAGES: {
          en: 'English',
          ca: 'Catalan',
          es: 'Spanish',
          it: 'Italian',
        },
      },
    },
  }),
}))

const TestRedirect = ({ pathname, navigate }: { pathname: string; navigate?: (url: string) => void }) => {
  usePreferredPublicLanguageRedirect({
    pathname,
    navigate,
  })

  return <div>redirect-test</div>
}

const TestRootRedirect = ({ navigate }: { navigate?: (url: string) => void }) => {
  useRootLanguageRedirect({ navigate })
  return <div>root-redirect-test</div>
}

const TestLegacyRedirect = ({ pathname, navigate }: { pathname: string; navigate?: (url: string) => void }) => {
  useLegacyPublicPathRedirect({ pathname, navigate })
  return <div>legacy-redirect-test</div>
}

describe('usePreferredPublicLanguageRedirect', () => {
  const originalNavigator = window.navigator

  beforeEach(() => {
    window.localStorage.clear()
    document.cookie = 'vocdoni-public-language=; Max-Age=0; Path=/'
    Object.defineProperty(window, 'navigator', {
      configurable: true,
      value: {
        ...originalNavigator,
        language: 'en-US',
        languages: ['en-US'],
      },
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'navigator', {
      configurable: true,
      value: originalNavigator,
    })
  })

  it('redirects localized public pages to the stored preferred language after hydration', async () => {
    const navigate = vi.fn()
    window.history.replaceState({}, '', '/it/processes/0xprocess')
    window.localStorage.setItem(PUBLIC_LANGUAGE_STORAGE_KEY, 'ca')

    render(<TestRedirect pathname='/it/processes/0xprocess' navigate={navigate} />)

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/ca/processes/0xprocess')
    })
  })

  it("does not reload into the language detector's cached browser language", async () => {
    const navigate = vi.fn()
    window.history.replaceState({}, '', '/en/processes/0xprocess')
    // i18next's browser detector caches the navigator language under this key on boot.
    window.localStorage.setItem('i18nextLng', 'ca')

    render(<TestRedirect pathname='/en/processes/0xprocess' navigate={navigate} />)

    expect(navigate).not.toHaveBeenCalled()
    expect(window.localStorage.getItem(PUBLIC_LANGUAGE_STORAGE_KEY)).toBeNull()
  })

  it('follows a language the user picked explicitly', async () => {
    const navigate = vi.fn()
    window.history.replaceState({}, '', '/en/processes/0xprocess')
    persistPublicLanguagePreferenceClient('es', {
      supportedLanguages: ['en', 'ca', 'es', 'it'],
      storage: window.localStorage,
    })

    render(<TestRedirect pathname='/en/processes/0xprocess' navigate={navigate} />)

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/es/processes/0xprocess')
    })
  })

  it('stores nothing when the visitor has not chosen a language', async () => {
    const navigate = vi.fn()
    window.history.replaceState({}, '', '/it/organization/0xabc')

    render(<TestRedirect pathname='/it/organization/0xabc' navigate={navigate} />)

    expect(navigate).not.toHaveBeenCalled()
    expect(window.localStorage.getItem(PUBLIC_LANGUAGE_STORAGE_KEY)).toBeNull()
  })

  it('keeps each link in its own language when nothing was chosen', async () => {
    const navigate = vi.fn()
    window.history.replaceState({}, '', '/en/processes/0xA')
    const { unmount } = render(<TestRedirect pathname='/en/processes/0xA' navigate={navigate} />)
    unmount()

    window.history.replaceState({}, '', '/ca/processes/0xB')
    render(<TestRedirect pathname='/ca/processes/0xB' navigate={navigate} />)

    expect(navigate).not.toHaveBeenCalled()
  })

  it('prefers the consented language cookie over a stale local storage value', async () => {
    const navigate = vi.fn()
    window.history.replaceState({}, '', '/ca/processes/0xprocess')
    window.localStorage.setItem('vocdoni-cookie-consent', 'accepted')
    window.localStorage.setItem(PUBLIC_LANGUAGE_STORAGE_KEY, 'en')
    document.cookie = 'vocdoni-public-language=ca; Path=/'

    render(<TestRedirect pathname='/ca/processes/0xprocess' navigate={navigate} />)

    await waitFor(() => {
      expect(navigate).not.toHaveBeenCalled()
    })

    expect(window.localStorage.getItem(PUBLIC_LANGUAGE_STORAGE_KEY)).toBe('ca')
  })

  it('does not redirect when the stored and current languages already match', async () => {
    const navigate = vi.fn()
    window.history.replaceState({}, '', '/en/processes/0xprocess')
    window.localStorage.setItem(PUBLIC_LANGUAGE_STORAGE_KEY, 'en')

    render(<TestRedirect pathname='/en/processes/0xprocess' navigate={navigate} />)

    await waitFor(() => {
      expect(navigate).not.toHaveBeenCalled()
    })
  })

  it('redirects / to the stored language root when available', async () => {
    const navigate = vi.fn()
    window.history.replaceState({}, '', '/')
    window.localStorage.setItem(PUBLIC_LANGUAGE_STORAGE_KEY, 'ca')

    render(<TestRootRedirect navigate={navigate} />)

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/ca')
    })
  })

  it('redirects / using browser language when there is no stored preference', async () => {
    const navigate = vi.fn()
    window.history.replaceState({}, '', '/')
    Object.defineProperty(window, 'navigator', {
      configurable: true,
      value: {
        ...originalNavigator,
        language: 'ca-ES',
        languages: ['ca-ES'],
      },
    })

    render(<TestRootRedirect navigate={navigate} />)

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/ca')
    })
    // The browser language is not a choice: storing it would pin later links to it.
    expect(window.localStorage.getItem(PUBLIC_LANGUAGE_STORAGE_KEY)).toBeNull()
  })

  it('redirects bare paths to the stored localized route after hydration', async () => {
    const navigate = vi.fn()
    window.history.replaceState({}, '', '/processes/0xprocess')
    window.localStorage.setItem(PUBLIC_LANGUAGE_STORAGE_KEY, 'ca')

    render(<TestLegacyRedirect pathname='/processes/0xprocess' navigate={navigate} />)

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/ca/processes/0xprocess')
    })
  })

  it('redirects bare auth routes to the default localized route when there is no stored language', async () => {
    const navigate = vi.fn()
    window.history.replaceState({}, '', '/account/signin')

    render(<TestLegacyRedirect pathname='/account/signin' navigate={navigate} />)

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/en/account/signin')
    })
    expect(window.localStorage.getItem(PUBLIC_LANGUAGE_STORAGE_KEY)).toBeNull()
  })
})

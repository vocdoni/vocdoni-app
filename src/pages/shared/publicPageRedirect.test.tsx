import { render, waitFor } from '@testing-library/react'

import {
  useLegacyPublicPathRedirect,
  usePreferredPublicLanguageRedirect,
  useRootLanguageRedirect,
} from './publicPageRedirect'

vi.mock('~src/app-env', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~src/app-env')>()
  return {
    ...actual,
    getLanguagesEnv: () => ({
      en: 'English',
      ca: 'Catalan',
      es: 'Spanish',
      it: 'Italian',
    }),
  }
})

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
    window.localStorage.setItem('i18nextLng', 'ca')

    render(<TestRedirect pathname='/it/processes/0xprocess' navigate={navigate} />)

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/ca/processes/0xprocess')
    })
  })

  it('stores the directly accessed localized language when no saved language exists', async () => {
    const navigate = vi.fn()
    window.history.replaceState({}, '', '/it/organization/0xabc')

    render(<TestRedirect pathname='/it/organization/0xabc' navigate={navigate} />)

    await waitFor(() => {
      expect(navigate).not.toHaveBeenCalled()
    })

    expect(window.localStorage.getItem('i18nextLng')).toBe('it')
  })

  it('does not redirect when the stored and current languages already match', async () => {
    const navigate = vi.fn()
    window.history.replaceState({}, '', '/en/processes/0xprocess')
    window.localStorage.setItem('i18nextLng', 'en')

    render(<TestRedirect pathname='/en/processes/0xprocess' navigate={navigate} />)

    await waitFor(() => {
      expect(navigate).not.toHaveBeenCalled()
    })
  })

  it('redirects / to the stored language root when available', async () => {
    const navigate = vi.fn()
    window.history.replaceState({}, '', '/')
    window.localStorage.setItem('i18nextLng', 'ca')

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
  })

  it('redirects bare paths to the stored localized route after hydration', async () => {
    const navigate = vi.fn()
    window.history.replaceState({}, '', '/processes/0xprocess')
    window.localStorage.setItem('i18nextLng', 'ca')

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
  })
})

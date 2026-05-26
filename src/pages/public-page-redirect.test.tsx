import { render } from '@testing-library/react'

let currentData: any
let currentPageContext: any
const usePreferredPublicLanguageRedirect = vi.fn()
const publicLayout = vi.fn(({ children }: { children: React.ReactNode }) => <>{children}</>)
const publicProcessPage = vi.fn((_: any) => <div>process-page</div>)

vi.mock('vike-react/useData', () => ({
  useData: () => currentData,
}))

vi.mock('vike-react/usePageContext', () => ({
  usePageContext: () => currentPageContext,
}))

vi.mock('~src/Providers', () => ({
  AppProviders: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('~elements/PublicLayout', () => ({
  default: (props: { children: React.ReactNode; pathname: string }) => publicLayout(props),
}))

vi.mock('~elements/processes/PublicPage', () => ({
  default: (props: any) => publicProcessPage(props),
}))

vi.mock('~elements/organization/PublicPage', () => ({
  default: () => <div>organization-page</div>,
}))

vi.mock('~src/pages/shared/publicPageRedirect', () => ({
  usePreferredPublicLanguageRedirect,
}))

describe('preferred public-language redirect', () => {
  const originalNavigator = window.navigator

  beforeEach(() => {
    currentData = undefined
    currentPageContext = { urlPathname: '/' }
    window.localStorage.clear()
    usePreferredPublicLanguageRedirect.mockReset()
    publicLayout.mockClear()
    publicProcessPage.mockClear()
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
    vi.restoreAllMocks()
  })

  it('passes the language-prefixed pathname to the public process page layout', async () => {
    currentData = {
      id: '0xprocess',
      election: {},
      organization: { address: '0xabc' },
      meta: {
        language: 'en',
        alternates: [
          { hrefLang: 'en', href: 'http://localhost:3000/en/processes/0xprocess' },
          { hrefLang: 'ca', href: 'http://localhost:3000/ca/processes/0xprocess' },
        ],
      },
    }
    currentPageContext = { urlPathname: '/en/processes/0xprocess' }

    const { default: ProcessPage } = await import('./@lang/processes/@id/+Page')

    render(<ProcessPage />)

    expect(usePreferredPublicLanguageRedirect).toHaveBeenCalledWith({
      pathname: '/en/processes/0xprocess',
    })
    expect(publicLayout).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/en/processes/0xprocess',
        hideAuthButton: true,
        publicLanguageLinks: {
          en: 'http://localhost:3000/en/processes/0xprocess',
          ca: 'http://localhost:3000/ca/processes/0xprocess',
        },
      })
    )
    expect(publicProcessPage).toHaveBeenCalledWith(
      expect.objectContaining({
        election: {},
        organization: { address: '0xabc' },
      })
    )
  })

  it('passes the language-prefixed pathname to the public organization page layout', async () => {
    currentData = {
      address: '0xabc',
      organization: { address: '0xabc' },
      electionsPage: { elections: [] },
      meta: {
        language: 'en',
        alternates: [
          { hrefLang: 'en', href: 'http://localhost:3000/en/organization/0xabc' },
          { hrefLang: 'ca', href: 'http://localhost:3000/ca/organization/0xabc' },
        ],
      },
    }
    currentPageContext = { urlPathname: '/en/organization/0xabc' }

    const { default: OrganizationPage } = await import('./@lang/organization/@address/+Page')

    render(<OrganizationPage />)

    expect(usePreferredPublicLanguageRedirect).toHaveBeenCalledWith({
      pathname: '/en/organization/0xabc',
    })
    expect(publicLayout).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/en/organization/0xabc',
      })
    )
  })

  it('does not redirect already localized public pages', async () => {
    currentData = {
      id: '0xprocess',
      election: {},
      organization: { address: '0xabc' },
      meta: {
        language: 'ca',
        alternates: [
          { hrefLang: 'en', href: 'http://localhost:3000/en/processes/0xprocess' },
          { hrefLang: 'ca', href: 'http://localhost:3000/ca/processes/0xprocess' },
        ],
      },
    }
    currentPageContext = { urlPathname: '/ca/processes/0xprocess' }

    const { default: ProcessPage } = await import('./@lang/processes/@id/+Page')

    render(<ProcessPage />)

    expect(usePreferredPublicLanguageRedirect).toHaveBeenCalledWith({
      pathname: '/ca/processes/0xprocess',
    })
  })
})

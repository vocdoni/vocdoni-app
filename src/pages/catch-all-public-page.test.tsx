import { render } from '@testing-library/react'

let currentPageContext: any
const providers = vi.fn((_props?: { basename?: string; language?: string }) => <div>providers</div>)
const useRootLanguageRedirect = vi.fn()
const usePreferredPublicLanguageRedirect = vi.fn()
const useLegacyPublicPathRedirect = vi.fn()

vi.mock('vike-react/usePageContext', () => ({
  usePageContext: () => currentPageContext,
}))

vi.mock('~src/Providers', () => ({
  Providers: (props: { basename?: string; language?: string }) => providers(props),
}))

vi.mock('~src/pages/shared/publicPageRedirect', () => ({
  useRootLanguageRedirect,
  usePreferredPublicLanguageRedirect,
  useLegacyPublicPathRedirect,
}))

describe('public catch-all page', () => {
  beforeEach(() => {
    currentPageContext = { urlPathname: '/' }
    providers.mockClear()
    useRootLanguageRedirect.mockReset()
    usePreferredPublicLanguageRedirect.mockReset()
    useLegacyPublicPathRedirect.mockReset()
  })

  it('keeps / as a redirect-only entrypoint', async () => {
    const { default: Page } = await import('./@catchAll/+Page')

    render(<Page />)

    expect(useRootLanguageRedirect).toHaveBeenCalledWith({})
    expect(providers).not.toHaveBeenCalled()
  })

  it('redirects bare public paths into the localized route space', async () => {
    currentPageContext = { urlPathname: '/plans' }

    const { default: Page } = await import('./@catchAll/+Page')

    render(<Page />)

    expect(useLegacyPublicPathRedirect).toHaveBeenCalledWith({
      pathname: '/plans',
    })
    expect(providers).not.toHaveBeenCalled()
  })

  it('redirects bare auth paths into the localized route space', async () => {
    currentPageContext = { urlPathname: '/account/signin' }

    const { default: Page } = await import('./@catchAll/+Page')

    render(<Page />)

    expect(useLegacyPublicPathRedirect).toHaveBeenCalledWith({
      pathname: '/account/signin',
    })
    expect(providers).not.toHaveBeenCalled()
  })
})

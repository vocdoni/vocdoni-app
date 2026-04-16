import { render } from '@testing-library/react'

let currentPageContext: any
const providers = vi.fn((_props?: { basename?: string; language?: string }) => <div>providers</div>)
const useRootLanguageRedirect = vi.fn()
const usePreferredPublicLanguageRedirect = vi.fn()

vi.mock('vike-react/usePageContext', () => ({
  usePageContext: () => currentPageContext,
}))

vi.mock('~src/Providers', () => ({
  Providers: (props: { basename?: string; language?: string }) => providers(props),
}))

vi.mock('~src/pages/shared/publicPageRedirect', () => ({
  useRootLanguageRedirect,
  usePreferredPublicLanguageRedirect,
}))

describe('public catch-all page', () => {
  beforeEach(() => {
    currentPageContext = { urlPathname: '/' }
    providers.mockClear()
    useRootLanguageRedirect.mockReset()
    usePreferredPublicLanguageRedirect.mockReset()
  })

  it('keeps / as a redirect-only entrypoint', async () => {
    const { default: Page } = await import('./@catchAll/+Page')

    render(<Page />)

    expect(useRootLanguageRedirect).toHaveBeenCalledWith({})
    expect(providers).not.toHaveBeenCalled()
  })

  it('renders bare english public paths through the SPA shell without a localized basename', async () => {
    currentPageContext = { urlPathname: '/plans' }

    const { default: Page } = await import('./@catchAll/+Page')

    render(<Page />)

    expect(usePreferredPublicLanguageRedirect).toHaveBeenCalledWith({
      pathname: '/plans',
    })
    expect(providers).toHaveBeenCalledWith({})
  })

  it('keeps auth paths unlocalized', async () => {
    currentPageContext = { urlPathname: '/account/signin' }

    const { default: Page } = await import('./@catchAll/+Page')

    render(<Page />)

    expect(usePreferredPublicLanguageRedirect).not.toHaveBeenCalled()
    expect(providers).toHaveBeenCalledWith({})
  })
})

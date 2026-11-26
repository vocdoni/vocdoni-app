import { renderToStaticMarkup } from 'react-dom/server'
import { vi } from 'vitest'

const pageContext = {
  abortStatusCode: 404,
  abortReason: undefined,
  routeParams: {},
  urlPathname: '/processes/0xabc',
  globalContext: {},
}

vi.mock('vike-react/usePageContext', () => ({
  usePageContext: () => pageContext,
}))

vi.mock('~elements/PublicLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('~elements/Error', () => ({
  ErrorView: () => <div>error-view</div>,
}))

// The error page renders the public shell, so its first paint must read the voter key, the one the shell follows.
describe('Vike error page, server render', () => {
  it('reads the voter colour mode key, not the dashboard one', async () => {
    const { default: ErrorPage } = await import('./+Page')

    const html = renderToStaticMarkup(<ErrorPage />)

    expect(html).toContain('theme-preference-voter')
    expect(html).not.toContain('"theme-preference"')
    expect(html).not.toContain("'theme-preference'")
  }, 30000)
})

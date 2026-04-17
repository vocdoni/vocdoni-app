import { render } from '@testing-library/react'

let currentPageContext: any
const publicLayout = vi.fn(({ children }: { children: React.ReactNode }) => <>{children}</>)
const appProviders = vi.fn(({ children }: { children: React.ReactNode }) => <>{children}</>)
const errorView = vi.fn((_: { isNotFound?: boolean; message?: string; returnHomeHref?: string }) => (
  <div>error-view</div>
))

vi.mock('vike-react/usePageContext', () => ({
  usePageContext: () => currentPageContext,
}))

vi.mock('~src/Providers', () => ({
  AppProviders: (props: { children: React.ReactNode; language?: string }) => appProviders(props),
}))

vi.mock('~elements/PublicLayout', () => ({
  default: (props: { children: React.ReactNode; pathname: string }) => publicLayout(props),
}))

vi.mock('~elements/Error', () => ({
  ErrorView: (props: { isNotFound?: boolean; message?: string; returnHomeHref?: string }) => errorView(props),
}))

describe('Vike error page', () => {
  beforeEach(() => {
    currentPageContext = {
      abortStatusCode: 500,
      abortReason: undefined,
      routeParams: {},
      urlPathname: '/processes/0xabc',
    }
    publicLayout.mockClear()
    appProviders.mockClear()
    errorView.mockClear()
  })

  it('normalizes 404 aborts into the shared not-found view inside the public shell', async () => {
    currentPageContext = {
      abortStatusCode: 404,
      abortReason: 'missing',
      routeParams: { lang: 'ca' },
      urlPathname: '/ca/processes/0xabc',
    }

    const { default: ErrorPage } = await import('./+Page')

    render(<ErrorPage />)

    expect(appProviders).toHaveBeenCalledWith(expect.objectContaining({ language: 'ca' }))
    expect(publicLayout).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/ca/processes/0xabc' }))
    expect(errorView).toHaveBeenCalledWith(
      expect.objectContaining({
        isNotFound: true,
        returnHomeHref: '/ca',
      })
    )
  })

  it('passes string abort reasons through to the shared generic error view', async () => {
    currentPageContext.abortReason = 'Server exploded'

    const { default: ErrorPage } = await import('./+Page')

    render(<ErrorPage />)

    expect(errorView).toHaveBeenCalledWith(
      expect.objectContaining({
        isNotFound: false,
        message: 'Server exploded',
      })
    )
  })

  it('passes Error abort reasons through to the shared generic error view', async () => {
    currentPageContext.abortReason = new Error('Boom')

    const { default: ErrorPage } = await import('./+Page')

    render(<ErrorPage />)

    expect(errorView).toHaveBeenCalledWith(
      expect.objectContaining({
        isNotFound: false,
        message: 'Boom',
      })
    )
  })

  it('falls back to the existing generic copy when no abort reason is available', async () => {
    const { default: ErrorPage } = await import('./+Page')

    render(<ErrorPage />)

    expect(errorView).toHaveBeenCalledWith(
      expect.objectContaining({
        isNotFound: false,
        message: 'Error loading the page',
      })
    )
  })
})

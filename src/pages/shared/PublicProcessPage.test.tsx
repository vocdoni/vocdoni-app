import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { renderToString } from 'react-dom/server'
import type { PublicProcessPageData } from '~src/ssr/public-pages'
import PublicProcessPage from './PublicProcessPage'
import PublicProcessSummaryPage from './PublicProcessSummaryPage'

// The page as Vike renders it: real AppProviders, Theme and PublicLayout; the process views, the vike hooks and the
// providers that need a backend or a wallet are stubbed (as in Providers.test.tsx).
const page = vi.hoisted(() => ({ data: undefined as unknown, viewProps: vi.fn() }))

vi.mock('vike-react/useData', () => ({ useData: () => page.data }))
vi.mock('vike-react/usePageContext', async () => {
  const { buildAppEnv } = await import('~src/app-env-build')
  const pageContext = { urlPathname: '/en/processes/p1', globalContext: { appEnv: buildAppEnv({}) } }
  return { usePageContext: () => pageContext }
})
vi.mock('~src/pages/shared/publicPageRedirect', () => ({ usePreferredPublicLanguageRedirect: () => {} }))
vi.mock('~elements/processes/PublicPage', () => ({
  default: (props: Record<string, unknown>) => {
    page.viewProps(props)
    return <div>process-view</div>
  },
}))
vi.mock('~elements/processes/PublicSummary', () => ({ default: () => <div>process-view</div> }))
vi.mock('wagmi', () => ({ WagmiProvider: ({ children }: { children: ReactNode }) => <>{children}</> }))
vi.mock('~src/constants/wagmi', () => ({ wagmiConfig: {} }))
vi.mock('~components/Layout/ConnectionToast', () => ({
  ConnectionToastProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))
vi.mock('~components/Auth/AuthContext', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))
vi.mock('~components/Account/SaasAccountProvider', () => ({
  SaasAccountProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))
vi.mock('~components/AnalyticsProvider', () => ({
  AnalyticsProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))
vi.mock('~components/Cookies/CookieConsent', () => ({ CookieConsent: () => null }))

const LOGO = 'https://cdn.example/acme.svg'

const saasData = (brand: PublicProcessPageData['brand']) =>
  ({
    era: 'saas',
    id: 'p1',
    election: { id: 'p1', orgAddress: 'abc' },
    organization: { address: '0xabc', name: { default: 'Acme' }, logo: { default: LOGO }, color: '#f5d90a' },
    brand,
    meta: { language: 'en', alternates: [] },
  }) as unknown as PublicProcessPageData

// Chakra writes the system's CSS variables into <style> tags in the document head (removed on unmount).
const pageCss = () => [...document.head.querySelectorAll('style')].map((style) => style.textContent).join('\n')

describe('voting page', () => {
  it('paints a branded vote in the organisation colour and hands the brand to the voter page', async () => {
    const brand = { branded: true, name: 'Acme', logo: LOGO, color: '#f5d90a' }
    page.data = saasData(brand)
    render(<PublicProcessPage />)

    expect(await screen.findByText('process-view')).toBeInTheDocument()
    expect(page.viewProps).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'p1', brand }))
    expect(pageCss()).toMatch(/--chakra-colors-brand-500:\s*#f5d90a/)
  }, 30000)

  it('keeps Fil blue on a vote without the add-on, and no longer wraps the voter page in the public layout', async () => {
    page.data = saasData({ branded: false, name: 'Acme' })
    render(<PublicProcessPage />)

    expect(await screen.findByText('process-view')).toBeInTheDocument()
    expect(pageCss()).toMatch(/--chakra-colors-brand-500:\s*#1d62e9/)
    expect(pageCss()).not.toMatch(/#f5d90a/)
    expect(document.querySelector('header')).toBeNull()
    expect(document.querySelector('footer')).toBeNull()
  }, 30000)

  it('keeps an archive vote in the public layout', async () => {
    page.data = {
      era: 'archive',
      id: 'p1',
      legacyElection: {},
      legacyOrganization: {},
      brand: { branded: false, name: 'Acme' },
      meta: { language: 'en', alternates: [] },
    } as unknown as PublicProcessPageData
    render(<PublicProcessPage />)

    expect(await screen.findByText('process-view')).toBeInTheDocument()
    expect(page.viewProps).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'p1', legacyElection: {} }))
    expect(document.querySelector('header')).not.toBeNull()
    expect(document.querySelector('footer')).not.toBeNull()
  }, 30000)
})

describe('summary page brand', () => {
  it('paints a branded vote with the organisation logo and colour', async () => {
    page.data = saasData({ branded: true, name: 'Acme', logo: LOGO, color: '#f5d90a' })
    render(<PublicProcessSummaryPage />)

    expect(await screen.findByText('process-view')).toBeInTheDocument()
    expect(screen.getByAltText('Acme logo')).toHaveAttribute('src', LOGO)
    expect(pageCss()).toMatch(/--chakra-colors-brand-500:\s*#f5d90a/)
  }, 30000)

  it('keeps the Vocdoni mark and Fil blue on a vote without the add-on', async () => {
    page.data = saasData({ branded: false, name: 'Acme' })
    render(<PublicProcessSummaryPage />)

    expect(await screen.findByText('process-view')).toBeInTheDocument()
    expect(screen.queryByAltText('Acme logo')).toBeNull()
    expect(screen.getAllByRole('img', { name: 'Vocdoni logo', hidden: true }).length).toBeGreaterThanOrEqual(2)
    expect(pageCss()).toMatch(/--chakra-colors-brand-500:\s*#1d62e9/)
    expect(pageCss()).not.toMatch(/#f5d90a/)
  }, 30000)

  // The logo is in the markup the server sends, not swapped in after hydration.
  it('server-renders the organisation logo', () => {
    page.data = saasData({ branded: true, name: 'Acme', logo: LOGO, color: '#f5d90a' })
    const html = renderToString(<PublicProcessSummaryPage />)

    expect(html).toContain(LOGO)
    expect(html).toContain('Acme logo')
  })
})

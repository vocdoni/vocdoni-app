import { render, screen } from '@testing-library/react'
import { CookieConsent } from './CookieConsent'

// Minimal stubs so the banner renders without its full provider tree.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_key: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? _key }),
}))

// Stub Chakra components so the test does not need a ChakraProvider.
vi.mock('@chakra-ui/react', () => ({
  AlertRoot: ({ children, ...props }: any) => (
    <div role='dialog' {...props}>
      {children}
    </div>
  ),
  AlertDescription: ({ children }: any) => <span>{children}</span>,
  AlertTitle: ({ children }: any) => <strong>{children}</strong>,
  Box: ({ children }: any) => <div>{children}</div>,
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  HStack: ({ children }: any) => <div>{children}</div>,
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}))

const appEnv = vi.hoisted(() => ({
  PRIVACY_POLICY_URL: 'https://vocdoni.io/privacy',
  HOME_PROCESS_ID: '0x1234',
  PROCESS_IDS: undefined as string | undefined,
  LANGUAGES: { ca: 'Català', es: 'Español' },
}))

vi.mock('~src/app-env', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~src/app-env')>()
  return {
    ...actual,
    useAppEnv: () => appEnv,
    useLanguagesEnv: () => actual.normalizeLanguages(appEnv.LANGUAGES),
  }
})

vi.mock('~i18n/public-language', () => ({
  getStoredPublicLanguage: () => null,
  persistPublicLanguageCookie: vi.fn(),
  clearPublicLanguageCookie: vi.fn(),
}))

const clearConsentCookie = () => {
  document.cookie = 'vocdoni-cookie-consent=; Path=/; Max-Age=0'
}

beforeEach(() => {
  clearConsentCookie()
  localStorage.clear()
  window.history.pushState({}, '', '/')
})

afterEach(() => {
  appEnv.PROCESS_IDS = undefined
})

describe('CookieConsent banner visibility', () => {
  it('renders the banner on a non-voting route when no consent is stored', () => {
    window.history.pushState({}, '', '/admin')
    render(<CookieConsent />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render the banner when consent is already stored', () => {
    window.history.pushState({}, '', '/admin')
    document.cookie = 'vocdoni-cookie-consent=accepted; Path=/'
    render(<CookieConsent />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not render the banner on a /processes/:id voting page', () => {
    window.history.pushState({}, '', '/processes/0xabc123')
    render(<CookieConsent />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not render the banner on a localized /ca/processes/:id voting page', () => {
    window.history.pushState({}, '', '/ca/processes/0xabc123')
    render(<CookieConsent />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not render the banner on the HOME_PROCESS_ID root "/"', () => {
    // appEnv.HOME_PROCESS_ID = '0x1234' is already set
    window.history.pushState({}, '', '/')
    render(<CookieConsent />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not render the banner on "/"  when PROCESS_IDS is active', () => {
    appEnv.PROCESS_IDS = '0xabc,0xdef'
    window.history.pushState({}, '', '/')
    render(<CookieConsent />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the banner on "/admin" even when PROCESS_IDS is active', () => {
    appEnv.PROCESS_IDS = '0xabc,0xdef'
    window.history.pushState({}, '', '/admin')
    render(<CookieConsent />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

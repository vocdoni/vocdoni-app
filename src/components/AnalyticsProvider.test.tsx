import { render } from '@testing-library/react'
import { AnalyticsProvider } from './AnalyticsProvider'

// The provider pulls the whole dashboard context in; stub every source so the
// test only exercises what it reports to PostHog.
const setPosthogOrganization = vi.fn()
const registerPosthogSuperProperties = vi.fn()
const initializePosthog = vi.fn()
const initializePlausible = vi.fn()
const initializeGTM = vi.fn()

vi.mock('~utils/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~utils/analytics')>()
  return {
    ...actual,
    initializePlausible: (...args: unknown[]) => initializePlausible(...args),
    initializeGTM: (...args: unknown[]) => initializeGTM(...args),
    initializePosthog: (...args: unknown[]) => initializePosthog(...args),
    applyPosthogConsent: vi.fn(),
    identifyPosthogUser: vi.fn(),
    resetPosthogUser: vi.fn(),
    setPosthogSessionRecording: vi.fn(),
    setPosthogOrganization: (...args: unknown[]) => setPosthogOrganization(...args),
    registerPosthogSuperProperties: (...args: unknown[]) => registerPosthogSuperProperties(...args),
  }
})

const appEnv = vi.hoisted(() => ({
  POSTHOG_KEY: 'phc_test',
  PLAUSIBLE_DOMAIN: 'app.vocdoni.io',
  GTM_CONTAINER_ID: 'GTM-TEST',
  HOME_PROCESS_ID: '0x1234',
  LANGUAGES: { ca: 'Català' },
}))

vi.mock('~src/app-env', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~src/app-env')>()
  return {
    ...actual,
    useAppEnv: () => appEnv,
    // The real hook reads the module-internal useAppEnv, not the stub above.
    useLanguagesEnv: () => actual.normalizeLanguages(appEnv.LANGUAGES),
  }
})
vi.mock('~components/Auth/useAuth', () => ({ useAuth: () => ({ isAuthenticated: true }) }))
vi.mock('~queries/account', () => ({ useProfile: () => ({ data: undefined }) }))
vi.mock('~components/Auth/Subscription', () => ({ useSubscription: () => ({ subscription: undefined }) }))
vi.mock('~components/Account/SaasAccountProvider', () => ({
  useSaasAccount: () => ({
    organization: {
      address: '0xabc',
      type: 'association',
      country: 'ES',
      size: '10',
      createdAt: '2026-01-01',
      account: { name: { default: 'Acme Coop' } },
    },
  }),
}))

// jsdom starts at `/`, which the mocked HOME_PROCESS_ID turns into the voting
// homepage — where the provider must initialize nothing. Every test below
// exercises the dashboard, so put the document on a dashboard path first.
beforeEach(() => {
  window.history.pushState({}, '', '/admin')
})

describe('AnalyticsProvider organization reporting', () => {
  beforeEach(() => {
    setPosthogOrganization.mockClear()
    registerPosthogSuperProperties.mockClear()
    initializePosthog.mockClear()
    localStorage.clear()
  })

  // Without a `name` property PostHog labels the group with its key, so every
  // organization shows up as a bare address in insights.
  it('sends the organization name as the group display name', () => {
    render(<AnalyticsProvider>{null}</AnalyticsProvider>)

    expect(setPosthogOrganization).toHaveBeenCalledWith('0xabc', expect.objectContaining({ name: 'Acme Coop' }))
  })

  // Group properties need the group analytics add-on to be queryable; the super
  // property lands on every event regardless.
  it('registers the organization name as a super property', () => {
    render(<AnalyticsProvider>{null}</AnalyticsProvider>)

    expect(registerPosthogSuperProperties).toHaveBeenCalledWith(
      expect.objectContaining({ org_address: '0xabc', org_name: 'Acme Coop' })
    )
  })
})

it('passes runtime voting-homepage configuration to the PostHog guard', () => {
  render(<AnalyticsProvider>{null}</AnalyticsProvider>)

  expect(initializePosthog).toHaveBeenCalledWith(
    expect.objectContaining({ homeProcessId: '0x1234', supportedLanguages: ['ca'] })
  )
})

// The init effect keys on the languages map; a per-render dependency would
// restart every sink on each render of the dashboard tree.
it('does not restart the analytics sinks when the provider re-renders', () => {
  initializePosthog.mockClear()
  initializePlausible.mockClear()
  const { rerender } = render(<AnalyticsProvider>{null}</AnalyticsProvider>)

  rerender(<AnalyticsProvider>{null}</AnalyticsProvider>)

  expect(initializePosthog).toHaveBeenCalledTimes(1)
  expect(initializePlausible).toHaveBeenCalledTimes(1)
})

// The provider mounts on the public voting pages too, so no sink may start
// there — not just PostHog.
describe.each(['/ca/processes/0x1234', '/ca/processes/0x1234/summary', '/', '/ca'])(
  'AnalyticsProvider on the voting page %s',
  (pathname) => {
    beforeEach(() => {
      initializePosthog.mockClear()
      initializePlausible.mockClear()
      initializeGTM.mockClear()
      window.history.pushState({}, '', pathname)
    })

    it('initializes no analytics sink', () => {
      render(<AnalyticsProvider>{null}</AnalyticsProvider>)

      expect(initializePosthog).not.toHaveBeenCalled()
      expect(initializePlausible).not.toHaveBeenCalled()
      expect(initializeGTM).not.toHaveBeenCalled()
    })
  }
)

describe('AnalyticsProvider consent handling', () => {
  beforeEach(() => {
    initializePosthog.mockClear()
    localStorage.clear()
  })

  it('passes an explicit acceptance through', () => {
    localStorage.setItem('vocdoni-cookie-consent', 'accepted')

    render(<AnalyticsProvider>{null}</AnalyticsProvider>)

    expect(initializePosthog).toHaveBeenCalledWith(expect.objectContaining({ consent: 'accepted' }))
  })

  // The stored value is user-editable; an unrecognised one must not be trusted
  // as a decision either way.
  it('treats an unrecognised stored value as no decision', () => {
    localStorage.setItem('vocdoni-cookie-consent', 'true')

    render(<AnalyticsProvider>{null}</AnalyticsProvider>)

    expect(initializePosthog).toHaveBeenCalledWith(expect.objectContaining({ consent: null }))
  })
})

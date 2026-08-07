import { render } from '@testing-library/react'
import { AnalyticsProvider } from './AnalyticsProvider'

// The provider pulls the whole dashboard context in; stub every source so the
// test only exercises what it reports to PostHog.
const setPosthogOrganization = vi.fn()
const registerPosthogSuperProperties = vi.fn()
const initializePosthog = vi.fn()

vi.mock('~utils/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~utils/analytics')>()
  return {
    ...actual,
    initializePlausible: vi.fn(),
    initializeGTM: vi.fn(),
    initializePosthog: (...args: unknown[]) => initializePosthog(...args),
    applyPosthogConsent: vi.fn(),
    identifyPosthogUser: vi.fn(),
    resetPosthogUser: vi.fn(),
    setPosthogSessionRecording: vi.fn(),
    setPosthogOrganization: (...args: unknown[]) => setPosthogOrganization(...args),
    registerPosthogSuperProperties: (...args: unknown[]) => registerPosthogSuperProperties(...args),
  }
})

vi.mock('~src/app-env', () => ({ useAppEnv: () => ({ POSTHOG_KEY: 'phc_test' }) }))
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

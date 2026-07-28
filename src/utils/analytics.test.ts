const mockPlausibleInit = vi.fn()
const mockPlausibleTrack = vi.fn()

vi.mock('@plausible-analytics/tracker', () => ({
  init: mockPlausibleInit,
  track: mockPlausibleTrack,
}))

const mockGtmInitialize = vi.fn()
const mockGtmDataLayer = vi.fn()

vi.mock('react-gtm-module', () => ({
  initialize: mockGtmInitialize,
  dataLayer: mockGtmDataLayer,
}))

const mockPosthog = {
  init: vi.fn(),
  capture: vi.fn(),
  identify: vi.fn(),
  reset: vi.fn(),
  group: vi.fn(),
  register: vi.fn(),
  set_config: vi.fn(),
  opt_in_capturing: vi.fn(),
  opt_out_capturing: vi.fn(),
  has_opted_out_capturing: vi.fn(() => false),
}

vi.mock('posthog-js', () => ({
  default: mockPosthog,
}))

describe('analytics initialization', () => {
  beforeEach(() => {
    vi.resetModules()
    mockPlausibleInit.mockClear()
    mockPlausibleTrack.mockClear()
    mockGtmInitialize.mockClear()
    mockGtmDataLayer.mockClear()
  })

  it('adds analytics client id to plausible custom properties on init', async () => {
    const { initializePlausible } = await import('./analytics')

    initializePlausible({ domain: 'example.com' }, 'client-1')
    await vi.waitFor(() => expect(mockPlausibleInit).toHaveBeenCalledTimes(1))

    const config = mockPlausibleInit.mock.calls[0][0]
    expect(config.customProperties).toEqual({ client: 'client-1' })
  })

  it('sets analytics client id in the GTM dataLayer on init', async () => {
    const { initializeGTM } = await import('./analytics')

    initializeGTM({ gtmId: 'GTM-XXXX' }, 'client-1')
    await vi.waitFor(() => expect(mockGtmInitialize).toHaveBeenCalledTimes(1))

    expect(mockGtmDataLayer).toHaveBeenCalledWith({
      dataLayer: { client: 'client-1' },
    })
  })
})

describe('analytics error handling', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.resetModules()
    mockPlausibleInit.mockReset()
    mockPlausibleTrack.mockReset()
    mockGtmInitialize.mockReset()
    mockGtmDataLayer.mockReset()
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  it('catches and logs an error when GTM initialize throws', async () => {
    mockGtmInitialize.mockImplementationOnce(() => {
      throw new Error('GTM init failed')
    })
    const { initializeGTM } = await import('./analytics')

    initializeGTM({ gtmId: 'GTM-XXXX' })

    await vi.waitFor(() => expect(consoleSpy).toHaveBeenCalledWith('Failed to initialize GTM:', expect.any(Error)))
  })

  it('catches and logs an error when Plausible init throws', async () => {
    mockPlausibleInit.mockImplementationOnce(() => {
      throw new Error('Plausible init failed')
    })
    const { initializePlausible } = await import('./analytics')

    initializePlausible({ domain: 'example.com' })

    await vi.waitFor(() =>
      expect(consoleSpy).toHaveBeenCalledWith('Failed to initialize Plausible:', expect.any(Error))
    )
  })

  it('catches and logs an error when Plausible track throws', async () => {
    mockPlausibleTrack.mockImplementationOnce(() => {
      throw new Error('Plausible track failed')
    })
    const { initializePlausible, trackPlausibleEvent } = await import('./analytics')

    initializePlausible({ domain: 'example.com' })
    await vi.waitFor(() => expect(mockPlausibleInit).toHaveBeenCalledTimes(1))

    trackPlausibleEvent({ name: 'Signup' })

    await vi.waitFor(() =>
      expect(consoleSpy).toHaveBeenCalledWith('Failed to track Plausible event:', expect.any(Error))
    )
  })

  it('catches and logs an error when GTM track dataLayer throws', async () => {
    const { initializeGTM, trackGTMEvent } = await import('./analytics')

    initializeGTM({ gtmId: 'GTM-XXXX' })
    await vi.waitFor(() => expect(mockGtmInitialize).toHaveBeenCalledTimes(1))

    mockGtmDataLayer.mockImplementationOnce(() => {
      throw new Error('GTM dataLayer failed')
    })
    trackGTMEvent({ name: 'Signup' })

    await vi.waitFor(() => expect(consoleSpy).toHaveBeenCalledWith('Failed to track GTM event:', expect.any(Error)))
  })
})

describe('posthog voting-path detection', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('matches public voting routes with and without language prefixes', async () => {
    const { isVotingPath } = await import('./analytics')

    expect(isVotingPath('/processes/0x1234')).toBe(true)
    expect(isVotingPath('/processes/0x1234/summary')).toBe(true)
    expect(isVotingPath('/es/processes/0x1234')).toBe(true)
    expect(isVotingPath('/pt-br/processes/0x1234/summary')).toBe(true)
  })

  it('does not match non-voting routes', async () => {
    const { isVotingPath } = await import('./analytics')

    expect(isVotingPath('/')).toBe(false)
    expect(isVotingPath('/processes')).toBe(false)
    expect(isVotingPath('/admin/processes/all')).toBe(false)
    expect(isVotingPath('/admin/process/0x1234')).toBe(false)
    expect(isVotingPath('/organization/0x1234')).toBe(false)
    expect(isVotingPath('/es/organization/0x1234')).toBe(false)
  })
})

describe('posthog url sanitization', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('strips sensitive query params from urls', async () => {
    const { sanitizeAnalyticsUrl } = await import('./analytics')

    expect(sanitizeAnalyticsUrl('https://app.vocdoni.io/account/verify?email=a%40b.com&code=1234&foo=bar')).toBe(
      'https://app.vocdoni.io/account/verify?foo=bar'
    )
    expect(sanitizeAnalyticsUrl('https://app.vocdoni.io/account/password/reset?token=secret')).toBe(
      'https://app.vocdoni.io/account/password/reset'
    )
  })

  it('leaves clean or unparseable urls untouched', async () => {
    const { sanitizeAnalyticsUrl } = await import('./analytics')

    expect(sanitizeAnalyticsUrl('https://app.vocdoni.io/admin?page=2')).toBe('https://app.vocdoni.io/admin?page=2')
    expect(sanitizeAnalyticsUrl('not a url')).toBe('not a url')
  })
})

describe('posthog before_send guard', () => {
  beforeEach(() => {
    vi.resetModules()
    window.history.pushState({}, '', '/')
  })

  it('drops any event captured on a voting route', async () => {
    const { posthogBeforeSend } = await import('./analytics')

    const event = { event: '$pageview', properties: { $current_url: 'https://app.vocdoni.io/es/processes/0x1234' } }
    expect(posthogBeforeSend(event as any)).toBeNull()
  })

  it('drops events without a url when the window is on a voting route', async () => {
    const { posthogBeforeSend } = await import('./analytics')

    window.history.pushState({}, '', '/processes/0x1234')
    const event = { event: '$snapshot', properties: {} }
    expect(posthogBeforeSend(event as any)).toBeNull()
  })

  it('sanitizes urls on allowed events', async () => {
    const { posthogBeforeSend } = await import('./analytics')

    const event = {
      event: '$pageview',
      properties: {
        $current_url: 'https://app.vocdoni.io/account/verify?email=a%40b.com',
        $referrer: 'https://app.vocdoni.io/account/signup?email=a%40b.com',
      },
    }
    const result = posthogBeforeSend(event as any)
    expect(result?.properties?.$current_url).toBe('https://app.vocdoni.io/account/verify')
    expect(result?.properties?.$referrer).toBe('https://app.vocdoni.io/account/signup')
  })

  it('returns null for null events', async () => {
    const { posthogBeforeSend } = await import('./analytics')

    expect(posthogBeforeSend(null)).toBeNull()
  })
})

describe('posthog initialization', () => {
  beforeEach(() => {
    vi.resetModules()
    Object.values(mockPosthog).forEach((fn) => fn.mockClear())
    mockPosthog.has_opted_out_capturing.mockReturnValue(false)
    window.history.pushState({}, '', '/')
  })

  it('initializes cookieless (memory persistence) before consent', async () => {
    const { initializePosthog } = await import('./analytics')

    initializePosthog({ key: 'phc_test', consent: null })
    await vi.waitFor(() => expect(mockPosthog.init).toHaveBeenCalledTimes(1))

    const [key, config] = mockPosthog.init.mock.calls[0]
    expect(key).toBe('phc_test')
    expect(config.api_host).toBe('https://eu.i.posthog.com')
    expect(config.persistence).toBe('memory')
    expect(config.person_profiles).toBe('identified_only')
    expect(config.disable_session_recording).toBe(true)
  })

  it('initializes with cookie persistence when consent was already accepted', async () => {
    const { initializePosthog } = await import('./analytics')

    initializePosthog({ key: 'phc_test', host: 'https://relay.vocdoni.io', consent: 'accepted' })
    await vi.waitFor(() => expect(mockPosthog.init).toHaveBeenCalledTimes(1))

    const [, config] = mockPosthog.init.mock.calls[0]
    expect(config.api_host).toBe('https://relay.vocdoni.io')
    expect(config.persistence).toBe('localStorage+cookie')
  })

  it('registers the analytics client id as a super property', async () => {
    const { initializePosthog } = await import('./analytics')

    initializePosthog({ key: 'phc_test', analyticsClientId: 'client-1', consent: null })
    await vi.waitFor(() => expect(mockPosthog.register).toHaveBeenCalledWith({ client: 'client-1' }))
  })

  it('does not initialize without a key or when consent was rejected', async () => {
    const { initializePosthog } = await import('./analytics')

    initializePosthog({ key: '', consent: null })
    initializePosthog({ key: 'phc_test', consent: 'rejected' })

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(mockPosthog.init).not.toHaveBeenCalled()
  })

  it('never initializes on a public voting route', async () => {
    const { initializePosthog } = await import('./analytics')

    window.history.pushState({}, '', '/ca/processes/0x1234')
    initializePosthog({ key: 'phc_test', consent: 'accepted' })

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(mockPosthog.init).not.toHaveBeenCalled()
  })

  it('only initializes once', async () => {
    const { initializePosthog } = await import('./analytics')

    initializePosthog({ key: 'phc_test', consent: null })
    initializePosthog({ key: 'phc_test', consent: null })
    await vi.waitFor(() => expect(mockPosthog.init).toHaveBeenCalledTimes(1))
  })

  it('catches and logs an error when init throws', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockPosthog.init.mockImplementationOnce(() => {
      throw new Error('PostHog init failed')
    })
    const { initializePosthog } = await import('./analytics')

    initializePosthog({ key: 'phc_test', consent: null })

    await vi.waitFor(() => expect(consoleSpy).toHaveBeenCalledWith('Failed to initialize PostHog:', expect.any(Error)))
    consoleSpy.mockRestore()
  })
})

describe('posthog event tracking', () => {
  beforeEach(() => {
    vi.resetModules()
    Object.values(mockPosthog).forEach((fn) => fn.mockClear())
    mockPosthog.has_opted_out_capturing.mockReturnValue(false)
    window.history.pushState({}, '', '/')
  })

  it('does nothing before initialization', async () => {
    const { trackPosthogEvent } = await import('./analytics')

    trackPosthogEvent({ name: 'Signup' })

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(mockPosthog.capture).not.toHaveBeenCalled()
  })

  it('maps legacy event names to the snake_case taxonomy', async () => {
    const { initializePosthog, trackPosthogEvent } = await import('./analytics')

    initializePosthog({ key: 'phc_test', consent: null })
    trackPosthogEvent({ name: 'Signup' })
    trackPosthogEvent({ name: 'ProcessCreated', props: { census_type: 'csp' } })

    await vi.waitFor(() => expect(mockPosthog.capture).toHaveBeenCalledTimes(2))
    expect(mockPosthog.capture).toHaveBeenNthCalledWith(1, 'account_signed_up', undefined)
    expect(mockPosthog.capture).toHaveBeenNthCalledWith(2, 'process_created', { census_type: 'csp' })
  })
})

describe('posthog consent lifecycle', () => {
  beforeEach(() => {
    vi.resetModules()
    Object.values(mockPosthog).forEach((fn) => fn.mockClear())
    mockPosthog.has_opted_out_capturing.mockReturnValue(false)
    window.history.pushState({}, '', '/')
  })

  it('does nothing before initialization', async () => {
    const { applyPosthogConsent } = await import('./analytics')

    applyPosthogConsent('accepted')

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(mockPosthog.set_config).not.toHaveBeenCalled()
  })

  it('upgrades to cookie persistence when consent is accepted', async () => {
    const { applyPosthogConsent, initializePosthog } = await import('./analytics')

    initializePosthog({ key: 'phc_test', consent: null })
    applyPosthogConsent('accepted')

    await vi.waitFor(() => expect(mockPosthog.set_config).toHaveBeenCalledWith({ persistence: 'localStorage+cookie' }))
    expect(mockPosthog.opt_in_capturing).not.toHaveBeenCalled()
  })

  it('re-opts in a previously opted-out user on acceptance', async () => {
    mockPosthog.has_opted_out_capturing.mockReturnValue(true)
    const { applyPosthogConsent, initializePosthog } = await import('./analytics')

    initializePosthog({ key: 'phc_test', consent: null })
    applyPosthogConsent('accepted')

    await vi.waitFor(() => expect(mockPosthog.opt_in_capturing).toHaveBeenCalledTimes(1))
  })

  it('opts out and drops persisted state when consent is rejected', async () => {
    const { applyPosthogConsent, initializePosthog } = await import('./analytics')

    initializePosthog({ key: 'phc_test', consent: null })
    applyPosthogConsent('rejected')

    await vi.waitFor(() => expect(mockPosthog.opt_out_capturing).toHaveBeenCalledTimes(1))
    expect(mockPosthog.set_config).toHaveBeenCalledWith({ persistence: 'memory' })
  })
})

describe('posthog identity helpers', () => {
  beforeEach(() => {
    vi.resetModules()
    Object.values(mockPosthog).forEach((fn) => fn.mockClear())
    mockPosthog.has_opted_out_capturing.mockReturnValue(false)
    window.history.pushState({}, '', '/')
  })

  it('identifies, groups and resets only after initialization', async () => {
    const analytics = await import('./analytics')

    analytics.identifyPosthogUser('user-1')
    analytics.setPosthogOrganization('0xabc')
    analytics.resetPosthogUser()

    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(mockPosthog.identify).not.toHaveBeenCalled()
    expect(mockPosthog.group).not.toHaveBeenCalled()
    expect(mockPosthog.reset).not.toHaveBeenCalled()

    analytics.initializePosthog({ key: 'phc_test', consent: 'accepted' })
    analytics.identifyPosthogUser('user-1', { email: 'a@b.com' })
    analytics.setPosthogOrganization('0xabc', { plan_name: 'Free' })
    analytics.registerPosthogSuperProperties({ locale: 'ca' })
    analytics.resetPosthogUser()

    await vi.waitFor(() => expect(mockPosthog.reset).toHaveBeenCalledTimes(1))
    expect(mockPosthog.identify).toHaveBeenCalledWith('user-1', { email: 'a@b.com' })
    expect(mockPosthog.group).toHaveBeenCalledWith('organization', '0xabc', { plan_name: 'Free' })
    expect(mockPosthog.register).toHaveBeenCalledWith({ locale: 'ca' })
  })
})

describe('AnalyticsEvents export', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('exports AnalyticsEvents (plural) with all event name constants', async () => {
    const analytics = (await import('./analytics')) as unknown as Record<string, unknown>
    const events = analytics.AnalyticsEvents as Record<string, string>
    expect(events).toBeDefined()
    expect(events.AccountSignup).toBe('Signup')
    expect(events.OrganizationCreated).toBe('OrganizationCreated')
    expect(events.UserLoggedIn).toBe('LoggedIn')
    expect(events.ProcessCreated).toBe('ProcessCreated')
    expect(events.SubscriptionSuccessful).toBe('SubscriptionSuccessful')
  })
})

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

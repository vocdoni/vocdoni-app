const mockPlausibleInit = vi.fn()
const mockPlausibleTrack = vi.fn()

vi.mock('@plausible-analytics/tracker', () => ({
  init: mockPlausibleInit,
  track: mockPlausibleTrack,
}))

const mockGtmInitialize = vi.fn()
const mockGtmDataLayer = vi.fn()

vi.mock('react-gtm-module', () => ({
  default: {
    initialize: mockGtmInitialize,
    dataLayer: mockGtmDataLayer,
  },
}))

describe('analytics initialization', () => {
  beforeEach(() => {
    vi.resetModules()
    mockPlausibleInit.mockClear()
    mockPlausibleTrack.mockClear()
    mockGtmInitialize.mockClear()
    mockGtmDataLayer.mockClear()
    import.meta.env.ANALYTICS_CLIENT_ID = ''
  })

  afterEach(() => {
    import.meta.env.ANALYTICS_CLIENT_ID = ''
  })

  it('adds analytics client id to plausible custom properties on init', async () => {
    import.meta.env.ANALYTICS_CLIENT_ID = 'client-1'
    const { initializePlausible } = await import('./analytics')

    initializePlausible({ domain: 'example.com' })

    expect(mockPlausibleInit).toHaveBeenCalledTimes(1)
    const config = mockPlausibleInit.mock.calls[0][0]
    expect(config.customProperties).toEqual({ client: 'client-1' })
  })

  it('sets analytics client id in the GTM dataLayer on init', async () => {
    import.meta.env.ANALYTICS_CLIENT_ID = 'client-1'
    const { initializeGTM } = await import('./analytics')

    initializeGTM({ gtmId: 'GTM-XXXX' })

    expect(mockGtmInitialize).toHaveBeenCalledTimes(1)
    expect(mockGtmDataLayer).toHaveBeenCalledWith({
      dataLayer: { client: 'client-1' },
    })
  })
})

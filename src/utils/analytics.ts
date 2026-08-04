type PlausibleConfig = {
  domain: string
  customProperties?: Record<string, string> | ((eventName: string) => Record<string, string>)
}

type TagManagerArgs = {
  gtmId: string
}

export const AnalyticsEvents = {
  AccountSignup: 'Signup',
  OrganizationCreated: 'OrganizationCreated',
  UserLoggedIn: 'LoggedIn',
  ProcessCreated: 'ProcessCreated',
  SubscriptionSuccessful: 'SubscriptionSuccessful',
} as const

export interface AnalyticsEvent {
  name: (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents]
  props?: Record<string, string>
}

let plausibleInitialized = false
let gtmInitialized = false
let plausibleModulePromise: Promise<typeof import('@plausible-analytics/tracker')> | null = null
let gtmModulePromise: Promise<typeof import('react-gtm-module')> | null = null

const canUseBrowserAnalytics = () => typeof window !== 'undefined'

const loadPlausibleModule = () => {
  plausibleModulePromise ??= import('@plausible-analytics/tracker')
  return plausibleModulePromise
}

const loadGtmModule = () => {
  gtmModulePromise ??= import('react-gtm-module')
  return gtmModulePromise
}

const addAnalyticsClientIdToPlausibleConfig = (
  config: PlausibleConfig,
  analyticsClientId?: string
): PlausibleConfig => {
  if (!analyticsClientId) return config

  const existingCustomProperties = config.customProperties
  if (typeof existingCustomProperties === 'function') {
    return {
      ...config,
      customProperties: (eventName) => ({
        ...existingCustomProperties(eventName),
        client: analyticsClientId,
      }),
    }
  }

  return {
    ...config,
    customProperties: {
      ...existingCustomProperties,
      client: analyticsClientId,
    },
  }
}

export const initializeGTM = (config: TagManagerArgs, analyticsClientId?: string): void => {
  if (gtmInitialized) return
  if (!canUseBrowserAnalytics()) return

  void loadGtmModule()
    .then((TagManager) => {
      TagManager.initialize(config)
      if (analyticsClientId) {
        TagManager.dataLayer({
          dataLayer: {
            client: analyticsClientId,
          },
        })
      }
      gtmInitialized = true
    })
    .catch((error) => {
      console.error('Failed to initialize GTM:', error)
    })
}

export const initializePlausible = (config: PlausibleConfig, analyticsClientId?: string): void => {
  if (plausibleInitialized) return
  if (!canUseBrowserAnalytics()) return

  void loadPlausibleModule()
    .then(({ init }) => {
      init(addAnalyticsClientIdToPlausibleConfig(config, analyticsClientId))
      plausibleInitialized = true
    })
    .catch((error) => {
      console.error('Failed to initialize Plausible:', error)
    })
}

export const trackPlausibleEvent = (event: AnalyticsEvent): void => {
  if (!plausibleInitialized) return
  if (!canUseBrowserAnalytics()) return

  void loadPlausibleModule()
    .then(({ track }) => {
      track(event.name, { props: event.props })
    })
    .catch((error) => {
      console.error('Failed to track Plausible event:', error)
    })
}

export const trackGTMEvent = (event: AnalyticsEvent): void => {
  if (!gtmInitialized) return
  if (!canUseBrowserAnalytics()) return

  void loadGtmModule()
    .then((TagManager) => {
      TagManager.dataLayer({
        dataLayer: {
          event: event.name,
          ...event.props,
        },
      })
    })
    .catch((error) => {
      console.error('Failed to track GTM event:', error)
    })
}

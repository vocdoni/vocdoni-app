import type { CaptureResult } from 'posthog-js'

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

// --- PostHog ---

export type PosthogConsent = 'accepted' | 'rejected' | null

type PosthogInitConfig = {
  key: string
  host?: string
  analyticsClientId?: string
  consent: PosthogConsent
}

// Voters must never be tracked: matches public voting routes (`/processes/:id`
// and `/processes/:id/summary`, with or without a `/:lang` prefix) where PostHog
// is neither loaded nor allowed to emit a single event.
const VOTING_PATH_REGEX = /^\/([a-z]{2}(-[a-z]{2})?\/)?processes\/[^/]+/

export const isVotingPath = (pathname: string): boolean => VOTING_PATH_REGEX.test(pathname)

// Query params that may carry PII (signup redirects carry `?email=`,
// password-reset links carry tokens) and must never reach analytics.
const SENSITIVE_QUERY_PARAMS = ['email', 'token', 'code']

export const sanitizeAnalyticsUrl = (url: string): string => {
  try {
    const parsed = new URL(url)
    let changed = false
    for (const param of SENSITIVE_QUERY_PARAMS) {
      if (parsed.searchParams.has(param)) {
        parsed.searchParams.delete(param)
        changed = true
      }
    }
    return changed ? parsed.toString() : url
  } catch {
    return url
  }
}

export const posthogBeforeSend = (event: CaptureResult | null): CaptureResult | null => {
  if (!event) return null

  const currentUrl = event.properties?.$current_url
  let pathname = canUseBrowserAnalytics() ? window.location.pathname : ''
  if (typeof currentUrl === 'string') {
    try {
      pathname = new URL(currentUrl).pathname
    } catch {
      // keep the window pathname fallback
    }
  }
  if (isVotingPath(pathname)) return null

  if (typeof currentUrl === 'string') {
    event.properties.$current_url = sanitizeAnalyticsUrl(currentUrl)
  }
  if (typeof event.properties?.$referrer === 'string') {
    event.properties.$referrer = sanitizeAnalyticsUrl(event.properties.$referrer)
  }

  return event
}

// Set synchronously when an init is accepted so concurrent callers (init,
// consent changes, identify) can rely on the shared module promise ordering.
let posthogInitStarted = false
let posthogInitialized = false
let posthogModulePromise: Promise<typeof import('posthog-js')> | null = null

const loadPosthogModule = () => {
  posthogModulePromise ??= import('posthog-js')
  return posthogModulePromise
}

export const initializePosthog = ({ key, host, analyticsClientId, consent }: PosthogInitConfig): void => {
  if (posthogInitStarted) return
  if (!canUseBrowserAnalytics()) return
  if (!key || consent === 'rejected') return
  if (isVotingPath(window.location.pathname)) return

  posthogInitStarted = true

  void loadPosthogModule()
    .then(({ default: posthog }) => {
      posthog.init(key, {
        api_host: host || 'https://eu.i.posthog.com',
        defaults: '2026-06-25',
        person_profiles: 'identified_only',
        // Cookieless until the user accepts the cookie banner
        persistence: consent === 'accepted' ? 'localStorage+cookie' : 'memory',
        disable_session_recording: true,
        before_send: posthogBeforeSend,
      })
      if (analyticsClientId) {
        posthog.register({ client: analyticsClientId })
      }
      posthogInitialized = true
    })
    .catch((error) => {
      console.error('Failed to initialize PostHog:', error)
    })
}

// Maps legacy event names (kept as-is for Plausible/GTM continuity) to the
// snake_case taxonomy used in PostHog. Unmapped names pass through unchanged.
const posthogEventNames: Record<string, string> = {
  Signup: 'account_signed_up',
  LoggedIn: 'user_logged_in',
  OrganizationCreated: 'organization_created',
  ProcessCreated: 'process_created',
  SubscriptionSuccessful: 'subscription_completed',
}

export const trackPosthogEvent = (event: AnalyticsEvent): void => {
  if (!posthogInitStarted) return
  if (!canUseBrowserAnalytics()) return

  void loadPosthogModule()
    .then(({ default: posthog }) => {
      posthog.capture(posthogEventNames[event.name] ?? event.name, event.props)
    })
    .catch((error) => {
      console.error('Failed to track PostHog event:', error)
    })
}

export const applyPosthogConsent = (consent: PosthogConsent): void => {
  if (!posthogInitStarted) return
  if (!canUseBrowserAnalytics()) return

  void loadPosthogModule()
    .then(({ default: posthog }) => {
      if (consent === 'accepted') {
        posthog.set_config({ persistence: 'localStorage+cookie' })
        if (posthog.has_opted_out_capturing()) {
          posthog.opt_in_capturing()
        }
      } else if (consent === 'rejected') {
        posthog.opt_out_capturing()
        posthog.set_config({ persistence: 'memory' })
      }
    })
    .catch((error) => {
      console.error('Failed to apply PostHog consent:', error)
    })
}

export const identifyPosthogUser = (id: string, props?: Record<string, unknown>): void => {
  if (!posthogInitStarted) return
  if (!canUseBrowserAnalytics()) return

  void loadPosthogModule()
    .then(({ default: posthog }) => {
      posthog.identify(id, props)
    })
    .catch((error) => {
      console.error('Failed to identify PostHog user:', error)
    })
}

export const resetPosthogUser = (): void => {
  if (!posthogInitStarted) return
  if (!canUseBrowserAnalytics()) return

  void loadPosthogModule()
    .then(({ default: posthog }) => {
      posthog.reset()
    })
    .catch((error) => {
      console.error('Failed to reset PostHog user:', error)
    })
}

export const setPosthogOrganization = (address: string, props?: Record<string, unknown>): void => {
  if (!posthogInitStarted) return
  if (!canUseBrowserAnalytics()) return

  void loadPosthogModule()
    .then(({ default: posthog }) => {
      posthog.group('organization', address, props)
    })
    .catch((error) => {
      console.error('Failed to set PostHog organization group:', error)
    })
}

export const registerPosthogSuperProperties = (props: Record<string, unknown>): void => {
  if (!posthogInitStarted) return
  if (!canUseBrowserAnalytics()) return

  void loadPosthogModule()
    .then(({ default: posthog }) => {
      posthog.register(props)
    })
    .catch((error) => {
      console.error('Failed to register PostHog super properties:', error)
    })
}

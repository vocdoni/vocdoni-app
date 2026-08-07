import type { CaptureResult } from 'posthog-js'

type PlausibleConfig = {
  domain: string
  customProperties?: Record<string, string> | ((eventName: string) => Record<string, string>)
}

type TagManagerArgs = {
  gtmId: string
}

export const AnalyticsEvents = {
  // Legacy events keep their original names so Plausible/GTM history stays
  // continuous; PostHog receives them renamed via posthogEventNames below.
  AccountSignup: 'Signup',
  OrganizationCreated: 'OrganizationCreated',
  UserLoggedIn: 'LoggedIn',
  ProcessCreated: 'ProcessCreated',
  SubscriptionSuccessful: 'SubscriptionSuccessful',
  // Newer events use snake_case in every sink
  CheckoutStarted: 'checkout_started',
  BillingPortalOpened: 'billing_portal_opened',
  PaywallViewed: 'paywall_viewed',
  FeatureBlocked: 'feature_blocked',
  ProcessCreationFailed: 'process_creation_failed',
  ProcessTemplateSelected: 'process_template_selected',
  ProcessAction: 'process_action',
  ProcessResultsViewed: 'process_results_viewed',
  MembersImportStarted: 'members_import_started',
  MembersImportCompleted: 'members_import_completed',
  MemberGroupCreated: 'member_group_created',
  MemberGroupDeleted: 'member_group_deleted',
  CensusConfigured: 'census_configured',
  OnboardingStepCompleted: 'onboarding_step_completed',
  TeamMemberInvited: 'team_member_invited',
  TeamMemberRemoved: 'team_member_removed',
  PdfReportDownloaded: 'pdf_report_downloaded',
} as const

export interface AnalyticsEvent {
  name: (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents]
  props?: Record<string, string | number | boolean>
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
      // Plausible only accepts string custom property values
      const props =
        event.props && Object.fromEntries(Object.entries(event.props).map(([key, value]) => [key, String(value)]))
      track(event.name, { props })
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

// Fans an event out to every configured sink. Safe to call from hooks or query
// files without the AnalyticsProvider context: every sink silently no-ops until
// it has been initialized.
export const trackAnalyticsEvent = (event: AnalyticsEvent): void => {
  trackPlausibleEvent(event)
  trackGTMEvent(event)
  trackPosthogEvent(event)
}

// --- PostHog ---

export type PosthogConsent = 'accepted' | 'rejected' | null

// The consent choice lives in localStorage, so it is user-editable and may hold
// anything. Anything that is not an explicit choice is treated as "no decision
// yet" (cookieless, anonymous) rather than being trusted as one.
export const toPosthogConsent = (value: string | null | undefined): PosthogConsent =>
  value === 'accepted' || value === 'rejected' ? value : null

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

// Session replay masks every input value (`maskAllInputs`), which would also
// hide fields we do want to read back — the organization name in settings being
// the one case. Opt a field back in by adding `data-ph-unmask` to it (or to any
// ancestor). Passwords are never unmasked, whatever the markup says.
export const POSTHOG_UNMASK_ATTRIBUTE = 'data-ph-unmask'

export const posthogMaskInput = (text: string, element?: HTMLElement): string => {
  const masked = '*'.repeat(text.length)
  if (!element) return masked
  if (element instanceof HTMLInputElement && element.type === 'password') return masked
  return element.closest(`[${POSTHOG_UNMASK_ATTRIBUTE}]`) ? text : masked
}

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

const EMAIL_REGEX = /[\w.+-]+@[\w-]+\.[\w.-]+/g

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

  // Error tracking: strip email addresses from exception payloads
  if (event.event === '$exception') {
    for (const key of ['$exception_message', '$exception_list'] as const) {
      const value = event.properties?.[key]
      if (typeof value === 'string') {
        event.properties[key] = value.replace(EMAIL_REGEX, '[redacted-email]')
      } else if (value !== undefined) {
        try {
          event.properties[key] = JSON.parse(JSON.stringify(value).replace(EMAIL_REGEX, '[redacted-email]'))
        } catch {
          // leave the payload untouched if it cannot be serialized
        }
      }
    }
  }

  return event
}

// Set synchronously when an init is accepted so concurrent callers (init,
// consent changes, identify) can rely on the shared module promise ordering.
let posthogInitStarted = false
let posthogInitialized = false
let posthogModulePromise: Promise<typeof import('posthog-js')> | null = null

const loadPosthogModule = () => {
  // A rejected promise must not stay cached: a transient chunk-load failure
  // would otherwise keep PostHog dead for the rest of the session, since every
  // later caller would await the same rejection.
  posthogModulePromise ??= import('posthog-js').catch((error) => {
    posthogModulePromise = null
    throw error
  })
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
        // Recording is started explicitly, only for consented dashboard users
        disable_session_recording: true,
        session_recording: {
          maskAllInputs: true,
          maskInputFn: posthogMaskInput,
        },
        capture_exceptions: true,
        before_send: posthogBeforeSend,
      })
      if (analyticsClientId) {
        posthog.register({ client: analyticsClientId })
      }
      attachPosthogFlagBridge(posthog)
      posthogInitialized = true
    })
    .catch((error) => {
      // Release the guard so a later attempt (consent change, remount) can
      // retry instead of leaving analytics permanently disabled.
      posthogInitStarted = false
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
        posthog.stopSessionRecording()
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

// --- Feature flags ---
// Listeners may register before PostHog has initialized (children effects run
// before the provider effect); they are held here and bridged once the SDK is
// ready, so `useFeatureFlag` works regardless of mount order.

type FlagListener = (isEnabled: (flag: string) => boolean | undefined) => void

const posthogFlagListeners = new Set<FlagListener>()
let posthogFlagBridgeAttached = false

const attachPosthogFlagBridge = (posthog: (typeof import('posthog-js'))['default']): void => {
  if (posthogFlagBridgeAttached) return
  posthogFlagBridgeAttached = true

  posthog.onFeatureFlags(() => {
    for (const listener of posthogFlagListeners) {
      listener((flag) => posthog.isFeatureEnabled(flag))
    }
  })
}

export const onPosthogFeatureFlags = (listener: FlagListener): (() => void) => {
  posthogFlagListeners.add(listener)

  // Late subscribers get the current values right away
  if (posthogInitialized && canUseBrowserAnalytics()) {
    void loadPosthogModule()
      .then(({ default: posthog }) => {
        if (posthogFlagListeners.has(listener)) {
          listener((flag) => posthog.isFeatureEnabled(flag))
        }
      })
      .catch((error) => {
        console.error('Failed to read PostHog feature flags:', error)
      })
  }

  return () => {
    posthogFlagListeners.delete(listener)
  }
}

// Session replay is opt-in twice over: it only ever runs for authenticated
// dashboard users who accepted the cookie banner, and voting routes are
// excluded at the before_send layer regardless.
export const setPosthogSessionRecording = (enabled: boolean): void => {
  if (!posthogInitStarted) return
  if (!canUseBrowserAnalytics()) return

  void loadPosthogModule()
    .then(({ default: posthog }) => {
      if (enabled) {
        posthog.startSessionRecording()
      } else {
        posthog.stopSessionRecording()
      }
    })
    .catch((error) => {
      console.error('Failed to toggle PostHog session recording:', error)
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

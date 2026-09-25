import type { CaptureResult } from 'posthog-js'
import {
  getHomeProcessRouteMatch,
  getPublicLocalizedProcessRouteMatch,
  getPublicLocalizedProcessSummaryRouteMatch,
} from '~src/ssr/public-routes'

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
  ProcessAction: 'process_action',
  ProcessResultsViewed: 'process_results_viewed',
  MembersImportStarted: 'members_import_started',
  MembersImportCompleted: 'members_import_completed',
  MemberGroupCreated: 'member_group_created',
  MemberGroupDeleted: 'member_group_deleted',
  CensusConfigured: 'census_configured',
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

type VotingRouteConfig = {
  homeProcessId?: string
  supportedLanguages?: string[]
}

type PosthogInitConfig = VotingRouteConfig & {
  key: string
  host?: string
  analyticsClientId?: string
  consent: PosthogConsent
}

// Voters must never be tracked. The fixed URL shape (`/processes/:id` and
// `/processes/:id/summary`, bare or behind a two-letter `/:lang` prefix) is
// matched directly, so the guard holds even without runtime configuration.
const VOTING_PATH_REGEX = /^\/([a-z]{2}(-[a-z]{2})?\/)?processes\/[^/]+/

// Vike matches decoded segments, whereas window.location.pathname is encoded.
// Encoded slashes are preserved so decoding cannot introduce new route segments.
const decodePathnameSegments = (pathname: string): string =>
  pathname
    .split('/')
    .map((segment) => {
      try {
        return decodeURIComponent(segment).replace(/\//g, '%2F')
      } catch {
        return segment
      }
    })
    .join('/')

// The runtime-configured routes (any supported language prefix, and the
// optional voting homepage at `/` and `/:lang` when HOME_PROCESS_ID is set) go
// through the very matchers Vike routes them with, so the privacy boundary
// follows runtime configuration instead of the URL shape alone.
export const isVotingPath = (
  pathname: string,
  { homeProcessId, supportedLanguages = [] }: VotingRouteConfig = {}
): boolean => {
  const localized = { urlPathname: decodePathnameSegments(pathname), supportedLanguages }

  return (
    VOTING_PATH_REGEX.test(localized.urlPathname) ||
    Boolean(getPublicLocalizedProcessRouteMatch(localized)) ||
    Boolean(getPublicLocalizedProcessSummaryRouteMatch(localized)) ||
    Boolean(getHomeProcessRouteMatch({ ...localized, homeProcessId }))
  )
}

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

// Outlook's Safe Links scanner opens mailed links in a headless browser and rejects a
// promise with a bare string: bot traffic, not a user error. Matched on the shape of the
// Id/MethodName/ParamCount triple, which genuine non-Error rejections do not share.
const SCANNER_REJECTION_REGEX = /Object Not Found Matching Id:\d+, MethodName:\w+, ParamCount:\d+/

// The exception payload keys that carry a message: anything worth reading for
// the scanner filter is worth stripping emails from, so both run in one pass.
const EXCEPTION_PAYLOAD_KEYS = ['$exception_message', '$exception_values', '$exception_list'] as const

export const posthogBeforeSend = (
  event: CaptureResult | null,
  votingRoutes: VotingRouteConfig = {}
): CaptureResult | null => {
  if (!event) return null
  if (canUseBrowserAnalytics() && isVotingPath(window.location.pathname, votingRoutes)) return null

  const currentUrl = event.properties?.$current_url
  let pathname = ''
  if (typeof currentUrl === 'string') {
    try {
      pathname = new URL(currentUrl).pathname
    } catch {
      // The browser pathname has already been checked above.
    }
  }
  if (pathname && isVotingPath(pathname, votingRoutes)) return null

  if (typeof currentUrl === 'string') {
    event.properties.$current_url = sanitizeAnalyticsUrl(currentUrl)
  }
  if (typeof event.properties?.$referrer === 'string') {
    event.properties.$referrer = sanitizeAnalyticsUrl(event.properties.$referrer)
  }

  // Error tracking: drop scanner noise, then strip email addresses from what
  // remains. Each payload is serialized once and used for both.
  if (event.event === '$exception') {
    for (const key of EXCEPTION_PAYLOAD_KEYS) {
      const value = event.properties?.[key]
      if (value === undefined) continue
      const isString = typeof value === 'string'
      try {
        const text: string = isString ? value : JSON.stringify(value)
        if (SCANNER_REJECTION_REGEX.test(text)) return null
        const redacted = text.replace(EMAIL_REGEX, '[redacted-email]')
        event.properties[key] = isString ? redacted : JSON.parse(redacted)
      } catch {
        // leave the payload untouched if it cannot be serialized
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

type Posthog = (typeof import('posthog-js'))['default']

// Shared body of every helper below: `posthogInitStarted` gates the synchronous
// path and `posthogInitialized` the asynchronous one, so nothing reaches the SDK
// when initialization never ran or was canceled by the voting-route guard.
const withPosthog = (errorMessage: string, run: (posthog: Posthog) => void): void => {
  if (!posthogInitStarted) return
  if (!canUseBrowserAnalytics()) return

  void loadPosthogModule()
    .then(({ default: posthog }) => {
      if (!posthogInitialized) return
      run(posthog)
    })
    .catch((error) => {
      console.error(errorMessage, error)
    })
}

export const initializePosthog = ({
  key,
  host,
  analyticsClientId,
  consent,
  ...votingRoutes
}: PosthogInitConfig): void => {
  if (posthogInitStarted) return
  if (!canUseBrowserAnalytics()) return
  if (!key || consent === 'rejected') return
  if (isVotingPath(window.location.pathname, votingRoutes)) return

  posthogInitStarted = true

  void loadPosthogModule()
    .then(({ default: posthog }) => {
      // Navigation may have changed the privacy boundary while the chunk loaded.
      if (isVotingPath(window.location.pathname, votingRoutes)) {
        posthogInitStarted = false
        return
      }
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
        before_send: (event) => posthogBeforeSend(event, votingRoutes),
      })
      // `site` separates this app's events from vocdoni.io's in the shared
      // PostHog project. Registered here, not in a React effect, so it lands
      // on every init path - including a retry after a failed chunk load,
      // which no effect re-runs for.
      posthog.register({ site: 'app' })
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
  withPosthog('Failed to track PostHog event:', (posthog) => {
    posthog.capture(posthogEventNames[event.name] ?? event.name, event.props)
  })
}

export const applyPosthogConsent = (consent: PosthogConsent): void => {
  withPosthog('Failed to apply PostHog consent:', (posthog) => {
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
}

export const identifyPosthogUser = (id: string, props?: Record<string, unknown>): void => {
  withPosthog('Failed to identify PostHog user:', (posthog) => {
    posthog.identify(id, props)
  })
}

export const resetPosthogUser = (): void => {
  withPosthog('Failed to reset PostHog user:', (posthog) => {
    posthog.reset()
  })
}

// Errors a React error boundary contains never reach `window.onerror`, so
// `capture_exceptions` alone would never see them: they are reported here.
export const capturePosthogException = (error: unknown, props?: Record<string, unknown>): void => {
  withPosthog('Failed to capture PostHog exception:', (posthog) => {
    posthog.captureException(error, props)
  })
}

export const setPosthogOrganization = (address: string, props?: Record<string, unknown>): void => {
  withPosthog('Failed to set PostHog organization group:', (posthog) => {
    posthog.group('organization', address, props)
  })
}

// --- Feature flags ---
// Listeners may register before PostHog has initialized (children effects run
// before the provider effect); they are held here and bridged once the SDK is
// ready, so `useFeatureFlag` works regardless of mount order.

type FlagListener = (isEnabled: (flag: string) => boolean | undefined) => void

const posthogFlagListeners = new Set<FlagListener>()
let posthogFlagBridgeAttached = false

const attachPosthogFlagBridge = (posthog: Posthog): void => {
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
        if (!posthogInitialized) return
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
  withPosthog('Failed to toggle PostHog session recording:', (posthog) => {
    if (enabled) {
      posthog.startSessionRecording()
    } else {
      posthog.stopSessionRecording()
    }
  })
}

export const registerPosthogSuperProperties = (props: Record<string, unknown>): void => {
  withPosthog('Failed to register PostHog super properties:', (posthog) => {
    posthog.register(props)
  })
}

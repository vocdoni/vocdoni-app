import TagManager from 'react-gtm-module'

const CONSENT_KEY = 'vocdoni-cookie-consent'
const CONSENT_ACCEPTED = 'accepted'
const CONSENT_REJECTED = 'rejected'
const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365
export const COOKIE_CONSENT_CHANGE_EVENT = 'vocdoni-cookie-consent-change'

/**
 * The registrable domain the app shares with the marketing site. The consent
 * choice is stored as a cookie scoped to it - not in localStorage, which is
 * per-origin - so that a visitor who accepted on `vocdoni.io` arrives here
 * already decided.
 *
 * Analytics depends on that sharing. PostHog only keeps one `distinct_id`
 * across subdomains while both sites run with cookie persistence, and both only
 * switch to cookie persistence once consent is known. A per-origin choice leaves
 * this app in "no decision yet", where it ignores the shared cookie and mints a
 * fresh anonymous id - breaking every website -> app funnel at the first step.
 */
const ROOT_DOMAIN = 'vocdoni.io'

/**
 * Hosts outside `vocdoni.io` - localhost, staging, preview deploys - get a
 * host-only cookie, so they never join production identities.
 */
export function consentCookieDomain(hostname: string): string | null {
  if (hostname === ROOT_DOMAIN || hostname.endsWith(`.${ROOT_DOMAIN}`)) return `.${ROOT_DOMAIN}`
  return null
}

export function buildConsentCookie(value: string, hostname: string, protocol: string): string {
  const domain = consentCookieDomain(hostname)
  return [
    `${CONSENT_KEY}=${encodeURIComponent(value)}`,
    'Path=/',
    `Max-Age=${CONSENT_MAX_AGE_SECONDS}`,
    'SameSite=Lax',
    ...(domain ? [`Domain=${domain}`] : []),
    ...(protocol === 'https:' ? ['Secure'] : []),
  ].join('; ')
}

/**
 * Only the two values this app writes count as a decision. Anything else - a
 * hand-edited cookie, a value left by some other tool on the shared domain - is
 * treated as "not decided yet" rather than propagated across `.vocdoni.io`.
 */
function normalizeConsent(value: string | null): string | null {
  return value === CONSENT_ACCEPTED || value === CONSENT_REJECTED ? value : null
}

export function readConsentCookie(cookie: string | undefined): string | null {
  if (!cookie) return null

  for (const entry of cookie.split(';')) {
    const separator = entry.indexOf('=')
    if (separator === -1) continue
    if (entry.slice(0, separator).trim() !== CONSENT_KEY) continue
    try {
      return decodeURIComponent(entry.slice(separator + 1).trim()) || null
    } catch {
      // A malformed percent-escape must not throw: consent is read while
      // rendering, so an unhandled URIError would take the app down.
      return null
    }
  }
  return null
}

function readLegacyConsent(): string | null {
  try {
    return localStorage.getItem(CONSENT_KEY)
  } catch {
    // Safari private mode and storage-blocking extensions throw on access.
    return null
  }
}

function writeConsent(value: string): void {
  document.cookie = buildConsentCookie(value, window.location.hostname, window.location.protocol)
  try {
    // Mirrored, not read first: keeps a rollback of either site working, since
    // the previous implementation only ever looked at localStorage.
    localStorage.setItem(CONSENT_KEY, value)
  } catch {
    // The cookie above is the source of truth; losing the mirror is harmless.
  }
}

/**
 * Get the current cookie consent status
 * @returns 'accepted', 'rejected', or null if no choice has been made
 */
export function getCookieConsent(): string | null {
  if (typeof window === 'undefined') return null

  const fromCookie = normalizeConsent(readConsentCookie(document.cookie))
  if (fromCookie) return fromCookie

  // Choices made before the shared cookie existed live in localStorage. Honour
  // one once and promote it, so nobody who already decided is asked again.
  const legacy = normalizeConsent(readLegacyConsent())
  if (legacy) writeConsent(legacy)
  return legacy
}

/**
 * Set the cookie consent status
 * @param accepted - true if user accepted cookies, false if rejected
 */
export function setCookieConsent(accepted: boolean): void {
  if (typeof window === 'undefined') return
  writeConsent(accepted ? CONSENT_ACCEPTED : CONSENT_REJECTED)
  window.dispatchEvent(new Event(COOKIE_CONSENT_CHANGE_EVENT))
}

/**
 * Check if the user has made a cookie consent choice
 * @returns true if user has accepted or rejected, false if no choice made
 */
export function hasCookieConsent(): boolean {
  if (typeof window === 'undefined') return false
  const consent = getCookieConsent()
  return consent === CONSENT_ACCEPTED || consent === CONSENT_REJECTED
}

export function hasAcceptedCookieConsent(): boolean {
  return getCookieConsent() === CONSENT_ACCEPTED
}

/**
 * Initialize Google Tag Manager with or without cookie storage
 * @param withCookies - if true, GTM will use cookies; if false, storage will be disabled
 * @param gtmId - the GTM container id (from runtime env, provided by the caller)
 */
export function initializeGTM(withCookies: boolean, gtmId?: string): void {
  if (typeof window === 'undefined') return

  if (!gtmId) return

  // Initialize GTM
  TagManager.initialize({ gtmId })

  // If cookies are rejected, configure gtag to disable all storage
  if (!withCookies) {
    // Push configuration to dataLayer to disable all storage
    ;(window as any).dataLayer = (window as any).dataLayer || []
    ;(window as any).dataLayer.push({
      event: 'consent_update',
      consent: {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        functionality_storage: 'denied',
        personalization_storage: 'denied',
        security_storage: 'granted', // Security storage is typically always granted
      },
    })

    // Also use gtag command if available
    if (typeof (window as any).gtag === 'function') {
      ;(window as any).gtag('consent', 'default', {
        ad_storage: 'denied',
        analytics_storage: 'denied',
        functionality_storage: 'denied',
        personalization_storage: 'denied',
        security_storage: 'granted',
      })
    }
  } else {
    // Push consent granted to dataLayer
    ;(window as any).dataLayer = (window as any).dataLayer || []
    ;(window as any).dataLayer.push({
      event: 'consent_update',
      consent: {
        ad_storage: 'granted',
        analytics_storage: 'granted',
        functionality_storage: 'granted',
        personalization_storage: 'granted',
        security_storage: 'granted',
      },
    })

    // Also use gtag command if available
    if (typeof (window as any).gtag === 'function') {
      ;(window as any).gtag('consent', 'update', {
        ad_storage: 'granted',
        analytics_storage: 'granted',
        functionality_storage: 'granted',
        personalization_storage: 'granted',
        security_storage: 'granted',
      })
    }
  }
}

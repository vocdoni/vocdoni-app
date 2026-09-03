import TagManager from 'react-gtm-module'
import { readCookieValues } from '~utils/cookies'

const CONSENT_KEY = 'vocdoni-cookie-consent'
const CONSENT_ACCEPTED = 'accepted'
const CONSENT_REJECTED = 'rejected'
/**
 * Set alongside the localStorage mirror the first time a value passes through
 * the cookie era. An absent cookie next to a marked mirror means the cookie
 * expired or was deliberately removed (a withdrawal), NOT a pre-migration
 * choice - so it must never be promoted back to the shared domain.
 */
const CONSENT_MIGRATED_KEY = 'vocdoni-cookie-consent-migrated'
const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365
export const COOKIE_CONSENT_CHANGE_EVENT = 'vocdoni-cookie-consent-change'

export type ConsentValue = typeof CONSENT_ACCEPTED | typeof CONSENT_REJECTED

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
function normalizeConsent(value: string | null): ConsentValue | null {
  return value === CONSENT_ACCEPTED || value === CONSENT_REJECTED ? value : null
}

export function readConsentCookie(cookie: string | undefined): ConsentValue | null {
  // Duplicate names are possible: a junk host-only cookie on this subdomain
  // would coexist with the real `Domain=.vocdoni.io` one, in an order we don't
  // control, and a `Domain=` write can never replace a host-only cookie. So
  // return the first *recognised* decision rather than the first entry.
  for (const value of readCookieValues(cookie, CONSENT_KEY)) {
    const consent = normalizeConsent(value)
    if (consent) return consent
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

/**
 * Mirrored, never read first: keeps a rollback of either site working, since
 * the previous implementation only ever looked at localStorage.
 *
 * The write is conditional because consent is read while rendering, so this
 * runs far more often than the choice actually changes.
 */
function mirrorConsent(value: string): void {
  try {
    if (localStorage.getItem(CONSENT_KEY) !== value) localStorage.setItem(CONSENT_KEY, value)
    // Mark the mirror as cookie-era, so a later cookie deletion/expiry is
    // honoured as a withdrawal instead of resurrecting this value.
    if (localStorage.getItem(CONSENT_MIGRATED_KEY) === null) localStorage.setItem(CONSENT_MIGRATED_KEY, '1')
  } catch {
    // The cookie is the source of truth; losing the mirror is harmless.
  }
}

function hasMigratedConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_MIGRATED_KEY) !== null
  } catch {
    // If storage is unreadable the mirror is too, so the question is moot.
    return false
  }
}

function writeConsent(value: string): void {
  document.cookie = buildConsentCookie(value, window.location.hostname, window.location.protocol)
  mirrorConsent(value)
}

/**
 * Get the current cookie consent status
 * @returns 'accepted', 'rejected', or null if no choice has been made
 */
export function getCookieConsent(): ConsentValue | null {
  if (typeof window === 'undefined') return null

  const fromCookie = readConsentCookie(document.cookie)
  if (fromCookie) {
    // The choice may have been changed on the other site, which can only write
    // the shared cookie - this origin's mirror would otherwise stay stale, and
    // a rollback here would then reinstate a decision the visitor has revoked.
    mirrorConsent(fromCookie)
    return fromCookie
  }

  const legacy = normalizeConsent(readLegacyConsent())
  if (!legacy) return null

  // A cookie-era mirror with the cookie gone means it expired or was removed
  // (clearing cookies is a legitimate withdrawal); re-ask instead of silently
  // re-minting a domain-wide cookie the visitor may have revoked.
  if (hasMigratedConsent()) return null

  // Choices made before the shared cookie existed live in localStorage. Honour
  // one once and promote it, so nobody who already decided is asked again.
  writeConsent(legacy)
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
 * The shared cookie has a second writer - vocdoni.io - and nothing in this
 * document fires when that site changes the choice. Re-read whenever the tab
 * regains focus/visibility and dispatch the regular change event when the
 * decision differs, so consumers (analytics, chat) honour a cross-site
 * revocation without waiting for a full reload.
 * @returns a cleanup function removing the listeners
 */
export function watchCrossSiteConsent(): () => void {
  if (typeof window === 'undefined') return () => {}

  let known = getCookieConsent()
  const remember = () => {
    known = getCookieConsent()
  }
  const recheck = () => {
    const current = getCookieConsent()
    if (current === known) return
    known = current
    window.dispatchEvent(new Event(COOKIE_CONSENT_CHANGE_EVENT))
  }

  // Keep `known` in step with this origin's own writes, so a local decision
  // doesn't produce a spurious change event on the next refocus.
  window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, remember)
  window.addEventListener('focus', recheck)
  document.addEventListener('visibilitychange', recheck)
  return () => {
    window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, remember)
    window.removeEventListener('focus', recheck)
    document.removeEventListener('visibilitychange', recheck)
  }
}

/**
 * Check if the user has made a cookie consent choice
 * @returns true if user has accepted or rejected, false if no choice made
 */
export function hasCookieConsent(): boolean {
  return getCookieConsent() !== null
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

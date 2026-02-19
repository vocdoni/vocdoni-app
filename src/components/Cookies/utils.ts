import TagManager from 'react-gtm-module'

const CONSENT_KEY = 'vocdoni-cookie-consent'
const CONSENT_ACCEPTED = 'accepted'
const CONSENT_REJECTED = 'rejected'

/**
 * Get the current cookie consent status from localStorage
 * @returns 'accepted', 'rejected', or null if no choice has been made
 */
export function getCookieConsent(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(CONSENT_KEY)
}

/**
 * Set the cookie consent status in localStorage
 * @param accepted - true if user accepted cookies, false if rejected
 */
export function setCookieConsent(accepted: boolean): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CONSENT_KEY, accepted ? CONSENT_ACCEPTED : CONSENT_REJECTED)
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

/**
 * Check if the user has accepted cookies
 * @returns true if user accepted, false otherwise
 */
export function hasAcceptedCookies(): boolean {
  return getCookieConsent() === CONSENT_ACCEPTED
}

/**
 * Initialize Google Tag Manager with or without cookie storage
 * @param withCookies - if true, GTM will use cookies; if false, storage will be disabled
 */

// Replace this with your actual GTM ID or import from config/environment
const GTM_ID = import.meta.env.GTM_CONTAINER_ID

export function initializeGTM(withCookies: boolean): void {
  if (typeof window === 'undefined') return

  if (!GTM_ID) return

  // Initialize GTM
  TagManager.initialize({ gtmId: GTM_ID })

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

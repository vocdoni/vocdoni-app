import { beforeEach, describe, expect, it } from 'vitest'
import { buildConsentCookie, consentCookieDomain, getCookieConsent, readConsentCookie, setCookieConsent } from './utils'

const clearConsentCookie = () => {
  document.cookie = 'vocdoni-cookie-consent=; Path=/; Max-Age=0'
}

describe('consentCookieDomain', () => {
  it('scopes the choice to the domain shared with the marketing site', () => {
    expect(consentCookieDomain('app.vocdoni.io')).toBe('.vocdoni.io')
    expect(consentCookieDomain('vocdoni.io')).toBe('.vocdoni.io')
  })

  it('keeps local and preview hosts host-only, so they never join production identities', () => {
    expect(consentCookieDomain('localhost')).toBeNull()
    expect(consentCookieDomain('app.stg.vocdoni.net')).toBeNull()
  })

  it('does not match a lookalike domain that merely ends in the same characters', () => {
    expect(consentCookieDomain('notvocdoni.io')).toBeNull()
    expect(consentCookieDomain('vocdoni.io.evil.com')).toBeNull()
  })
})

describe('buildConsentCookie', () => {
  it('sets the shared domain and marks the cookie secure over https', () => {
    const cookie = buildConsentCookie('accepted', 'app.vocdoni.io', 'https:')

    expect(cookie).toContain('vocdoni-cookie-consent=accepted')
    expect(cookie).toContain('Domain=.vocdoni.io')
    expect(cookie).toContain('SameSite=Lax')
    expect(cookie).toContain('Secure')
  })

  it('omits the domain and the secure flag on plain-http localhost', () => {
    const cookie = buildConsentCookie('rejected', 'localhost', 'http:')

    expect(cookie).not.toContain('Domain=')
    expect(cookie).not.toContain('Secure')
  })
})

describe('readConsentCookie', () => {
  it('reads the value out of a cookie string holding other entries', () => {
    expect(readConsentCookie('foo=1; vocdoni-cookie-consent=accepted; ph_test=2')).toBe('accepted')
  })

  it('does not match a cookie whose name merely ends with the key', () => {
    expect(readConsentCookie('other-vocdoni-cookie-consent=accepted')).toBeNull()
  })

  it('handles an absent cookie header', () => {
    expect(readConsentCookie(undefined)).toBeNull()
    expect(readConsentCookie('foo=1')).toBeNull()
  })

  it('survives a malformed percent-escape instead of throwing', () => {
    // Consent is read while rendering, so a URIError here would take the app down.
    expect(readConsentCookie('vocdoni-cookie-consent=%E0%A4%A')).toBeNull()
  })
})

describe('getCookieConsent', () => {
  beforeEach(() => {
    clearConsentCookie()
    localStorage.clear()
  })

  it('reads the choice back from the cookie', () => {
    setCookieConsent(true)

    expect(getCookieConsent()).toBe('accepted')
    expect(document.cookie).toContain('vocdoni-cookie-consent=accepted')
  })

  it('honours a pre-existing localStorage choice and promotes it to the shared cookie', () => {
    // Anyone who decided before this change must not be asked a second time.
    localStorage.setItem('vocdoni-cookie-consent', 'accepted')

    expect(getCookieConsent()).toBe('accepted')
    expect(readConsentCookie(document.cookie)).toBe('accepted')
  })

  it('prefers the shared cookie over a stale localStorage mirror', () => {
    // The other site is the one that may have changed the choice most recently.
    setCookieConsent(false)
    localStorage.setItem('vocdoni-cookie-consent', 'accepted')

    expect(getCookieConsent()).toBe('rejected')
  })

  it('returns null when no choice has been made', () => {
    expect(getCookieConsent()).toBeNull()
  })

  it('ignores an unrecognised legacy value rather than promoting it to the shared cookie', () => {
    localStorage.setItem('vocdoni-cookie-consent', 'true')

    expect(getCookieConsent()).toBeNull()
    expect(document.cookie).not.toContain('vocdoni-cookie-consent=true')
  })

  it('ignores an unrecognised cookie value and repairs it from a valid legacy choice', () => {
    document.cookie = 'vocdoni-cookie-consent=true; Path=/'
    localStorage.setItem('vocdoni-cookie-consent', 'accepted')

    expect(getCookieConsent()).toBe('accepted')
    expect(readConsentCookie(document.cookie)).toBe('accepted')
  })
})

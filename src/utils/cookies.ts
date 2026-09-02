/**
 * Pure cookie-string helpers shared by every module that parses cookies
 * (consent, public language). String-in/string-out on purpose: SSR code paths
 * receive the Cookie header as a plain string, and keeping `document` out of
 * here lets both sides use the same parser.
 */

/**
 * All decoded values for `key`, in the order the browser serialised them.
 * Duplicate names are possible (a host-only cookie can coexist with a
 * `Domain=` one, and the serialisation order is not under our control), so
 * callers that validate values should scan the list rather than trust the
 * first entry. Malformed percent-escapes are skipped instead of throwing:
 * cookies are read while rendering, so an unhandled URIError would take the
 * app down.
 */
export function readCookieValues(cookie: string | undefined, key: string): string[] {
  if (!cookie) return []

  const values: string[] = []
  for (const entry of cookie.split(';')) {
    const separator = entry.indexOf('=')
    if (separator === -1) continue
    if (entry.slice(0, separator).trim() !== key) continue
    try {
      values.push(decodeURIComponent(entry.slice(separator + 1).trim()))
    } catch {
      // Skip the malformed entry; a valid duplicate may follow.
    }
  }
  return values
}

/**
 * First value for `key`, or null when the cookie is absent or empty.
 */
export function readCookie(cookie: string | undefined, key: string): string | null {
  return readCookieValues(cookie, key)[0] || null
}

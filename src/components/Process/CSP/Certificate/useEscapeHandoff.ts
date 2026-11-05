// The hand-off param marks a tab that came from the escape panel so detection
// stays off in the real browser and the voter goes straight to identification.
export const ESCAPE_IDENTIFY_PARAM = 'identify=cert-escape'

/** The process URL with no query string or fragment. */
export const cleanPageUrl = (): string =>
  typeof window !== 'undefined' ? window.location.origin + window.location.pathname : ''

/** The hand-off URL: clean URL plus the cert-escape identify param. */
export const handoffUrl = (): string => `${cleanPageUrl()}?identify=cert-escape`

/** Android intent URL: asks the system for the default browser (no package = chooser if none set). */
export const intentUrl = (): string => {
  if (typeof window === 'undefined') return ''
  const { host, pathname } = window.location
  return `intent://${host}${pathname}?identify=cert-escape#Intent;scheme=https;end`
}

/** iOS undocumented scheme that targets the system WebKit browser. Behind a kill-switch env flag. */
export const iosOpenUrl = (): string => {
  if (typeof window === 'undefined') return ''
  const { host, pathname } = window.location
  return `x-safari-https://${host}${pathname}?identify=cert-escape`
}

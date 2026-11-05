import { useEffect, useState } from 'react'
import { detectCertificateBrowser, readBrowserEnv, type CertificateBrowser } from './browser-support'

// The hand-off param marks a tab that came from the escape panel so detection
// stays off in the real browser and the voter goes straight to identification.
export const HANDOFF_PARAM = 'identify'
export const HANDOFF_VALUE = 'cert-escape'
const ESCAPED_KEY = 'vocdoni.cert.escaped'
export const HANDOFF_DELAY_MS = 1200

const readEscaped = () => {
  try {
    return sessionStorage.getItem(ESCAPED_KEY) === '1'
  } catch {
    return false
  }
}

/** The clean page URL: what Share and "Copy link for another device" send, never the hand-off param. */
export const cleanPageUrl = (): string =>
  typeof window !== 'undefined' ? window.location.origin + window.location.pathname : ''

/** The URL the escape opens in the real browser: starts identification there once, then removes itself. */
export const handoffUrl = (): string => `${cleanPageUrl()}?${HANDOFF_PARAM}=${HANDOFF_VALUE}`

/** Android intent URL: asks the system for the default browser (no package = chooser if none set). */
export const intentUrl = (): string => {
  if (typeof window === 'undefined') return ''
  const { host, pathname } = window.location
  return `intent://${host}${pathname}?${HANDOFF_PARAM}=${HANDOFF_VALUE}#Intent;scheme=https;end`
}

/** iOS undocumented scheme that targets the system WebKit browser. Behind a kill-switch env flag. */
export const iosOpenUrl = (): string => {
  if (typeof window === 'undefined') return ''
  const { host, pathname } = window.location
  return `x-safari-https://${host}${pathname}?${HANDOFF_PARAM}=${HANDOFF_VALUE}`
}

export type EscapeHandoff = { browser: CertificateBrowser; resuming: boolean }

/**
 * After mount (UA detection never runs on the server): whether this browser can't use a certificate,
 * and whether this load is the hand-off from an in-app viewer. The hand-off param is removed from the
 * URL at once and the tab is flagged, so detection stays off here and Back or reload never re-trigger it.
 */
export const useEscapeHandoff = (): EscapeHandoff => {
  const [state, setState] = useState<EscapeHandoff>({ browser: { kind: 'supported' }, resuming: false })

  useEffect(() => {
    const url = new URL(window.location.href)
    const resuming = url.searchParams.get(HANDOFF_PARAM) === HANDOFF_VALUE
    if (resuming) {
      url.searchParams.delete(HANDOFF_PARAM)
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
      try {
        sessionStorage.setItem(ESCAPED_KEY, '1')
      } catch {
        // No storage: detection may run again on a reload of this tab; harmless.
      }
    }
    const escaped = resuming || readEscaped()
    setState({ browser: escaped ? { kind: 'supported' } : detectCertificateBrowser(readBrowserEnv()), resuming })
  }, [])

  return state
}

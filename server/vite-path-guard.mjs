/**
 * Predicate that returns true for Vite-internal dev-only URL paths that should
 * never reach renderPage() in production. These paths are either served by the
 * Vite dev middleware (which is not loaded in production) or are common
 * security-scanner probes targeting Vite's filesystem-serving handler.
 *
 * @param {string} pathname  The request pathname (req.path), e.g. "/@fs/etc/passwd"
 * @returns {boolean}
 */

const VITE_INTERNAL = /^\/@(fs|vite|react-refresh|id)(\/|$)/i

export function isViteInternalPath(pathname) {
  return VITE_INTERNAL.test(pathname) || pathname.startsWith('/__vite')
}

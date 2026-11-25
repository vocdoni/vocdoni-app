export const STALE_CHUNK_RELOAD_KEY = 'stale-chunk-reload-at'
// A second failure inside this window means the reload did not help: leave it to the route's error page.
export const STALE_CHUNK_RELOAD_WINDOW_MS = 60_000

/**
 * Each deploy removes the previous build's chunks, so a tab opened before it fails to load the next page's code.
 * Vite reports that as `vite:preloadError`; reload once so the tab picks up the new build. The error still
 * propagates (no preventDefault), so the error page shows if the reload is skipped and PostHog keeps counting it.
 */
export const installStaleChunkReload = (win: Window = window) => {
  const onPreloadError = () => {
    if (win.navigator.onLine === false) return
    try {
      const last = Number(win.sessionStorage.getItem(STALE_CHUNK_RELOAD_KEY) ?? 0)
      if (Date.now() - last < STALE_CHUNK_RELOAD_WINDOW_MS) return
      win.sessionStorage.setItem(STALE_CHUNK_RELOAD_KEY, String(Date.now()))
    } catch {
      // Without sessionStorage there is no loop guard, so do not reload.
      return
    }
    win.location.reload()
  }

  win.addEventListener('vite:preloadError', onPreloadError)
  return () => win.removeEventListener('vite:preloadError', onPreloadError)
}

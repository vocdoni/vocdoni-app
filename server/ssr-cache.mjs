import { LRUCache } from 'lru-cache'

// ---------------------------------------------------------------------------
// TTL constants (milliseconds)
// ---------------------------------------------------------------------------
const TTL_ORGANIZATION = 5 * 60 * 1000 // 5 minutes — profile data changes rarely
const TTL_PROCESSES = 1 * 60 * 1000 // 1 minute  — vote counts / status change frequently
const TTL_DEFAULT = 2 * 60 * 1000 // 2 minutes  — defensive fallback

// Matches /<lang>/organization/<addr>  and  /<lang>/processes/<id>
// Only two-letter lang codes are accepted to match the app's locale set.
const CACHEABLE_PATTERN = /^\/[a-z]{2}\/(organization|processes)\/[^/]+/

// ---------------------------------------------------------------------------
// Public helpers (exported for testing)
// ---------------------------------------------------------------------------

/**
 * Returns the TTL in milliseconds for a pathname, or null if not cacheable.
 * @param {string} pathname
 * @returns {number | null}
 */
export function getTtl(pathname) {
  const match = CACHEABLE_PATTERN.exec(pathname)
  if (!match) return null
  if (match[1] === 'organization') return TTL_ORGANIZATION
  if (match[1] === 'processes') return TTL_PROCESSES
  return TTL_DEFAULT
}

/**
 * Returns the cache key for a pathname, or null if the route is not cacheable.
 * Uses pathname only (no query string) because SSR pages do not use query
 * params for content differentiation.
 * @param {string} pathname
 * @returns {string | null}
 */
export function getCacheKey(pathname) {
  return CACHEABLE_PATTERN.test(pathname) ? pathname : null
}

// ---------------------------------------------------------------------------
// LRU cache instance
// Exported so tests can call ssrCache.clear() between runs.
// ---------------------------------------------------------------------------
export const ssrCache = new LRUCache({
  max: 500, // max number of cached pages
  ttl: TTL_DEFAULT, // default TTL; per-entry TTL is set on cache.set()
  allowStale: true, // serve stale while background refresh happens
})

// In-flight map: cacheKey → Promise<CacheEntry | null>
// Prevents multiple concurrent requests from each triggering a full render.
const inflight = new Map()

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Call Vike's renderPage and return a plain cache-friendly entry object.
 * Returns null when httpResponse is absent (Vike defers to next middleware).
 *
 * @param {import('express').Request} req
 * @param {Function} renderPage
 * @param {Record<string, unknown>} extraContext  Additional pageContext fields (e.g. _reqDev in dev mode)
 * @returns {Promise<{ body: string, statusCode: number, headers: [string, string][] } | null>}
 */
async function renderToEntry(req, renderPage, extraContext = {}) {
  const pageContext = await renderPage({
    urlOriginal: req.originalUrl,
    headersOriginal: req.headers,
    ...extraContext,
  })
  const { httpResponse } = pageContext
  if (!httpResponse) return null
  const body = await httpResponse.getBody()
  return {
    body,
    statusCode: httpResponse.statusCode,
    headers: [...httpResponse.headers],
  }
}

/**
 * Write a cache entry to the Express response.
 * Handles both GET (sends body) and HEAD (headers only).
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {{ body: string, statusCode: number, headers: [string, string][] }} entry
 */
function sendEntry(req, res, entry) {
  for (const [name, value] of entry.headers) {
    res.setHeader(name, value)
  }
  res.status(entry.statusCode)
  if (req.method === 'HEAD') {
    res.end()
  } else {
    res.send(entry.body)
  }
}

// ---------------------------------------------------------------------------
// Middleware factory
// ---------------------------------------------------------------------------

/**
 * Returns an Express middleware that caches Vike SSR responses in production.
 *
 * Behaviour:
 *  - Dev mode (isProduction=false): cache is bypassed entirely; renders on every request.
 *  - Non-cacheable routes: rendered and sent without touching the cache.
 *  - Cache MISS: renders, stores 200 responses, adds X-SSR-Cache: MISS header.
 *  - Cache HIT: responds from memory, adds X-SSR-Cache: HIT header.
 *  - In-flight: concurrent requests for the same uncached URL share one render
 *    Promise and receive X-SSR-Cache: COALESCED header.
 *  - 4xx / 5xx: rendered and sent but never stored in cache.
 *
 * @param {{ renderPage: Function, getViteServer: () => any, isProduction: boolean }} options
 * @returns {import('express').RequestHandler}
 */
export function createSsrCacheMiddleware({ renderPage, getViteServer, isProduction }) {
  return async (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next()

    // _reqDev is a Vike dev-mode signal; never sent in production.
    const extraContext = isProduction ? {} : { _reqDev: req }

    try {
      // ----------------------------------------------------------------
      // Dev mode: skip all caching, render directly
      // ----------------------------------------------------------------
      if (!isProduction) {
        const entry = await renderToEntry(req, renderPage, extraContext)
        if (!entry) return next()
        sendEntry(req, res, entry)
        return
      }

      // ----------------------------------------------------------------
      // Production: determine whether this route is cacheable
      // ----------------------------------------------------------------
      const cacheKey = getCacheKey(req.path)

      if (!cacheKey) {
        // SPA catch-all or other non-SSR route — render without caching
        const entry = await renderToEntry(req, renderPage, extraContext)
        if (!entry) return next()
        sendEntry(req, res, entry)
        return
      }

      // ----------------------------------------------------------------
      // Check LRU cache
      // ----------------------------------------------------------------
      const cached = ssrCache.get(cacheKey)
      if (cached) {
        res.setHeader('X-SSR-Cache', 'HIT')
        sendEntry(req, res, cached)
        return
      }

      // ----------------------------------------------------------------
      // In-flight deduplication (thundering herd prevention)
      // ----------------------------------------------------------------
      if (inflight.has(cacheKey)) {
        res.setHeader('X-SSR-Cache', 'COALESCED')
        const entry = await inflight.get(cacheKey)
        if (!entry) return next()
        sendEntry(req, res, entry)
        return
      }

      // ----------------------------------------------------------------
      // Cache miss — render, store, respond
      // ----------------------------------------------------------------
      res.setHeader('X-SSR-Cache', 'MISS')
      const renderPromise = renderToEntry(req, renderPage, extraContext)
      inflight.set(cacheKey, renderPromise)

      try {
        const entry = await renderPromise
        if (!entry) {
          return next()
        }
        if (entry.statusCode === 200) {
          ssrCache.set(cacheKey, entry, { ttl: getTtl(req.path) })
        }
        sendEntry(req, res, entry)
      } finally {
        inflight.delete(cacheKey)
      }
    } catch (error) {
      const viteServer = getViteServer()
      if (viteServer) viteServer.ssrFixStacktrace(error)
      next(error)
    }
  }
}

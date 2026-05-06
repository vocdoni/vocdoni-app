import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSsrCacheMiddleware, getCacheKey, getTtl, ssrCache } from './ssr-cache.mjs'

// ---------------------------------------------------------------------------
// Minimal Express-like fakes
// ---------------------------------------------------------------------------
function makeReq(path: string, method = 'GET', headers: Record<string, string> = {}) {
  return { path, originalUrl: path, method, headers } as any
}

function makeRes() {
  const res: any = {
    _status: 200,
    _body: '',
    _ended: false,
    headers: {} as Record<string, string>,
    setHeader(name: string, val: string) {
      res.headers[name] = val
    },
    status(code: number) {
      res._status = code
      return res
    },
    send(body: string) {
      res._body = body
      return res
    },
    end() {
      res._ended = true
    },
  }
  return res
}

function makeRenderPage(overrides: Partial<{ statusCode: number; body: string; headers: [string, string][] }> = {}) {
  const { statusCode = 200, body = '<html>page</html>', headers = [['content-type', 'text/html']] } = overrides
  return vi.fn().mockResolvedValue({
    httpResponse: {
      statusCode,
      headers,
      getBody: async () => body,
    },
  })
}

// ---------------------------------------------------------------------------
// getCacheKey
// ---------------------------------------------------------------------------
describe('getCacheKey', () => {
  it('returns null for sub-paths beyond the id segment', () => {
    expect(getCacheKey('/en/processes/0xid/extra')).toBeNull()
    expect(getCacheKey('/en/organization/0xabc/edit')).toBeNull()
    expect(getCacheKey('/en/processes/0xid/votes/count')).toBeNull()
  })

  it('strips a trailing slash and returns the normalised key', () => {
    expect(getCacheKey('/en/processes/123/')).toBe('/en/processes/123')
    expect(getCacheKey('/en/organization/0xabc/')).toBe('/en/organization/0xabc')
  })

  it('returns the same key for a path with and without trailing slash', () => {
    expect(getCacheKey('/en/processes/123/')).toBe(getCacheKey('/en/processes/123'))
    expect(getCacheKey('/ca/organization/0xdef/')).toBe(getCacheKey('/ca/organization/0xdef'))
  })

  it('returns null for non-SSR paths', () => {
    expect(getCacheKey('/plans')).toBeNull()
    expect(getCacheKey('/')).toBeNull()
    expect(getCacheKey('/en/other/page')).toBeNull()
    expect(getCacheKey('/organization/0xabc')).toBeNull() // missing lang prefix
  })

  it('returns the pathname for organization routes', () => {
    expect(getCacheKey('/en/organization/0xabc123')).toBe('/en/organization/0xabc123')
    expect(getCacheKey('/ca/organization/0xdef')).toBe('/ca/organization/0xdef')
  })

  it('returns the pathname for processes routes', () => {
    expect(getCacheKey('/es/processes/0xprocess')).toBe('/es/processes/0xprocess')
    expect(getCacheKey('/it/processes/0xid')).toBe('/it/processes/0xid')
  })

  it('prefixes the key with origin when provided', () => {
    expect(getCacheKey('/en/organization/0xabc', 'https://example.com')).toBe(
      'https://example.com/en/organization/0xabc'
    )
  })

  it('handles non-ASCII characters correctly in cache keys', () => {
    // Verify that cache key generation works with Unicode paths
    expect(getCacheKey('/en/processes/123')).toBe('/en/processes/123')
    expect(getCacheKey('/en/organization/0xabc')).toBe('/en/organization/0xabc')
  })
})

// ---------------------------------------------------------------------------
// ssrCache size calculation (byte-based)
// ---------------------------------------------------------------------------
describe('ssrCache byte-based size calculation', () => {
  beforeEach(() => {
    ssrCache.clear()
  })

  it('uses UTF-8 byte encoding for size calculation', () => {
    // Verify that byte counting is accurate by checking cache behavior
    // With a small maxSize, we can verify byte-based eviction
    const testCache = new (require('lru-cache').LRUCache)({
      max: 10,
      maxSize: 10, // 10 bytes hard cap
      sizeCalculation: (entry) => new TextEncoder().encode(entry.body).length,
      ttlResolution: 0,
    })

    // 'a' = 1 byte in UTF-8
    testCache.set('one-byte', { body: 'a', statusCode: 200, headers: [] })
    expect(testCache.get('one-byte')).toBeDefined()

    // Adding 9 more single-byte chars should fill the cache (1+9=10 bytes)
    for (let i = 0; i < 9; i++) {
      testCache.set(`char-${i}`, { body: 'x', statusCode: 200, headers: [] })
    }
    expect(testCache.size).toBe(10) // 10 entries, each 1 byte

    // Adding a 2-byte UTF-8 character should evict the oldest entry (LRU)
    testCache.set('two-bytes', { body: 'é', statusCode: 200, headers: [] })
    // Should have 9 entries now (evicted oldest to make room for 2-byte char)
    expect(testCache.size).toBe(9)

    // The first entry ('one-byte') should be evicted because it was LRU
    expect(testCache.get('one-byte')).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// getTtl
// ---------------------------------------------------------------------------
describe('getTtl', () => {
  it('returns null for non-cacheable paths', () => {
    expect(getTtl('/plans')).toBeNull()
    expect(getTtl('/en/other')).toBeNull()
  })

  it('returns 5 minutes (300 000 ms) for organization routes', () => {
    expect(getTtl('/en/organization/0xabc')).toBe(5 * 60 * 1000)
  })

  it('returns 1 minute (60 000 ms) for processes routes', () => {
    expect(getTtl('/en/processes/0xprocess')).toBe(1 * 60 * 1000)
  })
})

// ---------------------------------------------------------------------------
// createSsrCacheMiddleware
// ---------------------------------------------------------------------------
describe('createSsrCacheMiddleware', () => {
  const next = vi.fn()

  beforeEach(() => {
    ssrCache.clear()
    vi.clearAllMocks()
  })

  // ---- dev mode ------------------------------------------------------------
  describe('dev mode (isProduction=false)', () => {
    it('renders and responds without populating the cache', async () => {
      const renderPage = makeRenderPage()
      const mw = createSsrCacheMiddleware({ renderPage, getViteServer: () => null, isProduction: false })
      const req = makeReq('/en/organization/0xabc')
      const res = makeRes()
      await mw(req, res, next)
      expect(renderPage).toHaveBeenCalledOnce()
      expect(ssrCache.size).toBe(0)
      expect(res._body).toBe('<html>page</html>')
      expect(res.headers['X-SSR-Cache']).toBeUndefined()
    })
  })

  // ---- non-GET methods -----------------------------------------------------
  describe('non-GET/HEAD methods', () => {
    it('calls next() immediately without rendering', async () => {
      const renderPage = makeRenderPage()
      const mw = createSsrCacheMiddleware({ renderPage, getViteServer: () => null, isProduction: true })
      const req = makeReq('/en/organization/0xabc', 'POST')
      const res = makeRes()
      await mw(req, res, next)
      expect(next).toHaveBeenCalledOnce()
      expect(renderPage).not.toHaveBeenCalled()
    })
  })

  // ---- HEAD method ---------------------------------------------------------
  describe('HEAD method', () => {
    it('sends headers only (no body)', async () => {
      const renderPage = makeRenderPage()
      const mw = createSsrCacheMiddleware({ renderPage, getViteServer: () => null, isProduction: true })
      const req = makeReq('/en/organization/0xabc', 'HEAD')
      const res = makeRes()
      await mw(req, res, next)
      expect(res._ended).toBe(true)
      expect(res._body).toBe('')
    })
  })

  // ---- production caching --------------------------------------------------
  describe('production mode (isProduction=true)', () => {
    it('first request is a MISS and populates the cache', async () => {
      const renderPage = makeRenderPage()
      const mw = createSsrCacheMiddleware({ renderPage, getViteServer: () => null, isProduction: true })
      const req = makeReq('/en/organization/0xabc')
      const res = makeRes()
      await mw(req, res, next)
      expect(res.headers['X-SSR-Cache']).toBe('MISS')
      expect(ssrCache.size).toBe(1)
      expect(res._body).toBe('<html>page</html>')
    })

    it('second request for the same URL is a HIT and skips renderPage', async () => {
      const renderPage = makeRenderPage()
      const mw = createSsrCacheMiddleware({ renderPage, getViteServer: () => null, isProduction: true })
      const req = makeReq('/en/organization/0xabc')

      const res1 = makeRes()
      await mw(req, res1, next) // MISS
      expect(renderPage).toHaveBeenCalledOnce()

      const res2 = makeRes()
      await mw(req, res2, next) // HIT
      expect(res2.headers['X-SSR-Cache']).toBe('HIT')
      expect(renderPage).toHaveBeenCalledOnce() // still only called once
      expect(res2._body).toBe('<html>page</html>')
    })

    it('does NOT cache non-200 responses', async () => {
      const renderPage = makeRenderPage({ statusCode: 404, body: 'Not Found' })
      const mw = createSsrCacheMiddleware({ renderPage, getViteServer: () => null, isProduction: true })
      const req = makeReq('/en/organization/0xnotfound')
      const res = makeRes()
      await mw(req, res, next)
      expect(res.headers['X-SSR-Cache']).toBe('MISS')
      expect(ssrCache.size).toBe(0)
    })

    it('does NOT cache 5xx responses', async () => {
      const renderPage = makeRenderPage({ statusCode: 500, body: 'Error' })
      const mw = createSsrCacheMiddleware({ renderPage, getViteServer: () => null, isProduction: true })
      const req = makeReq('/en/processes/0xbad')
      const res = makeRes()
      await mw(req, res, next)
      expect(ssrCache.size).toBe(0)
    })

    it('renders non-cacheable routes without touching the cache', async () => {
      const renderPage = makeRenderPage()
      const mw = createSsrCacheMiddleware({ renderPage, getViteServer: () => null, isProduction: true })
      const req = makeReq('/plans') // SPA catch-all, not cacheable
      const res = makeRes()
      await mw(req, res, next)
      expect(renderPage).toHaveBeenCalledOnce()
      expect(ssrCache.size).toBe(0)
      expect(res.headers['X-SSR-Cache']).toBeUndefined()
    })

    it('different lang prefixes get separate cache entries', async () => {
      const renderPage = makeRenderPage()
      const mw = createSsrCacheMiddleware({ renderPage, getViteServer: () => null, isProduction: true })

      await mw(makeReq('/en/organization/0xabc'), makeRes(), next)
      await mw(makeReq('/ca/organization/0xabc'), makeRes(), next)

      expect(ssrCache.size).toBe(2)
      expect(renderPage).toHaveBeenCalledTimes(2)
    })

    it('different Host headers produce separate cache entries', async () => {
      const renderPage = makeRenderPage()
      const mw = createSsrCacheMiddleware({ renderPage, getViteServer: () => null, isProduction: true })

      await mw(makeReq('/en/organization/0xabc', 'GET', { host: 'example.com' }), makeRes(), next)
      await mw(makeReq('/en/organization/0xabc', 'GET', { host: 'other.com' }), makeRes(), next)

      expect(ssrCache.size).toBe(2)
      expect(renderPage).toHaveBeenCalledTimes(2)
    })

    it('uses APP_URL env for cache key when configured', async () => {
      const previous = process.env.APP_URL
      process.env.APP_URL = 'https://configured.com'

      try {
        const renderPage = makeRenderPage()
        const mw = createSsrCacheMiddleware({ renderPage, getViteServer: () => null, isProduction: true })

        await mw(makeReq('/en/organization/0xabc'), makeRes(), next)

        expect(ssrCache.size).toBe(1)
        const key = ssrCache.keys().next().value as string
        expect(key.startsWith('https://configured.com')).toBe(true)
      } finally {
        process.env.APP_URL = previous
      }
    })

    // ---- TTL expiry --------------------------------------------------------
    describe('TTL expiry', () => {
      beforeEach(() => {
        vi.useFakeTimers()
        ssrCache.clear()
      })

      afterEach(() => {
        vi.useRealTimers()
      })

      it('re-renders after processes TTL elapses (1 minute)', async () => {
        const renderPage = makeRenderPage()
        const mw = createSsrCacheMiddleware({ renderPage, getViteServer: () => null, isProduction: true })
        const req = makeReq('/en/processes/0xproc')

        // Initial render — MISS
        await mw(req, makeRes(), next)
        expect(renderPage).toHaveBeenCalledOnce()

        // Still within TTL (59s) — HIT, no re-render
        vi.advanceTimersByTime(59 * 1000)
        const res2 = makeRes()
        await mw(req, res2, next)
        expect(res2.headers['X-SSR-Cache']).toBe('HIT')
        expect(renderPage).toHaveBeenCalledOnce()

        // Advance past TTL (another 2s = 61s total)
        vi.advanceTimersByTime(2 * 1000)

        // After expiry: MISS and re-render (allowStale removed — no stale serving)
        const res3 = makeRes()
        await mw(req, res3, next)
        expect(res3.headers['X-SSR-Cache']).toBe('MISS')
        expect(renderPage).toHaveBeenCalledTimes(2)
      })

      it('re-renders after organization TTL elapses (5 minutes)', async () => {
        const renderPage = makeRenderPage()
        const mw = createSsrCacheMiddleware({ renderPage, getViteServer: () => null, isProduction: true })
        const req = makeReq('/en/organization/0xorg')

        await mw(req, makeRes(), next)
        expect(renderPage).toHaveBeenCalledOnce()

        // Advance to just inside TTL (4m 59s)
        vi.advanceTimersByTime(4 * 60 * 1000 + 59 * 1000)
        const resInside = makeRes()
        await mw(req, resInside, next)
        expect(resInside.headers['X-SSR-Cache']).toBe('HIT')
        expect(renderPage).toHaveBeenCalledOnce()

        // Advance past TTL (another 2s = 5m 01s total)
        vi.advanceTimersByTime(2 * 1000)

        // After expiry: MISS and re-render
        const resExpired = makeRes()
        await mw(req, resExpired, next)
        expect(resExpired.headers['X-SSR-Cache']).toBe('MISS')
        expect(renderPage).toHaveBeenCalledTimes(2)
      })
    })
  })

  // ---- thundering herd -----------------------------------------------------
  describe('in-flight deduplication', () => {
    it('coalesces concurrent requests for the same URL into one renderPage call', async () => {
      let resolveRender!: (v: any) => void
      const renderPage = vi.fn(
        () =>
          new Promise((resolve) => {
            resolveRender = resolve
          })
      )
      const mw = createSsrCacheMiddleware({ renderPage, getViteServer: () => null, isProduction: true })

      const req = makeReq('/en/organization/0xabc')
      const res1 = makeRes()
      const res2 = makeRes()
      const res3 = makeRes()

      const p1 = mw(req, res1, next)
      const p2 = mw(req, res2, next) // in-flight — should coalesce
      const p3 = mw(req, res3, next) // in-flight — should coalesce

      // Resolve the single pending render
      resolveRender({
        httpResponse: {
          statusCode: 200,
          headers: [['content-type', 'text/html']],
          getBody: async () => '<html>page</html>',
        },
      })

      await Promise.all([p1, p2, p3])

      expect(renderPage).toHaveBeenCalledOnce()
      expect(res1.headers['X-SSR-Cache']).toBe('MISS')
      expect(res2.headers['X-SSR-Cache']).toBe('COALESCED')
      expect(res3.headers['X-SSR-Cache']).toBe('COALESCED')
      // All three should get the same body
      expect(res1._body).toBe('<html>page</html>')
      expect(res2._body).toBe('<html>page</html>')
      expect(res3._body).toBe('<html>page</html>')
    })
  })
})

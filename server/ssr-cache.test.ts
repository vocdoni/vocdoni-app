import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSsrCacheMiddleware, getCacheKey, getTtl, ssrCache } from './ssr-cache.mjs'

// ---------------------------------------------------------------------------
// Minimal Express-like fakes
// ---------------------------------------------------------------------------
function makeReq(path: string, method = 'GET') {
  return { path, originalUrl: path, method, headers: {} } as any
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

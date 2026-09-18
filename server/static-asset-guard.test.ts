import { describe, expect, it } from 'vitest'
import { isStaticAssetPath } from './static-asset-guard.mjs'

describe('isStaticAssetPath', () => {
  describe('asset paths (should return true)', () => {
    it('matches a hashed JS chunk — the exact shape that rendered HTML in production', () => {
      expect(isStaticAssetPath('/assets/chunks/chunk-Cg13UnLT.js')).toBe(true)
    })

    it('matches a source map, so PostHog gets a 404 instead of unparseable HTML', () => {
      expect(isStaticAssetPath('/assets/chunks/chunk-BKTaTSkx.js.map')).toBe(true)
    })

    it('matches stylesheets', () => {
      expect(isStaticAssetPath('/assets/index-DxK2.css')).toBe(true)
    })

    it('matches public/ files served from the root', () => {
      expect(isStaticAssetPath('/favicon.ico')).toBe(true)
      expect(isStaticAssetPath('/manifest.json')).toBe(true)
      expect(isStaticAssetPath('/robots.txt')).toBe(true)
    })

    it('matches fonts and images at any depth', () => {
      expect(isStaticAssetPath('/fonts/inter-latin-400.woff2')).toBe(true)
      expect(isStaticAssetPath('/assets/shared/logo.svg')).toBe(true)
    })

    it('is case-insensitive on the extension', () => {
      expect(isStaticAssetPath('/assets/LOGO.PNG')).toBe(true)
    })

    it('holds for a non-root base URL', () => {
      expect(isStaticAssetPath('/app/assets/chunks/chunk-Cg13UnLT.js')).toBe(true)
    })

    // `express.static` decodes before resolving files, so these are missing
    // assets there too; the raw `req.path` must not let them reach the renderer.
    it('matches percent-encoded dots and extension characters', () => {
      expect(isStaticAssetPath('/assets/missing%2Ejs')).toBe(true)
      expect(isStaticAssetPath('/assets/missing.%6As')).toBe(true)
      expect(isStaticAssetPath('/assets/missing%2Ejs%2Emap')).toBe(true)
    })

    it('answers malformed escapes with the 404 rather than the renderer', () => {
      expect(isStaticAssetPath('/assets/missing%.js')).toBe(true)
      expect(isStaticAssetPath('/scan%')).toBe(true)
    })

    it('answers dotfile probes with the 404 rather than the renderer', () => {
      expect(isStaticAssetPath('/.env')).toBe(true)
      expect(isStaticAssetPath('/.git/config')).toBe(true)
      expect(isStaticAssetPath('/.well-known/security.txt')).toBe(true)
    })

    it('matches less common media and archive types', () => {
      expect(isStaticAssetPath('/assets/clip.mov')).toBe(true)
      expect(isStaticAssetPath('/assets/photo.heic')).toBe(true)
      expect(isStaticAssetPath('/assets/bundle.tar.gz')).toBe(true)
    })
  })

  describe('page paths (should return false)', () => {
    it('allows root', () => {
      expect(isStaticAssetPath('/')).toBe(false)
    })

    it('allows SSR public pages', () => {
      expect(isStaticAssetPath('/en/organization/0xabc')).toBe(false)
      expect(isStaticAssetPath('/ca/processes/0xdef')).toBe(false)
      expect(isStaticAssetPath('/ca/processes/0xdef/summary')).toBe(false)
    })

    it('allows SPA dashboard routes', () => {
      expect(isStaticAssetPath('/es/admin/processes/create')).toBe(false)
      expect(isStaticAssetPath('/account/signin')).toBe(false)
    })

    it('allows base64url process ids, which never contain a dot', () => {
      expect(isStaticAssetPath('/en/processes/MHhlM2QzMm_-abc')).toBe(false)
    })

    it('does not treat an unknown extension as an asset', () => {
      expect(isStaticAssetPath('/en/organization/0xabc.eth')).toBe(false)
    })

    it('ignores a trailing dot with no extension', () => {
      expect(isStaticAssetPath('/some/path.')).toBe(false)
    })

    it('only looks at the last segment, not at directories', () => {
      expect(isStaticAssetPath('/assets.js/admin/processes')).toBe(false)
    })

    // Vike Client Routing fetches page data here; 404ing it breaks client-side
    // navigation between the SSR public pages.
    it('allows Vike page-context data requests', () => {
      expect(isStaticAssetPath('/en/organization/0xabc/index.pageContext.json')).toBe(false)
      expect(isStaticAssetPath('/index.pageContext.json')).toBe(false)
      expect(isStaticAssetPath('/ca/processes/0xdef/summary/index.pageContext.json')).toBe(false)
    })

    it('still allows Vike page-context data requests with encoded dots', () => {
      expect(isStaticAssetPath('/en/organization/0xabc/index.pageContext%2Ejson')).toBe(false)
    })

    it('tolerates a non-string input', () => {
      expect(isStaticAssetPath(undefined as unknown as string)).toBe(false)
    })
  })
})

import express from 'express'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createDevMiddleware, renderPage } from 'vike/server'
import { getSupportedPublicLanguagesFromEnv, publicLanguageRedirect } from './public-language-routing.mjs'
import { robotsTxtHandler } from './robots.mjs'
import { securityHeaders } from './security-headers.mjs'
import { createSsrCacheMiddleware } from './ssr-cache.mjs'
import { isStaticAssetPath } from './static-asset-guard.mjs'
import { staticCacheHeaders } from './static-cache.mjs'
import { isViteInternalPath } from './vite-path-guard.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
// Where `vike build` wrote the app. The UI snapshot's --build mode points it at its own build.
const distDir = resolve(root, process.env.DIST_DIR || 'dist')
const isProduction = process.env.NODE_ENV === 'production'
const port = Number(process.env.PORT || 3000)
// Unset: all interfaces. The UI snapshot's --build mode sets 127.0.0.1.
const host = process.env.UI_SNAPSHOT_HOST || undefined

const app = express()
app.disable('x-powered-by')
const supportedPublicLanguages = getSupportedPublicLanguagesFromEnv(process.env)
let viteServer

// Production warning: APP_URL should be configured for reliable cache partitioning
if (isProduction && !process.env.APP_URL?.trim()) {
  console.warn(
    '⚠️  WARNING: APP_URL is not set in production mode.\n' +
      '  The SSR cache will derive its partition key from the x-forwarded-host header.\n' +
      '  This requires a trusted reverse proxy to set this header correctly.\n' +
      '  Without APP_URL configured, different origins may share cache entries incorrectly.\n' +
      '  Set APP_URL environment variable to ensure consistent cache partitioning.'
  )
}

app.use(securityHeaders({ isProduction }))
// Before the static and dev middleware, which would otherwise serve public/ files.
app.use(robotsTxtHandler())

if (isProduction) {
  await import(pathToFileURL(join(distDir, 'server/entry.mjs')).href)

  app.use(
    express.static(join(distDir, 'client'), {
      index: false,
      setHeaders: staticCacheHeaders,
    })
  )
} else {
  const { devMiddleware, viteServer: devServer } = await createDevMiddleware({ root })
  viteServer = devServer
  app.use(devMiddleware)
}

// Request guards and the language redirect below must run before SSR, so they
// answer before any cache lookup or render attempt.
app.use((req, res, next) => {
  if (!['GET', 'HEAD'].includes(req.method)) return next()
  // Block Vite-internal dev-only URL patterns that should never reach production
  // These are common security scanner probes and Vite internal paths
  if (isViteInternalPath(req.path)) {
    return res.status(404).end()
  }
  // Static files were served above. Anything still carrying a file extension is
  // a missing asset: answer 404 instead of letting the catch-all page render HTML
  // under an asset URL (see static-asset-guard.mjs).
  if (isStaticAssetPath(req.path)) {
    res.setHeader('Cache-Control', 'no-store')
    return res.status(404).end()
  }
  next()
})

// Unprefixed navigations get their language on the server, instead of a client
// shell that only exists to call location.replace.
app.use(
  publicLanguageRedirect({
    supportedLanguages: supportedPublicLanguages,
    // Same source and trimming as the app env (src/app-env-build.ts).
    homeProcessId: process.env.HOME_PROCESS_ID,
  })
)

// SSR render middleware — caches responses in production, bypasses cache in dev.
app.use(
  createSsrCacheMiddleware({
    renderPage,
    getViteServer: () => viteServer,
    isProduction,
    // SSR_CACHE=off renders every request (the UI snapshot's --build mode).
    cache: process.env.SSR_CACHE !== 'off',
  })
)

app.use((error, _req, res, _next) => {
  console.error(error)
  if (res.headersSent) return
  res.status(500).send('Internal Server Error')
})

app.listen(port, host, () => {
  console.log(`Server running at http://localhost:${port}`)
})

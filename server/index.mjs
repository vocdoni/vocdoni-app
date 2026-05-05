import express from 'express'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createDevMiddleware, renderPage } from 'vike/server'
import { getSupportedPublicLanguagesFromEnv, resolvePublicLanguageRedirect } from './public-language-routing.mjs'
import { isViteInternalPath } from './vite-path-guard.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const isProduction = process.env.NODE_ENV === 'production'
const port = Number(process.env.PORT || 3000)

const app = express()
const supportedPublicLanguages = getSupportedPublicLanguagesFromEnv(process.env)
let viteServer

if (isProduction) {
  await import(pathToFileURL(join(root, 'dist/server/entry.mjs')).href)

  app.use(
    express.static(join(root, 'dist/client'), {
      index: false,
    })
  )
} else {
  const { devMiddleware, viteServer: devServer } = await createDevMiddleware({ root })
  viteServer = devServer
  app.use(devMiddleware)
}

app.use(async (req, res, next) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    return next()
  }

  // Block Vite-internal dev-only URL patterns that should never reach production
  // These are common security scanner probes and Vite internal paths
  if (isViteInternalPath(req.path)) {
    return res.status(404).end()
  }

  const redirectTarget = resolvePublicLanguageRedirect({
    urlOriginal: req.originalUrl,
    cookieHeader: req.headers.cookie,
    supportedLanguages: supportedPublicLanguages,
  })

  if (redirectTarget) {
    return res.redirect(307, redirectTarget)
  }

  try {
    const pageContext = await renderPage({
      urlOriginal: req.originalUrl,
      headersOriginal: req.headers,
      ...(isProduction ? {} : { _reqDev: req }),
    })

    const { httpResponse } = pageContext
    if (!httpResponse) {
      return next()
    }

    for (const [name, value] of httpResponse.headers) {
      res.setHeader(name, value)
    }

    res.status(httpResponse.statusCode)

    if (req.method === 'HEAD') {
      return res.end()
    }

    res.send(await httpResponse.getBody())
  } catch (error) {
    if (viteServer) {
      viteServer.ssrFixStacktrace(error)
    }
    next(error)
  }
})

app.use((error, _req, res, _next) => {
  console.error(error)
  if (res.headersSent) return
  res.status(500).send('Internal Server Error')
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})

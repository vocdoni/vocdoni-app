import express from 'express'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createDevMiddleware, renderPage } from 'vike/server'

const DEFAULT_LANGUAGES = { en: 'English' }
const PUBLIC_LANGUAGE_COOKIE_KEY = 'vocdoni-public-language'

const normalizeSupportedLanguages = (languages) => {
  if (Array.isArray(languages) && languages.length > 0) {
    return languages
  }

  return Object.keys(DEFAULT_LANGUAGES)
}

const getSupportedPublicLanguagesFromEnv = (env = process.env) => {
  const rawValue = env?.LANGUAGES

  if (!rawValue) {
    return Object.keys(DEFAULT_LANGUAGES)
  }

  if (typeof rawValue === 'string') {
    try {
      const parsed = JSON.parse(rawValue)

      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return normalizeSupportedLanguages(Object.keys(parsed))
      }
    } catch {
      return Object.keys(DEFAULT_LANGUAGES)
    }
  }

  if (rawValue && typeof rawValue === 'object' && !Array.isArray(rawValue)) {
    return normalizeSupportedLanguages(Object.keys(rawValue))
  }

  return Object.keys(DEFAULT_LANGUAGES)
}

const getDefaultPublicLanguage = (supportedLanguages) =>
  supportedLanguages.includes('en') ? 'en' : supportedLanguages[0]

const normalizePublicLanguageCandidate = (candidate, supportedLanguages) => {
  const normalizedCandidate = candidate?.trim().toLowerCase().replace(/_/g, '-') ?? ''

  if (!normalizedCandidate) return null
  if (supportedLanguages.includes(normalizedCandidate)) return normalizedCandidate

  const baseLanguage = normalizedCandidate.split('-')[0]

  return supportedLanguages.includes(baseLanguage) ? baseLanguage : null
}

const readCookieValue = (cookieHeader, key) => {
  if (!cookieHeader) return null

  const entry = cookieHeader
    .split(';')
    .map((segment) => segment.trim())
    .find((segment) => segment.startsWith(`${key}=`))

  if (!entry) return null

  return decodeURIComponent(entry.slice(key.length + 1))
}

const getPublicLanguageFromCookie = ({ cookieHeader, supportedLanguages }) => {
  const cookieLanguage = readCookieValue(cookieHeader, PUBLIC_LANGUAGE_COOKIE_KEY)

  return cookieLanguage ? normalizePublicLanguageCandidate(cookieLanguage, supportedLanguages) : null
}

const matchPublicEntityRoute = ({ pathname, supportedLanguages }) => {
  const bareOrganizationMatch = pathname.match(/^\/organization\/([^/]+)\/?$/)
  if (bareOrganizationMatch) {
    return {
      routeType: 'organization',
      addressOrId: bareOrganizationMatch[1],
      bare: true,
    }
  }

  const bareProcessMatch = pathname.match(/^\/processes\/([^/]+)\/?$/)
  if (bareProcessMatch) {
    return {
      routeType: 'process',
      addressOrId: bareProcessMatch[1],
      bare: true,
    }
  }

  const localizedOrganizationMatch = pathname.match(/^\/([^/]+)\/organization\/([^/]+)\/?$/)
  if (localizedOrganizationMatch) {
    const [, routeLanguage, addressOrId] = localizedOrganizationMatch

    if (!supportedLanguages.includes(routeLanguage)) return null

    return {
      routeType: 'organization',
      addressOrId,
      routeLanguage,
      bare: false,
    }
  }

  const localizedProcessMatch = pathname.match(/^\/([^/]+)\/processes\/([^/]+)\/?$/)
  if (localizedProcessMatch) {
    const [, routeLanguage, addressOrId] = localizedProcessMatch

    if (!supportedLanguages.includes(routeLanguage)) return null

    return {
      routeType: 'process',
      addressOrId,
      routeLanguage,
      bare: false,
    }
  }

  return null
}

const buildLocalizedPublicPath = ({ routeType, language, addressOrId }) => {
  if (routeType === 'organization') {
    return `/${language}/organization/${addressOrId}`
  }

  return `/${language}/processes/${addressOrId}`
}

const resolvePublicLanguageRedirect = ({
  urlOriginal,
  cookieHeader,
  supportedLanguages = getSupportedPublicLanguagesFromEnv(),
}) => {
  const languages = normalizeSupportedLanguages(supportedLanguages)
  const url = new URL(urlOriginal, 'http://localhost')
  const route = matchPublicEntityRoute({
    pathname: url.pathname,
    supportedLanguages: languages,
  })

  if (!route) return null

  const cookieLanguage = getPublicLanguageFromCookie({
    cookieHeader,
    supportedLanguages: languages,
  })
  const preferredLanguage = route.bare ? cookieLanguage ?? getDefaultPublicLanguage(languages) : cookieLanguage

  if (!preferredLanguage) return null
  if (!route.bare && route.routeLanguage === preferredLanguage) {
    return null
  }

  const localizedPath = buildLocalizedPublicPath({
    routeType: route.routeType,
    language: preferredLanguage,
    addressOrId: route.addressOrId,
  })

  return `${localizedPath}${url.search}`
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'
const port = Number(process.env.PORT || 3000)

const app = express()
const supportedPublicLanguages = getSupportedPublicLanguagesFromEnv(process.env)
let viteServer

if (isProduction) {
  await import(pathToFileURL(join(__dirname, 'dist/server/entry.mjs')).href)

  app.use(
    express.static(join(__dirname, 'dist/client'), {
      index: false,
    })
  )
} else {
  const { devMiddleware, viteServer: devServer } = await createDevMiddleware({ root: __dirname })
  viteServer = devServer
  app.use(devMiddleware)
}

app.use(async (req, res, next) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    return next()
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

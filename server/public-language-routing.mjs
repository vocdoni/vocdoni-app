// Mirrors baseLanguages and resolveLanguagesSlice in src/i18n/languages.ts, which this
// plain Node server cannot import. The test checks both stay in step.
const BASE_LANGUAGES = ['ca', 'de', 'el', 'en', 'es', 'eu', 'fr', 'it', 'pt', 'pt-br']
const PUBLIC_LANGUAGE_COOKIE_KEY = 'vocdoni-public-language'
// Vike Client Routing fetches page data from `<pathname>/index.pageContext.json`.
const VIKE_PAGE_CONTEXT_SUFFIX = '.pageContext.json'

const normalizeSupportedLanguages = (languages) => {
  if (Array.isArray(languages) && languages.length > 0) {
    return languages
  }

  return [...BASE_LANGUAGES]
}

// LANGUAGES is a comma-separated list of codes; unset or without a single valid
// code means every base language, as in the app.
export const getSupportedPublicLanguagesFromEnv = (env = process.env) => {
  const rawValue = env?.LANGUAGES

  if (typeof rawValue !== 'string' || !rawValue) return [...BASE_LANGUAGES]

  const languages = rawValue
    .split(',')
    .map((language) => language.trim())
    .filter((language) => BASE_LANGUAGES.includes(language))

  return normalizeSupportedLanguages(languages)
}

const getDefaultPublicLanguage = (supportedLanguages) =>
  supportedLanguages.includes('en') ? 'en' : supportedLanguages[0]

export const normalizePublicLanguageCandidate = (candidate, supportedLanguages) => {
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

  try {
    return decodeURIComponent(entry.slice(key.length + 1))
  } catch {
    return null
  }
}

const CONSENT_COOKIE_KEY = 'vocdoni-cookie-consent'

const readCookieValues = (cookieHeader, key) =>
  (cookieHeader ?? '')
    .split(';')
    .map((segment) => segment.trim())
    .filter((segment) => segment.startsWith(`${key}=`))
    .map((segment) => {
      try {
        return decodeURIComponent(segment.slice(key.length + 1))
      } catch {
        return null
      }
    })

// Mirrors readConsentCookie in src/components/Cookies/utils.ts: the first recognised decision wins.
const hasAcceptedCookieConsent = (cookieHeader) =>
  readCookieValues(cookieHeader, CONSENT_COOKIE_KEY).find((value) => value === 'accepted' || value === 'rejected') ===
  'accepted'

const getPublicLanguageFromCookie = ({ cookieHeader, supportedLanguages }) => {
  // The client only trusts this cookie with consent (getPersistedPublicLanguageClient). Following it
  // without would bounce forever against the language the client has stored.
  if (!hasAcceptedCookieConsent(cookieHeader)) return null

  const cookieLanguage = readCookieValue(cookieHeader, PUBLIC_LANGUAGE_COOKIE_KEY)

  return cookieLanguage ? normalizePublicLanguageCandidate(cookieLanguage, supportedLanguages) : null
}

// First supported entry of an Accept-Language header, by descending q weight.
export const getPublicLanguageFromAcceptLanguage = (header, supportedLanguages) => {
  if (typeof header !== 'string' || !header) return null

  const candidates = header
    .split(',')
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(';')
      const qParam = params.map((param) => param.trim()).find((param) => param.startsWith('q='))
      const q = qParam ? Number(qParam.slice(2)) : 1

      return { tag: tag.trim(), q: Number.isFinite(q) ? q : 0, index }
    })
    .filter(({ tag, q }) => tag && tag !== '*' && q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index)

  for (const { tag } of candidates) {
    const language = normalizePublicLanguageCandidate(tag, supportedLanguages)
    if (language) return language
  }

  return null
}

const matchLocalizedPublicEntityRoute = ({ pathname, supportedLanguages }) => {
  const match =
    pathname.match(/^\/([^/]+)\/(organization)\/([^/]+)\/?$/) ?? pathname.match(/^\/([^/]+)\/(processes)\/([^/]+)\/?$/)

  if (!match) return null

  const [, routeLanguage, segment, addressOrId] = match

  if (!supportedLanguages.includes(routeLanguage)) return null

  return { routeLanguage, segment, addressOrId }
}

const hasLanguagePrefix = (pathname, supportedLanguages) => supportedLanguages.includes(pathname.split('/')[1])

/**
 * Where a navigation request should be redirected to carry a language prefix, or null.
 *
 * - Unprefixed paths get `/<lang>` in front: language cookie, then Accept-Language,
 *   then the default. This replaces the client shell whose only job was that redirect.
 * - With HOME_PROCESS_ID set, `/` is the process page itself; it only redirects when
 *   the visitor prefers a language other than the default (cookie or Accept-Language).
 * - Localized organization and process pages follow the cookie (an explicit choice),
 *   never Accept-Language: a link in a given language keeps it.
 */
export const resolvePublicLanguageRedirect = ({
  urlOriginal,
  cookieHeader,
  acceptLanguageHeader,
  supportedLanguages = getSupportedPublicLanguagesFromEnv(),
  homeProcessId,
}) => {
  const languages = normalizeSupportedLanguages(supportedLanguages)
  const url = new URL(urlOriginal, 'http://localhost')
  const { pathname, search } = url

  if (pathname.endsWith(VIKE_PAGE_CONTEXT_SUFFIX)) return null

  const cookieLanguage = getPublicLanguageFromCookie({ cookieHeader, supportedLanguages: languages })

  if (hasLanguagePrefix(pathname, languages)) {
    const route = matchLocalizedPublicEntityRoute({ pathname, supportedLanguages: languages })

    if (!route || !cookieLanguage || route.routeLanguage === cookieLanguage) return null

    return `/${cookieLanguage}/${route.segment}/${route.addressOrId}${search}`
  }

  const defaultLanguage = getDefaultPublicLanguage(languages)
  const visitorLanguage = cookieLanguage ?? getPublicLanguageFromAcceptLanguage(acceptLanguageHeader, languages)
  const isRoot = pathname === '/'

  if (isRoot && homeProcessId?.trim() && (!visitorLanguage || visitorLanguage === defaultLanguage)) {
    return null
  }

  return `/${visitorLanguage ?? defaultLanguage}${isRoot ? '' : pathname}${search}`
}

/**
 * Express middleware answering navigations that lack the right language prefix with a 302.
 * The target depends on the cookie and Accept-Language, so shared caches must not keep it.
 */
export const publicLanguageRedirect =
  ({ supportedLanguages, homeProcessId } = {}) =>
  (req, res, next) => {
    if (!['GET', 'HEAD'].includes(req.method)) return next()

    const target = resolvePublicLanguageRedirect({
      urlOriginal: req.originalUrl,
      cookieHeader: req.headers.cookie,
      acceptLanguageHeader: req.headers['accept-language'],
      supportedLanguages,
      homeProcessId,
    })

    if (!target) return next()

    res.setHeader('Vary', 'Accept-Language, Cookie')
    res.setHeader('Cache-Control', 'no-store')
    res.redirect(302, target)
  }

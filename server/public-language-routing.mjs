const DEFAULT_LANGUAGES = { en: 'English' }
const PUBLIC_LANGUAGE_COOKIE_KEY = 'vocdoni-public-language'

const normalizeSupportedLanguages = (languages) => {
  if (Array.isArray(languages) && languages.length > 0) {
    return languages
  }

  return Object.keys(DEFAULT_LANGUAGES)
}

export const getSupportedPublicLanguagesFromEnv = (env = process.env) => {
  const rawValue = env?.LANGUAGES

  if (!rawValue) {
    return Object.keys(DEFAULT_LANGUAGES)
  }

  if (typeof rawValue === 'string') {
    try {
      const parsed = JSON.parse(rawValue)

      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const languages = Object.keys(parsed)
        return normalizeSupportedLanguages(languages)
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

export const getDefaultPublicLanguage = (supportedLanguages) =>
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

export const resolvePublicLanguageRedirect = ({
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
  const preferredLanguage = route.bare ? (cookieLanguage ?? getDefaultPublicLanguage(languages)) : cookieLanguage

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

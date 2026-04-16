import { getLanguagesEnv } from '~src/app-env'

export const PUBLIC_LANGUAGE_STORAGE_KEY = 'i18nextLng'

export const getSupportedPublicLanguages = () => Object.keys(getLanguagesEnv())

export const getDefaultPublicLanguage = (supportedLanguages: string[]) =>
  supportedLanguages.includes('en') ? 'en' : supportedLanguages[0]

export const normalizePublicLanguageCandidate = (
  candidate: string | null | undefined,
  supportedLanguages: string[]
) => {
  const normalizedCandidate = candidate?.trim().toLowerCase().replace(/_/g, '-') ?? ''

  if (!normalizedCandidate) return null
  if (supportedLanguages.includes(normalizedCandidate)) return normalizedCandidate

  const baseLanguage = normalizedCandidate.split('-')[0]

  return supportedLanguages.includes(baseLanguage) ? baseLanguage : null
}

export const getStoredPublicLanguage = ({
  supportedLanguages,
  storage,
}: {
  supportedLanguages: string[]
  storage?: Pick<Storage, 'getItem'>
}) => {
  const storageLanguage = storage?.getItem(PUBLIC_LANGUAGE_STORAGE_KEY)

  return storageLanguage ? normalizePublicLanguageCandidate(storageLanguage, supportedLanguages) : null
}

export const persistPublicLanguage = (
  language: string,
  {
    supportedLanguages,
    storage,
  }: {
    supportedLanguages: string[]
    storage?: Pick<Storage, 'setItem'>
  }
) => {
  const normalizedLanguage = normalizePublicLanguageCandidate(language, supportedLanguages)

  if (normalizedLanguage) {
    storage?.setItem(PUBLIC_LANGUAGE_STORAGE_KEY, normalizedLanguage)
  }

  return normalizedLanguage
}

export const resolvePreferredPublicLanguageClient = ({
  supportedLanguages,
  defaultLanguage,
  storage,
  navigatorLanguages,
}: {
  supportedLanguages: string[]
  defaultLanguage: string
  storage?: Pick<Storage, 'getItem'>
  navigatorLanguages?: string[]
}) => {
  const storedLanguage = getStoredPublicLanguage({ supportedLanguages, storage })

  if (storedLanguage) {
    return storedLanguage
  }

  for (const candidate of navigatorLanguages ?? []) {
    const normalizedCandidate = normalizePublicLanguageCandidate(candidate, supportedLanguages)

    if (normalizedCandidate) {
      return normalizedCandidate
    }
  }

  return defaultLanguage
}

export const stripPublicLanguagePrefix = (pathname: string, supportedLanguages: string[]) => {
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/'
  const match = normalizedPathname.match(/^\/([^/]+)(\/.*)?$/)

  if (!match) return normalizedPathname

  const [, maybeLanguage, rest] = match

  if (!supportedLanguages.includes(maybeLanguage)) {
    return normalizedPathname
  }

  return rest || '/'
}

export const isCanonicalLocalizedPublicPath = (pathname: string, supportedLanguages: string[]) => {
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/'
  const strippedPathname = stripPublicLanguagePrefix(normalizedPathname, supportedLanguages)

  return normalizedPathname !== strippedPathname && !isUnlocalizedPath(strippedPathname)
}

export const isBareEnglishPublicPath = (pathname: string, supportedLanguages: string[]) => {
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/'

  if (normalizedPathname === '/') return false
  if (isUnlocalizedPath(normalizedPathname)) return false

  return !isCanonicalLocalizedPublicPath(normalizedPathname, supportedLanguages)
}

export const toCanonicalPublicPath = (pathname: string, supportedLanguages: string[]) => {
  const defaultLanguage = getDefaultPublicLanguage(supportedLanguages)

  return localizePublicPath({
    pathname,
    language: defaultLanguage,
    supportedLanguages,
  })
}

export const getPublicPathLanguageContext = (pathname: string, supportedLanguages: string[]) => {
  const normalizedPathname = stripPublicLanguagePrefix(pathname, supportedLanguages)
  const isBareEnglishAlias = isBareEnglishPublicPath(pathname, supportedLanguages)
  const canonicalPathname = isBareEnglishAlias ? toCanonicalPublicPath(pathname, supportedLanguages) : pathname
  const routeLanguage = isBareEnglishAlias
    ? getDefaultPublicLanguage(supportedLanguages)
    : (normalizePublicLanguageCandidate(pathname.split('/')[1] ?? '', supportedLanguages) ??
      getDefaultPublicLanguage(supportedLanguages))

  return {
    routeLanguage,
    isBareEnglishAlias,
    canonicalPathname,
    normalizedPathname,
  }
}

export const localizePublicPath = ({
  pathname,
  language,
  supportedLanguages,
}: {
  pathname: string
  language: string
  supportedLanguages: string[]
}) => {
  const strippedPathname = stripPublicLanguagePrefix(pathname, supportedLanguages)
  const normalizedPathname = strippedPathname === '/' ? '' : strippedPathname

  return `/${language}${normalizedPathname}`
}

export const isAdminPath = (pathname: string) => pathname === '/admin' || pathname.startsWith('/admin/')

export const isAuthPath = (pathname: string) => pathname === '/account' || pathname.startsWith('/account/')

export const isUnlocalizedPath = (pathname: string) => isAdminPath(pathname) || isAuthPath(pathname)

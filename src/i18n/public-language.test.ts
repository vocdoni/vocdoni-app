import {
  clearPublicLanguageCookie,
  getPersistedPublicLanguageClient,
  getPublicLanguageFromCookie,
  getPublicPathLanguageContext,
  getStoredPublicLanguage,
  isAdminPath,
  isAuthPath,
  isBareEnglishPublicPath,
  isCanonicalLocalizedPublicPath,
  localizePublicPath,
  normalizePublicLanguageCandidate,
  persistPublicLanguage,
  persistPublicLanguageCookie,
  resolvePreferredPublicLanguageClient,
  stripPublicLanguagePrefix,
  toCanonicalPublicPath,
} from './public-language'

describe('public language helpers', () => {
  it('resolves preferred language from local storage before browser languages', () => {
    const storage = new Map([['i18nextLng', 'ca']])

    expect(
      resolvePreferredPublicLanguageClient({
        supportedLanguages: ['en', 'es', 'ca'],
        defaultLanguage: 'en',
        storage: {
          getItem: (key) => storage.get(key) ?? null,
        },
        navigatorLanguages: ['es-ES'],
      })
    ).toBe('ca')
  })

  it('falls back to browser languages only when there is no stored language', () => {
    expect(
      resolvePreferredPublicLanguageClient({
        supportedLanguages: ['en', 'es', 'ca'],
        defaultLanguage: 'en',
        navigatorLanguages: ['ca-ES', 'es-ES'],
      })
    ).toBe('ca')
  })

  it('normalizes browser language variants to supported public languages', () => {
    expect(normalizePublicLanguageCandidate('ca-ES', ['en', 'es', 'ca'])).toBe('ca')
    expect(normalizePublicLanguageCandidate('ES_es', ['en', 'es', 'ca'])).toBe('es')
    expect(normalizePublicLanguageCandidate('fr-FR', ['en', 'es', 'ca'])).toBeNull()
  })

  it('stores the normalized public language in local storage', () => {
    const storage = new Map<string, string>()

    persistPublicLanguage('ca-ES', {
      supportedLanguages: ['en', 'es', 'ca'],
      storage: {
        setItem: (key, value) => storage.set(key, value),
      },
    })

    expect(storage.get('i18nextLng')).toBe('ca')
  })

  it('reads the normalized stored public language', () => {
    expect(
      getStoredPublicLanguage({
        supportedLanguages: ['en', 'es', 'ca'],
        storage: {
          getItem: () => 'it-IT',
        },
      })
    ).toBeNull()

    expect(
      getStoredPublicLanguage({
        supportedLanguages: ['en', 'es', 'ca', 'it'],
        storage: {
          getItem: () => 'it-IT',
        },
      })
    ).toBe('it')
  })

  it('reads and writes the normalized public language cookie', () => {
    const cookieDocument = { cookie: '' }

    persistPublicLanguageCookie('ca-ES', {
      supportedLanguages: ['en', 'es', 'ca'],
      document: cookieDocument,
      location: { protocol: 'https:' },
    })

    expect(cookieDocument.cookie).toContain('vocdoni-public-language=ca')
    expect(cookieDocument.cookie).toContain('Secure')
    expect(
      getPublicLanguageFromCookie({
        supportedLanguages: ['en', 'es', 'ca'],
        cookie: cookieDocument.cookie,
      })
    ).toBe('ca')
  })

  it('clears the public language cookie', () => {
    const cookieDocument = { cookie: 'vocdoni-public-language=ca' }

    clearPublicLanguageCookie({
      document: cookieDocument,
      location: { protocol: 'https:' },
    })

    expect(cookieDocument.cookie).toContain('vocdoni-public-language=')
    expect(cookieDocument.cookie).toContain('Max-Age=0')
  })

  it('prefers the cookie-backed public language over local storage when enabled', () => {
    expect(
      getPersistedPublicLanguageClient({
        supportedLanguages: ['en', 'es', 'ca'],
        storage: {
          getItem: () => 'es',
        },
        cookie: 'vocdoni-public-language=ca',
        cookieEnabled: true,
      })
    ).toBe('ca')

    expect(
      getPersistedPublicLanguageClient({
        supportedLanguages: ['en', 'es', 'ca'],
        storage: {
          getItem: () => 'es',
        },
        cookie: 'vocdoni-public-language=ca',
        cookieEnabled: false,
      })
    ).toBe('es')
  })

  it('builds canonical public paths with a prefixed language, including english', () => {
    expect(
      localizePublicPath({ pathname: '/organization/0xabc', language: 'en', supportedLanguages: ['en', 'ca'] })
    ).toBe('/en/organization/0xabc')
    expect(
      localizePublicPath({ pathname: '/ca/processes/0xprocess', language: 'en', supportedLanguages: ['en', 'ca'] })
    ).toBe('/en/processes/0xprocess')
    expect(localizePublicPath({ pathname: '/', language: 'ca', supportedLanguages: ['en', 'ca'] })).toBe('/ca')
  })

  it('derives canonical prefixed paths from bare english public aliases', () => {
    expect(toCanonicalPublicPath('/processes/0xprocess', ['en', 'ca'])).toBe('/en/processes/0xprocess')
    expect(toCanonicalPublicPath('/organization/0xabc', ['en', 'ca'])).toBe('/en/organization/0xabc')
    expect(toCanonicalPublicPath('/plans', ['en', 'ca'])).toBe('/en/plans')
  })

  it('classifies bare and localized public path variants', () => {
    expect(isBareEnglishPublicPath('/processes/0xprocess', ['en', 'ca'])).toBe(true)
    expect(isBareEnglishPublicPath('/plans', ['en', 'ca'])).toBe(true)
    expect(isBareEnglishPublicPath('/admin', ['en', 'ca'])).toBe(true)
    expect(isBareEnglishPublicPath('/account/signin', ['en', 'ca'])).toBe(true)
    expect(isBareEnglishPublicPath('/ca/processes/0xprocess', ['en', 'ca'])).toBe(false)

    expect(isCanonicalLocalizedPublicPath('/en/processes/0xprocess', ['en', 'ca'])).toBe(true)
    expect(isCanonicalLocalizedPublicPath('/ca/processes/0xprocess', ['en', 'ca'])).toBe(true)
    expect(isCanonicalLocalizedPublicPath('/en/admin', ['en', 'ca'])).toBe(true)
    expect(isCanonicalLocalizedPublicPath('/processes/0xprocess', ['en', 'ca'])).toBe(false)
  })

  it('resolves route language context for bare english aliases and localized routes', () => {
    expect(getPublicPathLanguageContext('/processes/0xprocess', ['en', 'ca'])).toEqual({
      routeLanguage: 'en',
      isBareEnglishAlias: true,
      canonicalPathname: '/en/processes/0xprocess',
      normalizedPathname: '/processes/0xprocess',
    })

    expect(getPublicPathLanguageContext('/ca/processes/0xprocess', ['en', 'ca'])).toEqual({
      routeLanguage: 'ca',
      isBareEnglishAlias: false,
      canonicalPathname: '/ca/processes/0xprocess',
      normalizedPathname: '/processes/0xprocess',
    })
  })

  it('strips a supported language prefix when present', () => {
    expect(stripPublicLanguagePrefix('/en/processes/0xprocess', ['en', 'ca'])).toBe('/processes/0xprocess')
    expect(stripPublicLanguagePrefix('/plans', ['en', 'ca'])).toBe('/plans')
    expect(stripPublicLanguagePrefix('/ca', ['en', 'ca'])).toBe('/')
  })

  it('detects admin paths outside the localized public surface', () => {
    expect(isAdminPath('/admin')).toBe(true)
    expect(isAdminPath('/admin/processes')).toBe(true)
    expect(isAdminPath('/en/admin')).toBe(false)
    expect(isAdminPath('/plans')).toBe(false)
  })

  it('detects auth paths outside the localized public surface', () => {
    expect(isAuthPath('/account')).toBe(true)
    expect(isAuthPath('/account/signin')).toBe(true)
    expect(isAuthPath('/en/account/signin')).toBe(false)
  })
})

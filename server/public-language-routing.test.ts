import { describe, expect, it, vi } from 'vitest'
import { baseLanguages, resolveLanguagesSlice } from '../src/i18n/languages'
import {
  getPublicLanguageFromAcceptLanguage,
  getSupportedPublicLanguagesFromEnv,
  normalizePublicLanguageCandidate,
  publicLanguageRedirect,
  resolvePublicLanguageRedirect,
} from './public-language-routing.mjs'

describe('public language server routing', () => {
  it('parses supported languages from env exactly like the app does', () => {
    // The server cannot import the TypeScript resolver, so it mirrors it. A drift
    // would make the server treat a language prefix the app supports as unprefixed.
    for (const raw of [undefined, '', 'en,ca', ' es , en ', 'en,xx', 'xx', '{"en":"English","ca":"Catalan"}']) {
      expect(getSupportedPublicLanguagesFromEnv({ LANGUAGES: raw } as NodeJS.ProcessEnv)).toEqual(
        Object.keys(resolveLanguagesSlice(raw))
      )
    }
    expect(getSupportedPublicLanguagesFromEnv({} as NodeJS.ProcessEnv)).toEqual(Object.keys(baseLanguages))
    expect(getSupportedPublicLanguagesFromEnv({ LANGUAGES: 'en,ca' } as NodeJS.ProcessEnv)).toEqual(['en', 'ca'])
  })

  it('normalizes cookie language variants', () => {
    expect(normalizePublicLanguageCandidate('ca-ES', ['en', 'ca'])).toBe('ca')
    expect(normalizePublicLanguageCandidate('fr-FR', ['en', 'ca'])).toBeNull()
  })

  it('picks the highest-weighted supported Accept-Language entry', () => {
    const supported = ['en', 'ca', 'es', 'pt', 'pt-br']

    expect(getPublicLanguageFromAcceptLanguage('fr-FR,ca;q=0.8,es;q=0.9', supported)).toBe('es')
    expect(getPublicLanguageFromAcceptLanguage('pt-BR,pt;q=0.9', supported)).toBe('pt-br')
    expect(getPublicLanguageFromAcceptLanguage('ca-ES', supported)).toBe('ca')
    expect(getPublicLanguageFromAcceptLanguage('es;q=0,fr', supported)).toBeNull()
    expect(getPublicLanguageFromAcceptLanguage('*', supported)).toBeNull()
    expect(getPublicLanguageFromAcceptLanguage(undefined, supported)).toBeNull()
  })

  it('redirects bare organization aliases to the cookie-backed language with query preservation', () => {
    expect(
      resolvePublicLanguageRedirect({
        urlOriginal: '/organization/0xabc?tab=archive',
        cookieHeader: 'vocdoni-cookie-consent=accepted; vocdoni-public-language=ca',
        acceptLanguageHeader: 'es',
        supportedLanguages: ['en', 'ca', 'es'],
      })
    ).toBe('/ca/organization/0xabc?tab=archive')
  })

  it('redirects bare process aliases to the browser language when no cookie exists', () => {
    expect(
      resolvePublicLanguageRedirect({
        urlOriginal: '/processes/0xprocess',
        cookieHeader: undefined,
        acceptLanguageHeader: 'ca-ES,ca;q=0.9,en;q=0.5',
        supportedLanguages: ['en', 'ca'],
      })
    ).toBe('/ca/processes/0xprocess')
  })

  it('redirects bare process aliases to the default language when neither cookie nor browser language match', () => {
    expect(
      resolvePublicLanguageRedirect({
        urlOriginal: '/processes/0xprocess',
        cookieHeader: undefined,
        acceptLanguageHeader: 'fr-FR',
        supportedLanguages: ['en', 'ca'],
      })
    ).toBe('/en/processes/0xprocess')
  })

  it('redirects localized SSR routes when the cookie language differs', () => {
    expect(
      resolvePublicLanguageRedirect({
        urlOriginal: '/en/processes/0xprocess',
        cookieHeader: 'vocdoni-cookie-consent=accepted; vocdoni-public-language=ca',
        supportedLanguages: ['en', 'ca'],
      })
    ).toBe('/ca/processes/0xprocess')
  })

  it('keeps the language of a localized link when only the browser language differs', () => {
    expect(
      resolvePublicLanguageRedirect({
        urlOriginal: '/en/processes/0xprocess',
        cookieHeader: undefined,
        acceptLanguageHeader: 'ca',
        supportedLanguages: ['en', 'ca'],
      })
    ).toBeNull()
  })

  it('does not redirect localized SSR routes when the cookie language already matches', () => {
    expect(
      resolvePublicLanguageRedirect({
        urlOriginal: '/ca/processes/0xprocess',
        cookieHeader: 'vocdoni-cookie-consent=accepted; vocdoni-public-language=ca',
        supportedLanguages: ['en', 'ca'],
      })
    ).toBeNull()
  })

  it('ignores a malformed language cookie instead of throwing', () => {
    expect(() =>
      resolvePublicLanguageRedirect({
        urlOriginal: '/organization/0xabc',
        cookieHeader: 'vocdoni-cookie-consent=accepted; vocdoni-public-language=%E0%A4%A',
        supportedLanguages: ['en', 'es'],
      })
    ).not.toThrow()

    expect(
      resolvePublicLanguageRedirect({
        urlOriginal: '/organization/0xabc',
        cookieHeader: 'vocdoni-cookie-consent=accepted; vocdoni-public-language=%E0%A4%A',
        supportedLanguages: ['en', 'es'],
      })
    ).toBe('/en/organization/0xabc')
  })

  it('ignores the language cookie without accepted cookie consent, as the client does', () => {
    // Following it while the client follows local storage would bounce the page forever.
    for (const consent of ['', 'vocdoni-cookie-consent=rejected; ']) {
      const cookieHeader = `${consent}vocdoni-public-language=ca`

      expect(
        resolvePublicLanguageRedirect({
          urlOriginal: '/es/processes/0x1',
          cookieHeader,
          supportedLanguages: ['en', 'ca', 'es'],
        })
      ).toBeNull()
      expect(
        resolvePublicLanguageRedirect({
          urlOriginal: '/processes/0x1',
          cookieHeader,
          acceptLanguageHeader: 'es-ES',
          supportedLanguages: ['en', 'ca', 'es'],
        })
      ).toBe('/es/processes/0x1')
    }
  })

  it('reads the first recognised consent decision when the consent cookie is duplicated', () => {
    expect(
      resolvePublicLanguageRedirect({
        urlOriginal: '/es/processes/0x1',
        cookieHeader:
          'vocdoni-cookie-consent=junk; vocdoni-cookie-consent=accepted; vocdoni-cookie-consent=rejected; vocdoni-public-language=ca',
        supportedLanguages: ['en', 'ca', 'es'],
      })
    ).toBe('/ca/processes/0x1')
  })

  it('ignores invalid cookie languages on localized routes', () => {
    expect(
      resolvePublicLanguageRedirect({
        urlOriginal: '/ca/organization/0xabc',
        cookieHeader: 'vocdoni-cookie-consent=accepted; vocdoni-public-language=fr',
        supportedLanguages: ['en', 'ca'],
      })
    ).toBeNull()
  })

  it('redirects the root to the cookie, then browser, then default language', () => {
    const supportedLanguages = ['en', 'ca', 'es']

    expect(resolvePublicLanguageRedirect({ urlOriginal: '/', supportedLanguages })).toBe('/en')
    expect(resolvePublicLanguageRedirect({ urlOriginal: '/', acceptLanguageHeader: 'ca', supportedLanguages })).toBe(
      '/ca'
    )
    expect(
      resolvePublicLanguageRedirect({
        urlOriginal: '/?utm_source=mail',
        cookieHeader: 'other=1; vocdoni-cookie-consent=accepted; vocdoni-public-language=es',
        acceptLanguageHeader: 'ca',
        supportedLanguages,
      })
    ).toBe('/es?utm_source=mail')
  })

  it('redirects unprefixed app paths and keeps the query string', () => {
    const supportedLanguages = ['en', 'ca', 'es']

    expect(
      resolvePublicLanguageRedirect({ urlOriginal: '/admin', acceptLanguageHeader: 'ca', supportedLanguages })
    ).toBe('/ca/admin')
    expect(
      resolvePublicLanguageRedirect({
        urlOriginal: '/account/signin?redirect=%2Fadmin',
        acceptLanguageHeader: 'fr',
        supportedLanguages,
      })
    ).toBe('/en/account/signin?redirect=%2Fadmin')
    expect(
      resolvePublicLanguageRedirect({
        urlOriginal: '/processes/0xprocess/summary',
        cookieHeader: 'vocdoni-cookie-consent=accepted; vocdoni-public-language=es',
        supportedLanguages,
      })
    ).toBe('/es/processes/0xprocess/summary')
  })

  it('leaves already prefixed app paths and Vike data requests alone', () => {
    const supportedLanguages = ['en', 'ca']

    expect(
      resolvePublicLanguageRedirect({ urlOriginal: '/en/admin', acceptLanguageHeader: 'ca', supportedLanguages })
    ).toBeNull()
    expect(
      resolvePublicLanguageRedirect({
        urlOriginal: '/ca/account/signin?x=1',
        cookieHeader: 'vocdoni-cookie-consent=accepted; vocdoni-public-language=en',
        supportedLanguages,
      })
    ).toBeNull()
    expect(resolvePublicLanguageRedirect({ urlOriginal: '/en', supportedLanguages })).toBeNull()
    expect(resolvePublicLanguageRedirect({ urlOriginal: '/index.pageContext.json', supportedLanguages })).toBeNull()
    expect(
      resolvePublicLanguageRedirect({ urlOriginal: '/processes/0xp/index.pageContext.json', supportedLanguages })
    ).toBeNull()
  })

  it('keeps the HOME_PROCESS_ID root unless the visitor prefers another language', () => {
    const options = { urlOriginal: '/', supportedLanguages: ['en', 'ca'], homeProcessId: '0xhome' }

    expect(resolvePublicLanguageRedirect(options)).toBeNull()
    expect(resolvePublicLanguageRedirect({ ...options, acceptLanguageHeader: 'en-US,ca;q=0.5' })).toBeNull()
    expect(resolvePublicLanguageRedirect({ ...options, acceptLanguageHeader: 'ca-ES' })).toBe('/ca')
    expect(
      resolvePublicLanguageRedirect({
        ...options,
        urlOriginal: '/?ref=qr',
        cookieHeader: 'vocdoni-cookie-consent=accepted; vocdoni-public-language=ca',
        acceptLanguageHeader: 'en',
      })
    ).toBe('/ca?ref=qr')
    // Only the root belongs to the home process; other unprefixed paths still get a prefix.
    expect(resolvePublicLanguageRedirect({ ...options, urlOriginal: '/admin' })).toBe('/en/admin')
    // A blank id is unset, as in the app env.
    expect(resolvePublicLanguageRedirect({ ...options, homeProcessId: '  ' })).toBe('/en')
  })
})

describe('publicLanguageRedirect middleware', () => {
  const run = (req: { method: string; originalUrl: string; headers?: Record<string, string> }) => {
    const res = { setHeader: vi.fn(), redirect: vi.fn() }
    const next = vi.fn()
    publicLanguageRedirect({ supportedLanguages: ['en', 'ca'] })({ headers: {}, ...req } as never, res as never, next)
    return { res, next }
  }

  it('answers unprefixed GET and HEAD requests with an uncacheable 302', () => {
    for (const method of ['GET', 'HEAD']) {
      const { res, next } = run({
        method,
        originalUrl: '/admin?tab=1',
        headers: { 'accept-language': 'ca-ES,ca;q=0.9', cookie: '' },
      })

      expect(res.redirect).toHaveBeenCalledWith(302, '/ca/admin?tab=1')
      expect(res.setHeader).toHaveBeenCalledWith('Vary', 'Accept-Language, Cookie')
      expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store')
      expect(next).not.toHaveBeenCalled()
    }
  })

  it('reads the language cookie from the request', () => {
    const { res } = run({
      method: 'GET',
      originalUrl: '/',
      headers: { 'accept-language': 'en', cookie: 'vocdoni-cookie-consent=accepted; vocdoni-public-language=ca' },
    })

    expect(res.redirect).toHaveBeenCalledWith(302, '/ca')
  })

  it('passes other methods and prefixed paths through', () => {
    expect(run({ method: 'POST', originalUrl: '/admin' }).next).toHaveBeenCalledTimes(1)
    const { res, next } = run({ method: 'GET', originalUrl: '/en/admin' })

    expect(next).toHaveBeenCalledTimes(1)
    expect(res.redirect).not.toHaveBeenCalled()
  })
})

import { describe, expect, it } from 'vitest'
import {
  getSupportedPublicLanguagesFromEnv,
  normalizePublicLanguageCandidate,
  resolvePublicLanguageRedirect,
} from './public-language-routing.mjs'

describe('public language server routing', () => {
  it('parses supported languages from env', () => {
    expect(
      getSupportedPublicLanguagesFromEnv({ LANGUAGES: '{"en":"English","ca":"Catalan"}' } as NodeJS.ProcessEnv)
    ).toEqual(['en', 'ca'])
    expect(getSupportedPublicLanguagesFromEnv({ LANGUAGES: 'invalid-json' } as NodeJS.ProcessEnv)).toEqual(['en'])
  })

  it('normalizes cookie language variants', () => {
    expect(normalizePublicLanguageCandidate('ca-ES', ['en', 'ca'])).toBe('ca')
    expect(normalizePublicLanguageCandidate('fr-FR', ['en', 'ca'])).toBeNull()
  })

  it('redirects bare organization aliases to the cookie-backed language with query preservation', () => {
    expect(
      resolvePublicLanguageRedirect({
        urlOriginal: '/organization/0xabc?tab=archive',
        cookieHeader: 'vocdoni-public-language=ca',
        supportedLanguages: ['en', 'ca'],
      })
    ).toBe('/ca/organization/0xabc?tab=archive')
  })

  it('redirects bare process aliases to the default language when no cookie exists', () => {
    expect(
      resolvePublicLanguageRedirect({
        urlOriginal: '/processes/0xprocess',
        cookieHeader: undefined,
        supportedLanguages: ['en', 'ca'],
      })
    ).toBe('/en/processes/0xprocess')
  })

  it('redirects localized SSR routes when the cookie language differs', () => {
    expect(
      resolvePublicLanguageRedirect({
        urlOriginal: '/en/processes/0xprocess',
        cookieHeader: 'vocdoni-public-language=ca',
        supportedLanguages: ['en', 'ca'],
      })
    ).toBe('/ca/processes/0xprocess')
  })

  it('does not redirect localized SSR routes when the cookie language already matches', () => {
    expect(
      resolvePublicLanguageRedirect({
        urlOriginal: '/ca/processes/0xprocess',
        cookieHeader: 'vocdoni-public-language=ca',
        supportedLanguages: ['en', 'ca'],
      })
    ).toBeNull()
  })

  it('ignores unsupported paths and invalid cookie languages', () => {
    expect(
      resolvePublicLanguageRedirect({
        urlOriginal: '/plans',
        cookieHeader: 'vocdoni-public-language=ca',
        supportedLanguages: ['en', 'ca'],
      })
    ).toBeNull()

    expect(
      resolvePublicLanguageRedirect({
        urlOriginal: '/ca/organization/0xabc',
        cookieHeader: 'vocdoni-public-language=fr',
        supportedLanguages: ['en', 'ca'],
      })
    ).toBeNull()
  })
})

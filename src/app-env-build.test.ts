import { describe, expect, it, vi } from 'vitest'
import { buildAppEnv } from './app-env-build'

describe('buildAppEnv', () => {
  it('applies defaults when env is empty', () => {
    const env = buildAppEnv({})

    expect(env.VOCDONI_ENVIRONMENT).toBe('dev')
    expect(env.SAAS_URL).toBe('https://saas-api-dev.vocdoni.net')
    expect(env.OAUTH_URL).toBe('https://oauth.vocdoni.io')
    expect(env.DEFAULT_CENSUS_SIZE).toBe(5000)
    expect(env.VOCDONI_CONTACT_EMAIL).toBe('hello@vocdoni.io')
    expect(env.HIDE_VOTER_COUNT).toBe(false)
    expect(env.CUSTOM_ORGANIZATION_DOMAINS).toEqual({})
  })

  it('reads values from the provided env source (not baked at build time)', () => {
    const env = buildAppEnv({
      VOCDONI_ENVIRONMENT: 'prod',
      SAAS_URL: 'https://saas-api.example.com',
      HIDE_VOTER_COUNT: 'true',
      DEFAULT_CENSUS_SIZE: '12000',
    })

    expect(env.VOCDONI_ENVIRONMENT).toBe('prod')
    expect(env.SAAS_URL).toBe('https://saas-api.example.com')
    expect(env.HIDE_VOTER_COUNT).toBe(true)
    expect(env.DEFAULT_CENSUS_SIZE).toBe(12000)
  })

  it('trims trailing slashes from url values', () => {
    const env = buildAppEnv({
      SAAS_URL: 'https://saas-api.example.com/',
      PRIVACY_POLICY_URL: 'https://example.com/privacy/',
      TERMS_OF_SERVICE_URL: 'https://example.com/terms/',
    })

    expect(env.SAAS_URL).toBe('https://saas-api.example.com')
    expect(env.PRIVACY_POLICY_URL).toBe('https://example.com/privacy')
    expect(env.TERMS_OF_SERVICE_URL).toBe('https://example.com/terms')
  })

  it('parses VIDEO_TUTORIAL json and falls back on invalid input', () => {
    expect(buildAppEnv({ VIDEO_TUTORIAL: '{"en":"https://x/y"}' }).VIDEO_TUTORIAL).toEqual({ en: 'https://x/y' })

    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(buildAppEnv({ VIDEO_TUTORIAL: 'not-json' }).VIDEO_TUTORIAL).toEqual({
      en: 'https://www.youtube.com/watch?v=bIKxUTS4X8E',
    })
    vi.restoreAllMocks()
  })

  it('accepts a valid shared census map and is lenient on invalid input', () => {
    // LANGUAGES pins the default language used to validate the shared census map.
    const valid = buildAppEnv({ LANGUAGES: 'en', SHARED_CENSUS_POST_TEXT: '{"en":"hello"}' })
    expect(valid.SHARED_CENSUS_POST_TEXT).toEqual({ en: 'hello' })

    vi.spyOn(console, 'warn').mockImplementation(() => {})
    // Missing the default language -> dropped instead of throwing.
    expect(
      buildAppEnv({ LANGUAGES: 'en', SHARED_CENSUS_POST_TEXT: '{"es":"hola"}' }).SHARED_CENSUS_POST_TEXT
    ).toBeUndefined()
    // Invalid JSON -> dropped instead of throwing.
    expect(buildAppEnv({ LANGUAGES: 'en', SHARED_CENSUS_POST_TEXT: '{bad' }).SHARED_CENSUS_POST_TEXT).toBeUndefined()
    vi.restoreAllMocks()
  })

  it('validates STREAM_URL', () => {
    expect(buildAppEnv({ STREAM_URL: 'https://youtube.com/embed/x' }).STREAM_URL).toBe('https://youtube.com/embed/x')

    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(buildAppEnv({ STREAM_URL: 'ftp://example.com' }).STREAM_URL).toBeUndefined()
    expect(buildAppEnv({ STREAM_URL: 'not a url' }).STREAM_URL).toBeUndefined()
    vi.restoreAllMocks()
  })
})

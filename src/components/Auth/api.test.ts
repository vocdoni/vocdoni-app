import type { i18n as I18nInstance } from 'i18next'
import { setActiveI18n } from '~i18n/active-language'
import { api, ApiError, configureApiBaseUrl, getApiErrorMessage } from './api'

describe('getApiErrorMessage', () => {
  it('returns the api error field when available', () => {
    const apiError = new ApiError({ error: 'Invalid credentials' })

    expect(getApiErrorMessage(apiError)).toBe('Invalid credentials')
  })

  it('falls back to the error message when api error is missing', () => {
    const apiError = new ApiError({ error: '' })

    expect(getApiErrorMessage(apiError)).toBe(apiError.message)
  })

  it('returns undefined for unknown errors', () => {
    expect(getApiErrorMessage(undefined)).toBeUndefined()
  })
})

describe('api() language parameter', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>

  const langOfLastRequest = () => {
    const [url] = fetchSpy.mock.calls.at(-1) as [string]
    return new URL(url).searchParams.get('lang')
  }

  beforeEach(() => {
    configureApiBaseUrl('https://saas-api.example.test')
    // A fresh Response per call: a body can only be read once, and some of these
    // tests make two requests.
    fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(() => Promise.resolve(new Response('{}', { status: 200 })))
  })

  afterEach(() => {
    fetchSpy.mockRestore()
    setActiveI18n(undefined)
  })

  it('uses the language of the i18n instance the React tree registered', async () => {
    // Localized routes render with a per-page instance, not the module
    // singleton; reading the singleton would report the browser-detected
    // language instead of the one on screen.
    setActiveI18n({ resolvedLanguage: 'ca', language: 'ca' } as I18nInstance)

    await api('users/me')

    expect(langOfLastRequest()).toBe('ca')
  })

  it('follows an in-place language switch', async () => {
    // Switching language on a client-rendered route mutates the live instance
    // without remounting, so the language must be read per request.
    const live = { resolvedLanguage: 'en', language: 'en' }
    setActiveI18n(live as I18nInstance)

    await api('users/me')
    expect(langOfLastRequest()).toBe('en')

    live.resolvedLanguage = 'es'
    live.language = 'es'
    await api('users/me')

    expect(langOfLastRequest()).toBe('es')
  })

  it('keeps any query string the caller already passed', async () => {
    setActiveI18n({ resolvedLanguage: 'it', language: 'it' } as I18nInstance)

    await api('organizations?page=2')

    const [url] = fetchSpy.mock.calls.at(-1) as [string]
    const params = new URL(url).searchParams
    expect(params.get('page')).toBe('2')
    expect(params.get('lang')).toBe('it')
  })

  it('falls back to the module instance when no tree has registered one', async () => {
    await api('users/me')

    // vitest.setup initializes the shared instance as English.
    expect(langOfLastRequest()).toBe('en')
  })
})

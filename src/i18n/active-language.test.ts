import type { i18n as I18nInstance } from 'i18next'
import { getActiveLanguage, resolveActiveLanguage, setActiveI18n } from './active-language'

const instance = (values: { resolvedLanguage?: string; language?: string }) => values as I18nInstance

describe('resolveActiveLanguage', () => {
  it('prefers the resolved language over the requested one', () => {
    // i18next resolves a region variant the app has no translations for down to
    // the supported base code; that is what the API should be told.
    expect(resolveActiveLanguage(instance({ resolvedLanguage: 'es', language: 'es-AR' }))).toBe('es')
  })

  it('falls back to the requested language when nothing was resolved', () => {
    expect(resolveActiveLanguage(instance({ resolvedLanguage: undefined, language: 'ca' }))).toBe('ca')
  })

  it('reports no language rather than guessing one', () => {
    expect(resolveActiveLanguage(instance({}))).toBeUndefined()
  })
})

describe('active i18n registry', () => {
  afterEach(() => {
    setActiveI18n(undefined)
  })

  it('reports nothing until a tree registers its instance', () => {
    expect(getActiveLanguage()).toBeUndefined()
  })

  it('reports the registered instance language', () => {
    setActiveI18n(instance({ resolvedLanguage: 'it', language: 'it' }))

    expect(getActiveLanguage()).toBe('it')
  })

  it('follows the registered instance when it changes language in place', () => {
    // An in-place language switch mutates the live instance rather than
    // registering a new one, so the registry must read it on every call.
    const live = { resolvedLanguage: 'en', language: 'en' }
    setActiveI18n(live as I18nInstance)

    live.resolvedLanguage = 'ca'
    live.language = 'ca'

    expect(getActiveLanguage()).toBe('ca')
  })
})

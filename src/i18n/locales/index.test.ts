import { reactComponentsTranslations, translations } from './index'

// i18next runs with `returnEmptyString: false`, so an empty value counts as missing and the
// fallback language (English) is rendered instead. `pnpm translations` adds new keys as empty
// strings for every non-English locale, so this catches keys that were never translated.
const emptyKeys = (resources: Record<string, any>, prefix = ''): string[] =>
  Object.entries(resources).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object') return emptyKeys(value, path)
    return typeof value === 'string' && value.trim() === '' ? [path] : []
  })

const locales = Object.keys(translations).filter((lang) => lang !== 'en')

describe('locale files', () => {
  it.each(locales)('%s has no empty translations', (lang) => {
    expect(emptyKeys(translations[lang])).toEqual([])
    expect(emptyKeys(reactComponentsTranslations[lang])).toEqual([])
  })
})

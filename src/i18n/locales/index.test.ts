import { reactComponentsTranslations, translations } from './index'

// i18next runs with `returnEmptyString: false` (and the default `returnNull: false`), so an empty
// or null value counts as missing and the fallback language is rendered instead. A key that is
// absent altogether falls back the same way. `pnpm translations` adds new keys as empty strings for
// every non-English locale, so this catches keys that were never translated. English is checked
// too: as the default fallback, an empty value there shows the call site's `defaultValue`, or the
// raw key when there is none.
const flatten = (resources: Record<string, unknown>, prefix = ''): [string, unknown][] =>
  Object.entries(resources).flatMap(([key, value]): [string, unknown][] => {
    const path = prefix ? `${prefix}.${key}` : key
    return value && typeof value === 'object' ? flatten(value as Record<string, unknown>, path) : [[path, value]]
  })

const namespaces: Record<string, Record<string, Record<string, unknown>>> = {
  common: translations,
  'react-components': reactComponentsTranslations,
}
const locales = Object.keys(translations)
const cases = Object.keys(namespaces).flatMap((ns) => locales.map((lang): [string, string] => [lang, ns]))

describe('locale files', () => {
  it.each(cases)('%s %s has no empty translations', (lang, ns) => {
    const empty = flatten(namespaces[ns][lang])
      .filter(([, value]) => typeof value !== 'string' || value.trim() === '')
      .map(([key]) => key)

    expect(empty).toEqual([])
  })

  // `pnpm translations` keeps `common` in sync with the code, but it skips the react-components
  // namespace, and it never adds a plural form (such as `_many`) to a key that already exists.
  it.each(cases)('%s %s has every English key and plural form', (lang, ns) => {
    const keys = new Set(flatten(namespaces[ns][lang]).map(([key]) => key))
    const categories = new Intl.PluralRules(lang).resolvedOptions().pluralCategories
    const required = flatten(namespaces[ns].en).flatMap(([key]) =>
      key.endsWith('_other') ? [key, ...categories.map((category) => key.replace(/_other$/, `_${category}`))] : [key]
    )

    expect(required.filter((key) => !keys.has(key))).toEqual([])
  })
})

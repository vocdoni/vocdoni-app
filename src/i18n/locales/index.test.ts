import { reactComponentsNamespace, reactComponentsResources } from '@vocdoni/react-components'
import { baseLanguages } from '../languages'
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
// The English keys every locale must translate. For react-components that is what the installed
// package ships (it only ships English) plus any key the app adds on top, so the reference follows
// package upgrades instead of a copy kept in the app's English file.
const englishKeys: Record<string, string[]> = {
  common: flatten(translations.en).map(([key]) => key),
  'react-components': [
    ...new Set(
      [
        ...flatten(reactComponentsResources.en[reactComponentsNamespace]),
        ...flatten(reactComponentsTranslations.en),
      ].map(([key]) => key)
    ),
  ],
}
// Every supported language, not just the ones wired into `./index`: one missing there is served
// as `{}` at runtime, so every key falls back to English.
const locales = Object.keys(baseLanguages)
const cases = Object.keys(namespaces).flatMap((ns) => locales.map((lang): [string, string] => [lang, ns]))

describe('locale files', () => {
  it.each(cases)('%s %s has no empty translations', (lang, ns) => {
    const empty = flatten(namespaces[ns][lang] ?? {})
      .filter(([, value]) => typeof value !== 'string' || value.trim() === '')
      .map(([key]) => key)

    expect(empty).toEqual([])
  })

  // `pnpm translations` keeps `common` in sync with the code, but it skips the react-components
  // namespace, and it never adds a plural form (such as `_many`) to a key that already exists.
  // English react-components only needs the keys it overrides: the package supplies the rest.
  it.each(cases.filter(([lang, ns]) => !(lang === 'en' && ns === 'react-components')))(
    '%s %s has every English key and plural form',
    (lang, ns) => {
      const keys = new Set(flatten(namespaces[ns][lang] ?? {}).map(([key]) => key))
      const categories = new Intl.PluralRules(lang).resolvedOptions().pluralCategories
      const required = englishKeys[ns].flatMap((key) =>
        key.endsWith('_other') ? [key, ...categories.map((category) => key.replace(/_other$/, `_${category}`))] : [key]
      )

      expect(required.filter((key) => !keys.has(key))).toEqual([])
    }
  )
})

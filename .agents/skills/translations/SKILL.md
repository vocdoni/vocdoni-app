---
name: translations
description: 'How to add, change, extract and translate user-facing text in vocdoni-app (i18next, src/i18n/locales, the per-locale contexts in src/i18n/contexts, react-components.json overrides, the localized Open Graph cards). Use whenever a change adds or edits a t(...) string or a locale JSON file, when translating or reviewing a locale, after upgrading @vocdoni/react-components, when src/i18n/locales/index.test.ts fails, or when og.headline, og.tagline or vote.button change.'
---

# Translations

Every user-facing string goes through i18next. English (`en`) is the source; the other locales are every directory under
`src/i18n/locales/` except `en` (today `ca`, `de`, `el`, `es`, `eu`, `fr`, `it`, `pt`, `pt-br`). A change that adds or
edits copy ships its translations in the same PR.

## Writing the English string

- `t('domain.key', { defaultValue: 'Copy' })` in the component. Keys are nested by domain; never build a key at runtime
  (the extractor cannot see it).
- Follow `BRAND.md`: sentence case, no em dash, the app's terminology (vote, members, census, wallet; anonymous vs
  private ballot vs hidden until the end).
- Plurals use i18next's `_one` / `_other` suffixes with a `count`; CLDR adds `_many` (and others) per locale.
- Numbers, money and dates are formatted, not concatenated (`quantity()`, `currency()`, the `format` and `duration`
  formatters).

## Extract and translate

1. Run `pnpm translations`. It extracts keys from the source into every locale's `common.json`, adding new ones as
   empty strings and pruning unused ones (except `preservePatterns` in `i18next.config.ts`, such as `og.*`).
2. Read the whole context file for each locale, glossary included, before translating: `src/i18n/contexts/<locale>.md`.
   They fix the tone, the register (informal address in most), the glossary and what is never translated (placeholders,
   component tags such as `<1>` or `<span>`, product names). Update a context file when its conventions change.
3. Fill every new key in every locale. An empty value falls back to English (`returnEmptyString: false`), and
   `src/i18n/locales/index.test.ts` fails on empty, whitespace-only or null values and on a missing key or plural form
   that English has.
4. Check by hand what the test does not: every `{{ variable }}` and component tag in a translation matches English.
5. Review the generated locale diff: no unrelated churn, no keys lost.

## `react-components.json`

It overrides the strings `@vocdoni/react-components` ships (English only). `pnpm translations` does not manage it. When
the package adds keys (after an upgrade), add their translations by hand to every non-English locale. English falls back
to the package's own text and only needs a key to change its wording. For this file the test's "English" is the keys
the installed package ships plus the app's own.

## Open Graph cards

The social preview images in `public/assets/og/` are rendered from `og.headline`, `og.tagline` and react-components'
`vote.button`. When any of them changes in any locale, run `pnpm og:generate`, look at the PNGs, and commit them with
the translation. `og.tagline` is only read by the generator, which is why `og.*` is in `preservePatterns`.

## Before finishing

`pnpm translations` leaves the tree clean, `pnpm test src/i18n` passes, and `pnpm lint` passes.

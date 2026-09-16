import type { i18n as I18nInstance } from 'i18next'

/** The language the UI renders in, as the SaaS API expects it. Prefers
 * `resolvedLanguage`, so `es-AR` reports the `es` it resolved to; undefined when
 * i18next has not settled, leaving the backend free to apply its own fallback. */
export const resolveActiveLanguage = (instance: I18nInstance): string | undefined =>
  instance.resolvedLanguage || instance.language || undefined

/** Registry for imperative callers: `api()` runs outside the React tree and cannot
 * reach the per-page instance localized routes render with, which is the only one an
 * in-place switch updates. AppProviders publishes the instance it renders with. */
let activeI18n: I18nInstance | undefined

export const setActiveI18n = (instance: I18nInstance | undefined) => {
  activeI18n = instance
}

export const getActiveLanguage = (): string | undefined => (activeI18n ? resolveActiveLanguage(activeI18n) : undefined)

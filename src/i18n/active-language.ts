import type { i18n as I18nInstance } from 'i18next'

/**
 * The language the UI is currently rendering in, in the shape the SaaS API
 * expects it.
 *
 * Prefers `resolvedLanguage` so a region variant the app has no translations for
 * (`es-AR`) is reported as the supported base code i18next actually resolved it
 * to (`es`). Returns `undefined` rather than guessing when i18next has not
 * settled on a language yet: callers omit the parameter in that case and let the
 * backend apply its own fallback, which is better than pinning the wrong one.
 */
export const resolveActiveLanguage = (instance: I18nInstance): string | undefined =>
  instance.resolvedLanguage || instance.language || undefined

/**
 * Registry for imperative (non-React) callers.
 *
 * `api()` runs outside the React tree, so it cannot read the active i18n
 * instance from context. Localized routes render with a per-page instance
 * (see AppProviders), not the module singleton, and an in-place language switch
 * only changes the former — so reading the singleton there reports whatever
 * language the browser was detected as on first load. AppProviders registers the
 * instance it renders with here, and `api()` reads it back.
 */
let activeI18n: I18nInstance | undefined

export const setActiveI18n = (instance: I18nInstance | undefined) => {
  activeI18n = instance
}

export const getActiveLanguage = (): string | undefined => (activeI18n ? resolveActiveLanguage(activeI18n) : undefined)

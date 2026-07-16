import type { PageContext } from 'vike/types'
import i18n from '~i18n'

// Localized routes carry the language as a route param; everything else (the
// legacy unprefixed catch-all) falls back to the i18n instance's language.
const resolveLanguage = (pageContext: PageContext) => {
  const language = pageContext.routeParams?.lang
  return typeof language === 'string' && language ? language : undefined
}

// The source (en) copy lives in src/i18n/locales/en/common.json; the
// defaultValue literals below are only a runtime fallback and must be kept in
// sync with it.
export const getDefaultTitleForLanguage = (language: string | undefined, appEnvTitle: string | undefined) =>
  appEnvTitle ??
  i18n.t('head.title', {
    lng: language,
    defaultValue: 'Vocdoni | Secure & verifiable voting infrastructure',
  })

export const getDefaultPageTitle = (pageContext: PageContext) =>
  getDefaultTitleForLanguage(resolveLanguage(pageContext), pageContext.globalContext.appEnv?.title)

export const getDefaultPageDescription = (pageContext: PageContext) =>
  i18n.t('head.description', {
    lng: resolveLanguage(pageContext),
    defaultValue:
      'Build, manage, and integrate secure, e2e verifiable elections with Vocdoni. A flexible platform for organizations, governments, and developers to power trusted digital voting and decision-making.',
  })

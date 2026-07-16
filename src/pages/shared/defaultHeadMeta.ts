import type { PageContext } from 'vike/types'
import i18n from '~i18n'

// Localized routes carry the language as a route param; everything else (the
// legacy unprefixed catch-all) falls back to the i18n instance's language.
const resolveLanguage = (pageContext: PageContext) => {
  const language = pageContext.routeParams?.lang
  return typeof language === 'string' && language ? language : undefined
}

// The defaultValue literals below are the source (en) copy and must stay
// inline so `pnpm translations` can extract them.
export const getDefaultTitleForLanguage = (language: string | undefined, appEnvTitle: string | undefined) =>
  appEnvTitle ?? i18n.t('head.title', 'Vocdoni | Secure & verifiable voting infrastructure', { lng: language })

export const getDefaultPageTitle = (pageContext: PageContext) =>
  getDefaultTitleForLanguage(resolveLanguage(pageContext), pageContext.globalContext.appEnv?.title)

export const getDefaultPageDescription = (pageContext: PageContext) =>
  i18n.t(
    'head.description',
    'Build, manage, and integrate secure, e2e verifiable elections with Vocdoni. A flexible platform for organizations, governments, and developers to power trusted digital voting and decision-making.',
    { lng: resolveLanguage(pageContext) }
  )

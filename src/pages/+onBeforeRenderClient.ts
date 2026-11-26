import type { PageContextClient } from 'vike/types'
import { getBaseI18n, loadLanguages } from '~i18n'
import { normalizeLanguages, resolveAppEnv } from '~src/app-env'

// Translations are fetched per language. Wait for the page's language and the configured
// fallback before React renders, so hydration matches the server HTML and the client-only
// pages never show raw keys. Public SSR pages carry their language in data, localized
// routes in the URL; anything else renders with the browser-detected language.
export default async function onBeforeRenderClient(pageContext: PageContextClient) {
  const languages = Object.keys(normalizeLanguages(resolveAppEnv(pageContext.globalContext?.appEnv).LANGUAGES))
  const data = pageContext.data as { meta?: { language?: string } } | undefined
  const language = data?.meta?.language ?? pageContext.routeParams?.lang ?? getBaseI18n().language

  await loadLanguages([language, languages[0]])
}

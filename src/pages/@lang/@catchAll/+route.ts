import type { PageContext } from 'vike/types'
import { normalizeLanguages } from '~src/app-env'
import { getHomeProcessRouteMatch } from '~src/ssr/public-routes'

export default (pageContext: PageContext) => {
  const match = pageContext.urlPathname.match(/^\/([^/]+)(\/.*)?$/)

  if (!match) return false

  const [, lang, rest = '/'] = match
  const supportedLanguages = Object.keys(normalizeLanguages(pageContext.globalContext.appEnv?.LANGUAGES))

  if (!supportedLanguages.includes(lang)) return false
  // The localized root belongs to the single-process homepage when one is
  // configured (see src/pages/home-process/). Two route functions matching the
  // same URL would be ambiguous, so this asks the very matcher that page uses
  // instead of re-deriving the condition and risking both (or neither) claiming it.
  if (
    getHomeProcessRouteMatch({
      urlPathname: pageContext.urlPathname,
      supportedLanguages,
      homeProcessId: pageContext.globalContext.appEnv?.HOME_PROCESS_ID,
    })
  ) {
    return false
  }
  if (/^\/organization\/[^/]+\/?$/.test(rest)) return false
  if (/^\/processes\/[^/]+\/?$/.test(rest)) return false
  if (/^\/processes\/[^/]+\/summary\/?$/.test(rest)) return false

  return {
    routeParams: {
      lang,
    },
  }
}

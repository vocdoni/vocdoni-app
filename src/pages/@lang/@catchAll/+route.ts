import type { PageContext } from 'vike/types'
import { normalizeLanguages } from '~src/app-env'

export default (pageContext: PageContext) => {
  const match = pageContext.urlPathname.match(/^\/([^/]+)(\/.*)?$/)

  if (!match) return false

  const [, lang, rest = '/'] = match
  const supportedLanguages = Object.keys(normalizeLanguages(pageContext.globalContext.appEnv?.LANGUAGES))

  if (!supportedLanguages.includes(lang)) return false
  if (/^\/organization\/[^/]+\/?$/.test(rest)) return false
  if (/^\/processes\/[^/]+\/?$/.test(rest)) return false
  if (/^\/processes\/[^/]+\/summary\/?$/.test(rest)) return false

  return {
    routeParams: {
      lang,
    },
  }
}

import type { PageContext } from 'vike/types'
import { normalizeLanguages } from '~src/app-env'
import { getPublicLocalizedProcessRouteMatch } from '~src/ssr/public-pages'

export default (pageContext: PageContext) =>
  getPublicLocalizedProcessRouteMatch({
    urlPathname: pageContext.urlPathname,
    supportedLanguages: Object.keys(normalizeLanguages(pageContext.globalContext.appEnv?.LANGUAGES)),
  })

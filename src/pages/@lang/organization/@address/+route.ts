import type { PageContext } from 'vike/types'
import { normalizeLanguages } from '~src/app-env'
import { getPublicLocalizedOrganizationRouteMatch } from '~src/ssr/public-routes'

export default (pageContext: PageContext) =>
  getPublicLocalizedOrganizationRouteMatch({
    urlPathname: pageContext.urlPathname,
    supportedLanguages: Object.keys(normalizeLanguages(pageContext.globalContext.appEnv?.LANGUAGES)),
  })

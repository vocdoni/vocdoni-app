import { getLanguagesEnv } from '~src/app-env'
import { getPublicLocalizedOrganizationRouteMatch } from '~src/ssr/public-pages'

export default (pageContext: { urlPathname: string }) =>
  getPublicLocalizedOrganizationRouteMatch({
    urlPathname: pageContext.urlPathname,
    supportedLanguages: Object.keys(getLanguagesEnv()),
  })

import { getLanguagesEnv } from '~src/app-env'
import { getPublicLocalizedProcessRouteMatch } from '~src/ssr/public-pages'

export default (pageContext: { urlPathname: string }) =>
  getPublicLocalizedProcessRouteMatch({
    urlPathname: pageContext.urlPathname,
    supportedLanguages: Object.keys(getLanguagesEnv()),
  })

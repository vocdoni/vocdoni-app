import { getLanguagesEnv } from '~src/app-env'
import { getPublicLocalizedProcessSummaryRouteMatch } from '~src/ssr/public-pages'

export default (pageContext: { urlPathname: string }) =>
  getPublicLocalizedProcessSummaryRouteMatch({
    urlPathname: pageContext.urlPathname,
    supportedLanguages: Object.keys(getLanguagesEnv()),
  })

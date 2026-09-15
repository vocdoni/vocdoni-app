import type { PageContext } from 'vike/types'
import { normalizeLanguages } from '~src/app-env'
import { getHomeProcessRouteMatch } from '~src/ssr/public-routes'

// Claims the app root (`/` and `/:lang`) for the process configured in
// HOME_PROCESS_ID. Unset, this never matches and the root keeps falling through
// to the SPA catch-all pages.
export default (pageContext: PageContext) =>
  getHomeProcessRouteMatch({
    urlPathname: pageContext.urlPathname,
    supportedLanguages: Object.keys(normalizeLanguages(pageContext.globalContext.appEnv?.LANGUAGES)),
    homeProcessId: pageContext.globalContext.appEnv?.HOME_PROCESS_ID,
  })

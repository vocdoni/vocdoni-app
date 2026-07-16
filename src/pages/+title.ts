import type { PageContext } from 'vike/types'
import { getDefaultPageTitle } from './shared/defaultHeadMeta'

// Global, runtime-configurable document title (APP_TITLE), localized through
// the route language when available. Pages with their own +title.ts override
// this. Vike requires runtime logic like this to live in a dedicated +title
// file rather than as a function in +config.ts.
export default function title(pageContext: PageContext) {
  return getDefaultPageTitle(pageContext)
}

import type { PageContext } from 'vike/types'

const DEFAULT_TITLE = 'Vocdoni - Digital voting SaaS platform'

// Global, runtime-configurable document title (APP_TITLE). Pages with their own
// +title.ts override this. Vike requires runtime logic like this to live in a
// dedicated +title file rather than as a function in +config.ts.
export default function title(pageContext: PageContext) {
  return pageContext.globalContext.appEnv?.title ?? DEFAULT_TITLE
}

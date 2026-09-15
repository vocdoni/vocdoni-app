// Route matchers for the localized public pages. Kept free of any runtime
// dependency (notably @vocdoni/api-client): Vike transpiles and executes
// +route.ts files with plain Node at config/build time, outside Vite's
// resolver, so anything imported from them must not reach packages that only
// resolve through the link:-ed SDK worktree (e.g. up-fetch).

export const getPublicLocalizedOrganizationRouteMatch = ({
  urlPathname,
  supportedLanguages,
}: {
  urlPathname: string
  supportedLanguages: string[]
}) => {
  const match = urlPathname.match(/^\/([^/]+)\/organization\/([^/]+)\/?$/)

  if (!match) return false

  const [, lang, address] = match

  if (!supportedLanguages.includes(lang)) return false

  return {
    routeParams: {
      lang,
      address,
    },
  }
}

export const getPublicLocalizedProcessRouteMatch = ({
  urlPathname,
  supportedLanguages,
}: {
  urlPathname: string
  supportedLanguages: string[]
}) => {
  const match = urlPathname.match(/^\/([^/]+)\/processes\/([^/]+)\/?$/)

  if (!match) return false

  const [, lang, id] = match

  if (!supportedLanguages.includes(lang)) return false

  return {
    routeParams: {
      lang,
      id,
    },
  }
}

export const getPublicLocalizedProcessSummaryRouteMatch = ({
  urlPathname,
  supportedLanguages,
}: {
  urlPathname: string
  supportedLanguages: string[]
}) => {
  const match = urlPathname.match(/^\/([^/]+)\/processes\/([^/]+)\/summary\/?$/)

  if (!match) return false

  const [, lang, id] = match

  if (!supportedLanguages.includes(lang)) return false

  return {
    routeParams: {
      lang,
      id,
    },
  }
}

/**
 * Matches the app root against the single-process homepage (HOME_PROCESS_ID).
 *
 * Both the bare root (`/`) and every localized root (`/en`, `/es`, …) are
 * claimed, so the process page is what a visitor gets before and after the
 * client-side language redirect. Returns false when no process id is
 * configured, which leaves the root to the SPA catch-all exactly as before.
 */
export const getHomeProcessRouteMatch = ({
  urlPathname,
  supportedLanguages,
  homeProcessId,
}: {
  urlPathname: string
  supportedLanguages: string[]
  homeProcessId?: string
}) => {
  const id = homeProcessId?.trim()

  if (!id) return false

  const normalizedPathname = urlPathname.replace(/\/+$/, '') || '/'

  if (normalizedPathname === '/') {
    return {
      routeParams: {
        id,
      },
    }
  }

  const match = normalizedPathname.match(/^\/([^/]+)$/)

  if (!match) return false

  const [, lang] = match

  if (!supportedLanguages.includes(lang)) return false

  return {
    routeParams: {
      lang,
      id,
    },
  }
}

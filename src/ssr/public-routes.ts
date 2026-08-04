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

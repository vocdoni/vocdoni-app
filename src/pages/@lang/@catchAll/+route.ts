import { getLanguagesEnv } from '~src/app-env'

export default (pageContext: { urlPathname: string }) => {
  const match = pageContext.urlPathname.match(/^\/([^/]+)(\/.*)?$/)

  if (!match) return false

  const [, lang, rest = '/'] = match
  const supportedLanguages = Object.keys(getLanguagesEnv())

  if (!supportedLanguages.includes(lang)) return false
  if (/^\/organization\/[^/]+\/?$/.test(rest)) return false
  if (/^\/processes\/[^/]+\/?$/.test(rest)) return false
  if (/^\/processes\/[^/]+\/summary\/?$/.test(rest)) return false

  return {
    routeParams: {
      lang,
    },
  }
}

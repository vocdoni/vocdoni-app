import { render } from 'vike/abort'
import type { PageContextServer } from 'vike/types'
import { getLanguagesEnv } from '~src/app-env'
import { createVocdoniSdkClient } from '~src/providers/vocdoni-client-config'
import {
  getDefaultPublicLanguage,
  getPublicLanguageAlternates,
  getPublicOrganizationPath,
  getPublicProcessPath,
  loadOrganizationPageData,
  loadProcessPageData,
  resolvePublicLanguage,
} from '~src/ssr/public-pages'

const getSupportedPublicLanguages = () => Object.keys(getLanguagesEnv())

const resolvePublicOrigin = (pageContext: PageContextServer) => {
  const headers = pageContext.headers

  if (!headers) return undefined

  const host = headers['x-forwarded-host'] || headers.host
  const protocol = headers['x-forwarded-proto'] || (host?.startsWith('localhost') ? 'http' : 'https')

  if (!host || !protocol) return undefined

  return `${protocol}://${host}`
}

const resolvePageLanguage = (pageContext: PageContextServer) => {
  const supportedLanguages = getSupportedPublicLanguages()

  try {
    return {
      supportedLanguages,
      language: resolvePublicLanguage({
        routeLanguage: pageContext.routeParams.lang,
        supportedLanguages,
      }),
    }
  } catch (error) {
    throw render(404, error instanceof Error ? error.message : 'Not found')
  }
}

export const getPublicLanguageLinksFromMeta = (meta: { alternates: { hrefLang: string; href: string }[] }) =>
  Object.fromEntries(
    meta.alternates
      .filter((alternate) => alternate.hrefLang !== 'x-default')
      .map((alternate) => [alternate.hrefLang, alternate.href])
  )

export const loadOrganizationPublicPageData = async (pageContext: PageContextServer) => {
  const client = createVocdoniSdkClient()
  const origin = resolvePublicOrigin(pageContext)
  const { language, supportedLanguages } = resolvePageLanguage(pageContext)
  const defaultLanguage = getDefaultPublicLanguage(supportedLanguages)
  const address = pageContext.routeParams.address
  const pathnameByLanguage = Object.fromEntries(
    supportedLanguages.map((supportedLanguage) => [
      supportedLanguage,
      getPublicOrganizationPath({
        address,
        language: supportedLanguage,
        defaultLanguage,
      }),
    ])
  )

  return loadOrganizationPageData({
    client,
    address,
    language,
    canonicalUrl: origin ? `${origin}${pathnameByLanguage[language]}` : undefined,
    alternates: getPublicLanguageAlternates({
      languages: supportedLanguages,
      pathnameByLanguage,
      origin,
    }),
  })
}

export const loadProcessPublicPageData = async (pageContext: PageContextServer) => {
  const client = createVocdoniSdkClient()
  const origin = resolvePublicOrigin(pageContext)
  const { language, supportedLanguages } = resolvePageLanguage(pageContext)
  const defaultLanguage = getDefaultPublicLanguage(supportedLanguages)
  const id = pageContext.routeParams.id
  const pathnameByLanguage = Object.fromEntries(
    supportedLanguages.map((supportedLanguage) => [
      supportedLanguage,
      getPublicProcessPath({
        id,
        language: supportedLanguage,
        defaultLanguage,
      }),
    ])
  )

  return loadProcessPageData({
    client,
    id,
    language,
    canonicalUrl: origin ? `${origin}${pathnameByLanguage[language]}` : undefined,
    alternates: getPublicLanguageAlternates({
      languages: supportedLanguages,
      pathnameByLanguage,
      origin,
    }),
  })
}

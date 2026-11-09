import { render } from 'vike/abort'
import type { PageContextServer } from 'vike/types'
import { getServerAppEnv } from '~src/app-env-server'
import { getVochainGatewayUrl } from '~src/legacy/vochain-archive'
import { createVocdoniApiClient } from '~src/providers/vocdoni-client-config'
import {
  getHomeProcessPath,
  getPublicLanguageAlternates,
  getPublicOrganizationPath,
  getPublicProcessPath,
  getPublicProcessSummaryPath,
  isPublicPageNotFoundError,
  loadOrganizationPageData,
  loadProcessPageData,
  resolvePublicLanguage,
} from '~src/ssr/public-pages'

const getSupportedPublicLanguages = () => Object.keys(getServerAppEnv().LANGUAGES ?? {})

// Same host shape server/ssr-cache.mjs accepts; anything else is never echoed into URLs.
const FORWARDED_HOST_PATTERN = /^[a-zA-Z0-9.-]+(:\d+)?$/
const FORWARDED_PROTOCOLS = ['http', 'https']

const resolvePublicOrigin = (pageContext: PageContextServer) => {
  const configuredOrigin = getServerAppEnv().APP_URL?.trim()

  if (configuredOrigin) {
    try {
      return new URL(configuredOrigin).origin
    } catch {
      return undefined
    }
  }

  const headers = pageContext.headers

  if (!headers) return undefined

  const host = String(headers['x-forwarded-host'] || headers.host || '')
    .split(',')[0]
    .trim()

  if (!FORWARDED_HOST_PATTERN.test(host)) return undefined

  const forwardedProtocol = String(headers['x-forwarded-proto'] || '')
    .split(',')[0]
    .trim()
    .toLowerCase()
  const defaultProtocol = host.startsWith('localhost') ? 'http' : 'https'
  const protocol = FORWARDED_PROTOCOLS.includes(forwardedProtocol) ? forwardedProtocol : defaultProtocol

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

const renderNotFoundIfNeeded = (error: unknown) => {
  if (!isPublicPageNotFoundError(error)) {
    throw error
  }

  throw render(404, error instanceof Error ? error.message : 'Not found')
}

export const loadOrganizationPublicPageData = async (pageContext: PageContextServer) => {
  const { language, supportedLanguages } = resolvePageLanguage(pageContext)
  const client = createVocdoniApiClient(getServerAppEnv().SAAS_URL!, language)
  const vochainGateway = getVochainGatewayUrl(getServerAppEnv().VOCDONI_ENVIRONMENT)
  const origin = resolvePublicOrigin(pageContext)
  const address = pageContext.routeParams.address
  const pathnameByLanguage = Object.fromEntries(
    supportedLanguages.map((supportedLanguage) => [
      supportedLanguage,
      getPublicOrganizationPath({
        address,
        language: supportedLanguage,
      }),
    ])
  )

  try {
    return await loadOrganizationPageData({
      client,
      vochainGateway,
      address,
      language,
      canonicalUrl: origin ? `${origin}${pathnameByLanguage[language]}` : undefined,
      alternates: getPublicLanguageAlternates({
        languages: supportedLanguages,
        pathnameByLanguage,
        origin,
      }),
    })
  } catch (error) {
    renderNotFoundIfNeeded(error)
  }
}

type ProcessPathBuilder = (params: { id: string; language: string }) => string

const loadProcessPublicPageDataWith = async (pageContext: PageContextServer, buildPath: ProcessPathBuilder) => {
  const { language, supportedLanguages } = resolvePageLanguage(pageContext)
  const client = createVocdoniApiClient(getServerAppEnv().SAAS_URL!, language)
  const vochainGateway = getVochainGatewayUrl(getServerAppEnv().VOCDONI_ENVIRONMENT)
  const origin = resolvePublicOrigin(pageContext)
  const id = pageContext.routeParams.id
  const pathnameByLanguage = Object.fromEntries(
    supportedLanguages.map((supportedLanguage) => [
      supportedLanguage,
      buildPath({
        id,
        language: supportedLanguage,
      }),
    ])
  )

  try {
    return await loadProcessPageData({
      client,
      vochainGateway,
      id,
      language,
      canonicalUrl: origin ? `${origin}${pathnameByLanguage[language]}` : undefined,
      alternates: getPublicLanguageAlternates({
        languages: supportedLanguages,
        pathnameByLanguage,
        origin,
      }),
    })
  } catch (error) {
    renderNotFoundIfNeeded(error)
  }
}

export const loadProcessPublicPageData = (pageContext: PageContextServer) =>
  loadProcessPublicPageDataWith(pageContext, getPublicProcessPath)

export const loadProcessSummaryPublicPageData = (pageContext: PageContextServer) =>
  loadProcessPublicPageDataWith(pageContext, getPublicProcessSummaryPath)

// Same process data as /:lang/processes/:id, but with the root as its canonical
// and alternate URLs — the process is *the* homepage of this deployment.
export const loadHomeProcessPublicPageData = (pageContext: PageContextServer) =>
  loadProcessPublicPageDataWith(pageContext, getHomeProcessPath)

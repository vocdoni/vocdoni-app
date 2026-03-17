import type { PageContextServer } from 'vike/types'
import { createVocdoniSdkClient, getVocdoniClientConfig } from '~src/providers/vocdoni-client-config'
import { loadProcessPageData, serializePublicPageErrorDetails } from '~src/ssr/public-pages'

const resolveCanonicalUrl = (pageContext: PageContextServer) => {
  const headers = pageContext.headers

  if (!headers) return undefined

  const host = headers['x-forwarded-host'] || headers.host
  const protocol = headers['x-forwarded-proto'] || (host?.startsWith('localhost') ? 'http' : 'https')

  if (!host || !protocol) return undefined

  return `${protocol}://${host}${pageContext.urlPathname}`
}

export default async function data(pageContext: PageContextServer) {
  const { clientEnv, options } = getVocdoniClientConfig()
  const client = createVocdoniSdkClient()

  try {
    return await loadProcessPageData({
      client,
      id: pageContext.routeParams.id,
      canonicalUrl: resolveCanonicalUrl(pageContext),
    })
  } catch (error) {
    console.error('[vike][processes/@id][data] failed to load process page data', {
      routeParams: pageContext.routeParams,
      urlPathname: pageContext.urlPathname,
      canonicalUrl: resolveCanonicalUrl(pageContext),
      clientEnv,
      clientOptions: options,
      clientUrl: (client as { url?: string }).url,
      error: serializePublicPageErrorDetails(error),
    })

    throw error
  }
}

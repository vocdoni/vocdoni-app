import type { PageContextServer } from 'vike/types'
import { createVocdoniSdkClient } from '~src/providers/vocdoni-client-config'
import { loadOrganizationPageData } from '~src/ssr/public-pages'

const resolveCanonicalUrl = (pageContext: PageContextServer) => {
  const headers = pageContext.headers

  if (!headers) return undefined

  const host = headers['x-forwarded-host'] || headers.host
  const protocol = headers['x-forwarded-proto'] || (host?.startsWith('localhost') ? 'http' : 'https')

  if (!host || !protocol) return undefined

  return `${protocol}://${host}${pageContext.urlPathname}`
}

export default async function data(pageContext: PageContextServer) {
  const client = createVocdoniSdkClient()

  return loadOrganizationPageData({
    client,
    address: pageContext.routeParams.address,
    canonicalUrl: resolveCanonicalUrl(pageContext),
  })
}

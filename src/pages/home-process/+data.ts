import type { PageContextServer } from 'vike/types'
import { getServerAppEnv } from '~src/app-env-server'
import { loadHomeProcessPublicPageData } from '~src/pages/shared/publicPageData'
import { getVocdoniClientConfig } from '~src/providers/vocdoni-client-config'
import { serializePublicPageErrorDetails } from '~src/ssr/public-pages'

export default async function data(pageContext: PageContextServer) {
  const { clientEnv } = getVocdoniClientConfig(getServerAppEnv().VOCDONI_ENVIRONMENT)

  try {
    return await loadHomeProcessPublicPageData(pageContext)
  } catch (error) {
    console.error('[vike][home-process][data] failed to load the HOME_PROCESS_ID page data', {
      routeParams: pageContext.routeParams,
      urlPathname: pageContext.urlPathname,
      clientEnv,
      error: serializePublicPageErrorDetails(error),
    })

    throw error
  }
}

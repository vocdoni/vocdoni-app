import type { PageContextServer } from 'vike/types'
import { getServerAppEnv } from '~src/app-env-server'
import { loadProcessSummaryPublicPageData } from '~src/pages/shared/publicPageData'
import { getVocdoniClientConfig } from '~src/providers/vocdoni-client-config'
import { serializePublicPageErrorDetails } from '~src/ssr/public-pages'

export default async function data(pageContext: PageContextServer) {
  const { clientEnv, options } = getVocdoniClientConfig(getServerAppEnv().VOCDONI_ENVIRONMENT)

  try {
    return await loadProcessSummaryPublicPageData(pageContext)
  } catch (error) {
    console.error('[vike][@lang/processes/@id/summary][data] failed to load process summary page data', {
      routeParams: pageContext.routeParams,
      urlPathname: pageContext.urlPathname,
      clientEnv,
      clientOptions: options,
      error: serializePublicPageErrorDetails(error),
    })

    throw error
  }
}

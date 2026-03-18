import type { PageContextServer } from 'vike/types'
import { loadOrganizationPublicPageData } from '~src/pages/shared/publicPageData'

export default async function data(pageContext: PageContextServer) {
  return loadOrganizationPublicPageData(pageContext)
}

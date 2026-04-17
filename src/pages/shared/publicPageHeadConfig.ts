import type { PageContextServer } from 'vike/types'
import type { PublicMeta } from '~src/ssr/public-pages'

type PublicPageHeadContext = PageContextServer & {
  data?: {
    meta?: Pick<PublicMeta, 'title' | 'description'>
  }
}

export const getPublicPageTitle = (pageContext: PublicPageHeadContext) => pageContext.data?.meta?.title ?? null

export const getPublicPageDescription = (pageContext: PublicPageHeadContext) =>
  pageContext.data?.meta?.description ?? null

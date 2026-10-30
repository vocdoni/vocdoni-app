import { usePageContext } from 'vike-react/usePageContext'
import i18n from '~i18n'
import { getDefaultPageDescription, getDefaultPageTitle, resolveRouteLanguage } from './defaultHeadMeta'
import { getOpenGraphImagePath, OPEN_GRAPH_IMAGE_HEIGHT, OPEN_GRAPH_IMAGE_WIDTH } from './openGraphImage'
import { resolvePublicOrigin } from './publicOrigin'

// Default social tags for pages without data-driven metadata (the SPA
// catch-alls). vike-react already renders <title>/og:title (from +title) and
// the meta description/og:description pair (from +description), so only the
// tags it doesn't cover are emitted here.
const DefaultPageHead = () => {
  const pageContext = usePageContext()
  const title = getDefaultPageTitle(pageContext)
  const description = getDefaultPageDescription(pageContext)
  const imagePath = getOpenGraphImagePath(resolveRouteLanguage(pageContext) ?? i18n.language)
  const origin = resolvePublicOrigin(pageContext)
  const image = origin ? new URL(imagePath, origin).toString() : imagePath

  return (
    <>
      <meta property='og:type' content='website' />
      <meta property='og:site_name' content='Vocdoni' />
      <meta property='og:image' content={image} />
      <meta property='og:image:width' content={String(OPEN_GRAPH_IMAGE_WIDTH)} />
      <meta property='og:image:height' content={String(OPEN_GRAPH_IMAGE_HEIGHT)} />
      <meta property='og:image:alt' content={title} />
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:site' content='@vocdoni' />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={image} />
    </>
  )
}

export default DefaultPageHead

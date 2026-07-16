import { usePageContext } from 'vike-react/usePageContext'
import { getDefaultPageDescription, getDefaultPageTitle } from './defaultHeadMeta'

const image = '/assets/vocdoni_icon.png'

// Default social tags for pages without data-driven metadata (the SPA
// catch-alls). vike-react already renders <title>/og:title (from +title) and
// the meta description/og:description pair (from +description), so only the
// tags it doesn't cover are emitted here.
const DefaultPageHead = () => {
  const pageContext = usePageContext()
  const title = getDefaultPageTitle(pageContext)
  const description = getDefaultPageDescription(pageContext)

  return (
    <>
      <meta property='og:type' content='website' />
      <meta property='og:site_name' content='Vocdoni' />
      <meta property='og:image' content={image} />
      <meta name='twitter:card' content='summary' />
      <meta name='twitter:site' content='@vocdoni' />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={image} />
    </>
  )
}

export default DefaultPageHead

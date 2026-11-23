import { usePageContext } from 'vike-react/usePageContext'

// `crossorigin` (anonymous) matches api()'s fetch() calls, which send no credentials; a bare preconnect warms a pool
// they never use. Head is cumulative in vike-react, so this adds to every page's own +Head.
const Head = () => {
  const saasUrl = usePageContext().globalContext?.appEnv?.SAAS_URL
  let origin: string | undefined
  try {
    origin = saasUrl ? new URL(saasUrl).origin : undefined
  } catch {
    origin = undefined
  }

  return origin ? <link rel='preconnect' href={origin} crossOrigin='' /> : null
}

export default Head

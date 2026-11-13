import { usePageContext } from 'vike-react/usePageContext'

// Opens the SaaS API connection (DNS, TCP, TLS) while the bundle loads instead of at the first call.
// `crossorigin` (anonymous) matches fetch() without credentials, which is how api() calls it: a bare
// preconnect would warm a different, credentialed connection pool that those requests never use.
// Head is cumulative in vike-react, so this adds to every page's own +Head.
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

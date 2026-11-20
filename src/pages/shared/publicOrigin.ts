import type { PageContextServer } from 'vike/types'

type PublicOriginContext = Partial<Pick<PageContextServer, 'headers'>> & {
  globalContext?: { appEnv?: { APP_URL?: string } }
}

// Same host shape server/ssr-cache.mjs accepts; anything else is never echoed into URLs.
const FORWARDED_HOST_PATTERN = /^[a-zA-Z0-9.-]+(:\d+)?$/
const FORWARDED_PROTOCOLS = ['http', 'https']

// Only an http(s) origin that WHATWG URL accepts is returned, so `new URL(path, origin)`
// downstream never throws (`foo.123` passes the host pattern but not the URL parser).
const toPublicOrigin = (value: string) => {
  try {
    const { protocol, origin } = new URL(value)
    if ((protocol !== 'http:' && protocol !== 'https:') || origin === 'null') return undefined
    return origin
  } catch {
    return undefined
  }
}

// APP_URL wins; otherwise the origin is rebuilt from the proxy headers. `appUrl`
// lets callers that already hold the resolved env pass it explicitly.
export const resolvePublicOrigin = (
  pageContext: PublicOriginContext,
  appUrl: string | undefined = pageContext.globalContext?.appEnv?.APP_URL
) => {
  const configuredOrigin = appUrl?.trim()

  if (configuredOrigin) return toPublicOrigin(configuredOrigin)

  const headers = pageContext.headers

  if (!headers) return undefined

  // Proxy chains leave hop lists ("a, b") in these headers and clients can send junk; only the
  // first hop is used, and only when it is a plain host, so a crafted value is never echoed into a URL.
  const host = String(headers['x-forwarded-host'] || headers.host || '')
    .split(',')[0]
    .trim()

  if (!FORWARDED_HOST_PATTERN.test(host)) return undefined

  const forwardedProtocol = String(headers['x-forwarded-proto'] || '')
    .split(',')[0]
    .trim()
    .toLowerCase()
  const defaultProtocol = host.startsWith('localhost') ? 'http' : 'https'
  const protocol = FORWARDED_PROTOCOLS.includes(forwardedProtocol) ? forwardedProtocol : defaultProtocol

  return toPublicOrigin(`${protocol}://${host}`)
}

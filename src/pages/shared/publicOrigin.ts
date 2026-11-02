import type { PageContextServer } from 'vike/types'

type PublicOriginContext = Partial<Pick<PageContextServer, 'headers'>> & {
  globalContext?: { appEnv?: { APP_URL?: string } }
}

// Same host shape server/ssr-cache.mjs accepts; anything else is never echoed into URLs.
const FORWARDED_HOST_PATTERN = /^[a-zA-Z0-9.-]+(:\d+)?$/
const FORWARDED_PROTOCOLS = ['http', 'https']

// APP_URL wins; otherwise the origin is rebuilt from the proxy headers. `appUrl`
// lets callers that already hold the resolved env pass it explicitly.
export const resolvePublicOrigin = (
  pageContext: PublicOriginContext,
  appUrl: string | undefined = pageContext.globalContext?.appEnv?.APP_URL
) => {
  const configuredOrigin = appUrl?.trim()

  if (configuredOrigin) {
    try {
      return new URL(configuredOrigin).origin
    } catch {
      return undefined
    }
  }

  const headers = pageContext.headers

  if (!headers) return undefined

  // Proxy chains leave hop lists ("a, b") in these headers and clients can send junk; only the
  // first hop is used, and only when it is a plain host, so `new URL(path, origin)` downstream
  // never throws and a crafted value is never echoed into a URL.
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

  return `${protocol}://${host}`
}

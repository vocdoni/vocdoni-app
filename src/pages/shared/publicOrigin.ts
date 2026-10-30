import type { PageContextServer } from 'vike/types'

type PublicOriginContext = Partial<Pick<PageContextServer, 'headers'>> & {
  globalContext?: { appEnv?: { APP_URL?: string } }
}

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

  const host = headers['x-forwarded-host'] || headers.host
  const protocol = headers['x-forwarded-proto'] || (host?.startsWith('localhost') ? 'http' : 'https')

  if (!host || !protocol) return undefined

  // Proxy chains can leave lists ("a, b") or junk in these headers; an origin that does not
  // parse would make every `new URL(path, origin)` downstream throw inside the head render.
  try {
    return new URL(`${protocol}://${host}`).origin
  } catch {
    return undefined
  }
}

// Certificate voter authentication: the browser side of the certificate gateway flow.
//
// The voting page sends the voter to the gateway with a random `state` and the S256 challenge of
// a random PKCE `codeVerifier`, both kept in this tab's sessionStorage. The gateway sends the voter
// back to the voting page with `#certCode=…&state=…` (or `#certError=…&ref=…&state=…`) in the fragment.
// The page accepts the code only when `state` matches the stored one, and redeems it at step 0 with
// the verifier. Nothing else is stored: no DNI, name or certificate data ever reaches the browser.

/**
 * Every non-retryable gateway and backend error code: retrying as is gets the same answer, because
 * the browser keeps offering the same certificate (or none) until it is restarted.
 */
export const STICKY_CERT_ERRORS = [
  'no_certificate',
  'not_in_census',
  'zero_weight',
  'not_cert_census',
  'anonymous_unavailable',
  'process_not_open',
  'provider_mismatch',
  'untrusted_issuer',
  'unsupported_profile',
  'invalid_chain',
  'expired',
  'not_yet_valid',
  'unsupported_purpose',
  'weak_algorithm',
  'test_certificate',
  'identity_invalid',
  'identity_unsupported_document',
  'revoked',
  'revocation_unknown',
] as const

/** Error codes worth retrying as is, a bit later. */
export const RETRYABLE_CERT_ERRORS = [
  'revocation_unavailable',
  'internal',
  'backend_unavailable',
  'rate_limited',
] as const

/** The gateway pages' languages. */
const GATEWAY_LANGS = ['es', 'ca', 'en']

type StoredFlow = { state: string; codeVerifier: string }

/** What the voting page found in its fragment on load. */
export type CertReturn =
  | { kind: 'code'; certCode: string; codeVerifier: string }
  // step 0 took the code (2FA census): it is spent, so only the code step or a new certificate login is left
  | { kind: 'redeemed' }
  // `ref`: the gateway's diagnostic id (32 hex digits), shown as the support reference
  | { kind: 'error'; code: string; ref?: string }
  // a fragment whose state is not the one this tab stored (or none was): nothing is called
  | { kind: 'mismatch' }

export const certAuthStorageKey = (processId: string) => `certAuth:${processId}`

const base64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

const randomBase64Url = (size: number) => base64Url(crypto.getRandomValues(new Uint8Array(size)))

/** base64url(sha256(verifier)), unpadded: the PKCE S256 challenge. */
export const codeChallengeOf = async (codeVerifier: string) =>
  base64Url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier))))

/**
 * The URL of the gateway's /v1/auth for a voting page: stores a fresh state and verifier for the
 * process in sessionStorage and returns where to navigate (top level).
 */
export const startCertAuth = async ({
  gatewayUrl,
  processId,
  returnUrl,
  language,
  storage = window.sessionStorage,
}: {
  gatewayUrl: string
  processId: string
  returnUrl: string
  language: string
  storage?: Pick<Storage, 'setItem'>
}): Promise<string> => {
  const flow: StoredFlow = { state: randomBase64Url(16), codeVerifier: randomBase64Url(32) }
  storage.setItem(certAuthStorageKey(processId), JSON.stringify(flow))
  const url = new URL('/v1/auth', gatewayUrl)
  url.searchParams.set('processId', processId)
  url.searchParams.set('returnUrl', returnUrl)
  url.searchParams.set('state', flow.state)
  url.searchParams.set('codeChallenge', await codeChallengeOf(flow.codeVerifier))
  const lang = language.split('-')[0]
  if (GATEWAY_LANGS.includes(lang)) url.searchParams.set('lang', lang)
  return url.toString()
}

/**
 * Reads the gateway's answer from the fragment, if any. It always strips the fragment (without a
 * navigation) and deletes the stored flow only when `state` matches it. Returns null when the
 * fragment carries no certificate answer.
 */
export const readCertReturn = (
  processId: string,
  {
    location = window.location,
    history = window.history,
    storage = window.sessionStorage,
  }: {
    location?: Pick<Location, 'hash' | 'pathname' | 'search'>
    history?: Pick<History, 'replaceState' | 'state'>
    storage?: Pick<Storage, 'getItem' | 'removeItem'>
  } = {}
): CertReturn | null => {
  const params = new URLSearchParams(location.hash.replace(/^#/, ''))
  const certCode = params.get('certCode')
  const certError = params.get('certError')
  if (!certCode && !certError) return null

  history.replaceState(history.state, '', location.pathname + location.search)
  let stored: StoredFlow | null = null
  try {
    stored = JSON.parse(storage.getItem(certAuthStorageKey(processId)) ?? 'null')
  } catch {
    stored = null
  }
  if (!stored?.state || stored.state !== params.get('state')) return { kind: 'mismatch' }

  storage.removeItem(certAuthStorageKey(processId))
  if (certCode) return { kind: 'code', certCode, codeVerifier: stored.codeVerifier }
  const ref = params.get('ref') ?? ''
  return { kind: 'error', code: certError ?? 'internal', ...(/^[0-9a-f]{32}$/.test(ref) && { ref }) }
}

/**
 * Whether this tab started a certificate login for the process that never came back: with no
 * fragment to read, the gateway page most likely didn't load (a network that blocks its port).
 */
export const hasPendingCertAuth = (processId: string, storage: Pick<Storage, 'getItem'> = window.sessionStorage) =>
  storage.getItem(certAuthStorageKey(processId)) !== null

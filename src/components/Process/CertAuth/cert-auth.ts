// Certificate voter authentication: the browser side of the certificate gateway flow.
//
// The voting page sends the voter to the gateway with a random `state` and the S256 challenge of
// a random PKCE `codeVerifier`, both kept in this tab's sessionStorage with when it started and from
// which page load. The gateway sends the voter
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

/** Sticky codes about the process or its census, not the certificate: no other attempt helps. */
export const PROCESS_CERT_ERRORS = ['process_not_open', 'not_cert_census', 'anonymous_unavailable'] as const

/** Error codes worth retrying as is, a bit later. */
export const RETRYABLE_CERT_ERRORS = [
  'revocation_unavailable',
  'internal',
  'backend_unavailable',
  'rate_limited',
] as const

/** The gateway pages' languages. */
const GATEWAY_LANGS = ['es', 'ca', 'en']

// `loadId`: the page load that left for the gateway. `hinted`: the "page didn't load" hint was shown.
type StoredFlow = { state: string; codeVerifier: string; startedAt: number; loadId: string; hinted?: boolean }

/** What the voting page found in its fragment on load. */
export type CertReturn =
  | { kind: 'code'; certCode: string; codeVerifier: string }
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

/** This document's load: a flow stored by another one means the voter left for the gateway since. */
const PAGE_LOAD_ID = randomBase64Url(8)

/**
 * A fresh host label for each attempt: 26 lowercase base32 characters (130 random bits). Browsers
 * remember the certificate chosen for a host until they restart, so a new host shows the picker
 * again. 256 is a multiple of 32, so taking the low 5 bits of each byte is unbiased.
 */
const randomHostLabel = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(26)), (b) => 'abcdefghijklmnopqrstuvwxyz234567'[b & 31]).join('')

/** base64url(sha256(verifier)), unpadded: the PKCE S256 challenge. */
export const codeChallengeOf = async (codeVerifier: string) =>
  base64Url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier))))

/**
 * The URL of the gateway's /v1/auth for a voting page, on a random subdomain of `gatewayUrl` (same
 * port): stores a fresh state and verifier for the process in sessionStorage and returns where to
 * navigate (top level).
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
  const flow: StoredFlow = {
    state: randomBase64Url(16),
    codeVerifier: randomBase64Url(32),
    startedAt: Date.now(),
    loadId: PAGE_LOAD_ID,
  }
  storage.setItem(certAuthStorageKey(processId), JSON.stringify(flow))
  const url = new URL('/v1/auth', gatewayUrl)
  url.hostname = `${randomHostLabel()}.${url.hostname}`
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
 * navigation) and deletes the stored flow: a mismatched `state` makes it useless too. Returns null
 * when the fragment carries no certificate answer.
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
  storage.removeItem(certAuthStorageKey(processId))
  if (!stored?.state || stored.state !== params.get('state')) return { kind: 'mismatch' }

  if (certCode) return { kind: 'code', certCode, codeVerifier: stored.codeVerifier }
  const ref = params.get('ref') ?? ''
  return { kind: 'error', code: certError ?? 'internal', ...(/^[0-9a-f]{32}$/.test(ref) && { ref }) }
}

/**
 * How long after leaving for the gateway a return without its answer still means its page didn't load.
 * A network that silently drops the gateway's port shows the browser's error page only after the TCP
 * connect timeout (~127 s on Linux and Android, ~75 s on macOS), and the voter may stay on that page
 * a while before going back: 15 minutes leaves room for both.
 */
const CERT_PAGE_LOAD_WINDOW_MS = 15 * 60_000

/**
 * Whether this tab started a certificate login for the process moments ago that never came back:
 * with no fragment to read, the gateway page most likely didn't load (a network that blocks its
 * port). That includes going back from the browser's error page: the gateway redirects at once and
 * shows no page of its own, so a voter who went back almost always left one that failed to load.
 * Only a new page load counts, or one restored from the back/forward cache (`restored`), which keeps
 * this one's id: the same page reopening its dialog while the gateway connects has not left. Marks
 * the flow as hinted so it is told at most once, but keeps it: a late answer still signs in.
 */
export const unansweredCertAuth = (
  processId: string,
  {
    storage = window.sessionStorage,
    now = Date.now(),
    restored = false,
  }: { storage?: Pick<Storage, 'getItem' | 'setItem'>; now?: number; restored?: boolean } = {}
) => {
  const key = certAuthStorageKey(processId)
  let flow: StoredFlow | null = null
  try {
    flow = JSON.parse(storage.getItem(key) ?? 'null')
  } catch {
    // unreadable: no login to tell about
  }
  if (!flow || flow.hinted || (!restored && flow.loadId === PAGE_LOAD_ID)) return false
  const elapsed = now - Number(flow.startedAt ?? NaN)
  if (!(elapsed >= 0 && elapsed <= CERT_PAGE_LOAD_WINDOW_MS)) return false
  storage.setItem(key, JSON.stringify({ ...flow, hinted: true }))
  return true
}

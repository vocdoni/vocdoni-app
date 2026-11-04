import type { CertAuthPurpose } from './types'

// One attempt = one verifier, kept in localStorage so a return in another tab of the same browser
// still redeems. Same XSS exposure as sessionStorage; never cookies; never sent anywhere but redeem.
const VERIFIER_PREFIX = 'vocdoni.cert.verifier.'
const PENDING_PREFIX = 'vocdoni.cert.pending.'
export const RETURN_STASH_KEY = 'vocdoni.cert.return'
export const RETURN_STASH_GLOBAL = '__vocdoniCertReturn'
// State (15 min) plus code (5 min): the verifier never expires before the server's own TTLs.
export const VERIFIER_TTL_MS = 20 * 60_000
export const PENDING_TTL_MS = 15 * 60_000
const STASH_TTL_MS = 5 * 60_000
const TOKEN = /^[A-Za-z0-9._~-]{1,256}$/

export type StoredVerifier = { verifier: string; processId: string; purpose: CertAuthPurpose; expiresAt: number }
export type PendingAttempt = { state: string; startedAt: number }
export type ReturnStash = { code: string; state: string; at: number } | { error: string; at: number }

const base64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

/** 32 random bytes, base64url (43 chars): RFC 7636 code_verifier. */
export const createVerifier = () => {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return base64url(bytes)
}

/** RFC 7636 S256: base64url(sha256(ascii(verifier))). */
export const challengeFor = async (verifier: string) =>
  base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))))

const read = <T>(storage: Storage | undefined, key: string): T | null => {
  try {
    const raw = storage?.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

const write = (storage: Storage | undefined, key: string, value: unknown): boolean => {
  try {
    if (!storage) return false
    storage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

const remove = (storage: Storage | undefined, key: string) => {
  try {
    storage?.removeItem(key)
  } catch {
    // storage unavailable: nothing to remove
  }
}

const local = () => (typeof localStorage === 'undefined' ? undefined : localStorage)
const session = () => (typeof sessionStorage === 'undefined' ? undefined : sessionStorage)

const isVerifier = (value: unknown): value is StoredVerifier => {
  const v = value as StoredVerifier | null
  return (
    !!v &&
    typeof v.verifier === 'string' &&
    typeof v.processId === 'string' &&
    (v.purpose === 'vote' || v.purpose === 'check') &&
    typeof v.expiresAt === 'number'
  )
}

/** False when storage is unavailable: the caller must not start an attempt it can never redeem. */
export const saveVerifier = (state: string, entry: StoredVerifier) =>
  TOKEN.test(state) && write(local(), VERIFIER_PREFIX + state, entry)

/** The verifier for this state and process, or null (expired, other process, malformed, absent). Not consumed. */
export const readVerifier = (state: string, processId: string, now = Date.now()): StoredVerifier | null => {
  if (!TOKEN.test(state)) return null
  const entry = read<unknown>(local(), VERIFIER_PREFIX + state)
  if (!isVerifier(entry) || entry.expiresAt <= now || entry.processId !== processId) {
    if (entry) remove(local(), VERIFIER_PREFIX + state)
    return null
  }
  return entry
}

export const dropVerifier = (state: string) => remove(local(), VERIFIER_PREFIX + state)

/** Removes expired or malformed verifiers left by abandoned attempts. */
export const purgeExpiredVerifiers = (now = Date.now()) => {
  const storage = local()
  if (!storage) return
  const keys: string[] = []
  try {
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      if (key?.startsWith(VERIFIER_PREFIX)) keys.push(key)
    }
  } catch {
    return
  }
  for (const key of keys) {
    const entry = read<unknown>(storage, key)
    if (!isVerifier(entry) || entry.expiresAt <= now) remove(storage, key)
  }
}

export const setPending = (processId: string, attempt: PendingAttempt) =>
  write(local(), PENDING_PREFIX + processId, attempt)

/** The attempt this tab started, or null. Its state is page-writable input: it must pass the token grammar. */
export const readPending = (processId: string, now = Date.now()): PendingAttempt | null => {
  const entry = read<Partial<PendingAttempt>>(local(), PENDING_PREFIX + processId)
  if (!entry || typeof entry.state !== 'string' || !TOKEN.test(entry.state)) return null
  if (typeof entry.startedAt !== 'number' || now - entry.startedAt > PENDING_TTL_MS) return null
  return { state: entry.state, startedAt: entry.startedAt }
}

export const clearPending = (processId: string) => remove(local(), PENDING_PREFIX + processId)

/** What the pre-hydration script stashed from the fragment, validated again (it is page input). */
export const readReturnStash = (now = Date.now()): ReturnStash | null => {
  const fromGlobal = (globalThis as Record<string, unknown>)[RETURN_STASH_GLOBAL]
  let value: unknown = read<unknown>(session(), RETURN_STASH_KEY)
  if (!value && typeof fromGlobal === 'string') {
    try {
      value = JSON.parse(fromGlobal)
    } catch {
      value = null
    }
  }
  const v = value as Partial<{ code: string; state: string; error: string; at: number }> | null
  if (!v || typeof v.at !== 'number' || now - v.at > STASH_TTL_MS) return null
  if (typeof v.code === 'string' && typeof v.state === 'string' && TOKEN.test(v.code) && TOKEN.test(v.state))
    return { code: v.code, state: v.state, at: v.at }
  if (typeof v.error === 'string' && /^[a-z_]{1,64}$/.test(v.error)) return { error: v.error, at: v.at }
  return null
}

export const clearReturnStash = () => {
  remove(session(), RETURN_STASH_KEY)
  delete (globalThis as Record<string, unknown>)[RETURN_STASH_GLOBAL]
}

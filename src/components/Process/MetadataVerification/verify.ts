/**
 * Browser-side check of what the voter is shown against what the Vochain committed.
 *
 * Every published question is its own on-chain election, and each election commits
 * `metadataHash`: the lowercase hex SHA-256 of the exact bytes served at its metadata URL
 * (vocdoni/vocdoni-node#1486). Media referenced by the metadata is covered by
 * `meta.mediaHashes`, a map from each media URL (as written in the metadata) to the SHA-256
 * of its bytes. A URL missing from that map is simply not verifiable (e.g. a YouTube link),
 * never an error.
 *
 * Everything that touches the network or WebCrypto is injected, so this module stays pure
 * and testable.
 */

/** Outcome of comparing fetched bytes with a committed hash. */
export type HashCheck = 'verified' | 'mismatch' | 'unverifiable' | 'no-hash'

/** Why a document or medium could not be checked. */
export type UnverifiableReason = 'chain-unavailable' | 'unsupported-url' | 'fetch-failed' | 'too-large' | 'not-listed'

export type DocumentVerification = {
  /** On-chain election id of the question. */
  electionId: string
  metadataURL?: string
  expectedHash?: string
  actualHash?: string
  status: HashCheck
  reason?: UnverifiableReason
}

export type MediaVerification = {
  url: string
  expectedHash?: string
  actualHash?: string
  /** Media are never `no-hash`: a URL absent from `meta.mediaHashes` is `unverifiable`. */
  status: Exclude<HashCheck, 'no-hash'>
  reason?: UnverifiableReason
}

export type ProcessVerification = {
  status: HashCheck
  documents: DocumentVerification[]
  media: MediaVerification[]
}

/** The Vochain API election fields this check reads. */
export type ChainElectionInfo = {
  metadataURL?: string
  metadataHash?: string
}

export type Sha256Hex = (bytes: ArrayBuffer | Uint8Array) => Promise<string>

/** Fetches a URL's raw bytes; rejects on network/CORS errors and non-2xx responses. */
export type FetchBytes = (url: string) => Promise<ArrayBuffer>

export type VerifyDeps = {
  getElection: (electionId: string) => Promise<ChainElectionInfo>
  fetchBytes: FetchBytes
  sha256: Sha256Hex
}

/** Thrown by a {@link FetchBytes} implementation when a resource exceeds its size cap. */
export class ResourceTooLargeError extends Error {
  constructor(url: string) {
    super(`resource too large to verify: ${url}`)
    this.name = 'ResourceTooLargeError'
  }
}

export const toHex = (bytes: Uint8Array): string => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')

/** SHA-256 through WebCrypto, as lowercase hex. */
export const createSha256Hex =
  (subtle: SubtleCrypto | undefined = globalThis.crypto?.subtle): Sha256Hex =>
  async (bytes) => {
    if (!subtle) throw new Error('webcrypto is not available')
    const data = new Uint8Array(bytes)
    return toHex(new Uint8Array(await subtle.digest('SHA-256', data)))
  }

/** Lowercase hex without a `0x` prefix; undefined for an empty value. */
export const normalizeHash = (hash?: string | null): string | undefined => {
  const value = hash?.trim().toLowerCase().replace(/^0x/, '')
  return value ? value : undefined
}

/** Compares a computed hash with a committed one. */
export const compareHash = (actual: string | undefined, expected?: string | null): HashCheck => {
  const want = normalizeHash(expected)
  if (!want) return 'no-hash'
  const got = normalizeHash(actual)
  if (!got) return 'unverifiable'
  return got === want ? 'verified' : 'mismatch'
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** Reads `meta.mediaHashes` from a parsed metadata document, keeping only string entries. */
export const readMediaHashes = (metadata: unknown): Record<string, string> => {
  if (!isRecord(metadata) || !isRecord(metadata.meta) || !isRecord(metadata.meta.mediaHashes)) return {}
  const hashes: Record<string, string> = {}
  for (const [url, hash] of Object.entries(metadata.meta.mediaHashes)) {
    const normalized = typeof hash === 'string' ? normalizeHash(hash) : undefined
    if (normalized) hashes[url] = normalized
  }
  return hashes
}

/** Parses metadata bytes as JSON; undefined when they are not valid JSON. */
export const parseMetadata = (bytes: ArrayBuffer | Uint8Array): unknown => {
  try {
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return undefined
  }
}

const isFetchableUrl = (url?: string): url is string => !!url && /^https?:\/\//i.test(url)

/**
 * Worst outcome wins. Documents decide the headline: all verified → verified, all without a
 * committed hash → no-hash, anything else → unverifiable. A media mismatch overrides it, but
 * unverifiable media do not: an unhashable link (a video platform) is expected, not suspicious.
 */
export const summarize = (documents: DocumentVerification[], media: MediaVerification[]): HashCheck => {
  if (documents.some((d) => d.status === 'mismatch') || media.some((m) => m.status === 'mismatch')) return 'mismatch'
  if (documents.length > 0 && documents.every((d) => d.status === 'verified')) return 'verified'
  if (documents.length > 0 && documents.every((d) => d.status === 'no-hash')) return 'no-hash'
  return 'unverifiable'
}

type DocumentResult = { verification: DocumentVerification; mediaHashes: Record<string, string> }

const verifyDocument = async (electionId: string, deps: VerifyDeps): Promise<DocumentResult> => {
  let info: ChainElectionInfo
  try {
    info = await deps.getElection(electionId)
  } catch {
    return { verification: { electionId, status: 'unverifiable', reason: 'chain-unavailable' }, mediaHashes: {} }
  }

  const { metadataURL } = info
  const expectedHash = normalizeHash(info.metadataHash)
  const base = { electionId, metadataURL, expectedHash }

  if (!expectedHash) return { verification: { ...base, status: 'no-hash' }, mediaHashes: {} }
  if (!isFetchableUrl(metadataURL)) {
    return { verification: { ...base, status: 'unverifiable', reason: 'unsupported-url' }, mediaHashes: {} }
  }

  let bytes: ArrayBuffer
  try {
    bytes = await deps.fetchBytes(metadataURL)
  } catch (error) {
    const reason = error instanceof ResourceTooLargeError ? 'too-large' : 'fetch-failed'
    return { verification: { ...base, status: 'unverifiable', reason }, mediaHashes: {} }
  }

  const actualHash = await deps.sha256(bytes)
  const status = compareHash(actualHash, expectedHash)
  // Media hashes are only as trustworthy as the document listing them: read them from a
  // document the chain vouches for, never from one that failed the check.
  const mediaHashes = status === 'verified' ? readMediaHashes(parseMetadata(bytes)) : {}

  return { verification: { ...base, actualHash, status }, mediaHashes }
}

const verifyMedium = async (
  url: string,
  expectedHash: string | undefined,
  deps: VerifyDeps
): Promise<MediaVerification> => {
  if (!expectedHash) return { url, status: 'unverifiable', reason: 'not-listed' }
  if (!isFetchableUrl(url)) return { url, expectedHash, status: 'unverifiable', reason: 'unsupported-url' }

  let bytes: ArrayBuffer
  try {
    bytes = await deps.fetchBytes(url)
  } catch (error) {
    // CORS failures land here too: the browser hides the bytes, so the medium can't be checked.
    const reason = error instanceof ResourceTooLargeError ? 'too-large' : 'fetch-failed'
    return { url, expectedHash, status: 'unverifiable', reason }
  }

  const actualHash = await deps.sha256(bytes)
  return {
    url,
    expectedHash,
    actualHash,
    status: compareHash(actualHash, expectedHash) === 'verified' ? 'verified' : 'mismatch',
  }
}

/**
 * Verifies the metadata document of every given on-chain election and every displayed media
 * URL against the hashes those documents list.
 */
export const verifyProcessMetadata = async (
  { electionIds, mediaUrls }: { electionIds: string[]; mediaUrls: string[] },
  deps: VerifyDeps
): Promise<ProcessVerification> => {
  const results = await Promise.all(electionIds.map((id) => verifyDocument(id, deps)))
  const documents = results.map((r) => r.verification)

  const mediaHashes: Record<string, string> = {}
  for (const { mediaHashes: hashes } of results) {
    for (const [url, hash] of Object.entries(hashes)) mediaHashes[url] ??= hash
  }

  const uniqueMedia = [...new Set(mediaUrls.filter(Boolean))]
  const media = await Promise.all(uniqueMedia.map((url) => verifyMedium(url, mediaHashes[url], deps)))

  return { status: summarize(documents, media), documents, media }
}

/** The media URLs a voter sees on the ballot: header, stream and choice images. */
export const displayedMediaUrls = (election: {
  header?: string
  streamUri?: string
  questions?: Array<{ choices?: Array<{ meta?: { image?: unknown } }> }>
}): string[] => {
  const urls: string[] = []
  const push = (value: unknown) => {
    if (typeof value === 'string' && value.trim()) urls.push(value.trim())
  }

  push(election.header)
  push(election.streamUri)
  for (const question of election.questions ?? []) {
    for (const choice of question.choices ?? []) {
      const image = choice.meta?.image
      if (isRecord(image)) {
        push(image.default)
        push(image.thumbnail)
      } else {
        push(image)
      }
    }
  }

  return [...new Set(urls)]
}

/** Largest resource the browser downloads to hash. Videos above it are reported as too large. */
export const MAX_VERIFIABLE_BYTES = 25 * 1024 * 1024

/**
 * {@link FetchBytes} on top of `fetch`: no credentials (public resources only), and a byte cap
 * enforced both from `Content-Length` and while streaming, so a long video is not downloaded
 * just to be hashed.
 */
export const createFetchBytes =
  (fetchImpl: typeof fetch = globalThis.fetch, maxBytes = MAX_VERIFIABLE_BYTES): FetchBytes =>
  async (url) => {
    const controller = new AbortController()
    const response = await fetchImpl(url, { credentials: 'omit', signal: controller.signal })
    if (!response.ok) throw new Error(`request failed (${response.status}) for ${url}`)

    const declared = Number(response.headers.get('content-length'))
    if (Number.isFinite(declared) && declared > maxBytes) {
      controller.abort()
      throw new ResourceTooLargeError(url)
    }

    if (!response.body) {
      const buffer = await response.arrayBuffer()
      if (buffer.byteLength > maxBytes) throw new ResourceTooLargeError(url)
      return buffer
    }

    const reader = response.body.getReader()
    const chunks: Uint8Array[] = []
    let total = 0
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > maxBytes) {
        controller.abort()
        throw new ResourceTooLargeError(url)
      }
      chunks.push(value)
    }

    const bytes = new Uint8Array(total)
    let offset = 0
    for (const chunk of chunks) {
      bytes.set(chunk, offset)
      offset += chunk.byteLength
    }
    return bytes.buffer
  }

/** Reads an election's committed metadata URL and hash from the Vochain API (`/v2`). */
export const createGetChainElection =
  (gateway: string, fetchImpl: typeof fetch = globalThis.fetch) =>
  async (electionId: string): Promise<ChainElectionInfo> => {
    const id = electionId.replace(/^0x/i, '').toLowerCase()
    const response = await fetchImpl(`${gateway}/elections/${id}`)
    if (!response.ok) throw new Error(`vochain election request failed (${response.status}) for ${id}`)
    const body = (await response.json()) as ChainElectionInfo
    return { metadataURL: body.metadataURL, metadataHash: body.metadataHash }
  }

/**
 * Browser-side check of what the voter is shown against what the Vochain committed.
 *
 * A SaaS process is published as a parent election, whose metadata document carries the
 * process title, description and media, plus one election per question, whose document
 * carries that question and its choices. Each election commits `metadataHash`: the lowercase
 * hex SHA-256 of the exact bytes served at its metadata URL (vocdoni/vocdoni-node#1486).
 * Images (the header, choice images) are covered by the parent document's `meta.mediaHashes`,
 * a map from each image URL (as written in the metadata) to the SHA-256 of its bytes. The
 * backend hashes every image, so an image a verified parent does not list is a mismatch. A
 * video is never hashed: only its URL is covered, as the parent's `media.streamUri`.
 *
 * Everything that touches the network or WebCrypto is injected, so this module stays pure
 * and testable.
 */

/** Outcome of comparing fetched bytes with a committed hash. */
export type HashCheck = 'verified' | 'mismatch' | 'unverifiable' | 'no-hash'

/** Why a document or medium could not be checked. */
export type UnverifiableReason =
  | 'chain-unavailable'
  | 'unsupported-url'
  | 'fetch-failed'
  | 'too-large'
  | 'not-listed'
  /** The process was published without a parent election, so nothing commits its own fields. */
  | 'no-parent'
  /** The parent election exists but its document could not be verified, so its image hashes are unknown. */
  | 'parent-unverified'

/** A piece of the ballot the voter is shown, compared with the verified metadata document. */
export type ContentField =
  | 'process-title'
  | 'process-description'
  | 'question-title'
  | 'question-description'
  | 'choices'
  | 'choice-title'
  | 'choice-value'
  | 'header'
  | 'stream'
  /** The parent election belongs to the same organization as the question elections. */
  | 'organization'
  /** The parent document lists exactly the question elections the page shows, in order. */
  | 'question-list'

export type FieldCheck = {
  field: ContentField
  /** Choice position, for `choice-title` / `choice-value`. */
  choice?: number
  status: Exclude<HashCheck, 'no-hash'>
}

export type DocumentVerification = {
  /** On-chain election id; absent for a process without a parent election. */
  electionId?: string
  metadataURL?: string
  expectedHash?: string
  actualHash?: string
  /**
   * `mismatch` either when the bytes differ from the committed hash, or when they match but
   * what the page shows differs from them (then `fields` names the differing pieces).
   */
  status: HashCheck
  reason?: UnverifiableReason
  /** Field-by-field comparison of the shown ballot with a hash-verified document. */
  fields?: FieldCheck[]
}

/** One displayed image, checked against the parent document's `meta.mediaHashes`. */
export type MediaVerification = {
  url: string
  expectedHash?: string
  actualHash?: string
  status: Exclude<HashCheck, 'no-hash'>
  reason?: UnverifiableReason
  /**
   * The exact bytes that matched `expectedHash`, present only when `verified`. The page
   * renders the image from these bytes, never from a second request to `url`, so the voter
   * sees what was verified.
   */
  bytes?: ArrayBuffer
}

export type ProcessVerification = {
  status: HashCheck
  /** The parent election's document: process title, description and media. */
  process: DocumentVerification
  /** One per published question. */
  documents: DocumentVerification[]
  media: MediaVerification[]
}

/** Multi-language text as served by the SaaS API or written in a metadata document. */
export type LocalizedValue = string | Record<string, string | undefined> | null | undefined

export type DisplayedChoice = { title?: LocalizedValue; value?: number; meta?: { image?: unknown } }

export type DisplayedQuestion = {
  /** On-chain election id; questions without one are not published and are skipped. */
  upstreamId?: string
  title?: LocalizedValue
  description?: LocalizedValue
  choices?: DisplayedChoice[]
}

/** What the voter page renders, as read from the SaaS API. */
export type DisplayedProcess = {
  /** On-chain id of the parent election; absent for processes published without one. */
  upstreamId?: string
  title?: LocalizedValue
  description?: LocalizedValue
  header?: string
  streamUri?: string
  questions?: DisplayedQuestion[]
}

/** The Vochain API election fields this check reads. */
export type ChainElectionInfo = {
  organizationId?: string
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

const toLanguageMap = (value: unknown): Record<string, string> => {
  if (typeof value === 'string') return value ? { default: value } : {}
  if (!isRecord(value)) return {}
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1] !== '')
  )
}

/**
 * True when the shown text matches the document's in every language the document has. A
 * document without the text matches only a page that shows none either.
 */
export const localizedMatches = (shown: unknown, documented: unknown): boolean => {
  const doc = toLanguageMap(documented)
  const page = toLanguageMap(shown)
  const languages = Object.keys(doc)
  if (languages.length === 0) return Object.keys(page).length === 0
  return languages.every((language) => page[language] === doc[language])
}

const sameText = (shown: unknown, documented: unknown) =>
  (typeof shown === 'string' ? shown : '') === (typeof documented === 'string' ? documented : '')

const check = (field: ContentField, matches: boolean, choice?: number): FieldCheck => ({
  field,
  ...(choice === undefined ? {} : { choice }),
  status: matches ? 'verified' : 'mismatch',
})

const record = (value: unknown): Record<string, unknown> => (isRecord(value) ? value : {})

/** Process-level fields: what the parent election's document vouches for. */
const PROCESS_FIELDS: ContentField[] = ['question-list', 'process-title', 'process-description', 'header', 'stream']

/**
 * Compares the process-level content the page shows (title, description, header, stream)
 * with the parent election's hash-verified metadata document, and the page's question
 * elections, in order, with the `meta.questionElections` list that document commits.
 */
export const compareProcessContent = (
  process: DisplayedProcess,
  metadata: unknown,
  questionElectionIds: string[]
): FieldCheck[] => {
  const doc = record(metadata)
  const media = record(doc.media)
  const listed = record(doc.meta).questionElections
  const listMatches =
    Array.isArray(listed) &&
    listed.length === questionElectionIds.length &&
    listed.every(
      (id, index) => typeof id === 'string' && normalizeHash(id) === normalizeHash(questionElectionIds[index])
    )
  return [
    check('question-list', listMatches),
    check('process-title', localizedMatches(process.title, doc.title)),
    check('process-description', localizedMatches(process.description, doc.description)),
    check('header', sameText(process.header, media.header)),
    check('stream', sameText(process.streamUri, media.streamUri)),
  ]
}

/**
 * Compares one question as the page shows it (title, description, choices by position with
 * their values) with that question's hash-verified metadata document.
 */
export const compareQuestionContent = (question: DisplayedQuestion, metadata: unknown): FieldCheck[] => {
  const doc = record(metadata)
  const docQuestion = record(Array.isArray(doc.questions) ? doc.questions[0] : undefined)
  const docChoices: unknown[] = Array.isArray(docQuestion.choices) ? docQuestion.choices : []
  const shownChoices = question.choices ?? []

  const fields: FieldCheck[] = [
    check('question-title', localizedMatches(question.title, docQuestion.title)),
    check('question-description', localizedMatches(question.description, docQuestion.description)),
    check('choices', shownChoices.length === docChoices.length),
  ]
  shownChoices.forEach((choice, index) => {
    const docChoice = docChoices[index]
    if (!isRecord(docChoice)) {
      fields.push(check('choice-title', false, index), check('choice-value', false, index))
      return
    }
    fields.push(
      check('choice-title', localizedMatches(choice.title, docChoice.title), index),
      check('choice-value', choice.value === docChoice.value, index)
    )
  })
  return fields
}

const isFetchableUrl = (url?: string): url is string => !!url && /^https?:\/\//i.test(url)

const sameAccount = (a?: string, b?: string) => !!a && !!b && normalizeHash(a) === normalizeHash(b)

/**
 * Worst outcome wins. Documents decide the headline: all verified → verified, all without a
 * committed hash → no-hash, anything else → unverifiable. A process published without a
 * parent election (`no-parent`) does not hold back a verified headline: its process-level
 * fields are listed as not verifiable instead. A media mismatch overrides it all, but
 * unverifiable media do not: an unhashable link (a video platform) is expected.
 */
export const summarize = (
  process: DocumentVerification,
  documents: DocumentVerification[],
  media: MediaVerification[]
): HashCheck => {
  const all = process.reason === 'no-parent' ? documents : [process, ...documents]
  if (all.some((d) => d.status === 'mismatch') || media.some((m) => m.status === 'mismatch')) return 'mismatch'
  if (documents.length > 0 && all.every((d) => d.status === 'verified')) return 'verified'
  if (documents.length > 0 && all.every((d) => d.status === 'no-hash')) return 'no-hash'
  return 'unverifiable'
}

type FetchedDocument = {
  verification: DocumentVerification
  organizationId?: string
  /** Parsed document (null when not JSON), only when its bytes match the committed hash. */
  metadata?: unknown
}

/** Reads an election from the chain and hash-checks the metadata document it commits. */
const fetchDocument = async (electionId: string, deps: VerifyDeps): Promise<FetchedDocument> => {
  let info: ChainElectionInfo
  try {
    info = await deps.getElection(electionId)
  } catch {
    return { verification: { electionId, status: 'unverifiable', reason: 'chain-unavailable' } }
  }

  const { metadataURL, organizationId } = info
  const expectedHash = normalizeHash(info.metadataHash)
  const base = { electionId, metadataURL, expectedHash }

  if (!expectedHash) return { verification: { ...base, status: 'no-hash' }, organizationId }
  if (!isFetchableUrl(metadataURL)) {
    return { verification: { ...base, status: 'unverifiable', reason: 'unsupported-url' }, organizationId }
  }

  let bytes: ArrayBuffer
  try {
    bytes = await deps.fetchBytes(metadataURL)
  } catch (error) {
    const reason = error instanceof ResourceTooLargeError ? 'too-large' : 'fetch-failed'
    return { verification: { ...base, status: 'unverifiable', reason }, organizationId }
  }

  const actualHash = await deps.sha256(bytes)
  const status = compareHash(actualHash, expectedHash)
  // Content and media hashes are only as trustworthy as the document carrying them: read
  // them from a document the chain vouches for, never from one that failed the check.
  return {
    verification: { ...base, actualHash, status },
    organizationId,
    // A verified document that is not valid JSON still gets compared (as an empty one), so
    // the page cannot pass as verified against content nobody can read.
    metadata: status === 'verified' ? (parseMetadata(bytes) ?? null) : undefined,
  }
}

/**
 * Applies a field comparison to a hash-verified document. The page renders the SaaS API's
 * copy of the ballot, not the document: a matching hash proves nothing about the screen
 * until the two are compared field by field.
 */
const withFields = (verification: DocumentVerification, fields: FieldCheck[]): DocumentVerification => ({
  ...verification,
  status: fields.some((field) => field.status === 'mismatch') ? 'mismatch' : verification.status,
  fields,
})

const verifyImage = async (
  url: string,
  expectedHash: string | undefined,
  deps: VerifyDeps
): Promise<MediaVerification> => {
  // The backend hashes every image it publishes: one a verified parent does not list was
  // not committed by the organizer.
  if (!expectedHash) return { url, status: 'mismatch', reason: 'not-listed' }
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
  return compareHash(actualHash, expectedHash) === 'verified'
    ? { url, expectedHash, actualHash, status: 'verified', bytes }
    : { url, expectedHash, actualHash, status: 'mismatch' }
}

/**
 * Verifies a process as the page shows it against the chain:
 *
 * - the parent election (the process's own `upstreamId`) commits the process-level document:
 *   title, description, header, stream, the media hashes and the ordered list of question
 *   elections. It must belong to the same organization as the question elections, or anyone
 *   could point a process at their own parent. A process published without one leaves those
 *   fields not verifiable;
 * - each published question's election commits that question's document: title,
 *   description and choices;
 * - each displayed medium is hashed against the parent document's `meta.mediaHashes`.
 */
export const verifyProcessMetadata = async (
  process: DisplayedProcess,
  deps: VerifyDeps
): Promise<ProcessVerification> => {
  const published = (process.questions ?? []).filter(
    (question): question is DisplayedQuestion & { upstreamId: string } => !!question.upstreamId
  )

  const [parent, questions] = await Promise.all([
    process.upstreamId ? fetchDocument(process.upstreamId, deps) : Promise.resolve(undefined),
    Promise.all(published.map((question) => fetchDocument(question.upstreamId, deps))),
  ])

  const documents = questions.map(({ verification, metadata }, index) =>
    metadata === undefined ? verification : withFields(verification, compareQuestionContent(published[index], metadata))
  )

  let processVerification: DocumentVerification
  if (!parent) {
    processVerification = {
      status: 'unverifiable',
      reason: 'no-parent',
      fields: PROCESS_FIELDS.map((field): FieldCheck => ({ field, status: 'unverifiable' })),
    }
  } else {
    const questionOrganizations = questions.map((q) => q.organizationId).filter((id): id is string => !!id)
    const organization: FieldCheck =
      !parent.organizationId || questionOrganizations.length === 0
        ? { field: 'organization', status: 'unverifiable' }
        : check(
            'organization',
            questionOrganizations.every((id) => sameAccount(id, parent.organizationId))
          )
    const fields =
      parent.metadata === undefined
        ? [organization]
        : [
            organization,
            ...compareProcessContent(
              process,
              parent.metadata,
              published.map((question) => question.upstreamId)
            ),
          ]
    processVerification = withFields(parent.verification, fields)
  }

  // Only a parent whose bytes match its committed hash vouches for image hashes.
  const images = displayedImageUrls(process)
  const media: MediaVerification[] =
    parent?.metadata === undefined
      ? images.map((url) => ({ url, status: 'unverifiable', reason: parent ? 'parent-unverified' : 'no-parent' }))
      : await (async () => {
          const hashes = readMediaHashes(parent.metadata)
          return Promise.all(images.map((url) => verifyImage(url, hashes[url], deps)))
        })()

  return {
    status: summarize(processVerification, documents, media),
    process: processVerification,
    documents,
    media,
  }
}

/**
 * The image URLs a voter sees on the ballot: the header and choice images, as written (the
 * page looks them up by the same string). The video is not one: its content is never hashed.
 */
export const displayedImageUrls = (election: DisplayedProcess): string[] => {
  const urls: string[] = []
  const push = (value: unknown) => {
    if (typeof value === 'string' && value.trim()) urls.push(value)
  }

  push(election.header)
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

/** Largest resource the browser downloads to hash. Larger ones are reported as too large. */
export const MAX_VERIFIABLE_BYTES = 25 * 1024 * 1024

/**
 * {@link FetchBytes} on top of `fetch`: no credentials (public resources only), and a byte cap
 * enforced both from `Content-Length` and while streaming, so an oversized resource is not
 * downloaded just to be hashed.
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

/** Reads an election's organization and committed metadata URL and hash from the Vochain API (`/v2`). */
export const createGetChainElection =
  (gateway: string, fetchImpl: typeof fetch = globalThis.fetch) =>
  async (electionId: string): Promise<ChainElectionInfo> => {
    const id = electionId.replace(/^0x/i, '').toLowerCase()
    const response = await fetchImpl(`${gateway}/elections/${id}`)
    if (!response.ok) throw new Error(`vochain election request failed (${response.status}) for ${id}`)
    const body = (await response.json()) as ChainElectionInfo
    return { organizationId: body.organizationId, metadataURL: body.metadataURL, metadataHash: body.metadataHash }
  }

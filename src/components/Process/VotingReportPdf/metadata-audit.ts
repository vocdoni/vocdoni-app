/**
 * Audit of the metadata voters were shown for an on-chain (Vochain) election: its title,
 * description, media and the text of its questions and choices.
 *
 * The chain does not store that document, only its URL and the SHA-256 of its exact bytes, once for
 * the version the election was created with and once per later metadata update. The gateway lists
 * those versions at `GET /elections/{electionId}/metadata/history`, oldest first. This module fetches
 * every version, checks its bytes against the recorded hash, and diffs each version against the
 * previous one field by field, so a reader can tell a typo fix from a change of meaning.
 *
 * Everything here is free of React and i18n so it can be unit tested on its own.
 */

/** One entry of the gateway's metadata history, as served. */
export type MetadataHistoryEntry = {
  metadataURL?: string
  metadataHash?: string
  blockHeight?: number
  txIndex?: number
  txHash?: string
  timestamp?: string
}

/**
 * How a version's document relates to the hash recorded on chain:
 * - `verified`: fetched, and its SHA-256 matches the recorded hash.
 * - `mismatch`: fetched, but its SHA-256 differs, so it is not the document that was recorded.
 * - `unrecorded`: fetched, but the chain recorded no hash for it (elections created before hashes
 *   were recorded), so it cannot be verified.
 * - `unreachable`: the document could not be fetched.
 */
export type MetadataIntegrity = 'verified' | 'mismatch' | 'unrecorded' | 'unreachable'

export type MetadataChangeField =
  | 'title'
  | 'description'
  | 'header'
  | 'streamUri'
  | 'mediaHash'
  | 'questionElections'
  | 'questionTitle'
  | 'questionDescription'
  | 'choiceTitle'
  | 'other'

/**
 * One field that differs between two consecutive versions. `before`/`after` are null when the field
 * is absent on that side (e.g. a choice that was added). Indexes are zero-based.
 */
export type MetadataChange = {
  field: MetadataChangeField
  lang?: string
  question?: number
  choice?: number
  mediaUrl?: string
  before: string | null
  after: string | null
}

export type AuditedMetadataVersion = {
  metadataURL: string
  /** Lowercase hex without prefix; empty when the chain recorded none. */
  recordedHash: string
  /** Lowercase hex of the fetched bytes; empty when they could not be fetched. */
  computedHash: string
  /** 0 when the node could not locate the transaction that set this version. */
  blockHeight: number
  txHash: string
  /** Null when the node reports no usable time. */
  timestamp: Date | null
  integrity: MetadataIntegrity
  /**
   * Differences against the previous version: empty when the content shown to voters is the same,
   * null for the first version and whenever either side is unreadable or failed verification.
   */
  changes: MetadataChange[] | null
  /**
   * The question elections a process' parent election lists in `meta.questionElections`, in question
   * order, as lowercase hex. Null when the document does not list any or could not be trusted.
   */
  questionElections: string[] | null
}

export type ElectionMetadataAudit = {
  electionId: string
  /** False when the history itself could not be read, e.g. a gateway without the endpoint. */
  available: boolean
  versions: AuditedMetadataVersion[]
}

export type DiffSegment = { type: 'same' | 'removed' | 'added'; text: string }

type FetchLike = (input: string) => Promise<Pick<Response, 'ok' | 'json' | 'arrayBuffer'>>

const DEFAULT_TIMEOUT_MS = 15_000

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])

const asRecord = (value: unknown): Record<string, unknown> => (isRecord(value) ? value : {})

/** Lowercase hex without a `0x` prefix, or empty for anything that is not hex. */
export const normalizeHex = (value?: string | null): string => {
  const hex = (value ?? '').trim().replace(/^0x/i, '').toLowerCase()
  return /^[0-9a-f]+$/.test(hex) ? hex : ''
}

export const sha256Hex = async (bytes: ArrayBuffer | Uint8Array): Promise<string> => {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes as BufferSource)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/** A Go zero time (year 1) or an unparsable string means the node did not know when it happened. */
const parseTimestamp = (value?: string): Date | null => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) || date.getUTCFullYear() <= 1 ? null : date
}

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timed out')), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error: unknown) => {
        clearTimeout(timer)
        reject(error)
      }
    )
  })

// --- Field-level diff -------------------------------------------------------------------------

/** Multi-language text as a `lang → text` map; a plain string is the `default` language. */
const toLanguageMap = (value: unknown): Record<string, string> => {
  if (typeof value === 'string') return value ? { default: value } : {}
  if (!isRecord(value)) return {}
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string' && !!entry[1])
  )
}

const compareLanguages = (a: string, b: string) => {
  if (a === b) return 0
  if (a === 'default') return -1
  if (b === 'default') return 1
  return a.localeCompare(b)
}

const diffText = (
  before: unknown,
  after: unknown,
  base: Omit<MetadataChange, 'lang' | 'before' | 'after'>
): MetadataChange[] => {
  const beforeMap = toLanguageMap(before)
  const afterMap = toLanguageMap(after)
  const languages = [...new Set([...Object.keys(beforeMap), ...Object.keys(afterMap)])].sort(compareLanguages)

  return languages
    .filter((lang) => beforeMap[lang] !== afterMap[lang])
    .map((lang) => ({ ...base, lang, before: beforeMap[lang] ?? null, after: afterMap[lang] ?? null }))
}

const diffString = (before: unknown, after: unknown, base: Pick<MetadataChange, 'field'>): MetadataChange[] => {
  const beforeValue = typeof before === 'string' && before ? before : null
  const afterValue = typeof after === 'string' && after ? after : null
  return beforeValue === afterValue ? [] : [{ ...base, before: beforeValue, after: afterValue }]
}

const getMediaHashes = (doc: Record<string, unknown>): Record<string, string> => {
  const mediaHashes = asRecord(asRecord(doc.meta).mediaHashes)
  return Object.fromEntries(
    Object.entries(mediaHashes).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
  )
}

/** JSON with object keys sorted, so two documents differing only in key order compare equal. */
const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .filter((key) => value[key] !== undefined)
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(',')}}`
  }
  return JSON.stringify(value) ?? 'null'
}

/** `meta.questionElections` as normalized ids, or null when the document has no such list. */
const readQuestionElections = (doc: unknown): string[] | null => {
  const list = asRecord(asRecord(doc).meta).questionElections
  return Array.isArray(list) ? list.map((id) => normalizeHex(typeof id === 'string' ? id : '')) : null
}

const omit = (value: unknown, keys: string[]): Record<string, unknown> =>
  Object.fromEntries(Object.entries(asRecord(value)).filter(([key]) => !keys.includes(key)))

/** The document without the fields diffed one by one, to detect any change in the rest of it. */
const withoutAuditedFields = (doc: Record<string, unknown>): unknown => ({
  ...omit(doc, ['title', 'description', 'media', 'meta', 'questions']),
  media: omit(doc.media, ['header', 'streamUri']),
  meta: omit(doc.meta, ['mediaHashes', 'questionElections']),
  questions: asArray(doc.questions).map((question) =>
    isRecord(question)
      ? {
          ...omit(question, ['title', 'description', 'choices']),
          choices: asArray(question.choices).map((choice) => (isRecord(choice) ? omit(choice, ['title']) : choice)),
        }
      : question
  ),
})

/**
 * Field-level differences between two election metadata documents: multi-language title and
 * description, header image and video URLs, recorded media hashes, the question elections a parent
 * election lists, the title and description of every question and the title of every choice.
 * Anything else that differs is reported as a single `other` change, so no difference goes
 * unreported.
 */
export const diffMetadata = (beforeDoc: unknown, afterDoc: unknown): MetadataChange[] => {
  const before = asRecord(beforeDoc)
  const after = asRecord(afterDoc)
  const beforeMedia = asRecord(before.media)
  const afterMedia = asRecord(after.media)
  const changes: MetadataChange[] = [
    ...diffText(before.title, after.title, { field: 'title' }),
    ...diffText(before.description, after.description, { field: 'description' }),
    ...diffString(beforeMedia.header, afterMedia.header, { field: 'header' }),
    ...diffString(beforeMedia.streamUri, afterMedia.streamUri, { field: 'streamUri' }),
  ]

  const beforeHashes = getMediaHashes(before)
  const afterHashes = getMediaHashes(after)
  for (const url of [...new Set([...Object.keys(beforeHashes), ...Object.keys(afterHashes)])].sort()) {
    const beforeHash = normalizeHex(beforeHashes[url]) || null
    const afterHash = normalizeHex(afterHashes[url]) || null
    if (beforeHash !== afterHash)
      changes.push({ field: 'mediaHash', mediaUrl: url, before: beforeHash, after: afterHash })
  }

  // A parent election lists its question elections; the list is fixed at publish time, so any
  // change to it is notable and reported on its own.
  const beforeElections = readQuestionElections(before)
  const afterElections = readQuestionElections(after)
  if ((beforeElections ?? []).join('\n') !== (afterElections ?? []).join('\n')) {
    changes.push({
      field: 'questionElections',
      before: beforeElections?.length ? beforeElections.join('\n') : null,
      after: afterElections?.length ? afterElections.join('\n') : null,
    })
  }

  const beforeQuestions = asArray(before.questions)
  const afterQuestions = asArray(after.questions)
  for (let question = 0; question < Math.max(beforeQuestions.length, afterQuestions.length); question++) {
    const beforeQuestion = asRecord(beforeQuestions[question])
    const afterQuestion = asRecord(afterQuestions[question])
    changes.push(
      ...diffText(beforeQuestion.title, afterQuestion.title, { field: 'questionTitle', question }),
      ...diffText(beforeQuestion.description, afterQuestion.description, { field: 'questionDescription', question })
    )

    const beforeChoices = asArray(beforeQuestion.choices)
    const afterChoices = asArray(afterQuestion.choices)
    for (let choice = 0; choice < Math.max(beforeChoices.length, afterChoices.length); choice++) {
      const beforeChoice = asRecord(beforeChoices[choice])
      const afterChoice = asRecord(afterChoices[choice])
      changes.push(...diffText(beforeChoice.title, afterChoice.title, { field: 'choiceTitle', question, choice }))
    }
  }

  if (stableStringify(withoutAuditedFields(before)) !== stableStringify(withoutAuditedFields(after))) {
    changes.push({ field: 'other', before: null, after: null })
  }

  return changes
}

// --- Word-level text diff ---------------------------------------------------------------------

// Above this many LCS cells the texts are shown as fully replaced rather than diffed word by word,
// to keep the report generation bounded on very long descriptions.
const MAX_DIFF_CELLS = 4_000_000

/** Words and whitespace runs as separate tokens, so joining them rebuilds the text exactly. */
const tokenize = (text: string) => text.match(/\s+|\S+/g) ?? []

/** Words with the whitespace around them, for counting context words; joining rebuilds the text. */
const splitWords = (text: string) => text.match(/\s*\S+\s*|\s+/g) ?? []

const pushSegment = (segments: DiffSegment[], type: DiffSegment['type'], text: string) => {
  const last = segments[segments.length - 1]
  if (last?.type === type) last.text += text
  else if (text) segments.push({ type, text })
}

/** Word-level diff of two texts as runs of unchanged, removed and added text. */
export const diffWords = (before: string, after: string): DiffSegment[] => {
  const a = tokenize(before)
  const b = tokenize(after)
  const segments: DiffSegment[] = []

  if (a.length * b.length > MAX_DIFF_CELLS) {
    pushSegment(segments, 'removed', before)
    pushSegment(segments, 'added', after)
    return segments
  }

  // lengths[i][j] = LCS length of a[i..] and b[j..]
  const lengths = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1))
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lengths[i][j] = a[i] === b[j] ? lengths[i + 1][j + 1] + 1 : Math.max(lengths[i + 1][j], lengths[i][j + 1])
    }
  }

  let i = 0
  let j = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      pushSegment(segments, 'same', a[i])
      i++
      j++
    } else if (lengths[i + 1][j] >= lengths[i][j + 1]) {
      pushSegment(segments, 'removed', a[i++])
    } else {
      pushSegment(segments, 'added', b[j++])
    }
  }
  while (i < a.length) pushSegment(segments, 'removed', a[i++])
  while (j < b.length) pushSegment(segments, 'added', b[j++])

  return segments
}

/**
 * Shortens long unchanged runs to the words next to a change, so a one-word fix in a long
 * description reads as that fix in its context instead of the whole description twice.
 */
export const condenseDiff = (segments: DiffSegment[], contextWords = 8, ellipsis = '… '): DiffSegment[] =>
  segments.map((segment, index) => {
    if (segment.type !== 'same') return segment
    const words = splitWords(segment.text)
    const hasChangeBefore = index > 0
    const hasChangeAfter = index < segments.length - 1
    const keep = (hasChangeBefore ? contextWords : 0) + (hasChangeAfter ? contextWords : 0)
    if (words.length <= keep + 1) return segment

    const head = hasChangeBefore ? words.slice(0, contextWords).join('') : ''
    const tail = hasChangeAfter ? words.slice(words.length - contextWords).join('') : ''
    return { type: 'same', text: `${head}${ellipsis}${tail}` }
  })

// --- Fetching and verification ----------------------------------------------------------------

type FetchedDocument = { integrity: MetadataIntegrity; computedHash: string; document: unknown }

const fetchVersionDocument = async (
  url: string,
  recordedHash: string,
  fetchImpl: FetchLike,
  timeoutMs: number
): Promise<FetchedDocument> => {
  const unreachable: FetchedDocument = { integrity: 'unreachable', computedHash: '', document: undefined }
  if (!/^https?:\/\//i.test(url)) return unreachable

  try {
    const response = await withTimeout(fetchImpl(url), timeoutMs)
    if (!response.ok) return unreachable
    const bytes = new Uint8Array(await withTimeout(response.arrayBuffer(), timeoutMs))
    const computedHash = await sha256Hex(bytes)
    let document: unknown
    try {
      document = JSON.parse(new TextDecoder().decode(bytes))
    } catch {
      document = undefined
    }
    const integrity: MetadataIntegrity = !recordedHash
      ? 'unrecorded'
      : recordedHash === computedHash
        ? 'verified'
        : 'mismatch'
    return { integrity, computedHash, document }
  } catch {
    return unreachable
  }
}

/** A version's content can be compared only when it was read, parsed, and did not fail its hash. */
const isComparable = (fetched: FetchedDocument) =>
  (fetched.integrity === 'verified' || fetched.integrity === 'unrecorded') && isRecord(fetched.document)

/** Builds the audit from the history entries; exported for tests that do not go through the gateway. */
export const auditMetadataVersions = async (
  entries: MetadataHistoryEntry[],
  fetchImpl: FetchLike,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<AuditedMetadataVersion[]> => {
  const fetched = await Promise.all(
    entries.map((entry) =>
      fetchVersionDocument(entry.metadataURL ?? '', normalizeHex(entry.metadataHash), fetchImpl, timeoutMs)
    )
  )

  return entries.map((entry, index) => {
    const current = fetched[index]
    const previous = index > 0 ? fetched[index - 1] : undefined
    const changes =
      previous && isComparable(previous) && isComparable(current)
        ? diffMetadata(previous.document, current.document)
        : null

    return {
      metadataURL: entry.metadataURL ?? '',
      recordedHash: normalizeHex(entry.metadataHash),
      computedHash: current.computedHash,
      blockHeight: entry.blockHeight ?? 0,
      txHash: normalizeHex(entry.txHash),
      timestamp: parseTimestamp(entry.timestamp),
      integrity: current.integrity,
      questionElections: isComparable(current) ? readQuestionElections(current.document) : null,
      changes,
    }
  })
}

/**
 * Reads an election's metadata history from the Vochain gateway and audits every version. Never
 * throws: an unreadable history comes back as `available: false`.
 */
export const auditElectionMetadata = async ({
  gatewayUrl,
  electionId,
  fetchImpl = (input) => fetch(input),
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: {
  gatewayUrl: string
  electionId: string
  fetchImpl?: FetchLike
  timeoutMs?: number
}): Promise<ElectionMetadataAudit> => {
  const unavailable: ElectionMetadataAudit = { electionId, available: false, versions: [] }

  try {
    const response = await withTimeout(fetchImpl(`${gatewayUrl}/elections/${electionId}/metadata/history`), timeoutMs)
    if (!response.ok) return unavailable
    const body: unknown = await withTimeout(response.json(), timeoutMs)
    const entries = (isRecord(body) ? asArray(body.versions) : []).filter(isRecord) as MetadataHistoryEntry[]
    if (!entries.length) return unavailable

    return { electionId, available: true, versions: await auditMetadataVersions(entries, fetchImpl, timeoutMs) }
  } catch {
    return unavailable
  }
}

/** True when the election had at least one metadata update after the version it was created with. */
/**
 * The question elections listed by the latest trusted version of a parent election's metadata, or
 * null when no version lists them.
 */
export const getListedQuestionElections = (audit: ElectionMetadataAudit): string[] | null =>
  [...audit.versions].reverse().find((version) => version.questionElections !== null)?.questionElections ?? null

export const hasMetadataUpdates = (audit: ElectionMetadataAudit) => audit.versions.length > 1

/** True when some version could not be verified against its recorded hash. */
export const hasIntegrityIssues = (audit: ElectionMetadataAudit) =>
  audit.versions.some((version) => version.integrity === 'mismatch' || version.integrity === 'unreachable')

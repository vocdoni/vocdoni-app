import { createHash, webcrypto } from 'node:crypto'
import {
  compareContent,
  compareHash,
  createFetchBytes,
  createSha256Hex,
  displayedMediaUrls,
  localizedMatches,
  normalizeHash,
  readMediaHashes,
  ResourceTooLargeError,
  summarize,
  verifyProcessMetadata,
  type ChainElectionInfo,
  type DisplayedProcess,
  type DisplayedQuestion,
  type VerifyDeps,
} from './verify'

const sha256 = createSha256Hex(webcrypto.subtle as unknown as SubtleCrypto)
const encode = (text: string) => new TextEncoder().encode(text)
const nodeHash = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')

const HEADER = 'https://cdn.example.org/header.png'
const VIDEO = 'https://www.youtube.com/watch?v=abc'
const IMAGE = 'https://cdn.example.org/choice.png'
const META_URL = 'https://saas.example.org/storage/meta.json'

const headerBytes = encode('header-image-bytes')
const imageBytes = encode('choice-image-bytes')

type World = {
  chain: Record<string, ChainElectionInfo | Error>
  files: Record<string, Uint8Array | Error>
}

const depsFor = (world: World): VerifyDeps => ({
  sha256,
  getElection: async (id) => {
    const info = world.chain[id]
    if (!info || info instanceof Error) throw info ?? new Error('not found')
    return info
  },
  fetchBytes: async (url) => {
    const file = world.files[url]
    if (!file || file instanceof Error) throw file ?? new TypeError('Failed to fetch')
    return file.slice().buffer
  },
})

const question = (upstreamId: string): DisplayedQuestion => ({
  upstreamId,
  title: { default: 'Who should chair the board?', es: '¿Quién debe presidir la junta?' },
  choices: [
    { title: { default: 'Alice', es: 'Alicia' }, value: 0, meta: { image: { default: IMAGE } } },
    { title: { default: 'Bob', es: 'Roberto' }, value: 1 },
  ],
})

/** What the page shows, as read from the SaaS API. */
const shownProcess = (ids: string[] = ['e1']): DisplayedProcess => ({
  title: { default: 'Board election', es: 'Elección de la junta' },
  description: { default: 'Choose the chair.' },
  header: HEADER,
  streamUri: VIDEO,
  questions: ids.map(question),
})

/** The metadata document saas-backend writes for one question of `process`. */
const docObject = (
  process: DisplayedProcess,
  index = 0,
  { mediaHashes = {}, withProcess = true }: { mediaHashes?: Record<string, string>; withProcess?: boolean } = {}
) => {
  const q = process.questions![index]
  return {
    title: q.title,
    version: '1.0',
    description: null,
    media: { header: process.header, streamUri: process.streamUri },
    meta: {
      mediaHashes,
      ...(withProcess ? { process: { title: process.title, description: process.description } } : {}),
    },
    questions: [
      {
        title: q.title,
        description: q.description ?? null,
        choices: q.choices!.map(({ title, value }) => ({ title, value })),
      },
    ],
    type: { name: 'single-choice-multiquestion', properties: null },
  }
}

const encodeDoc = (doc: unknown) => encode(JSON.stringify(doc))
const metadataDoc = (mediaHashes: Record<string, string> = {}, process = shownProcess()) =>
  encodeDoc(docObject(process, 0, { mediaHashes }))

/** A world where question e1's committed document is `doc`. */
const committed = (doc: Uint8Array, extra: Partial<World> = {}): World => ({
  chain: { e1: { metadataURL: META_URL, metadataHash: nodeHash(doc) }, ...extra.chain },
  files: { [META_URL]: doc, ...extra.files },
})

describe('hash helpers', () => {
  it('hashes bytes as lowercase hex SHA-256, matching node', async () => {
    const bytes = encode('hello vocdoni')
    expect(await sha256(bytes)).toBe(nodeHash(bytes))
  })

  it('normalizes case and 0x prefix, and treats blank as absent', () => {
    expect(normalizeHash('0xABcd')).toBe('abcd')
    expect(normalizeHash('  ')).toBeUndefined()
    expect(normalizeHash(undefined)).toBeUndefined()
  })

  it('compares against the committed hash', () => {
    expect(compareHash('abcd', 'ABCD')).toBe('verified')
    expect(compareHash('abcd', '0xabce')).toBe('mismatch')
    expect(compareHash('abcd', '')).toBe('no-hash')
    expect(compareHash(undefined, 'abcd')).toBe('unverifiable')
  })

  it('reads only string media hashes', () => {
    expect(readMediaHashes({ meta: { mediaHashes: { [HEADER]: 'AB', bad: 3 } } })).toEqual({ [HEADER]: 'ab' })
    expect(readMediaHashes({ meta: 'nope' })).toEqual({})
    expect(readMediaHashes(undefined)).toEqual({})
  })
})

describe('displayedMediaUrls', () => {
  it('collects header, stream and choice images in both shapes, once each', () => {
    const urls = displayedMediaUrls({
      header: HEADER,
      streamUri: VIDEO,
      questions: [
        { choices: [{ meta: { image: { default: IMAGE, thumbnail: IMAGE } } }, { meta: { image: HEADER } }, {}] },
      ],
    })
    expect(urls).toEqual([HEADER, VIDEO, IMAGE])
  })
})

describe('summarize', () => {
  const doc = (status: 'verified' | 'mismatch' | 'unverifiable' | 'no-hash') => ({ electionId: 'e', status })

  it('reports verified only when every document is', () => {
    expect(summarize([doc('verified'), doc('verified')], [])).toBe('verified')
    expect(summarize([doc('verified'), doc('no-hash')], [])).toBe('unverifiable')
  })

  it('lets any mismatch win, documents or media', () => {
    expect(summarize([doc('verified'), doc('mismatch')], [])).toBe('mismatch')
    expect(summarize([doc('verified')], [{ url: HEADER, status: 'mismatch' }])).toBe('mismatch')
  })

  it('does not downgrade a verified ballot for an unhashable link', () => {
    expect(summarize([doc('verified')], [{ url: VIDEO, status: 'unverifiable', reason: 'not-listed' }])).toBe(
      'verified'
    )
  })

  it('reports no-hash when nothing was committed', () => {
    expect(summarize([doc('no-hash'), doc('no-hash')], [])).toBe('no-hash')
  })
})

describe('localizedMatches', () => {
  it('compares every language the document has', () => {
    expect(localizedMatches({ default: 'Hi', es: 'Hola' }, { default: 'Hi', es: 'Hola' })).toBe(true)
    expect(localizedMatches({ default: 'Hi', es: 'Ola' }, { default: 'Hi', es: 'Hola' })).toBe(false)
    expect(localizedMatches({ default: 'Hi' }, { default: 'Hi', es: 'Hola' })).toBe(false)
  })

  it('treats a plain string as the default language', () => {
    expect(localizedMatches('Hi', { default: 'Hi' })).toBe(true)
  })

  it('matches missing text only against no text', () => {
    expect(localizedMatches(undefined, null)).toBe(true)
    expect(localizedMatches({ default: '' }, {})).toBe(true)
    expect(localizedMatches({ default: 'Extra' }, null)).toBe(false)
  })
})

describe('compareContent', () => {
  const statusOf = (fields: ReturnType<typeof compareContent>, field: string, choice?: number) =>
    fields.find((f) => f.field === field && f.choice === choice)?.status

  it('verifies every shown field against a matching document', () => {
    const process = shownProcess()
    const fields = compareContent(process, process.questions![0], docObject(process))

    expect(fields.every((f) => f.status === 'verified')).toBe(true)
    expect(fields.map((f) => f.field)).toEqual([
      'process-title',
      'process-description',
      'question-title',
      'question-description',
      'choices',
      'choice-title',
      'choice-value',
      'choice-title',
      'choice-value',
      'header',
      'stream',
    ])
  })

  it('leaves the process title and description unverifiable when the document lacks meta.process', () => {
    const process = shownProcess()
    const fields = compareContent(process, process.questions![0], docObject(process, 0, { withProcess: false }))

    expect(statusOf(fields, 'process-title')).toBe('unverifiable')
    expect(statusOf(fields, 'process-description')).toBe('unverifiable')
    expect(fields.some((f) => f.status === 'mismatch')).toBe(false)
  })

  it('names each differing field', () => {
    const process = shownProcess()
    const doc = docObject(process)
    const shown: DisplayedProcess = {
      ...process,
      description: { default: 'Choose the chair now.' },
      header: 'https://cdn.example.org/other.png',
      questions: [
        {
          ...process.questions![0],
          title: { default: 'Who should chair the board?', es: 'Otra pregunta' },
          choices: [
            { title: { default: 'Alice', es: 'Alicia' }, value: 0 },
            { title: { default: 'Bob', es: 'Roberto' }, value: 2 },
          ],
        },
      ],
    }

    const fields = compareContent(shown, shown.questions![0], doc)

    expect(fields.filter((f) => f.status === 'mismatch')).toEqual([
      { field: 'process-description', status: 'mismatch' },
      { field: 'question-title', status: 'mismatch' },
      { field: 'choice-value', choice: 1, status: 'mismatch' },
      { field: 'header', status: 'mismatch' },
    ])
  })

  it('flags a shown option the document does not have', () => {
    const process = shownProcess()
    const doc = docObject(process)
    const q = process.questions![0]
    const shown = { ...q, choices: [...q.choices!, { title: { default: 'Carol', es: 'Carolina' }, value: 2 }] }

    const fields = compareContent(process, shown, doc)

    expect(statusOf(fields, 'choices')).toBe('mismatch')
    expect(statusOf(fields, 'choice-title', 2)).toBe('mismatch')
    expect(statusOf(fields, 'choice-value', 2)).toBe('mismatch')
  })
})

describe('verifyProcessMetadata', () => {
  it('verifies the document, its content and each listed medium, leaving unlisted ones unverifiable', async () => {
    const doc = metadataDoc({ [HEADER]: nodeHash(headerBytes), [IMAGE]: nodeHash(imageBytes).toUpperCase() })
    const world = committed(doc, { files: { [HEADER]: headerBytes, [IMAGE]: imageBytes } })

    const result = await verifyProcessMetadata(shownProcess(), depsFor(world))

    expect(result.status).toBe('verified')
    expect(result.documents).toEqual([
      expect.objectContaining({ electionId: 'e1', status: 'verified', actualHash: nodeHash(doc) }),
    ])
    expect(result.media).toEqual([
      expect.objectContaining({ url: HEADER, status: 'verified' }),
      { url: VIDEO, status: 'unverifiable', reason: 'not-listed' },
      expect.objectContaining({ url: IMAGE, status: 'verified' }),
    ])
  })

  it('reports a mismatch when the page shows other text than the hash-verified document', async () => {
    const doc = metadataDoc({}, shownProcess())
    const shown = shownProcess()
    shown.questions![0].choices![0].title = { default: 'Mallory', es: 'Alicia' }

    const result = await verifyProcessMetadata(shown, depsFor(committed(doc)))

    expect(result.status).toBe('mismatch')
    expect(result.documents[0]).toMatchObject({ status: 'mismatch', actualHash: nodeHash(doc) })
    expect(result.documents[0].fields?.filter((f) => f.status === 'mismatch')).toEqual([
      { field: 'choice-title', choice: 0, status: 'mismatch' },
    ])
  })

  it('stays verified when only the process fields cannot be checked yet', async () => {
    const doc = encodeDoc(docObject(shownProcess(), 0, { withProcess: false }))

    const result = await verifyProcessMetadata(shownProcess(), depsFor(committed(doc)))

    expect(result.status).toBe('verified')
    expect(result.documents[0].fields?.filter((f) => f.status !== 'verified').map((f) => f.field)).toEqual([
      'process-title',
      'process-description',
    ])
  })

  it('flags a document whose bytes differ from the committed hash, and ignores its media list', async () => {
    const doc = metadataDoc({ [HEADER]: nodeHash(headerBytes) })
    const world: World = {
      chain: { e1: { metadataURL: META_URL, metadataHash: nodeHash(encode('the committed version')) } },
      files: { [META_URL]: doc, [HEADER]: headerBytes },
    }

    const result = await verifyProcessMetadata(shownProcess(), depsFor(world))

    expect(result.status).toBe('mismatch')
    expect(result.documents[0].fields).toBeUndefined()
    expect(result.media[0]).toEqual({ url: HEADER, status: 'unverifiable', reason: 'not-listed' })
  })

  it('flags a medium whose bytes changed', async () => {
    const doc = metadataDoc({ [HEADER]: nodeHash(encode('original header')) })
    const world = committed(doc, { files: { [HEADER]: headerBytes } })

    const result = await verifyProcessMetadata(shownProcess(), depsFor(world))

    expect(result.status).toBe('mismatch')
    expect(result.media[0]).toMatchObject({ url: HEADER, status: 'mismatch', actualHash: nodeHash(headerBytes) })
  })

  it('reports media blocked by CORS as not verifiable rather than failing', async () => {
    const doc = metadataDoc({ [HEADER]: nodeHash(headerBytes) })
    const world = committed(doc, { files: { [HEADER]: new TypeError('Failed to fetch') } })

    const result = await verifyProcessMetadata(shownProcess(), depsFor(world))

    expect(result.status).toBe('verified')
    expect(result.media[0]).toMatchObject({ status: 'unverifiable', reason: 'fetch-failed' })
  })

  it('reports no-hash for an election that committed none, without fetching its metadata', async () => {
    const fetched: string[] = []
    const deps = depsFor({ chain: { e1: { metadataURL: META_URL } }, files: {} })
    const process = { ...shownProcess(), header: undefined, streamUri: undefined, questions: [{ upstreamId: 'e1' }] }

    const result = await verifyProcessMetadata(process, {
      ...deps,
      fetchBytes: (url) => {
        fetched.push(url)
        return deps.fetchBytes(url)
      },
    })

    expect(result.status).toBe('no-hash')
    expect(fetched).toEqual([])
  })

  it('skips questions that are not published', async () => {
    const process = { ...shownProcess(), questions: [{ title: { default: 'Draft' } }] }

    const result = await verifyProcessMetadata(process, depsFor({ chain: {}, files: {} }))

    expect(result.documents).toEqual([])
  })

  it('reports unverifiable when the chain or the document cannot be read', async () => {
    const world: World = {
      chain: {
        e1: new Error('gateway down'),
        e2: { metadataURL: META_URL, metadataHash: 'ab' },
        e3: { metadataURL: 'ipfs://bafy', metadataHash: 'ab' },
      },
      files: { [META_URL]: new ResourceTooLargeError(META_URL) },
    }

    const result = await verifyProcessMetadata(shownProcess(['e1', 'e2', 'e3']), depsFor(world))

    expect(result.status).toBe('unverifiable')
    expect(result.documents.map((d) => d.reason)).toEqual(['chain-unavailable', 'too-large', 'unsupported-url'])
  })

  it('needs every question verified for a verified headline', async () => {
    const doc = metadataDoc()
    const world = committed(doc, { chain: { e2: { metadataURL: META_URL } } })

    const result = await verifyProcessMetadata(shownProcess(['e1', 'e2']), depsFor(world))

    expect(result.status).toBe('unverifiable')
  })
})

describe('createFetchBytes', () => {
  const respond = (body: Uint8Array, headers: Record<string, string> = {}) =>
    (async () => new Response(new Uint8Array(body), { headers })) as unknown as typeof fetch

  it('returns the response bytes', async () => {
    const bytes = await createFetchBytes(respond(headerBytes))(HEADER)
    expect(Array.from(new Uint8Array(bytes))).toEqual(Array.from(headerBytes))
  })

  it('refuses a resource above the cap, by header or while streaming', async () => {
    await expect(
      createFetchBytes(respond(headerBytes, { 'content-length': '999' }), 10)(HEADER)
    ).rejects.toBeInstanceOf(ResourceTooLargeError)
    await expect(createFetchBytes(respond(headerBytes), 4)(HEADER)).rejects.toBeInstanceOf(ResourceTooLargeError)
  })

  it('rejects a non-2xx response', async () => {
    const notFound = (async () => new Response('nope', { status: 404 })) as unknown as typeof fetch
    await expect(createFetchBytes(notFound)(HEADER)).rejects.toThrow(/404/)
  })
})

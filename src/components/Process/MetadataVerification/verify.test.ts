import { createHash, webcrypto } from 'node:crypto'
import {
  compareHash,
  compareProcessContent,
  compareQuestionContent,
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
  type FieldCheck,
  type VerifyDeps,
} from './verify'

const sha256 = createSha256Hex(webcrypto.subtle as unknown as SubtleCrypto)
const encode = (text: string) => new TextEncoder().encode(text)
const nodeHash = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')

const HEADER = 'https://cdn.example.org/header.png'
const VIDEO = 'https://www.youtube.com/watch?v=abc'
const IMAGE = 'https://cdn.example.org/choice.png'

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

const ORG = '0a1b2c3d4e5f60718293a4b5c6d7e8f901234567'
const PARENT = 'p0'
const PARENT_URL = 'https://saas.example.org/storage/parent.json'
const questionUrl = (id: string) => `https://saas.example.org/storage/${id}.json`

const question = (upstreamId: string): DisplayedQuestion => ({
  upstreamId,
  title: { default: `Who should chair board ${upstreamId}?`, es: `¿Quién preside la junta ${upstreamId}?` },
  choices: [
    { title: { default: 'Alice', es: 'Alicia' }, value: 0, meta: { image: { default: IMAGE } } },
    { title: { default: 'Bob', es: 'Roberto' }, value: 1 },
  ],
})

/** What the page shows, as read from the SaaS API. */
const shownProcess = (ids: string[] = ['e1'], upstreamId: string | undefined = PARENT): DisplayedProcess => ({
  upstreamId,
  title: { default: 'Board election', es: 'Elección de la junta' },
  description: { default: 'Choose the chair.' },
  header: HEADER,
  streamUri: VIDEO,
  questions: ids.map(question),
})

/** The parent election's document saas-backend writes for `process`. */
const parentDoc = (
  process: DisplayedProcess,
  {
    mediaHashes = {},
    questionElections = (process.questions ?? []).map((q) => q.upstreamId),
  }: { mediaHashes?: Record<string, string>; questionElections?: unknown } = {}
) => ({
  title: process.title,
  version: '1.0',
  description: process.description,
  media: { header: process.header, streamUri: process.streamUri },
  meta: { mediaHashes, questionElections },
  questions: [],
  type: { name: 'single-choice-multiquestion', properties: null },
})

/** The document saas-backend writes for one question. */
const questionDoc = (q: DisplayedQuestion) => ({
  title: q.title,
  version: '1.0',
  description: null,
  questions: [
    {
      title: q.title,
      description: q.description ?? null,
      choices: q.choices!.map(({ title, value }) => ({ title, value })),
    },
  ],
  type: { name: 'single-choice-multiquestion', properties: null },
})

const encodeDoc = (doc: unknown) => encode(JSON.stringify(doc))

/**
 * A world where every election of `process` committed the document built for it: `docs`
 * overrides the bytes served (keyed by election id) without touching the committed hash.
 */
const committedWorld = (
  process: DisplayedProcess,
  {
    parent = parentDoc(process),
    served = {},
    files = {},
    organizations = {},
  }: {
    parent?: unknown
    served?: Record<string, Uint8Array>
    files?: World['files']
    organizations?: Record<string, string>
  } = {}
): World => {
  const world: World = { chain: {}, files: { ...files } }
  const add = (id: string, url: string, doc: Uint8Array) => {
    world.chain[id] = { organizationId: organizations[id] ?? ORG, metadataURL: url, metadataHash: nodeHash(doc) }
    world.files[url] = served[id] ?? doc
  }
  if (process.upstreamId) add(process.upstreamId, PARENT_URL, encodeDoc(parent))
  for (const q of process.questions ?? []) {
    if (q.upstreamId) add(q.upstreamId, questionUrl(q.upstreamId), encodeDoc(questionDoc(q)))
  }
  return world
}

const mismatches = (fields?: FieldCheck[]) => (fields ?? []).filter((f) => f.status === 'mismatch')

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
  const noParent = { status: 'unverifiable' as const, reason: 'no-parent' as const }

  it('reports verified only when the parent and every question are', () => {
    expect(summarize(doc('verified'), [doc('verified'), doc('verified')], [])).toBe('verified')
    expect(summarize(doc('unverifiable'), [doc('verified')], [])).toBe('unverifiable')
    expect(summarize(doc('verified'), [doc('verified'), doc('no-hash')], [])).toBe('unverifiable')
  })

  it('does not hold back a verified ballot for a process published without a parent', () => {
    expect(summarize(noParent, [doc('verified')], [])).toBe('verified')
  })

  it('lets any mismatch win, parent, questions or media', () => {
    expect(summarize(doc('mismatch'), [doc('verified')], [])).toBe('mismatch')
    expect(summarize(doc('verified'), [doc('verified'), doc('mismatch')], [])).toBe('mismatch')
    expect(summarize(doc('verified'), [doc('verified')], [{ url: HEADER, status: 'mismatch' }])).toBe('mismatch')
  })

  it('does not downgrade a verified ballot for an unhashable link', () => {
    expect(
      summarize(doc('verified'), [doc('verified')], [{ url: VIDEO, status: 'unverifiable', reason: 'not-listed' }])
    ).toBe('verified')
  })

  it('reports no-hash when nothing was committed', () => {
    expect(summarize(doc('no-hash'), [doc('no-hash'), doc('no-hash')], [])).toBe('no-hash')
    expect(summarize(noParent, [doc('no-hash')], [])).toBe('no-hash')
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

describe('compareProcessContent', () => {
  it('verifies the process fields and the question list against a matching parent document', () => {
    const process = shownProcess(['e1', 'e2'])
    const fields = compareProcessContent(process, parentDoc(process), ['e1', 'e2'])

    expect(fields.map((f) => f.field)).toEqual([
      'question-list',
      'process-title',
      'process-description',
      'header',
      'stream',
    ])
    expect(mismatches(fields)).toEqual([])
  })

  it('names each differing process field', () => {
    const process = shownProcess()
    const shown = {
      ...process,
      description: { default: 'Choose the chair now.' },
      streamUri: 'https://other.example/v',
    }

    expect(mismatches(compareProcessContent(shown, parentDoc(process), ['e1']))).toEqual([
      { field: 'process-description', status: 'mismatch' },
      { field: 'stream', status: 'mismatch' },
    ])
  })

  it('requires the exact question elections, in order', () => {
    const process = shownProcess(['e1', 'e2'])
    const listed = (questionElections: unknown, ids = ['e1', 'e2']) =>
      compareProcessContent(process, parentDoc(process, { questionElections }), ids)[0].status

    expect(listed(['E1', '0xe2'])).toBe('verified')
    expect(listed(['e2', 'e1'])).toBe('mismatch')
    expect(listed(['e1'])).toBe('mismatch')
    expect(listed(['e1', 'e2', 'e3'])).toBe('mismatch')
    expect(listed(null)).toBe('mismatch')
  })
})

describe('compareQuestionContent', () => {
  const statusOf = (fields: FieldCheck[], field: string, choice?: number) =>
    fields.find((f) => f.field === field && f.choice === choice)?.status

  it('verifies the question and its choices against a matching document', () => {
    const q = question('e1')
    const fields = compareQuestionContent(q, questionDoc(q))

    expect(fields.map((f) => f.field)).toEqual([
      'question-title',
      'question-description',
      'choices',
      'choice-title',
      'choice-value',
      'choice-title',
      'choice-value',
    ])
    expect(mismatches(fields)).toEqual([])
  })

  it('names each differing field, in any language', () => {
    const q = question('e1')
    const shown: DisplayedQuestion = {
      ...q,
      title: { default: 'Who should chair board e1?', es: 'Otra pregunta' },
      choices: [
        { title: { default: 'Alice', es: 'Alicia' }, value: 0 },
        { title: { default: 'Bob', es: 'Roberto' }, value: 2 },
      ],
    }

    expect(mismatches(compareQuestionContent(shown, questionDoc(q)))).toEqual([
      { field: 'question-title', status: 'mismatch' },
      { field: 'choice-value', choice: 1, status: 'mismatch' },
    ])
  })

  it('flags a shown option the document does not have', () => {
    const q = question('e1')
    const shown = { ...q, choices: [...q.choices!, { title: { default: 'Carol' }, value: 2 }] }
    const fields = compareQuestionContent(shown, questionDoc(q))

    expect(statusOf(fields, 'choices')).toBe('mismatch')
    expect(statusOf(fields, 'choice-title', 2)).toBe('mismatch')
    expect(statusOf(fields, 'choice-value', 2)).toBe('mismatch')
  })
})

describe('verifyProcessMetadata', () => {
  it('verifies the parent, every question, and each medium listed by the parent', async () => {
    const process = shownProcess(['e1', 'e2'])
    const parent = parentDoc(process, {
      mediaHashes: { [HEADER]: nodeHash(headerBytes), [IMAGE]: nodeHash(imageBytes).toUpperCase() },
    })
    const world = committedWorld(process, { parent, files: { [HEADER]: headerBytes, [IMAGE]: imageBytes } })

    const result = await verifyProcessMetadata(process, depsFor(world))

    expect(result.status).toBe('verified')
    expect(result.process).toMatchObject({ electionId: PARENT, status: 'verified' })
    expect(result.process.fields?.every((f) => f.status === 'verified')).toBe(true)
    expect(result.documents.map((d) => [d.electionId, d.status])).toEqual([
      ['e1', 'verified'],
      ['e2', 'verified'],
    ])
    expect(result.media).toEqual([
      expect.objectContaining({ url: HEADER, status: 'verified' }),
      { url: VIDEO, status: 'unverifiable', reason: 'not-listed' },
      expect.objectContaining({ url: IMAGE, status: 'verified' }),
    ])
  })

  it('reports a mismatch when the page shows other question text than the hash-verified document', async () => {
    const process = shownProcess()
    const world = committedWorld(process)
    const shown = shownProcess()
    shown.questions![0].choices![0].title = { default: 'Mallory', es: 'Alicia' }

    const result = await verifyProcessMetadata(shown, depsFor(world))

    expect(result.status).toBe('mismatch')
    expect(result.documents[0].status).toBe('mismatch')
    expect(mismatches(result.documents[0].fields)).toEqual([{ field: 'choice-title', choice: 0, status: 'mismatch' }])
  })

  it('reports a mismatch when the page shows another process title than the parent document', async () => {
    const process = shownProcess()
    const world = committedWorld(process)

    const result = await verifyProcessMetadata({ ...process, title: { default: 'Other' } }, depsFor(world))

    expect(result.status).toBe('mismatch')
    expect(mismatches(result.process.fields)).toEqual([{ field: 'process-title', status: 'mismatch' }])
  })

  it('reports a mismatch when the parent lists other question elections', async () => {
    const process = shownProcess(['e1', 'e2'])
    const world = committedWorld(process, { parent: parentDoc(process, { questionElections: ['e1'] }) })

    const result = await verifyProcessMetadata(process, depsFor(world))

    expect(result.status).toBe('mismatch')
    expect(mismatches(result.process.fields)).toEqual([{ field: 'question-list', status: 'mismatch' }])
  })

  it('reports a mismatch when the parent belongs to another organization', async () => {
    const process = shownProcess()
    const world = committedWorld(process, { organizations: { [PARENT]: 'ffffffffffffffffffffffffffffffffffffffff' } })

    const result = await verifyProcessMetadata(process, depsFor(world))

    expect(result.status).toBe('mismatch')
    expect(mismatches(result.process.fields)).toEqual([{ field: 'organization', status: 'mismatch' }])
  })

  it('accepts the same organization written differently', async () => {
    const process = shownProcess()
    const world = committedWorld(process, { organizations: { [PARENT]: `0x${ORG.toUpperCase()}` } })

    const result = await verifyProcessMetadata(process, depsFor(world))

    expect(result.status).toBe('verified')
  })

  it('leaves the process fields and media not verifiable for a process without a parent', async () => {
    const process = shownProcess(['e1'], undefined)
    const world = committedWorld(process, { files: { [HEADER]: headerBytes } })

    const result = await verifyProcessMetadata(process, depsFor(world))

    expect(result.status).toBe('verified')
    expect(result.process).toMatchObject({ status: 'unverifiable', reason: 'no-parent' })
    expect(result.process.fields?.map((f) => [f.field, f.status])).toEqual([
      ['question-list', 'unverifiable'],
      ['process-title', 'unverifiable'],
      ['process-description', 'unverifiable'],
      ['header', 'unverifiable'],
      ['stream', 'unverifiable'],
    ])
    expect(result.media.every((m) => m.reason === 'not-listed')).toBe(true)
  })

  it('flags a parent whose bytes differ from its committed hash, and ignores its media list', async () => {
    const process = shownProcess()
    const tampered = encodeDoc(parentDoc(process, { mediaHashes: { [HEADER]: nodeHash(headerBytes) } }))
    const world = committedWorld(process, { served: { [PARENT]: tampered }, files: { [HEADER]: headerBytes } })

    const result = await verifyProcessMetadata(process, depsFor(world))

    expect(result.status).toBe('mismatch')
    expect(result.process.status).toBe('mismatch')
    expect(result.process.fields?.map((f) => f.field)).toEqual(['organization'])
    expect(result.media[0]).toEqual({ url: HEADER, status: 'unverifiable', reason: 'not-listed' })
  })

  it('flags a question document whose bytes differ from its committed hash', async () => {
    const process = shownProcess()
    const world = committedWorld(process, { served: { e1: encode('something else') } })

    const result = await verifyProcessMetadata(process, depsFor(world))

    expect(result.status).toBe('mismatch')
    expect(result.documents[0]).toMatchObject({ status: 'mismatch' })
    expect(result.documents[0].fields).toBeUndefined()
  })

  it('flags a medium whose bytes changed', async () => {
    const process = shownProcess()
    const parent = parentDoc(process, { mediaHashes: { [HEADER]: nodeHash(encode('original header')) } })
    const world = committedWorld(process, { parent, files: { [HEADER]: headerBytes } })

    const result = await verifyProcessMetadata(process, depsFor(world))

    expect(result.status).toBe('mismatch')
    expect(result.media[0]).toMatchObject({ url: HEADER, status: 'mismatch', actualHash: nodeHash(headerBytes) })
  })

  it('reports media blocked by CORS as not verifiable rather than failing', async () => {
    const process = shownProcess()
    const parent = parentDoc(process, { mediaHashes: { [HEADER]: nodeHash(headerBytes) } })
    const world = committedWorld(process, { parent, files: { [HEADER]: new TypeError('Failed to fetch') } })

    const result = await verifyProcessMetadata(process, depsFor(world))

    expect(result.status).toBe('verified')
    expect(result.media[0]).toMatchObject({ status: 'unverifiable', reason: 'fetch-failed' })
  })

  it('reports no-hash for elections that committed none, without fetching their metadata', async () => {
    const fetched: string[] = []
    const deps = depsFor({
      chain: { [PARENT]: { organizationId: ORG, metadataURL: PARENT_URL }, e1: { organizationId: ORG } },
      files: {},
    })
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
    const process = { ...shownProcess([], undefined), questions: [{ title: { default: 'Draft' } }] }

    const result = await verifyProcessMetadata(process, depsFor({ chain: {}, files: {} }))

    expect(result.documents).toEqual([])
  })

  it('reports unverifiable when the chain or a document cannot be read', async () => {
    const world: World = {
      chain: {
        e1: new Error('gateway down'),
        e2: { organizationId: ORG, metadataURL: questionUrl('e2'), metadataHash: 'ab' },
        e3: { organizationId: ORG, metadataURL: 'ipfs://bafy', metadataHash: 'ab' },
      },
      files: { [questionUrl('e2')]: new ResourceTooLargeError(questionUrl('e2')) },
    }

    const result = await verifyProcessMetadata(shownProcess(['e1', 'e2', 'e3'], undefined), depsFor(world))

    expect(result.status).toBe('unverifiable')
    expect(result.documents.map((d) => d.reason)).toEqual(['chain-unavailable', 'too-large', 'unsupported-url'])
  })

  it('needs every question verified for a verified headline', async () => {
    const process = shownProcess(['e1', 'e2'])
    const world = committedWorld(process)
    world.chain.e2 = { organizationId: ORG, metadataURL: questionUrl('e2') }

    const result = await verifyProcessMetadata(process, depsFor(world))

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

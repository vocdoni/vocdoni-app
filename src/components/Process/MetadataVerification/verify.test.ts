import { createHash, webcrypto } from 'node:crypto'
import {
  compareHash,
  compareProcessContent,
  compareQuestionContent,
  createFetchBytes,
  createSha256Hex,
  displayedImages,
  localizedMatches,
  normalizeHash,
  readMediaHashes,
  ResourceTooLargeError,
  sameElections,
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
  /** What the Vochain API answers, for the organizer's chain check. */
  chain: Record<string, ChainElectionInfo | Error>
  children: Record<string, string[] | Error>
  /** What the SaaS storage (and the image hosts) serve. */
  files: Record<string, Uint8Array | Error>
}

/** The voter's check: SaaS-served hashes, no chain read at all. */
const saasDeps = (world: World): VerifyDeps => ({
  sha256,
  fetchBytes: async (url) => {
    const file = world.files[url]
    if (!file || file instanceof Error) throw file ?? new TypeError('Failed to fetch')
    return file.slice().buffer
  },
})

/** The organizer's independent check: hashes and parent/children links from the chain. */
const chainDeps = (world: World): VerifyDeps => ({
  ...saasDeps(world),
  chain: {
    getElection: async (id) => {
      const info = world.chain[id]
      if (!info || info instanceof Error) throw info ?? new Error('not found')
      return info
    },
    getChildren: async (id) => {
      const children = world.children[id]
      if (!children || children instanceof Error) throw children ?? new Error('not found')
      return children
    },
  },
})

const PARENT = 'p0'
const PARENT_URL = 'https://saas.example.org/storage/parent.json'
const questionUrl = (id: string) => `https://saas.example.org/storage/${id}.json`

const question = (upstreamId: string): DisplayedQuestion => ({
  upstreamId,
  title: { default: `Who should chair board ${upstreamId}?`, es: `¿Quién preside la junta ${upstreamId}?` },
  choices: [
    {
      title: { default: 'Alice', es: 'Alicia' },
      value: 0,
      meta: { image: { default: IMAGE }, description: 'Chair since 2024.' },
    },
    { title: { default: 'Bob', es: 'Roberto' }, value: 1 },
  ],
})

/** What the page shows, as read from the SaaS API. `upstreamId: null` is a process without a parent election. */
const shownProcess = (ids: string[] = ['e1'], upstreamId: string | null = PARENT): DisplayedProcess => ({
  upstreamId: upstreamId ?? undefined,
  title: { default: 'Board election', es: 'Elección de la junta' },
  description: { default: 'Choose the chair.' },
  header: HEADER,
  streamUri: VIDEO,
  questions: ids.map(question),
})

/** The backend hashes every image it publishes: the header in the parent document... */
const headerHashes = () => ({ [HEADER]: nodeHash(headerBytes) })
/** ...and each choice image in its question's. */
const choiceImageHashes = () => ({ [IMAGE]: nodeHash(imageBytes) })

/** The parent election's document saas-backend writes for `process`. */
const parentDoc = (
  process: DisplayedProcess,
  { mediaHashes = headerHashes() }: { mediaHashes?: Record<string, string> } = {}
) => ({
  title: process.title,
  version: '1.0',
  description: process.description,
  media: { header: process.header, streamUri: process.streamUri },
  meta: { mediaHashes },
  questions: [],
  type: { name: 'single-choice-multiquestion', properties: null },
})

/** The document saas-backend writes for one question: each choice's display entry as its `meta`. */
const questionDoc = (
  q: DisplayedQuestion,
  { mediaHashes = choiceImageHashes() }: { mediaHashes?: Record<string, string> } = {}
) => ({
  title: q.title,
  version: '1.0',
  description: null,
  meta: { mediaHashes },
  questions: [
    {
      title: q.title,
      description: q.description ?? null,
      choices: q.choices!.map(({ title, value, meta }) => ({ title, value, ...(meta ? { meta } : {}) })),
    },
  ],
  type: { name: 'single-choice-multiquestion', properties: null },
})

const encodeDoc = (doc: unknown) => encode(JSON.stringify(doc))

/**
 * Publishes `process`: every election commits the document built for it, the SaaS API serves
 * those URLs and hashes (`shown`), and the chain records the same hashes and links. `served`
 * overrides the bytes served for an election (keyed by its id) without touching any hash.
 */
const publish = (
  process: DisplayedProcess,
  {
    parent = parentDoc(process),
    questionDocs = {},
    served = {},
    files = {},
  }: {
    parent?: unknown
    /** Document committed for a question election, keyed by its id (default: `questionDoc`). */
    questionDocs?: Record<string, unknown>
    served?: Record<string, Uint8Array>
    files?: World['files']
  } = {}
): { world: World; shown: DisplayedProcess } => {
  const world: World = { chain: {}, children: {}, files: { [HEADER]: headerBytes, [IMAGE]: imageBytes, ...files } }
  const commit = (id: string, url: string, doc: Uint8Array) => {
    const committed = { metadataURL: url, metadataHash: nodeHash(doc) }
    world.chain[id] = committed
    world.files[url] = served[id] ?? doc
    return committed
  }
  const questions = (process.questions ?? []).map((q) =>
    q.upstreamId
      ? {
          ...q,
          ...commit(q.upstreamId, questionUrl(q.upstreamId), encodeDoc(questionDocs[q.upstreamId] ?? questionDoc(q))),
        }
      : q
  )
  const shown: DisplayedProcess = { ...process, questions }
  if (process.upstreamId) {
    Object.assign(shown, commit(process.upstreamId, PARENT_URL, encodeDoc(parent)))
    world.children[process.upstreamId] = questions.flatMap((q) => (q.upstreamId ? [q.upstreamId] : []))
  }
  return { world, shown }
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

describe('displayedImages', () => {
  const THUMB = 'https://cdn.example.org/choice-thumb.png'

  it('collects the header and choice images in both shapes, once each, with their question', () => {
    const published: DisplayedQuestion = {
      upstreamId: 'e1',
      choices: [{ meta: { image: { default: IMAGE, thumbnail: THUMB } } }, { meta: { image: HEADER } }, {}],
    }
    const images = displayedImages({ header: HEADER, streamUri: VIDEO, questions: [published] })

    // The video is not an image: its content is never hashed.
    expect(images).toEqual([{ url: HEADER }, { url: IMAGE, question: published }, { url: THUMB, question: published }])
  })

  it('skips draft questions, which nothing commits', () => {
    expect(displayedImages({ questions: [{ choices: [{ meta: { image: IMAGE } }] }] })).toEqual([])
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
    expect(summarize(doc('verified'), [doc('verified')], [{ url: HEADER, committed: true, status: 'mismatch' }])).toBe(
      'mismatch'
    )
  })

  it('does not downgrade a verified ballot for an image nothing commits', () => {
    expect(
      summarize(
        doc('verified'),
        [doc('verified')],
        [{ url: IMAGE, committed: false, status: 'unverifiable', reason: 'not-committed' }]
      )
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
  it('verifies the process fields against a matching parent document', () => {
    const process = shownProcess(['e1', 'e2'])
    const fields = compareProcessContent(process, parentDoc(process))

    expect(fields.map((f) => f.field)).toEqual(['process-title', 'process-description', 'header', 'stream'])
    expect(mismatches(fields)).toEqual([])
  })

  it('names each differing process field', () => {
    const process = shownProcess()
    const shown = {
      ...process,
      description: { default: 'Choose the chair now.' },
      streamUri: 'https://other.example/v',
    }

    expect(mismatches(compareProcessContent(shown, parentDoc(process)))).toEqual([
      { field: 'process-description', status: 'mismatch' },
      { field: 'stream', status: 'mismatch' },
    ])
  })
})

describe('sameElections', () => {
  it('compares election ids in any order, without case or 0x', () => {
    expect(sameElections(['E1', '0xe2'], ['e2', 'e1'])).toBe(true)
    expect(sameElections(['e1'], ['e1', 'e2'])).toBe(false)
    expect(sameElections(['e1', 'e3'], ['e1', 'e2'])).toBe(false)
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
      'choice-description',
      'choice-image',
      'choice-title',
      'choice-value',
      'choice-description',
      'choice-image',
    ])
    expect(mismatches(fields)).toEqual([])
  })

  it('compares the choice description and image URLs with the document', () => {
    const q = question('e1')
    const [alice, bob] = q.choices!
    const shown: DisplayedQuestion = {
      ...q,
      choices: [
        { ...alice, meta: { image: { default: IMAGE }, description: 'Chair since 2023.' } },
        { ...bob, meta: { image: { default: 'https://cdn.example.org/bob.png' } } },
      ],
    }

    expect(mismatches(compareQuestionContent(shown, questionDoc(q)))).toEqual([
      { field: 'choice-description', choice: 0, status: 'mismatch' },
      { field: 'choice-image', choice: 1, status: 'mismatch' },
    ])
  })

  it('treats an image URL string as the default image', () => {
    const q = question('e1')
    const doc = questionDoc(q)
    doc.questions[0].choices[0] = {
      ...doc.questions[0].choices[0],
      meta: { image: IMAGE, description: 'Chair since 2024.' },
    }

    expect(mismatches(compareQuestionContent(q, doc))).toEqual([])
  })

  it('names each differing field, in any language', () => {
    const q = question('e1')
    const shown: DisplayedQuestion = {
      ...q,
      title: { default: 'Who should chair board e1?', es: 'Otra pregunta' },
      choices: [q.choices![0], { ...q.choices![1], value: 2 }],
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

describe('verifyProcessMetadata (voter: SaaS-served hashes)', () => {
  it('reads no chain at all', async () => {
    const { world, shown } = publish(shownProcess(['e1', 'e2']))

    // saasDeps has no chain reader: a chain call would throw.
    const result = await verifyProcessMetadata(shown, saasDeps(world))

    expect(result.status).toBe('verified')
  })

  it('verifies the parent, every question, and each image against the document that lists it', async () => {
    const process = shownProcess(['e1', 'e2'])
    const { world, shown } = publish(process, {
      parent: parentDoc(process, { mediaHashes: { [HEADER]: nodeHash(headerBytes).toUpperCase() } }),
    })

    const result = await verifyProcessMetadata(shown, saasDeps(world))

    expect(result.status).toBe('verified')
    expect(result.process).toMatchObject({ electionId: PARENT, metadataURL: PARENT_URL, status: 'verified' })
    expect(result.process.fields?.every((f) => f.status === 'verified')).toBe(true)
    expect(result.documents.map((d) => [d.electionId, d.status])).toEqual([
      ['e1', 'verified'],
      ['e2', 'verified'],
    ])
    expect(result.media).toEqual([
      expect.objectContaining({ url: HEADER, committed: true, status: 'verified' }),
      expect.objectContaining({ url: IMAGE, committed: true, status: 'verified' }),
    ])
    // The verified bytes are kept, so the page renders exactly what was hashed.
    expect(Array.from(new Uint8Array(result.media[0].bytes!))).toEqual(Array.from(headerBytes))
  })

  it('never hashes the video, only covers its URL through the parent document', async () => {
    const { world, shown } = publish(shownProcess())
    const fetched: string[] = []
    const deps = saasDeps(world)

    const result = await verifyProcessMetadata(shown, {
      ...deps,
      fetchBytes: (url) => {
        fetched.push(url)
        return deps.fetchBytes(url)
      },
    })

    expect(fetched).not.toContain(VIDEO)
    expect(result.media.map((m) => m.url)).not.toContain(VIDEO)
    expect(result.process.fields?.find((f) => f.field === 'stream')?.status).toBe('verified')
  })

  it('reports a mismatch when the page shows other question text than the hash-verified document', async () => {
    const { world, shown } = publish(shownProcess())
    shown.questions![0] = { ...shown.questions![0], choices: [...shown.questions![0].choices!] }
    shown.questions![0].choices![0] = {
      ...shown.questions![0].choices![0],
      title: { default: 'Mallory', es: 'Alicia' },
    }

    const result = await verifyProcessMetadata(shown, saasDeps(world))

    expect(result.status).toBe('mismatch')
    expect(result.documents[0].status).toBe('mismatch')
    expect(mismatches(result.documents[0].fields)).toEqual([{ field: 'choice-title', choice: 0, status: 'mismatch' }])
  })

  it('reports a mismatch when the page shows another process title than the parent document', async () => {
    const { world, shown } = publish(shownProcess())

    const result = await verifyProcessMetadata({ ...shown, title: { default: 'Other' } }, saasDeps(world))

    expect(result.status).toBe('mismatch')
    expect(mismatches(result.process.fields)).toEqual([{ field: 'process-title', status: 'mismatch' }])
  })

  it('reports a header the verified parent does not list as a mismatch', async () => {
    const process = shownProcess()
    const { world, shown } = publish(process, { parent: parentDoc(process, { mediaHashes: {} }) })

    const result = await verifyProcessMetadata(shown, saasDeps(world))

    expect(result.status).toBe('mismatch')
    expect(result.media[0]).toEqual({ url: HEADER, committed: true, status: 'mismatch', reason: 'not-listed' })
  })

  it('checks a choice image against its question document, not the parent', async () => {
    const process = shownProcess()
    // The parent listing the choice image does not help: its question document must.
    const { world, shown } = publish(process, {
      parent: parentDoc(process, { mediaHashes: { ...headerHashes(), ...choiceImageHashes() } }),
      questionDocs: { e1: questionDoc(process.questions![0], { mediaHashes: {} }) },
    })

    const result = await verifyProcessMetadata(shown, saasDeps(world))

    expect(result.status).toBe('mismatch')
    expect(result.media[1]).toEqual({ url: IMAGE, committed: true, status: 'mismatch', reason: 'not-listed' })
  })

  it('reports an image whose bytes changed as a mismatch, without bytes to render', async () => {
    const { world, shown } = publish(shownProcess(), { files: { [IMAGE]: encode('another photo') } })

    const result = await verifyProcessMetadata(shown, saasDeps(world))

    expect(result.status).toBe('mismatch')
    expect(result.media[1]).toMatchObject({ url: IMAGE, status: 'mismatch' })
    expect(result.media[1].bytes).toBeUndefined()
  })

  it('reports an image blocked by CORS as not verifiable, without bytes to render', async () => {
    const { world, shown } = publish(shownProcess(), { files: { [HEADER]: new TypeError('Failed to fetch') } })

    const result = await verifyProcessMetadata(shown, saasDeps(world))

    expect(result.media[0]).toMatchObject({ committed: true, status: 'unverifiable', reason: 'fetch-failed' })
    expect(result.media[0].bytes).toBeUndefined()
  })

  it('flags a parent whose bytes differ from its committed hash, and ignores its media list', async () => {
    const process = shownProcess()
    const tampered = encodeDoc(parentDoc(process, { mediaHashes: { [HEADER]: nodeHash(encode('other header')) } }))
    const { world, shown } = publish(process, { served: { [PARENT]: tampered } })

    const result = await verifyProcessMetadata(shown, saasDeps(world))

    expect(result.status).toBe('mismatch')
    expect(result.process.status).toBe('mismatch')
    expect(result.process.fields).toBeUndefined()
    expect(result.media[0]).toEqual({
      url: HEADER,
      committed: true,
      status: 'unverifiable',
      reason: 'document-unverified',
    })
  })

  it('flags a question document whose bytes differ from its committed hash', async () => {
    const { world, shown } = publish(shownProcess(), { served: { e1: encode('something else') } })

    const result = await verifyProcessMetadata(shown, saasDeps(world))

    expect(result.status).toBe('mismatch')
    expect(result.documents[0]).toMatchObject({ status: 'mismatch' })
    expect(result.documents[0].fields).toBeUndefined()
  })

  it('reports a document the storage cannot serve as not verifiable', async () => {
    const { world, shown } = publish(shownProcess())
    world.files[questionUrl('e1')] = new TypeError('Failed to fetch')

    const result = await verifyProcessMetadata(shown, saasDeps(world))

    expect(result.documents[0]).toMatchObject({ status: 'unverifiable', reason: 'fetch-failed' })
  })

  it('leaves the process fields and header not verifiable for a process without a parent', async () => {
    const { world, shown } = publish(shownProcess(['e1'], null))

    const result = await verifyProcessMetadata(shown, saasDeps(world))

    expect(result.status).toBe('verified')
    expect(result.process).toMatchObject({ status: 'unverifiable', reason: 'no-parent' })
    expect(result.process.fields?.map((f) => [f.field, f.status])).toEqual([
      ['process-title', 'unverifiable'],
      ['process-description', 'unverifiable'],
      ['header', 'unverifiable'],
      ['stream', 'unverifiable'],
    ])
    expect(result.media[0]).toEqual({ url: HEADER, committed: false, status: 'unverifiable', reason: 'no-parent' })
    // Choice images are committed by their question election, parent or not.
    expect(result.media[1]).toMatchObject({ url: IMAGE, committed: true, status: 'verified' })
  })

  it('reports no-hash for elections the API serves no hash for, without fetching their metadata', async () => {
    const fetched: string[] = []
    const deps = saasDeps({ chain: {}, children: {}, files: {} })
    const process: DisplayedProcess = {
      ...shownProcess(),
      metadataURL: PARENT_URL,
      header: undefined,
      streamUri: undefined,
      questions: [{ upstreamId: 'e1', metadataURL: questionUrl('e1') }],
    }

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

  it('leaves a choice image uncommitted when its election committed no hash', async () => {
    const { world, shown } = publish(shownProcess(['e1'], null))
    shown.questions![0] = { ...shown.questions![0], metadataHash: undefined }

    const result = await verifyProcessMetadata(shown, saasDeps(world))

    expect(result.media[1]).toEqual({ url: IMAGE, committed: false, status: 'unverifiable', reason: 'not-committed' })
  })

  it('skips questions that are not published', async () => {
    const process = { ...shownProcess([], null), questions: [{ title: { default: 'Draft' } }] }

    const result = await verifyProcessMetadata(process, saasDeps({ chain: {}, children: {}, files: {} }))

    expect(result.documents).toEqual([])
  })

  it('needs every question verified for a verified headline', async () => {
    const { world, shown } = publish(shownProcess(['e1', 'e2']))
    shown.questions![1] = { ...shown.questions![1], metadataHash: undefined }

    const result = await verifyProcessMetadata(shown, saasDeps(world))

    expect(result.status).toBe('unverifiable')
  })
})

describe('verifyProcessMetadata (organizer: chain reads)', () => {
  it('reads the hashes from the chain, not from the SaaS API', async () => {
    const { world, shown } = publish(shownProcess())
    // The API serving a forged hash does not fool the chain check.
    const forged = { ...shown, metadataHash: nodeHash(encode('forged')) }

    const result = await verifyProcessMetadata(forged, chainDeps(world))

    expect(result.status).toBe('verified')
    expect(mismatches(result.process.fields)).toEqual([])
  })

  it('requires the chain to list exactly the page questions as the parent children', async () => {
    const { world, shown } = publish(shownProcess(['e1', 'e2']))
    world.children[PARENT] = ['e1']

    const result = await verifyProcessMetadata(shown, chainDeps(world))

    expect(result.status).toBe('mismatch')
    expect(mismatches(result.process.fields)).toEqual([{ field: 'question-list', status: 'mismatch' }])
  })

  it('accepts the children in another order', async () => {
    const { world, shown } = publish(shownProcess(['e1', 'e2']))
    world.children[PARENT] = ['0xE2', 'e1']

    const result = await verifyProcessMetadata(shown, chainDeps(world))

    expect(result.status).toBe('verified')
  })

  it('leaves the question list not verifiable when the children cannot be read', async () => {
    const { world, shown } = publish(shownProcess())
    world.children[PARENT] = new Error('gateway down')

    const result = await verifyProcessMetadata(shown, chainDeps(world))

    expect(result.process.fields?.find((f) => f.field === 'question-list')?.status).toBe('unverifiable')
  })

  it('reports unverifiable when the chain or a document cannot be read', async () => {
    const world: World = {
      chain: {
        e1: new Error('gateway down'),
        e2: { metadataURL: questionUrl('e2'), metadataHash: 'ab' },
        e3: { metadataURL: 'ipfs://bafy', metadataHash: 'ab' },
      },
      children: {},
      files: { [questionUrl('e2')]: new ResourceTooLargeError(questionUrl('e2')) },
    }

    const result = await verifyProcessMetadata(shownProcess(['e1', 'e2', 'e3'], null), chainDeps(world))

    expect(result.status).toBe('unverifiable')
    expect(result.documents.map((d) => d.reason)).toEqual(['chain-unavailable', 'too-large', 'unsupported-url'])
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

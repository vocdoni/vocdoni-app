import { createHash, webcrypto } from 'node:crypto'

import {
  auditElectionMetadata,
  condenseDiff,
  diffMetadata,
  diffWords,
  getListedQuestionElections,
  hasIntegrityIssues,
  hasMetadataUpdates,
  normalizeHex,
  sha256Hex,
} from './metadata-audit'

const GATEWAY = 'https://gateway.example/v2'
const ELECTION_ID = 'f39c69dabbf5335bd7d53130ad823a71b7ba9834'

const baseMetadata = {
  version: '1.2',
  title: { default: 'Board election', es: 'Elección de la junta' },
  description: { default: 'Choose the new board for the next term.' },
  media: { header: 'https://media.example/header.png', streamUri: '' },
  meta: { mediaHashes: { 'https://media.example/header.png': 'aa'.repeat(32) } },
  questions: [
    {
      title: { default: 'Who should chair the board?' },
      description: { default: '' },
      choices: [
        { title: { default: 'Alice' }, value: 0 },
        { title: { default: 'Bob' }, value: 1 },
      ],
    },
  ],
  type: { name: 'single-choice-multiquestion', properties: {} },
}

const sha256 = (text: string) => createHash('sha256').update(text).digest('hex')

type Routes = Record<string, { status?: number; body: string } | Error>

const createFetch = (routes: Routes) =>
  vi.fn(async (url: string) => {
    const route = routes[url]
    if (!route) return { ok: false, json: async () => ({}), arrayBuffer: async () => new ArrayBuffer(0) }
    if (route instanceof Error) throw route
    const bytes = new TextEncoder().encode(route.body)
    return {
      ok: (route.status ?? 200) < 400,
      json: async () => JSON.parse(route.body),
      arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    }
  })

const historyUrl = `${GATEWAY}/elections/${ELECTION_ID}/metadata/history`

const version = (url: string, body: string, overrides: Record<string, unknown> = {}) => ({
  metadataURL: url,
  metadataHash: sha256(body),
  blockHeight: 100,
  txIndex: 0,
  txHash: 'ab'.repeat(32),
  timestamp: '2026-01-01T10:00:00Z',
  ...overrides,
})

beforeAll(() => {
  // The jsdom environment may expose a crypto without SubtleCrypto; the audit runs on WebCrypto.
  vi.stubGlobal('crypto', webcrypto)
})

afterAll(() => {
  vi.unstubAllGlobals()
})

describe('normalizeHex', () => {
  it('lowercases and strips a 0x prefix', () => {
    expect(normalizeHex('0xABcd')).toBe('abcd')
  })

  it('returns empty for missing or non-hex input', () => {
    expect(normalizeHex(undefined)).toBe('')
    expect(normalizeHex('')).toBe('')
    expect(normalizeHex('not-hex')).toBe('')
  })
})

describe('sha256Hex', () => {
  it('hashes the exact bytes', async () => {
    const text = '{"title":"x"}'
    expect(await sha256Hex(new TextEncoder().encode(text))).toBe(sha256(text))
  })
})

describe('diffMetadata', () => {
  it('finds no change between equal documents, whatever their key order', () => {
    const reordered = JSON.parse(JSON.stringify({ ...baseMetadata, version: '1.2' }))
    const { title, ...rest } = reordered
    expect(diffMetadata(baseMetadata, { ...rest, title })).toEqual([])
  })

  it('reports multi-language title and description changes per language', () => {
    const changes = diffMetadata(baseMetadata, {
      ...baseMetadata,
      title: { default: 'Board election', es: 'Elección del consejo', ca: 'Elecció de la junta' },
      description: 'Choose the new board for the next two terms.',
    })

    expect(changes).toEqual([
      { field: 'title', lang: 'ca', before: null, after: 'Elecció de la junta' },
      { field: 'title', lang: 'es', before: 'Elección de la junta', after: 'Elección del consejo' },
      {
        field: 'description',
        lang: 'default',
        before: 'Choose the new board for the next term.',
        after: 'Choose the new board for the next two terms.',
      },
    ])
  })

  it('reports media URLs and media hashes', () => {
    const changes = diffMetadata(baseMetadata, {
      ...baseMetadata,
      media: { header: 'https://media.example/header.png', streamUri: 'https://video.example/v' },
      meta: { mediaHashes: { 'https://media.example/header.png': 'bb'.repeat(32) } },
    })

    expect(changes).toEqual([
      { field: 'streamUri', before: null, after: 'https://video.example/v' },
      {
        field: 'mediaHash',
        mediaUrl: 'https://media.example/header.png',
        before: 'aa'.repeat(32),
        after: 'bb'.repeat(32),
      },
    ])
  })

  it('reports question and choice text changes, including added choices', () => {
    const [question] = baseMetadata.questions
    const changes = diffMetadata(baseMetadata, {
      ...baseMetadata,
      questions: [
        {
          ...question,
          title: { default: 'Who should chair the board next year?' },
          choices: [
            { title: { default: 'Alicia' }, value: 0 },
            { title: { default: 'Bob' }, value: 1 },
            { title: { default: 'Carol' }, value: 2 },
          ],
        },
      ],
    })

    expect(changes).toEqual([
      {
        field: 'questionTitle',
        question: 0,
        lang: 'default',
        before: 'Who should chair the board?',
        after: 'Who should chair the board next year?',
      },
      { field: 'choiceTitle', question: 0, choice: 0, lang: 'default', before: 'Alice', after: 'Alicia' },
      { field: 'choiceTitle', question: 0, choice: 2, lang: 'default', before: null, after: 'Carol' },
      // The added choice also brings a new value, which is not one of the audited text fields.
      { field: 'other', before: null, after: null },
    ])
  })

  it('reports a change of the question elections a parent election lists', () => {
    const parent = (questionElections: string[]) => ({
      ...baseMetadata,
      questions: [],
      meta: { ...baseMetadata.meta, questionElections },
    })

    expect(diffMetadata(parent(['0xAB01', 'ab02']), parent(['ab01', 'ab02']))).toEqual([])
    expect(diffMetadata(parent(['ab01', 'ab02']), parent(['ab02', 'ab01']))).toEqual([
      { field: 'questionElections', before: 'ab01\nab02', after: 'ab02\nab01' },
    ])
    expect(
      diffMetadata(baseMetadata, { ...baseMetadata, meta: { ...baseMetadata.meta, questionElections: ['ab01'] } })
    ).toEqual([{ field: 'questionElections', before: null, after: 'ab01' }])
  })

  it('reports any other difference once', () => {
    expect(diffMetadata(baseMetadata, { ...baseMetadata, type: { name: 'approval', properties: {} } })).toEqual([
      { field: 'other', before: null, after: null },
    ])
  })
})

describe('diffWords', () => {
  it('marks the words that changed and keeps the rest', () => {
    expect(diffWords('Vote for the new board', 'Vote for the next board')).toEqual([
      { type: 'same', text: 'Vote for the ' },
      { type: 'removed', text: 'new' },
      { type: 'added', text: 'next' },
      { type: 'same', text: ' board' },
    ])
  })

  it('rebuilds both texts from its segments', () => {
    const before = 'The  quorum is 50%.\nVoting closes at noon.'
    const after = 'The quorum is 60%.\nVoting closes at 18:00.'
    const segments = diffWords(before, after)

    expect(
      segments
        .filter((segment) => segment.type !== 'added')
        .map((segment) => segment.text)
        .join('')
    ).toBe(before)
    expect(
      segments
        .filter((segment) => segment.type !== 'removed')
        .map((segment) => segment.text)
        .join('')
    ).toBe(after)
  })

  it('handles empty texts', () => {
    expect(diffWords('', 'Added')).toEqual([{ type: 'added', text: 'Added' }])
    expect(diffWords('Removed', '')).toEqual([{ type: 'removed', text: 'Removed' }])
  })
})

describe('condenseDiff', () => {
  it('keeps only the words around a change in long unchanged runs', () => {
    const words = Array.from({ length: 30 }, (_, index) => `w${index}`)
    const before = `${words.join(' ')} typo ${words.join(' ')}`
    const after = `${words.join(' ')} fixed ${words.join(' ')}`
    const condensed = condenseDiff(diffWords(before, after), 2)

    expect(condensed).toEqual([
      { type: 'same', text: '… w28 w29 ' },
      { type: 'removed', text: 'typo' },
      { type: 'added', text: 'fixed' },
      { type: 'same', text: ' w0 w1 … ' },
    ])
  })

  it('leaves short runs untouched', () => {
    const segments = diffWords('a b c', 'a x c')
    expect(condenseDiff(segments, 2)).toEqual(segments)
  })
})

describe('auditElectionMetadata', () => {
  const v1 = JSON.stringify(baseMetadata)
  const v2 = JSON.stringify({ ...baseMetadata, description: { default: 'Choose the new board for the next terms.' } })

  it('verifies a single creation version and reports no updates', async () => {
    const fetchImpl = createFetch({
      [historyUrl]: { body: JSON.stringify({ versions: [version('https://store.example/v1', v1)] }) },
      'https://store.example/v1': { body: v1 },
    })

    const audit = await auditElectionMetadata({ gatewayUrl: GATEWAY, electionId: ELECTION_ID, fetchImpl })

    expect(audit.available).toBe(true)
    expect(hasMetadataUpdates(audit)).toBe(false)
    expect(hasIntegrityIssues(audit)).toBe(false)
    expect(audit.versions).toEqual([
      {
        metadataURL: 'https://store.example/v1',
        recordedHash: sha256(v1),
        computedHash: sha256(v1),
        blockHeight: 100,
        txHash: 'ab'.repeat(32),
        timestamp: new Date('2026-01-01T10:00:00Z'),
        integrity: 'verified',
        changes: null,
        questionElections: null,
      },
    ])
  })

  it('diffs each verified version against the previous one', async () => {
    const fetchImpl = createFetch({
      [historyUrl]: {
        body: JSON.stringify({
          versions: [
            version('https://store.example/v1', v1),
            version('https://store.example/v2', v2, { blockHeight: 120, timestamp: '2026-01-01T12:00:00Z' }),
          ],
        }),
      },
      'https://store.example/v1': { body: v1 },
      'https://store.example/v2': { body: v2 },
    })

    const audit = await auditElectionMetadata({ gatewayUrl: GATEWAY, electionId: ELECTION_ID, fetchImpl })

    expect(hasMetadataUpdates(audit)).toBe(true)
    expect(audit.versions[1]).toMatchObject({
      blockHeight: 120,
      integrity: 'verified',
      changes: [
        {
          field: 'description',
          lang: 'default',
          before: 'Choose the new board for the next term.',
          after: 'Choose the new board for the next terms.',
        },
      ],
    })
  })

  it('flags a document that does not match its recorded hash and does not diff it', async () => {
    const tampered = JSON.stringify({ ...baseMetadata, title: { default: 'Something else' } })
    const fetchImpl = createFetch({
      [historyUrl]: {
        body: JSON.stringify({
          versions: [version('https://store.example/v1', v1), version('https://store.example/v2', v2)],
        }),
      },
      'https://store.example/v1': { body: v1 },
      'https://store.example/v2': { body: tampered },
    })

    const audit = await auditElectionMetadata({ gatewayUrl: GATEWAY, electionId: ELECTION_ID, fetchImpl })

    expect(hasIntegrityIssues(audit)).toBe(true)
    expect(audit.versions[1]).toMatchObject({
      integrity: 'mismatch',
      recordedHash: sha256(v2),
      computedHash: sha256(tampered),
      changes: null,
    })
  })

  it('flags unreachable versions, including non-http URLs', async () => {
    const fetchImpl = createFetch({
      [historyUrl]: {
        body: JSON.stringify({
          versions: [
            version('ipfs://bafy', v1),
            version('https://store.example/v2', v2),
            version('https://store.example/v3', v2),
          ],
        }),
      },
      'https://store.example/v2': new Error('network'),
      'https://store.example/v3': { status: 404, body: '' },
    })

    const audit = await auditElectionMetadata({ gatewayUrl: GATEWAY, electionId: ELECTION_ID, fetchImpl })

    expect(audit.versions.map((entry) => entry.integrity)).toEqual(['unreachable', 'unreachable', 'unreachable'])
    expect(audit.versions.map((entry) => entry.changes)).toEqual([null, null, null])
  })

  it('reads versions without a recorded hash or a located transaction as unverifiable', async () => {
    const fetchImpl = createFetch({
      [historyUrl]: {
        body: JSON.stringify({
          versions: [
            {
              metadataURL: 'https://store.example/v1',
              blockHeight: 0,
              txIndex: 0,
              timestamp: '0001-01-01T00:00:00Z',
            },
          ],
        }),
      },
      'https://store.example/v1': { body: v1 },
    })

    const audit = await auditElectionMetadata({ gatewayUrl: GATEWAY, electionId: ELECTION_ID, fetchImpl })

    expect(audit.versions[0]).toMatchObject({
      integrity: 'unrecorded',
      recordedHash: '',
      txHash: '',
      blockHeight: 0,
      timestamp: null,
    })
    expect(hasIntegrityIssues(audit)).toBe(false)
  })

  it('reads the question elections a parent election lists from its latest trusted version', async () => {
    const parentV1 = JSON.stringify({ ...baseMetadata, questions: [], meta: { questionElections: ['0xAB01', 'ab02'] } })
    const parentV2 = JSON.stringify({ ...baseMetadata, questions: [], meta: { questionElections: ['ab01', 'ab03'] } })
    const fetchImpl = createFetch({
      [historyUrl]: {
        body: JSON.stringify({
          versions: [
            version('https://store.example/p1', parentV1),
            // Recorded with another hash than the document served, so its list is not trusted.
            version('https://store.example/p2', 'something else'),
          ],
        }),
      },
      'https://store.example/p1': { body: parentV1 },
      'https://store.example/p2': { body: parentV2 },
    })

    const audit = await auditElectionMetadata({ gatewayUrl: GATEWAY, electionId: ELECTION_ID, fetchImpl })

    expect(audit.versions.map((entry) => entry.questionElections)).toEqual([['ab01', 'ab02'], null])
    expect(getListedQuestionElections(audit)).toEqual(['ab01', 'ab02'])
  })

  it('reports no listed question elections for a document without the list', async () => {
    const fetchImpl = createFetch({
      [historyUrl]: { body: JSON.stringify({ versions: [version('https://store.example/v1', v1)] }) },
      'https://store.example/v1': { body: v1 },
    })

    const audit = await auditElectionMetadata({ gatewayUrl: GATEWAY, electionId: ELECTION_ID, fetchImpl })

    expect(getListedQuestionElections(audit)).toBeNull()
  })

  it('reports the history as unavailable when the gateway cannot serve it', async () => {
    const audit = await auditElectionMetadata({
      gatewayUrl: GATEWAY,
      electionId: ELECTION_ID,
      fetchImpl: createFetch({}),
    })

    expect(audit).toEqual({ electionId: ELECTION_ID, available: false, versions: [] })
  })

  it('reports the history as unavailable when the request fails', async () => {
    const audit = await auditElectionMetadata({
      gatewayUrl: GATEWAY,
      electionId: ELECTION_ID,
      fetchImpl: createFetch({ [historyUrl]: new Error('offline') }),
    })

    expect(audit.available).toBe(false)
  })
})

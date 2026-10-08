// @vitest-environment node
import { createHash, webcrypto } from 'node:crypto'
import {
  compareHash,
  createFetchBytes,
  createSha256Hex,
  displayedMediaUrls,
  normalizeHash,
  readMediaHashes,
  ResourceTooLargeError,
  summarize,
  verifyProcessMetadata,
  type ChainElectionInfo,
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

const metadataDoc = (mediaHashes: Record<string, string> = {}) =>
  encode(JSON.stringify({ title: { default: 'Vote' }, meta: { mediaHashes } }))

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

describe('verifyProcessMetadata', () => {
  it('verifies the document and each listed medium, leaving unlisted ones unverifiable', async () => {
    const doc = metadataDoc({ [HEADER]: nodeHash(headerBytes), [IMAGE]: nodeHash(imageBytes).toUpperCase() })
    const world: World = {
      chain: { e1: { metadataURL: META_URL, metadataHash: nodeHash(doc) } },
      files: { [META_URL]: doc, [HEADER]: headerBytes, [IMAGE]: imageBytes },
    }

    const result = await verifyProcessMetadata(
      { electionIds: ['e1'], mediaUrls: [HEADER, VIDEO, IMAGE] },
      depsFor(world)
    )

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

  it('flags a document whose bytes differ from the committed hash, and ignores its media list', async () => {
    const doc = metadataDoc({ [HEADER]: nodeHash(headerBytes) })
    const world: World = {
      chain: { e1: { metadataURL: META_URL, metadataHash: nodeHash(encode('the committed version')) } },
      files: { [META_URL]: doc, [HEADER]: headerBytes },
    }

    const result = await verifyProcessMetadata({ electionIds: ['e1'], mediaUrls: [HEADER] }, depsFor(world))

    expect(result.status).toBe('mismatch')
    expect(result.media).toEqual([{ url: HEADER, status: 'unverifiable', reason: 'not-listed' }])
  })

  it('flags a medium whose bytes changed', async () => {
    const doc = metadataDoc({ [HEADER]: nodeHash(encode('original header')) })
    const world: World = {
      chain: { e1: { metadataURL: META_URL, metadataHash: nodeHash(doc) } },
      files: { [META_URL]: doc, [HEADER]: headerBytes },
    }

    const result = await verifyProcessMetadata({ electionIds: ['e1'], mediaUrls: [HEADER] }, depsFor(world))

    expect(result.status).toBe('mismatch')
    expect(result.media[0]).toMatchObject({ url: HEADER, status: 'mismatch', actualHash: nodeHash(headerBytes) })
  })

  it('reports media blocked by CORS as not verifiable rather than failing', async () => {
    const doc = metadataDoc({ [HEADER]: nodeHash(headerBytes) })
    const world: World = {
      chain: { e1: { metadataURL: META_URL, metadataHash: nodeHash(doc) } },
      files: { [META_URL]: doc, [HEADER]: new TypeError('Failed to fetch') },
    }

    const result = await verifyProcessMetadata({ electionIds: ['e1'], mediaUrls: [HEADER] }, depsFor(world))

    expect(result.status).toBe('verified')
    expect(result.media[0]).toMatchObject({ status: 'unverifiable', reason: 'fetch-failed' })
  })

  it('reports no-hash for an election that committed none, without fetching its metadata', async () => {
    const fetched: string[] = []
    const deps = depsFor({ chain: { e1: { metadataURL: META_URL } }, files: {} })
    const result = await verifyProcessMetadata(
      { electionIds: ['e1'], mediaUrls: [] },
      {
        ...deps,
        fetchBytes: (url) => {
          fetched.push(url)
          return deps.fetchBytes(url)
        },
      }
    )

    expect(result.status).toBe('no-hash')
    expect(fetched).toEqual([])
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

    const result = await verifyProcessMetadata({ electionIds: ['e1', 'e2', 'e3'], mediaUrls: [] }, depsFor(world))

    expect(result.status).toBe('unverifiable')
    expect(result.documents.map((d) => d.reason)).toEqual(['chain-unavailable', 'too-large', 'unsupported-url'])
  })

  it('needs every question verified for a verified headline', async () => {
    const doc = metadataDoc()
    const world: World = {
      chain: { e1: { metadataURL: META_URL, metadataHash: nodeHash(doc) }, e2: { metadataURL: META_URL } },
      files: { [META_URL]: doc },
    }

    const result = await verifyProcessMetadata({ electionIds: ['e1', 'e2'], mediaUrls: [] }, depsFor(world))

    expect(result.status).toBe('unverifiable')
  })
})

describe('createFetchBytes', () => {
  const respond = (body: Uint8Array, headers: Record<string, string> = {}) =>
    (async () => new Response(body, { headers })) as unknown as typeof fetch

  it('returns the response bytes', async () => {
    const bytes = await createFetchBytes(respond(headerBytes))(HEADER)
    expect(new Uint8Array(bytes)).toEqual(headerBytes)
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

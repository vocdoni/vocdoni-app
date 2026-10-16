import { createBlobUrls, imageMimeType, resolveMediaSrc, voteGate } from './gate'
import type { MediaVerification, ProcessVerification } from './verify'

const HEADER = 'https://cdn.example.org/header.png'
const IMAGE = 'https://cdn.example.org/choice.png'

const bytesOf = (text: string) => new TextEncoder().encode(text).buffer as ArrayBuffer

const verified = (url: string, text = 'png-bytes'): MediaVerification => ({
  url,
  committed: true,
  status: 'verified',
  expectedHash: 'ab',
  actualHash: 'ab',
  bytes: bytesOf(text),
})

const result = (status: ProcessVerification['status'], media: MediaVerification[] = []): ProcessVerification => ({
  status,
  process: { electionId: 'p0', status: status === 'no-hash' ? 'no-hash' : 'verified' },
  documents: [{ electionId: 'e1', status }],
  media,
})

describe('voteGate', () => {
  const base = { enabled: true, pending: false, failed: false }

  it('waits while the check runs', () => {
    expect(voteGate({ ...base, pending: true })).toBe('pending')
  })

  it('allows a verified ballot whose images all matched', () => {
    expect(voteGate({ ...base, data: result('verified', [verified(HEADER), verified(IMAGE)]) })).toBe('allowed')
  })

  it('blocks any mismatch, in the documents, the shown text or an image', () => {
    expect(voteGate({ ...base, data: result('mismatch') })).toBe('blocked')
  })

  it('blocks a committed image that could not be fetched and hashed', () => {
    const unfetched: MediaVerification = { url: IMAGE, committed: true, status: 'unverifiable', reason: 'fetch-failed' }
    expect(voteGate({ ...base, data: result('verified', [verified(HEADER), unfetched]) })).toBe('blocked')
  })

  it('blocks a committed document the storage could not serve', () => {
    const data = result('unverifiable')
    data.documents = [{ electionId: 'e1', status: 'unverifiable', reason: 'fetch-failed' }]
    expect(voteGate({ ...base, data })).toBe('blocked')
  })

  it('does not hold back a process published without a parent election', () => {
    const data = result('verified')
    data.process = { status: 'unverifiable', reason: 'no-parent' }
    expect(voteGate({ ...base, data })).toBe('allowed')
  })

  it('blocks when the check itself failed', () => {
    expect(voteGate({ ...base, failed: true })).toBe('blocked')
  })

  it('does not block an election that committed no hash at all', () => {
    expect(voteGate({ ...base, data: result('no-hash') })).toBe('allowed')
  })

  it('blocks a choice image whose question document could not be verified', () => {
    const unchecked: MediaVerification = {
      url: IMAGE,
      committed: true,
      status: 'unverifiable',
      reason: 'document-unverified',
    }
    expect(voteGate({ ...base, data: result('verified', [verified(HEADER), unchecked]) })).toBe('blocked')
  })

  it('does not block images nothing commits', () => {
    const noParent: MediaVerification = { url: HEADER, committed: false, status: 'unverifiable', reason: 'no-parent' }
    const notCommitted: MediaVerification = {
      url: IMAGE,
      committed: false,
      status: 'unverifiable',
      reason: 'not-committed',
    }
    expect(voteGate({ ...base, data: result('verified', [noParent, notCommitted]) })).toBe('allowed')
  })

  it('allows the vote when there is nothing to check', () => {
    expect(voteGate({ ...base, enabled: false, pending: true })).toBe('allowed')
  })
})

describe('resolveMediaSrc', () => {
  const blobUrls = { [HEADER]: 'blob:header' }

  it('renders a committed image only from its verified bytes', () => {
    const data = result('verified', [verified(HEADER)])
    expect(resolveMediaSrc(HEADER, { hasParent: true, data, blobUrls })).toBe('blob:header')
  })

  it('never falls back to the original URL for a committed image', () => {
    // Still checking, failed, or mismatched: nothing is shown rather than unverified bytes.
    expect(resolveMediaSrc(HEADER, { hasParent: true, blobUrls: {} })).toBeUndefined()
    const data = result('mismatch', [{ url: IMAGE, committed: true, status: 'mismatch' }])
    expect(resolveMediaSrc(IMAGE, { hasParent: true, data, blobUrls })).toBeUndefined()
  })

  it('keeps the original URL where nothing commits the image', () => {
    expect(resolveMediaSrc(HEADER, { hasParent: false, blobUrls: {} })).toBe(HEADER)
    const data = result('verified', [{ url: IMAGE, committed: false, status: 'unverifiable', reason: 'not-committed' }])
    expect(resolveMediaSrc(IMAGE, { hasParent: true, data, blobUrls: {} })).toBe(IMAGE)
    expect(resolveMediaSrc(HEADER, { hasParent: true, data: result('no-hash'), blobUrls: {} })).toBe(HEADER)
  })

  it('renders nothing without a URL', () => {
    expect(resolveMediaSrc(undefined, { hasParent: false, blobUrls })).toBeUndefined()
  })
})

describe('imageMimeType', () => {
  it('types SVG explicitly, with or without an XML prolog', () => {
    expect(imageMimeType(bytesOf('<svg xmlns="http://www.w3.org/2000/svg"></svg>'))).toBe('image/svg+xml')
    expect(imageMimeType(bytesOf('<?xml version="1.0"?>\n<svg></svg>'))).toBe('image/svg+xml')
  })

  it('leaves raster formats to the browser', () => {
    expect(imageMimeType(new Uint8Array([0x89, 0x50, 0x4e, 0x47]).buffer)).toBeUndefined()
  })
})

describe('createBlobUrls', () => {
  it('makes one object URL per verified image, from the hashed bytes', () => {
    const blobs: Blob[] = []
    const create = (blob: Blob) => {
      blobs.push(blob)
      return `blob:${blobs.length}`
    }

    const urls = createBlobUrls(
      [
        verified(HEADER, 'header-bytes'),
        verified(IMAGE, '<svg></svg>'),
        { url: 'https://cdn.example.org/bad.png', committed: true, status: 'mismatch' },
      ],
      create
    )

    expect(urls).toEqual({ [HEADER]: 'blob:1', [IMAGE]: 'blob:2' })
    expect(blobs[0].size).toBe('header-bytes'.length)
    expect(blobs[1].type).toBe('image/svg+xml')
  })
})

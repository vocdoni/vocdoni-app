/**
 * What the voter page does with a verification result: whether the vote may be cast, and
 * which source each displayed image is rendered from. Pure, so the policy is testable on
 * its own.
 *
 * The chain cannot tell what the voter's screen showed, so the client enforces it: a vote is
 * only cast once the ballot shown matches what the organizer committed.
 */
import type { MediaVerification, ProcessVerification } from '@vocdoni/metadata-verify'

/** `pending` while the check runs, `blocked` when the ballot shown is not the committed one. */
export type VoteGate = 'allowed' | 'pending' | 'blocked'

export type VoteGateInput = {
  /** False when there is nothing to check (no published question) or no way to (no WebCrypto). */
  enabled: boolean
  pending: boolean
  failed: boolean
  data?: ProcessVerification
}

export const voteGate = ({ enabled, pending, failed, data }: VoteGateInput): VoteGate => {
  if (!enabled) return 'allowed'
  if (pending) return 'pending'
  if (failed || !data) return 'blocked'
  // Published before the chain committed any hash: there is nothing to hold the page to.
  if (data.status === 'no-hash') return 'allowed'
  if (data.status === 'mismatch') return 'blocked'
  // A committed document that could not be fetched or checked leaves the shown ballot
  // unverified. It is served by the same server as the ballot itself, so this adds no new
  // availability dependency.
  const documents = data.process.reason === 'no-parent' ? data.documents : [data.process, ...data.documents]
  if (documents.some((document) => document.status === 'unverifiable')) return 'blocked'
  // A committed image that could not be fetched and hashed would be shown unverified, or not
  // at all: the voter would not be voting on the committed ballot.
  if (data.media.some((medium) => medium.committed && medium.status !== 'verified')) return 'blocked'
  return 'allowed'
}

export type MediaSourceInput = {
  /**
   * The process was published with a parent election. Until the check says otherwise, its
   * images are assumed committed and are not shown.
   */
  hasParent: boolean
  data?: ProcessVerification
  /** Object URLs of the verified bytes, keyed by the image URL as displayed. */
  blobUrls: Record<string, string>
}

/**
 * The `src` an image is rendered from. A committed image is only ever shown from the bytes
 * that were hashed (an object URL), never by asking the original URL again, so the voter
 * cannot see different bytes than the verified ones; until those exist it is not shown.
 * Images nothing commits (no parent election, or an election without a metadata hash) are
 * not covered and keep their original URL.
 */
export const resolveMediaSrc = (url: string | undefined, { hasParent, data, blobUrls }: MediaSourceInput) => {
  if (!url) return undefined
  if (blobUrls[url]) return blobUrls[url]
  const medium = data?.media.find((entry) => entry.url === url)
  if (medium) return medium.committed ? undefined : url
  if (data?.status === 'no-hash') return url
  // Not checked (yet): a process with a parent election commits its images.
  return hasParent ? undefined : url
}

/**
 * MIME type to give an image blob. Raster formats are sniffed by the browser from the bytes
 * themselves, but SVG is only rendered with an explicit type.
 */
export const imageMimeType = (bytes: ArrayBuffer): string | undefined => {
  const head = new TextDecoder()
    .decode(new Uint8Array(bytes, 0, Math.min(bytes.byteLength, 512)))
    .replace(/^\uFEFF/, '')
    .trimStart()
  if (/^<svg[\s>]/i.test(head) || (/^<\?xml/i.test(head) && /<svg[\s>]/i.test(head))) return 'image/svg+xml'
  return undefined
}

/** Creates one object URL per verified image from its hashed bytes. */
export const createBlobUrls = (
  media: MediaVerification[],
  createObjectURL: (blob: Blob) => string = (blob) => URL.createObjectURL(blob)
): Record<string, string> => {
  const urls: Record<string, string> = {}
  for (const medium of media) {
    if (medium.status !== 'verified' || !medium.bytes || urls[medium.url]) continue
    const type = imageMimeType(medium.bytes)
    urls[medium.url] = createObjectURL(new Blob([medium.bytes], type ? { type } : {}))
  }
  return urls
}

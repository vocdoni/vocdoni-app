/**
 * What the voter page does with a verification result: whether the vote may be cast, and
 * which source each displayed image is rendered from. Pure, so the policy is testable on
 * its own.
 *
 * The chain cannot tell what the voter's screen showed, so the client enforces it: a vote is
 * only cast once the ballot shown matches what the organizer committed.
 */
import type { MediaVerification, ProcessVerification } from './verify'

/** `pending` while the check runs, `blocked` when the ballot shown is not the committed one. */
export type VoteGate = 'allowed' | 'pending' | 'blocked'

export type VoteGateInput = {
  /** False when there is nothing to check (no published question) or no way to (no WebCrypto). */
  enabled: boolean
  pending: boolean
  failed: boolean
  data?: ProcessVerification
  /** The process was published with a parent election, which commits its images. */
  hasParent: boolean
}

export const voteGate = ({ enabled, pending, failed, data, hasParent }: VoteGateInput): VoteGate => {
  if (!enabled) return 'allowed'
  if (pending) return 'pending'
  if (failed || !data) return 'blocked'
  // Published before the chain committed any hash: there is nothing to hold the page to.
  if (data.status === 'no-hash') return 'allowed'
  if (data.status === 'mismatch') return 'blocked'
  // Images are always committed through the parent: one that could not be fetched and
  // hashed would be shown unverified, or not at all.
  if (hasParent && data.media.some((medium) => medium.status !== 'verified')) return 'blocked'
  return 'allowed'
}

export type MediaSourceInput = {
  hasParent: boolean
  data?: ProcessVerification
  /** Object URLs of the verified bytes, keyed by the image URL as displayed. */
  blobUrls: Record<string, string>
}

/**
 * The `src` an image is rendered from. A committed image is only ever shown from the bytes
 * that were hashed (an object URL), never by asking the original URL again, so the voter
 * cannot see different bytes than the verified ones; until those exist it is not shown.
 * Images of a process published without a parent election, or of one that committed no
 * hash at all, are not covered and keep their original URL.
 */
export const resolveMediaSrc = (url: string | undefined, { hasParent, data, blobUrls }: MediaSourceInput) => {
  if (!url) return undefined
  if (!hasParent) return url
  if (blobUrls[url]) return blobUrls[url]
  if (data?.status === 'no-hash') return url
  return undefined
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

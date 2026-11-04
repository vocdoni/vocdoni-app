/**
 * Recognizes a vote rejected because the ballot the voter was shown is no longer the
 * election's current metadata (vocdoni/vocdoni-node#1486): each vote attests the metadata
 * hash it was cast against, and the chain refuses it once the organizer replaces the
 * metadata. The rejection reaches the app in several shapes, all matched here:
 *
 * - the SaaS relay refusing the batch up front: HTTP 409 with API code 40904;
 * - the chain's own reason, relayed as a failed envelope's error inside a `PartialVoteError`;
 * - an SDK `ElectionMetadataChangedError`;
 * - any of the above already flattened into the sentence the vote form displays.
 */

/** SaaS API error code for a relayed vote whose metadata hash is stale. */
export const STALE_BALLOT_API_CODE = 40904

const STALE_ERROR_NAMES = new Set(['ElectionMetadataChangedError'])

const STALE_MESSAGES = [
  // vochain: "vote metadata hash %x does not match the election metadata hash %x"
  /metadata hash \S* ?does not match/i,
  // saas-backend relay ("ballot metadata changed, reload the process and vote again") and SDK
  // wordings such as "election metadata has changed"
  /\b(ballot|election) metadata (has )?changed/i,
]

const MAX_DEPTH = 4

export const isStaleBallotError = (error: unknown, depth = 0): boolean => {
  if (error === null || error === undefined || depth > MAX_DEPTH) return false
  if (typeof error === 'string') return STALE_MESSAGES.some((pattern) => pattern.test(error))
  if (typeof error !== 'object') return false

  const candidate = error as {
    name?: unknown
    message?: unknown
    status?: unknown
    code?: unknown
    failed?: unknown
    cause?: unknown
  }

  if (typeof candidate.name === 'string' && STALE_ERROR_NAMES.has(candidate.name)) return true
  if (candidate.status === 409 && candidate.code === STALE_BALLOT_API_CODE) return true
  if (isStaleBallotError(candidate.message, depth + 1)) return true
  if (
    Array.isArray(candidate.failed) &&
    candidate.failed.some((entry) => isStaleBallotError((entry as { error?: unknown })?.error, depth + 1))
  ) {
    return true
  }
  return isStaleBallotError(candidate.cause, depth + 1)
}

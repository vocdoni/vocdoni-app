import { isStaleBallotError, STALE_BALLOT_API_CODE } from './stale-ballot'

const CHAIN_REASON = 'vote metadata hash 0a1b2c does not match the election metadata hash 3d4e5f'

class FakeApiError extends Error {
  constructor(
    readonly status: number,
    readonly code?: number
  ) {
    super('request failed')
    this.name = 'VocdoniApiError'
  }
}

describe('isStaleBallotError', () => {
  it('matches the SaaS relay conflict by status and code', () => {
    expect(isStaleBallotError(new FakeApiError(409, STALE_BALLOT_API_CODE))).toBe(true)
    // Other 409s (e.g. a duplicate) are not a stale ballot.
    expect(isStaleBallotError(new FakeApiError(409, 40901))).toBe(false)
  })

  it('matches the chain reason inside a partial vote failure', () => {
    const partial = Object.assign(new Error('1 of 2 votes failed'), {
      name: 'PartialVoteError',
      succeeded: [],
      failed: [{ questionId: 'q1', error: new Error(CHAIN_REASON) }],
    })
    expect(isStaleBallotError(partial)).toBe(true)
  })

  it('matches the SDK error by name', () => {
    expect(isStaleBallotError(Object.assign(new Error('changed'), { name: 'ElectionMetadataChangedError' }))).toBe(true)
  })

  it('matches the sentence the vote form displays', () => {
    expect(isStaleBallotError(`Your vote could not be cast: ${CHAIN_REASON}`)).toBe(true)
    expect(isStaleBallotError('Vote failed: ballot metadata changed, reload the process and vote again')).toBe(true)
    expect(isStaleBallotError('Your vote could not be cast: the election metadata has changed')).toBe(true)
  })

  it('matches a wrapped cause', () => {
    expect(isStaleBallotError(new Error('relay failed', { cause: new Error(CHAIN_REASON) }))).toBe(true)
  })

  it('ignores unrelated failures', () => {
    expect(isStaleBallotError(new Error('nullifier already exists'))).toBe(false)
    expect(isStaleBallotError('metadata hash too long (max 128 bytes)')).toBe(false)
    expect(isStaleBallotError(undefined)).toBe(false)
    expect(isStaleBallotError(42)).toBe(false)
  })
})

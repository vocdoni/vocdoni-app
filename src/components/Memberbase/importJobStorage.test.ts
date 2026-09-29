import { getStoredImportJobId, setStoredImportJobId } from './importJobStorage'

describe('importJobStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('stores and retrieves a job id for the same account', () => {
    const accountId = '0xabc'
    setStoredImportJobId('job-1', accountId)

    expect(getStoredImportJobId(accountId)).toBe('job-1')
  })

  it('does not return a job id for a different account', () => {
    setStoredImportJobId('job-1', '0xabc')

    expect(getStoredImportJobId('0xdef')).toBeNull()
  })

  it('stores independent job ids per account', () => {
    setStoredImportJobId('job-1', '0xabc')
    setStoredImportJobId('job-2', '0xdef')

    expect(getStoredImportJobId('0xabc')).toBe('job-1')
    expect(getStoredImportJobId('0xdef')).toBe('job-2')
  })

  it('clears storage when setting null job id', () => {
    setStoredImportJobId('job-1', '0xabc')
    setStoredImportJobId(null, '0xabc')

    expect(getStoredImportJobId('0xabc')).toBeNull()
  })

  it('ignores legacy unscoped value', () => {
    localStorage.setItem('memberbaseImportJobId', 'legacy-job-id')

    expect(getStoredImportJobId('0xabc')).toBeNull()
    expect(localStorage.getItem('memberbaseImportJobId')).toBe('legacy-job-id')
  })

  // Callers pass the signer address, whose casing (checksummed or not) varies by source.
  it('matches account ids regardless of case and surrounding whitespace', () => {
    setStoredImportJobId('job-2', '0xABC')

    expect(getStoredImportJobId(' 0xabc ')).toBe('job-2')
  })
})

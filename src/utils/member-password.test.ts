import { hashMemberPassword, hashMemberPasswords } from './member-password'

// The fixed vector shared with the backend spec and the SDK docs: whatever form the
// organization address comes in, the hash is the same.
const VECTOR = '2f7e83a0b19a82fa9a5dc6ecc6ff44ec82679ea87012a7187bd3313366bf277e'

describe('hashMemberPassword', () => {
  it.each([
    ['0x-prefixed checksummed', '0x00000000000000000000000000000000000000AA'],
    ['unprefixed lowercase', '00000000000000000000000000000000000000aa'],
  ])('hashes the %s organization address to the shared test vector', async (_, address) => {
    await expect(hashMemberPassword(address, 's3cret')).resolves.toBe(VECTOR)
  })

  it('trims the password before hashing', async () => {
    await expect(hashMemberPassword('0x00000000000000000000000000000000000000aa', '  s3cret \n')).resolves.toBe(VECTOR)
  })

  it('does not fold case', async () => {
    await expect(hashMemberPassword('0x00000000000000000000000000000000000000aa', 'S3CRET')).resolves.not.toBe(VECTOR)
  })

  it.each(['', '0x1', 'not-an-address', '0x00000000000000000000000000000000000000zz'])(
    'refuses %j as an organization address',
    async (address) => {
      await expect(hashMemberPassword(address, 's3cret')).rejects.toThrow(/organization address/)
    }
  )
})

describe('hashMemberPasswords', () => {
  it('replaces each non-empty password with its hash and drops empty ones', async () => {
    const rows = await hashMemberPasswords('0x00000000000000000000000000000000000000AA', [
      { memberNumber: '1', password: 's3cret' },
      { memberNumber: '2', password: '   ' },
      { memberNumber: '3' },
    ])
    expect(rows).toEqual([{ memberNumber: '1', password: VECTOR }, { memberNumber: '2' }, { memberNumber: '3' }])
  })
})

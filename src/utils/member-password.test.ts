import { hashMemberPasswords, isValidMemberPassword } from './member-password'

// The fixed vector shared with the backend spec and the SDK docs: whatever form the
// organization address comes in, the hash is the same.
const VECTOR = '2f7e83a0b19a82fa9a5dc6ecc6ff44ec82679ea87012a7187bd3313366bf277e'

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

describe('isValidMemberPassword', () => {
  it.each(['abc123', 'Ñandú1', ' abc123 ', 's3cret'])('accepts %j', (password) => {
    expect(isValidMemberPassword(password)).toBe(true)
  })

  it.each(['abc12', 'abcdef', '123456', '', '      ', ' abc1  '])('rejects %j', (password) => {
    expect(isValidMemberPassword(password)).toBe(false)
  })
})

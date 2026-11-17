import { buildCspAuthRequest } from './auth-request'

describe('buildCspAuthRequest', () => {
  it('keeps the census fields, trimmed, and drops the rest', () => {
    expect(buildCspAuthRequest({ memberNumber: ' 42 ', name: 'Anna', other: 'x' }, ['memberNumber'], [])).toEqual({
      memberNumber: '42',
    })
  })

  it('routes the contact to email or phone by what the census accepts', () => {
    expect(buildCspAuthRequest({ contact: 'a@b.cat' }, [], ['email', 'phone'])).toEqual({ email: 'a@b.cat' })
    expect(buildCspAuthRequest({ contact: '600123456' }, [], ['email', 'phone'])).toEqual({ phone: '600123456' })
    expect(buildCspAuthRequest({ contact: '600123456' }, [], ['email'])).toEqual({ email: '600123456' })
    expect(buildCspAuthRequest({ contact: 'a@b.cat' }, [], ['phone'])).toEqual({ phone: 'a@b.cat' })
  })

  it('leaves the password as typed, for the caller to hash', () => {
    expect(buildCspAuthRequest({ memberNumber: '1', password: 'pw ' }, ['memberNumber', 'password'], [])).toEqual({
      memberNumber: '1',
      password: 'pw',
    })
  })
})

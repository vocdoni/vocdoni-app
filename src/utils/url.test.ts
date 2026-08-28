import { describe, expect, it } from 'vitest'
import { withParam } from './url'

describe('withParam', () => {
  it('appends to a bare path', () => {
    expect(withParam('/account/verify', 'email', 'a@b.com')).toBe('/account/verify?email=a%40b.com')
  })

  it('keeps parameters the path already carries', () => {
    const url = withParam('/account/verify?type=professional-associations', 'email', 'a@b.com')

    const params = new URLSearchParams(url.split('?')[1])
    expect(params.get('type')).toBe('professional-associations')
    expect(params.get('email')).toBe('a@b.com')
    expect(url).not.toContain('?email')
  })

  it('overwrites a parameter of the same name', () => {
    expect(withParam('/x?email=old%40b.com', 'email', 'new@b.com')).toBe('/x?email=new%40b.com')
  })
})

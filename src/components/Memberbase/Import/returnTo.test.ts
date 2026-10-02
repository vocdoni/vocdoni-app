import { returnToKind, safeReturnTo } from './returnTo'

describe('safeReturnTo', () => {
  it('accepts dashboard paths', () => {
    expect(safeReturnTo('/admin/processes/create?draftId=1')).toBe('/admin/processes/create?draftId=1')
    expect(safeReturnTo('/admin/memberbase/censuses')).toBe('/admin/memberbase/censuses')
  })

  it('ignores anything outside the dashboard', () => {
    for (const value of [
      null,
      '',
      '/account/signup',
      'https://evil.example/admin/',
      '//evil.example/admin/',
      '/admin',
      '/admin/\\evil',
      '/admin/../account',
    ]) {
      expect(safeReturnTo(value)).toBeNull()
    }
  })
})

describe('returnToKind', () => {
  it('names drafts, votes and the members section', () => {
    expect(returnToKind('/admin/processes/create?draftId=1')).toBe('draft')
    expect(returnToKind('/admin/process/0xabc/voters')).toBe('vote')
    expect(returnToKind('/admin/memberbase/censuses')).toBe('members')
    expect(returnToKind('/admin/settings')).toBe('other')
  })
})

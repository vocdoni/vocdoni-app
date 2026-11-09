import { safeId } from './ids'

describe('safeId', () => {
  it('keeps ids', () => {
    expect(safeId('66f1c0ffee0123456789abcd')).toBe('66f1c0ffee0123456789abcd')
    expect(safeId('a1_b-2')).toBe('a1_b-2')
  })

  it('drops anything that could walk an API path', () => {
    expect(safeId('../../0xother/groups/1')).toBeUndefined()
    expect(safeId('abc/def')).toBeUndefined()
    expect(safeId('abc?x=1')).toBeUndefined()
    expect(safeId('')).toBeUndefined()
    expect(safeId(null)).toBeUndefined()
    expect(safeId(undefined)).toBeUndefined()
  })
})

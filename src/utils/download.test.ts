import { csvCell } from './download'

describe('csvCell', () => {
  it('never lets a cell run as a formula in a spreadsheet', () => {
    for (const value of ['=1+1', '+1+1', '-1+1', '@SUM(A1)', '\t=1', '\r=1'])
      expect(csvCell(value).replace(/^"/, '')).toMatch(/^'/)
  })

  it('leaves ordinary values alone', () => {
    expect(csvCell('Anna')).toBe('Anna')
    expect(csvCell('a-b+c')).toBe('a-b+c')
  })
})

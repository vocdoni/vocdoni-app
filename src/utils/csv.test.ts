import { toCsv } from './csv'

describe('toCsv', () => {
  it('joins cells and rows, with a byte order mark and a final line break', () => {
    expect(
      toCsv([
        ['Question', 'Votes'],
        ['Budget', 12],
      ])
    ).toBe('\uFEFFQuestion,Votes\r\nBudget,12\r\n')
  })

  it('quotes cells with commas, quotes or line breaks', () => {
    expect(toCsv([['Yes, please', 'the "new" seat', 'two\nlines']])).toBe(
      '\uFEFF"Yes, please","the ""new"" seat","two\nlines"\r\n'
    )
  })

  it('keeps a cell that looks like a formula as text', () => {
    expect(toCsv([['=SUM(A1)', '-1 seat', '@home']])).toBe("\uFEFF'=SUM(A1),'-1 seat,'@home\r\n")
  })
})

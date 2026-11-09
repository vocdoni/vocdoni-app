import { toCsv } from '~utils/download'
import { failedRowsSheet, mapFailedRows, parseJobError } from './failedRows'

describe('parseJobError', () => {
  it('reads the line and what was wrong', () => {
    expect(parseJobError('line 3: invalid email "x": mail: missing @')).toEqual({
      line: 3,
      reason: 'email',
      message: 'invalid email "x": mail: missing @',
    })
    expect(parseJobError('something broke')).toEqual({ line: null, reason: 'other', message: 'something broke' })
  })
})

describe('mapFailedRows', () => {
  // The header sits on row 3 (two title rows above), row 5 is blank, and table row 1 was a duplicate left out
  const table = {
    header: ['Nom', 'Correu'],
    rows: [
      ['Anna', 'a@'],
      ['Anna', 'a@'],
      ['Pere', 'p@x.org'],
    ],
    rowNumbers: [4, 6, 7],
  }
  const sourceRows = [0, 2]

  it('maps each job line to the row number in the spreadsheet', () => {
    const { rows, unplaced } = mapFailedRows(
      ['line 1: invalid email "a@"', 'line 2: invalid phone number', 'line 9: ?', 'oops'],
      sourceRows,
      table
    )
    expect(rows.map(({ rowNumber, tableRow }) => ({ rowNumber, tableRow }))).toEqual([
      { rowNumber: 4, tableRow: 0 },
      { rowNumber: 7, tableRow: 2 },
    ])
    expect(unplaced.map((error) => error.message)).toEqual(['?', 'oops'])
  })

  it('builds a CSV with the original columns and the problem', () => {
    const { rows } = mapFailedRows(['line 1: invalid email "a@"'], sourceRows, table)
    const csv = toCsv(failedRowsSheet(table, rows, 'Problem', () => 'The email is not valid'))
    expect(csv).toBe('﻿Nom;Correu;Problem\r\nAnna;a@;The email is not valid\r\n')
  })
})

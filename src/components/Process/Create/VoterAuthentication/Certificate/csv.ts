// RFC 4180 CSV with UTF-8 BOM and formula-injection protection for spreadsheet safety.

const BOM = '﻿'
// Characters that spreadsheets treat as formula starters.
const FORMULA_STARTERS = new Set(['=', '+', '-', '@', '\t', '\r'])

/** Returns the BOM-prefixed CSV string. Every cell is double-quoted; inner quotes are doubled. */
export const toCsv = (rows: string[][]): string => {
  const lines = rows.map((row) =>
    row
      .map((cell) => {
        // Prefix a leading quote so the spreadsheet never executes the value as a formula.
        const safe = FORMULA_STARTERS.has(cell[0]) ? "'" + cell : cell
        return '"' + safe.replace(/"/g, '""') + '"'
      })
      .join(',')
  )
  return BOM + lines.join('\r\n')
}

/** Downloads a CSV file by creating a temporary anchor element and immediately removing it. */
export const downloadCsv = (fileName: string, csv: string): void => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

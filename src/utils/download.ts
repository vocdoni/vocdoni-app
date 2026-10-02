/** Saves a file the app built in the browser, under `fileName`. */
export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Some browsers start the download after the click returns
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const needsQuotes = (value: string, delimiter: string) =>
  value.includes(delimiter) || /["\r\n]/.test(value) || value !== value.trim()

// A cell starting with these runs as a formula when the file is opened in a spreadsheet
const FORMULA_START = /^[=@\t\r]/

/** One CSV cell: quoted when needed, and never a formula. */
export const csvCell = (value: string, delimiter = ';') => {
  const safe = FORMULA_START.test(value) ? `'${value}` : value
  return needsQuotes(safe, delimiter) ? `"${safe.replace(/"/g, '""')}"` : safe
}

/**
 * Rows as CSV text. Semicolons and a UTF-8 byte order mark by default: that is what Excel opens
 * correctly in the languages we serve (it reads a comma CSV as one column where the comma is the
 * decimal separator, and accents as garbage without the mark).
 */
export const toCsv = (rows: string[][], { delimiter = ';', bom = true }: { delimiter?: string; bom?: boolean } = {}) =>
  (bom ? '﻿' : '') +
  rows.map((row) => row.map((cell) => csvCell(cell ?? '', delimiter)).join(delimiter)).join('\r\n') +
  '\r\n'

export const csvBlob = (rows: string[][]) => new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' })

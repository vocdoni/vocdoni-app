// A spreadsheet reads a cell starting with one of these as a formula: a leading apostrophe keeps it text.
const FORMULA_START = /^[=+\-@\t\r]/

const cell = (value: string | number): string => {
  if (typeof value === 'number') return String(value)
  const safe = FORMULA_START.test(value) ? `'${value}` : value
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

/** Rows as CSV text (RFC 4180), with a byte order mark so spreadsheets read accents right. */
export const toCsv = (rows: ReadonlyArray<ReadonlyArray<string | number>>): string =>
  `\uFEFF${rows.map((row) => row.map(cell).join(',')).join('\r\n')}\r\n`

/** Hands the browser a text file to save. */
export const downloadTextFile = (name: string, content: string, type: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.rel = 'noopener noreferrer'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

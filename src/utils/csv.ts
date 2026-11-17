// A spreadsheet reads a cell starting with one of these as a formula: a leading apostrophe keeps it text.
const FORMULA_START = /^[=+\-@\t\r]/

/** How a spreadsheet set to a language reads a CSV: the cell separator and the decimal mark it expects. */
export type CsvDialect = { delimiter: ',' | ';'; decimal: '.' | ',' }

/**
 * The dialect of a language's spreadsheets. Where numbers take a decimal comma (Catalan, Spanish, German, French and
 * most of Europe), Excel splits cells on semicolons and would open a comma file in one column; elsewhere it is the
 * plain comma and dot.
 */
export const csvDialect = (language: string): CsvDialect => {
  const decimal = new Intl.NumberFormat(language).formatToParts(1.5).find((part) => part.type === 'decimal')?.value
  return decimal === ',' ? { delimiter: ';', decimal: ',' } : { delimiter: ',', decimal: '.' }
}

const cell = (value: string | number, { delimiter, decimal }: CsvDialect): string => {
  if (typeof value === 'number') return String(value).replace('.', decimal)
  const safe = FORMULA_START.test(value) ? `'${value}` : value
  return safe.includes(delimiter) || /["\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

const PLAIN: CsvDialect = { delimiter: ',', decimal: '.' }

/** Rows as CSV text (RFC 4180 quoting), with a byte order mark so spreadsheets read accents right. */
export const toCsv = (rows: ReadonlyArray<ReadonlyArray<string | number>>, dialect: CsvDialect = PLAIN): string =>
  `\uFEFF${rows.map((row) => row.map((value) => cell(value, dialect)).join(dialect.delimiter)).join('\r\n')}\r\n`

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

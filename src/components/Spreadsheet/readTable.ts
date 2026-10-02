import { type CellObject, read, SSF, utils, type WorkSheet } from 'xlsx'
import ErrorMissingData from './errors/ErrorMissingData'
import ErrorMissingHeader from './errors/ErrorMissingHeader'

/**
 * Reads the first sheet of a member file (CSV, XLSX, XLS or ODS) into a header and text rows, fixing
 * what spreadsheets usually get wrong on the way and recording each fix it actually made, so the
 * import can tell the admin about them.
 */

/** Something we fixed while reading, for the import receipt. */
export type TableFix =
  /** The CSV wasn't UTF-8: it was read as Windows-1252 (what Excel saves on Windows) */
  | { kind: 'encoding' }
  /** Rows above the headers (a title, a date) were left out */
  | { kind: 'title_rows'; count: number }
  /** Cells with spaces around their value */
  | { kind: 'trimmed'; count: number }
  /** Values like 00123 kept as text, so their leading zeros survive */
  | { kind: 'leading_zeros'; count: number }
  /** Day-first dates (31/12/1990) turned into 1990-12-31 */
  | { kind: 'european_dates'; count: number }

export type Table = {
  fileName: string
  header: string[]
  /** Data rows, one cell per header column, as text */
  rows: string[][]
  /** The spreadsheet row number (1-based, as the admin sees it) of each data row */
  rowNumbers: number[]
  /** The spreadsheet row number of the header */
  headerRowNumber: number
  fixes: TableFix[]
}

export type ReadTableOptions = {
  /** Whether a cell is a header we know (a member field). Helps tell the header row from a title. */
  isKnownHeader?: (cell: string) => boolean
  /** The name of a column whose header cell is empty, from its letter ("Column C") */
  untitledColumn?: (letter: string) => string
}

// MIME types mapped to extensions: dropzones accept a file when either matches, so a .csv the OS
// labels text/plain or application/octet-stream is still accepted by its name
export const SPREADSHEET_ACCEPT: Record<string, string[]> = {
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.oasis.opendocument.spreadsheet': ['.ods'],
  'text/csv': ['.csv'],
  'application/csv': ['.csv'],
  'text/x-comma-separated-values': ['.csv'],
}

/** How far down a title can push the header row */
export const HEADER_SCAN_ROWS = 10

const REPLACEMENT_CHAR = '�'

/** Decodes a text file as UTF-8, falling back to Windows-1252 when that leaves broken characters. */
export const decodeText = (bytes: Uint8Array): { text: string; encoding: 'utf-8' | 'windows-1252' } => {
  // The decoder drops a UTF-8 BOM by itself
  const utf8 = new TextDecoder('utf-8').decode(bytes)
  if (!utf8.includes(REPLACEMENT_CHAR)) return { text: utf8, encoding: 'utf-8' }
  return { text: new TextDecoder('windows-1252').decode(bytes), encoding: 'windows-1252' }
}

const DELIMITERS = [';', ',', '\t'] as const
export type Delimiter = (typeof DELIMITERS)[number]

/** Counts a delimiter on each of the first lines, ignoring the ones inside quotes. */
const countPerLine = (text: string, delimiter: string, maxLines: number) => {
  const counts: number[] = []
  let count = 0
  let quoted = false
  for (let i = 0; i < text.length && counts.length < maxLines; i++) {
    const char = text[i]
    if (char === '"') quoted = !quoted
    else if (!quoted && char === delimiter) count++
    else if (!quoted && char === '\n') {
      counts.push(count)
      count = 0
    }
  }
  if (counts.length < maxLines && count > 0) counts.push(count)
  return counts
}

/**
 * Picks the delimiter of a CSV: the one that splits the most lines into the same number of cells
 * (semicolons win over the commas inside Spanish decimals and addresses when both appear).
 */
export const sniffDelimiter = (text: string): Delimiter => {
  let best: { delimiter: Delimiter; score: number; width: number } = { delimiter: ',', score: 0, width: 0 }
  for (const delimiter of DELIMITERS) {
    const counts = countPerLine(text, delimiter, 20).filter((count) => count > 0)
    if (!counts.length) continue
    // The most common count is the row width; the score is how many lines have it
    const frequency = new Map<number, number>()
    counts.forEach((count) => frequency.set(count, (frequency.get(count) ?? 0) + 1))
    const [width, score] = [...frequency.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0]
    if (score > best.score || (score === best.score && width > best.width)) best = { delimiter, score, width }
  }
  return best.delimiter
}

/** Splits CSV text into rows of cells: quoted cells may hold delimiters, quotes ("") and line breaks. */
export const parseDelimited = (text: string, delimiter: string): string[][] => {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"'
        i++
      } else if (char === '"') quoted = false
      else cell += char
      continue
    }
    if (char === '"' && cell.trim() === '') {
      cell = ''
      quoted = true
    } else if (char === delimiter) {
      row.push(cell)
      cell = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else cell += char
  }
  if (cell !== '' || row.length) {
    row.push(cell)
    rows.push(row)
  }
  return rows
}

const isBlankRow = (row: string[]) => row.every((cell) => cell === '')

const EMAIL_LIKE = /@/
const NUMBER_LIKE = /^[+\-\d\s.,/()]+$/

/** Text that could be a column header: not a number, a date or an email, and short. */
const looksLikeHeader = (cell: string) =>
  cell !== '' && cell.length <= 64 && !EMAIL_LIKE.test(cell) && !NUMBER_LIKE.test(cell)

/**
 * The index of the header row among `rows`: the first of the first rows with two cells we know as
 * headers, else the first with two header-looking cells, else the first row with anything in it.
 * Rows above it are a title, a date, a logo's caption…
 */
export const findHeaderRow = (
  rows: string[][],
  isKnownHeader: (cell: string) => boolean = () => false,
  maxScan = HEADER_SCAN_ROWS
): number => {
  const candidates = rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => !isBlankRow(row))
    .slice(0, maxScan)
  if (!candidates.length) return -1
  const known = candidates.find(({ row }) => row.filter((cell) => cell && isKnownHeader(cell)).length >= 2)
  if (known) return known.index
  const headerLike = candidates.find(({ row }) => row.filter(looksLikeHeader).length >= 2)
  return (headerLike ?? candidates[0]).index
}

const pad = (value: number) => String(value).padStart(2, '0')

const DAY_FIRST = /^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4}|\d{2})$/
const YEAR_FIRST = /^(\d{4})[/.\-](\d{1,2})[/.\-](\d{1,2})$/

const isValidDate = (year: number, month: number, day: number) => {
  if (month < 1 || month > 12 || day < 1) return false
  return day <= new Date(Date.UTC(year, month, 0)).getUTCDate()
}

/**
 * A birth date as YYYY-MM-DD. Day-first dates (31/12/1990, 1.2.85) are what European spreadsheets
 * hold; a second part above 12 can only be a day, so 12/31/1990 reads month first. Two-digit years
 * are in the past. `null` when the value isn't a date we can read: it's then sent as is.
 */
export const normaliseDate = (value: string, today: Date = new Date()): { date: string; dayFirst: boolean } | null => {
  const trimmed = value.trim()
  const yearFirst = YEAR_FIRST.exec(trimmed)
  if (yearFirst) {
    const [year, month, day] = yearFirst.slice(1).map(Number)
    return isValidDate(year, month, day) ? { date: `${year}-${pad(month)}-${pad(day)}`, dayFirst: false } : null
  }
  const dayFirst = DAY_FIRST.exec(trimmed)
  if (!dayFirst) return null
  let [day, month] = [Number(dayFirst[1]), Number(dayFirst[2])]
  if (month > 12 && day <= 12) [day, month] = [month, day]
  let year = Number(dayFirst[3])
  if (dayFirst[3].length === 2) {
    const century = Math.floor(today.getFullYear() / 100) * 100
    year = century + year > today.getFullYear() ? century - 100 + year : century + year
  }
  return isValidDate(year, month, day) ? { date: `${year}-${pad(month)}-${pad(day)}`, dayFirst: true } : null
}

const LEADING_ZEROS = /^0\d+$/

/**
 * Turns raw rows (blank ones included, so row numbers hold) into a table: trims every cell, finds the
 * header row and drops columns with neither a header nor data.
 */
export const buildTable = (
  rawRows: string[][],
  { isKnownHeader, untitledColumn = (letter) => `Column ${letter}` }: ReadTableOptions = {},
  firstRowNumber = 1
): Omit<Table, 'fileName'> => {
  let trimmed = 0
  const rows = rawRows.map((row) =>
    row.map((raw) => {
      const value = (raw ?? '').trim()
      if (value !== '' && value !== raw) trimmed++
      return value
    })
  )

  const headerIndex = findHeaderRow(rows, isKnownHeader)
  if (headerIndex < 0) throw new ErrorMissingHeader()
  const titleRows = rows.slice(0, headerIndex).filter((row) => !isBlankRow(row)).length

  const data = rows
    .map((row, index) => ({ row, number: firstRowNumber + index }))
    .slice(headerIndex + 1)
    .filter(({ row }) => !isBlankRow(row))
  if (!data.length) throw new ErrorMissingData()

  const headerRow = rows[headerIndex]
  const width = Math.max(headerRow.length, ...data.map(({ row }) => row.length))
  // Columns with a header, or with data under an empty header
  const columns = Array.from({ length: width }, (_, index) => index).filter(
    (index) => headerRow[index] || data.some(({ row }) => row[index])
  )
  const header = columns.map((index) => headerRow[index] || untitledColumn(utils.encode_col(index)))
  const tableRows = data.map(({ row }) => columns.map((index) => row[index] ?? ''))
  const leadingZeros = tableRows.reduce((sum, row) => sum + row.filter((cell) => LEADING_ZEROS.test(cell)).length, 0)

  const fixes: TableFix[] = []
  if (titleRows) fixes.push({ kind: 'title_rows', count: titleRows })
  if (trimmed) fixes.push({ kind: 'trimmed', count: trimmed })
  if (leadingZeros) fixes.push({ kind: 'leading_zeros', count: leadingZeros })

  return {
    header,
    rows: tableRows,
    rowNumbers: data.map(({ number }) => number),
    headerRowNumber: firstRowNumber + headerIndex,
    fixes,
  }
}

const isCsvFile = (file: File) => /\.(csv|txt)$/i.test(file.name) || /csv|text\/plain/.test(file.type)

const readBytes = (file: File): Promise<Uint8Array> =>
  typeof file.arrayBuffer === 'function'
    ? file.arrayBuffer().then((buffer) => new Uint8Array(buffer))
    : new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer))
        reader.onerror = () => reject(reader.error)
        reader.readAsArrayBuffer(file)
      })

/** A cell as the admin sees it, with dates as YYYY-MM-DD and long numbers without exponents. */
export const cellText = (cell?: CellObject): string => {
  if (!cell || cell.v === undefined || cell.v === null) return ''
  if (cell.t === 'd') {
    if (cell.v instanceof Date) return `${cell.v.getFullYear()}-${pad(cell.v.getMonth() + 1)}-${pad(cell.v.getDate())}`
    return String(cell.v).slice(0, 10)
  }
  if (cell.t === 'n' && typeof cell.v === 'number') {
    if (cell.z && SSF.is_date(cell.z)) {
      const date = SSF.parse_date_code(cell.v)
      return `${date.y}-${pad(date.m)}-${pad(date.d)}`
    }
    // General-format phone numbers and IDs would otherwise read as 3.46123E+10
    if ((!cell.z || cell.z === 'General') && Number.isInteger(cell.v)) return String(cell.v)
  }
  return cell.w ?? String(cell.v)
}

/** The first sheet's cells as text rows, and the row number the first of them sits at. */
export const sheetRows = (sheet: WorkSheet): { rows: string[][]; firstRowNumber: number } => {
  if (!sheet['!ref']) return { rows: [], firstRowNumber: 1 }
  const range = utils.decode_range(sheet['!ref'])
  const rows: string[][] = []
  for (let r = range.s.r; r <= range.e.r; r++) {
    const row: string[] = []
    for (let c = 0; c <= range.e.c; c++) row.push(cellText(sheet[utils.encode_cell({ r, c })]))
    rows.push(row)
  }
  return { rows, firstRowNumber: range.s.r + 1 }
}

/** Reads a member file: decoding, delimiter, header row and cleanup included. */
export const readTable = async (file: File, options: ReadTableOptions = {}): Promise<Table> => {
  const bytes = await readBytes(file)
  if (isCsvFile(file)) {
    const { text, encoding } = decodeText(bytes)
    const table = buildTable(parseDelimited(text, sniffDelimiter(text)), options)
    if (encoding === 'windows-1252') table.fixes.unshift({ kind: 'encoding' })
    return { fileName: file.name, ...table }
  }
  // cellNF keeps each cell's number format, which is how a date cell tells itself apart from a number
  const workbook = read(bytes, { type: 'array', cellNF: true })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) throw new ErrorMissingData()
  const { rows, firstRowNumber } = sheetRows(sheet)
  return { fileName: file.name, ...buildTable(rows, options, firstRowNumber) }
}

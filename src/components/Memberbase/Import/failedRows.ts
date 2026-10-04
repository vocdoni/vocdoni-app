import type { Table } from '~components/Spreadsheet/readTable'

/** Which value the backend dropped from a row */
export type FailureReason = 'email' | 'phone' | 'birth_date' | 'other'

export type JobError = {
  /** 1-based position of the member in the list that was sent, when the error names one */
  line: number | null
  reason: FailureReason
  /** The backend's own text (English, may quote the value): kept for anything we can't explain */
  message: string
}

/** A file row the import couldn't take whole */
export type FailedRow = {
  /** Index into the table's rows */
  tableRow: number
  /** The row number in the admin's spreadsheet */
  rowNumber: number
  reasons: JobError[]
}

const LINE_PREFIX = /^line (\d+):\s*([\s\S]*)$/

const reasonOf = (message: string): FailureReason => {
  if (/email/i.test(message)) return 'email'
  if (/phone/i.test(message)) return 'phone'
  if (/birth ?date/i.test(message)) return 'birth_date'
  return 'other'
}

/** Reads an import job error: `line 12: invalid email "x": …` */
export const parseJobError = (error: string): JobError => {
  const match = LINE_PREFIX.exec(error.trim())
  const message = match ? match[2] : error.trim()
  return { line: match ? Number(match[1]) : null, reason: reasonOf(message), message }
}

/**
 * The file rows behind the job errors. `sourceRows[n]` is the table row the n-th member sent came
 * from, so title rows, blank rows and duplicates left out don't shift the row numbers.
 */
export const mapFailedRows = (
  errors: string[] = [],
  sourceRows: number[],
  table: Pick<Table, 'rowNumbers'>
): { rows: FailedRow[]; unplaced: JobError[] } => {
  const byRow = new Map<number, FailedRow>()
  const unplaced: JobError[] = []
  for (const error of errors.map(parseJobError)) {
    const tableRow = error.line ? sourceRows[error.line - 1] : undefined
    if (tableRow === undefined) {
      unplaced.push(error)
      continue
    }
    const row = byRow.get(tableRow) ?? { tableRow, rowNumber: table.rowNumbers[tableRow], reasons: [] }
    row.reasons.push(error)
    byRow.set(tableRow, row)
  }
  return { rows: [...byRow.values()].sort((a, b) => a.tableRow - b.tableRow), unplaced }
}

/** The failed rows as the admin's own columns plus a "Problem" one, ready for `toCsv`. */
export const failedRowsSheet = (
  table: Pick<Table, 'header' | 'rows'>,
  failed: FailedRow[],
  problemHeader: string,
  describe: (error: JobError) => string
): string[][] => [
  [...table.header, problemHeader],
  ...failed.map((row) => [...table.rows[row.tableRow], row.reasons.map(describe).join(' · ')]),
]

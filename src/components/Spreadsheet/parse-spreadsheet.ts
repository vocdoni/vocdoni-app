import { read, utils } from 'xlsx'

export type ParsedSpreadsheet = {
  /** Trimmed cells of the first sheet, without blank rows. */
  rows: string[][]
  /** 1-based file line of each row in `rows`. */
  lines: number[]
}

/** Parses a binary string of a CSV/XLS/XLSX/ODS file. This is the only module that imports `xlsx`. */
export const parseSpreadsheet = (content: string): ParsedSpreadsheet => {
  const workBook = read(content, { type: 'binary', codepage: 65001 })
  const worksheet = workBook.Sheets[workBook.SheetNames[0]]
  const data: string[][] = utils.sheet_to_json(worksheet, { header: 1, raw: false })
  // sheet_to_json starts at the first used row, so blank rows before it are not in `data`
  const firstRow = worksheet?.['!ref'] ? utils.decode_range(worksheet['!ref']).s.r : 0
  const lines: number[] = []
  const rows = data.filter((row, index) => {
    if (row.length === 0) return false
    lines.push(firstRow + index + 1)
    return true
  })

  return { rows: rows.map((row) => row.map((cell) => cell.trim())), lines }
}

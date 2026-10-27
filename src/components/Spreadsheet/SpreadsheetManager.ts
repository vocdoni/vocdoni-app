import { read, utils, WorkBook } from 'xlsx'
import ErrorMissingData from './errors/ErrorMissingData'
import ErrorMissingHeader from './errors/ErrorMissingHeader'

export enum ErrorType {
  InvalidRowLength,
  InvalidWeight,
  InvalidCellData,
}

export class SpreadsheetManager {
  protected readonly reader
  protected heading: string[]
  protected filedata: string[][]
  // 1-based line of each `filedata` row in the original file, kept because blank rows are dropped
  protected linenumbers: number[] = []

  public workBook: WorkBook | undefined
  public errors: number[] = []

  constructor(
    public file: File,
    protected headed: boolean = false
  ) {
    this.reader = new FileReader()
    this.heading = []
    this.filedata = [[]]
  }

  public read() {
    return this.load().then(() => this.validateDataIntegrity())
  }

  // MIME types mapped to their file extensions. Dropzones accept a file when either matches, so a .csv that
  // the OS labels with a generic type (text/plain, application/octet-stream) is still accepted by name.
  public static readonly Accept: Readonly<Record<string, readonly string[]>> = {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-excel': ['.xls'],
    'text/csv': ['.csv'],
    'application/csv': ['.csv'],
    'application/x-csv': ['.csv'],
    'text/x-comma-separated-values': ['.csv'],
    'text/comma-separated-values': ['.csv'],
    'application/vnd.oasis.opendocument.spreadsheet': ['.ods'],
  }

  public validateDataIntegrity(): void {
    if (this.headed && (!this.header || this.header.length === 0)) {
      throw new ErrorMissingHeader()
    }

    if (!this.data || this.data.length === 0) {
      throw new ErrorMissingData()
    }
  }

  public get header(): string[] {
    return this.heading
  }

  /** The 1-based file line of each row in `data`. */
  public get lineNumbers(): number[] {
    return this.linenumbers
  }

  public get data(): string[][] {
    return this.filedata
  }

  private load(): Promise<SpreadsheetManager> {
    return new Promise((resolve, reject): void => {
      this.reader.onload = (event) => {
        try {
          this.workBook = read(this.reader.result, {
            type: 'binary',
            codepage: 65001,
          })
          this.filedata = this.getSheetsData(this.workBook)
          if (this.headed) {
            this.heading = this.filedata.splice(0, 1)[0]
            this.linenumbers.splice(0, 1)
          }
          resolve(this)
        } catch (error) {
          reject(error)
        }
      }
      this.reader.onerror = () => reject(this.reader.error)
      this.reader.readAsBinaryString(this.file)
    })
  }

  private getSheetsData(xlsFile: WorkBook) {
    const firstSheetName = xlsFile.SheetNames[0]
    const worksheet = xlsFile.Sheets[firstSheetName]
    const data: string[][] = utils.sheet_to_json(worksheet, { header: 1, raw: false })
    // sheet_to_json starts at the first used row, so blank rows before it are not in `data`
    const firstRow = worksheet?.['!ref'] ? utils.decode_range(worksheet['!ref']).s.r : 0
    const lines: number[] = []
    const filtered = data.filter((row, index) => {
      if (row.length === 0) return false
      lines.push(firstRow + index + 1)
      return true
    })
    this.linenumbers = lines

    return filtered.map((row) => row.map((cell) => cell.trim()))
  }
}

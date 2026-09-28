import { read, utils, WorkBook } from 'xlsx'
import ErrorMissingData from './errors/ErrorMissingData'
import ErrorMissingHeader from './errors/ErrorMissingHeader'

export enum ErrorType {
  InvalidRowLength,
  InvalidWeight,
  InvalidCellData,
}

const KNOWN_FILE_TYPES = ['csv', 'tsv', 'txt', 'xlsx', 'xls', 'ods']

/** The file's extension when it is a spreadsheet format, for analytics. MIME types are unreliable here. */
export const getSpreadsheetFileType = (name?: string): string => {
  const extension = name?.includes('.') ? name.split('.').pop()?.toLowerCase() : undefined
  if (!extension) return 'none'
  return KNOWN_FILE_TYPES.includes(extension) ? extension : 'other'
}

export type SpreadsheetEncoding = 'binary' | 'utf-8' | 'utf-8-bom' | 'utf-16' | 'non-utf-8'

/**
 * Sniffs the text encoding of a file read as a binary string. SheetJS decodes
 * every text file as UTF-8, so a Latin-1 / Windows-1252 export does not fail:
 * its accented characters just come out garbled. `binary` covers the zip
 * (xlsx, ods) and CFB (xls) containers, which carry no text encoding.
 */
export const detectSpreadsheetEncoding = (content: string): SpreadsheetEncoding => {
  if (content.startsWith('PK\x03\x04') || content.startsWith('\xD0\xCF\x11\xE0')) return 'binary'
  if (content.startsWith('\xEF\xBB\xBF')) return 'utf-8-bom'
  if (content.startsWith('\xFF\xFE') || content.startsWith('\xFE\xFF')) return 'utf-16'

  const bytes = new Uint8Array(content.length)
  for (let i = 0; i < content.length; i++) bytes[i] = content.charCodeAt(i) & 0xff
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    return 'utf-8'
  } catch {
    return 'non-utf-8'
  }
}

export class SpreadsheetManager {
  protected readonly reader
  protected heading: string[]
  protected filedata: string[][]

  public workBook: WorkBook | undefined
  public errors: number[] = []
  /** Known once the file has been read, even when parsing it then fails */
  public encoding: SpreadsheetEncoding | undefined

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

  public get data(): string[][] {
    return this.filedata
  }

  public get fileType(): string {
    return getSpreadsheetFileType(this.file?.name)
  }

  private load(): Promise<SpreadsheetManager> {
    return new Promise((resolve, reject): void => {
      this.reader.onload = () => {
        try {
          if (typeof this.reader.result === 'string') {
            this.encoding = detectSpreadsheetEncoding(this.reader.result)
          }
          this.workBook = read(this.reader.result, {
            type: 'binary',
            codepage: 65001,
          })
          this.filedata = this.getSheetsData(this.workBook)
          if (this.headed) {
            this.heading = this.filedata.splice(0, 1)[0]
          }
          resolve(this)
        } catch (error) {
          reject(error)
        }
      }
      // Without this a file that cannot be read would leave the promise pending forever
      this.reader.onerror = () => reject(this.reader.error)
      this.reader.readAsBinaryString(this.file)
    })
  }

  private getSheetsData(xlsFile: WorkBook) {
    const firstSheetName = xlsFile.SheetNames[0]
    const worksheet = xlsFile.Sheets[firstSheetName]
    const data: string[][] = utils.sheet_to_json(worksheet, { header: 1, raw: false })
    const filtered = data.filter((row) => row.length > 0)

    return filtered.map((row) => row.map((cell) => cell.trim()))
  }
}

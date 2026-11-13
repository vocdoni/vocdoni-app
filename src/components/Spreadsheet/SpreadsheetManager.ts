import type { ParsedSpreadsheet } from './parse-spreadsheet'
import ErrorMissingData from './errors/ErrorMissingData'
import ErrorMissingHeader from './errors/ErrorMissingHeader'

export class SpreadsheetManager {
  protected readonly reader
  protected heading: string[]
  protected filedata: string[][]
  // 1-based line of each `filedata` row in the original file, kept because blank rows are dropped
  protected linenumbers: number[] = []

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
    return this.readContent()
      .then((content) => parseOffThread(content))
      .then(({ rows, lines }) => {
        this.filedata = rows
        this.linenumbers = lines
        if (this.headed) {
          this.heading = this.filedata.splice(0, 1)[0]
          this.linenumbers.splice(0, 1)
        }
        return this
      })
  }

  private readContent(): Promise<string> {
    return new Promise((resolve, reject): void => {
      this.reader.onload = () => resolve(this.reader.result as string)
      this.reader.onerror = () => reject(this.reader.error)
      this.reader.readAsBinaryString(this.file)
    })
  }
}

type WorkerReply = ({ ok: true } & ParsedSpreadsheet) | { ok: false; message: string }

/**
 * Parses in a module worker so the `xlsx` chunk loads only when a file is dropped and a large file does not freeze
 * the page. Without `Worker` (jsdom, very old browsers) it parses in-thread through a dynamic import.
 */
const parseInThread = (content: string): Promise<ParsedSpreadsheet> =>
  import('./parse-spreadsheet').then(({ parseSpreadsheet }) => parseSpreadsheet(content))

const parseOffThread = (content: string): Promise<ParsedSpreadsheet> => {
  if (typeof Worker === 'undefined') return parseInThread(content)

  let worker: Worker
  try {
    worker = new Worker(new URL('./spreadsheet.worker.ts', import.meta.url), { type: 'module' })
  } catch {
    // The constructor throws synchronously under some CSPs or without module worker support.
    return parseInThread(content)
  }

  return new Promise((resolve, reject) => {
    worker.onmessage = (event: MessageEvent<WorkerReply>) => {
      worker.terminate()
      const reply = event.data
      if (reply.ok === false) reject(new Error(reply.message))
      else resolve({ rows: reply.rows, lines: reply.lines })
    }
    // Parse errors come back as `{ ok: false }`; `onerror` means the worker could not load or crashed (no module
    // worker support, blocked script), an environment problem, so parse in-thread instead of failing the import.
    worker.onerror = (event) => {
      event.preventDefault()
      worker.terminate()
      parseInThread(content).then(resolve, reject)
    }
    worker.postMessage({ content })
  })
}

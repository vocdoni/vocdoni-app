import { SpreadsheetManager } from './SpreadsheetManager'

type Reply = { ok: true; rows: string[][]; lines: number[] } | { ok: false; message: string }

/** A stand-in for the module worker that runs the real parser, as the browser would off-thread. */
class FakeWorker {
  static instances: FakeWorker[] = []
  onmessage: ((event: MessageEvent<Reply>) => void) | null = null
  onerror: ((event: ErrorEvent) => void) | null = null
  terminated = false
  posted: unknown[] = []

  constructor(
    public url: URL,
    public options?: WorkerOptions
  ) {
    FakeWorker.instances.push(this)
  }

  postMessage(message: { content: string }) {
    this.posted.push(message)
    void import('./parse-spreadsheet').then(({ parseSpreadsheet }) => {
      let reply: Reply
      try {
        const { rows, lines } = parseSpreadsheet(message.content)
        reply = { ok: true, rows, lines }
      } catch (error) {
        reply = { ok: false, message: (error as Error).message }
      }
      this.onmessage?.({ data: reply } as MessageEvent<Reply>)
    })
  }

  terminate() {
    this.terminated = true
  }
}

describe('SpreadsheetManager in a worker', () => {
  beforeEach(() => {
    FakeWorker.instances = []
    vi.stubGlobal('Worker', FakeWorker)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('parses the file in a module worker and exposes the same data', async () => {
    const csv = '\nname,password\n a ,abc123\n\nb,bad\n'
    const manager = new SpreadsheetManager(new File([csv], 'members.csv', { type: 'text/csv' }), true)

    await manager.read()

    expect(FakeWorker.instances).toHaveLength(1)
    expect(FakeWorker.instances[0].options).toEqual({ type: 'module' })
    expect(manager.header).toEqual(['name', 'password'])
    expect(manager.data).toEqual([
      ['a', 'abc123'],
      ['b', 'bad'],
    ])
    expect(manager.lineNumbers).toEqual([3, 5])
    expect(FakeWorker.instances[0].terminated).toBe(true)
  })

  it('rejects when the worker reports a parse error, and still terminates it', async () => {
    const manager = new SpreadsheetManager(new File([''], 'empty.csv', { type: 'text/csv' }), true)
    vi.spyOn(FakeWorker.prototype, 'postMessage').mockImplementation(function (this: FakeWorker) {
      this.onmessage?.({ data: { ok: false, message: 'bad file' } } as MessageEvent<Reply>)
    })

    await expect(manager.read()).rejects.toThrow('bad file')
    expect(FakeWorker.instances[0].terminated).toBe(true)
  })

  it('parses in-thread when the worker cannot load', async () => {
    vi.spyOn(FakeWorker.prototype, 'postMessage').mockImplementation(function (this: FakeWorker) {
      this.onerror?.({ message: 'blocked', preventDefault: vi.fn() } as unknown as ErrorEvent)
    })
    const manager = new SpreadsheetManager(new File(['name\na\n'], 'members.csv', { type: 'text/csv' }), true)

    await manager.read()

    expect(manager.header).toEqual(['name'])
    expect(manager.data).toEqual([['a']])
    expect(FakeWorker.instances[0].terminated).toBe(true)
  })

  it('parses in-thread when the worker constructor throws', async () => {
    class ThrowingWorker {
      constructor() {
        throw new Error('blocked by CSP')
      }
    }
    vi.stubGlobal('Worker', ThrowingWorker)
    const manager = new SpreadsheetManager(new File(['name\na\n'], 'members.csv', { type: 'text/csv' }), true)

    await manager.read()

    expect(manager.header).toEqual(['name'])
    expect(manager.data).toEqual([['a']])
  })
})
